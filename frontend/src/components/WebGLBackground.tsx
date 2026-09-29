import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_scroll;
  varying vec2 vUv;

  void main() {
    vec2 uv = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
    float time = u_time * 0.22;

    vec2 p = uv * 2.2;
    mat2 rot = mat2(cos(0.5), -sin(0.5), sin(0.5), cos(0.5));
    p = rot * p;
    p.x += time * 0.3;
    p.y += time * 0.2 - (u_scroll * 0.25);

    float wave = 0.0;
    vec2 q = p;

    for (float i = 1.0; i <= 6.0; i++) {
      q.x += 0.5 * sin(q.y * 1.3 + time * 0.7 + i * 1.2);
      q.y += 0.5 * cos(q.x * 1.2 - time * 0.5 + i * 0.8);
      float ridge = 1.0 - abs(sin(q.x + q.y));
      wave += (ridge * ridge) / i;
    }

    vec3 bgColor = vec3(0.01, 0.03, 0.1);
    vec3 midColor = vec3(0.65, 0.02, 0.04);
    vec3 hiColor = vec3(0.95, 0.05, 0.05);

    float mask = smoothstep(0.15, 1.1, wave);
    vec3 color = mix(bgColor, midColor, mask * 0.95);
    color += hiColor * pow(wave * 0.65, 3.5);

    vec2 centerUv = vUv - 0.5;
    float vignette = 1.0 - dot(centerUv, centerUv) * 0.7;
    color *= smoothstep(0.0, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_scroll: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let targetScroll = 0;
    let currentScroll = 0;
    const onScroll = () => {
      targetScroll = window.scrollY * 0.0004;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const clock = new THREE.Clock();
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      currentScroll += (targetScroll - currentScroll) * 0.08;
      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_scroll.value = currentScroll;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}