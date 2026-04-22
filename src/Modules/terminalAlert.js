export function showTerminalAlert(message) {
  const alertBox = document.getElementById('terminal-alert');
  const msgText = document.getElementById('alert-message');
  
 if (!alertBox || !msgText) return;

  // 3. Update the text
  msgText.innerText = message;

  return anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: alertBox,
      left: 20,
      opacity: [0, 1, 0.5, 1, 0.8, 1],
      duration: 500
    })
    .add({
      targets: '.alert-scanner',
      left: ['0%', '100%'],
      duration: 1000,
      easing: 'linear'
    })
    .add({
      targets: alertBox,
      opacity: 0,
      left: -300,
      delay: 2000,
      duration: 500
    });
}