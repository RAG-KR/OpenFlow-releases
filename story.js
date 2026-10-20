// One pinned scene, driven by scroll: keyboard vs Open Flow → the Open Flow card takes over → it shrinks
// into the "how it works" device → three steps, with background ribbons drawing in and out.
(() => {
  if (!window.gsap || REDUCED) return;
  const $ = (q) => document.querySelector(q);
  const W = () => innerWidth, H = () => innerHeight;

  // looping text: slow typing on the left, fast speech through the pill on the right
  const SPOKEN = "Alright, got the structure ready. Want to walk me through what you're building, or start with a template? Up to you, I'll follow your lead. ";
  // One sentence, two speeds: it crawls left→right through the keyboard card at 45 wpm and runs on through
  // the Open Flow card at 220 wpm (220/45 ≈ 4.9× faster), at the same height so it reads as one string.
  const FAST = 270; // px per second along the arc
  const SLOW = FAST * (45 / 220);
  const crawl = $("#crawl"), arct = $("#arct"), arcp = $("#arcp"), arcsvg = document.querySelector(".of svg.arc");
  crawl.textContent = SPOKEN.repeat(8);
  arct.textContent = SPOKEN.repeat(8);
  // the arc is drawn in real pixels of the card's current size, so text never stretches when the card grows
  const ofEl = document.querySelector(".scard.of");
  const drawArc = () => {
    // the reference curve: enters at the keyboard text's height, a gentle hump, leaves a little lower
    const w = ofEl.offsetWidth, h = ofEl.offsetHeight, y = h * 0.56;
    arcsvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    arcp.setAttribute("d", `M -4 ${y} C ${w * 0.3} ${y - h * 0.15}, ${w * 0.62} ${y - h * 0.16}, ${w + 10} ${y - h * 0.02}`);
  };
  document.fonts.ready.then(() => {
    const one = arct.getComputedTextLength() / 8;
    const c1 = { v: -one }, c2 = { x: 0 };
    gsap.to(c1, { v: 0, duration: one / FAST, ease: "none", repeat: -1, onUpdate: () => arct.setAttribute("startOffset", c1.v) });
    const cw = crawl.scrollWidth / 8;
    gsap.fromTo(c2, { x: -cw }, { x: 0, duration: cw / SLOW, ease: "none", repeat: -1, onUpdate: () => (crawl.style.transform = `translateX(${c2.x}px)`) });
  });
  gsap.ticker.add(drawArc);
  gsap.to("#spill i", { scaleY: () => 0.4 + Math.random() * 1.5, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: -1, repeatRefresh: true, stagger: 0.03 });

  // card layouts (px), recomputed on resize
  const side = () => { const w = Math.min(860, W() * 0.86), h = Math.min(520, H() * 0.56); return { top: H() * 0.36, h, kbw: w * 0.3, ofw: w * 0.68, left: (W() - w) / 2 }; };
  const L0 = side();
  gsap.set(".scard.kb", { left: L0.left, top: L0.top, width: L0.kbw, height: L0.h });
  gsap.set(".scard.of", { left: L0.left + L0.kbw + L0.ofw * 0.03, top: L0.top, width: L0.ofw, height: L0.h });

  // ribbons start undrawn
  const sw1 = $("#sw1"), sw2 = $("#sw2"), l1 = sw1.getTotalLength(), l2 = sw2.getTotalLength();
  gsap.set(sw1, { strokeDasharray: l1, strokeDashoffset: l1 });
  gsap.set(sw2, { strokeDasharray: l2, strokeDashoffset: -l2 }); // draws in from its far (right) end

  // step content (not scrubbed: each step plays its own little scene)
  const STEPS = [
    ["Speak naturally", "Ramble, pause, or change your mind mid-sentence. Open Flow understands what you mean, not just what you say."],
    ["Edits as you speak", "Text that reads like you wrote it. Fillers go, punctuation appears, and the corrections you made out loud are kept."],
    ["Use it anywhere", "Mail, Slack, docs, the terminal. If you can type there, you can talk there. No plugins."],
  ];
  const RAW = 'Hey <span class="hl">so um</span> can you <span class="hl">actually wait</span> can you tell the team that <span class="hl">the the</span> launch is gonna slip <span class="hl">I think to like</span> not <span class="hl">Friday the following</span> Monday because we\'re';
  const CLEAN = "Can you let the team know the launch is slipping to Monday? We're still waiting on legal to sign off on the new terms page.";
  const MAIL = "Hi Marcus,<br /><br />Can you let the team know the launch is slipping to Monday?<br /><br />We're still waiting on legal to sign off on the new terms page. We'll have a firm timeline by Thursday.";
  let cur = -1, stepTl = null;
  const setStep = (i) => {
    if (i === cur) return; cur = i;
    stepTl && stepTl.kill();
    document.querySelectorAll("#sindex div").forEach((d, j) => d.classList.toggle("on", j === i));
    gsap.fromTo("#scopy", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
    $("#scopy h3").textContent = STEPS[i][0]; $("#scopy p").textContent = STEPS[i][1];
    if (i === 0) {
      $("#sraw").innerHTML = RAW;
      stepTl = gsap.timeline().to("#sfield", { opacity: 0, duration: 0.25 }).fromTo("#sraw", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" })
        .to("#spill .x, #spill .ok", { width: 22, opacity: 1, duration: 0.4, ease: "back.out(2)" }, "<")
        .fromTo("#stag", { opacity: 0, y: 8, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2.5)" }, "+=0.4");
    } else {
      $("#sfieldt").innerHTML = i === 1 ? CLEAN : MAIL;
      stepTl = gsap.timeline().to("#sraw, #stag", { opacity: 0, duration: 0.25 }).to("#spill .x, #spill .ok", { width: 0, opacity: 0, duration: 0.3 }, "<")
        .fromTo("#sfield", { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" })
        .from("#sfieldt", { opacity: 0, filter: "blur(6px)", duration: 0.6, ease: "expo.out" }, "-=0.4");
    }
  };

  const portrait = () => { const w = Math.min(400, W() * 0.8), h = Math.min(470, H() * 0.62); return { left: (W() - w) / 2, top: H() * 0.3, width: w, height: h }; };
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: ".story", start: "top top", end: "+=5600", pin: true, scrub: 0.7, invalidateOnRefresh: true,
      onUpdate: (st) => {
        // steps begin only once the card has become the device (label "D"); before that, clear every step
        // visual so nothing from step 1 is left on the big card when scrolling back up
        const t = st.progress * tl.duration(), d = tl.labels.D, span = (tl.duration() - d) / 3;
        if (t < d) {
          if (cur !== -1) { cur = -1; stepTl && stepTl.kill(); gsap.to("#scopy, #sraw, #stag, #sfield", { opacity: 0, duration: 0.2, overwrite: "auto" }); gsap.to("#spill .x, #spill .ok", { width: 0, opacity: 0, duration: 0.2, overwrite: "auto" }); }
        } else setStep(Math.min(2, Math.floor((t - d) / span)));
      },
    },
  });
  tl.to({}, { duration: 0.6 }) // a beat to read the comparison
    // B: Open Flow takes over, the keyboard card collapses
    .to(".scard.kb", { width: 0, opacity: 0, left: () => side().left - 40, duration: 1 }, "B")
    .to(".scard.of", { left: () => W() * 0.05, top: () => H() * 0.1, width: () => W() * 0.9, height: () => H() * 0.82, duration: 1 }, "B")
    .to(".s-head1", { y: -80, opacity: 0, duration: 0.8 }, "B")
    // C: it shrinks into the device; green gives way to cream; the arc and speed labels go
    .to(".scard.of", { ...{ left: () => portrait().left, top: () => portrait().top, width: () => portrait().width, height: () => portrait().height }, borderRadius: 22, duration: 1.2 }, "C")
    .to(".of .lbl, .of svg.arc", { opacity: 0, duration: 0.5 }, "C")
    .to(".bgg", { opacity: 0, duration: 1 }, "C")
    .fromTo(".s-head2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "C+=0.3")
    // D: steps; the headline makes room, the index appears; ribbons draw in and out
    .to(".s-head2", { opacity: 0, y: -60, duration: 0.6 }, "D")
    .to("#sindex", { opacity: 1, duration: 0.5 }, "D")
    .to(sw1, { strokeDashoffset: 0, duration: 1.2, ease: "none" }, "D")
    .to(sw1, { strokeDashoffset: l1, duration: 1, ease: "none" }, "E")
    .to(sw2, { strokeDashoffset: 0, duration: 1, ease: "none" }, "E")
    .to({}, { duration: 0.4 })
    .to(sw2, { strokeDashoffset: -l2, duration: 1, ease: "none" }, "F")
    .to(".scard.of", { scale: 0.96, duration: 1 }, "F");

  // speed numbers count up the first time the scene shows
  ScrollTrigger.create({ trigger: ".story", start: "top 70%", once: true, onEnter: () =>
    document.querySelectorAll(".story .count").forEach((c) => { const o = { v: 0 }; gsap.to(o, { v: +c.dataset.to, duration: 1.6, ease: "power3.out", onUpdate: () => (c.textContent = Math.round(o.v)) }); }) });
})();
