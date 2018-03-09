document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("bgvid").play();
  });
  document.getElementById("bgvid").onended = function() {
    var screen = document.getElementById("screen");
    screen.style.cursor = "auto";
    screen.style.webkitAnimationPlayState = "running";
};
