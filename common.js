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

// Real download links: confetti, the file starts, then a heads-up card about the one-time OS warning.
// Delegated, so links added later (download.html builds its buttons) are covered too.
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a");
  if (!a || ![DL.mac, DL.intel, DL.win].includes(a.href)) return;
  confetti(e.clientX, e.clientY);
  setTimeout(() => headsUp(a.href === DL.win ? "win" : "mac"), 900);
});

const HEADS_UP = {
  mac: {
    title: "macOS will warn you once. That's expected.",
    why: "It says <b>\u201cApple could not verify Open Flow is free of malware.\u201d</b> That's only because I haven't paid for Apple's $99/year developer account yet. The app is safe, and you only do this once:",
    steps: [
      "Open the file and drag Open Flow into <b>Applications</b>, then open it.",
      "When the warning appears, click <b>Done</b>. <b>Not \u201cMove to Trash\u201d.</b>",
      "Open <b>System Settings \u2192 Privacy &amp; Security</b>, scroll down and click <b>Open Anyway</b>.",
      "Open Open Flow again and click <b>Open Anyway</b> once more. Done for good.",
    ],
    key: 1,
  },
  win: {
    title: "Windows will warn you once. That's expected.",
    why: "It says <b>\u201cWindows protected your PC.\u201d</b> That's only because the app isn't signed with a paid Microsoft certificate yet. The app is safe, and you only do this once:",
    steps: [
      "Run the installer you just downloaded.",
      "On the blue \u201cWindows protected your PC\u201d screen, click <b>More info</b>.",
      "Click <b>Run anyway</b>, then allow the microphone when asked.",
    ],
    key: 1,
  },
};

function headsUp(os) {
  const c = HEADS_UP[os];
  let el = document.getElementById("hu");
  if (!el) {
    el = document.createElement("div");
    el.id = "hu";
    el.className = "hu";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    document.body.appendChild(el);
    el.addEventListener("click", (e) => (e.target === el || e.target.closest(".hu-ok")) && (el.hidden = true));
    addEventListener("keydown", (e) => e.key === "Escape" && (el.hidden = true));
  }
  el.innerHTML = `<div class="hu-card"><div class="eyebrow">Before you open it</div><h2>${c.title}</h2><p>${c.why}</p>
    <ol class="hu-steps">${c.steps.map((s, i) => `<li${i === c.key ? ' class="key"' : ""}>${s}</li>`).join("")}</ol>
    <button class="hu-ok">Got it</button><span class="hu-glare"></span></div>`;
  el.hidden = false;
  const card = el.querySelector(".hu-card");
  el.querySelector(".hu-ok").focus();
  if (!window.gsap || REDUCED) return;
  // intro: rises and settles; then tilts toward the cursor with a glare that follows it
  gsap.fromTo(card, { y: 40, rotateX: 16, opacity: 0, scale: 0.96 }, { y: 0, rotateX: 0, opacity: 1, scale: 1, duration: 0.9, ease: "elastic.out(1,0.75)" });
  const rx = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3" });
  const ry = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3" });
  card.onpointermove = (e) => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
    rx(-ny * 8);
    ry(nx * 8);
    card.style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
    card.style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
    card.style.setProperty("--g", "1");
  };
  card.onpointerleave = () => {
    rx(0);
    ry(0);
    card.style.setProperty("--g", "0");
  };
}

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
