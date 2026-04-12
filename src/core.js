import { setTheme, toggleSidebar, translator, startDecayCountdown } from "./Modules/animations";
import { 
    togglePassword, 
    updateStrength, 
    handleEncrypt, 
    handleDecrypt, 
    terminalCopy, 
    terminalPaste, 
    terminalPurge,
    initCursor
} from './Modules/utils.js';
import { toggleMute } from "./Modules/soundControl.js";
import { initCubeListeners } from './Modules/cubeControllers.js';
initCubeListeners()
initCursor()

// --- DOM ELEMENTS ---

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



