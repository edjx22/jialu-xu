import { useEffect, useRef } from 'react';
import { MultiPassRenderer, createEmptyTexture } from './utils/GLUtils';
import { computeGaussianKernelByRadius } from './utils';
import vertex from './shaders/vertex.glsl';
import background from './shaders/fragment-bg.glsl';
import verticalBlur from './shaders/fragment-bg-vblur.glsl';
import horizontalBlur from './shaders/fragment-bg-hblur.glsl';
import glass from './shaders/fragment-main.glsl';

// Actual defaults from upstream Controls.tsx, not the earlier screenshot preset.
const studioDefaults = {
  thickness: 20, distance: 0.05, refraction: 1.4, dispersion: 7,
  fresnelSize: 30, fresnelHardness: 0.2, fresnelIntensity: 0.2,
  glareSize: 30, glareHardness: 0.2, glareIntensity: 0.9,
  glareConvergence: 0.5, glareOpposite: 0.8, angle: -Math.PI / 4, blur: 1,
};
// Navigation tuning: subtle dispersion, restrained highlights, readable backdrop.
const preset = { ...studioDefaults, thickness: 32, distance: 0.065, dispersion: 1.8,
  fresnelSize: 42, fresnelHardness: 0.12, fresnelIntensity: 0.26,
  glareSize: 36, glareIntensity: 0.55, glareOpposite: 0.65, blur: 7 };
const padding = 40;

