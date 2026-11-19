// @ts-nocheck

import { createCollisionSound } from "./collision-audio";
import { REGISTER_URL } from "./content";

/** Attach the scroll animation to a mounted React tree. Returns full teardown. */
export function createExperience(root) {
  let disposed = false;
  const controller = new AbortController();
  const timeouts = new Set(),
    intervals = new Set();
  let animationFrame = 0;
  const oldRestoration = history.scrollRestoration;
  const wasLocked = document.documentElement.classList.contains("lock");
  const snapshots = [...root.querySelectorAll("*")].map((element) => ({
    element, style: element.getAttribute("style"), className: element.getAttribute("class"), inert: element.inert,
  }));
  const listen = (target, event, handler, options = {}) =>
    target.addEventListener(event, handler, {
      ...options,
      signal: controller.signal,
    });
  const later = (callback, delay) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      if (!disposed) callback();
    }, delay);
    timeouts.add(id);
    return id;
  };
  const cancelLater = (id) => {
    clearTimeout(id);
    timeouts.delete(id);
  };
  const every = (callback, delay) => {
    const id = window.setInterval(() => {
      if (!disposed) callback();
    }, delay);
    intervals.add(id);
    return id;
  };
  const cancelEvery = (id) => {
    clearInterval(id);
    intervals.delete(id);
  };
  const scheduleFrame = (callback) => {
    if (!disposed) animationFrame = requestAnimationFrame(callback);
  };

  // Schedule data is maintained in lib/content.js.

  const AUDIO_TRACK = "/media/soundtrack.mp3";
  /* ------------------------------------------------------------------------------------------------------ */
  const $ = (s) => root.querySelector(s),
    $$ = (s) => [...root.querySelectorAll(s)],
    clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  },
    vis = (el, o) => {
      el.style.opacity = o;
      el.style.visibility = o > 0.002 ? "visible" : "hidden";
    };
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(pointer: coarse)").matches;
  const STORY_END = 14.5;
  let lastTick = 0,
    scenePosition = 0,
    introStarted = false,
    allowDirectJump = 0,
    maxScroll = 1;
  const updateScrollRange = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  };
  const scrollRange = () => maxScroll;
  const readPosition = () => (scrollY / maxScroll) * STORY_END;
  function goScene(position, allowJump = false) {
    if (allowJump) allowDirectJump = 8;
    scrollTo({
      top: (clamp(position, 0, STORY_END) / STORY_END) * maxScroll,
      behavior: allowJump && !RM ? "smooth" : "auto",
    });
  }
  history.scrollRestoration = "manual";
  scrollTo(0, 0);
  document.documentElement.classList.add("lock");
  listen(window, "incursion:scene-jump", (event) => {
    const position = Number(event.detail?.position);
    if (Number.isFinite(position)) goScene(position, true);
  });
  listen(window, "hashchange", () => {
    if (window.location.hash === "#registration" || window.location.hash === "#tlv") {
      triggerUniverseRedirect("/universe#schedule");
    }
  });
  function lay() {
    updateScrollRange();
    dirty = true;
  }
  listen(window, "resize", lay);
  listen(window, "load", lay);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => {
      if (!disposed) lay();
    });
  /* ---- audio controller ---- */
  const AC = {
    ctx: null,
    on: false,
    trk: null,
    hasTrk: true,
    want: false,
    init() {
      if (this.ctx || this.trk) return;
      try {
        const C = window.AudioContext || window.webkitAudioContext;
        this.ctx = new C();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.on ? 1 : 0;
        this.master.connect(this.ctx.destination);
      } catch (e) {
        this.ctx = null;
      }
      const globalAudio = typeof window !== "undefined" ? (window as any).__INCURSION_AUDIO__ : null;
      const t = globalAudio?.element || new Audio(AUDIO_TRACK);
      t.preload = "auto";
      t.loop = true;
      if (globalAudio?.isPlaying) {
        this.on = true;
        this.want = true;
      } else {
        t.volume = 0;
        t.muted = !this.on;
      }
      listen(t, "error", () => {
        this.hasTrk = false;
        upd();
      });
      // Guarantee continuous unbroken looping - only when whole track is completed (~1:52 / ~113s)
      listen(t, "ended", () => {
        if (!this.on || !this.want) return;
        try {
          if (!t.duration || t.currentTime >= t.duration - 1.5) {
            t.currentTime = 0;
          }
          const p = t.play();
          if (p && p.catch) p.catch(() => {});
        } catch (e) {}
      });
      this.trk = t;
    },
    noise(d) {
      const c = this.ctx,
        b = c.createBuffer(1, c.sampleRate * d, c.sampleRate),
        a = b.getChannelData(0);
      for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
      return b;
    },
    drone() {
      const c = this.ctx;
      if (!c || this.dr) return;
      const g = c.createGain(),
        f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 170;
      g.gain.value = 0;
      [49, 49.6, 98.2].forEach((hz, i) => {
        const o = c.createOscillator();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = hz;
        const og = c.createGain();
        og.gain.value = i < 2 ? 1 : 0.25;
        o.connect(og);
        og.connect(f);
        o.start();
      });
      f.connect(g);
      g.connect(this.master);
      g.gain.linearRampToValueAtTime(0.07, c.currentTime + 5);
      this.dr = g;
    },
    duck(x, s) {
      if (this.dr)
        this.dr.gain.setTargetAtTime(x, this.ctx.currentTime, s || 0.8);
    },
    glitch() {
      const c = this.ctx;
      if (!c || RM) return;
      const t = c.currentTime,
        s = c.createBufferSource();
      s.buffer = this.noise(0.3);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 2600;
      f.Q.value = 0.7;
      const g = c.createGain();
      [
        [0, 0.1],
        [0.09, 0],
        [0.14, 0.07],
        [0.2, 0],
      ].forEach((a) => g.gain.setValueAtTime(a[1], t + a[0]));
      s.connect(f);
      f.connect(g);
      g.connect(this.master);
      s.start(t);
      s.stop(t + 0.3);
    },
    impact(k) {
      const c = this.ctx;
      if (!c) return;
      k = k || 1;
      const t = c.currentTime,
        o = c.createOscillator(),
        g = c.createGain();
      o.frequency.setValueAtTime(95, t);
      o.frequency.exponentialRampToValueAtTime(30, t + 1.4);
      g.gain.setValueAtTime(0.5 * k, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 1.9);
      const s = c.createBufferSource();
      s.buffer = this.noise(1.2);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 380;
      const n = c.createGain();
      n.gain.setValueAtTime(0.22 * k, t);
      n.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      s.connect(f);
      f.connect(n);
      n.connect(this.master);
      s.start(t);
    },
    swell() {
      const c = this.ctx;
      if (!c) return;
      const t = c.currentTime,
        s = c.createBufferSource();
      s.buffer = this.noise(1.4);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(200, t);
      f.frequency.exponentialRampToValueAtTime(1400, t + 1);
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.6);
      g.gain.linearRampToValueAtTime(0, t + 1.3);
      s.connect(f);
      f.connect(g);
      g.connect(this.master);
      s.start(t);
    },
    fade(to, ms, then) {
      const t = this.trk;
      if (!t) return;
      cancelEvery(this._f);
      if (!ms || ms <= 0) {
        t.volume = clamp(to);
        if (then) then();
        return;
      }
      const from = t.volume,
        st = performance.now();
      this._f = every(() => {
        const k = Math.min(1, (performance.now() - st) / ms);
        t.volume = clamp(from + (to - from) * k);
        if (k >= 1) {
          cancelEvery(this._f);
          if (then) then();
        }
      }, 30);
    },
    play(from, vol, ms) {
      const t = this.trk;
      if (!t || !this.hasTrk) return;
      // Never re-seek if already playing smoothly; only restore position when paused and different
      if (from != null && t.paused && Math.abs((t.currentTime || 0) - from) > 0.5) {
        try {
          t.currentTime = from;
        } catch (e) { }
      }
      this.want = true;
      if (t.paused) {
        const p = t.play();
        if (p && p.catch) p.catch(() => { });
      }
      this.fade(vol ?? 1.0, ms || 300);
    },
    stop(ms) {
      this.want = false;
      this.fade(0, ms, () => {
        if (this.trk) this.trk.pause();
      });
    },
    set(b) {
      this.on = b;
      if (this.master)
        this.master.gain.setTargetAtTime(b ? 1 : 0, this.ctx.currentTime, 0.05);
      if (this.trk) this.trk.muted = !b;
      if (b && this.ctx?.state === "suspended") this.ctx.resume().catch(() => {});
      iv.muted = true;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("incursion_audio_enabled", b ? "true" : "false");
        const globalAudio = (window as any).__INCURSION_AUDIO__;
        if (globalAudio) {
          if (b) globalAudio.play(1.0, 250);
          else globalAudio.pause(250);
        }
        window.dispatchEvent(new CustomEvent("incursion:audio-state", {
          detail: { enabled: b },
        }));
      }
      upd();
    },
  };
  const collisionSound = createCollisionSound(AC);
  let trk = 0;
  function upd() {
    if (disposed) return;
    const b = $("#snd");
    const enabled = AC.on;
    b.dataset.soundState = enabled ? "on" : "off";
    b.setAttribute("aria-label", enabled ? "Turn sound off" : "Turn sound on");
    b.setAttribute("aria-pressed", enabled);
    b.title = AC.hasTrk
      ? ""
      : "The music track failed to load, so only the synthesised cues will play";
  }
  upd();
  listen(window, "incursion:audio-state", (event: any) => {
    const enabled = event.detail?.enabled;
    if (typeof enabled === "boolean" && enabled !== AC.on) {
      AC.on = enabled;
      upd();
    }
  });
  listen($("#snd"), "click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    AC.init();
    const enabled = !AC.on;
    AC.set(enabled);
    if (enabled) {
      AC.play(AC.trk?.currentTime || 0, 1.0, 250);
    } else {
      AC.stop(250);
    }
  });
  const topButton = $("#top");
  listen(topButton, "click", () =>
    window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }),
  );
  listen(document, "visibilitychange", () => {
    if (document.hidden) {
      iv.pause();
      AC.ctx && AC.ctx.suspend();
      AC.trk && AC.trk.pause();
    } else {
      if (introStarted && !done) iv.play().catch(finish);
      AC.ctx && AC.ctx.resume();
      if (AC.want && AC.trk) AC.trk.play().catch(() => { });
    }
  });
  /* ---- intro video ---- */
  const iv = $("#iv");
  let done = false,
    ready = false;
  function triggerFlash() {
    const stage = $("#stage") || document.body;
    const fl = document.createElement("div");
    fl.className = "intro-flash";
    stage.appendChild(fl);
    AC.glitch();
    AC.impact(1.2);
    later(() => {
      fl.remove();
    }, 900);
  }
  let audioUnlocked = false;
  const unlockAudio = () => {
    if (disposed || audioUnlocked) return;
    audioUnlocked = true;
    const soundPrompt = $("#sound-prompt");
    if (soundPrompt) soundPrompt.classList.remove("is-visible");
    AC.init();
    if (AC.ctx?.state === "suspended") {
      AC.ctx.resume().catch(() => {});
    }
    AC.set(true);
    if (AC.trk) {
      AC.trk.muted = false;
      if (AC.trk.paused) {
        AC.play(null, 1.0, 300);
      } else {
        AC.fade(1.0, 300);
      }
    }
  };

  function finish() {
    if (disposed || done) return;
    done = true;
    ready = true;
    iv.pause();
    const prompt = $("#sound-prompt");
    if (prompt) prompt.classList.remove("is-visible");
    const skip = $("#skip");
    if (skip) skip.style.display = "none";
    document.documentElement.classList.remove("lock");
    iv.style.transition = "opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
    iv.style.opacity = "0";
    const term = $("#term");
    if (term) {
      term.classList.add("out");
      term.inert = true;
    }
    try {
      triggerFlash();
    } catch (e) {}
    // soundtrack.mp3 continues playing seamlessly without interruption
    if (AC.on && AC.trk && AC.trk.paused) {
      AC.play(null, 1.0, 400);
    }
    $("#snd")?.focus?.({ preventScroll: true });
    dirty = true;
  }
  function enter(snd) {
    introStarted = true;
    iv.muted = true;
    iv.volume = 0;

    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      const targetSrc = isMobile ? "/media/intro-mobile.mp4" : "/media/intro.mp4";
      if (!iv.currentSrc?.endsWith(targetSrc) && (!iv.src || !iv.src.endsWith(targetSrc))) {
        iv.src = targetSrc;
      }
    }

    const stored = typeof window !== "undefined" ? sessionStorage.getItem("incursion_audio_enabled") : null;
    const shouldAudio = stored !== null ? stored === "true" : snd;

    AC.init();
    AC.set(shouldAudio);

    const savedTime = typeof window !== "undefined" ? sessionStorage.getItem("incursion_audio_time") : null;
    const initialTime = savedTime && !isNaN(parseFloat(savedTime)) ? parseFloat(savedTime) : (AC.trk?.currentTime || 0);

    // Start video playback (muted so it autoplays 100% reliably)
    iv.play().catch(() => {});

    const soundPrompt = $("#sound-prompt");
    const term = $("#term");

    const unlockEvents = [
      "pointerdown", "touchstart", "touchend", "mousedown",
      "click", "wheel", "scroll", "keydown"
    ];
    const onUserGesture = () => {
      unlockAudio();
      unlockEvents.forEach((ev) => {
        window.removeEventListener(ev, onUserGesture);
        if (term) term.removeEventListener(ev, onUserGesture);
        if (soundPrompt) soundPrompt.removeEventListener(ev, onUserGesture);
      });
    };

    if (shouldAudio && AC.trk) {
      AC.play(initialTime, 1.0, 400);
      const playPromise = AC.trk.play();
      if (playPromise && playPromise.catch) {
        playPromise.then(() => {
          if (soundPrompt) soundPrompt.classList.remove("is-visible");
        }).catch(() => {
          // Autoplay blocked by browser policy until interaction
          if (soundPrompt && !done) soundPrompt.classList.add("is-visible");
        });
      }
    } else {
      if (soundPrompt && !done) soundPrompt.classList.add("is-visible");
    }

    unlockEvents.forEach((ev) => {
      listen(window, ev, onUserGesture, { passive: true });
      if (term) listen(term, ev, onUserGesture, { passive: true });
      if (soundPrompt) listen(soundPrompt, ev, onUserGesture, { passive: true });
    });
  }

  listen(iv, "ended", finish);
  listen(iv, "error", finish);
  const skipBtn = $("#skip");
  if (skipBtn) {
    skipBtn.style.display = "inline-flex";
    let skipped = false;
    const triggerSkip = (e) => {
      if (skipped || done) return;
      skipped = true;
      if (e) {
        if (typeof e.preventDefault === "function" && e.cancelable) e.preventDefault();
        if (typeof e.stopPropagation === "function") e.stopPropagation();
      }
      try {
        unlockAudio();
      } catch (err) {}
      finish();
    };
    listen(skipBtn, "click", triggerSkip);
    listen(skipBtn, "touchend", triggerSkip);
    listen(skipBtn, "pointerdown", triggerSkip);
  }
  enter(true);

  // Resume audio on the first gesture after intro completes if still blocked
  const unlockOnPageTouch = () => {
    if (AC.on && AC.trk && (AC.trk.paused || AC.trk.muted)) {
      AC.init();
      if (AC.ctx?.state === "suspended") AC.ctx.resume().catch(() => {});
      AC.trk.muted = false;
      if (AC.trk.paused) {
        AC.play(null, 1.0, 300);
      } else {
        AC.fade(1.0, 300);
      }
    }
  };
  ["pointerdown", "touchstart", "click"].forEach((ev) => {
    listen(window, ev, unlockOnPageTouch, { passive: true, once: true });
  });
  /* ---- universe smooth redirect controller ---- */
  let redirected = false;
  function triggerUniverseRedirect(targetUrl = "/universe") {
    if (redirected) return;
    redirected = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("incursion_audio_enabled", AC.on ? "true" : "false");
      sessionStorage.setItem("incursion_audio_time", String(AC.trk?.currentTime || 0));
    }
    try {
      AC.impact(0.55);
    } catch { }

    const overlay = $("#universe-portal-transition") || document.getElementById("universe-portal-transition");
    if (overlay) {
      overlay.classList.add("is-active");
    }
    // Cinematic 1-second pause on the Doomsday "Welcome to the Universe" transition
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1200);
  }

  $$("[data-universe-link], a[href*='/universe']").forEach((link) => {
    listen(link, "click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href") || "/universe";
      triggerUniverseRedirect(target);
    });
  });

  $$(".reg").forEach((a) => {
    if (REGISTER_URL) {
      a.href = REGISTER_URL;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      listen(a, "click", (e) => {
        e.preventDefault();
        triggerUniverseRedirect("/universe#schedule");
      });
    }
  });

  $$('[data-scene-target]').forEach((link) => {
    listen(link, "click", (event) => {
      event.preventDefault();
      triggerUniverseRedirect("/universe#schedule");
    });
  });

  let H = innerHeight,
    dirty = true,
    lv = -1;
  function resize() {
    H = innerHeight;
    lay();
    dirty = true;
  }
  listen(window, "resize", resize);
  resize();

  /* ---- scene tick ---- */
  const THR = $("#throne"),
    tw2 = $("#tw2"),
    tc = $("#tc"),
    vg = $("#vg"),
    scrim = $("#scrim"),
    stageTease = $("#stage-tease"),
    tl = $$("[data-w]").map((e) => ({
      e,
      w: e.dataset.w.split(",").map(Number),
    }));
  const hdr = $("#hdr"),
    heroStage = $("#hero"),
    scrollCue = $("#hero-scroll-cue");

  let reveal = 0,
    firstScrollReveal = false;

  function tick() {
    scheduleFrame(tick);
    const now = performance.now(),
      dt = Math.min(0.05, (now - (lastTick || now)) / 1000);
    lastTick = now;
    const targetPosition = readPosition();
    if (allowDirectJump > 0) {
      scenePosition = targetPosition;
      allowDirectJump--;
    }
    // High-performance smooth glide: silky, responsive, and jitter-free
    const lerpRate = isTouch ? 6.8 : 6.2;
    scenePosition = RM
      ? targetPosition
      : lerp(scenePosition, targetPosition, 1 - Math.exp(-dt * lerpRate));
    if (Math.abs(targetPosition - scenePosition) < 0.0004) {
      scenePosition = targetPosition;
    } else {
      dirty = true;
    }
    const raw = scenePosition,
      v = raw;
    window.dispatchEvent(new CustomEvent("incursion:scroll", { detail: { v } }));
    collisionSound.update(0, false);
    if (raw === lv && !dirty) return;
    lv = raw;
    dirty = false;
    /* chrome */
    if (hdr) hdr.style.opacity = ready ? 1 : 0;
    topButton.classList.toggle("on", ready && raw > 0.7);
    /* throne room: continuous push-in toward the figure, dissolving gradually to the close-up */
    const em = ss(0.2, 2.0, v),
      pu = ss(1.0, 5.4, v),
      S = 1 + 0.65 * pu;
    const co = ss(2.8, 6.0, v),
      tO = 1 - ss(9.6, 11.4, v);
    if (!ready) {
      THR.style.opacity = "0";
      THR.style.visibility = "hidden";
      if (stageTease) {
        stageTease.style.opacity = "0";
        stageTease.style.visibility = "hidden";
      }
    } else if (stageTease) {
      const teaseOpacity = 1 - ss(0.8, 3.2, v);
      stageTease.style.opacity = teaseOpacity;
      stageTease.style.visibility = teaseOpacity > 0.002 ? "visible" : "hidden";
    }
    if (ready) vis(THR, tO);
    if (co > 0.5 && !reveal) {
      reveal = now;
      AC.duck(0.025, 0.9);
      AC.impact(0.35);
    } else if (co < 0.1 && reveal) {
      reveal = 0;
      AC.duck(0.07, 0.8);
    }
    const rt = reveal ? (now - reveal) / 1000 : 0;
    if (tO > 0) {
      const j = RM ? 0 : 0.06 + 0.12 * pu,
        jx = (Math.sin(v * 7.3) + Math.sin(v * 4.1)) * j,
        jy = Math.cos(v * 5.7) * j;
      tw2.style.transform = `translate3d(${jx.toFixed(2)}px,${jy.toFixed(2)}px,0) scale(${S.toFixed(4)})`;
      tw2.style.filter = `brightness(${(0.52 + 0.38 * em).toFixed(3)}) contrast(0.95) saturate(0.9)`;
      tw2.style.visibility = co < 0.995 ? "visible" : "hidden";
      tc.style.opacity = co.toFixed(3);
      const tcScale = (1.0 + 0.12 * ss(3.0, 9.8, v)).toFixed(4);
      tc.style.transform = `translate3d(0,0,0) scale(${tcScale})`;
      const tcDim = ss(6.4, 7.8, v) * (1 - ss(9.6, 10.1, v));
      tc.style.filter = `brightness(${(0.96 - 0.18 * tcDim).toFixed(3)}) contrast(0.95) saturate(0.9)`;
      const r = lerp(lerp(28, 72, em) * (1 - 0.42 * pu), 36, co);
      vg.style.setProperty("--r", r.toFixed(1) + "%");
      vg.style.setProperty("--fx", lerp(55, 52, co).toFixed(1) + "%");
      vg.style.setProperty("--fy", lerp(58, 40, co).toFixed(1) + "%");
      scrim.style.opacity = (ss(6.4, 7.4, v) * (1 - ss(9.4, 9.9, v))).toFixed(3);
    }
    /* the warning text fades in and out between the throne close-up and the hero reveal */
    tl.forEach((o) => {
      const w = o.w,
        t = ss(w[0], w[1], v) * (1 - ss(w[2], w[3], v));
      o.e.style.opacity = t;
      o.e.style.visibility = t > 0.002 ? "visible" : "hidden";
    });

    /* The opening hero text and CTA appear smoothly and remain prominently visible */
    const heroOpacity = ss(9.8, 11.4, v);
    if (heroStage) {
      vis(heroStage, heroOpacity);
      heroStage.style.transform = "none";
    }

    /* Scroll cue visibility tied to hero stage */
    if (scrollCue) {
      const cueOpacity = ss(10.8, 11.8, v);
      scrollCue.style.opacity = String(cueOpacity);
      scrollCue.style.pointerEvents = cueOpacity > 0.2 ? "auto" : "none";
    }

    /* As the user scrolls past the hero stage, smoothly transition directly into /universe */
    if (v >= 13.5 && !redirected) {
      triggerUniverseRedirect("/universe");
    }

    if (reveal && AC.trk && AC.trk.volume > 0) {
      const q = 1.0;
      if (AC._q !== q && rt > 4.5) {
        AC._q = q;
        AC.fade(q, 1000);
      }
    }
  }
  scheduleFrame(tick);

    return () => {
      disposed = true;
      controller.abort();
      cancelAnimationFrame(animationFrame);
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      collisionSound.dispose();
      if (iv && typeof iv.pause === "function") iv.pause();
      const globalAudio = typeof window !== "undefined" ? (window as any).__INCURSION_AUDIO__ : null;
      if (AC.trk && AC.trk !== globalAudio?.element) {
        AC.trk.pause();
        AC.trk.removeAttribute("src");
        AC.trk.load();
      }
      if (AC.ctx && AC.ctx.state !== "closed") AC.ctx.close().catch(() => { });
      history.scrollRestoration = oldRestoration;
      document.documentElement.classList.toggle("lock", wasLocked);
      for (const { element, style, className, inert } of snapshots) {
        if (style === null) element.removeAttribute("style");
        else element.setAttribute("style", style);
        if (className === null) element.removeAttribute("class");
        else element.setAttribute("class", className);
        element.inert = inert;
      }
    };
  }
