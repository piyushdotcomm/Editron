"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import {
  brainVertexHeader,
  brainVertexTransform,
  brainFragmentColor,
  frontVertexShader,
  frontVertexTransform,
  frontFragmentHeader,
  mapRange,
  clamp,
  calcFrustumSize,
} from "./dala-shaders";

export function DalaBrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;
    let animFrameId: number;

    const isDesktop = window.innerWidth >= 768;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(isDesktop ? 1 : 2);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 30);
    camera.position.set(0, 0, 10);
    camera.setFocalLength(35);
    camera.updateProjectionMatrix();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const factor = isDesktop ? 1.80 : 1.6;
    const baseScale = isDesktop ? 1.45 : 1.05;
    const numInstances = 10000;
    const numFrontCones = 250;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const baseRotY = 0.30 * Math.PI;
    const initialPosX = isDesktop ? 1.95 : 0.6;
    const initialPosY = isDesktop ? -0.04 : 1.2;
    const currentRot = { x: 0.06, y: baseRotY, z: 0 };
    const targetRot = { x: 0.06, y: baseRotY, z: 0 };
    const currentPos = { x: initialPosX, y: initialPosY };
    const targetPos = { x: initialPosX, y: initialPosY };
    const currentExplode = { val: 0 };
    const targetExplode = { val: 0 };
    const currentProgress = { val: 0 };
    const targetProgress = { val: 0 };

    const offsetVector = new THREE.Vector3(currentPos.x, currentPos.y, 0);
    const pSize = calcFrustumSize(camera, 10);

    const uniforms = {
      t_scale: { value: null as THREE.Texture | null },
      t_color: { value: null as THREE.Texture | null },
      u_time: { value: 0 },
      u_scale: { value: baseScale },
      u_amplitude: { value: 0.619 },
      u_colorFactor: { value: 1.32 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(pSize.width, pSize.height) },
      u_rotation: { value: new THREE.Vector3(0, 0, 0) },
      u_offset: { value: offsetVector },
      u_delta: { value: new THREE.Vector2(0, 0) },
      u_explode: { value: 0 },
      u_progress: { value: 0 },
      u_mobileRotation: { value: isDesktop ? 0.0 : Math.PI },
    };
    (window as Window & { __dala?: unknown }).__dala = {
      uniforms,
      targetRot,
      targetPos,
      currentRot,
      currentPos,
    };

    const frontFrustum = calcFrustumSize(camera, 9.9);
    const frontUniforms = {
      u_time: { value: 0 },
      u_scale: { value: 1.0 },
      u_resolution: { value: new THREE.Vector2(frontFrustum.width, frontFrustum.height) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
    };

    const gltfLoader = new GLTFLoader();
    const exrLoader = new EXRLoader();
    const textureLoader = new THREE.TextureLoader();

    let brainMesh: THREE.InstancedMesh | null = null;
    let frontConesMesh: THREE.InstancedMesh | null = null;

    async function loadAssets() {
      try {
        const [gltf, exrData, scaleTex, colorTex] = await Promise.all([
          gltfLoader.loadAsync("/assets/dala/models/py-lod7.glb"),
          exrLoader.loadAsync("/assets/dala/images/pos-33.exr"),
          textureLoader.loadAsync("/assets/dala/images/sc-33.png"),
          textureLoader.loadAsync("/assets/dala/images/cd-33.png"),
        ]);

        if (isDestroyed) return;

        scaleTex.minFilter = scaleTex.magFilter = THREE.LinearFilter;
        scaleTex.flipY = false;
        scaleTex.needsUpdate = true;
        colorTex.minFilter = colorTex.magFilter = THREE.LinearFilter;
        colorTex.flipY = false;
        colorTex.needsUpdate = true;
        uniforms.t_scale.value = scaleTex;
        uniforms.t_color.value = colorTex;

        let pyramidGeom: THREE.BufferGeometry | null = null;
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && !pyramidGeom) {
            pyramidGeom = (child as THREE.Mesh).geometry.clone();
          }
        });

        if (!pyramidGeom) return;

        const brainGeom = (pyramidGeom as THREE.BufferGeometry).clone();
        const rawData = exrData.image.data;
        const w = 200;

        const pos1 = new Float32Array(numInstances * 3);
        const pos2 = new Float32Array(numInstances * 3);
        const pos3 = new Float32Array(numInstances * 3);
        const pos4 = new Float32Array(numInstances * 3);

        const a_id = new Float32Array(numInstances * 2);
        const a_random = new Float32Array(numInstances * 4);
        const a_angle = new Float32Array(numInstances * 4);
        const a_index = new Float32Array(numInstances);

        for (let i = 0; i < numInstances; i++) {
          const col = i % 100;
          const row = Math.floor(i / 100);

          const idx1 = ((row + 100) * w + col) * 4;
          pos1[i * 3] = (THREE.DataUtils.fromHalfFloat(rawData[idx1]) - 0.5) * 2.0 * factor;
          pos1[i * 3 + 1] = (THREE.DataUtils.fromHalfFloat(rawData[idx1 + 1]) - 0.5) * 2.0 * factor;
          pos1[i * 3 + 2] = (THREE.DataUtils.fromHalfFloat(rawData[idx1 + 2]) - 0.5) * 2.0 * factor;

          const idx2 = ((row + 100) * w + (col + 100)) * 4;
          pos2[i * 3] = (THREE.DataUtils.fromHalfFloat(rawData[idx2]) - 0.5) * 2.0 * factor;
          pos2[i * 3 + 1] = (THREE.DataUtils.fromHalfFloat(rawData[idx2 + 1]) - 0.5) * 2.0 * factor;
          pos2[i * 3 + 2] = (THREE.DataUtils.fromHalfFloat(rawData[idx2 + 2]) - 0.5) * 2.0 * factor;

          const idx3 = (row * w + col) * 4;
          pos3[i * 3] = (THREE.DataUtils.fromHalfFloat(rawData[idx3]) - 0.5) * 2.0 * factor;
          pos3[i * 3 + 1] = (THREE.DataUtils.fromHalfFloat(rawData[idx3 + 1]) - 0.5) * 2.0 * factor;
          pos3[i * 3 + 2] = (THREE.DataUtils.fromHalfFloat(rawData[idx3 + 2]) - 0.5) * 2.0 * factor;

          const idx4 = (row * w + (col + 100)) * 4;
          pos4[i * 3] = (THREE.DataUtils.fromHalfFloat(rawData[idx4]) - 0.5) * 2.0 * factor;
          pos4[i * 3 + 1] = (THREE.DataUtils.fromHalfFloat(rawData[idx4 + 1]) - 0.5) * 2.0 * factor;
          pos4[i * 3 + 2] = (THREE.DataUtils.fromHalfFloat(rawData[idx4 + 2]) - 0.5) * 2.0 * factor;

          a_id[i * 2] = col / 200 + 0.0025;
          a_id[i * 2 + 1] = row / 200 + 0.0025;

          a_random[i * 4] = i % 2 === 0 ? Math.random() : -1 * Math.random();
          a_random[i * 4 + 1] = 0.8 * Math.random() + 0.2;
          a_random[i * 4 + 2] = isDesktop ? 0.5 * Math.random() + 0.5 : 0.5 * Math.random();
          a_random[i * 4 + 3] = 0;

          a_angle[i * 4] = Math.random();
          a_angle[i * 4 + 1] = Math.random();
          a_angle[i * 4 + 2] = Math.random();
          a_angle[i * 4 + 3] = Math.random();

          a_index[i] = i;
        }

        brainGeom.setAttribute("a_pos1", new THREE.InstancedBufferAttribute(pos1, 3));
        brainGeom.setAttribute("a_pos2", new THREE.InstancedBufferAttribute(pos2, 3));
        brainGeom.setAttribute("a_pos3", new THREE.InstancedBufferAttribute(pos3, 3));
        brainGeom.setAttribute("a_pos4", new THREE.InstancedBufferAttribute(pos4, 3));

        brainGeom.setAttribute("a_id", new THREE.InstancedBufferAttribute(a_id, 2));
        brainGeom.setAttribute("a_random", new THREE.InstancedBufferAttribute(a_random, 4));
        brainGeom.setAttribute("a_angle", new THREE.InstancedBufferAttribute(a_angle, 4));
        brainGeom.setAttribute("a_index", new THREE.InstancedBufferAttribute(a_index, 1));

        const brainMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
        });

        brainMaterial.onBeforeCompile = (shader) => {
          shader.uniforms.t_scale = uniforms.t_scale;
          shader.uniforms.t_color = uniforms.t_color;
          shader.uniforms.u_time = uniforms.u_time;
          shader.uniforms.u_scale = uniforms.u_scale;
          shader.uniforms.u_amplitude = uniforms.u_amplitude;
          shader.uniforms.u_colorFactor = uniforms.u_colorFactor;
          shader.uniforms.u_mouse = uniforms.u_mouse;
          shader.uniforms.u_resolution = uniforms.u_resolution;
          shader.uniforms.u_rotation = uniforms.u_rotation;
          shader.uniforms.u_offset = uniforms.u_offset;
          shader.uniforms.u_delta = uniforms.u_delta;
          shader.uniforms.u_explode = uniforms.u_explode;
          shader.uniforms.u_progress = uniforms.u_progress;
          shader.uniforms.u_mobileRotation = uniforms.u_mobileRotation;

          shader.vertexShader = `${brainVertexHeader}\n${shader.vertexShader}`;
          shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", brainVertexTransform);

          shader.fragmentShader = `
            uniform sampler2D t_color;
            uniform float u_colorFactor;
            uniform float u_explode;
            uniform float u_progress;
            varying vec2 v_id;
            varying vec3 v_pos;
            varying float v_hover;
            ${shader.fragmentShader}
          `;

          const fragTarget = shader.fragmentShader.includes("#include <opaque_fragment>")
            ? "#include <opaque_fragment>"
            : "#include <output_fragment>";

          shader.fragmentShader = shader.fragmentShader.replace(fragTarget, brainFragmentColor);
        };

        brainMesh = new THREE.InstancedMesh(brainGeom, brainMaterial, numInstances);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < numInstances; i++) {
          dummy.position.set(0, 0, 0);
          dummy.scale.set(0.075, 0.075, 0.075);
          dummy.updateMatrix();
          brainMesh.setMatrixAt(i, dummy.matrix);
        }
        brainMesh.instanceMatrix.needsUpdate = true;
        brainMesh.position.set(0, 0, 0);
        brainMesh.rotation.set(0, 0, 0);
        scene.add(brainMesh);

        // 2. Foreground floating pyramids
        const frontGeom = (pyramidGeom as THREE.BufferGeometry).clone();
        const a_param = new Float32Array(numFrontCones * 4);
        const a_color = new Float32Array(numFrontCones * 4);
        const a_angleFront = new Float32Array(numFrontCones * 4);

        const brandColors = [
          { r: 93 / 255, g: 57 / 255, b: 154 / 255 }, { r: 186 / 255, g: 136 / 255, b: 43 / 255 },
          { r: 40 / 255, g: 116 / 255, b: 100 / 255 }, { r: 164 / 255, g: 148 / 255, b: 175 / 255 }
        ];

        frontConesMesh = new THREE.InstancedMesh(frontGeom, new THREE.MeshBasicMaterial({
          transparent: true, depthWrite: false, vertexColors: true,
        }), numFrontCones);

        const dummyFront = new THREE.Object3D();
        for (let i = 0; i < numFrontCones; i++) {
          const px = 2 * Math.random() - 1;
          const py = 2 * Math.random() - 1;
          const pz = 9.0 * Math.random();
          const pScale = isDesktop ? 0.075 : 0.05;

          dummyFront.position.set(px, py, pz);
          dummyFront.scale.set(pScale, pScale, pScale);
          dummyFront.updateMatrix();
          frontConesMesh.setMatrixAt(i, dummyFront.matrix);

          const c = brandColors[i % 4];
          a_color[4 * i] = c.r;
          a_color[4 * i + 1] = c.g;
          a_color[4 * i + 2] = c.b;
          a_color[4 * i + 3] = Math.random() * 0.7 + 0.3;

          a_angleFront[4 * i] = 2 * Math.random() - 1;
          a_angleFront[4 * i + 1] = 2 * Math.random() - 1;
          a_angleFront[4 * i + 2] = 2 * Math.random() - 1;
          a_angleFront[4 * i + 3] = (2 * Math.random() - 1) * Math.PI;

          a_param[4 * i] = Math.random();
          a_param[4 * i + 1] = Math.random();
          a_param[4 * i + 2] = Math.random();
          a_param[4 * i + 3] = Math.random();
        }
        frontConesMesh.instanceMatrix.needsUpdate = true;

        frontGeom.setAttribute("a_param", new THREE.InstancedBufferAttribute(a_param, 4));
        frontGeom.setAttribute("a_color", new THREE.InstancedBufferAttribute(a_color, 4));
        frontGeom.setAttribute("a_angle", new THREE.InstancedBufferAttribute(a_angleFront, 4));

        const frontMaterial = frontConesMesh.material as THREE.MeshBasicMaterial;
        frontMaterial.onBeforeCompile = (shader) => {
          shader.uniforms.u_time = frontUniforms.u_time;
          shader.uniforms.u_scale = frontUniforms.u_scale;
          shader.uniforms.u_resolution = frontUniforms.u_resolution;
          shader.uniforms.u_mouse = frontUniforms.u_mouse;

          shader.vertexShader = `${frontVertexShader}\n${shader.vertexShader}`;
          shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", frontVertexTransform);

          shader.fragmentShader = `${frontFragmentHeader}\n${shader.fragmentShader}`;
          const fragTargetFront = shader.fragmentShader.includes("#include <opaque_fragment>")
            ? "#include <opaque_fragment>"
            : "#include <output_fragment>";

          shader.fragmentShader = shader.fragmentShader.replace(
            fragTargetFront,
            `outgoingLight = v_color.rgb; gl_FragColor = vec4(outgoingLight, v_color.a);`
          );
        };

        frontConesMesh.position.set(0, 0, 0.1);
        scene.add(frontConesMesh);
        setLoaded(true);
      } catch (err) {
        console.error("Error loading Dala 3D scene:", err);
      }
    }

    loadAssets();

    const onPointerMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const sectionEls = document.querySelectorAll('.js-section');
      let e = 0;
      if (sectionEls && sectionEls.length > 0) {
        for (let i = 0; i < sectionEls.length; i++) {
          const el = sectionEls[i] as HTMLElement;
          const rect = el.getBoundingClientRect();
          const top = rect.top + scrollY;
          const height = Math.max(1, el.offsetHeight || rect.height);
          const nextTop = i < sectionEls.length - 1
            ? (sectionEls[i + 1] as HTMLElement).getBoundingClientRect().top + scrollY
            : top + height;
          const span = Math.max(1, nextTop - top);
          if (scrollY >= top && (i === sectionEls.length - 1 || scrollY < nextTop)) {
            e = i + clamp((scrollY - top) / span, 0, 1);
            break;
          }
        }
      } else {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        e = clamp(scrollY / maxScroll, 0, 1) * 6.0;
      }

      if (isDesktop) {
        targetPos.x = clamp(mapRange(e, 0, 1, 1.95, -4.5), -4.5, 1.95)
          + clamp(mapRange(e, 1.25, 1.5, 0.905, 5), 0.905, 5)
          - clamp(mapRange(e, 2.8, 3, 0.905, 3), 0.905, 3)
          + clamp(mapRange(e, 3.3, 3.5, 0.905, 6), 0.905, 6)
          - clamp(mapRange(e, 4.5, 5, 0.905, 5), 0.905, 4);

        const n = clamp(mapRange(e, 2.7, 3, 0, 0.5), 0, 0.5)
          - clamp(mapRange(e, 3.3, 3.5, 0, 0.5), 0, 0.5)
          + clamp(mapRange(e, 5.7, 6, 0, 1.75), 0, 1.75);
        targetPos.y = -0.04 + n;

        targetExplode.val = clamp(mapRange(e, 1.1, 2.2, 0, 1), 0, 1)
          - clamp(mapRange(e, 2.8, 3, 0, 1), 0, 1)
          + clamp(mapRange(e, 4.5, 5, 0, 1), 0, 1)
          - clamp(mapRange(e, 5.7, 6, 0, 1), 0, 1);
      } else {
        targetPos.x = clamp(mapRange(e, 0, 1, 1.5, 0), 0, 1.5);
        targetPos.y = 2.0;
        targetExplode.val = clamp(mapRange(e, 1.4, 1.7, 0, 1), 0, 1)
          - clamp(mapRange(e, 2.7, 3, 0, 1), 0, 1)
          + clamp(mapRange(e, 4.5, 5, 0, 1), 0, 1)
          - clamp(mapRange(e, 5.7, 5.8, 0, 1), 0, 1);
      }

      targetProgress.val = clamp(mapRange(e, 2.7, 3, 0, 1), 0, 1)
        + clamp(mapRange(e, 3.3, 3.5, 0, 1), 0, 1)
        + clamp(mapRange(e, 5.7, 6, 0, 1), 0, 1);

      const rotYEnd = isDesktop ? 6.0 : 5.8;
      targetRot.y = baseRotY
        + clamp(mapRange(e, 0, 1, 0, -0.5 * Math.PI), -0.5 * Math.PI, 0)
        + clamp(mapRange(e, 2.7, 3.0, 0, 0.5 * Math.PI), 0, 0.5 * Math.PI)
        + clamp(mapRange(e, 3.3, 3.5, 0, 0.25 * Math.PI), 0, 0.25 * Math.PI)
        - clamp(mapRange(e, 4.5, 5.0, 0, 1.25 * Math.PI), 0, 1.25 * Math.PI)
        + clamp(mapRange(e, 5.7, rotYEnd, 0, Math.PI), 0, Math.PI);

      targetRot.x = clamp(mapRange(e, 0, 1, 0.06, 0), 0, 0.06);

      targetRot.z = clamp(mapRange(e, 2.7, 3.0, 0, -0.489), -0.489, 0)
        + clamp(mapRange(e, 3.3, 3.5, 0, 0.6), 0, 0.6);
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const ps = calcFrustumSize(camera, 10);
      uniforms.u_resolution.value.set(ps.width, ps.height);

      const fps = calcFrustumSize(camera, 9.9);
      frontUniforms.u_resolution.value.set(fps.width, fps.height);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      uniforms.u_time.value = elapsedTime;
      frontUniforms.u_time.value = elapsedTime;

      const easing = 0.08;
      const deltaX = (mouse.targetX - mouse.x) * easing;
      const deltaY = (mouse.targetY - mouse.y) * easing;
      mouse.x += deltaX;
      mouse.y += deltaY;

      uniforms.u_delta.value.set(deltaX * 5, deltaY * 5);
      uniforms.u_mouse.value.set(mouse.x, mouse.y);
      frontUniforms.u_mouse.value.set(mouse.x, mouse.y);

      currentPos.x += (targetPos.x - currentPos.x) * easing;
      currentPos.y += (targetPos.y - currentPos.y) * easing;
      offsetVector.x = currentPos.x;
      offsetVector.y = currentPos.y;

      currentRot.x += (targetRot.x - currentRot.x) * easing;
      currentRot.y += (targetRot.y - currentRot.y) * (0.04);
      currentRot.z += (targetRot.z - currentRot.z) * easing;
      uniforms.u_rotation.value.set(currentRot.x, currentRot.y, currentRot.z);

      currentExplode.val += (targetExplode.val - currentExplode.val) * easing;
      uniforms.u_explode.value = currentExplode.val;

      currentProgress.val += (targetProgress.val - currentProgress.val) * easing;
      uniforms.u_progress.value = currentProgress.val;

      camera.rotation.y += 0.05 * (-0.075 * mouse.x - camera.rotation.y);
      camera.rotation.x += 0.05 * (0.05 * mouse.y - camera.rotation.x);

      if (frontConesMesh) {
        frontConesMesh.position.x += (targetPos.x * 0.25 - frontConesMesh.position.x) * easing;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden bg-black" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_68%_45%,rgba(160,110,35,0.14),transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-screen bg-repeat" style={{ backgroundImage: "url('/assets/dala/images/noise.jpg')", backgroundSize: "200px 200px" }} />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/40 transition-opacity duration-700 pointer-events-none">
          Loading 3D experience...
        </div>
      )}
    </div>
  );
}
