// Modules/audio.js

export const sfx = {
    click: new Audio('/Sounds/click.ogg'),
    change: new Audio('/Sounds/change.ogg'),
    beam: new Audio('/Sounds/beam.ogg'),
    alert: new Audio('/Sounds/alert.ogg'),
    error: new Audio('/Sounds/error.ogg'),
    success: new Audio('/Sounds/success.ogg'),
    laser: new Audio('/Sounds/u_xg7ssi08yr-laser-381976.ogg'),
    predator: new Audio('/Sounds/freesound_community-predator-40909.ogg'),
    countdown: new Audio('/Sounds/countdown-boom.ogg'),
    beep: new Audio('/Sounds/beepP.ogg'),
    calibrating: new Audio('/Sounds/calibrating.ogg'),
    unlock: new Audio('/Sounds/unlockingGauntlet.ogg')
};

let isMuted = false;

export const toggleMute = () => {
    isMuted = !isMuted;

    Object.values(sfx).forEach(sound => {
        sound.muted = isMuted;
    });

    sfx.beep.play(); // Feedback beep

    const stealthBtn = document.querySelector('.stealth');
    if (stealthBtn) {
        stealthBtn.innerText = isMuted ? `STEALTH_ON 🔇` : `STEALTH_OFF 🔊`;
    }

    return isMuted;
};

export const initStealthMode = () => {
  // Toggle mute/unmute sounds
document.querySelector('.stealth').addEventListener('click', toggleMute)
}