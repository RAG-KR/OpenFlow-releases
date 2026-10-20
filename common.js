// Shared by every page: download links, OS detection, confetti, nav + buttons.
const BASE = "https://github.com/RAG-KR/OpenFlow-releases/releases/latest/download/";
const DL = {
  mac: BASE + "Open-Flow-mac-apple-silicon.dmg",
  intel: BASE + "Open-Flow-mac-intel.dmg",
  win: BASE + "Open-Flow-windows-setup.exe",
};
const UA = navigator.userAgent;
const IS_WIN = /Windows/.test(UA);
const IS_MAC = /Macintosh|Mac OS X/.test(UA);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".dl-label").forEach((s) => (s.textContent = IS_WIN ? "Download for Windows" : IS_MAC ? "Download for Mac" : "Download"));
document.querySelectorAll(".dl-mac").forEach((a) => (a.href = DL.mac));
document.querySelectorAll(".dl-intel").forEach((a) => (a.href = DL.intel));
document.querySelectorAll(".dl-win").forEach((a) => (a.href = DL.win));

// Confetti burst from a point (tiny canvas particle system, no library).
function confetti(x, y) {
  if (REDUCED) return;
  const c = document.getElementById("confetti");
  if (!c) return;
  const ctx = c.getContext("2d");
  c.width = innerWidth * devicePixelRatio;
  c.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const colors = ["#e8cdf7", "#9b6fc4", "#1f6b4f", "#141413", "#f2b84b", "#ee8a8a"];
  const parts = Array.from({ length: 90 }, () => {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 8;
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, c: colors[(Math.random() * colors.length) | 0], life: 1 };
  });
  (function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of parts) {
      if (p.life <= 0) continue;
      alive++;
      p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.012;
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

// Real download links: confetti, then the file starts.
document.querySelectorAll("a.dl-mac, a.dl-intel, a.dl-win, a.dl-go").forEach((a) =>
  a.addEventListener("click", (e) => confetti(e.clientX, e.clientY)),
);

if (window.gsap && !REDUCED) {
  // nav drops in, and a soft shadow appears once the page scrolls
  gsap.from("#nav", { y: -80, opacity: 0, duration: 1, ease: "expo.out", delay: 0.15 });
  gsap.from("#nav > *", { y: -12, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, delay: 0.3 });
  addEventListener("scroll", () => document.getElementById("nav").classList.toggle("scrolled", scrollY > 30), { passive: true });

  // buttons: a fill wipes up on hover and the button leans toward the cursor
  document.querySelectorAll(".btn").forEach((b) => {
    const fill = b.querySelector(".fill");
    b.addEventListener("mouseenter", () => fill && gsap.to(fill, { y: "0%", duration: 0.45, ease: "expo.out" }));
    b.addEventListener("mouseleave", () => {
      fill && gsap.to(fill, { y: "-101%", duration: 0.45, ease: "expo.out", onComplete: () => gsap.set(fill, { y: "101%" }) });
      gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    });
    b.addEventListener("mousemove", (e) => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.15, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3 });
    });
    b.addEventListener("mousedown", () => gsap.to(b, { scale: 0.95, duration: 0.1 }));
    b.addEventListener("mouseup", () => gsap.to(b, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" }));
  });
}

// "Coming soon" dropdown
const soonBtn = document.getElementById("soon-btn"), soon = document.getElementById("soon-panel");
if (soonBtn && soon) {
  let open = false;
  const set = (v) => {
    open = v;
    soonBtn.setAttribute("aria-expanded", v);
    if (window.gsap && !REDUCED) {
      gsap.to(soon, { autoAlpha: v ? 1 : 0, y: v ? 0 : -8, duration: 0.35, ease: "expo.out" });
      if (v) gsap.fromTo(soon.querySelectorAll(".item"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.45, ease: "expo.out" });
    } else soon.style.visibility = v ? "visible" : "hidden", (soon.style.opacity = v ? 1 : 0);
  };
  soonBtn.addEventListener("click", (e) => { e.stopPropagation(); set(!open); });
  soonBtn.parentElement.addEventListener("mouseenter", () => set(true));
  soonBtn.parentElement.addEventListener("mouseleave", () => set(false));
  document.addEventListener("click", () => open && set(false));
}
