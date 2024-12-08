import "./style.css";

const canvas = document.getElementById("canvas");
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import gsap from "gsap";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

// Handle device pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// Create a loading manager
const loadingManager = new THREE.LoadingManager();

// Show loading screen
const loadingScreen = document.createElement("div");
loadingScreen.id = "loading-screen";
loadingScreen.innerHTML = `
  <div class="loader-container">
  <div class="loader">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <p id="loading-text">Please wait while we prepare your experience.</p>
</div>

`;
document.body.appendChild(loadingScreen);

// Hide loading screen when all assets are loaded
loadingManager.onLoad = () => {
  gsap.to("#loading-screen h1, #loading-screen p", {
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.to(loadingScreen, {
        y: window.innerHeight,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          document.getElementById("loading-screen").style.display = "none";
        },
      });
    },
  });
};

// Update loading text dynamically
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const loadingText = document.getElementById("loading-text");
  loadingText.textContent = `Loading ${itemsLoaded} out of ${itemsTotal} files...`;
};


// Load environment texture
const rgbLoader = new RGBELoader(loadingManager);
rgbLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// Add ambient light for overall scene illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for shadows and depth
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create a large sphere for the starry background
const textureLoader = new THREE.TextureLoader(loadingManager);
const starTexture = textureLoader.load("./stars.jpg");
starTexture.colorSpace = THREE.SRGBColorSpace;
const starSphereGeometry = new THREE.SphereGeometry(50, 64, 64);
const starSphereMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
scene.add(starSphere);

// Create orbiting spheres with textures
const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];
const spheres = new THREE.Group();
const spheresMesh = [];

for (let i = 0; i < 4; i++) {
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  spheresMesh.push(sphere);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

// Set camera position
camera.position.z = 9;

// Scroll and animation logic
let isThrottled = false;
let scrollCount = 0;

window.addEventListener("wheel", (event) => {
  if (!isThrottled) {
    isThrottled = true;
    scrollCount = (scrollCount + 1) % 4;

    gsap.to(spheres.rotation, {
      y: event.deltaY > 0 ? `+=${Math.PI / 2}` : `-=${Math.PI / 2}`,
      duration: 2,
      ease: "power2.inOut",
    });

    const headings = document.querySelectorAll(".heading");
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    });

    if (scrollCount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0`,
        ease: "power2.inOut",
      });
    }

    setTimeout(() => {
      isThrottled = false;
    }, 2000);
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  for (let i = 0; i < spheresMesh.length; i++) {
    spheresMesh[i].rotation.y = clock.getElapsedTime() * 0.02;
  }
  renderer.render(scene, camera);
}
animate();
