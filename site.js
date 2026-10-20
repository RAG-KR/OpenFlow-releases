// Open Flow site: download links + GSAP motion (ScrollTrigger + SplitText).
const BASE = "https://github.com/RAG-KR/OpenFlow-releases/releases/latest/download/";
const DL = {
  mac: BASE + "Open-Flow-mac-apple-silicon.dmg",
  intel: BASE + "Open-Flow-mac-intel.dmg",
  win: BASE + "Open-Flow-windows-setup.exe",
};
const ua = navigator.userAgent;
const isWin = /Windows/.test(ua);
const isMac = /Macintosh|Mac OS X/.test(ua);
const primary = isWin ? DL.win : isMac ? DL.mac : null;
document.querySelectorAll(".dl").forEach((a) => primary && (a.href = primary));
document.querySelectorAll(".dl-label").forEach((s) => (s.textContent = isWin ? "Download for Windows" : isMac ? "Download for Mac" : "Download"));
document.querySelectorAll(".dl-mac").forEach((a) => (a.href = DL.mac));
document.querySelectorAll(".dl-intel").forEach((a) => (a.href = DL.intel));
document.querySelectorAll(".dl-win").forEach((a) => (a.href = DL.win));
document.getElementById("alt").innerHTML = isWin
  ? `Also for <a href="${DL.mac}">Mac</a>`
  : `Apple Silicon. <a href="${DL.intel}">Intel Mac</a> · <a href="${DL.win}">Windows</a>`;

const tabs = { mac: document.getElementById("tab-mac"), win: document.getElementById("tab-win") };
const show = (os) => {
  tabs.mac.setAttribute("aria-selected", os === "mac");
  tabs.win.setAttribute("aria-selected", os === "win");
  document.getElementById("steps-mac").hidden = os !== "mac";
  document.getElementById("steps-win").hidden = os !== "win";
};
tabs.mac.onclick = () => show("mac");
tabs.win.onclick = () => show("win");
show(isWin ? "win" : "mac");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (window.gsap && !reduced) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Headlines: letters rise in on scroll, and bounce one after another on hover.
  document.querySelectorAll(".split").forEach((el) => {
    const s = new SplitText(el, { type: "chars", charsClass: "char" });
    gsap.from(s.chars, {
      yPercent: 110, opacity: 0, rotate: 6, duration: 0.9, ease: "expo.out", stagger: 0.025,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
    if (el.classList.contains("hov")) {
      el.addEventListener("mouseenter", () => {
        gsap.fromTo(s.chars, { y: 0 }, {
          keyframes: [{ y: "-0.22em", duration: 0.18, ease: "power2.out" }, { y: 0, duration: 0.7, ease: "elastic.out(1.1, 0.35)" }],
          stagger: 0.022, overwrite: true,
        });
      });
    }
  });
  gsap.utils.toArray(".reveal").forEach((el) =>
    gsap.from(el, { y: 26, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }),
  );

  // Hero: the spoken words stream along the curve into the bar; the bar breathes.
  // (startOffset in user units: percentages below 0 don't render)
  const path = document.getElementById("rp"), rt = document.getElementById("rt");
  const L = path.getTotalLength(), T = rt.getComputedTextLength();
  const o = { v: -T };
  gsap.to(o, { v: L * 0.62, duration: 22, ease: "none", repeat: -1, onUpdate: () => rt.setAttribute("startOffset", o.v) });
  gsap.to(".flowbar i", { scaleY: () => gsap.utils.random(1.4, 3.2), duration: 0.32, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.06, from: "center" } });
  gsap.to(".hero .inner", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".flowbar", { y: 90, scale: 0.85, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // App names drift by.
  const m = document.getElementById("marquee");
  m.innerHTML += m.innerHTML;
  gsap.to(m, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

  // Speed: counters and bars fill when the section arrives.
  ScrollTrigger.create({
    trigger: ".meters", start: "top 75%", once: true,
    onEnter: () => {
      document.querySelectorAll(".count").forEach((c) => {
        const o = { v: 0 };
        gsap.to(o, { v: +c.dataset.to, duration: 1.8, ease: "power3.out", onUpdate: () => (c.textContent = Math.round(o.v)) });
      });
      document.querySelectorAll(".meter .bar b").forEach((b) => gsap.to(b, { width: b.dataset.w + "%", duration: 1.8, ease: "power3.out" }));
    },
  });

  // Features: pinned, scroll moves the cards sideways; each card tilts into place.
  const track = document.getElementById("track");
  const dist = () => track.scrollWidth - innerWidth + 56;
  gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: ".features", start: "top top", end: () => "+=" + dist(), pin: ".features", scrub: 0.6, invalidateOnRefresh: true },
  });
  gsap.from(".fcard", { rotate: 4, y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".track-wrap", start: "top 85%" } });

  // Final band scales up; the wordmark rises letter by letter.
  gsap.from(".final", { scale: 0.92, borderRadius: 80, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "top 40%", scrub: true } });
  const w = new SplitText("#wordmark", { type: "chars", charsClass: "char" });
  gsap.from(w.chars, { yPercent: 100, stagger: 0.04, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: "footer", start: "top 85%" } });
}
