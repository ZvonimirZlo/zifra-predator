import { setTheme, toggleSidebar, translator, startDecayCountdown } from "./Modules/animations";
import { 
    togglePassword, 
    updateStrength, 
    handleEncrypt, 
    handleDecrypt, 
    terminalCopy, 
    terminalPaste, 
    terminalPurge
} from './Modules/utils.js';
import { sfx, toggleMute } from "./Modules/soundControl.js";

// --- DOM ELEMENTS ---
const cube = document.getElementById("cube");
const sidebar = document.getElementById('sidebar');
const toggleMenu = document.querySelector('.menu-toggle');
const stealthBtn = document.querySelector('.stealth');
const killBtn = document.getElementById('kill-button');

// --- INITIALIZATION ---
sidebar.addEventListener('mouseenter', translator, { once: true });

// --- UI CONTROLS ---
document.getElementById('green').addEventListener('click', () => setTheme('green'));
document.getElementById('blue').addEventListener('click', () => setTheme('blue'));
toggleMenu.addEventListener('click', toggleSidebar);
stealthBtn.addEventListener('click', toggleMute);
killBtn.addEventListener('click', startDecayCountdown);
// Wiring the stealth button
document.querySelector('.stealth').addEventListener('click', toggleMute);

// --- PASSWORD & STRENGTH ---
document.querySelectorAll('.toggle-visibility').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the click from triggering other things
        togglePassword(e.currentTarget);
    });
});

document.querySelectorAll('.passInput').forEach(input => {
    input.addEventListener('input', (e) => updateStrength(e.target));
});

// --- CRYPTO PROCESSORS
const encryptBtn = document.querySelector('.cube-face-front .panel-content > button:not(.toggle-visibility)');
const decryptBtn = document.querySelector('.cube-face-right .panel-content > button:not(.toggle-visibility)');

if (encryptBtn) encryptBtn.addEventListener('click', handleEncrypt);
if (decryptBtn) decryptBtn.addEventListener('click', handleDecrypt);

// --- TERMINAL ACTIONS (Copy/Paste/Purge) ---
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const face = e.target.closest('.cube-face');
        const selector = face.classList.contains('cube-face-front') ? '.cube-face-front' : '.cube-face-right';

        if (btn.innerText.includes('LINK_DATA')) {
            terminalPaste(`${selector} .mainInput`);
        } else if (btn.innerText.includes('PURGE')) {
            terminalPurge(`${selector} .mainInput`);
        } else if (btn.innerText.includes('CLONE_EXTRACT')) {
            terminalCopy(e, `${selector} .resultOutput`);
        }
    });
});

// --- PREDATOR CURSOR ---
(function() {
    const predator = document.createElement('div');
    predator.id = 'predator-cursor';
    document.body.appendChild(predator);
    document.addEventListener('mousemove', (e) => {
        predator.style.left = e.clientX + 'px';
        predator.style.top = e.clientY + 'px';
        const isTarget = e.target.closest('button, a, .eye-btn, .theme-btn');
        predator.classList.toggle('locked', !!isTarget);
    });
})();


const clickOnSide = (side) => {
    const activeSide = cube.dataset.side;
    cube.classList.replace(`show-${activeSide}`, `show-${side}`);
    cube.setAttribute("data-side", side);

    setTimeout(() => {
        const targetFace = document.querySelector(`.cube-face-${side}`);
        const laser = targetFace.querySelector('.laser-scan');
        beam.volume = 0.5;
        beam.play();
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

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    clickOnSide(e.target.dataset.side);
    beep.play();
  });
});