// Home page motion. Needs common.js (DL, REDUCED, confetti) and GSAP.
const RAW = "so um I was talking to priya earlier and the the reception was really bad, um, can we push the sync to friday at three no actually four, and uh loop in the design team too, I think the deck is mostly done so ";
const CLEAN = "I was talking to Priya earlier, but the reception was really bad. Can we push the sync to Friday at 4 and loop in the design team? I think the deck is mostly done. ";
const FIXES = [["Umm", "Removed filler"], ["the the", "Removed repetition"], ["3 no 4", "Kept your correction"], ["priya", "Fixed capitalisation"], ["…so", "Split sentence"]];

// tabs (install)
const tabs = { mac: document.getElementById("tab-mac"), win: document.getElementById("tab-win") };
const show = (os) => {
  tabs.mac.setAttribute("aria-selected", os === "mac"); tabs.win.setAttribute("aria-selected", os === "win");
  document.getElementById("steps-mac").hidden = os !== "mac"; document.getElementById("steps-win").hidden = os !== "win";
};
tabs.mac.onclick = () => show("mac"); tabs.win.onclick = () => show("win"); show(IS_WIN ? "win" : "mac");

// FAQ: questions on the left, answer on the right
const QA = [
  ["Is it really free?", "Yes. Speech recognition runs on your computer, and AI cleanup uses your own free Groq key."],
  ["What happens to my voice?", "It's turned into text on your computer and never uploaded. With AI cleanup on, only the text goes to Groq. History stays on your computer for two weeks."],
  ["Does it work in every app?", "Anywhere you can type: email, chat, docs, code editors, the terminal. Hold the keys, speak, let go."],
  ["Why does my Mac say it can't check the app?", "The beta isn't notarized by Apple yet. System Settings → Privacy & Security → Open Anyway, once."],
  ["It didn't type anything.", "Check that Open Flow has Microphone and Accessibility permission, then quit and reopen it."],
];
const qs = document.getElementById("qs"), ans = document.querySelector("#answer span");
QA.forEach(([q, a], i) => {
  const b = document.createElement("button"); b.className = "q" + (i ? "" : " on"); b.textContent = q;
  b.onclick = () => {
    qs.querySelectorAll(".q").forEach((x) => x.classList.toggle("on", x === b));
    if (window.gsap && !REDUCED) gsap.fromTo(ans, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" });
    ans.textContent = a;
  };
  qs.appendChild(b);
});
ans.textContent = QA[0][1];

// hero: the pill links to the download page
const pill = document.getElementById("pill");
pill.addEventListener("click", () => (location.href = "download.html"));

// pill waveform bars (SVG)
const bars = pill.querySelector(".bars");
const N = 15;
for (let i = 0; i < N; i++) {
  const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  r.setAttribute("x", 666 + i * 8.4); r.setAttribute("y", 748); r.setAttribute("width", 3.6); r.setAttribute("height", 24); r.setAttribute("rx", 1.8);
  bars.appendChild(r);
}
const tRaw = document.getElementById("tRaw"), tClean = document.getElementById("tClean");
tRaw.textContent = RAW.repeat(6);
tClean.textContent = CLEAN.repeat(6);

if (window.gsap && !REDUCED) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // A never-ending stream: raw speech runs along the curve into the pill and leaves as clean text on the
  // black ribbon. Each loop moves exactly one copy of the sentence, so it repeats seamlessly.
  const stream = (el, copyLen, secs) => {
    const o = { v: -copyLen };
    gsap.to(o, { v: 0, duration: secs, ease: "none", repeat: -1, onUpdate: () => el.setAttribute("startOffset", o.v) });
  };
  document.fonts.ready.then(() => {
    const per = (el) => el.getComputedTextLength() / 6; // length of one copy
    stream(tRaw, per(tRaw), 34);
    stream(tClean, per(tClean), 34 * (per(tClean) / per(tRaw)));
  });

  // waveform: bars dance, louder in the middle
  pill.querySelectorAll(".bars rect").forEach((r, i) => {
    const mid = 1 - Math.abs(i - (N - 1) / 2) / (N / 2);
    gsap.to(r, { scaleY: () => 0.5 + Math.random() * (1 + mid * 1.4), transformOrigin: "50% 50%", duration: 0.22 + Math.random() * 0.2, ease: "sine.inOut", yoyo: true, repeat: -1, repeatRefresh: true });
  });
  pill.addEventListener("mouseenter", () => gsap.to(pill, { scale: 1.06, svgOrigin: "725 760", duration: 0.5, ease: "elastic.out(1,0.5)" }));
  pill.addEventListener("mouseleave", () => gsap.to(pill, { scale: 1, svgOrigin: "725 760", duration: 0.5, ease: "elastic.out(1,0.5)" }));

  // Corrections above the pill: the raw bit pops up, wobbles, falls away, then a green badge confirms the fix.
  const fixes = document.getElementById("fixes"), word = document.getElementById("fixword"), badge = document.getElementById("fixbadge"), ftext = document.getElementById("fixtext");
  const place = () => { const r = pill.querySelector(".shape").getBoundingClientRect(), h = document.querySelector(".hero").getBoundingClientRect(); fixes.style.left = r.left - h.left + r.width / 2 + "px"; fixes.style.top = r.top - h.top - 14 + "px"; };
  place(); addEventListener("resize", place);
  let k = 0;
  const cycle = () => {
    const [w, t] = FIXES[k++ % FIXES.length];
    word.textContent = w; ftext.textContent = t;
    gsap.timeline({ onComplete: () => gsap.delayedCall(0.6, cycle) })
      .fromTo(word, { y: 20, opacity: 0, rotate: -8, scale: 0.8 }, { y: 0, opacity: 1, rotate: 4, scale: 1, duration: 0.5, ease: "back.out(2.5)" })
      .to(word, { rotate: -4, duration: 0.25, yoyo: true, repeat: 2, ease: "sine.inOut" })
      .to(word, { y: 30, opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" }, "+=0.2")
      .fromTo(badge, { y: 12, opacity: 0, scale: 0.8 }, { y: -6, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.1")
      .to(badge, { opacity: 0, y: -18, duration: 0.4, ease: "power2.in" }, "+=1.1");
  };
  gsap.delayedCall(1.2, cycle);

  // Headline letters rise in, and bounce one after another on hover.
  document.querySelectorAll(".split").forEach((el) => {
    const s = new SplitText(el, { type: "chars", charsClass: "char" });
    gsap.from(s.chars, { yPercent: 110, opacity: 0, rotate: 6, duration: 0.9, ease: "expo.out", stagger: 0.025, scrollTrigger: { trigger: el, start: "top 88%" } });
    if (el.classList.contains("hov")) el.addEventListener("mouseenter", () =>
      gsap.fromTo(s.chars, { y: 0 }, { keyframes: [{ y: "-0.22em", duration: 0.18, ease: "power2.out" }, { y: 0, duration: 0.7, ease: "elastic.out(1.1,0.35)" }], stagger: 0.022, overwrite: true }));
  });
  gsap.from([".hero .lede", ".hero .btn", ".hero .alt"], { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.5 });
  gsap.to(".hero .inner", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // app names drift by
  const m = document.getElementById("marquee"); m.innerHTML += m.innerHTML;
  gsap.to(m, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

  // speed: counters + bars
  ScrollTrigger.create({ trigger: ".meters", start: "top 75%", once: true, onEnter: () => {
    document.querySelectorAll(".count").forEach((c) => { const o = { v: 0 }; gsap.to(o, { v: +c.dataset.to, duration: 1.8, ease: "power3.out", onUpdate: () => (c.textContent = Math.round(o.v)) }); });
    document.querySelectorAll(".meter .bar b").forEach((b) => gsap.to(b, { width: b.dataset.w + "%", duration: 1.8, ease: "power3.out" }));
  } });
  gsap.from(".meter", { y: 60, opacity: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".meters", start: "top 85%" } });

  // How it works: pinned; scrolling steps through three moments while the swoosh draws.
  const STEPS = [
    ["Speak naturally", "Ramble, pause, change your mind mid-sentence. Open Flow understands what you mean.", "so um can we meet friday at 3 no actually 4"],
    ["Edits as you speak", "Fillers go, punctuation and lists appear, and your corrections are kept.", "Can we meet Friday at 4?"],
    ["Use it anywhere", "Mail, Slack, docs, the terminal. If you can type there, you can talk there.", "Can we meet Friday at 4? I'll send the agenda tonight."],
  ];
  const idx = document.querySelectorAll(".how .index div"), h3 = document.querySelector("#howcopy h3"), hp = document.querySelector("#howcopy p"), field = document.getElementById("howfield");
  let cur = -1;
  const setStep = (i) => {
    if (i === cur) return; cur = i;
    idx.forEach((d, j) => d.classList.toggle("on", j === i));
    gsap.fromTo("#howcopy", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
    h3.textContent = STEPS[i][0]; hp.textContent = STEPS[i][1];
    const t = STEPS[i][2], o = { n: 0 };
    gsap.to(o, { n: t.length, duration: 0.9, ease: "none", onUpdate: () => (field.textContent = t.slice(0, Math.round(o.n))) });
  };
  setStep(0);
  const sw = document.getElementById("swoosh"), L = sw.getTotalLength();
  gsap.set(sw, { strokeDasharray: L, strokeDashoffset: L });
  gsap.timeline({ scrollTrigger: { trigger: ".how", start: "top top", end: "+=1800", pin: true, scrub: 0.6, onUpdate: (st) => setStep(Math.min(2, Math.floor(st.progress * 3))) } })
    .to(sw, { strokeDashoffset: 0, ease: "none" })
    .fromTo(".how .shot", { rotate: -3, scale: 0.94 }, { rotate: 2, scale: 1, ease: "none" }, 0);

  // Feature cards: rise in a wave, tilt toward the cursor, and play their before → after.
  gsap.from(".fcard", { y: 80, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".grid3", start: "top 80%" } });
  document.querySelectorAll(".fcard").forEach((c) => {
    c.addEventListener("mousemove", (e) => { const r = c.getBoundingClientRect(); gsap.to(c, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 12, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 12, y: -6, duration: 0.4, ease: "power2.out" }); });
    c.addEventListener("mouseleave", () => gsap.to(c, { rotateX: 0, rotateY: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.5)" }));
    const d = c.querySelector(".demo");
    const play = () => {
      d.innerHTML = `<span class="del">${d.dataset.raw}</span>`;
      gsap.timeline().from(d.firstChild, { opacity: 0, duration: 0.3 })
        .call(() => { const s = document.createElement("span"); s.className = "add"; s.textContent = " " + d.dataset.clean; d.appendChild(s); gsap.from(s, { opacity: 0, filter: "blur(6px)", y: 6, duration: 0.6, ease: "expo.out" }); }, null, "+=0.7");
    };
    d.innerHTML = `<span class="add">${d.dataset.clean}</span>`;
    ScrollTrigger.create({ trigger: c, start: "top 75%", once: true, onEnter: play });
    c.addEventListener("mouseenter", play);
  });

  gsap.from("ol.steps li", { x: -30, opacity: 0, stagger: 0.07, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: "#install", start: "top 70%" } });
  gsap.from(".faq", { y: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".faq", start: "top 85%" } });
  gsap.from(".final", { scale: 0.9, borderRadius: 90, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "top 40%", scrub: true } });
  const w = new SplitText("#wordmark", { type: "chars", charsClass: "char" });
  gsap.from(w.chars, { yPercent: 100, stagger: 0.04, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: "footer", start: "top 85%" } });
}
