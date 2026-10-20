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

  // The correction above the pill is ONE element that morphs, like the reference:
  // words peel off the stream and arc into a row → a lilac slash strikes the bad word → it collapses and the
  // neighbours are fixed in place → a green dot grows into a pill that swallows the row and shows the label
  // → the badge slides down behind the Flow pill (the box clips at the pill's top edge).
  const FIXES2 = [
    { words: [["on", "on."], ["so", null], ["can", "Can"]], label: "Split sentence" },
    { words: [["the", "the"], ["the", null], ["launch", "launch"]], label: "Removed repetition" },
    { words: [["um", null], ["can", "Can"], ["we", "we"]], label: "Removed filler" },
    { words: [["3", null], ["no", null], ["4", "4"]], label: "Kept your correction" },
    { words: [["priya", "Priya"]], label: "Fixed capitalisation" },
  ];
  const fixes = document.getElementById("fixes"), row = document.getElementById("frow"), slash = document.getElementById("fslash"),
    badge = document.getElementById("fbadge"), flabel = document.getElementById("flabel");
  const place = () => { const r = pill.querySelector(".shape").getBoundingClientRect(), h = document.querySelector(".hero").getBoundingClientRect();
    fixes.style.left = r.left - h.left + r.width / 2 + "px"; fixes.style.top = r.top - h.top + 3 + "px"; };
  place(); addEventListener("resize", place);
  const chars = (el, text) => { el.innerHTML = ""; [...text].forEach((ch) => { const c = document.createElement("span"); c.className = "c"; c.textContent = ch === " " ? "\u00a0" : ch; el.appendChild(c); }); return el.querySelectorAll(".c"); };
  let k = 0;
  const cycle = () => {
    const fx = FIXES2[k++ % FIXES2.length];
    row.innerHTML = ""; gsap.set(row, { opacity: 1 }); gsap.set(badge, { opacity: 0, width: 40, marginLeft: -20, y: 0, scale: 0 });
    const words = fx.words.map(([t]) => { const w = document.createElement("span"); w.className = "w"; chars(w, t); row.appendChild(w); return w; });
    const all = row.querySelectorAll(".c");
    const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(0.5, cycle) });
    // 1. letters arc up out of the stream (from bottom-left, where the raw text enters the pill)
    tl.fromTo(all, { x: -150, y: 70, rotation: -35, opacity: 0 }, { keyframes: [{ x: -40, y: -26, rotation: -10, opacity: 1, duration: 0.32, ease: "power2.out" }, { x: 0, y: 0, rotation: 0, duration: 0.42, ease: "back.out(2)" }], stagger: 0.035 });
    tl.to({}, { duration: 0.35 });
    // 2-3. strike each removed word, collapse it, then fix the neighbours in place
    fx.words.forEach(([t, to], i) => {
      if (to !== null) return;
      const w = words[i];
      tl.call(() => { const wr = w.getBoundingClientRect(), fr = fixes.getBoundingClientRect(); gsap.set(slash, { left: wr.left - fr.left + wr.width / 2, rotation: 28, scaleY: 0, y: 0, opacity: 1 }); gsap.set(w, { width: w.offsetWidth }); });
      tl.to(slash, { scaleY: 1, duration: 0.22, ease: "power2.out" });
      tl.to(w, { width: 0, paddingLeft: 0, paddingRight: 0, opacity: 0, duration: 0.4, ease: "power3.inOut" }, "+=0.25");
      tl.to(slash, { scaleY: 0.12, y: 16, opacity: 0, duration: 0.4, ease: "power2.in" }, "<");
    });
    fx.words.forEach(([t, to], i) => {
      if (to === null || to === t) return;
      const w = words[i];
      tl.to(w, { opacity: 0, y: -8, filter: "blur(4px)", duration: 0.14 }, "+=0.05").call(() => chars(w, to)).to(w, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "back.out(2)" });
    });
    tl.to({}, { duration: 0.6 });
    // 4. a green dot grows into a pill that swallows the row; the label rises in
    tl.call(() => { chars(flabel, fx.label); const ok = document.createElement("i"); ok.className = "ok"; ok.textContent = "✓"; flabel.prepend(ok); });
    tl.to(badge, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(3)" });
    tl.to(row, { opacity: 0, scale: 0.9, duration: 0.25 }, "<0.05");
    tl.call(() => { const wdt = flabel.scrollWidth + 40; gsap.to(badge, { width: wdt, marginLeft: -wdt / 2, duration: 0.5, ease: "expo.out" }); gsap.fromTo(flabel.querySelectorAll(".c, .ok"), { yPercent: 130, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.018, duration: 0.45, ease: "expo.out", delay: 0.12 }); });
    tl.to({}, { duration: 1.6 });
    // 5. tuck down into the Flow pill
    tl.to(badge, { y: 70, duration: 0.45, ease: "power3.in" });
  };
  gsap.delayedCall(1.2, cycle);

  // Headline letters rise in, and bounce one after another on hover.
  document.querySelectorAll(".split").forEach((el) => {
    const s = new SplitText(el, { type: "words,chars", wordsClass: "word", charsClass: "char" });
    gsap.from(s.chars, { yPercent: 110, opacity: 0, rotate: 6, duration: 0.9, ease: "expo.out", stagger: 0.025, scrollTrigger: { trigger: el, start: "top 88%" } });
    // gentle on the big hero headline, a little livelier on section headings
    const lift = el.closest(".hero") ? "-0.06em" : "-0.12em", spring = el.closest(".hero") ? "elastic.out(1,0.6)" : "elastic.out(1,0.45)";
    if (el.classList.contains("hov")) el.addEventListener("mouseenter", () =>
      gsap.fromTo(s.chars, { y: 0 }, { keyframes: [{ y: lift, duration: 0.2, ease: "power2.out" }, { y: 0, duration: 0.6, ease: spring }], stagger: 0.018, overwrite: "auto" }));
  });
  gsap.from([".hero .lede", ".hero .btn", ".hero .alt"], { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.5 });
  gsap.to(".hero .inner", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // app names drift by
  const m = document.getElementById("marquee"); m.innerHTML += m.innerHTML;
  gsap.to(m, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

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
  // the setup rail: fills with scroll, and each step pops to a check as the rail reaches it
  document.querySelectorAll("ol.steps").forEach((ol) => {
    const rail = document.createElement("div"); rail.className = "srail"; rail.innerHTML = "<b></b>"; ol.prepend(rail);
    const items = [...ol.querySelectorAll("li")];
    ScrollTrigger.create({ trigger: ol, start: "top 65%", end: "bottom 55%", scrub: true,
      onUpdate: (st) => {
        gsap.set(rail.firstChild, { scaleY: st.progress });
        items.forEach((li, j) => { const on = st.progress >= (j + 0.5) / items.length; if (on !== li.classList.contains("done")) { li.classList.toggle("done", on); gsap.fromTo(li, { scale: on ? 0.97 : 1 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)" }); } });
      } });
  });
  // re-measure pinned scenes once fonts and layout settle (avoids stale positions)
  addEventListener("load", () => ScrollTrigger.refresh());
  gsap.from(".faq", { y: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".faq", start: "top 85%" } });
  gsap.from(".final", { scale: 0.9, borderRadius: 90, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "top 40%", scrub: true } });
  const w = new SplitText("#wordmark", { type: "chars", charsClass: "char" });
  gsap.from(w.chars, { yPercent: 100, opacity: 0, stagger: 0.04, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: "footer", start: "top 85%" } });
  gsap.from(".fpill", { scale: 0, rotate: -20, duration: 1.1, ease: "elastic.out(1,0.5)", delay: 0.4, scrollTrigger: { trigger: "footer", start: "top 85%" } });
  gsap.to(".fpill i", { scaleY: () => 0.35 + Math.random() * 1.4, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: -1, repeatRefresh: true, stagger: 0.03 });
}
