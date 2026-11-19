// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function DoomMaskHero() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelAvailable, setModelAvailable] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const interactionStarted = useRef(false);
  const [hint, setHint] = useState('Loading the mask…');

  useEffect(() => {
    // Only load and render 3D model on desktop/website version; disabled on mobile
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches)) {
      setModelAvailable(false);
      return;
    }

    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let frame = 0;
    let running = false;
    let inView = true;
    let heroActive = false;
    let modelLoadStarted = false;
    let rendererFailed = false;
    let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isTouch = matchMedia('(pointer: coarse)').matches;
    let pointerMoved = false;
    let renderer;
    let environmentTarget;
    let resizeObserver;
    let intersectionObserver;
    let pivot;
    let maskWidth = 1.7;
    let maskHeight = 2.4;
    let frontZ = 0.7;
    let visibleHeight = 3.6;
    let touchActive = false;
    let currentV = 11.0;
    const meshes = [];
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const nextLightPosition = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    const ambient = new THREE.AmbientLight(0x9b927c, 2.15);
    const rim = new THREE.DirectionalLight(0x8ca8ef, 1.8);
    rim.position.set(-3, 3, -4);
    const key = new THREE.DirectionalLight(0xffd9ad, 1.65);
    key.position.set(-2.6, 4, 5);
    const torch = new THREE.PointLight(0xffb36e, 1.65, 6.5, 2);
    scene.add(ambient, rim, key, torch);

    function makeEnvironment() {
      const envScene = new THREE.Scene();
      envScene.add(new THREE.Mesh(
        new THREE.SphereGeometry(20, 24, 12),
        new THREE.MeshBasicMaterial({ color: 0x020202, side: THREE.BackSide }),
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
      panel(10, 5, [0, 9, 12], 0xffc890, 5.5);
      panel(6, 8, [-12, 2, -6], 0x6f8cff, 2.6);
      panel(8, 6, [11, 1, 4], 0x73d3a3, 1.5);

      const pmrem = new THREE.PMREMGenerator(renderer);
      environmentTarget = pmrem.fromScene(envScene, 0.04);
      pmrem.dispose();
      envScene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      return environmentTarget.texture;
    }

    let cachedHostWidth = 390;
    let cachedHostHeight = 844;
    let hostTimelineActive = false;
    let preloadTimer;

    function resize() {
      if (disposed || !renderer) return;
      const rect = host.getBoundingClientRect();
      cachedHostWidth = Math.max(1, rect.width);
      cachedHostHeight = Math.max(1, rect.height);
      const width = cachedHostWidth;
      const height = cachedHostHeight;
      const isMobile = width < 768 || isTouch;
      renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const widthFill = camera.aspect < 0.8 ? 1.05 : 0.84;
      visibleHeight = Math.max(maskHeight / 0.67, (maskWidth / widthFill) / camera.aspect);
      camera.position.set(0, 0, visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      if (pivot) {
        pivot.position.x = isMobile ? visibleHeight * camera.aspect * 0.12 : visibleHeight * camera.aspect * 0.24;
        pivot.position.y = isMobile ? visibleHeight * 0.02 : 0;
      }
    }

    function initializeRenderer() {
      if (renderer) return true;
      if (disposed || rendererFailed) return false;
      try {
        const isMobileOrTouch = isTouch || (typeof window !== 'undefined' && window.innerWidth < 768);
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: !isMobileOrTouch,
          powerPreference: isMobileOrTouch ? 'default' : 'high-performance',
          precision: isMobileOrTouch ? 'mediump' : 'highp',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        scene.environment = makeEnvironment();
        resize();
        return true;
      } catch {
        rendererFailed = true;
        environmentTarget?.dispose();
        renderer?.dispose();
        renderer = undefined;
        setModelAvailable(false);
        setHint('Static preview of Doctor Doom’s mask');
        return false;
      }
    }

    function startLoop() {
      if (disposed || running || !heroActive || !inView || document.hidden || !renderer || !meshes.length) return;
      running = true;
      clock.start();
      frame = requestAnimationFrame(draw);
    }

    function stopLoop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function draw() {
      if (disposed || !running || !heroActive || !inView || document.hidden || !renderer) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(draw);
      const dt = Math.min(clock.getDelta(), 0.06);
      const seconds = clock.elapsedTime;

      if (meshes.length && pivot) {
        const width = cachedHostWidth || 390;
        const mobile = width < 760;
        const widthFill = camera.aspect < 0.8 ? 1.05 : 0.84;
        const vHeight = visibleHeight || Math.max(maskHeight / 0.67, (maskWidth / widthFill) / camera.aspect);

        const heroBaseX = mobile ? vHeight * camera.aspect * 0.12 : vHeight * camera.aspect * 0.24;
        const heroBaseY = mobile ? vHeight * 0.02 : 0;

        let targetX = heroBaseX;
        let targetY = heroBaseY;
        let targetZ = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let targetRotZ = 0;
        let targetScale = 1.0;

        // When scrolling into Timeline (13.8 to 22.6)
        if (currentV >= 13.8 && currentV <= 22.6) {
          const tProg = (currentV - 13.8) / (22.6 - 13.8); // 0.0 to 1.0
          if (mobile) {
            // Keep mask steadily centered behind the cards with smooth gentle breathing
            targetX = 0;
            targetY = -0.06;
            targetRotX = 0.04;
            targetRotY = THREE.MathUtils.lerp(-0.06, 0.06, Math.sin(tProg * Math.PI * 2));
            targetScale = 0.86;
          } else {
            // Desktop: weave around milestone cards
            const sideX = vHeight * camera.aspect * 0.31;
            if (tProg < 0.20) {
              targetX = sideX;
              targetY = -0.12;
              targetRotY = -0.32;
              targetRotX = 0.05;
              targetScale = 0.85;
            } else if (tProg < 0.40) {
              const local = (tProg - 0.20) / 0.20;
              targetX = THREE.MathUtils.lerp(sideX, -sideX, local);
              targetY = THREE.MathUtils.lerp(-0.12, 0.1, local);
              targetRotY = THREE.MathUtils.lerp(-0.32, 0.32, local);
              targetRotX = 0.04;
              targetScale = 0.85;
            } else if (tProg < 0.60) {
              const local = (tProg - 0.40) / 0.20;
              targetX = THREE.MathUtils.lerp(-sideX, sideX, local);
              targetY = THREE.MathUtils.lerp(0.1, -0.1, local);
              targetRotY = THREE.MathUtils.lerp(0.32, -0.28, local);
              targetRotX = -0.05;
              targetScale = 0.82;
            } else if (tProg < 0.80) {
              const local = (tProg - 0.60) / 0.20;
              targetX = THREE.MathUtils.lerp(sideX, -sideX, local);
              targetY = THREE.MathUtils.lerp(-0.1, 0.14, local);
              targetRotY = THREE.MathUtils.lerp(-0.28, 0.28, local);
              targetRotX = 0.06;
              targetScale = 0.82;
            } else {
              const local = (tProg - 0.80) / 0.20;
              targetX = THREE.MathUtils.lerp(-sideX, 0, local);
              targetY = THREE.MathUtils.lerp(0.14, 0, local);
              targetRotY = THREE.MathUtils.lerp(0.28, 0, local);
              targetRotX = 0;
              targetScale = THREE.MathUtils.lerp(0.82, 1.15, local);
            }
          }
        } else if (currentV > 22.6) {
          // Closing section: Mask centers and zooms forward into camera
          const cProg = Math.min(1, (currentV - 22.6) / 1.4);
          targetX = 0;
          targetY = 0;
          targetZ = THREE.MathUtils.lerp(0, 0.8, cProg);
          targetScale = THREE.MathUtils.lerp(1.15, 1.4, cProg);
          targetRotX = 0.08;
          targetRotY = 0;
        }

        const lerpFactor = reducedMotion ? 1 : 1 - Math.exp(-dt * 8.5);
        pivot.position.x += (targetX - pivot.position.x) * lerpFactor;
        pivot.position.y += (targetY - pivot.position.y) * lerpFactor;
        pivot.position.z += (targetZ - pivot.position.z) * lerpFactor;
        pivot.scale.setScalar(THREE.MathUtils.lerp(pivot.scale.x, targetScale, lerpFactor));

        const idleRotZ = reducedMotion ? 0 : Math.sin(seconds * 1.2) * 0.015;
        pivot.rotation.x += (targetRotX - pointer.y * 0.06 - pivot.rotation.x) * lerpFactor;
        pivot.rotation.y += (targetRotY + pointer.x * 0.12 - pivot.rotation.y) * lerpFactor;
        pivot.rotation.z += (targetRotZ + idleRotZ - pivot.rotation.z) * lerpFactor;

        let onMask = false;
        if (!isTouch && pointerMoved) {
          pointerMoved = false;
          scene.updateMatrixWorld(true);
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(meshes, false);
          if (hits.length) {
            const hit = hits[0];
            normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
            if (normal.dot(raycaster.ray.direction) > 0) normal.negate();
            nextLightPosition.copy(hit.point).addScaledVector(normal, 0.34);
            nextLightPosition.y += 0.08;
            onMask = true;
          }
        }
        if (!onMask) {
          nextLightPosition.set(pivot.position.x + (mobile ? 0 : 0.1), 0.2, frontZ + 0.34);
        }
        torch.position.lerp(nextLightPosition, 1 - Math.exp(-dt * 8));
        const glow = touchActive || !isTouch ? (onMask ? 1 : 0.65) : 0.35;
        const flicker = reducedMotion ? 1 : 1 + 0.05 * Math.sin(seconds * 11) + 0.025 * Math.sin(seconds * 25);
        torch.intensity = (0.85 + glow * 2.4) * flicker;
      }

      renderer.render(scene, camera);
    }

    function pointerMove(event) {
      if (!heroActive) return;
      pointerMoved = true;
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      if (event.pointerType === 'touch') touchActive = true;
      if (!interactionStarted.current) {
        interactionStarted.current = true;
        setHint('');
      }
      startLoop();
    }

    function pointerUp(event) {
      if (event.pointerType === 'touch') touchActive = false;
    }

    function pointerLeave() {
      touchActive = false;
      pointer.set(0, 0);
    }

    function visibilityChange() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    function heroActivity(event) {
      heroActive = Boolean(event.detail?.active);
      if (!heroActive) {
        stopLoop();
        return;
      }
      if (!initializeRenderer()) return;
      loadMask();
      startLoop();
    }

    function loadMask() {
      if (disposed || modelLoadStarted || !renderer) return;
      modelLoadStarted = true;
      const loader = new GLTFLoader();
      loader.load('/media/doctor_dooms_mask.glb', (gltf) => {
        if (disposed) {
          gltf.scene.traverse((object) => {
            object.geometry?.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.filter(Boolean).forEach((material) => {
              Object.values(material).forEach((value) => value?.isTexture && value.dispose());
              material.dispose();
            });
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
          if (materials.some((material) => material?.name === 'M_DoomMask_2')) faceBounds.expandByObject(object);
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
          materials.forEach((material) => {
            material.envMapIntensity = 1.15;
            material.needsUpdate = true;
          });
          meshes.push(object);
        });
        resize();
        setModelAvailable(true);
        setModelReady(true);
        setHint(isTouch ? 'Touch and move to reveal the mask.' : 'Move your cursor to reveal the mask.');
        startLoop();
      }, undefined, () => {
        if (disposed) return;
        setModelAvailable(false);
        setHint('Static preview of Doctor Doom’s mask');
      });
    }

    function onScroll(event) {
      if (typeof event.detail?.v === 'number') {
        currentV = event.detail.v;
        const inTimeline = currentV >= 13.8 && currentV <= 22.6;
        if (host && hostTimelineActive !== inTimeline) {
          hostTimelineActive = inTimeline;
          host.classList.toggle('is-timeline', inTimeline);
        }
        if (heroActive) startLoop();
      }
    }

    // Gracefully preload mask model during idle moments to eliminate scrolling frame drops
    preloadTimer = setTimeout(() => {
      if (!disposed && !modelLoadStarted) {
        if (initializeRenderer()) {
          loadMask();
        }
      }
    }, 1500);

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
    } else {
      window.addEventListener('resize', resize);
    }
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startLoop();
        else stopLoop();
      }, { threshold: 0.02 });
      intersectionObserver.observe(host);
    }
    document.addEventListener('visibilitychange', visibilityChange);
    window.addEventListener('incursion:hero-active', heroActivity);
    window.addEventListener('incursion:scroll', onScroll);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('pointerleave', pointerLeave);

    return () => {
      disposed = true;
      clearTimeout(preloadTimer);
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibilityChange);
      window.removeEventListener('incursion:hero-active', heroActivity);
      window.removeEventListener('incursion:scroll', onScroll);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('pointerleave', pointerLeave);
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          Object.values(material).forEach((value) => value?.isTexture && value.dispose());
          material.dispose();
        });
      });
      environmentTarget?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} id="mask-stage" className={`mask-stage${modelAvailable ? '' : ' is-fallback'}${modelReady ? ' is-ready' : ''}`} aria-label="Interactive Doctor Doom mask">
      <img className="mask-fallback" src="/media/doom-closeup.webp" alt="" aria-hidden="true" />
      <canvas ref={canvasRef} className="mask-canvas" aria-label="3D Doctor Doom mask. Move or touch the image to direct the light." role="img" />
    </div>
  );
}
