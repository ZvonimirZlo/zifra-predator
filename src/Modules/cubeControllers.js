import {sfx} from './soundControl.js'

export const clickOnSide = (side) => {
    const cube = document.getElementById("cube");
    if(!cube) return;
    const activeSide = cube.dataset.side;
    cube.classList.replace(`show-${activeSide}`, `show-${side}`);
    cube.setAttribute("data-side", side);

    setTimeout(() => {
        const targetFace = document.querySelector(`.cube-face-${side}`);
        const laser = targetFace.querySelector('.laser-scan');
        sfx.beam.volume = 0.5;
        sfx.beam.play();
        if (laser) {
            anime.timeline({ easing: 'linear' })
            .add({
                targets: laser,
                opacity: [0.5, 1, 0.8, 0],
                top: ['0%', '100%'],
                duration: 1500,
            })
            .add({
                targets: targetFace.querySelectorAll('label, input, textarea, button'),
                opacity: [0.5, 1],
                translateY: [10, 0],
                delay: anime.stagger(50),
                duration: 400
            }, '-=800');
        }
    }, 600);
};

// Wiring up the buttons within the module
export const initCubeListeners = () => {
    document.querySelectorAll(".btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            clickOnSide(e.target.dataset.side);
            sfx.beep.play();
        });
    });
};
