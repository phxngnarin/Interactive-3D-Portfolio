const gsap = window.gsap;
const Howl = window.Howl;
gsap.ticker.lagSmoothing(0);
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import {
  themeVertexShader,
  themeFragmentShader,
  smokeVertexShader,
  smokeFragmentShader,
} from "./shaders.js";
import {
  createNameLetters,
  applyNightTint,
  createInfoSign,
  createFrameInfoPlaque,
  createDeskPhotoFrame,
} from "./objects.js";
import { config } from "../config.js";


const backgroundMusic = new Howl({
  src: ["assets/audio/music/cosmic_candy.ogg"],
  loop: true,
  volume: 1,
});

const buttonSounds = {
  click: new Howl({
    src: ["assets/audio/sfx/click/bubble.ogg"],
    preload: true,
    volume: 0.5,
  }),
};


const canvas = document.querySelector("#experience-canvas");
const sizes = { width: window.innerWidth, height: window.innerHeight };

const scene = new THREE.Scene();
scene.background = new THREE.Color(config.sceneBackground || "#D9CAD1");

const ROOM_SCALE = 0.82;
const roomGroup = new THREE.Group();
roomGroup.name = "RoomGroup";
roomGroup.scale.setScalar(ROOM_SCALE);
scene.add(roomGroup);
const scaleVec = (arr) => arr.map((v) => v * ROOM_SCALE);

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5 * ROOM_SCALE;
controls.maxDistance = 45 * ROOM_SCALE;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

const DEFAULT_VIEW = {
  desktop: {
    pos: scaleVec([17.49173098423395, 9.108969527553887, 17.850992894238058]),
    target: scaleVec([0.4624746759408973, 1.9719940043010387, -0.8300979125494505]),
  },
  mobile: {
    pos: scaleVec([29.567116827654726, 14.018476147584705, 31.37040363900147]),
    target: scaleVec([-0.08206262548844094, 3.3119233527087255, -0.7433922282864018]),
  },
};

function isMobile() {
  return window.innerWidth < 768;
}

function setDefaultCamera() {
  const v = isMobile() ? DEFAULT_VIEW.mobile : DEFAULT_VIEW.desktop;
  camera.position.set(...v.pos);
  controls.target.set(...v.target);
  controls.update();
}
setDefaultCamera();

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("assets/draco/");

const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath("assets/textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);


const textureMap = {
  First: {
    day: "assets/textures/room/day/first_texture_set_day.webp",
    night: "assets/textures/room/night/first_texture_set_night.webp",
  },
  Second: {
    day: "assets/textures/room/day/second_texture_set_day.webp",
    night: "assets/textures/room/night/second_texture_set_night.webp",
  },
  Third: {
    day: "assets/textures/room/day/third_texture_set_day.webp",
    night: "assets/textures/room/night/third_texture_set_night.webp",
  },
  Fourth: {
    day: "assets/textures/room/day/fourth_texture_set_day.webp",
    night: "assets/textures/room/night/fourth_texture_set_night.webp",
  },
};

const loadedTextures = { day: {}, night: {} };
Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.minFilter = THREE.LinearFilter;
  dayTexture.magFilter = THREE.LinearFilter;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.minFilter = THREE.LinearFilter;
  nightTexture.magFilter = THREE.LinearFilter;
  loadedTextures.night[key] = nightTexture;
});

const roomTone = config.room || { enabled: false };
const toDeg1 = (deg) => ((deg % 360) + 360) % 360 / 360;

