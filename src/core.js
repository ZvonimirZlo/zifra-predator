// ========================================================================================================================================================================
// CORE.JS
// Progressive async loader synced with HTML intro lines
// ============================================================================

import { showTerminalAlert } from './Modules/terminalAlert.js';


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


//each module waits for the previous dynamic import to finish
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
    setTimeout(() => {
      showTerminalAlert('[CORE] All systems online.');
    },7000)

  } catch (error) {
    console.error('[CORE] Initialization sequence failed:', error);
    setTimeout(() => {
      showTerminalAlert(`⚠️[CORE] Initialization sequence FAILED: ${error}`);
    },7000)
  // Automatically find any lines that haven't been processed and mark them as FAIL
    introLines.forEach(line => {
      if (!line.textContent.includes('[')) {
        const currentText = line.textContent.split('.')[0];
        line.textContent = `${currentText}${line.textContent.slice(line.textContent.indexOf('.'))}[FAIL]`;
      }
    });
  
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

  await initializeApplication();
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



