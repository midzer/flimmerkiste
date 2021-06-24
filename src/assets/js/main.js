document.addEventListener('DOMContentLoaded', function() {
  // Fix horizontal app shifting
  document.querySelector('app-root').style.display = 'initial';
});

document.getElementById('bgvid').onended = function() {
  const screen = document.getElementById('screen');
  screen.style.cursor = 'auto';
  screen.style.animationPlayState = 'running';
};