const createMaterialForTextureSet = (textureSet) => {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uDayTexture1: { value: loadedTextures.day.First },
      uNightTexture1: { value: loadedTextures.night.First },
      uDayTexture2: { value: loadedTextures.day.Second },
      uNightTexture2: { value: loadedTextures.night.Second },
      uDayTexture3: { value: loadedTextures.day.Third },
      uNightTexture3: { value: loadedTextures.night.Third },
      uDayTexture4: { value: loadedTextures.day.Fourth },
      uNightTexture4: { value: loadedTextures.night.Fourth },
      uMixRatio: { value: 0 },
      uTextureSet: { value: textureSet },
      uToneEnabled: { value: roomTone.enabled ? 1 : 0 },
      uSourceHue: { value: toDeg1(roomTone.sourceHue ?? 305) },
      uSourceRange: { value: (roomTone.sourceRange ?? 80) / 360 },
      uTargetHue: { value: toDeg1(roomTone.targetHue ?? 203) },
      uSpread: { value: roomTone.spread ?? 0.5 },
      uSaturation: { value: roomTone.saturation ?? 1 },
      uBrightness: { value: roomTone.brightness ?? 1 },
    },
    vertexShader: themeVertexShader,
    fragmentShader: themeFragmentShader,
  });
  return material;
};

const roomMaterials = {
  First: createMaterialForTextureSet(1),
  Second: createMaterialForTextureSet(2),
  Third: createMaterialForTextureSet(3),
  Fourth: createMaterialForTextureSet(4),
};

const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  color: 0xfbfbfb,
  metalness: 0,
  roughness: 0,
  ior: 3,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
  depthWrite: false,
  specularColor: 0xfbfbfb,
});
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const toonLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
toonLight.position.set(2.2, 4.5, 3.0);
roomGroup.add(toonLight);
const toonAmbient = new THREE.HemisphereLight(0xfff6ea, 0x3a4a63, 0.55);
roomGroup.add(toonAmbient);

function createToonGradientTexture(steps = 4) {
  const canvas = document.createElement("canvas");
  canvas.width = steps;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < steps; i++) {
    const v = Math.round((i / (steps - 1)) * 255);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i, 0, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}
const toonGradientMap = createToonGradientTexture(4);
const toonMaterial = new THREE.MeshToonMaterial({
  map: loadedTextures.day.Fourth,
  gradientMap: toonGradientMap,
});


const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(0.33, 1, 0.33);
const perlinTexture = textureLoader.load("assets/shaders/perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;
const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: smokeVertexShader,
  fragmentShader: smokeFragmentShader,
  uniforms: { uTime: new THREE.Uniform(0), uPerlinTexture: new THREE.Uniform(perlinTexture) },
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
});
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.83;
roomGroup.add(smoke);


const videoElement = document.createElement("video");
videoElement.src = config.work.idleVideo || "assets/textures/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play().catch(() => {});

const screenCanvas = document.createElement("canvas");
screenCanvas.width = 640;
screenCanvas.height = 386;
const screenCtx = screenCanvas.getContext("2d");
const screenTexture = new THREE.CanvasTexture(screenCanvas);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.flipY = false;

const screenMaterial = new THREE.MeshBasicMaterial({
  map: screenTexture,
  transparent: true,
  opacity: 0.96,
});

function drawCover(ctx, source, sw, sh, cw, ch) {
  if (!sw || !sh) return;
  const srcAspect = sw / sh;
  const dstAspect = cw / ch;
  let dw = cw,
    dh = ch,
    dx = 0,
    dy = 0,
    sx = 0,
    sy = 0,
    scw = sw,
    sch = sh;
  if (srcAspect > dstAspect) {
    scw = sh * dstAspect;
    sx = (sw - scw) / 2;
  } else {
    sch = sw / dstAspect;
    sy = (sh - sch) / 2;
  }
  ctx.drawImage(source, sx, sy, scw, sch, dx, dy, dw, dh);
}

const projectImages = config.work.projects.map((p) => {
  const img = new Image();
  img.src = p.image;
  return img;
});

const idleImage = config.work.idleImage
  ? (() => {
      const img = new Image();
      img.src = config.work.idleImage;
      return img;
    })()
  : null;

function updateScreenCanvas() {
  const cw = screenCanvas.width,
    ch = screenCanvas.height;
  screenCtx.fillStyle = "#cfd7e6";
  screenCtx.fillRect(0, 0, cw, ch);

  if (state.mode === "work" && state.index != null) {
    const img = projectImages[state.index];
    if (img.complete && img.naturalWidth) {
      drawCover(screenCtx, img, img.naturalWidth, img.naturalHeight, cw, ch);
    }
  } else if (idleImage && idleImage.complete && idleImage.naturalWidth) {
    drawCover(screenCtx, idleImage, idleImage.naturalWidth, idleImage.naturalHeight, cw, ch);
  } else if (videoElement.readyState >= 2) {
    drawCover(screenCtx, videoElement, videoElement.videoWidth, videoElement.videoHeight, cw, ch);
  }
  screenTexture.needsUpdate = true;
}


