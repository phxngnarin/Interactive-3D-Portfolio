import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const tintables = [];
const _tint = new THREE.Color();

function registerTint(material) {
  material.userData.baseColor = material.color.clone();
  tintables.push(material);
  return material;
}

export function applyNightTint(t) {
  _tint.setRGB(
    THREE.MathUtils.lerp(1, 0.5, t),
    THREE.MathUtils.lerp(1, 0.56, t),
    THREE.MathUtils.lerp(1, 0.78, t)
  );
  tintables.forEach((m) => m.color.copy(m.userData.baseColor).multiply(_tint));
}

let woodTexture = null;

function getWoodTexture() {
  if (woodTexture) return woodTexture;
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");

  const base = g.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, "#dcae7c");
  base.addColorStop(1, "#cf9a68");
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);

  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const y0 = rnd() * size;
    const amp = 4 + rnd() * 14;
    const freq = 0.004 + rnd() * 0.01;
    const ph = rnd() * 6.28;
    g.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const y = y0 + Math.sin(x * freq * 6.28 + ph) * amp;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.strokeStyle = `rgba(120, 72, 36, ${0.06 + rnd() * 0.13})`;
    g.lineWidth = 0.8 + rnd() * 2.2;
    g.stroke();
  }
  for (let i = 0; i < 14; i++) {
    const y0 = rnd() * size;
    g.beginPath();
    g.moveTo(0, y0);
    g.bezierCurveTo(size * 0.3, y0 + 10, size * 0.6, y0 - 12, size, y0 + 4);
    g.strokeStyle = "rgba(255, 236, 205, 0.16)";
    g.lineWidth = 1.4;
    g.stroke();
  }

  woodTexture = new THREE.CanvasTexture(c);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1.8, 1.8);
  woodTexture.anisotropy = 4;
  return woodTexture;
}

const SIGN = {
  centerX: 1.212,
  baselineY: 3.402,
  z: -4.215,
  maxWidth: 1.52,
  maxCapHeight: 0.17,
  depth: 0.05,
};

export function createNameLetters(font, text) {
  const chars = [...text.toUpperCase()];
  const tracking = 0.06;

  const adv1 = chars.map((ch) => {
    const glyph = font.data.glyphs[ch] || font.data.glyphs["?"];
    return (glyph.ha / font.data.resolution) * 1 + tracking;
  });
  const width1 = adv1.reduce((a, b) => a + b, 0) - tracking;
  const capShapes = font.generateShapes("H", 1);
  const capGeo = new THREE.ShapeGeometry(capShapes);
  capGeo.computeBoundingBox();
  const capH1 = capGeo.boundingBox.max.y - capGeo.boundingBox.min.y;
  capGeo.dispose();

  const size = Math.min(SIGN.maxWidth / width1, SIGN.maxCapHeight / capH1);
  const capH = capH1 * size;

  let cursor = 0;
  const items = [];
  chars.forEach((ch, i) => {
    const adv = adv1[i] * size;
    if (ch !== " ") {
      const shapes = font.generateShapes(ch, size);
      if (shapes.length) {
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth: SIGN.depth,
          bevelEnabled: true,
          bevelThickness: 0.012,
          bevelSize: 0.005,
          bevelSegments: 3,
          curveSegments: 8,
        });
        geo.computeBoundingBox();
        const cx = (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2;
        geo.translate(-cx, -capH / 2, -SIGN.depth / 2);
        items.push({ geo, x: cursor + cx });
      }
    }
    cursor += adv;
  });

  const totalWidth = cursor - tracking * size;
  const faceMat = registerTint(new THREE.MeshBasicMaterial({ color: 0xecd0a6 }));
  const sideMat = registerTint(new THREE.MeshBasicMaterial({ color: 0xb98a5c }));

  return items.map((it, i) => {
    const mesh = new THREE.Mesh(it.geo, [faceMat, sideMat]);
    mesh.name = `Name_Letter_${i + 1}_Third_Raycaster_Hover`;
    mesh.position.set(
      SIGN.centerX + (it.x - totalWidth / 2),
      SIGN.baselineY + capH / 2,
      SIGN.z
    );
    return mesh;
  });
}

export const LOGO_PATHS = {
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  discord:
    "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
};

const TILE = { w: 0.53, h: 0.53, thick: 0.059, radius: 0.08, logo: 0.34 };

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  s.moveTo(x + r, 0);
  s.lineTo(x + w - r, 0);
  s.quadraticCurveTo(x + w, 0, x + w, r);
  s.lineTo(x + w, h - r);
  s.quadraticCurveTo(x + w, h, x + w - r, h);
  s.lineTo(x + r, h);
  s.quadraticCurveTo(x, h, x, h - r);
  s.lineTo(x, r);
  s.quadraticCurveTo(x, 0, x + r, 0);
  return s;
}

