import * as THREE from 'three';

console.log('Elvira Technologies Loaded');

// --- Three.js Hero Scene ---
const canvas = document.querySelector('#hero-canvas');
console.log('Hero Canvas found:', !!canvas);

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  console.log('Three.js Renderer Initialized');

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles (Neurons)
  const particlesCount = 100;
  const positions = new Float32Array(particlesCount * 3);
  const velocities = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    velocities[i] = (Math.random() - 0.5) * 0.005;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xff8d30, // Elvira Orange
    transparent: true,
    opacity: 0.6
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Lines (Connectors)
  const linesGeometry = new THREE.BufferGeometry();
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x0a192f, // Navy
    transparent: true,
    opacity: 0.05
  });
  const lineMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lineMesh);

  camera.position.z = 5;

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize Handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    const posAttr = geometry.attributes.position;
    const linePositions = [];

    for (let i = 0; i < particlesCount; i++) {
      // Move particles
      posAttr.array[i * 3] += velocities[i * 3];
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce off boundaries
      if (Math.abs(posAttr.array[i * 3]) > 6) velocities[i * 3] *= -1;
      if (Math.abs(posAttr.array[i * 3 + 1]) > 6) velocities[i * 3 + 1] *= -1;
      if (Math.abs(posAttr.array[i * 3 + 2]) > 6) velocities[i * 3 + 2] *= -1;

      // Connect lines
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = posAttr.array[i * 3] - posAttr.array[j * 3];
        const dy = posAttr.array[i * 3 + 1] - posAttr.array[j * 3 + 1];
        const dz = posAttr.array[i * 3 + 2] - posAttr.array[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 2.5) {
          linePositions.push(
            posAttr.array[i * 3], posAttr.array[i * 3 + 1], posAttr.array[i * 3 + 2],
            posAttr.array[j * 3], posAttr.array[j * 3 + 1], posAttr.array[j * 3 + 2]
          );
        }
      }
    }

    posAttr.needsUpdate = true;
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    // Smooth movement
    scene.rotation.y += (mouseX * 0.2 - scene.rotation.y) * 0.05;
    scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }

  animate();
}

// Header scroll effect
const header = document.querySelector('.navbar');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