let fish, coffeePosition, hourHand, minuteHand, chairTop;
const xAxisFans = [];
const yAxisFans = [];
let workBtn, aboutBtn, contactBtn;
const frameMeshes = { Frame_1: null, Frame_2: null, Frame_3: null };
const contactSlots = [];
const raycasterObjects = [];
const bounceTargets = [];

function registerBounce(mesh) {
  mesh.userData.initialScale = mesh.scale.clone();
  bounceTargets.push(mesh);
}

loader.load("assets/models/Room_Portfolio.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (!child.isMesh) return;

    if (child.name.includes("Fish_Fourth")) {
      fish = child;
      child.position.x += 0.04;
      child.position.z -= 0.03;
      child.userData.initialPosition = child.position.clone();
    }
    if (child.name.includes("Chair_Top")) {
      chairTop = child;
      child.userData.initialRotation = child.rotation.clone();
    }
    if (child.name.includes("Hour_Hand")) {
      hourHand = child;
    }
    if (child.name.includes("Minute_Hand")) {
      minuteHand = child;
    }
    if (child.name.includes("Coffee")) {
      coffeePosition = child.position.clone();
    }

    if (child.name.includes("Kirby")) {
      child.visible = false;
    }

    if (child.name.includes("Name_Letter")) {
      child.visible = false;
    }

    if (child.name.includes("GitHub") || child.name.includes("YouTube") || child.name.includes("Twitter")) {
      contactSlots.push(child);
      child.visible = false;
    }

    if (child.name.includes("My_Work_Button")) {
      workBtn = child;
      child.scale.set(1, 1, 1);
      registerBounce(child);
      raycasterObjects.push(child);
    } else if (child.name.includes("About_Button")) {
      aboutBtn = child;
      child.scale.set(1, 1, 1);
      registerBounce(child);
      raycasterObjects.push(child);
    } else if (child.name.includes("Contact_Button")) {
      contactBtn = child;
      child.scale.set(1, 1, 1);
      registerBounce(child);
      raycasterObjects.push(child);
    } else if (child.name.includes("Frame_1")) {
      child.scale.set(1, 1, 1);
      frameMeshes.Frame_1 = child;
    } else if (child.name.includes("Frame_2")) {
      child.scale.set(1, 1, 1);
      frameMeshes.Frame_2 = child;
    } else if (child.name.includes("Frame_3")) {
      child.scale.set(1, 1, 1);
      frameMeshes.Frame_3 = child;
    } else if (child.name.includes("Hanging_Plank") || child.name.includes("Boba")) {
      child.scale.set(1, 1, 1);
    }

    if (child.name.includes("Water")) {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x558bc8,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      });
    } else if (child.name.includes("Glass")) {
      child.material = glassMaterial;
    } else if (child.name.includes("Bubble")) {
      child.material = whiteMaterial;
    } else if (child.name.includes("Screen")) {
      child.material = screenMaterial;
    } else if (child.name.includes("MrRabbit")) {
      child.material = toonMaterial;
    } else {
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          child.material = roomMaterials[key];
          if (child.name.includes("Fan")) {
            (child.name.includes("Fan_2") || child.name.includes("Fan_4") ? xAxisFans : yAxisFans).push(child);
          }
        }
      });
    }
  });

  if (coffeePosition) {
    smoke.position.set(coffeePosition.x, coffeePosition.y + 0.2, coffeePosition.z);
  }

  roomGroup.add(glb.scene);

  ["Frame_1", "Frame_2", "Frame_3"].forEach((key) => {
    if (frameMeshes[key]) raycasterObjects.push(frameMeshes[key]);
  });

  if (config.deskPhoto) {
    const deskFrame = createDeskPhotoFrame(config.deskPhoto.image, {
      width: 0.52,
      height: 0.66,
    });
    deskFrame.position.set(-2.32, 3.19 + 0.33, 0.25);
    deskFrame.rotation.y = Math.PI / 2;
    deskFrame.rotation.x = -0.12;
    roomGroup.add(deskFrame);
    registerBounce(deskFrame);
  }

  if (config.windowPhoto) {
    const windowFrame = createDeskPhotoFrame(config.windowPhoto.image, {
      width: 0.92,
      height: 1.56,
      border: 0.06,
      name: "Window_Photo_Frame_Fourth_Raycaster_Hover",
    });
    windowFrame.position.set(-0.973, 4.292, -4.175);
    roomGroup.add(windowFrame);
    registerBounce(windowFrame);
  }

  const fontLoader = new FontLoader();
  fontLoader.load("lib/fonts/helvetiker_bold.typeface.json", (font) => {
    const letters = createNameLetters(font, config.signName || "PHONGNARIN");
    letters.forEach((mesh) => {
      roomGroup.add(mesh);
      mesh.scale.set(0, 0, 0);
      registerBounce(mesh);
      gsap.to(mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        delay: 0.3 + Math.random() * 0.4,
        ease: "back.out(2)",
      });
    });

    if (contactSlots.length && config.contact?.sign) {
      const like = contactSlots[Math.floor(contactSlots.length / 2)] || contactSlots[0];
      const avgPos = contactSlots
        .reduce((sum, s) => sum.add(s.position), new THREE.Vector3())
        .multiplyScalar(1 / contactSlots.length);
      const signOffset = config.contact.sign.offset || { x: 0, y: 0, z: 0 };
      avgPos.x += signOffset.x || 0;
      avgPos.y += signOffset.y || 0;
      avgPos.z += signOffset.z || 0;
      const infoSign = createInfoSign(
        font,
        { position: avgPos, quaternion: like.quaternion },
        {
          title: config.contact.sign.name,
          lines: [config.contact.sign.studentId, ...(config.contact.sign.lines || [])],
        },
        { width: 1.6, height: 1.0 }
      );
      roomGroup.add(infoSign);
      registerBounce(infoSign);
    }

    ["Frame_1", "Frame_2", "Frame_3"].forEach((key, i) => {
      const mesh = frameMeshes[key];
      const item = config.about.frames[i];
      if (mesh && item) createFrameInfoPlaque(font, mesh, key, item);
    });
  });

  playIntroPop();
  createDelayedHitboxes();
});

