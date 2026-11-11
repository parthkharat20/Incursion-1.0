// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function UniverseMaskCanvas() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only load and render the 3D model on desktop/website version; disabled on mobile
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches)) {
      return;
    }

    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let frame = 0;
    let running = false;
    let inView = true;
    let renderer;
    let environmentTarget;
    let resizeObserver;
    let pivot;
    let maskWidth = 1.7;
    let maskHeight = 2.4;
    let frontZ = 0.7;
    let scrollProgress = 0;
    const meshes = [];
    const pointer = new THREE.Vector2(0, 0);
    const targetLightPos = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const clock = new THREE.Clock();

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = matchMedia('(pointer: coarse)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

    // Boosted theatrical lighting for Doctor Doom
    const ambient = new THREE.AmbientLight(0x8fa396, 1.8);
    const rim = new THREE.DirectionalLight(0x3fe08e, 2.8);
    rim.position.set(-3.5, 3.5, -4);
    const key = new THREE.DirectionalLight(0xffdfba, 1.8);
    key.position.set(-2.6, 4, 5);
    const torch = new THREE.PointLight(0x3fe08e, 2.2, 7.5, 2);
    scene.add(ambient, rim, key, torch);

    const targetRimColor = new THREE.Color(0x3fe08e);
    const currentRimColor = new THREE.Color(0x3fe08e);

    function makeEnvironment() {
      const envScene = new THREE.Scene();
      envScene.add(new THREE.Mesh(
        new THREE.SphereGeometry(20, 24, 12),
        new THREE.MeshBasicMaterial({ color: 0x010302, side: THREE.BackSide }),
      ));

      const panel = (width, height, position, color, strength) => {
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color).multiplyScalar(strength),
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
        mesh.position.set(...position);
        mesh.lookAt(0, 0, 0);
        envScene.add(mesh);
      };

      panel(12, 6, [0, 9, 12], 0xffdfb0, 6.0);
      panel(8, 10, [-12, 2, -6], 0x3fe08e, 4.5);
      panel(10, 8, [11, 1, 4], 0x58c0ff, 3.0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      environmentTarget = pmrem.fromScene(envScene, 0.04);
      pmrem.dispose();
      envScene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((m) => m?.dispose());
        else object.material?.dispose();
      });
      return environmentTarget.texture;
    }

    function resize() {
      if (disposed || !renderer) return;
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;

      const widthFill = camera.aspect < 0.8 ? 0.95 : 0.80;
      const visibleHeight = Math.max(maskHeight / 0.67, (maskWidth / widthFill) / camera.aspect);
      camera.position.set(0, 0, visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      updateScrollProgress();
    }

    function initializeRenderer() {
      if (renderer || disposed) return Boolean(renderer);
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        scene.environment = makeEnvironment();
        resize();
        return true;
      } catch {
        renderer = undefined;
        return false;
      }
    }

    let isScheduleInView = false;

    function updateScrollProgress() {
      const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.max(0, Math.min(1, window.scrollY / scrollRange));

      const scheduleEl = document.getElementById('schedule');
      if (scheduleEl) {
        const rect = scheduleEl.getBoundingClientRect();
        // Fully hide the Doom 3D mask while viewing the timeline/schedule section
        isScheduleInView = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18;
      } else {
        isScheduleInView = false;
      }

      if (!running && inView && !document.hidden) startLoop();
    }

    function startLoop() {
      if (disposed || running || !inView || document.hidden || !renderer || !meshes.length) return;
      running = true;
      clock.start();
      frame = requestAnimationFrame(draw);
    }

    function stopLoop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function draw() {
      if (disposed || !running || !inView || document.hidden || !renderer) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(draw);
      const dt = Math.min(clock.getDelta(), 0.06);
      const seconds = clock.elapsedTime;

      if (meshes.length && pivot) {
        const width = Math.max(1, window.innerWidth);
        const mobile = width < 768;
        const visibleHeight = Math.max(maskHeight / 0.67, (maskWidth / (camera.aspect < 0.8 ? 1.05 : 0.84)) / camera.aspect);

        // Anchored continuously on the right flank (centered in hero on mobile)
        const p = scrollProgress;
        const sideX = mobile ? 0 : visibleHeight * camera.aspect * 0.31;

        // In-place organic breathing levitation
        const idleFloatY = reducedMotion ? 0 : Math.sin(seconds * 1.5) * 0.04;
        const idleRotZ = reducedMotion ? 0 : Math.sin(seconds * 1.2) * 0.02;
        const idleRotX = reducedMotion ? 0 : Math.sin(seconds * 1.7) * 0.015;

        const targetX = sideX;
        const targetY = (mobile ? 0.32 : -0.02) + idleFloatY;
        const targetZ = mobile ? -0.3 : 0.08;
        const targetScale = mobile ? 0.70 : 0.94;

        // Base angle facing slightly towards center content, with subtle section attitude shifts
        let targetRotX = -0.02;
        let targetRotY = mobile ? 0 : -0.22;
        const targetRotZ = 0;

        if (p < 0.35) {
          // Hero / About: Latverian Emerald
          targetRotX = -0.02;
          targetRotY = mobile ? 0 : -0.24;
          targetRimColor.setHex(0x3fe08e);
        } else if (p < 0.60) {
          // Tracks: Cosmic Cyan
          targetRotX = -0.04;
          targetRotY = mobile ? 0 : -0.20;
          targetRimColor.setHex(0x5ec5ff);
        } else if (p < 0.85) {
          // Prizes: Vibranium Gold
          targetRotX = 0.05;
          targetRotY = mobile ? 0 : -0.24;
          targetRimColor.setHex(0xffd700);
        } else {
          // Sponsors & Footer: Latverian Emerald
          targetRotX = -0.02;
          targetRotY = mobile ? 0 : -0.22;
          targetRimColor.setHex(0x3fe08e);
        }

        // Bold, cinematic lighting continuously
        ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, 1.8, dt * 4.0);
        rim.intensity = THREE.MathUtils.lerp(rim.intensity, 2.8, dt * 4.0);
        key.intensity = THREE.MathUtils.lerp(key.intensity, 1.8, dt * 4.0);

        const lerpFactor = reducedMotion ? 1 : 1 - Math.exp(-dt * 6.5);
        pivot.position.x += (targetX - pivot.position.x) * lerpFactor;
        pivot.position.y += (targetY - pivot.position.y) * lerpFactor;
        pivot.position.z += (targetZ - pivot.position.z) * lerpFactor;
        pivot.scale.setScalar(THREE.MathUtils.lerp(pivot.scale.x, targetScale, lerpFactor));

        // Interactive mouse tracking: Doom's gaze follows the cursor across the screen + in-place breathing
        const lookAtX = pointer.y * 0.12;
        const lookAtY = pointer.x * 0.20;
        pivot.rotation.x += (targetRotX - lookAtX + idleRotX - pivot.rotation.x) * lerpFactor;
        pivot.rotation.y += (targetRotY + lookAtY - pivot.rotation.y) * lerpFactor;
        pivot.rotation.z += (targetRotZ + idleRotZ - pivot.rotation.z) * lerpFactor;

        // Smooth color transition for rim light
        currentRimColor.lerp(targetRimColor, 1 - Math.exp(-dt * 4.0));
        rim.color.copy(currentRimColor);

        // Torch light tracking cursor with live atmospheric flicker
        targetLightPos.set(pivot.position.x + pointer.x * 0.9, pivot.position.y - pointer.y * 0.6 + 0.25, frontZ + 0.45);
        torch.position.lerp(targetLightPos, 1 - Math.exp(-dt * 7.0));
        const flicker = reducedMotion ? 1 : 1 + 0.04 * Math.sin(seconds * 14) + 0.02 * Math.sin(seconds * 24);
        torch.intensity = 2.2 * flicker;

        // Continuously visible everywhere (100% opacity), smoothly fading out only when the timeline schedule is in view
        const targetCanvasOpacity = isScheduleInView ? 0.0 : 1.0;
        const currentCanvasOpacity = parseFloat(canvas.style.opacity || '1');
        canvas.style.opacity = String(THREE.MathUtils.lerp(currentCanvasOpacity, targetCanvasOpacity, dt * 6.0));
      }

      renderer.render(scene, camera);
    }

    function pointerMove(event) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      pointer.set(
        (event.clientX / width) * 2 - 1,
        -(event.clientY / height) * 2 + 1,
      );
      if (!running && inView && !document.hidden) startLoop();
    }

    function visibilityChange() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    function loadMask() {
      if (disposed || !renderer) return;
      const loader = new GLTFLoader();
      loader.load('/media/doctor_dooms_mask.glb', (gltf) => {
        if (disposed) {
          gltf.scene.traverse((obj) => {
            obj.geometry?.dispose();
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.filter(Boolean).forEach((m) => m.dispose());
          });
          return;
        }

        pivot = new THREE.Group();
        scene.add(pivot);
        const model = gltf.scene;
        pivot.add(model);
        model.updateMatrixWorld(true);

        const faceBounds = new THREE.Box3();
        model.traverse((object) => {
          if (!object.isMesh) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          if (materials.some((m) => m?.name === 'M_DoomMask_2')) faceBounds.expandByObject(object);
        });
        if (faceBounds.isEmpty()) faceBounds.setFromObject(model);
        const size = faceBounds.getSize(new THREE.Vector3());
        const center = faceBounds.getCenter(new THREE.Vector3());
        const scale = maskHeight / Math.max(size.y, 0.001);
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
        maskWidth = size.x * scale;
        frontZ = (faceBounds.max.z - center.z) * scale;
        plane.constant = -frontZ;

        model.traverse((object) => {
          if (!object.isMesh) return;
          object.castShadow = false;
          object.receiveShadow = false;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((mat) => {
            if (mat) {
              mat.envMapIntensity = 1.6;
              mat.roughness = Math.min(mat.roughness || 0.4, 0.45);
              mat.metalness = Math.max(mat.metalness || 0.8, 0.85);
              mat.needsUpdate = true;
            }
          });
          meshes.push(object);
        });

        resize();
        updateScrollProgress();
        setReady(true);
        startLoop();
      });
    }

    if (initializeRenderer()) {
      loadMask();
    }

    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('pointermove', pointerMove, { passive: true });
    document.addEventListener('visibilitychange', visibilityChange);

    return () => {
      disposed = true;
      stopLoop();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('visibilitychange', visibilityChange);

      scene.traverse((object) => {
        object.geometry?.dispose();
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.filter(Boolean).forEach((m) => {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        });
      });
      environmentTarget?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} className={`universe-mask-stage${ready ? ' is-ready' : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} className="universe-mask-canvas" />
    </div>
  );
}
