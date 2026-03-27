const mouseGlow = document.getElementById('mouse-glow');
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const tiltItems = Array.from(document.querySelectorAll('.tilt'));

function setupMouseGlow() {
  if (!mouseGlow) return;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  const loop = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    mouseGlow.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
    window.requestAnimationFrame(loop);
  };

  loop();
}

function setupReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }
    },
    { threshold: 0.12 },
  );

  for (const item of revealItems) io.observe(item);
}

function setupTilt() {
  for (const item of tiltItems) {
    item.addEventListener('mousemove', (e) => {
      const r = item.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 10;
      item.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  }
}

function setupCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const dots = [];
  const count = 72;

  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i += 1) {
    dots.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.7 + 0.5,
    });
  }

  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const dot of dots) {
      dot.x += dot.vx;
      dot.y += dot.vy;

      if (dot.x < -20) dot.x = window.innerWidth + 20;
      if (dot.x > window.innerWidth + 20) dot.x = -20;
      if (dot.y < -20) dot.y = window.innerHeight + 20;
      if (dot.y > window.innerHeight + 20) dot.y = -20;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(140, 176, 255, 0.45)';
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        const a = dots[i];
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const alpha = 1 - dist / 120;
          ctx.strokeStyle = `rgba(100, 145, 255, ${alpha * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    window.requestAnimationFrame(render);
  };

  render();
}

function setupScVisualizer() {
  const canvas = document.getElementById('sc-visualizer');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const bars = 28;
  const barW = W / bars;
  const phases = [];
  const speeds = [];

  for (let i = 0; i < bars; i++) {
    phases.push(Math.random() * Math.PI * 2);
    speeds.push(0.035 + Math.random() * 0.06);
  }

  let t = 0;

  const palette = {
    r: 255, g: 140, b: 60,
    r2: 255, g: 80, b: 100,
    r3: 200, g: 120, b: 255,
  };

  const render = () => {
    ctx.clearRect(0, 0, W, H);
    t += 1;

    for (let i = 0; i < bars; i++) {
      const x = i * barW + 1;
      const bw = barW - 2;

      const base = Math.sin(t * speeds[i] + phases[i]) * 0.35 + 0.65;
      const detail1 = Math.sin(t * 0.07 + i * 0.5) * 0.2;
      const detail2 = Math.sin(t * 0.13 + i * 0.8) * 0.1;
      const h = Math.max(3, (base + detail1 + detail2) * H * 0.72);

      const phase = (i / bars) + Math.sin(t * 0.018) * 0.5;

      const r = Math.round(
        palette.r + (palette.r2 - palette.r) * phase +
        (palette.r3 - palette.r2) * Math.sin(phase * Math.PI + t * 0.04) * 0.5
      );
      const g = Math.round(
        palette.g + (palette.g2 - palette.g) * phase +
        (palette.g3 - palette.g) * Math.cos(phase * Math.PI + t * 0.05) * 0.5
      );
      const b = Math.round(
        palette.b + (palette.b2 - palette.b) * phase +
        (palette.b3 - palette.b) * Math.sin(phase * Math.PI * 1.3 + t * 0.03) * 0.5
      );

      const grad = ctx.createLinearGradient(0, H, 0, H - h);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.92)`);
      grad.addColorStop(0.5, `rgba(${Math.round(r * 0.7)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.4)}, 0.7)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, H - h, bw, h, [3, 3, 0, 0]);
      ctx.fill();

      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
      ctx.fillRect(x, H - h, bw, 2);
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(render);
  };

  render();
}

function setupShotLightbox() {
  const lightbox = document.getElementById('shot-lightbox');
  const lightboxImg = document.getElementById('shot-lightbox-img');
  const lightboxCaption = document.getElementById('shot-lightbox-caption');
  const lightboxIndex = document.getElementById('shot-lightbox-index');
  const closeBtn = document.getElementById('shot-lightbox-close');
  const prevBtn = document.getElementById('shot-lightbox-prev');
  const nextBtn = document.getElementById('shot-lightbox-next');
  const shotImages = Array.from(document.querySelectorAll('.shots img'));
  if (
    !lightbox ||
    !lightboxImg ||
    !lightboxCaption ||
    !lightboxIndex ||
    !closeBtn ||
    !prevBtn ||
    !nextBtn ||
    shotImages.length === 0
  ) return;

  let currentIndex = 0;

  const animateImage = (direction) => {
    lightboxImg.classList.add('is-animating');
    const fromX = direction > 0 ? 48 : -48;
    lightboxImg.animate(
      [
        { opacity: 0.35, transform: `translateX(${fromX}px) scale(0.985)` },
        { opacity: 1, transform: 'translateX(0) scale(1)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    window.setTimeout(() => lightboxImg.classList.remove('is-animating'), 320);
  };

  const render = (index, direction = 0) => {
    const total = shotImages.length;
    currentIndex = (index + total) % total;
    const current = shotImages[currentIndex];
    lightboxImg.src = current.src;
    lightboxCaption.textContent = current.alt || '';
    lightboxIndex.textContent = `${currentIndex + 1} / ${total}`;
    if (direction !== 0) animateImage(direction);
  };

  const close = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.style.overflow = '';
  };

  const open = (index) => {
    render(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const showPrev = () => render(currentIndex - 1, -1);
  const showNext = () => render(currentIndex + 1, 1);

  for (const [index, img] of shotImages.entries()) {
    img.addEventListener('click', () => open(index));
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  window.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

setupMouseGlow();
setupReveal();
setupTilt();
setupCanvas();
setupScVisualizer();
setupShotLightbox();