// DOM reconstruction, not an OS screenshot. Cache the actual document on
// content/layout changes; scroll only crops and uploads a small local texture.
export default function GlassNavigation({ page }: { page: 'home' | 'projects' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current, host = hostRef.current;
    const main = document.getElementById('main');
    if (!canvas || !host || !main) return;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return;
    let renderer: MultiPassRenderer | undefined, texture: WebGLTexture | undefined;
    let frame = 0, captureTimer = 0;
    let disposed = false, captureBusy = false, captureAgain = false;
    let snapshot: HTMLCanvasElement | undefined;
    let snapshotTop = 0;
    let lightAngle = preset.angle;
    const crop = document.createElement('canvas');
    const ctx = crop.getContext('2d')!;
    try {
      renderer = new MultiPassRenderer(canvas, [
        { name: 'bgPass', shader: { vertex, fragment: background } },
        { name: 'vBlurPass', shader: { vertex, fragment: verticalBlur }, inputs: { u_prevPassTexture: 'bgPass' } },
        { name: 'hBlurPass', shader: { vertex, fragment: horizontalBlur }, inputs: { u_prevPassTexture: 'vBlurPass' } },
        { name: 'mainPass', shader: { vertex, fragment: glass }, inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' }, outputToScreen: true },
      ]);
      texture = createEmptyTexture(gl);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    } catch { renderer?.dispose(); return; }
    const draw = () => {
      if (disposed || !renderer || !texture || !snapshot) return;
      const { width, height, left, top } = host.getBoundingClientRect();
      const rimThickness = Math.min(7, preset.thickness * height / 320);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round((width + padding * 2) * dpr), h = Math.round((height + padding * 2) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h); renderer.resize(w, h);
      }
      // The DOM canvas persists across route changes, but this crop is new.
      // Resize independently or a default 300px crop gets stretched to 820px.
      if (crop.width !== w || crop.height !== h) { crop.width = w; crop.height = h; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#faf8f4'; ctx.fillRect(0, 0, w / dpr, h / dpr);
      ctx.drawImage(snapshot, -(left + window.scrollX - padding), -(top + window.scrollY - padding - snapshotTop));
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crop);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      const buttonRects = [...host.querySelectorAll<HTMLAnchorElement>('.navigation-links a')].map(link => {
        const box = link.getBoundingClientRect();
        return [box.left - left + padding + box.width / 2,
          height + padding - (box.top - top + box.height / 2), box.width, box.height];
      });
      renderer.setUniforms({
        u_resolution: [w, h], u_dpr: dpr,
        u_mouse: [w / 2, h / 2], u_mouseSpring: [w / 2, h / 2],
        u_shapeWidth: width - 2, u_shapeHeight: height - 2, u_shapeRadius: height / 2 - 1,
        u_shapeRoundness: 2.4, u_mergeRate: 0.01, u_showShape1: 0,
        u_blurRadius: preset.blur, u_blurWeights: computeGaussianKernelByRadius(preset.blur),
      });
      renderer.render({
        bgPass: { u_bgType: 3, u_bgTexture: texture, u_bgTextureReady: 1, u_bgTextureRatio: w / h,
          u_shadowExpand: 3, u_shadowFactor: 0, u_shadowPosition: [0, 0] },
        mainPass: { u_tint: [1, 0.99, 0.97, 0.5], u_refThickness: rimThickness, u_refDistance: preset.distance * height / 320,
          u_refFactor: preset.refraction, u_refDispersion: preset.dispersion,
          u_navButton0: buttonRects[0], u_navButton1: buttonRects[1],
          u_navSelected: page === 'home' ? 0 : 1,
          u_refFresnelRange: preset.fresnelSize, u_refFresnelHardness: preset.fresnelHardness,
          u_refFresnelFactor: preset.fresnelIntensity, u_glareRange: preset.glareSize,
          u_glareHardness: preset.glareHardness, u_glareConvergence: preset.glareConvergence,
          u_glareOppositeFactor: preset.glareOpposite, u_glareFactor: preset.glareIntensity,
          u_glareAngle: lightAngle, u_blurEdge: 0, u_transparentOverlay: 2, STEP: 9 },
      });
      host.dataset.glassReady = 'true';
      canvas.dataset.renderer = 'liquid-glass-studio-webgl2';
      canvas.dataset.source = 'page-dom';
      canvas.dataset.scrollY = String(Math.round(window.scrollY));
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    const capture = async () => {
      if (disposed) return;
      if (captureBusy) { captureAgain = true; return; }
      captureBusy = true;
      host.dataset.capturing = 'true';
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      try {
        const { default: html2canvas } = await import('html2canvas');
        await document.fonts.ready;
        await Promise.all(main.getAnimations().map(animation => animation.finished.catch(() => undefined)));
        if (disposed) return;
        // html2canvas restores the parent scroll after creating its hidden
        // iframe. Ensure that restoration is instant, not a queued smooth scroll.
        document.documentElement.style.scrollBehavior = 'auto';
        const transform = getComputedStyle(main).transform;
        const animatedOffset = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
        const documentTop = main.getBoundingClientRect().top + window.scrollY - animatedOffset;
        const image = await html2canvas(main, {
          scale: 1, backgroundColor: '#faf8f4', logging: false, useCORS: true,
          onclone: async doc => {
            const cloned = doc.getElementById('main');
            if (cloned) { cloned.style.animation = 'none'; cloned.style.transform = 'none'; cloned.style.opacity = '1'; }
            const images = [...doc.querySelectorAll('img')];
            images.forEach(img => { img.loading = 'eager'; });
            // Below-fold lazy images must establish their intrinsic height before
            // html2canvas measures the grid; otherwise its cached rows drift.
            await Promise.all(images.map(img => img.decode().catch(() => undefined)));
            if (disposed) return;
            const selectors = '.simulation-media, .simulation-title, .coecho-copy, .publication-copy';
            const originals = [...main.querySelectorAll<HTMLElement>(selectors)];
            const clones = [...doc.querySelectorAll<HTMLElement>(`#main ${selectors.split(', ').join(', #main ')}`)];
            const errors = originals.map((el, index) => {
              const other = clones[index];
              if (!other) return 0;
              return Math.abs(el.getBoundingClientRect().top + window.scrollY -
                (other.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0)));
            });
            canvas.dataset.alignmentError = String(Math.max(0, ...errors).toFixed(2));
          },
        });
        if (!disposed) {
          snapshot = image; snapshotTop = documentTop;
          canvas.dataset.captureWidth = String(image.width);
          canvas.dataset.captureHeight = String(image.height);
          schedule();
        }
      } catch { delete host.dataset.glassReady; }
      finally {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
        delete host.dataset.capturing;
        captureBusy = false;
        if (captureAgain && !disposed) { captureAgain = false; queueCapture(); }
      }
    };
    const queueCapture = () => {
      window.clearTimeout(captureTimer);
      captureTimer = window.setTimeout(() => { void capture(); }, 160);
    };
    const onImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement && main.contains(event.target)) queueCapture();
    };
    const observer = new ResizeObserver(queueCapture);
    observer.observe(main); observer.observe(host);
    const onLost = (event: Event) => { event.preventDefault(); delete host.dataset.glassReady; };
    const onPointerMove = (event: PointerEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = host.getBoundingClientRect();
      lightAngle = preset.angle + ((event.clientX - rect.left) / rect.width - 0.5) * 0.24;
      schedule();
    };
    const onPointerLeave = () => { lightAngle = preset.angle; schedule(); };
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('webglcontextlost', onLost);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', queueCapture);
    main.addEventListener('load', onImageLoad, true);
    queueCapture();
    return () => {
      disposed = true; cancelAnimationFrame(frame); window.clearTimeout(captureTimer); observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', queueCapture);
      main.removeEventListener('load', onImageLoad, true);
      delete host.dataset.glassReady; snapshot = undefined;
      renderer?.dispose(); if (texture) gl.deleteTexture(texture);
    };
  }, [page]);
  return (
    <nav className="navigation glass" ref={hostRef} aria-label="Main navigation">
      <canvas ref={canvasRef} className="navigation-optics" aria-hidden="true" data-html2canvas-ignore="true" />
      <a className="wordmark" href="#/" aria-label="Jialu Xu — Homepage">Jialu Xu</a>
      <div className={`navigation-links ${page === 'projects' ? 'on-projects' : ''}`}>
        <span className="navigation-selection" aria-hidden="true" />
        <a href="#/" aria-current={page === 'home' ? 'page' : undefined}>Homepage</a>
        <a href="#/projects" aria-current={page === 'projects' ? 'page' : undefined}>Projects</a>
      </div>
    </nav>
  );
}