function createDelayedHitboxes() {
}

function playIntroPop() {
  bounceTargets.forEach((mesh, i) => {
    const target = mesh.userData.initialScale || new THREE.Vector3(1, 1, 1);
    mesh.scale.set(0, 0, 0);
    gsap.to(mesh.scale, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 0.55,
      delay: 0.15 + i * 0.07,
      ease: "back.out(2)",
    });
  });
}


const WORK_CAMERA_BASE = { pos: [0.02, 5.24, -1.365], target: [-2.855, 4.492, -1.492] };

function computeWorkCameraSpot() {
  const { pos, target } = WORK_CAMERA_BASE;
  const dx = pos[0] - target[0];
  const dy = pos[1] - target[1];
  const dz = pos[2] - target[2];
  const baseDist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const extra = config.work.cameraPullBack || 0;
  const scale = Math.max(0.05, baseDist + extra) / baseDist;
  return {
    pos: scaleVec([target[0] + dx * scale, target[1] + dy * scale, target[2] + dz * scale]),
    target: scaleVec(target),
  };
}

const CAMERA = {
  get work() {
    return computeWorkCameraSpot();
  },
  aboutOverview: { pos: scaleVec([3.35, 5.95, 1.05]), target: scaleVec([-2.9, 5.76, 0.91]) },
  contact: { pos: scaleVec([-1.85, 6.35, 1.45]), target: scaleVec([-1.7, 5.66, -3.96]) },
};

