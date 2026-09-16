(() => {
  "use strict";
  const total = 17;
  const stage = document.getElementById("slide-stage");
  const image = document.getElementById("slide-image");
  const video = document.getElementById("slide-video");
  const counter = document.getElementById("slide-counter");
  const previous = document.getElementById("previous-slide");
  const next = document.getElementById("next-slide");
  const fullscreen = document.getElementById("fullscreen");
  const viewer = document.getElementById("viewer");
  let current = 1;
  let touchStart = null;

  function slideUrl(number) {
    return "assets/slides/folie-" + String(number).padStart(2, "0") + ".webp";
  }

  function preload(number) {
    if (number < 1 || number > total || number === 2) return;
    const pending = new Image();
    pending.src = slideUrl(number);
  }

  function show(number) {
    if (number < 1 || number > total || number === current) return;
    video.pause();
    current = number;
    const filmSlide = current === 2;
    image.hidden = filmSlide;
    video.hidden = !filmSlide;
    if (filmSlide) {
      if (!video.src) {
        video.src = "assets/slides/folie-02-video.mp4";
        video.load();
      }
    } else {
      image.src = slideUrl(current);
      image.alt = "Folie " + current + " von " + total;
    }
    counter.textContent = current + " / " + total;
    previous.disabled = current === 1;
    next.disabled = current === total;
    preload(current + 1);
  }

  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  document.addEventListener("keydown", event => {
    if (event.target.matches("video, input, textarea, select")) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
  });
  stage.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  stage.addEventListener("touchend", event => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  if (viewer.requestFullscreen) {
    fullscreen.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else viewer.requestFullscreen();
    });
    document.addEventListener("fullscreenchange", () => {
      fullscreen.textContent = document.fullscreenElement ? "Vollbild verlassen" : "Vollbild";
    });
  } else {
    fullscreen.hidden = true;
  }
  preload(3);
})();
