function setTheme(theme) {
    const overlay = document.getElementById('theme-overlay');
    const body = document.body;

    if (theme === 'green') {
        body.classList.add('green-theme');
        overlay.style.background = "#ffff00"; // Yellow filter -> Green result
        overlay.style.mixBlendMode = "multiply";
    } else {
        body.classList.remove('green-theme');
    }
}

function toggleStealth() {
    const overlay = document.getElementById('theme-overlay');
    const isStealth = document.body.classList.toggle('stealth-active');
    
    if (isStealth) {
        // Dark blue/grey filter for stealth
        overlay.style.background = "#000b1a"; 
        overlay.style.mixBlendMode = "hard-light";
        overlay.style.opacity = "0.7";
    } else {
        // Reset to theme default
        overlay.style.opacity = document.body.classList.contains('green-theme') ? "0.5" : "0";
    }
}



//Font 'translator' at the beggining
const sidebar = document.getElementById('sidebar');
const buttons = document.querySelectorAll('.btn'); // Grabs all 6 buttons

const humanLabels = {
    'front':  'Encrypter',
    'right':  'Decrypter',
    'back':   'Manual',
    'left':   'About',
    'top':    'Top',
    'bottom': 'Bottom'
};

sidebar.addEventListener('mouseenter', () => {
    buttons.forEach((btn, index) => {
        const side = btn.dataset.side; 
        const translation = humanLabels[side];

        if (translation) {
            setTimeout(() => {
                btn.innerText = translation;
                btn.style.fontFamily = 'IBM Plex Mono';
                btn.style.fontSize = '14px';
                
                anime({
                    targets: btn,
                    filter: ['brightness(5)', 'brightness(1)'],
                    textShadow: ['0 0 20px red', '1px 1px 2px red'],
                    duration: 1000,
                    easing: 'easeOutExpo'
                });
            }, index * 100); 
        }
    });
}, { once: true });


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
// const btn1 = document.getElementById('btn1');
// const btn2 = document.getElementById('btn2');
// const btn3 = document.getElementById('btn3');
// const btn4 = document.getElementById('btn4');
// const btn5 = document.getElementById('btn5');
// const btn6 = document.getElementById('btn6');


// // const sidebar = document.getElementById('sidebar');
// // sidebar.addEventListener('mouseover', () => {
// //     btn1.innerText = 'Encrypter'
// //     btn1.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn1.style.fontSize = '14px'

// //     btn2.innerText = 'Decrypter'
// //     btn2.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn2.style.fontSize = '14px'

// //     btn3.innerText = 'crypter'
// //     btn3.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn3.style.fontSize = '14px'

// //     btn4.innerText = 'Encr'
// //     btn4.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn4.style.fontSize = '14px'

// //     btn5.innerText = 'Enter'
// //     btn5.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn5.style.fontSize = '14px'

// //     btn6.innerText = 'Enpter'
// //     btn6.style.fontFamily = 'IBM Plex Mono','Monospace'
// //     btn6.style.fontSize = '14px'
// // })


const cube = document.getElementById("cube");

//Reusable functions for inputs and outputs handling

//Paste
async function terminalPaste(selector) {
    const target = document.querySelector(selector);
    try {
        const text = await navigator.clipboard.readText();
        target.value = text;
        
        // Success Flash
        anime({
            targets: target,
            backgroundColor: ['rgba(0, 255, 65, 0.2)', 'rgba(0, 0, 0, 0.4)'],
            duration: 1000
        });
    } catch (err) {
        console.warn("Clipboard access denied or not available.");
    }
}
 //Delete
function terminalPurge(selector) {
    const target = document.querySelector(selector);
    target.value = '';
    
    // Purge Shake
    anime({
        targets: target,
        translateX: [-5, 5, -5, 5, 0],
        duration: 250,
        easing: 'linear'
    });
}