function toTileSpace(geo, tileCenterZ) {
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, tileCenterZ);
  return geo;
}

export function createContactTile(kind, like) {
  const group = new THREE.Group();
  group.name = `${kind === "facebook" ? "Facebook" : "Discord"}_Fourth_Raycaster_Pointer_Hover`;
  group.position.copy(like.position);
  group.quaternion.copy(like.quaternion);

  const depth = TILE.thick - 0.012;
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(TILE.w, TILE.h, TILE.radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 8,
  });
  bodyGeo.rotateX(-Math.PI / 2);
  bodyGeo.translate(0, -depth - 0.006, 0);
  const wood = getWoodTexture();
  const woodFace = registerTint(new THREE.MeshBasicMaterial({ map: wood }));
  const woodSide = registerTint(new THREE.MeshBasicMaterial({ map: wood, color: 0xc9a07a }));
  group.add(new THREE.Mesh(bodyGeo, [woodFace, woodSide]));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${LOGO_PATHS[kind]}"/></svg>`;
  const shapes = SVGLoader.createShapes(new SVGLoader().parse(svg).paths[0]);
  const s = TILE.logo / 24;
  const centerZ = -TILE.h / 2;

  const build = (shps, d, bevel) => {
    const g = new THREE.ExtrudeGeometry(shps, {
      depth: d,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 12,
    });
    g.translate(-12, -12, 0);
    g.scale(s, -s, s);
    return toTileSpace(g, centerZ);
  };

  const brand = kind === "facebook" ? 0x3f7fe8 : 0x5b68f0;
  const brandSide = kind === "facebook" ? 0x2a5cb8 : 0x3f4bc0;
  const logoFace = registerTint(new THREE.MeshBasicMaterial({ color: brand, side: THREE.DoubleSide }));
  const logoSide = registerTint(new THREE.MeshBasicMaterial({ color: brandSide, side: THREE.DoubleSide }));
  const whiteFace = registerTint(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  const whiteSide = registerTint(new THREE.MeshBasicMaterial({ color: 0xdfe8f2, side: THREE.DoubleSide }));

  let backShapes;
  if (kind === "facebook") {
    backShapes = [new THREE.Shape(new THREE.Path().absarc(12, 12, 12, 0, Math.PI * 2, false).getPoints(48))];
  } else {
    backShapes = shapes.map((sh) => new THREE.Shape(sh.getPoints(16)));
  }
  const backGeo = build(backShapes, 0.9, 0.12);
  backGeo.translate(0, 0, 0);
  const back = new THREE.Mesh(backGeo, [whiteFace, whiteSide]);
  back.scale.set(0.985, 1, 0.985);
  back.position.z = centerZ * (1 - 0.985);
  group.add(back);

  const logoGeo = build(shapes, 1.6, 0.2);
  group.add(new THREE.Mesh(logoGeo, [logoFace, logoSide]));

  return group;
}

export const FRAME_PICTURES = {
  Frame_1: {
    corners: [[0.0375, 0.0581, 0.1509], [-0.004, 0.0561, -0.1534], [-0.0696, 0.3878, -0.1466], [-0.0281, 0.3897, 0.1577]],
    normal: [0.9717, 0.1948, -0.1338],
  },
  Frame_2: {
    corners: [[-0.0305, 0.0557, 0.2122], [0.0743, 0.0639, -0.2087], [-0.0024, 0.4484, -0.2203], [-0.1072, 0.4401, 0.2007]],
    normal: [0.9505, 0.1969, 0.2405],
  },
  Frame_3: {
    corners: [[0.005, 0.05, 0.154], [0.0288, 0.0507, -0.1522], [-0.0373, 0.3823, -0.1565], [-0.0611, 0.3816, 0.1497]],
    normal: [0.9776, 0.196, 0.0767],
  },
};

const textureLoader = new THREE.TextureLoader();

export function fitCover(texture, targetAspect) {
  const img = texture.image;
  const imgAspect = img.width / img.height;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  if (imgAspect > targetAspect) {
    texture.repeat.x = targetAspect / imgAspect;
    texture.offset.x = (1 - texture.repeat.x) / 2;
  } else {
    texture.repeat.y = imgAspect / targetAspect;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  }
}

