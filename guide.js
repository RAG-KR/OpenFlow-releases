// The app's first-run pill guide, recreated: five steps, each with a small looping demo.
(() => {
  const $ = (q) => document.querySelector(q);
  if (!$("#gcard")) return;
  const KEY = IS_WIN ? ["Ctrl", "Space"] : ["⌥", "Space"];
  const READ = IS_WIN ? "Ctrl Alt Space" : "⌃ ⌥ Space";
  const UNDO = IS_WIN ? "Ctrl Alt Z" : "⌃ ⌥ Z";
  const bars = (n) => Array.from({ length: n }, () => "<i></i>").join("");
  const STEPS = [
    { title: "Hold to talk, let go to paste", body: `Hold ${KEY.join(" ")} anywhere, speak naturally, release. Try it in any app.`,
      html: `<div class="gline"><span class="gkeys">${KEY.map((k) => `<kbd>${k}</kbd>`).join("")}</span><span class="gmini" style="width:34px">${bars(6)}</span></div>`,
      play: (tl) => { const keys = (on) => document.querySelectorAll(".gkeys kbd").forEach((k) => k.classList.toggle("on", on)); tl.call(() => keys(true)).to(".gmini", { width: 86, duration: 0.5, ease: "back.out(2)" }).to(".gmini i", { scaleY: () => 0.4 + Math.random() * 1.6, duration: 0.2, yoyo: true, repeat: 7, stagger: 0.03 }, "<")
        .call(() => keys(false)).to(".gmini", { width: 34, duration: 0.4, ease: "power2.inOut" }).to(".gmini i", { scaleY: 0.3, duration: 0.2 }, "<").to({}, { duration: 0.5 }); } },
    { title: "Or click the bar", body: "Click the bar to dictate hands-free. Click again, or press stop, when you're done.",
      html: `<div class="gline"><span class="gmini" style="width:40px;height:8px;opacity:.6">${bars(6)}</span><svg class="gcursor" viewBox="0 0 12 16"><path d="M1 1v12l3.2-3 2.3 5 2-1-2.3-4.8H10z" fill="#fcfcfb" stroke="#000"/></svg></div>`,
      play: (tl) => { tl.fromTo(".gcursor", { x: 70, y: 40 }, { x: 0, y: 6, duration: 0.6, ease: "power2.out" }).to(".gcursor", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to(".gmini", { width: 96, height: 28, opacity: 1, duration: 0.5, ease: "back.out(2)" }).to(".gmini i", { scaleY: () => 0.4 + Math.random() * 1.6, duration: 0.2, yoyo: true, repeat: 7, stagger: 0.03 }, "<")
        .to(".gmini", { width: 40, height: 8, opacity: 0.6, duration: 0.4 }).set(".gcursor", { x: 70, y: 40 }); } },
    { title: "Have anything read to you", body: `Select text in any app and press ${READ}. Press again to stop.`,
      html: `<div class="gline"><span class="gsel"><b></b><span>Select any text</span></span><span class="gmini" style="width:56px;opacity:.4">${bars(7)}</span></div>`,
      play: (tl) => { tl.to(".gsel b", { scaleX: 1, duration: 0.6, ease: "power2.out" }).to(".gmini", { opacity: 1, duration: 0.2 }).to(".gmini i", { scaleY: () => 0.4 + Math.random() * 1.6, duration: 0.2, yoyo: true, repeat: 9, stagger: 0.03 }, "<")
        .to(".gsel b", { scaleX: 0, duration: 0.4 }).to(".gmini", { opacity: 0.4, duration: 0.3 }, "<"); } },
    { title: "Want your exact words back?", body: `${UNDO} swaps the cleaned-up text for exactly what you said.`,
      html: `<div class="gline" style="font-size:16px"><span id="gswap">Let's meet at 4.</span></div>`,
      play: (tl) => { const swap = (t, raw) => tl.to("#gswap", { opacity: 0, y: -10, filter: "blur(4px)", duration: 0.25 }).call(() => { const e = $("#gswap"); e.textContent = t; e.style.color = raw ? "#8f8e89" : "#fcfcfb"; e.style.fontStyle = raw ? "italic" : "normal"; }).fromTo("#gswap", { y: 10 }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "back.out(2)" }).to({}, { duration: 1 });
        swap("um let's meet at 3, no, 4", true); swap("Let's meet at 4.", false); } },
    { title: "It learns your words", body: "Fix a name after it's pasted. Open Flow remembers it from then on.",
      html: `<div class="gline"><span class="gstrike">Navrati<b></b></span><span class="gchip">Navratri <small>Dictionary</small></span></div>`,
      play: (tl) => { tl.to(".gstrike b", { scaleX: 1, duration: 0.35, ease: "power2.out" }).fromTo(".gchip", { opacity: 0, x: -8, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(2.5)" })
        .to({}, { duration: 1.2 }).to(".gchip", { opacity: 0, duration: 0.3 }).to(".gstrike b", { scaleX: 0, duration: 0.3 }, "<"); } },
  ];
  let i = 0, loop = null, dir = 1;
  const show = (n) => {
    i = (n + STEPS.length) % STEPS.length;
    const s = STEPS[i];
    $("#gcount").textContent = `${i + 1} of 5`;
    $("#gnext").textContent = i === 4 ? "Start dictating" : "Next";
    $("#gback").style.visibility = i ? "visible" : "hidden";
    loop && loop.kill();
    const stage = $("#gstage"), title = $("#gtitle"), body = $("#gbody");
    if (!window.gsap || REDUCED) { stage.innerHTML = s.html; title.textContent = s.title; body.textContent = s.body; return; }
    gsap.to([stage.children, title, body], { opacity: 0, x: -18 * dir, filter: "blur(4px)", duration: 0.2, onComplete: () => {
      stage.innerHTML = s.html; title.textContent = s.title; body.textContent = s.body;
      gsap.fromTo([stage.children, title, body], { opacity: 0, x: 18 * dir, filter: "blur(4px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.45, ease: "expo.out", stagger: 0.04 });
      loop = gsap.timeline({ repeat: -1, repeatDelay: 0.4, delay: 0.4 }); s.play(loop);
    } });
    document.querySelectorAll("#gdots i").forEach((d, j) => gsap.to(d, { width: j === i ? 20 : 6, opacity: j === i ? 1 : j < i ? 0.55 : 0.25, duration: 0.4, ease: "back.out(2)" }));
  };
  let auto = null;
  const restartAuto = () => { clearInterval(auto); auto = setInterval(() => { dir = 1; show(i + 1); }, 4600); };
  $("#gnext").onclick = () => { dir = 1; show(i + 1); restartAuto(); };
  $("#gback").onclick = () => { dir = -1; show(i - 1); restartAuto(); };
  $("#gskip").onclick = () => { dir = 1; show(4); restartAuto(); };
  show(0);
  if (window.gsap && !REDUCED) {
    gsap.from("#gcard", { y: 70, scale: 0.9, rotate: -2, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#guide", start: "top 75%", onEnter: restartAuto } });
    document.querySelectorAll("#gnext, #gback, #gskip").forEach((b) => b.addEventListener("mousedown", () => gsap.fromTo(b, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" })));
  } else restartAuto();
})();