//Copy function
function terminalCopy(event, selector) {
    const btn = event.currentTarget;
    const originalText = btn.innerText;
    const target = document.querySelector(selector);
    
    //Copy
    navigator.clipboard.writeText(target.value).then(() => {


    btn.innerText = "DATA_CLONED";
    setTimeout(() => btn.innerText = originalText, 2000);
});
    
    // Brief "Copied" alert on the button text
    btn.innerText = "DATA_CLONED";
    
    //Resets to original text
    setTimeout(() => btn.innerText = originalText, 1500);
}



const panelTitle = document.querySelector('.terminal-title'); 
const finalHumanText = "ENCRYPTION_ACTIVE";
const alienChars = "0123456789%&#$@"; 



function triggerTitleScramble() {
    anime({
    targets: panelTitle,
    duration: 2000,
    easing: 'easeInOutQuad',
    begin: () => {
        // Force the alien look at the start
        panelTitle.style.fontFamily = "yautja, sans-serif";
        panelTitle.style.color = "red";
        panelTitle.style.textShadow = "0 0 15 #ff0000'";
    },
    update: function(anim) {
        // The scramble happens here
        const currentProgress = Math.floor(anim.progress / 100 * finalHumanText.length);
        
        const content = finalHumanText.split('').map((char, index) => {
            if (index < currentProgress) return char; 
            return alienChars[Math.floor(Math.random() * alienChars.length)];
        }).join('');
        
        panelTitle.innerText = content;

        // Visual glitch: Occasionally swap font-family for a single frame
        if (Math.random() > 0.95) {
            panelTitle.style.fontFamily = "monospace";
        } else {
            panelTitle.style.fontFamily = "'Yautja', sans-serif";
        }
    },
    complete: () => {
        // Snap to human-readable state
        panelTitle.innerText = finalHumanText;
        panelTitle.style.fontFamily = "'IBM Plex Mono', monospace";
        panelTitle.style.letterSpacing = "2px";
        anime({
            targets: panelTitle,
            color: [
                { value: '#39FF14' }, // Neon Green
                { value: '' } 
            ],
            textShadow: [
                { value: '0 0 20px #39FF14' },
                { value: '0 0 5px #25b40c' }
            ],
            duration: 300,
            direction: 'alternate',
            easing: 'linear',
            loop: 6, // 3 full blinks (on/off x3)
            complete: () => {
                // ends on the final blue state
                panelTitle.style.color = "#38B6FF";
                panelTitle.style.textShadow = "none"; 
            }
        });
    }
    }
);
}



//Laser animation

const clickOnSide= (side) => {
    const activeSide = cube.dataset.side;
    const newSideClass = `show-${side}`;
    
    // 1. Rotate the cube
    cube.classList.replace(`show-${activeSide}`, newSideClass);
    cube.setAttribute("data-side", side);

    // 2. Trigger the Laser Scan on the target face after rotation
    setTimeout(() => {
        const targetFace = document.querySelector(`.cube-face-${side}`);
        const laser = targetFace.querySelector('.laser-scan');
        
        if (laser) {
            // Reset and Animate Laser
            anime.timeline({
                easing: 'easeInOutQuad',
            })
            .add({
                targets: laser,
                opacity: [0, 1, 0.8, 0],
                top: ['0%', '100%'],
                duration: 1200,
            })
            .add({
                targets: targetFace.querySelectorAll('label, input, textarea, button'),
                opacity: [0.5, 1],
                translateY: [10, 0],
                delay: anime.stagger(50),
                duration: 400
            }, '-=800') 
            
        }
        if(side === 'front'){
            triggerTitleScramble();
        }
    }, 600)
};


//Cube rotator
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const sideToTurn = e.target.dataset.side;
    clickOnSide(sideToTurn);
  })
});


//Toggle pass visibility
function togglePassword(btn) {
    // Find the input that is in the same div as this button
    const input = btn.parentElement.querySelector('.passInput');
    if (input.type === "password") {
        input.type = "text";
        btn.innerText = "🔒"; // Change icon when visible
    } else {
        input.type = "password";
        btn.innerText = "👁️";
    }
}

