import { showTerminalAlert } from './terminalAlert';
import { scanQRData } from './QRActions.js';
import {sfx} from './soundControl.js';

// --- PREDATOR CURSOR ---
export function initCursor() {
    const predator = document.createElement('div');
    predator.id = 'predator-cursor';
    document.body.appendChild(predator);
    document.addEventListener('mousemove', (e) => {
        predator.style.left = e.clientX + 'px';
        predator.style.top = e.clientY + 'px';
        const isTarget = e.target.closest('button, a, .eye-btn, .theme-btn');
        predator.classList.toggle('locked', !!isTarget);
    });
};

//Arrow key navigator
export const arrowKeyNavigator = () => {
  window.addEventListener('keydown', (e) => {
    const cube = document.querySelector('.cube');
    if(!cube) return;

    let currentSide = 'front'; //Default side on the beginning
    if (cube.classList.contains('show-right')) {
        currentSide = 'right'; //Decrypter side
    }
    
    //Sidebar keys
    const sidebarItems = Array.from(document.querySelectorAll('#sidebar button, .theme-btn, .stealth, .kill-btn'));
    
    //Active side
    const activeFace = document.querySelector(`.cube-face-${currentSide}`); 
    //Interactive cube items
    const faceItems = activeFace ? Array.from(activeFace.querySelectorAll('input, textarea, button')) : [];
    //All active elements
    const allItems = [...sidebarItems, ...faceItems];
    const active = document.activeElement;
    const currentIndex = allItems.indexOf(active);

    // 3. Navigation
    if (currentIndex > -1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        
        let nextIndex = (e.key === 'ArrowDown') 
            ? (currentIndex + 1) % allItems.length 
            : (currentIndex - 1 + allItems.length) % allItems.length;
        
        allItems[nextIndex].focus();
    }
  }, { capture: true });
}


//Toggle pass visibility
export function togglePassword(btn) {
    const input = btn.parentElement.querySelector('.passInput');
    if (input.type === "password") {
        input.type = "text";
        btn.innerText = "🔒";
    } else {
        input.type = "password";
        btn.innerText = "👁️";
    }
}


//Update pass strength
export function updateStrength(inputEl) {
    const pass = inputEl.value;
    // Find the container for THIS specific panel
    const parent = inputEl.closest('.panel-content');
    const bar = parent.querySelector('.strength-bar');
    const label = parent.querySelector('.strength-label');

    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const colors = ["#ff4c4c", "#ff4c4c", "#ffa500", "#ffd700", "#00ff41", "#00ffff"];
    const labels = ["DANGEROUS", "VERY WEAK", "WEAK", "MEDIUM", "STRONG", "GOD MODE"];

    // Update the UI
    bar.style.width = (score + 1) * 16.6 + "%";
    bar.style.backgroundColor = colors[score];
    bar.style.boxShadow = `0 0 10px ${colors[score]}`;
    label.innerText = "STRENGTH: " + labels[score];
    label.style.color = colors[score];
    if(pass.length === 0) label.innerText = 'STRENGTH: EMPTY', 
    label.style.color = "#38B6FF",
    bar.style.width = 0;
}



//Reusable functions for inputs and outputs handling

//Paste
export async function terminalPaste(selector) {
    if (window.sfx?.click) sfx.click.play();
    const target = document.querySelector(selector);
    
    try {
        const items = await navigator.clipboard.read();
        
        for (const item of items) {
            // --- CASE A: The user pasted a QR Image ---
            if (item.types.includes("image/png") || item.types.includes("image/jpeg")) {
                const blob = await item.getType("image/png");
                const decodedText = await scanQRData(blob);
                
                if (decodedText) {
                    target.value = decodedText;
                    triggerSuccessFlash(target);
                    return; // Task complete
                }
            }
            
            // --- CASE B: The user pasted Yautja Text ---
            if (item.types.includes("text/plain")) {
                const blob = await item.getType("text/plain");
                const text = await blob.text();
                target.value = text;
                triggerSuccessFlash(target);
                return;
            }
        }
    } catch (err) {
        // Fallback for browsers that don't support .read() but support .readText()
        const text = await navigator.clipboard.readText();
        target.value = text;
        triggerSuccessFlash(target);
    }
}

// Helper to keep the code clean
function triggerSuccessFlash(target) {
    anime({
        targets: target,
        backgroundColor: ['rgba(0, 255, 65, 0.2)', 'rgba(0, 0, 0, 0.4)'],
        duration: 1000
    });
}
 //Delete
export function terminalPurge(selector) {
 sfx.click.play();
    sfx.alert.play();

    // 1. Find the face container
    const face = document.querySelector(selector).closest('.cube-face');
    if (!face) return;

    // 2. Clear Inputs and Textareas
    face.querySelectorAll('input, textarea').forEach(el => {
        el.value = '';
        // Manually trigger the strength update so the bar resets to "EMPTY"
        if (el.classList.contains('passInput')) {
            updateStrength(el); 
        }
    });

    // 3. Clear Output Display
    const output = face.querySelector('.resultOutput');
    if (output) {
        // If it's a textarea use .value, if it's a div/span use .innerText
        if (output.tagName === 'TEXTAREA' || output.tagName === 'INPUT') {
            output.value = '';
        } else {
            output.innerText = '';
        }
    }

    // 4. Visual Feedback (The "Wipe" effect)
    window.anime({
        targets: face.querySelectorAll('.panel-content > *'), // Shake everything
        translateX: [-5, 5, -5, 5, 0],
        opacity: [0.7, 1],
        duration: 400,
        easing: 'easeInOutQuad'
    });
}

//Copy function
export function terminalCopy(event, selector) {
    sfx.click.play()
    const btn = event.currentTarget;
    const originalText = btn.innerText;
    const target = document.querySelector(selector);
    const text = target.value || target.innerText;

    if (!text || text.trim() === "") {
        sfx.alert.play(); // No data to clone!
        return;
    }
    
    //Copy
    navigator.clipboard.writeText(target.value).then(() => {


    btn.innerText = "DATA_CLONED";
    setTimeout(() => btn.innerText = originalText, 2000);
});
    
    // Brief "Copied" alert on the button text
    btn.innerText = "DATA_CLONED";
    
    //Resets to original text
    setTimeout(() => btn.innerText = originalText, 1500);
    sfx.success.play()
}

export const terminalActions = () => {
    document.querySelectorAll('.control-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const face = e.target.closest('.cube-face')
    const selector = face.classList.contains('cube-face-front')
      ? '.cube-face-front'
      : '.cube-face-right'

    if (btn.innerText.includes('LINK_DATA')) {
      terminalPaste(`${selector} .mainInput`)
    } else if (btn.innerText.includes('PURGE')) {
      terminalPurge(`${selector} .mainInput`)
    } else if (btn.innerText.includes('CLONE_EXTRACT')) {
      terminalCopy(e, `${selector} .resultOutput`)
    }
  })
})
}