export function addFramePicture(frameMesh, key, url) {
  const spec = FRAME_PICTURES[key];
  const [bl, br, tr, tl] = spec.corners.map((c) => new THREE.Vector3(...c));
  const n = new THREE.Vector3(...spec.normal).normalize();
  const lift = n.clone().multiplyScalar(0.004);

  const geo = new THREE.BufferGeometry();
  const pts = [bl, br, tr, tl].flatMap((p) => [p.x + lift.x, p.y + lift.y, p.z + lift.z]);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);

  const width = bl.distanceTo(br);
  const height = bl.distanceTo(tl);
  const material = registerTint(new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = `${key}_Picture`;
  mesh.visible = false;
  frameMesh.add(mesh);

  if (url) {
    textureLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        fitCover(tex, width / height);
        material.map = tex;
        material.needsUpdate = true;
        mesh.visible = true;
      },
      undefined,
      () => console.warn(`[config] โหลดรูปไม่สำเร็จ: ${url} (จะใช้ภาพเดิมในโมเดลแทน)`)
    );
  }

  frameMesh.updateWorldMatrix(true, false);
  const wc = [bl, br, tr, tl].map((p) => p.clone().applyMatrix4(frameMesh.matrixWorld));
  const center = wc.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(0.25);
  const normal = n.clone().transformDirection(frameMesh.matrixWorld);
  return { mesh, center, normal, width, height };
}

function measureLine(font, text, size) {
  const chars = [...text];
  const tracking = size * 0.045;
  const adv = chars.map((ch) => {
    const glyph = font.data.glyphs[ch] || font.data.glyphs["?"] || font.data.glyphs[" "];
    return (glyph.ha / font.data.resolution) * size + tracking;
  });
  const width = adv.reduce((a, b) => a + b, 0) - tracking;
  return { chars, adv, width };
}

function buildLineMeshes(font, text, size, depth, startX, y, faceMat, sideMat) {
  const { chars, adv } = measureLine(font, text, size);
  let cursor = startX;
  const meshes = [];
  chars.forEach((ch, i) => {
    if (ch !== " ") {
      const shapes = font.generateShapes(ch, size);
      if (shapes.length) {
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth,
          bevelEnabled: true,
          bevelThickness: depth * 0.22,
          bevelSize: depth * 0.14,
          bevelSegments: 2,
          curveSegments: 6,
        });
        geo.translate(cursor, y, 0);
        meshes.push(new THREE.Mesh(geo, [faceMat, sideMat]));
      }
    }
    cursor += adv[i];
  });
  return meshes;
}

export function createPlateText(font, lines, opts = {}) {
  const depth = opts.depth ?? 0.01;
  const lineGap = opts.lineGap ?? 0.018;
  const align = opts.align ?? "center";
  const faceMat = registerTint(new THREE.MeshBasicMaterial({ color: opts.color ?? 0xf5ead2 }));
  const sideMat = registerTint(new THREE.MeshBasicMaterial({ color: opts.sideColor ?? 0xc9a874 }));

  let sizedLines = lines.map((l) => ({ ...l }));
  if (opts.maxWidth) {
    let widest = 0;
    sizedLines.forEach((l) => {
      widest = Math.max(widest, measureLine(font, l.text, l.size).width);
    });
    if (widest > opts.maxWidth) {
      const scale = opts.maxWidth / widest;
      sizedLines.forEach((l) => (l.size *= scale));
    }
  }

  const totalH = sizedLines.reduce((a, l) => a + l.size + lineGap, 0) - lineGap;
  let y = totalH / 2 - sizedLines[0].size * 0.8;

  const group = new THREE.Group();
  sizedLines.forEach((line) => {
    const { width } = measureLine(font, line.text, line.size);
    const startX = align === "center" ? -width / 2 : 0;
    buildLineMeshes(font, line.text, line.size, depth, startX, y, faceMat, sideMat).forEach((m) =>
      group.add(m)
    );
    y -= line.size + lineGap;
  });

  group.rotation.x = -Math.PI / 2;
  return group;
}

function centeredWoodPlate(width, height, opts = {}) {
  const depth = opts.depth ?? 0.05;
  const radius = opts.radius ?? Math.min(width, height) * 0.08;
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 10,
  });
  bodyGeo.translate(0, -height / 2, 0);
  bodyGeo.rotateX(-Math.PI / 2);
  bodyGeo.translate(0, -depth - 0.006, 0);
  const wood = getWoodTexture();
  const woodFace = registerTint(new THREE.MeshBasicMaterial({ map: wood }));
  const woodSide = registerTint(new THREE.MeshBasicMaterial({ map: wood, color: 0xc9a07a }));
  return new THREE.Mesh(bodyGeo, [woodFace, woodSide]);
}

export function createInfoSign(font, like, content, opts = {}) {
  const width = opts.width ?? 1.55;
  const height = opts.height ?? 0.95;

  const group = new THREE.Group();
  group.name = opts.name ?? "Info_Sign_Fourth_Raycaster_Hover";
  group.position.copy(like.position);
  group.quaternion.copy(like.quaternion);

  group.add(centeredWoodPlate(width, height, { depth: opts.plateDepth ?? 0.07 }));

  const textLines = [];
  if (content.title) textLines.push({ text: content.title, size: opts.titleSize ?? 0.1 });
  (content.lines || []).forEach((t) => textLines.push({ text: t, size: opts.lineSize ?? 0.072 }));

  const textGroup = createPlateText(font, textLines, {
    lineGap: opts.lineGap ?? 0.026,
    maxWidth: width * 0.86,
    depth: 0.012,
    color: opts.textColor ?? 0x3a2814,
    sideColor: opts.textSideColor ?? 0x22160b,
  });
  group.add(textGroup);

  return group;
}

