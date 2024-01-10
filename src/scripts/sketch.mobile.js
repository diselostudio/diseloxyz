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
                markers: import.meta.env.DEV,
            }
        })
        .to(
            '#brand',
            {
                keyframes: [
                    { y: 0, duration: 1 },
                    { scale: 0.15, duration: 0.9, delay: 0.2 },
                    { rotate: 90, duration: 0.4, delay: 0.2 },
                    { filter: "blur(20px)", opacity: 0, duration: 0.3, delay: 0.3, scale: 2.15, },
                    { duration: 0.3, }
                ]
            })

    master.add(movement)
}