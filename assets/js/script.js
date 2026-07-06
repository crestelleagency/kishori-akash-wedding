(function () {
  const cover = document.getElementById("cover");
  const invitation = document.getElementById("invitation");
  const openButton = document.getElementById("openInvitation");
  const butterfly = document.getElementById("butterfly");
  const petals = document.querySelector(".petals");
  const musicToggle = document.getElementById("musicToggle");
  const bgMusic = document.getElementById("bgMusic");
  const scratchCanvas = document.getElementById("scratchCanvas");
  const countdown = document.getElementById("countdown");
  const weddingDate = new Date("2026-07-26T00:00:00+05:30").getTime();
  const petalSymbols = ["🌸", "🌸", "🌿", "🌸", "🌼", "🌿", "🌸"];

  let revealed = false;
  let drawing = false;
  let muted = false;

  function createPetals(count = 18) {
    petals.innerHTML = "";
    Array.from({ length: count }).forEach((_, index) => {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.textContent = petalSymbols[index % petalSymbols.length];
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.fontSize = `${14 + Math.random() * 22}px`;
      petal.style.animationDuration = `${14 + Math.random() * 16}s`;
      petal.style.animationDelay = `${Math.random() * 12}s`;
      petals.appendChild(petal);
    });
  }

  function openInvitation() {
    openButton.classList.add("opening");
    setTimeout(() => {
      cover.classList.add("hidden");
      invitation.classList.remove("hidden");
      butterfly.classList.remove("hidden");
      setupScratchCanvas();
      updateCountdown();
      window.setInterval(updateCountdown, 1000);
      bgMusic.volume = 0.45;
      bgMusic.play().catch(() => {});
    }, 900);
  }

  function updateCountdown() {
    const remaining = Math.max(0, weddingDate - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining / 3600000) % 24);
    const minutes = Math.floor((remaining / 60000) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  }

  function setupScratchCanvas() {
    if (!scratchCanvas || revealed) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = scratchCanvas.getBoundingClientRect();
    scratchCanvas.width = rect.width * ratio;
    scratchCanvas.height = rect.height * ratio;

    const ctx = scratchCanvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#f9c8d9");
    gradient.addColorStop(0.5, "#f4a3bf");
    gradient.addColorStop(1, "#e87aa3");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
    ctx.font = '600 14px "Cinzel", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  SCRATCH TO REVEAL  ✦", rect.width / 2, rect.height / 2);
  }

  function scratch(clientX, clientY) {
    if (revealed) return;
    const ctx = scratchCanvas.getContext("2d");
    const rect = scratchCanvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkReveal() {
    if (revealed) return;
    const ctx = scratchCanvas.getContext("2d");
    const image = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let clearPixels = 0;
    for (let i = 3; i < image.length; i += 80) {
      if (image[i] < 60) clearPixels += 1;
    }
    if (clearPixels / (image.length / 80) > 0.25) {
      revealed = true;
      ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      countdown.classList.remove("hidden");
      burstConfetti();
    }
  }

  function burstConfetti() {
    const colors = ["#f9c8d9", "#f4a3bf", "#e87aa3", "#c75a85", "#ffffff"];
    for (let i = 0; i < 90; i += 1) {
      const dot = document.createElement("span");
      dot.style.position = "fixed";
      dot.style.left = `${20 + Math.random() * 60}vw`;
      dot.style.top = `${24 + Math.random() * 22}vh`;
      dot.style.width = `${6 + Math.random() * 8}px`;
      dot.style.height = dot.style.width;
      dot.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      dot.style.background = colors[i % colors.length];
      dot.style.zIndex = "70";
      dot.style.pointerEvents = "none";
      dot.style.transition = "transform 1.4s ease-out, opacity 1.4s ease-out";
      document.body.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.transform = `translate(${(Math.random() - 0.5) * 520}px, ${160 + Math.random() * 280}px) rotate(${Math.random() * 720}deg)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 1600);
    }
  }

  function toggleMusic() {
    muted = !muted;
    bgMusic.muted = muted;
    musicToggle.textContent = muted ? "×" : "♪";
    musicToggle.setAttribute("aria-label", muted ? "Unmute background music" : "Mute background music");
  }

  createPetals();
  openButton.addEventListener("click", openInvitation);
  musicToggle.addEventListener("click", toggleMusic);
  window.addEventListener("resize", setupScratchCanvas);

  scratchCanvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    scratchCanvas.setPointerCapture(event.pointerId);
    scratch(event.clientX, event.clientY);
  });

  scratchCanvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    event.preventDefault();
    scratch(event.clientX, event.clientY);
    checkReveal();
  });

  scratchCanvas.addEventListener("pointerup", () => {
    drawing = false;
    checkReveal();
  });

  scratchCanvas.addEventListener("pointerleave", () => {
    drawing = false;
    checkReveal();
  });
})();
