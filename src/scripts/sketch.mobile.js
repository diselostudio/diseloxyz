import { gsap } from "gsap";
import brand from './../ui/brand.svg?raw';

export function run(el) {

    const master = gsap.timeline();

    const movement = gsap
        .timeline({
            scrollTrigger: {
                scrub: 0.75,
                trigger: el,
                start: 'top 75%',
                end: 'top center',
                endTrigger: '.skills',
                pin: true,
                pinSpacing: false,
                // markers: import.meta.env.DEV,
            }
        })
        .to(
            '#brand',
            { y: 0, duration: 1 }
        )
        .to(
            '#brand',
            { scale: 0.15, duration: 1, delay: 0.2 }
        )
        .to(
            '#brand',
            { rotate: 90, duration: 0.4, delay: 0.2 }
        )
        .to(
            '#brand',
            { filter: "blur(20px)", opacity: 0, duration: 0.2, delay: 0.2, scale: 1.15, }
        )

    master.add(movement)
}