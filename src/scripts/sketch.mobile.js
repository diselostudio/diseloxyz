import { gsap } from "gsap";

export let kill;

export let resume;

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
                    { y: 0, duration: 1, scale: 1.2 },
                    { scale: 0.15, duration: 0.2, delay: 0.0 },
                    { rotate: 90, duration: 0.2, delay: 0.2 },
                    { filter: "blur(20px)", opacity: 0, duration: 0.3, delay: 0.5, scale: 2.15, },
                    { duration: 0.3, }
                ]
            })

    kill = movement.scrollTrigger.disable;

    resume = () => {
        movement.scrollTrigger.enable();
        movement.scrollTrigger.refresh();
    }


    master.add(movement)
}