const FRAME_WORLD = {
  Frame_1: { center: scaleVec([-2.841, 6.1685, 1.333]), normal: [0.9717, 0.1948, -0.1338] },
  Frame_2: { center: scaleVec([-2.934, 6.0355, 0.523]), normal: [0.9505, 0.1969, 0.2405] },
  Frame_3: { center: scaleVec([-2.907, 5.0715, 0.879]), normal: [0.9776, 0.196, 0.0767] },
};

function frameCameraSpot(key) {
  const f = FRAME_WORLD[key];
  const dist = 1.55 * ROOM_SCALE;
  return {
    pos: [f.center[0] + f.normal[0] * dist, f.center[1] + f.normal[1] * dist, f.center[2] + f.normal[2] * dist],
    target: f.center,
  };
}

const state = { mode: "default", index: null };
let cameraFree = true;

function moveCamera(spot, duration = 1.1) {
  cameraFree = false;
  controls.enabled = false;
  const from = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    tx: controls.target.x,
    ty: controls.target.y,
    tz: controls.target.z,
  };
  gsap.to(from, {
    x: spot.pos[0],
    y: spot.pos[1],
    z: spot.pos[2],
    tx: spot.target[0],
    ty: spot.target[1],
    tz: spot.target[2],
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.position.set(from.x, from.y, from.z);
      controls.target.set(from.tx, from.ty, from.tz);
      camera.lookAt(controls.target);
    },
  });
}

function returnToDefault(duration = 1.1) {
  const v = isMobile() ? DEFAULT_VIEW.mobile : DEFAULT_VIEW.desktop;
  moveCamera(v, duration);
  gsap.delayedCall(duration, () => {
    controls.enabled = true;
    cameraFree = true;
    controls.update();
  });
}


const hud = document.querySelector(".hud");
const hudKicker = document.querySelector(".hud-kicker");
const hudTitle = document.querySelector(".hud-title");
const hudText = document.querySelector(".hud-text");
const hudLinks = document.querySelector(".hud-links");
const hudPrev = document.querySelector(".hud-prev");
const hudNext = document.querySelector(".hud-next");
const hudCounter = document.querySelector(".hud-counter");
const hudAll = document.querySelector(".hud-all");
const hudBack = document.querySelector(".hud-back");

function showHud() {
  hud.hidden = false;
}
function hideHud() {
  hud.hidden = true;
  hudLinks.innerHTML = "";
}

function renderWorkHud() {
  const projects = config.work.projects;
  const p = projects[state.index];
  hudKicker.textContent = "My Work";
  hudTitle.textContent = p.title;
  hudText.textContent = p.description + (p.skills?.length ? `\n\n${p.skills.join(" · ")}` : "");
  hudLinks.innerHTML = "";
  if (p.link) {
    const a = document.createElement("a");
    a.href = p.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "hud-link";
    a.textContent = "เปิดลิงก์";
    hudLinks.appendChild(a);
  }
  hudCounter.textContent = `${state.index + 1} / ${projects.length}`;
  hudPrev.hidden = hudNext.hidden = hudCounter.hidden = projects.length <= 1;
  hudAll.hidden = true;
  updateScreenCanvas();
}

function renderAboutOverviewHud() {
  hudKicker.textContent = "About";
  hudTitle.textContent = config.about.intro || "";
  hudText.textContent = "";
  hudLinks.innerHTML = "";
  hudCounter.hidden = hudPrev.hidden = hudNext.hidden = true;
  hudAll.hidden = true;
}

function renderAboutDetailHud() {
  const frames = config.about.frames;
  const item = frames[state.index];
  hudKicker.textContent = "About";
  hudTitle.textContent = item.title || "";
  hudText.textContent = (item.lines || []).join(" · ");
  hudLinks.innerHTML = "";
  hudCounter.textContent = `${state.index + 1} / ${frames.length}`;
  hudCounter.hidden = hudPrev.hidden = hudNext.hidden = frames.length <= 1;
  hudAll.hidden = false;
}

function renderContactHud() {
  hudKicker.textContent = "Contact";
  hudTitle.textContent = config.contact.title || "";
  hudText.textContent = config.contact.text || "";
  hudLinks.innerHTML = "";
  hudCounter.hidden = hudPrev.hidden = hudNext.hidden = hudAll.hidden = true;
}

