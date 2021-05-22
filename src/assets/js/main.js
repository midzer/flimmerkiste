document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('bgvid');
  video.onended = function() {
    const screen = document.getElementById('screen');
    screen.style.cursor = 'auto';
    screen.style.animationPlayState = 'running';
  };
  video.play();
  document.querySelector('app-root').style.display = 'initial';
});
