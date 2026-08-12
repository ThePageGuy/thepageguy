// Mobile Menu functionality
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
  mobileMenu.classList.add("active");
  menuOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileMenu.classList.remove("active");
  menuOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

menuBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

// Close menu on link click
const mobileLinks = mobileMenu.getElementsByTagName("a");
Array.from(mobileLinks).forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Digital Globe
const createGlobe = () => {
  const canvas = document.getElementById("globe");

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function updateSize() {
    const container = document.querySelector(".sphere-container");

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Same sizing behavior as your original code
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  updateSize();
  window.addEventListener("resize", updateSize);

  // --------------------------------------------------
  // Globe
  // --------------------------------------------------

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const radius = 1;

  // --------------------------------------------------
  // Subtle globe surface
  // --------------------------------------------------

  const globeGeometry = new THREE.SphereGeometry(radius, 48, 48);

  const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });

  const globe = new THREE.Mesh(globeGeometry, globeMaterial);

  globeGroup.add(globe);

  // --------------------------------------------------
  // Latitude / Longitude grid
  // --------------------------------------------------

  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.14,
  });

  // Latitude
  for (let lat = -75; lat <= 75; lat += 15) {
    const points = [];

    const latitude = THREE.MathUtils.degToRad(lat);

    const y = radius * Math.sin(latitude);

    const ringRadius = radius * Math.cos(latitude);

    for (let i = 0; i <= 96; i++) {
      const longitude = (i / 96) * Math.PI * 2;

      const x = ringRadius * Math.cos(longitude);

      const z = ringRadius * Math.sin(longitude);

      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, gridMaterial);

    globeGroup.add(line);
  }

  // Longitude
  for (let lon = 0; lon < 360; lon += 15) {
    const points = [];

    const longitude = THREE.MathUtils.degToRad(lon);

    for (let i = 0; i <= 64; i++) {
      const latitude = -Math.PI / 2 + (i / 64) * Math.PI;

      const x = radius * Math.cos(latitude) * Math.cos(longitude);

      const y = radius * Math.sin(latitude);

      const z = radius * Math.cos(latitude) * Math.sin(longitude);

      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, gridMaterial);

    globeGroup.add(line);
  }

  // --------------------------------------------------
  // Digital Nodes
  // --------------------------------------------------

  const points = [];
  const nodeCount = 180;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2;

    const radiusAtY = Math.sqrt(1 - y * y);

    const theta = goldenAngle * i;

    const x = Math.cos(theta) * radiusAtY;

    const z = Math.sin(theta) * radiusAtY;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }

  const pointGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const pointMaterial = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.025,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const pointCloud = new THREE.Points(pointGeometry, pointMaterial);

  globeGroup.add(pointCloud);

  // --------------------------------------------------
  // Digital Connections
  // --------------------------------------------------

  const linePositions = [];
  const connectionDistance = 0.38;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < connectionDistance) {
        linePositions.push(
          points[i].x,
          points[i].y,
          points[i].z,

          points[j].x,
          points[j].y,
          points[j].z,
        );
      }
    }
  }

  const connectionGeometry = new THREE.BufferGeometry();

  connectionGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );

  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.12,
  });

  const connections = new THREE.LineSegments(
    connectionGeometry,
    connectionMaterial,
  );

  globeGroup.add(connections);

  // --------------------------------------------------
  // Location Marker
  // --------------------------------------------------

  // Tegucigalpa, Honduras
  const latitude = 14.0723;
  const longitude = -87.1921;

  const phi = THREE.MathUtils.degToRad(90 - latitude);

  const theta = THREE.MathUtils.degToRad(longitude + 180);

  const markerX = radius * Math.sin(phi) * Math.cos(theta);

  const markerY = radius * Math.cos(phi);

  const markerZ = radius * Math.sin(phi) * Math.sin(theta);

  const markerGeometry = new THREE.SphereGeometry(0.035, 20, 20);

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3366,
  });

  const marker = new THREE.Mesh(markerGeometry, markerMaterial);

  marker.position.set(markerX, markerY, markerZ);

  globeGroup.add(marker);

  // --------------------------------------------------
  // Marker Pulse
  // --------------------------------------------------

  const pulseGeometry = new THREE.SphereGeometry(0.055, 20, 20);

  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3366,
    transparent: true,
    opacity: 0.3,
  });

  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);

  pulse.position.set(markerX, markerY, markerZ);

  globeGroup.add(pulse);

  // --------------------------------------------------
  // Atmosphere
  // --------------------------------------------------

  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.04, 48, 48);

  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  globeGroup.add(atmosphere);

  // --------------------------------------------------
  // Camera
  // --------------------------------------------------

  // Same basic framing as the original
  camera.position.z = 3;

  // --------------------------------------------------
  // Animation
  // --------------------------------------------------

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth rotation
    globeGroup.rotation.y = elapsed * 0.12;

    // Very subtle floating movement
    globeGroup.rotation.x = Math.sin(elapsed * 0.25) * 0.04;

    // Pulse
    const scale = 1 + Math.sin(elapsed * 3) * 0.35;

    pulse.scale.set(scale, scale, scale);

    pulseMaterial.opacity = 0.25 - Math.sin(elapsed * 3) * 0.12;

    renderer.render(scene, camera);
  }

  animate();
};

// Initialize globe
createGlobe();
