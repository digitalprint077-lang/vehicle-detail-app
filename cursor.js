function initCustomCursor() {
  if (!document.body.classList.contains("result-page-body")) {
    return;
  }

  const cursor = document.getElementById("custom-cursor");
  const ring = document.getElementById("cursor-ring");
  const isMobilePreview = window.matchMedia(
    "(max-width: 768px), (hover: none) and (pointer: coarse)"
  ).matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!cursor || !ring) {
    return;
  }

  if (isMobilePreview) {
    initTouchCursor(cursor, ring);
    return;
  }

  if (!hasFinePointer) {
    return;
  }

  initMouseCursor(cursor, ring);
}

function initMouseCursor(cursor, ring) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!visible) {
      visible = true;
      cursor.classList.remove("hidden");
      ring.classList.remove("hidden");
      ringX = mouseX;
      ringY = mouseY;
    }

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  document.addEventListener("mouseleave", () => {
    visible = false;
    cursor.classList.add("hidden");
    ring.classList.add("hidden");
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();
}

function initTouchCursor(cursor, ring) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;
  let visible = false;

  function showCursor(clientX, clientY) {
    pointerX = clientX;
    pointerY = clientY;

    if (!visible) {
      visible = true;
      cursor.classList.remove("hidden");
      ring.classList.remove("hidden");
      ringX = pointerX;
      ringY = pointerY;
    }

    cursor.style.left = `${pointerX}px`;
    cursor.style.top = `${pointerY}px`;
  }

  function readTouchPoint(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    if (!touch) return null;
    return { x: touch.clientX, y: touch.clientY };
  }

  document.addEventListener(
    "touchstart",
    (event) => {
      const point = readTouchPoint(event);
      if (!point) return;
      showCursor(point.x, point.y);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      const point = readTouchPoint(event);
      if (!point) return;
      showCursor(point.x, point.y);
    },
    { passive: true }
  );

  // Lets mobile preview work with mouse in resized desktop browsers.
  document.addEventListener("mousemove", (event) => {
    showCursor(event.clientX, event.clientY);
  });

  function animateRing() {
    ringX += (pointerX - ringX) * 0.15;
    ringY += (pointerY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();
}