//Update pass strength
function updateStrength(inputEl) {
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


//Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}


// --- MASKING CONFIGURATION ---
const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const MASK_CHARS = B64_CHARS.split('').reverse().join('');

function applyMask(str) {
    return str.split('').map(char => {
        const index = B64_CHARS.indexOf(char);
        return index !== -1 ? MASK_CHARS[index] : char;
    }).join('');
}

function removeMask(str) {
    return str.split('').map(char => {
        const index = MASK_CHARS.indexOf(char);
        return index !== -1 ? B64_CHARS[index] : char;
    }).join('');
}

// --- CORE CRYPTO FUNCTIONS ---
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false, ["encrypt", "decrypt"]
    );
}

//Encryption logic
async function encryptBatch(messages, password) {
    const encoder = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);

    return Promise.all(messages.map(async (msg) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const buffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(msg));
        const saltB64 = btoa(String.fromCharCode(...salt));
        const ivB64 = btoa(String.fromCharCode(...iv));
        const contentB64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return applyMask(`${saltB64}:${ivB64}:${contentB64}`);
    }));
}


//Decryption logic
async function decryptBatch(encryptedMessages, password) {
    const decoder = new TextDecoder();
    const b64ToUint8 = (b64) => {
        try {
            return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        } catch (e) {
            throw new Error("Invalid Base64");
        }
    };

    return Promise.all(encryptedMessages.map(async (entry) => {
        try {
            const cleanEntry = removeMask(entry.trim());
            const parts = cleanEntry.split(':');
            
            if (parts.length !== 3) throw new Error("Invalid format");

            const [sB64, iB64, cB64] = parts;
            const salt = b64ToUint8(sB64);
            const iv = b64ToUint8(iB64);
            const data = b64ToUint8(cB64);

            // Re-derive the key using the password and the salt from the message
            const key = await deriveKey(password, salt);

            // AES-GCM will automatically throw an error here if the password/key is wrong
            const buffer = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv }, 
                key, 
                data
            );

            return decoder.decode(buffer);
        } catch (e) {
            // This is the "Wrong Password" trigger
            console.error("Decryption failed:", e);
            return "!!! ACCESS DENIED: INVALID KEY !!!";
        }
    }));
}

// --- UI HANDLERS ---

async function handleEncrypt() {

    const face = document.querySelector('.cube-face-front');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');

    if (!pass || !text) return alert("Need password and text!");

    const res = await encryptBatch([text], pass);
    output.innerText = res[0];
}

async function handleDecrypt() {
    const face = document.querySelector('.cube-face-right');
    const pass = face.querySelector('.passInput').value;
    const text = face.querySelector('.mainInput').value;
    const output = face.querySelector('.resultOutput');

    if (!pass || !text) return alert("Need password and encrypted text!");

    const res = await decryptBatch([text], pass);
    output.value = res[0];

    if (res[0].includes("ACCESS DENIED")) {
        anime({
            targets: output,
            // Flash red and shake
            backgroundColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.4)', 'rgba(255,0,0,0)'],
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'linear'
        });
        
        output.style.color = "#ff4c4c";
        setTimeout(() => { output.style.color = "#00ff41"; }, 1000);
    }
}

function startBootSequence() {

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

}

startBootSequence();





// async function pasteToInput(selector) {
//     try {
//         const text = await navigator.clipboard.readText();
//         const target = document.querySelector(selector);
//         target.value = text;
        
//         // Add a little "Success" flicker
//         anime({
//             targets: target,
//             borderColor: ['#00ff41', '#ffffff', '#00ff41'],
//             duration: 300,
//             easing: 'linear'
//         });
//     } catch (err) {
//         console.error("Clipboard access denied", err);
//         alert("PLEASE ALLOW CLIPBOARD PERMISSIONS");
//     }
// }


// function clearInput(selector) {
//     const target = document.querySelector(selector);
//     target.value = '';
    
//     // Predator-style "Purge" shake
//     anime({
//         targets: target,
//         translateX: [-3, 3, 0],
//         duration: 200,
//         easing: 'easeInOutQuad'
//     });
// }