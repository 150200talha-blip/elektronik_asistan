// ── PERFORMANS OPTİMİZE EDİLMİŞ ARKA PLAN ANİMASYONU ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: true });

let width, height, dpr = 1;
let animId = null;
let isVisible = true;

function resize() {
    // Mobilde canvas çözünürlüğünü düşür (performans)
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
resize();

// Visibility API — sekme gizliyken animasyonu durdur
document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible && !animId) animate();
});

// ── SPARK (azaltılmış) ──
class Spark {
    constructor() { this.life = 0; }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.sx = (Math.random() - 0.5) * 12;
        this.sy = (Math.random() - 0.5) * 12;
        this.life = (Math.random() * 20 + 8) | 0;
        this.maxLife = this.life;
        this.isBlue = Math.random() > 0.4;
    }
    update() {
        if (this.life <= 0) return;
        this.x += this.sx;
        this.y += this.sy;
        this.life--;
        if (Math.random() > 0.85) {
            this.sx += (Math.random() - 0.5) * 8;
            this.sy += (Math.random() - 0.5) * 8;
        }
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.life = 0;
    }
    draw() {
        if (this.life <= 0) return;
        const a = this.life / this.maxLife;
        ctx.globalAlpha = a;
        ctx.strokeStyle = this.isBlue ? '#00f3ff' : '#fad335';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.sx, this.y - this.sy);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

// ── SMOKE — gradient yerine basit daire (çok daha hızlı) ──
class Smoke {
    constructor() { this.reset(true); }
    reset(rh) {
        this.x = Math.random() * width;
        this.y = rh ? Math.random() * height : height + 50;
        this.size = Math.random() * 50 + 15;
        this.sy = -(Math.random() * 1 + 0.3);
        this.sx = (Math.random() - 0.5) * 0.8;
        this.life = (Math.random() * 300 + 150) | 0;
        this.maxLife = this.life;
    }
    update() {
        this.x += this.sx;
        this.y += this.sy;
        this.size += 0.1;
        this.life--;
        if (this.life <= 0 || this.y < -80) this.reset(false);
    }
    draw() {
        const a = (this.life / this.maxLife) * 0.06;
        if (a < 0.005) return;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#c8dcf0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ── FLOATING COMPONENT (azaltılmış) ──
class FloatingComp {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.w = (Math.random() * 25 + 12) | 0;
        this.h = (Math.random() * 12 + 8) | 0;
        this.a = Math.random() * 6.283;
        this.sx = (Math.random() - 0.5) * 0.5;
        this.sy = -(Math.random() * 0.3 + 0.1);
        this.ra = (Math.random() - 0.5) * 0.015;
    }
    update() {
        this.x += this.sx;
        this.y += this.sy;
        this.a += this.ra;
        if (this.x < -80) this.x = width + 80;
        if (this.x > width + 80) this.x = -80;
        if (this.y < -80) this.y = height + 80;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.a);
        ctx.fillStyle = 'rgba(20,20,30,0.3)';
        ctx.strokeStyle = 'rgba(0,243,255,0.2)';
        ctx.lineWidth = 1;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

// ── Nesne sayıları düşürüldü (110 → 40) ──
const sparks = Array.from({ length: 15 }, () => new Spark());
const smokes = Array.from({ length: 15 }, () => new Smoke());
const comps  = Array.from({ length: 10 }, () => new FloatingComp());

// ── FPS limiter (60fps yerine 30fps yeterli) ──
let lastFrame = 0;
const FRAME_MS = 33; // ~30fps

function animate(now) {
    if (!isVisible) { animId = null; return; }
    animId = requestAnimationFrame(animate);

    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < smokes.length; i++) { smokes[i].update(); smokes[i].draw(); }
    for (let i = 0; i < comps.length; i++)  { comps[i].update();  comps[i].draw(); }
    for (let i = 0; i < sparks.length; i++) { sparks[i].update(); sparks[i].draw(); }
}

// Spark üretici (interval artırıldı 300 → 500ms)
setInterval(() => {
    const amount = (Math.random() * 2 + 1) | 0;
    let spawned = 0;
    for (let i = 0; i < sparks.length && spawned < amount; i++) {
        if (sparks[i].life <= 0) { sparks[i].reset(); spawned++; }
    }
}, 500);

animate(0);
