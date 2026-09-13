
// ============================================================================
// CORE.JS
// Progressive async loader synced with HTML intro lines
// ============================================================================

const sequencer = document.getElementById('boot-sequencer');
const startBtn = document.querySelector('.start');
const startingPoint = document.querySelector('.starting-point');
const sidebar = document.getElementById('sidebar');
const introLines = document.querySelectorAll('#intro-lines .line');

// Helper to update specific terminal lines sequentially
const updateIntroLine = (index, statusText = 'OK') => {
  if (introLines[index]) {
    const currentText = introLines[index].textContent.split('.')[0];
    introLines[index].textContent = `${currentText}${introLines[index].textContent.slice(introLines[index].textContent.indexOf('.'))}[${statusText}]`;
    // introLines[index].style.color = 'red';
  }
};

const createSidebarUnlocker = (translator) => {
  if (!sidebar) return;
  const controller = new AbortController();
  const { signal } = controller;
  const handleEvent = (event) => {
    translator(event);
    controller.abort();
  };
  sidebar.addEventListener('click', handleEvent, { signal });
  sidebar.addEventListener('mouseenter', handleEvent, { signal });
};

const initializeApplication = async () => {
  try {
    // 0. Boot Sequence
    const bootModule = await import('./Modules/bootSequence.js');
    bootModule.startBootSequence();
    updateIntroLine(0);

    // 1. Cursor & Utils Base
    const utilsModule = await import('./Modules/utils.js');
    utilsModule.initCursor();
    updateIntroLine(1);

    // 2. Sidebar & Theme Controllers
    const sidebarModule = await import('./Modules/sidebarControllers.js');
    sidebarModule.initTheme();
    updateIntroLine(2);

    sidebarModule.initSidebarVisibility();
    updateIntroLine(3);

    // 3. Stealth Mode
    const soundModule = await import('./Modules/soundControl.js');
    soundModule.initStealthMode();
    updateIntroLine(4);

    // 4. Reboot Sequence
    sidebarModule.initRebootSequence();
    updateIntroLine(5);
    createSidebarUnlocker(sidebarModule.translator);

    // 5. Password Strength UI
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        utilsModule.togglePassword(event.currentTarget);
      });
    });
    updateIntroLine(6);

    document.querySelectorAll('.passInput').forEach(input => {
      input.addEventListener('input', event => {
        utilsModule.updateStrength(event.target);
      });
    });
    updateIntroLine(7);

    // 6. Cube Listeners
    const cubeModule = await import('./Modules/cubeControllers.js');
    cubeModule.initCubeListeners();
    updateIntroLine(8);

    // 7. QR Dropzone
    const qrModule = await import('./Modules/QRActions.js');
    qrModule.initQRDropZone('#decrypter_input');
    updateIntroLine(9);

    // 8. Decrypter Scanner
    qrModule.initDecrypterScanner();
    updateIntroLine(10);

    // 9. Arrow Key Navigation
    utilsModule.arrowKeyNavigator();
    updateIntroLine(11);

    // 10. QR Controller
    qrModule.initQRController();
    updateIntroLine(12);

    // 11. Terminal Actions
    utilsModule.terminalActions();
    updateIntroLine(13);

    // 12. Crypto Engine
    const cryptoModule = await import('./Modules/cryptoEngine.js');
    cryptoModule.cryptoProcessors();
    updateIntroLine(14);

    console.log('[CORE] All systems online.');

  } catch (error) {
    console.error('[CORE] Initialization sequence failed:', error);
  }
};

const startApp = async () => {
  window.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('keypress', handleKeyPress);

  if (startingPoint) startingPoint.style.display = 'block';
  if (startBtn) startBtn.style.display = 'none';

  requestAnimationFrame(() => {
    const firstButton = document.getElementById('btn1');
    if (firstButton) firstButton.focus();
  });

  initializeApplication();
};

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (startBtn) startBtn.click();
  }
};

if (startBtn) {
  startBtn.addEventListener('click', startApp, { once: true });
  window.addEventListener('keypress', handleKeyPress);
}


// ==================================================================================================================

// import { startBootSequence } from './Modules/bootSequence.js'

// import {
//   setTheme,
//   toggleSidebar,
//   translator,
//   startDecayCountdown,
//   initTheme,
//   initSidebarVisibility,
//   initRebootSequence
// } from './Modules/sidebarControllers.js'
// import {
//   togglePassword,
//   updateStrength,
//   terminalCopy,
//   terminalPaste,
//   terminalPurge,
//   initCursor,
//   arrowKeyNavigator,
//   terminalActions
// } from './Modules/utils.js'
// import { toggleMute, initStealthMode } from './Modules/soundControl.js'
// import { initCubeListeners } from './Modules/cubeControllers.js'
// import { cryptoProcessors } from './Modules/cryptoEngine.js'
// import {
//   generateQR,
//   copyQR,
//   scanQRData,
//   initDecrypterScanner,
//   downloadQR,
//   initQRDropZone,
//   initQRController
// } from './Modules/QRActions.js'


// const sequencer = document.getElementById('boot-sequencer')
// const glyph = sequencer.querySelector('.countdown-glyph')
// const startBtn = document.querySelector('.start')
// const startingPoint = document.querySelector('.starting-point')
// const sidebar = document.getElementById('sidebar');

// //'Unlocks' the sidebar on mouse enter

// const sidebarUnlocker = () => {
//   sidebar.addEventListener('click', translator, { once: true })
//   sidebar.addEventListener('mouseenter', translator, { once: true }) //Unlocks the sidebar
// }



// //Starting the app
// startBtn.addEventListener('click', () => {
//   startingPoint.style.display = 'block'
//   startBtn.style.display = 'none'
//   // Gives the browser a split second to render the 'block'
//   // change before firing the heavy logic
//   document.getElementById('btn1').focus()
//   setTimeout(() => {
//     startBootSequence()
//   }, 100)
// })

//  const initPasswordStrength = () => {
//   // --- PASSWORD & STRENGTH ---
// document.querySelectorAll('.toggle-visibility').forEach(btn => {
//   btn.addEventListener('click', e => {
//     e.stopPropagation() // Prevents the click from triggering other things
//     togglePassword(e.currentTarget)
//   })
// })
// }
// //Updates pass strength bar
//  const initPasswordStrengthUpdate = () => {
//   document.querySelectorAll('.passInput').forEach(input => {
//   input.addEventListener('input', e => updateStrength(e.target))
// })
// }

// initCursor() //'Predator' aiming cursor
// initTheme() //Visual theme switcher
// sidebarUnlocker() //Unlocks the sidebar
// initSidebarVisibility() //Toggle sidebar visibility
// initStealthMode() //Mute sounds
// initRebootSequence() //Browser reloader
// initPasswordStrength() //Pass strength
// initPasswordStrengthUpdate() //Updates pass strength
// initCubeListeners() //Triggers cube listeners
// initQRDropZone('#decrypter_input') //Allows dropping the QR code directly
// initDecrypterScanner() //Decrypt scanner initialization
// arrowKeyNavigator() //Arrow key trigger
// initQRController() //Initialize QR controller
// terminalActions() //Copy,paste,purge
// cryptoProcessors() //Crypto processing