function enterWork(index = null) {
  state.mode = "work";
  state.index = index ?? (config.work.projects.length ? 0 : null);
  moveCamera(CAMERA.work);
  showHud();
  renderWorkHud();
}

function enterAboutOverview() {
  state.mode = "about";
  state.index = null;
  moveCamera(CAMERA.aboutOverview);
  showHud();
  renderAboutOverviewHud();
}

function enterAboutDetail(key) {
  const idx = ["Frame_1", "Frame_2", "Frame_3"].indexOf(key);
  if (idx === -1) return;
  state.mode = "aboutDetail";
  state.index = idx;
  moveCamera(frameCameraSpot(key), 0.9);
  showHud();
  renderAboutDetailHud();
}

function enterContact() {
  state.mode = "contact";
  state.index = null;
  moveCamera(CAMERA.contact);
  showHud();
  renderContactHud();
}

function exitToDefault() {
  state.mode = "default";
  state.index = null;
  hideHud();
  returnToDefault();
}

hudBack.addEventListener("click", exitToDefault);
hudAll.addEventListener("click", enterAboutOverview);
hudPrev.addEventListener("click", () => step(-1));
hudNext.addEventListener("click", () => step(1));

function step(dir) {
  if (state.mode === "work") {
    const n = config.work.projects.length;
    state.index = (state.index + dir + n) % n;
    renderWorkHud();
  } else if (state.mode === "aboutDetail") {
    const keys = ["Frame_1", "Frame_2", "Frame_3"];
    state.index = (state.index + dir + keys.length) % keys.length;
    moveCamera(frameCameraSpot(keys[state.index]), 0.8);
    renderAboutDetailHud();
  }
}


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let touchHappened = false;
let hovered = null;

function frameKeyOf(object) {
  for (const [key, mesh] of Object.entries(frameMeshes)) {
    if (mesh === object) return key;
  }
  return null;
}

function handleClick() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(raycasterObjects, true);
  if (!hits.length) return;

  let hit = hits[0].object;
  let top = hit;
  while (top.parent && top.parent !== scene && !raycasterObjects.includes(top)) {
    top = top.parent;
  }
  if (raycasterObjects.includes(top)) hit = top;

  buttonSounds.click.play();

  const fKey = frameKeyOf(hit);
  if (fKey) {
    enterAboutDetail(fKey);
    return;
  }

  if (hit === workBtn) enterWork();
  else if (hit === aboutBtn) enterAboutOverview();
  else if (hit === contactBtn) enterContact();
}

window.addEventListener("mousemove", (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});
window.addEventListener("click", () => {
  if (touchHappened) return;
  handleClick();
});
window.addEventListener(
  "touchstart",
  (e) => {
    if (!e.touches[0]) return;
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: true }
);
window.addEventListener(
  "touchend",
  (e) => {
    touchHappened = true;
    e.preventDefault();
    handleClick();
  },
  { passive: false }
);


const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");
const noSoundButton = document.querySelector(".no-sound-button");
let isMuted = false;

manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid " + "var(--c-main)";
  loadingScreenButton.style.background = "var(--c-bg)";
  loadingScreenButton.style.color = "var(--c-dark)";
  loadingScreenButton.textContent = config.loading.enter || "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
  noSoundButton.textContent = config.loading.enterWithoutSound || "Enter without Sound :(";

  let isDisabled = false;
  function handleEnter(withSound = true) {
    if (isDisabled) return;
    isDisabled = true;
    noSoundButton.textContent = "";
    loadingScreenButton.textContent = config.loading.greeting || "~ Hello ~";
    loadingScreenButton.style.cursor = "default";

    if (!withSound) {
      isMuted = true;
      updateMuteState(true);
      soundOnSvg.style.display = "none";
      soundOffSvg.style.display = "block";
    } else {
      backgroundMusic.play();
    }
    playReveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => (loadingScreenButton.style.transform = "scale(1.3)"));
  loadingScreenButton.addEventListener("mouseleave", () => (loadingScreenButton.style.transform = "none"));
  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter(true);
  });
  loadingScreenButton.addEventListener("click", () => {
    if (touchHappened) return;
    handleEnter(true);
  });
  noSoundButton.addEventListener("click", () => {
    if (touchHappened) return;
    handleEnter(false);
  });
};

