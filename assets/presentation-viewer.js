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
  let presentationFullscreen = false;
  let nativeFullscreenEntered = false;
  let scrollBeforeFullscreen = 0;
  let bodyTopBeforeFullscreen = "";

  function slideUrl(number) {
    return "assets/slides/folie-" + String(number).padStart(2, "0") + "-b7eeff66.webp";
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
    viewer.classList.toggle("is-video-slide", filmSlide);
    image.hidden = filmSlide;
    video.hidden = !filmSlide;
    if (filmSlide) {
      if (!video.src) {
        video.src = "assets/slides/folie-02-video-b7eeff66.mp4";
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
    if (event.key === "Escape" && presentationFullscreen) {
      event.preventDefault();
      leaveFullscreen();
      return;
    }
    if (event.target instanceof Element && event.target.matches("video, input, textarea, select")) return;
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

  function setPresentationFullscreen(active) {
    if (presentationFullscreen === active) return;
    presentationFullscreen = active;
    if (active) {
      scrollBeforeFullscreen = window.scrollY;
      bodyTopBeforeFullscreen = document.body.style.top;
      document.body.style.top = `-${scrollBeforeFullscreen}px`;
      document.documentElement.classList.add("presentation-fullscreen");
      document.body.classList.add("presentation-fullscreen");
      viewer.classList.add("is-presentation-fullscreen");
    } else {
      viewer.classList.remove("is-presentation-fullscreen");
      document.body.classList.remove("presentation-fullscreen");
      document.documentElement.classList.remove("presentation-fullscreen");
      document.body.style.top = bodyTopBeforeFullscreen;
      window.scrollTo(0, scrollBeforeFullscreen);
    }
    fullscreen.textContent = active ? "×" : "Vollbild";
    fullscreen.setAttribute("aria-label", active ? "Vollbild verlassen" : "Vollbild öffnen");
  }

  async function leaveFullscreen() {
    if (document.fullscreenElement === viewer && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { return; }
      if (document.fullscreenElement === viewer) return;
    }
    nativeFullscreenEntered = false;
    setPresentationFullscreen(false);
  }

  fullscreen.addEventListener("click", async () => {
    if (presentationFullscreen) {
      await leaveFullscreen();
      return;
    }

    // Show the CSS mode immediately; keep it if native fullscreen is unavailable or rejects.
    setPresentationFullscreen(true);
    if (typeof viewer.requestFullscreen === "function") {
      try { await viewer.requestFullscreen({ navigationUI: "hide" }); } catch { /* CSS mode stays active. */ }
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === viewer) {
      nativeFullscreenEntered = true;
      setPresentationFullscreen(true);
    } else if (nativeFullscreenEntered) {
      nativeFullscreenEntered = false;
      setPresentationFullscreen(false);
    }
  });

  preload(3);
})();
