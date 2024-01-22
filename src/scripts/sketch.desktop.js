import { gsap } from "gsap";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as vanilla from '@pmndrs/vanilla'
import { GUI } from 'dat.gui'
import { debounce } from "./utils";

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

    canvas = document.createElement('canvas');
    el = null;
    clock = new THREE.Clock();
    width = window.innerWidth;
    height = window.innerHeight;
    stats = new Stats();

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
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // BRAND
            const scalefactor = visibleWidthAtZDepth(0, this.camera) / this.sizex;
            this.brand.scale.set(scalefactor, -scalefactor, scalefactor);
            this.brand.position.x = (this.sizex * scalefactor) / 2;
        }), 50)
    }

    appendCanvasToEl() {
        this.el.append(this.canvas);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height)
        this.camera.position.z = 4
        this.scene.add(this.camera)

        if (import.meta.env.DEV) {
            const controls = new OrbitControls(this.camera, this.canvas)
            controls.enableDamping = true
            const helper = new THREE.CameraHelper(this.camera);
            this.scene.add(helper);
            this.gui = new GUI();
            document.body.appendChild(this.stats.dom);
        }

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor('#fff')
    }

    addAssetsToScene() {

        const SVGloader = new SVGLoader();

        SVGloader.load(
            'ui/brand.svg',
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

                this.scene.add(this.brand);
            },
            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error(error);
            }
        );

        const geometry = new THREE.BoxGeometry(3, 3, 1);
        const material = new vanilla.MeshTransmissionMaterial({
            _transmission: 1,
            thickness: 3,
            roughness: 0,
            chromaticAberration: 0.1,
            anisotropicBlur: 0.1,
            distortion: 0.1,
            distortionScale: 0.1,
            temporalDistortion: 0,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, -1, 1);
        this.scene.add(cube);

        const fboBack = vanilla.useFBO(512, 512)
        const fboMain = vanilla.useFBO(512, 512)
        material.buffer = fboMain.texture

        this.transmissionMaterial = material;
        this.transmissionMesh = cube;
        this.backFBO = fboBack;
        this.mainFBO = fboMain;

        this.discardMaterial = new vanilla.MeshDiscardMaterial();


        // Add plane to scene, make it thicker
        // Add material to plane
        // Distort material
    }

    animate() {
        //const elapsedTime = this.clock.getElapsedTime()

        // RENDER GLASS
        const oldTone = this.renderer.toneMapping;
        const oldBg = this.scene.background;
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
        this.renderer.toneMapping = oldTone;
        this.scene.background = oldBg;
        // END RENDER GLASS

        this.renderer.render(this.scene, this.camera);
        this.stats.update();
        window.requestAnimationFrame(this.animate.bind(this));
    }
}