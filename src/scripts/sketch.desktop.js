// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'dat.gui'
import { gsap } from "gsap";
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { MeshDiscardMaterial, MeshTransmissionMaterial, useFBO } from '@pmndrs/vanilla';
import { debounce, throttle } from "./utils";

const visibleHeightAtZDepth = (depth, camera) => {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = camera.fov * Math.PI / 180;

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const visibleWidthAtZDepth = (depth, camera) => {
    const height = visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
};

export class Sketch {

    paused = false;
    canvas = document.createElement('canvas');
    el = null;
    clock = new THREE.Clock();
    width = window.innerWidth;
    height = window.innerHeight;
    // stats = new Stats();
    uniforms = {
        uTime: { value: 0 },
        uMouseX: { value: 0 },
        uMouseY: { value: 0 }
    }

    constructor(el) {
        this.el = el;
    }

    run() {
        this.appendCanvasToEl();
        this.createScene();
        this.addAssetsToScene();
        this.animate();
        this.bindMainEvents();
    }

    bindMainEvents() {
        window.addEventListener('resize', debounce(() => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width / 2, this.height / 2);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // // BRAND
            const scalefactor = visibleWidthAtZDepth(0, this.camera) / this.sizex;
            this.brand.scale.set(scalefactor, -scalefactor, scalefactor);
            this.brand.position.x = (this.sizex * scalefactor) / 2;

            // PBR CUBE
            // create new geometry and assign to cube
            this.cube.geometry.dispose();
            const geometryW = visibleWidthAtZDepth(0, this.camera);
            const geometryH = visibleHeightAtZDepth(0, this.camera);
            const geometry = new THREE.BoxGeometry(geometryW, geometryH, 0.5, 120, 120);
            this.cube.geometry = geometry;

        }, 150))

        window.addEventListener('mousemove', throttle(({ x, y }) => {
            this.uniforms.uMouseX.value = ((x * 2) / window.innerWidth) - 1;
            this.uniforms.uMouseY.value = ((y * 2) / window.innerHeight) - 1;
        }, 50));
    }

    appendCanvasToEl() {
        this.el.append(this.canvas);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height)
        this.camera.position.z = 4
        this.scene.add(this.camera)

        // if (false && import.meta.env.DEV) {
        //     const controls = new OrbitControls(this.camera, this.canvas)
        //     controls.enableDamping = true
        //     const helper = new THREE.CameraHelper(this.camera);
        //     this.scene.add(helper);
        //     this.gui = new GUI();
        // document.body.appendChild(this.stats.dom);
        // }

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
        this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor('#fff')
    }

    addAssetsToScene() {

        const SVGloader = new SVGLoader();

        SVGloader.load(
            '/brand.svg',
            (data) => {

                const paths = data.paths;
                const group = new THREE.Group();

                for (let i = 0; i < paths.length; i++) {

                    const path = paths[i];

                    const material = new THREE.MeshBasicMaterial({
                        color: '#111827',
                        side: THREE.FrontSide,
                        depthWrite: false
                    });

                    const shapes = SVGLoader.createShapes(path);

                    for (let j = 0; j < shapes.length; j++) {
                        const shape = shapes[j];
                        const geometry = new THREE.ShapeGeometry(shape);
                        const mesh = new THREE.Mesh(geometry, material);
                        group.add(mesh);
                    }
                }

                this.brand = group;

                // ROTATE SVG 90deg.
                this.brand.rotateZ(-Math.PI / 2);

                // SCALE AND CENTER SVG
                const box = new THREE.Box3().setFromObject(this.brand);
                const size = new THREE.Vector3();
                box.getSize(size);
                this.sizex = size.x;

                const scalefactor = visibleWidthAtZDepth(0, this.camera) / size.x;
                this.brand.scale.set(scalefactor, -scalefactor, scalefactor);
                this.brand.position.x = (size.x * scalefactor) / 2;
                this.brand.position.y = (size.y * scalefactor) - (size.y * scalefactor) - 0.25;
                this.brand.position.z = -1.6;

                this.scene.add(this.brand);
            },
            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error(error);
            }
        );


        const geometryW = visibleWidthAtZDepth(0, this.camera);
        const geometryH = visibleHeightAtZDepth(0, this.camera);
        const geometry = new THREE.BoxGeometry(geometryW, geometryH, 0.5, 120, 120);
        const material = new MeshTransmissionMaterial({
            _transmission: 1,
            thickness: 2.5,
            roughness: 0.08,
            chromaticAberration: 0.15,
            anisotropicBlur: 0.4,
            distortion: 0.1,
            distortionScale: 0.1,
            temporalDistortion: 1,
        });

        const oldfn = material.onBeforeCompile;
        material.onBeforeCompile = (shader, renderer) => {

            shader.uniforms.uTime = this.uniforms.uTime;
            shader.uniforms.uMouseX = this.uniforms.uMouseX;
            shader.uniforms.uMouseY = this.uniforms.uMouseY;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                /*glsl*/`
                uniform float uTime;
                uniform float uMouseX;
                uniform float uMouseY;
                #include <common>;
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                /*glsl*/`
                #include <begin_vertex>
                // transformed.z = sin(position.x * 10.0 - (uTime * 2.0) - (position.y * 2.5)) * 0.25;
                // transformed.z = sin(mod(position.x * 5.0, 0.5) - (position.y * 2.5)) * 0.25;
                // transformed.z = abs(sin(position.x * 5.0 - (uTime * .25)) - (position.y * 1.5) * 0.5);
                // transformed.z = step(abs(position.x), sin(position.x - uTime));
                // transformed.z += abs((position.x * (position.y * 0.6) + (uMouseX * 1.5)) ) ;
                // transformed.z -= sin(position.x + mod(uTime * 0.5, 5.0))* 0.5;
                // transformed.z += mod((position.x + (uMouseX)), 2.) ;
                transformed.z += abs((position.x + (uMouseX * 3.0)) * 0.25 ) + (uMouseY * 0.75);
                `
            )

            oldfn(shader, renderer);
        }

        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0, 0, 0.5);
        this.scene.add(this.cube);

        const fboBack = useFBO(962, 962)
        const fboMain = useFBO(962, 962)
        material.buffer = fboMain.texture
        this.transmissionMaterial = material;
        this.transmissionMesh = this.cube;
        this.backFBO = fboBack;
        this.mainFBO = fboMain;

        this.discardMaterial = new MeshDiscardMaterial();
    }

    kill() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this.animate();
    }

    animate() {

        if (this.paused) return;

        const elapsedTime = this.clock.getElapsedTime();
        this.uniforms.uTime.value = elapsedTime;

        // RENDER GLASS
        const oldSide = this.transmissionMesh.material.side;

        this.renderer.toneMapping = THREE.NoToneMapping;
        this.transmissionMesh.material = this.discardMaterial;

        this.renderer.setRenderTarget(this.backFBO);
        this.renderer.render(this.scene, this.camera);
        this.transmissionMesh.material = this.transmissionMaterial;
        this.transmissionMesh.material.side = THREE.BackSide;
        this.transmissionMesh.material.buffer = this.backFBO.texture;

        this.renderer.setRenderTarget(this.mainFBO);
        this.renderer.render(this.scene, this.camera);
        this.transmissionMesh.material = this.transmissionMaterial;
        this.transmissionMesh.material.side = oldSide;
        this.transmissionMesh.material.buffer = this.mainFBO.texture

        this.renderer.setRenderTarget(null);
        // END RENDER GLASS

        this.renderer.render(this.scene, this.camera);
        // this.stats.update();
        window.requestAnimationFrame(this.animate.bind(this));
    }
}