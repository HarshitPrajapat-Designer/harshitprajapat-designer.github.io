/* ==========================================================================
   HARSHIT PRAJAPAT PORTFOLIO  |  js/main.js
   --------------------------------------------------------------------------
   WHAT THIS FILE DOES (in order)
     1. Small helper functions
     2. Light / dark mode button
     3. Image slots  (loads images, shows the "add image here" box if missing)
     4. Fade-in when items scroll into view
     5. 3D tilt when the mouse moves over a card
     6. Scroll scenes  (Problem, Gallery, Craft)  + chapter rail + progress line
     7. 3D background  (needs three.js, loaded in index.html)

   You normally do NOT need to edit this file to change text or images.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. HELPERS
     ------------------------------------------------------------------------ */
  var root = document.documentElement;
  var $  = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };               // keep a number between 0 and 1
  var smooth = function (a, b, v) { v = clamp((v - a) / (b - a)); return v * v * (3 - 2 * v); };  // 0 to 1 with soft start and end


  /* ------------------------------------------------------------------------
     2. LIGHT / DARK MODE
     Remembers the choice. If there is no saved choice, follows the phone or computer setting.
     ------------------------------------------------------------------------ */
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    if (!saved && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) { saved = "dark"; }
    if (saved) { root.setAttribute("data-theme", saved); }

    $("[data-js='theme-button']").addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  })();


  /* ------------------------------------------------------------------------
     3. IMAGE SLOTS
     Each <figure class="slot"> has an <img>. If the file is missing we try the
     other file types (.webp, .jpg, .png, .jpeg). If none exist, the slot gets
     the class "slot--empty" and the dashed "add image here" box appears.
     ------------------------------------------------------------------------ */
  (function initSlots() {
    var types = ["webp", "jpg", "png", "jpeg"];
    $$(".slot").forEach(function (slot) {
      var img = $("img", slot);
      if (!img) { slot.classList.add("slot--empty"); return; }

      var base = img.getAttribute("data-base");
      var tried = [(img.getAttribute("src") || "").split(".").pop().toLowerCase()];

      function tryNext() {
        var next = types.filter(function (t) { return tried.indexOf(t) < 0; })[0];
        if (!next || !base) { img.remove(); slot.classList.add("slot--empty"); return; }
        tried.push(next);
        img.src = base + "." + next;
      }
      img.addEventListener("error", tryNext);
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) { tryNext(); }   // already failed before this script ran
    });
  })();


  /* ------------------------------------------------------------------------
     4. FADE-IN WHEN SCROLLED INTO VIEW   (elements with data-reveal)
     ------------------------------------------------------------------------ */
  (function initReveal() {
    var items = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  })();


  /* ------------------------------------------------------------------------
     5. 3D TILT ON HOVER   (elements with data-tilt, mouse only)
     ------------------------------------------------------------------------ */
  (function initTilt() {
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 10;      // degrees
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") { return; }
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(800px) rotateY(" + x * max + "deg) rotateX(" + -y * max + "deg)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  })();


  /* ------------------------------------------------------------------------
     6. SCROLL SCENES, CHAPTER RAIL AND PROGRESS LINE
     ------------------------------------------------------------------------ */
  var mouseX = 0, mouseY = 0;                                         // mouse position, -0.5 to 0.5
  addEventListener("pointermove", function (e) {
    mouseX = e.clientX / innerWidth - 0.5;
    mouseY = e.clientY / innerHeight - 0.5;
    requestTick();
  });

  // Elements used by the scenes (they carry data-js="..." in index.html)
  var scenes = {
    problem: $("[data-scene='problem']"),
    gallery: $("[data-scene='gallery']"),
    craft:   $("[data-scene='craft']")
  };
  var heroRig      = $("[data-js='hero-rig']");
  var oldCards     = $$("[data-js='scene-old']");
  var newCard      = $("[data-js='scene-new']");
  var swapText     = $("[data-js='swap']");
  var compareTop   = $("[data-js='compare-top']");
  var compareLine  = $("[data-js='compare-handle']");
  var galleryTrack = $("[data-js='gallery-track']");
  var progressBar  = $("#progress");
  var drawItems    = $$("[data-draw]");
  var railLinks    = $$(".rail__dot");
  var chapters     = railLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });

  // Where the 3 messy cards start (x %, y %, z px, rotate deg, turn deg). They fly to the centre while you scroll.
  var oldCardStart = [[-30, -24, -160, -14, 20], [24, -10, 60, 10, -16], [-6, 30, -60, -5, 10]];

  /* Pin layout: a pinned scene stays on screen while you scroll through it.
     We centre it vertically. If it is taller than the screen, we switch pinning off ("scrub--free"). */
  function layoutPins() {
    Object.keys(scenes).forEach(function (key) {
      var scene = scenes[key], pin = $(".pin", scene);
      scene.classList.remove("scrub--free");
      var tooTall = pin.offsetHeight > innerHeight - 84;   // taller than the screen: do not pin, scroll normally
      scene.classList.toggle("scrub--free", tooTall);
      pin.style.top = Math.max(76, (innerHeight - pin.offsetHeight) / 2) + "px";
    });
  }

  /* How far (0 to 1) the visitor has scrolled through a scene */
  function sceneProgress(scene) {
    var pin = $(".pin", scene), style = getComputedStyle(pin);
    if (style.position === "sticky") {
      var r = scene.getBoundingClientRect();
      var run = r.height - pin.offsetHeight;
      return run > 0 ? clamp((parseFloat(style.top) - r.top) / run) : 1;
    }
    var pr = pin.getBoundingClientRect();                              // not pinned: use position on screen
    return clamp((innerHeight * 0.85 - pr.top) / (innerHeight * 0.55));
  }

  var ticking = false;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  function update() {
    ticking = false;
    var scrollY = window.pageYOffset;
    var maxScroll = root.scrollHeight - innerHeight;

    // Top progress line
    progressBar.style.transform = "scaleX(" + (maxScroll > 0 ? scrollY / maxScroll : 0) + ")";

    // Hello section: tilt the 3D image stack with the mouse and scroll
    if (heroRig && scrollY < innerHeight * 1.2) {
      heroRig.style.setProperty("--ry", (-16 + mouseX * 24 - scrollY * 0.03) + "deg");
      heroRig.style.setProperty("--rx", (8 - mouseY * 16 + scrollY * 0.02) + "deg");
    }

    // PROBLEM scene: messy cards fly together, then the clear screen appears
    var p = sceneProgress(scenes.problem);
    var gather = smooth(0.04, 0.58, p);
    oldCards.forEach(function (card, i) {
      var c = oldCardStart[i], k = 1 - gather;
      card.style.transform = "translate3d(" + c[0] * k + "%," + c[1] * k + "%," + c[2] * k + "px) rotateZ(" + c[3] * k + "deg) rotateY(" + c[4] * k + "deg)";
      card.style.opacity = 1 - smooth(0.5, 0.78, p);
    });
    newCard.style.opacity = smooth(0.45, 0.78, p);
    newCard.style.transform = "translateZ(" + (1 - smooth(0.45, 0.8, p)) * -120 + "px)";
    swapText.classList.toggle("is-clear", p > 0.5);

    // CRAFT scene: the line slides and shows design, then code
    var cut = 6 + 88 * smooth(0.05, 0.95, sceneProgress(scenes.craft));   // line moves from 6% to 94%
    compareTop.style.clipPath = "inset(0 " + (100 - cut) + "% 0 0)";
    compareLine.style.left = cut + "%";

    // GALLERY: the row slides sideways
    var g = sceneProgress(scenes.gallery);
    galleryTrack.style.transform = "translateX(" + -g * Math.max(0, galleryTrack.scrollWidth - innerWidth) + "px)";

    // Lines that draw themselves (steps, timeline)
    drawItems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--progress", clamp((innerHeight * 0.7 - r.top) / r.height));
    });

    // Chapter rail: mark the chapter that is on screen
    var current = 0;
    chapters.forEach(function (sec, i) { if (sec && sec.getBoundingClientRect().top < innerHeight * 0.45) { current = i; } });
    if (maxScroll > 0 && scrollY >= maxScroll - 4) { current = chapters.length - 1; }   // at the very bottom, mark the last chapter
    railLinks.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
  }

  addEventListener("scroll", requestTick, { passive: true });
  addEventListener("resize", function () { layoutPins(); requestTick(); });
  addEventListener("load", function () { layoutPins(); requestTick(); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { layoutPins(); requestTick(); }); }
  layoutPins();
  update();


  /* ------------------------------------------------------------------------
     7. 3D BACKGROUND  (a soft wave of dots and lines behind the page)
     Uses three.js. If three.js cannot load, the page still works without it.
     ------------------------------------------------------------------------ */
  (function initBackground() {
    if (!window.THREE) { return; }
    var canvas = $("#bg3d");
    var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

    // Build a flat grid of points, then connect neighbours with thin lines
    var small = innerWidth < 820;
    var cols = small ? 34 : 70, rows = small ? 28 : 44, gap = small ? 1.35 : 1.1;
    var count = cols * rows, positions = new Float32Array(count * 3), lineIndex = [];
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var k = i * rows + j;
        positions[k * 3] = (i - cols / 2) * gap;
        positions[k * 3 + 2] = -j * gap;
        if (i < cols - 1) { lineIndex.push(k, k + rows); }
        if (j < rows - 1) { lineIndex.push(k, k + 1); }
      }
    }
    var geometry = new THREE.BufferGeometry();
    var posAttr = new THREE.BufferAttribute(positions, 3);
    geometry.setAttribute("position", posAttr);
    geometry.setIndex(lineIndex);
    var pointMat = new THREE.PointsMaterial({ size: 0.06, transparent: true, depthWrite: false });
    var lineMat  = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
    scene.add(new THREE.Points(geometry, pointMat), new THREE.LineSegments(geometry, lineMat));
    scene.fog = new THREE.Fog(0xe8ebf1, 10, 38);                       // far points fade into the page color

    // Match the colors to light / dark mode (reads the CSS variables)
    function applyTheme() {
      var css = getComputedStyle(root), dark = root.getAttribute("data-theme") === "dark";
      var accent = css.getPropertyValue("--accent").trim();
      pointMat.color.set(accent); lineMat.color.set(accent);
      scene.fog.color.set(css.getPropertyValue("--bg").trim());
      pointMat.opacity = dark ? 0.45 : 0.32;
      lineMat.opacity  = dark ? 0.16 : 0.12;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
    resize();
    addEventListener("resize", resize);

    var time = 0;
    (function loop() {
      requestAnimationFrame(loop);
      if (document.hidden) { return; }
      if (!reduceMotion) { time += 0.012; }
      var sy = window.pageYOffset, phase = time + sy * 0.0025;
      var bumpX = mouseX * 22, bumpZ = -14 - mouseY * 14, a = posAttr.array;   // the mouse makes a small ripple
      for (var n = 0; n < count; n++) {
        var x = a[n * 3], z = a[n * 3 + 2], dx = x - bumpX, dz = z - bumpZ;
        a[n * 3 + 1] = Math.sin(x * 0.32 + phase) * 0.55 + Math.cos(z * 0.28 + phase * 0.8) * 0.55 + Math.exp(-(dx * dx + dz * dz) / 9) * 1.3;
      }
      posAttr.needsUpdate = true;
      camera.position.set(mouseX * 2, 5.5 - Math.min(sy / 4000, 1) * 1.5, 6);
      camera.lookAt(0, 0, -18 + Math.min(sy / 900, 6));
      renderer.render(scene, camera);
    })();
  })();

})();
