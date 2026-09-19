/**
 * Centralized sound-effect controls.
 */

//Sounds
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
}

//Sound tester

export const testAudioFile = (name, sound) => {
  return new Promise(resolve => {
    if (sound.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve({
        name,
        status: 'OK',
        reason: 'Already loaded'
      })
      return
    }
    const cleanup = () => {
      sound.removeEventListener('canplaythrough', success)
      sound.removeEventListener('error', failure)
    }
    const success = () => {
      cleanup()
      resolve({
        name,
        status: 'OK'
      })
    }
    const failure = () => {
      cleanup()
      resolve({
        name,
        status: 'FAIL',
        reason: 'Audio file could not be loaded'
      })
    }

    sound.addEventListener('canplaythrough', success, { once: true })
    sound.addEventListener('error', failure, { once: true })
    sound.load()
  })
}

//Diagnose sounds health, so if the expected sound does't exist or cannot be loaded it throws error

export const soundDiagnostics = async () => {
  const expectedSounds = [
    'click',
    'change',
    'beam',
    'alert',
    'error',
    'success',
    'laser',
    'predator',
    'countdown',
    'beep',
    'calibrating',
    'unlock'
  ]

  const results = []

  for (const name of expectedSounds) {
    const sound = sfx[name]
    if (!sound) {
      results.push({
        name,
        status: 'FAIL',
        reason: 'Missing from sfx'
      })
      continue
    }
    if (!(sound instanceof Audio)) {
      results.push({
        name,
        status: 'FAIL',
        reason: 'Not an Audio object'
      })
      continue
    }
    sound.volume = 0.6
    sound.preload = 'auto'
    const result = await testAudioFile(name, sound)
    results.push(result)
  }
  console.table(results)

  const failures = results.filter(x => x.status === 'FAIL')
  if (failures.length) {
    throw new Error(
      `[SOUND] ${failures.length}/${results.length} diagnostics failed`
    )
  }
  return results
}

let isMuted = false

//Mute all sounds
const toggleMute = () => {
  isMuted = !isMuted

  Object.values(sfx).forEach(sound => {
    sound.muted = isMuted
  })

  sfx.beep.play() // Feedback beep

  const stealthBtn = document.querySelector('.stealth')
  if (stealthBtn) {
    stealthBtn.innerText = isMuted ? `STEALTH_ON 🔇` : `STEALTH_OFF 🔊`
  }

  return isMuted
}

export const initStealthMode = () => {
  // Toggle mute/unmute sounds
  document.querySelector('.stealth').addEventListener('click', toggleMute)
}
