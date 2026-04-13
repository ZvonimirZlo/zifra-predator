import { setTheme, toggleSidebar, translator, startDecayCountdown } from "./Modules/animations";
import { 
    togglePassword, 
    updateStrength, 
    terminalCopy, 
    terminalPaste, 
    terminalPurge,
    initCursor
} from './Modules/utils.js';
import { toggleMute } from "./Modules/soundControl.js";
import { initCubeListeners } from './Modules/cubeControllers.js';
import { handleDecrypt, handleEncrypt } from "./Modules/cryptoEngine.js";


const audioP = new Audio('/Sounds/predator-aiming.ogg')


initCubeListeners()
initCursor()

// --- DOM ELEMENTS ---

const sidebar = document.getElementById('sidebar');
const toggleMenu = document.querySelector('.menu-toggle');
const stealthBtn = document.querySelector('.stealth');
const killBtn = document.getElementById('kill-button');
 const sequencer = document.getElementById('boot-sequencer');
    const glyph = sequencer.querySelector('.countdown-glyph');
    const startBtn = document.querySelector('.start');
    const startingPoint = document.querySelector('.starting-point');

    startBtn.addEventListener('click', () => {
   startingPoint.style.display = 'block';
   startBtn.style.display = 'none';
   // Gives the browser a split second to render the 'block' 
   // change before firing the heavy logic
   setTimeout(() => {
       startBootSequence();
   }, 100);
    
})

// Call the function
document.addEventListener('DOMContentLoaded', triggerTitleScramble);





function triggerTitleScramble() {

const headline = document.querySelector('.intro-headline')
const finalHumanText = "ZIFRA_PREDATOR";
const alienChars = "ZIFRA_PREDATOR"; 
    
    anime({
    targets: headline,
    duration: 3000,
    easing: 'easeInOutQuad',
    begin: () => {
        // Force the alien look at the start
        headline.style.fontFamily = "yautja, sans-serif";
        headline.style.color = "#39FF14";
        headline.style.textShadow = "0 0 15 #25b40c'";
    },
    update: function(anim) {
        // The scramble happens here
        const currentProgress = Math.floor(anim.progress / 100 * finalHumanText.length);
        
        const content = finalHumanText.split('').map((char, index) => {
            if (index < currentProgress) return char; 
            return alienChars[Math.floor(Math.random() * alienChars.length)];
        }).join('');
        
        headline.innerText = content;

        // Visual glitch: Occasionally swap font-family for a single frame
        if (Math.random() > 0.95) {
            headline.style.fontFamily = "monospace";
        } else {
            headline.style.fontFamily = "'Yautja', sans-serif";
        }
    },
    complete: () => {
        // Snap to human-readable state
        headline.innerText = finalHumanText;
        headline.style.fontFamily = "'IBM Plex Mono', monospace";
        headline.style.letterSpacing = "2px";
        anime({
            targets: headline,
            color: [
                { value: '#39FF14' }, // Neon Green
                { value: '#25b40c' } 
            ],
            textShadow: [
                { value: '0 0 20px #39FF14' },
                { value: '0 0 5px #25b40c' }
            ],
            duration: 300,
            direction: 'alternate',
            easing: 'linear',
            loop: 3, // 3 full blinks (on/off x3)
            complete: () => {
                // ends on the final blue state
                headline.style.color = "#39FF14";
            headline.style.textShadow = "none"; 
                
            }
        });
    }
    }
    );
}




//Intro boot sequence
function startBootSequence() {
    audioP.play()
    audioP.currentTime = 0;

    const sequencer = document.getElementById('boot-sequencer');
    const glyph = sequencer.querySelector('.countdown-glyph');
    const sidebarContent = document.querySelector('.menu');
    
    const symbols = "0123456789PREDATOR";
    let currentLength = 5; // Starting with "##:##"

    sidebarContent.style.opacity = "0";

    anime({
        targets: glyph,
        duration: 5000, // Slower 5-second burn
        easing: 'linear',
        update: function(anim) {
            const progress = anim.progress; 
            
            const newLength = Math.ceil(5 * (1 - (progress / 100)));

            // 2. Slow down the flicker (only change symbols every 8 frames)
            if (Math.round(progress * 10) % 8 === 0) {
                let rand = "";
                for (let i = 0; i < newLength; i++) {
                    // Keep the colon logic if we have enough chars
                    if (i === 2 && newLength > 2) rand += "x";
                    else rand += symbols[Math.floor(Math.random() * symbols.length)];
                }
                glyph.innerText = rand;

                // 3. Heavy Flicker: Occasional deep dimming
                const flicker = Math.random();
                if (flicker > 0.8) glyph.style.opacity = "0.1";
                else if (flicker > 0.4) glyph.style.opacity = "1";
                else glyph.style.opacity = "0.7";
                
                // 4. Slight scale "thump" when a character drops
                if (newLength < currentLength) {
                    currentLength = newLength;
                    glyph.style.transform = 'scale(1.1)';
                    setTimeout(() => glyph.style.transform = 'scale(1)', 100);
                }
            }
        },
        complete: () => {
            // Flash and Reveal
            anime({
                targets: sequencer,
                opacity: 0,
                scale: 2, // "Explosion" feel
                duration: 600,
                easing: 'easeInQuart',
                complete: () => {
                    sequencer.remove();
                    anime({
                        targets: sidebarContent,
                        opacity: 1,
                        translateY: [30, 0],
                        duration: 2000
                    });
                }
            });
        }
    });
    //Intro lines animation
anime({
  targets: '.status-text.first-line,.line',
  opacity: [0, 1],
  clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  translateY: [-10, 0],
  easing: 'easeOutExpo',
  duration: 800,
  delay: anime.stagger(500), // Time between each line appearing
  begin: function(anim) {
  },
  changeComplete: function(el) {

  },
 
  keyframes: [
    {opacity: 1, duration: 100},
    {opacity: 0.5, duration: 100}, 
    {opacity: 1, duration: 100},  
  ]
});


}


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



