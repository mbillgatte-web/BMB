"use client";

import { useEffect, useRef } from "react";
import type * as ThreeNS from "three";

export default function AICharacter3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: ThreeNS.WebGLRenderer | null = null;
    let animationId = 0;
    let handleResize: (() => void) | null = null;
    let isDisposed = false;

    // Import dynamique : three.js utilise `window`, donc impossible à charger côté serveur (SSR)
    import("three").then((THREE) => {
      const container = containerRef.current;
      if (isDisposed || !container) return;

      const width = container.clientWidth || 300;
      const height = container.clientHeight || 300;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const spotLight = new THREE.SpotLight(0x6366f1, 1);
      spotLight.position.set(5, 5, 5);
      scene.add(spotLight);

      const group = new THREE.Group();

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      head.position.y = 1.6;
      group.add(head);

      const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.15, 1.65, 0.45);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.15, 1.65, 0.45);
      group.add(eyeL, eyeR);

      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.4, 0.8, 4, 16),
        new THREE.MeshPhongMaterial({ color: 0x6366f1 })
      );
      body.position.y = 0.8;
      group.add(body);

      const armGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
      const armMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const armL = new THREE.Mesh(armGeo, armMat);
      armL.position.set(-0.6, 1.1, 0);
      armL.rotation.z = Math.PI / 4;
      const armR = new THREE.Mesh(armGeo, armMat);
      armR.position.set(0.6, 1.1, 0);
      armR.rotation.z = -Math.PI / 4;
      group.add(armL, armR);

      scene.add(group);
      camera.position.z = 4;
      camera.position.y = 1;

      let time = 0;
      function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.05;
        group.position.y = Math.sin(time * 0.5) * 0.1;
        head.rotation.x = Math.sin(time * 0.8) * 0.05;
        head.rotation.y = Math.cos(time * 0.3) * 0.1;
        armR.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.2;
        armR.position.y = 1.1 + Math.sin(time * 2) * 0.05;
        renderer!.render(scene, camera);
      }
      animate();

      handleResize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer!.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", handleResize);
    });

    // Nettoyage impératif : sans ça, chaque fois qu'on quitte/revient sur le dashboard,
    // une nouvelle scène 3D s'empilerait sur l'ancienne (fuite mémoire)
    return () => {
      isDisposed = true;
      if (animationId) cancelAnimationFrame(animationId);
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (renderer) renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