export function createFrameInfoPlaque(font, frameMesh, key, content, opts = {}) {
  const spec = FRAME_PICTURES[key];
  const [bl, br, tr, tl] = spec.corners.map((c) => new THREE.Vector3(...c));
  const n = new THREE.Vector3(...spec.normal).normalize();
  const right = br.clone().sub(bl).normalize();
  const up = tl.clone().sub(bl).normalize();
  const center = [bl, br, tr, tl].reduce((a, c) => a.add(c), new THREE.Vector3()).multiplyScalar(0.25);
  const width = bl.distanceTo(br);
  const height = bl.distanceTo(tl);

  const basis = new THREE.Matrix4().makeBasis(right, n, up.clone().negate());
  const quat = new THREE.Quaternion().setFromRotationMatrix(basis);

  const group = new THREE.Group();
  group.name = `${key}_Info_Plaque`;
  group.position.copy(center).addScaledVector(n, 0.006);
  group.quaternion.copy(quat);

  const plateScale = opts.plateScale ?? 0.92;
  group.add(centeredWoodPlate(width * plateScale, height * plateScale, { depth: opts.plateDepth ?? 0.045 }));

  const textLines = [];
  if (content.title) textLines.push({ text: content.title, size: opts.titleSize ?? height * 0.15 });
  (content.lines || []).forEach((t) => textLines.push({ text: t, size: opts.lineSize ?? height * 0.095 }));

  const textGroup = createPlateText(font, textLines, {
    lineGap: opts.lineGap ?? height * 0.048,
    maxWidth: width * plateScale * 0.86,
    depth: 0.01,
    color: opts.textColor ?? 0x3a2814,
    sideColor: opts.textSideColor ?? 0x22160b,
  });
  group.add(textGroup);

  frameMesh.add(group);
  return group;
}

function frameBorderShape(width, height, border, radius) {
  const shape = roundedRectShape(width, height, radius);
  const hw = width / 2 - border;
  const hy0 = border;
  const hy1 = height - border;
  const hr = Math.max(radius - border, 0.006);
  const hole = new THREE.Path();
  hole.moveTo(-hw + hr, hy0);
  hole.lineTo(hw - hr, hy0);
  hole.quadraticCurveTo(hw, hy0, hw, hy0 + hr);
  hole.lineTo(hw, hy1 - hr);
  hole.quadraticCurveTo(hw, hy1, hw - hr, hy1);
  hole.lineTo(-hw + hr, hy1);
  hole.quadraticCurveTo(-hw, hy1, -hw, hy1 - hr);
  hole.lineTo(-hw, hy0 + hr);
  hole.quadraticCurveTo(-hw, hy0, -hw + hr, hy0);
  shape.holes.push(hole);
  return shape;
}

export function createDeskPhotoFrame(url, opts = {}) {
  const width = opts.width ?? 0.52;
  const height = opts.height ?? 0.66;
  const border = opts.border ?? 0.05;
  const depth = opts.depth ?? 0.035;

  const group = new THREE.Group();
  group.name = opts.name ?? "Desk_Photo_Frame_Fourth_Raycaster_Hover";

  const geo = new THREE.ExtrudeGeometry(frameBorderShape(width, height, border, opts.radius ?? 0.035), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geo.translate(0, -height / 2, -depth / 2);
  const wood = getWoodTexture();
  const woodFace = registerTint(new THREE.MeshBasicMaterial({ map: wood }));
  const woodSide = registerTint(new THREE.MeshBasicMaterial({ map: wood, color: 0xc9a07a }));
  group.add(new THREE.Mesh(geo, [woodFace, woodSide]));

  const innerW = width - border * 2;
  const innerH = height - border * 2;
  const picMat = registerTint(new THREE.MeshBasicMaterial({ color: 0xefe4cd }));
  const picMesh = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), picMat);
  picMesh.position.z = -0.001;
  picMesh.name = "Desk_Photo_Frame_Picture";
  group.add(picMesh);

  if (url) {
    textureLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        fitCover(tex, innerW / innerH);
        picMat.map = tex;
        picMat.color.set(0xffffff);
        picMat.needsUpdate = true;
      },
      undefined,
      () => console.warn(`[config] โหลดรูปโปรไฟล์ไม่สำเร็จ: ${url} (จะโชว์กรอบเปล่าแทน)`)
    );
  }

  return group;
}