function playReveal() {
  gsap
    .timeline()
    .to(loadingScreen, { scale: 0.5, duration: 1.2, delay: 0.25, ease: "back.in(1.8)" })
    .to(
      loadingScreen,
      {
        y: "200vh",
        duration: 1.2,
        ease: "back.in(1.8)",
        onComplete: () => loadingScreen.remove(),
      },
      "-=0.1"
    );
}


const themeToggleButton = document.querySelector(".theme-toggle-button");
const muteToggleButton = document.querySelector(".mute-toggle-button");
const sunSvg = document.querySelector(".sun-svg");
const moonSvg = document.querySelector(".moon-svg");
const soundOffSvg = document.querySelector(".sound-off-svg");
const soundOnSvg = document.querySelector(".sound-on-svg");

function updateMuteState(muted) {
  backgroundMusic.volume(muted ? 0 : 1);
  buttonSounds.click.mute(muted);
}

muteToggleButton.addEventListener("click", () => {
  isMuted = !isMuted;
  updateMuteState(isMuted);
  buttonSounds.click.play();
  if (!backgroundMusic.playing()) backgroundMusic.play();
  soundOnSvg.style.display = isMuted ? "none" : "block";
  soundOffSvg.style.display = isMuted ? "block" : "none";
  gsap.fromTo(muteToggleButton, { rotate: -45, scale: 1.3 }, { rotate: 0, scale: 1, duration: 0.5, ease: "back.out(2)" });
});

let isNightMode = false;
themeToggleButton.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-theme");
  document.body.classList.remove(isDark ? "dark-theme" : "light-theme");
  document.body.classList.add(isDark ? "light-theme" : "dark-theme");
  isNightMode = !isNightMode;
  buttonSounds.click.play();
  sunSvg.style.display = isNightMode ? "none" : "block";
  moonSvg.style.display = isNightMode ? "block" : "none";
  gsap.fromTo(themeToggleButton, { rotate: 45, scale: 1.3 }, { rotate: 0, scale: 1, duration: 0.5, ease: "back.out(2)" });

  Object.values(roomMaterials).forEach((m) =>
    gsap.to(m.uniforms.uMixRatio, { value: isNightMode ? 1 : 0, duration: 1.5, ease: "power2.inOut" })
  );
  gsap.to({ t: isNightMode ? 0 : 1 }, { t: isNightMode ? 1 : 0, duration: 1.5, onUpdate: function () {
    applyNightTint(this.targets()[0].t);
  } });
});


const clock = new THREE.Clock();

function updateClockHands() {
  if (!hourHand || !minuteHand) return;
  const now = new Date();
  const minuteAngle = (now.getMinutes() + now.getSeconds() / 60) * ((Math.PI * 2) / 60);
  const hourAngle = ((now.getHours() % 12) + now.getMinutes() / 60) * ((Math.PI * 2) / 12);
  minuteHand.rotation.x = -minuteAngle;
  hourHand.rotation.x = -hourAngle;
}

function render(timestamp) {
  const elapsedTime = clock.getElapsedTime();
  smokeMaterial.uniforms.uTime.value = elapsedTime;

  if (cameraFree) controls.update();
  updateClockHands();
  updateScreenCanvas();

  xAxisFans.forEach((fan) => (fan.rotation.x -= 0.04));
  yAxisFans.forEach((fan) => (fan.rotation.y -= 0.04));

  if (chairTop) {
    const time = timestamp * 0.001;
    const amp = Math.PI / 8;
    chairTop.rotation.y =
      chairTop.userData.initialRotation.y + amp * Math.sin(time * 0.5) * (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);
  }
  if (fish) {
    const time = timestamp * 0.0015;
    fish.position.y = fish.userData.initialPosition.y + 0.12 * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
  }

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(raycasterObjects, true);
  document.body.style.cursor = hits.length ? "pointer" : "default";

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}
render();
