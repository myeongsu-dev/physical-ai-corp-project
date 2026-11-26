/* 장착 구성 3D 뷰어 (5절). 단위 mm, +X 앞 · +Y 위 · +Z 로봇 오른쪽.
   형상은 07_corp-project/cad(build123d)가 만든 mechdog.glb, 치수 · 기준점 · 이름표는 mechdog.json에서 읽는다. 치수를 바꿀 때는 cad/mechdog/dims.py를 고치고 다시 빌드한다.
   서보 · XIAO · Pi 5는 공식 STEP을 GLB로 바꾼 파일을 불러와 간략 모델과 바꾼다 (못 읽으면 간략 모델 유지) */
// 모듈이 아닌 보통 스크립트로 싣고, three.js만 import()로 CDN에서 받는다. GLB · JSON을 읽으므로 웹 서버로 연다
const V3D_BASE = document.currentScript.src; // GLB 경로 기준 (이 스크립트 주소)
const asset = (f) => {
  const url = new URL("./" + f, V3D_BASE);
  if (f === "mechdog.glb" || f === "mechdog.json") url.search = new URL(V3D_BASE).search;
  return url.href;
};
(async () => {
const root = document.querySelector('[data-widget="v3d"]');
if (!root) throw new Error('[data-widget="v3d"] 요소를 찾을 수 없습니다.');
root.innerHTML = `
  <div class="v3d">
    <div class="v3d-bar" id="v3dModels" role="group" aria-label="로봇 구성">
      <span class="v3d-seg"><button type="button" data-mode="folded" aria-pressed="true">실물 · 접은 자세</button><button type="button" data-mode="standing" aria-pressed="false">실물 · 선 자세</button><button type="button" data-mode="project" aria-pressed="false">프로젝트 장착안</button></span>
    </div>
    <div class="v3d-bar">
      <span class="v3d-seg" id="v3dViews" role="group" aria-label="시점"><button type="button" data-v="all">전체</button><button type="button" data-v="side">옆</button><button type="button" data-v="front">정면</button><button type="button" data-v="top">위</button><button type="button" data-v="rear">뒤</button><button type="button" data-v="bottom">아래</button></span>
      <span class="v3d-seg" id="v3dToggles" role="group" aria-label="표시"><button type="button" data-k="fov" aria-pressed="true">카메라 시야</button><button type="button" data-k="beam" aria-pressed="true">초음파 빔</button><button type="button" data-k="ir" aria-pressed="true">온도 측정 범위</button><button type="button" data-k="label" aria-pressed="true">이름표</button><button type="button" data-k="print" aria-pressed="false">3D 출력물 강조</button><button type="button" data-k="explode" aria-pressed="false">분해 보기</button><button type="button" data-k="sweep" aria-pressed="false">다리 움직임 범위</button></span>
      <label class="v3d-angle">바닥 카메라 숙임각<input type="range" id="v3dAngle" min="10" max="65" step="5" value="35"><output id="v3dAngleOut">35°</output></label>
      <label class="v3d-angle">다리 각도<input type="range" id="v3dLeg" min="-30" max="45" step="5" value="0"><output id="v3dLegOut">0°</output></label>
    </div>
    <div class="v3d-stage" id="v3dStage"><p class="v3d-msg" id="v3dMsg">3D 뷰어를 불러오는 중…</p><div class="v3d-labels" id="v3dLabels" aria-hidden="true"></div></div>
    <p class="v3d-read" id="v3dRead"></p>
    <div class="v3d-legend">
      <span><i class="v3d-c-fovf"></i>바닥 카메라 시야</span><span><i class="v3d-c-fovc"></i>정면 카메라 시야</span><span><i class="v3d-c-beam"></i>초음파 빔</span><span><i class="v3d-c-ir"></i>온도 센서 측정 범위</span><span><i class="v3d-c-print"></i>3D 출력물</span><span><i class="v3d-c-ghost"></i>옮기기 전 자리 (분해 보기)</span>
      <span>끌어서 돌리기 · 누른 뒤 휠로 확대 · 가운데(휠)·오른쪽 버튼으로 이동</span>
    </div>
  </div>
  <details>
    <summary>부품 치수와 자리</summary>
  <div class="tw"><table class="v3d-parts">
    <thead><tr><th>부품</th><th>대략 치수 (실측 전)</th><th>자리</th><th>구분</th></tr></thead>
    <tbody>
      <tr><td>MechDog 본체</td><td>서 있을 때 214 × 126 × 138 mm, 꺼졌을 때 221 × 126 × 96 mm (사양서), 제어 보드 79 × 53 mm</td><td>다리마다 몸통 옆 ㄷ자 어깨 브래킷(비스듬한 윗판 · 베어링이 달린 바깥 팔)은 고정이고, 그 안에서 허벅지 판 · 무릎 서보 · 혼 · 푸시로드 · 아랫다리만 엉덩이 축을 중심으로 돈다. 브래킷 윗면(바닥에서 약 114.5 mm)보다 위는 다리가 움직여도 빈 공간이라 Z ±62까지 짐을 얹을 수 있다</td><td>보유</td></tr>
      <tr><td>초음파 센서</td><td>46 × 20 mm, 발신부 2개, 측정 각 15°</td><td>머리 앞면</td><td>보유</td></tr>
      <tr><td>하향 비전 모듈</td><td>순정 모듈과 경첩</td><td>턱 아래에서 바닥을 본다.</td><td>본체 부품</td></tr>
      <tr><td>전면 카메라 · 온도센서</td><td>XIAO ESP32-S3 Sense · GY-906</td><td>머리 윗판 앞 나사 두 곳에 받침을 고정한다. 보드는 위에서 끼우고 안테나는 받침 뒷면에 붙인다.</td><td><a href="${asset("print/head_bracket.3mf")}" download>3MF</a> · <a href="${asset("print/head_bracket.stl")}" download>STL</a></td></tr>
      <tr><td>스마텍 STPB-MB100</td><td>84 × 32.2 × 46 mm · 165 g</td><td>등판 M4 네 곳에 접시머리 나사로 조인 칸에 위에서 넣는다. USB-C는 뒤 벽 구멍으로 나오고, 칸에 둔 채로 충전한다.</td><td><a href="${asset("print/battery_bay.3mf")}" download>3MF</a> · <a href="${asset("print/battery_bay.stl")}" download>STL</a></td></tr>
      <tr><td>Pi 5 · Active Cooler · 공식 적백 케이스</td><td>케이스 98.5 × 70.3 × 33 mm</td><td>뚜껑을 칸 벽 위에 얹고 케이스의 긴 변을 앞뒤로 올린다. 스트랩 두 줄이 Pi · 뚜껑 · 칸을 함께 눌러 묶는다.</td><td><a href="${asset("print/pi_carrier.3mf")}" download>3MF</a> · <a href="${asset("print/pi_carrier.stl")}" download>STL</a></td></tr>
      <tr><td>LED · 소리 모듈</td><td>LED 체결 간격 46 × 16 mm · MP3 체결 간격 16 mm</td><td>배터리 칸 앞 탭의 M3 두 곳에 평와셔 · 너트로 고정한다. LED는 12 mm 스페이서 위에, 스피커는 6 mm 스페이서를 끼워 세로 턱에 고정한다.</td><td><a href="${asset("print/led_plate.3mf")}" download>3MF</a> · <a href="${asset("print/led_plate.stl")}" download>STL</a></td></tr>
      <tr><td>벨크로 스트랩</td><td>양면 벨크로 롤 폭 10 mm (MBF-VCRS10-BK, 10 m)</td><td>약 350 mm 두 줄. 케이스 위에서 내려 칸 바닥 슬롯 바깥 막대에 감고 40 mm씩 겹쳐 붙인다.</td><td><a href="https://www.compuzone.co.kr/product/product_detail.htm?ProductNo=1277385">컴퓨존</a></td></tr>
    </tbody>
  </table></div>
    <p class="muted">카메라 시야각(가로 60° · 세로 47°)은 가정값이고, 초음파 빔은 매뉴얼의 측정 각 15°를 반각으로 넓게 그렸고, 얼굴판이 수직이라 빔도 수평으로 나간다. 온도 센서의 시야 35°는 데이터시트 값이고 30 cm까지 그렸다.</p>
  </details>
`;
root.querySelectorAll("table").forEach((t) => {
  const h = [...t.rows[0].cells].map((c) => (c.tagName === "TH" ? c.textContent : null));
  if (h.length < 3 || h.includes(null)) return;
  t.classList.add("cards");
  [...t.rows].slice(1).forEach((r) => [...r.cells].forEach((c, i) => c.setAttribute("data-l", h[i])));
});
const $ = (id) => root.querySelector("#" + id);
const v3dBox = root.querySelector(".v3d");
const stage = $("v3dStage"), msg = $("v3dMsg");
try {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
  const css = (n) => getComputedStyle(v3dBox).getPropertyValue(n).trim();
  const PI = Math.PI, rad = THREE.MathUtils.degToRad, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 재질: 색은 CSS 토큰에서 읽는다 (다크 모드 포함) ----
  const TOK = { body: "--v3d-body", dark: "--v3d-dark", rubber: "--v3d-rubber", metal: "--v3d-metal", pcb: "--v3d-pcb", white: "--v3d-white", pin: "--gray",
    print: "--v3d-print", floor: "--v3d-floor", line: "--v3d-line", cpY: "--cp-y", cpB: "--cp-b", led: "--v3d-led", red: "--bad",
    ghost: "--muted", lead: "--muted", fovF: "--accent", fovC: "--info", beam: "--bad", ir: "--ok", sweep: "--info" };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const glass = () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false });
  const grainTex = (() => { // 분체·아노다이징 알루미늄 미세 입자 범프 맵
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = c.height = 128;
    const img = g.createImageData(128, 128), d = img.data;
    let seed = 1337;
    for (let i = 0; i < d.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = 112 + (seed % 32);
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4);
    return t;
  })();
  const grillTex = (() => { // 초음파 발신부 내부 미세 철망 + 동심 확산 링 (V04-0112 · T005 · T006)
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = c.height = 256;
    g.fillStyle = "#0e1218"; g.fillRect(0, 0, 256, 256);
    const innerGlow = g.createRadialGradient(128, 128, 22, 128, 128, 118);
    innerGlow.addColorStop(0, "#1c2838"); innerGlow.addColorStop(0.55, "#2b3d54"); innerGlow.addColorStop(0.82, "#192230"); innerGlow.addColorStop(1, "#0a0d12");
    g.fillStyle = innerGlow; g.fillRect(0, 0, 256, 256);
    for (const [color, width] of [["#46505e", 4.4], ["#9ea8b6", 1.5]]) {
      g.strokeStyle = color; g.lineWidth = width;
      g.beginPath();
      for (let x = -256; x < 512; x += 12) {
        g.moveTo(x, 0); g.lineTo(x + 256, 256); g.moveTo(x, 0); g.lineTo(x - 256, 256);
      }
      g.stroke();
    }
    const radGrad = g.createRadialGradient(128, 128, 36, 128, 128, 128);
    radGrad.addColorStop(0, "rgba(0,0,0,0)"); radGrad.addColorStop(0.76, "rgba(0,0,0,0.22)"); radGrad.addColorStop(1, "rgba(0,0,0,0.72)");
    g.fillStyle = radGrad; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const M = {
    body: new THREE.MeshPhysicalMaterial({ metalness: 0.28, roughness: 0.30, envMapIntensity: 1.12, clearcoat: 0.45, clearcoatRoughness: 0.22, bumpMap: grainTex, bumpScale: 0.025 }),
    dark: new THREE.MeshPhysicalMaterial({ metalness: 0.14, roughness: 0.44, envMapIntensity: 0.85, clearcoat: 0.10, clearcoatRoughness: 0.48 }),
    rubber: new THREE.MeshPhysicalMaterial({ metalness: 0.04, roughness: 0.40, envMapIntensity: 0.92, clearcoat: 0.48, clearcoatRoughness: 0.25 }),
    metal: std({ metalness: 0.96, roughness: 0.18, envMapIntensity: 1.25 }), pcb: std({ roughness: 0.52 }), white: std({ roughness: 0.42 }), pin: std({ roughness: 0.58 }),
    screw: std({ color: 0x1d1f24, metalness: 0.68, roughness: 0.30, envMapIntensity: 1.0 }), cavity: std({ color: 0x0d0f13, roughness: 0.88 }),
    bearing: std({ color: 0xd8dce2, metalness: 0.90, roughness: 0.18, envMapIntensity: 1.22 }),
    stainless: std({ color: 0xebeff5, metalness: 0.46, roughness: 0.24, envMapIntensity: 1.35 }),
    grill: std({ map: grillTex, metalness: 0.42, roughness: 0.48, emissive: 0x1278ff, emissiveMap: grillTex, emissiveIntensity: 0 }),
    ledBlue: std({ color: 0x2688ff, emissive: 0x2496ff, emissiveIntensity: 0, roughness: 0.18 }),
    ledGlow: new THREE.MeshBasicMaterial({ color: 0x4db5ff, transparent: true, opacity: 0.44, side: THREE.BackSide, depthWrite: false }),
    ledRed: std({ color: 0x551212, emissive: 0xff3220, emissiveIntensity: 0, roughness: 0.22 }),
    print: std({ roughness: 0.58, transparent: true, opacity: 0.75 }),
    floor: std({ roughness: 1 }), line: std({ roughness: 1 }), cpY: std({ roughness: 1 }), cpB: std({ roughness: 1 }),
    led: new THREE.MeshBasicMaterial(), red: new THREE.MeshBasicMaterial(),
    ghost: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), lead: new THREE.LineBasicMaterial(),
    w1: std({ color: 0xd97706, roughness: 0.62 }), w2: std({ color: 0xb91c1c, roughness: 0.62 }), w3: std({ color: 0x6b3f1d, roughness: 0.62 }), // 서보 배선 (주황 · 빨강 · 갈색)
    gold: std({ color: 0xd1a832, metalness: 0.96, roughness: 0.28, envMapIntensity: 1.15 }),
    rpiPcb: std({ color: 0x15803d, roughness: 0.45 }), rpiBlue: std({ color: 0x1d4ed8, roughness: 0.5 }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0x0b1d36, metalness: 0.25, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.4 }),
    irPcb: std({ color: 0x5b21b6, roughness: 0.45 }),
    cooler: std({ color: 0x24282e, metalness: 0.78, roughness: 0.32 }),
    fovF: glass(), fovC: glass(), beam: glass(), ir: glass(), sweep: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
  };
  const SOLID = ["body", "dark", "rubber", "metal", "pcb", "white", "pin", "screw", "cavity", "bearing", "grill", "ledBlue", "ledRed", "w1", "w2", "w3", "gold", "rpiPcb", "rpiBlue", "lens", "irPcb", "cooler"];
  const EXT = new Set(); // 공식 3D 모델의 재질 (3D 출력물 강조 때 함께 흐리게)
  const theme = () => { for (const k in TOK) M[k].color.set(css(TOK[k])); };

  // ---- 장면: 형상은 CAD(07_corp-project/cad, build123d)가 만든 mechdog.glb, 치수 · 기준점 · 이름표는 mechdog.json ----
  const scene = new THREE.Scene(), robot = new THREE.Group();
  scene.add(robot);
  let P = robot; // 지금 만드는 도형이 들어갈 곳
  const add = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); P.add(o); return o; };
  const grp = (x, y, z, build) => { const g = add(new THREE.Group(), x, y, z), up = P; P = g; build(g); P = up; return g; };
  const mesh = (geo, m) => { const o = new THREE.Mesh(geo, typeof m === "string" ? M[m] : m); o.castShadow = o.receiveShadow = true; return o; };
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import("three/addons/loaders/GLTFLoader.js"), import("three/addons/libs/meshopt_decoder.module.js")]);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const [gl, J] = await Promise.all([loader.loadAsync(asset("mechdog.glb")), fetch(asset("mechdog.json")).then((r) => r.json())]);
  const D = J.dims;
  robot.add(gl.scene); // glTF의 Y-위 회전과 CAD가 넣은 되돌림 회전이 상쇄되어 mechdog 노드 = 로봇 좌표
  const N = {};
  gl.scene.traverse((o) => { if (o.name) N[o.name] = o; });
  gl.scene.traverse((o) => { // 부품 이름 끝의 '__재질'로 뷰어 재질을 씌운다 (다크 모드 색 · 출력물 강조 투명도 · LED 발광)
    if (!o.isMesh) return;
    let p = o;
    while (p && !p.name.includes("__")) p = p.parent;
    const key = p ? p.name.split("__")[1] : "dark";
    o.material = M[key] ?? M.dark;
    o.castShadow = o.receiveShadow = key !== "sweep" && key !== "ghost";
  });
  const byPrefix = (s) => Object.keys(N).filter((n) => n.startsWith(s) && !n.includes("__")).sort().map((n) => N[n]);
  const fromMatrix = (o, m) => { o.applyMatrix4(new THREE.Matrix4().fromArray(m)); return o; };

  const servoLabelMat = (() => { // 공식 HPS-0618SG 실물 스티커 (HPS-0618SG.pdf p.1 · T003)
    const c = document.createElement("canvas"); c.width = 256; c.height = 96;
    const g = c.getContext("2d");
    g.fillStyle = "#1a1d22"; g.fillRect(0, 0, 256, 96);
    g.strokeStyle = "#9aa3ae"; g.lineWidth = 3; g.strokeRect(3, 3, 250, 90);
    g.fillStyle = "#e8ecf2"; g.font = "bold 20px Arial"; g.textAlign = "center";
    g.fillText("Hiwonder", 128, 28);
    g.fillStyle = "#f2f4f8"; g.fillRect(18, 36, 220, 28);
    g.fillStyle = "#15181d"; g.font = "bold 22px Arial";
    g.fillText("HPS-0618SG", 128, 58);
    g.fillStyle = "#b8c0ca"; g.font = "bold 14px Arial";
    g.fillText("Coreless Servo", 128, 82);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const mat = std({ map: t, metalness: 0.32, roughness: 0.38 }); EXT.add(mat);
    return mat;
  })();
  const markings = (label, w, h, sticker = false, frame = false) => {
    const canvas = document.createElement("canvas"); canvas.width = Math.round(128 * w / h); canvas.height = 128;
    const g = canvas.getContext("2d"); g.fillStyle = sticker ? "#f5f0df" : "#181a1f"; g.fillRect(0, 0, canvas.width, 128);
    if (sticker || frame) { g.strokeStyle = sticker ? "#b75436" : "#f4f1ea"; g.lineWidth = 7; g.strokeRect(7, 7, canvas.width - 14, 114); }
    g.fillStyle = sticker ? "#26242a" : "#f6f3eb"; g.font = "bold 88px Arial"; g.textAlign = "center"; g.fillText(label, canvas.width / 2, 96);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const mat = std({ map, roughness: 0.62 }); EXT.add(mat);
    return mesh(new THREE.PlaneGeometry(w, h), mat);
  };
  const mainPcbMat = (() => { // ESP32 캐리어 보드 상면 실크스크린 (W044)
    const c = document.createElement("canvas"); c.width = 256; c.height = 192;
    const g = c.getContext("2d");
    g.fillStyle = "#181b20"; g.fillRect(0, 0, 256, 192);
    g.strokeStyle = "#363c46"; g.lineWidth = 2;
    for (let x = 24; x < 240; x += 18) { g.beginPath(); g.moveTo(x, 16); g.lineTo(x, 176); g.stroke(); }
    g.strokeStyle = "#d8dce2"; g.lineWidth = 2.5;
    g.strokeRect(8, 8, 240, 176); g.strokeRect(48, 44, 152, 104);
    g.fillStyle = "#d8dce2";
    for (let i = 0; i < 18; i++) { g.fillRect(58 + i * 7.6, 48, 4, 5); g.fillRect(58 + i * 7.6, 139, 4, 5); }
    g.font = "bold 12px monospace"; g.fillText("MECHDOG ESP32 V1.2", 62, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const mat = std({ map: t, roughness: 0.45, metalness: 0.12 }); EXT.add(mat);
    return mat;
  })();
  const visionPcbMat = (() => { // 비전 모듈 팔각 창 안쪽 PCB 실크스크린 (L012 · W046 · T003)
    const c = document.createElement("canvas"); c.width = 256; c.height = 192;
    const g = c.getContext("2d");
    g.fillStyle = "#15171c"; g.fillRect(0, 0, 256, 192);
    g.fillStyle = "#b8bcc4"; g.font = "bold 22px Arial"; g.fillText("Hiwonder", 140, 74);
    g.fillStyle = "#8a909a"; g.font = "bold 14px monospace"; g.fillText("ESP32-S3", 146, 94);
    for (const [x, y, w, h, col] of [
      [34, 92, 6, 4, "#d4b04c"], [46, 92, 6, 4, "#d4b04c"], [58, 92, 6, 4, "#c9cdd2"], [70, 92, 6, 4, "#d4b04c"],
      [82, 82, 5, 10, "#9aa0aa"], [82, 100, 5, 10, "#9aa0aa"], [110, 48, 8, 5, "#d4b04c"], [138, 134, 8, 5, "#c9cdd2"],
    ]) { g.fillStyle = col; g.fillRect(x, y, w, h); }
    g.strokeStyle = "#353b45"; g.lineWidth = 2; g.strokeRect(20, 24, 216, 144);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const mat = std({ map: t, roughness: 0.48, metalness: 0.15 }); EXT.add(mat);
    return mat;
  })();

  // CAD가 자리만 넘긴 캔버스 판 · 초음파 철망 · 발광 링
  const uGlows = [];
  for (const d of J.decals) {
    const o = d.kind === "text" ? markings(d.label, d.w, d.h, d.sticker, d.frame)
      : d.kind === "grill" ? mesh(new THREE.CircleGeometry(d.r, 40), "grill")
      : d.kind === "glow" ? mesh(new THREE.CylinderGeometry(d.r, d.r, d.h, 36, 1, true).rotateZ(-PI / 2), "ledGlow")
      : mesh(new THREE.PlaneGeometry(d.w, d.h), { servoLabel: servoLabelMat, pcb: mainPcbMat, visionPcb: visionPcbMat }[d.kind]);
    if (d.kind === "glow") { o.castShadow = o.receiveShadow = false; uGlows.push(o); }
    N[d.parent].add(fromMatrix(o, d.m));
  }
  const anchor = (n) => { const a = J.anchors[n], o = fromMatrix(new THREE.Object3D(), a.m); N[a.parent].add(o); return o; };
  const uEye = anchor("uEye"), fEye = anchor("fEye"), irEye = anchor("irEye"), bEye = anchor("bEye");

  const { project, ghost, stockCamera, stockBracket, stockModule, headScrews, rearScrews } = N;
  const { xiao, xiaoBoard, rpi, rpiBoard, brk, irMod, deck, led, mp3, piMount, pBank, projectBracket, bCam, ant, xBoard, xCam, xLens, irBoard } = N;
  const sockets = byPrefix("socket_"), servoSeats = byPrefix("seat_"), servoBoxes = byPrefix("servobox_");
  const exitPoint = o => robot.worldToLocal(o.getWorldPosition(V()));
  const feet = byPrefix("foot_"), shins = byPrefix("shinbody_"), sweeps = byPrefix("sweep_");
  const parts = [], tags = [], leads = [];
  for (const [n, ex] of Object.entries(J.explode)) { const g = N[n]; g.userData = { at: g.position.clone(), ex: V(...ex) }; parts.push(g); } // 분해 보기에서 움직일 묶음
  const tag = (text, at, from, printed = false, show = null) => { // 이름표는 at에 두고 부품(from)까지 선으로 잇는다
    const el = document.createElement("span");
    el.textContent = text;
    if (printed) el.className = "p";
    $("v3dLabels").append(el);
    tags.push([el, add(new THREE.Object3D(), ...at), show]);
    leads.push(add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(...at), V(...from)]), M.lead)));
  };
  const SHOW = { ghost: () => ghost.visible, left: () => camera.position.z < 40 }; // ghost: 분해 보기 때만, left: 왼쪽에서 볼 때만
  for (const t of J.tags) { P = N[t.parent]; tag(t.text, t.at, t.from, t.printed, t.show && SHOW[t.show]); }
  P = robot;

  // ---- 다리: 허벅지는 엉덩이 축에서 돌고, 무릎 서보 혼과 푸시로드가 아랫다리를 당긴다 ----
  const up = V(0, 1, 0), across = V(0, 0, 1);
  const legs = [0, 1, 2, 3].map((i) => { // CAD 순서: 앞 왼쪽 · 앞 오른쪽 · 뒤 왼쪽 · 뒤 오른쪽
    const s = i % 2 ? 1 : -1;
    const [thigh, shin, horn, hornJoint, kneeJoint, link, upperEye, lowerEye] = ["thigh_", "shin_", "horn_", "hornj_", "knee_", "link_", "eyeU_", "eyeL_"].map((n) => N[n + i]);
    return { thigh, pose(folded, angle) {
      const pitch = folded ? D.FOLDED_PITCH : D.STAND_PITCH;
      thigh.rotation.z = rad(pitch + angle); shin.rotation.z = rad((folded ? D.FOLDED_SHIN : D.STAND_SHIN) - pitch);
      shin.updateMatrix();
      const end = kneeJoint.position.clone().applyMatrix4(shin.matrix);
      const d = end.clone().sub(horn.position);
      d.y -= hornJoint.position.y;
      const cosine = (d.lengthSq() + D.HORN_RADIUS ** 2 - D.ROD_LENGTH ** 2) / (2 * D.HORN_RADIUS * Math.hypot(d.x, d.z));
      const azimuth = Math.atan2(s * d.z, d.x) - Math.acos(THREE.MathUtils.clamp(cosine, -1, 1));
      horn.rotation.set(0, -s * azimuth, 0);
      horn.updateMatrix();
      const start = hornJoint.position.clone().applyMatrix4(horn.matrix);
      console.assert(Math.abs(start.distanceTo(end) - D.ROD_LENGTH) < 0.01, "무릎 푸시로드 길이 확인");
      link.position.copy(start); link.quaternion.setFromUnitVectors(up, end.sub(start).normalize());
      const linkInverse = link.quaternion.clone().invert();
      upperEye.quaternion.setFromUnitVectors(across, up.clone().applyQuaternion(linkInverse));
      lowerEye.quaternion.setFromUnitVectors(across, across.clone().applyQuaternion(linkInverse));
    } };
  });
  legs.forEach((leg) => leg.pose(false, 0));

  // ---- 배선 (분해 보기 · 각도에 따라 다시 그린다) ----
  const { BAT, IR_PINS, CAM_PINS } = D;
  const gpio = (n, y = 0) => [34.13 - Math.floor((n - 1) / 2) * 2.54, y, n % 2 ? 23.23 : 25.77]; // Pi 5 GPIO 핀 n (Pi 로컬, 공식 기구 도면)
  const IR_GPIO = [1, 9, 5, 3]; // 온도 센서 VIN · GND · SCL · SDA → 1번 3.3V · 9번 GND · 5번 SCL(GPIO3) · 3번 SDA(GPIO2)
  P = project;
  const tubeMesh = (m) => add(mesh(new THREE.BufferGeometry(), m));
  const cables = [0, 1, 2, 3].map(() => tubeMesh("dark")), coax = tubeMesh("dark");
  const irWires = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // 온도 센서 → 듀폰 암-암 점퍼
  const ledWires = [0, 1, 2, 3].map(() => tubeMesh("dark")); // LED 매트릭스 → 포트 3
  const piWire = tubeMesh("dark"); // Pi 5 USB-C to USB-C 전원 케이블
  const usbWire = tubeMesh("dark"); // XIAO USB-C ↔ Pi 5 USB-A 케이블 (전원 · 데이터)
  const dogWire = tubeMesh("dark"); // MechDog 보드 USB ↔ Pi 5 USB-A 케이블
  const mp3Wires = [0, 1, 2, 3].map(() => tubeMesh("dark")); // MP3 모듈 → 포트 2
  P = stockCamera;
  const stockWires = CAM_PINS.map(() => tubeMesh("dark"));
  P = robot;
  const tube = (o, pts, r) => {
    o.geometry.dispose();
    const path = new THREE.CatmullRomCurve3(pts);
    const len = path.getLength();
    o.geometry = new THREE.TubeGeometry(path, Math.max(32, Math.ceil(len / 1.5)), r, 8);
    return len;
  };
  const on = (g) => (x, y, z) => robot.worldToLocal(g.localToWorld(V(x, y, z)));
  const tailAnchors = (name) => {
    N[name].visible = false; // STEP에 남긴 꼬리선까지 뷰어에서는 한 곡선으로 그린다.
    return Object.keys(J.anchors).filter(n => n.startsWith(name + "_")).sort().map(anchor);
  };
  const piPowerTail = tailAnchors("piPowerTail").reverse(), piXiaoTail = tailAnchors("piXiaoTail").reverse();
  const piDogTail = tailAnchors("piDogTail").reverse(), dogUsbTail = tailAnchors("dogUsbTail");
  const socketEnd = (port, i) => on(sockets[port])((i - 1.5) * 2.5, 0, -1.9);
  const kneeWires = J.kneeCables.map(({name, thigh, material, moving, fixed, radius}) => {
    N[name].visible = false;
    return {o: tubeMesh(material), thigh: N[thigh], moving, fixed, radius};
  });
  const drawKneeWires = () => {
    for (const {o, thigh, moving, fixed, radius} of kneeWires) {
      const atThigh = on(thigh);
      const flex = moving.map(p => atThigh(...p)), body = fixed.map(p => V(...p));
      const slack = THREE.MathUtils.smoothstep(thigh.rotation.z, rad(D.STAND_PITCH + 5), rad(D.STAND_PITCH + 20));
      if (slack > 0) {
        // 허벅지가 수직에 가까워질수록 여유선을 디스크 바깥에 둔다.
        const exit = flex.at(-1), guide = body[0];
        exit.z += Math.sign(exit.z) * 2.8 * slack;
        const side = Math.sign(exit.z), lane = Math.abs(guide.z) - 33;
        const bend = exit.clone().lerp(guide, 0.55);
        const inner = exit.clone().lerp(guide, 0.8);
        bend.lerp(V(guide.x + 10, guide.y - 1, exit.z), slack);
        inner.lerp(V(guide.x + 10, guide.y - 1, side * (33 + lane * 0.3)), slack);
        guide.z = THREE.MathUtils.lerp(guide.z, side * (33 + lane * 0.6), slack);
        flex.push(bend, inner);
      }
      tube(o, flex.concat(body), radius);
    }
  };
  const cameraLeads = (leads, g) => leads.map((o, i) => {
    const cam = on(g);
    const dx = (i - 1.5) * 1.3, z = CAM_PINS[i];
    return tube(o, [cam(15.45, -0.5, z), cam(15.45, 3.0, z), cam(15.0, 4.5, 27.0 + dx * 0.5),
      cam(14.0, -6.0, 32.0 + dx * 0.5), cam(10.0, -18.0, 32.0 + dx * 0.5), V(62 + dx, 48, 31.5), V(48 + dx, 54, 10),
      V(34 + dx, 72, -18), V(24 + dx, 86, -35), V(22 + dx, 99, -40.5),
      on(sockets[0])(dx, 0, -5.5), socketEnd(0, i)], 0.63);
  }); // 경첩 쪽 테두리 면 오른쪽 5264 플러그(+y)에서 옆으로 돌아 배 아래로, 왼쪽 포트 1로
  let kitWireLogged = false;
  const wire = (assembled = false) => {
    robot.updateMatrixWorld(true);
    const xi = on(xiao), bk = on(brk), antenna = on(ant), ir = on(irMod);
    const le = on(led), rp = on(rpi), pb = on(pBank), mp = on(mp3);
    tube(piWire, [pb(14.5, 3.9, BAT[0] / 2 + 20.8), pb(14.5, 3.9, BAT[0] / 2 + 27), V(-74, 152, 4), V(-64, 162, -30), V(-56, 166, -50), V(-10, 172, -51), rp(1, 1.8, -53), ...piPowerTail.map(exitPoint)], 1.45); // 보조배터리 뒤 USB-C → 칸 뒤를 돌아 → 스트랩 바깥으로 → Pi 5 USB-C
    const ledLens = ledWires.map((c, i) => {
      const dx = (i - 1.5) * 1.3, lx = 6.6 + (i - 1.5) * 2.5;
      return tube(c, [le(lx, 7.0, 0), le(6.6 + dx * 1.2, 3.5, 4.0), le(6.6 + dx, 3.5, 12.5), V(44, 136, -30 + dx), V(30, 138, -32 + dx), V(4, 138, -32 + dx), V(0 + dx, 132, -46), V(-3 + dx, 121, -46), on(sockets[2])(dx, 5.5, -6.5), on(sockets[2])(dx, 0.8, -5.5), socketEnd(2, i)], 0.55);
    }); // LED 아래 5264 4핀 하우징 → 칸 왼쪽 벽과 스트랩 사이 → 바닥 날개 바깥으로 내려와 → 포트 3
    const camLens = cameraLeads(cables, bCam);
    const mp3Lens = mp3Wires.map((c, i) => {
      const dx = (i - 1.5) * 1.3, pinY = (i - 1.5) * 2.5;
      return tube(c, [mp(3.55, pinY, -27.5), mp(3.55, pinY, -32.0), V(56, 179, 8 + dx),
        V(48, 166, -16 + dx), V(45, 144, -30 + dx), V(30, 136, -31 + dx),
        V(16, 136, -31 + dx), V(11 + dx, 131, -46), V(9.5 + dx, 121, -46),
        on(sockets[1])(dx, 0.8, -6.0), socketEnd(1, i)], 0.55);
    }); // MP3 상단 5264 4핀 하우징(+Y) → LED·Pi 사이 → 칸 왼쪽 벽과 스트랩 사이 → 바닥 날개 바깥 → 포트 2
    if (assembled) {
      const kitLens = [["포트 1 비전", camLens], ["포트 2 MP3", mp3Lens], ["포트 3 LED", ledLens]];
      for (const [label, lens] of kitLens) {
        const maxLen = Math.max(...lens);
        if (maxLen > 200) console.assert(false, `키트 4핀 배선(${label}) 길이 ${maxLen.toFixed(1)} mm > 200 mm`);
      }
      if (!kitWireLogged) {
        kitWireLogged = true;
        console.log("키트 4핀 배선 길이(mm):", kitLens.map(([label, lens]) => `${label} ${Math.max(...lens).toFixed(1)}`).join(" · "));
      }
    }
    tube(coax, [xi(3.2, -8.75, 4.73), xi(7.3, -7.8, 5.0), bk(93, 131, 6.5), bk(90.5, 141.8, 6.5), bk(82.5, 143.0, 2.3), bk(75, 137, 0), antenna(0, 6.8, -1)], 0.55); // U.FL → 받침 뒷벽 위 → 안테나
    tube(usbWire, [xi(2.85, 36.8, 0), xi(2.85, 41, 0), V(70, 175, -5), V(55, 168, -30), V(44, 170, -50), V(0, 175, -50), V(-40, 178, -50), V(-62, 184, -40),
      rp(-62, 14, -32), ...piXiaoTail.map(exitPoint)], 1.6); // XIAO 위 USB-C → 스트랩 바깥 왼쪽 → Pi 뒤 USB 3.0 위 칸
    tube(dogWire, [...dogUsbTail.map(exitPoint), V(-66, 121, -34), V(-78, 167, -22),
      rp(-65, -11, -8), ...piDogTail.map(exitPoint)], 1.6); // 보드 USB → 배터리 칸 뒤 아래 → Pi 뒤 USB 2.0 위 칸
    irWires.forEach((c, i) => {
      const dz = IR_PINS[i], n = IR_GPIO[i];
      tube(c, [ir(-2.0, 35.3, dz), ir(-2.0, 38.5, dz), V(68, 168, 20 + dz), V(52, 178, 40 + dz * 0.5), V(44, 186, 48 + dz * 0.5), V(20, 186, 48 + dz * 0.5),
        V(-16, 186, 46 + dz * 0.5), rp(gpio(n)[0], 21.1, 43), rp(gpio(n)[0], 21.1, 35.8), rp(gpio(n)[0], 20.8, 28.9), rp(...gpio(n, 17.8))], 0.5);
    }); // GY-906 핀헤더 → 스트랩 바깥 오른쪽 → 케이스 GPIO 창 → Pi 1 · 9 · 5 · 3번
  };

  // 접은 자세는 아랫다리와 발을 함께 기준으로 삼는다.
  const bounds = new THREE.Box3(), footShadows = [];
  const lowY = (o) => bounds.setFromObject(o, true).min.y;
  const ground = (folded = false) => {
    robot.position.y = 0; robot.updateMatrixWorld(true);
    robot.position.y = -Math.min(...(folded ? [...feet, ...shins] : feet).map(lowY));
    robot.updateMatrixWorld(true);
    if (footShadows.length === feet.length) {
      feet.forEach((f, i) => {
        bounds.setFromObject(f, true);
        footShadows[i].position.set((bounds.min.x + bounds.max.x) / 2, 0.18, (bounds.min.z + bounds.max.z) / 2);
      });
    }
  };
  ground();
  sweeps.forEach((g) => g.traverse((o) => (o.castShadow = o.receiveShadow = false)));
  const FRONT_FEET = feet.filter((f) => f.getWorldPosition(V()).x > 0);
  const boxes = (o, precise = false) => {
    const result = [];
    o.traverseVisible(m => { if (m.isMesh) result.push(new THREE.Box3().setFromObject(m, precise)); });
    return result;
  };
  const clearanceToFeet = (o) => {
    const toes = FRONT_FEET.map(foot => new THREE.Box3().setFromObject(foot, true));
    return Math.min(...boxes(o, true).flatMap(a => toes.map(b =>
      Math.hypot(...["x", "y", "z"].map(axis => Math.max(a.min[axis] - b.max[axis], b.min[axis] - a.max[axis], 0))))));
  };
  const someVertex = (o, test) => {
    const point = V();
    let hit = false;
    o.traverseVisible(m => {
      if (hit || !m.isMesh) return;
      const vertices = m.geometry.attributes.position;
      for (let i = 0; i < vertices.count && !hit; i++) {
        hit = test(point.fromBufferAttribute(vertices, i).applyMatrix4(m.matrixWorld));
      }
    });
    return hit;
  };

  // ---- 바닥: 초록 라인 5 cm, 체크포인트 블록 5 × 20 cm ----
  P = scene;
  const plane = (w, d, m, x, y) => { const o = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), M[m]), x, y, 0); o.rotation.x = -PI / 2; o.receiveShadow = true; return o; };
  const course = grp(0,0,0,()=>{ plane(820, 460, "floor", 110, 0); plane(820, 50, "line", 110, 0.3); plane(50, 200, "cpY", 180, 0.6); plane(50, 200, "cpB", 420, 0.6); });
  const studio = grp(0,0,0,()=>{
    const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.ShadowMaterial({opacity:0.12})));
    floor.rotation.x=-PI/2; floor.receiveShadow=true;
    const radialDisc = (w, d, alpha0, alpha1) => {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const ctx = c.getContext("2d"), shade = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      shade.addColorStop(0, `rgba(38,32,22,${alpha0})`); shade.addColorStop(0.58, `rgba(38,32,22,${alpha1})`); shade.addColorStop(1, "rgba(38,32,22,0)");
      ctx.fillStyle = shade; ctx.fillRect(0, 0, 128, 128);
      const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
      const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat), 0, 0.15, 0);
      m.rotation.x = -PI / 2; return m;
    };
    radialDisc(290, 175, 0.14, 0.06);
    for (let i = 0; i < feet.length; i++) footShadows.push(radialDisc(34, 28, 0.34, 0.12));
  });

  // ---- 카메라 시야 뿔 ----
  // shortcut: 시야각은 가정값(dims.py CAM_HFOV · CAM_VFOV), 렌즈 사양을 확인하면 그 두 값만 바꾼다
  const HF = Math.tan(rad(D.CAM_HFOV / 2)), VF = Math.tan(rad(D.CAM_VFOV / 2));
  const fov = (k, eye, reach) => {
    const pos = new THREE.BufferAttribute(new Float32Array(15), 3), g = new THREE.BufferGeometry(), e = new THREE.BufferGeometry();
    g.setAttribute("position", pos); g.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
    e.setAttribute("position", pos); e.setIndex([0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1]);
    const lm = new THREE.LineBasicMaterial(); lm.color = M[k].color;
    const o = grp(0, 0, 0, (q) => q.add(new THREE.Mesh(g, M[k]), new THREE.LineSegments(e, lm)));
    o.children.forEach((c) => (c.frustumCulled = false));
    return { o, pos, eye, reach };
  };
  const aim = (f) => { // 렌즈(+X가 광축)에서 모서리 광선 4개를 바닥(y = 0)이나 reach까지
    const o = f.eye.getWorldPosition(V());
    f.pos.setXYZ(0, o.x, o.y, o.z);
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([v, h], i) => {
      const d = V(1, v * VF, h * HF).transformDirection(f.eye.matrixWorld);
      const t = d.y < 0 ? Math.min(-o.y / d.y, f.reach) : f.reach;
      f.pos.setXYZ(i + 1, o.x + d.x * t, o.y + d.y * t, o.z + d.z * t);
    });
    f.pos.needsUpdate = true;
  };
  const fovF = fov("fovF", bEye, 700), fovC = fov("fovC", fEye, 240);

  // ---- 초음파 빔: 발신부 두 개를 덮는 반지름에서 반각 15°로 퍼진다. 얼굴판 방향(수직)을 따른다 ----
  const BEAM = { r0: 22, tan: Math.tan(rad(15)), len: 200 };
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(BEAM.r0 + BEAM.len * BEAM.tan, BEAM.r0, BEAM.len, 40, 1, true), M.beam);
  beam.position.x = BEAM.len / 2; beam.rotation.z = -PI / 2;
  uEye.add(beam);
  const irCone = new THREE.Mesh(new THREE.CylinderGeometry(1.75 + 300 * Math.tan(D.IR_FOV / 2), 1.75, 300, 32, 1, true), M.ir); // 온도 센서 시야 35°, 30 cm까지
  irCone.position.x = 150; irCone.rotation.z = -PI / 2;
  irEye.add(irCone);
  const inBeam = q => q.x > 0 && q.x <= BEAM.len && Math.hypot(q.y, q.z) < BEAM.r0 + q.x * BEAM.tan;
  const corners = (o) => { // 부품 안 메시마다 자기 좌표의 상자 꼭짓점 8개 (돌아간 보드도 정확히)
    const out = [];
    o.updateWorldMatrix(true, true);
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.geometry.computeBoundingBox();
      const { min, max } = m.geometry.boundingBox;
      for (let i = 0; i < 8; i++) out.push(V(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).applyMatrix4(m.matrixWorld));
    });
    return out;
  };
  const sees = q => q.x > 0 && Math.abs(q.y) < q.x * VF && Math.abs(q.z) < q.x * HF;

  // ---- 분해 보기 · 각도 · 판정 ----
  let k = 0, kTo = 0, legA = 0;
  const place = (t) => {
    parts.forEach((g) => g.position.copy(g.userData.at).addScaledVector(g.userData.ex, t));
    ghost.visible = t > 0.02; M.ghost.opacity = 0.45 * t;
    wire(t === 0);
  };
  const BODY_X = (D.HIPS[0][0] + D.HIPS[1][0]) / 2; // 몸 중심 = 앞뒤 엉덩이 축 가운데
  let clash = false; // 마지막 measure()에서 허벅지가 장착 부품과 겹쳤는지
  function measure() { // 조립된 상태에서 바닥 시야 범위, 앞발, 초음파 간섭을 잰다
    place(0); scene.updateMatrixWorld(true);
    const bo = bEye.getWorldPosition(V());
    const ray = (v) => { // 화면 세로 위치 (-1 아래 ~ 1 위)에서 바닥과 만나는 몸 중심 기준 거리
      const d = V(1, v * VF, 0).transformDirection(bEye.matrixWorld);
      return d.y < 0 ? Math.round((bo.x - d.x * bo.y / d.y - BODY_X) / 10) : null;
    };
    const far = ray(1), range = v => `${ray(v)}~${far === null ? "수평 위" : far + " cm"}`;
    const low = Math.min(...boxes(bCam, true).map(b => b.min.y)) / 10;
    const toSonar = uEye.matrixWorld.clone().invert(), toLens = bEye.matrixWorld.clone().invert();
    const hitsBeam = p => inBeam(p.applyMatrix4(toSonar));
    const hit = [bCam, projectBracket].some(o => someVertex(o, hitsBeam)) ||
      [xBoard, xCam, xLens, ant, irBoard].some(b => corners(b).some(hitsBeam));
    const footInView = FRONT_FEET.some(f => someVertex(f, p => sees(p.applyMatrix4(toLens))));
    const footGap = Math.min(clearanceToFeet(projectBracket), clearanceToFeet(bCam));
    const io = irEye.getWorldPosition(V()), pitch = Math.asin(V(1, 0, 0).transformDirection(irEye.matrixWorld).y);
    const irAt = (a) => Math.max(0, Math.round((io.y + 250 * Math.tan(pitch + a)) / 10));
    const irSeen = [...corners(irBoard), io.clone()].some(p => sees(fEye.worldToLocal(p)));
    const near = [pBank, piMount, rpi, deck, mp3].flatMap((o) => boxes(o));
    clash = legs.some(({thigh}) => boxes(thigh, true).some((a) => near.some((b) => a.intersectsBox(b)))); // 허벅지 묶음 부품(돌아간 꼭짓점 그대로)과 배터리 · 캐리어 · Pi 부품을 하나씩 비교
    $("v3dRead").innerHTML = `바닥 카메라(몸 중심에서): 보임 <b>${range(-1)}</b>, 라인 처리(화면 위 2/3) <b>${range(-1 / 3)}</b>, 가운데 <b>${ray(0)} cm</b> · 모듈 아래 끝 바닥에서 <b>${low.toFixed(1)} cm</b> · 앞발 <b>${footInView ? "화면 안" : "화면 밖"}</b> · 앞발과 턱 장착부 <b>${footGap ? footGap.toFixed(1) + " mm" : "겹침 가능"}</b> · 초음파 빔과 <b>${hit ? "겹침" : "겹치지 않음"}</b> · 온도 센서: 25 cm 앞 높이 <b>${irAt(-D.IR_FOV / 2)}~${irAt(D.IR_FOV / 2)} cm</b>, 머리 카메라 화면에 <b>${irSeen ? "보임" : "안 보임"}</b> · 다리 ${legA}°에서 배터리 · Pi 받침과 <b>${clash ? "겹침" : "겹치지 않음"}</b>`;
    place(k);
    return !hit;
  }
  const setAngle = (a) => { bCam.rotation.z = -rad(a); $("v3dAngleOut").textContent = a + "°"; return measure(); };
  const setLeg = (a) => { legA = a; legs.forEach(leg => leg.pose(false, a)); ground(); drawKneeWires(); $("v3dLegOut").textContent = a + "°"; return measure(); }; // 네 허벅지를 같이 돌리고 발을 다시 바닥에

  // ---- 화면 (ACESFilmic 톤매핑 + 3점 스튜디오 조명 + 림 라이트) ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const cv = renderer.domElement;
  cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "MechDog 장착 구성 3D 모델");
  stage.prepend(cv);
  scene.add(new THREE.HemisphereLight(0xf6f9ff, 0xd8d0c2, 0.92));
  const sun = new THREE.DirectionalLight(0xfff9f0, 1.85);
  sun.position.set(190, 420, 250); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -240, right: 240, top: 240, bottom: -240, near: 50, far: 1500 });
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.12;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xeef5ff, 0.85);
  fill.position.set(-190, 140, -310);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xf4f8ff, 0.72);
  rim.position.set(-240, 230, 180);
  scene.add(rim);
  const bounce = new THREE.DirectionalLight(0xfff4e6, 0.65);
  bounce.position.set(25, -210, 40); scene.add(bounce);
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000), controls = new OrbitControls(camera, cv);
  const TARGET = V(0, 80, 0), VIEW = { all: [205, 142, 296], side: [0, 0, 410], front: [380, 0, 0], top: [0, 410, 0.01], rear: [-380, 0, 0], bottom: [0, -410, 0.01] };
  controls.enableDamping = true; controls.minDistance = 65; controls.maxDistance = 2500;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN };
  controls.autoRotate = false; controls.autoRotateSpeed = 0.8;
  controls.enableZoom = false; // 문서를 스크롤할 때 휠을 가로채지 않게, 누른 뒤에만 확대
  cv.addEventListener("mousedown", (e) => { if (e.button === 1) e.preventDefault(); }); // 가운데 버튼 클릭 시 브라우저 자동 스크롤 방지
  cv.addEventListener("pointerdown", () => { controls.enableZoom = true; controls.autoRotate = false; });
  cv.addEventListener("pointerleave", () => (controls.enableZoom = false));
  const fit = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const setView = (name) => { camera.position.copy(TARGET).addScaledVector(V(...VIEW[name]), (project.visible ? 1.43 : 1.06) * Math.max(1, (project.visible ? 1.5 : 1.17) / camera.aspect)); controls.target.copy(TARGET); controls.update(); };
  const v = V();
  const drawTags = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const [el, o, show] of tags) {
      o.getWorldPosition(v).project(camera);
      el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px,${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%,-50%)`;
      el.hidden = v.z > 1 || (show && !show());
    }
  };

  // ---- 조작 ----
  const state = { fov: true, beam: true, ir: true, label: stage.clientWidth > 560, print: false, explode: false, sweep: false }; // 좁은 화면은 이름표를 끈 채 시작
  const apply = () => {
    const mounted = project.visible;
    fovF.o.visible = fovC.o.visible = mounted && state.fov; beam.visible = mounted && state.beam; irCone.visible = mounted && state.ir;
    sweeps.forEach((g) => (g.visible = mounted && state.sweep));
    $("v3dLabels").hidden = !mounted || !state.label; leads.forEach((l) => (l.visible = mounted && state.label));
    M.print.opacity = state.print ? 1 : 0.75;
    for (const m of [...SOLID.map((n) => M[n]), ...EXT]) Object.assign(m, { transparent: mounted && state.print, opacity: mounted && state.print ? 0.18 : 1, depthWrite: !(mounted && state.print), needsUpdate: true });
    uGlows.forEach((g) => (g.visible = M.ledBlue.emissiveIntensity > 0 && !(mounted && state.print)));
    kTo = mounted && state.explode ? 1 : 0;
    $("v3dToggles").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.k])));
  };
  $("v3dToggles").addEventListener("click", (e) => { const b = e.target.closest("button[data-k]"); if (b) { state[b.dataset.k] = !state[b.dataset.k]; apply(); } });
  $("v3dViews").addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) { controls.autoRotate = false; setView(b.dataset.v); } });
  $("v3dAngle").addEventListener("input", (e) => setAngle(+e.target.value));
  $("v3dLeg").addEventListener("input", (e) => setLeg(+e.target.value));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", theme);

  const setModel = mode => {
    const mounted = mode === "project", folded = mode === "folded";
    project.visible = course.visible = mounted;
    studio.visible = stockCamera.visible = !mounted;
    headScrews.visible = !mounted; rearScrews.visible = true;
    M.grill.emissiveIntensity = folded ? 0 : 0.72;
    M.ledBlue.emissiveIntensity = folded ? 0 : 3.2;
    M.ledRed.emissiveIntensity = folded ? 0 : 3.4;
    uGlows.forEach((g) => (g.visible = !folded));
    sockets.forEach((o,i) => o.visible = mounted || i === 0);
    root.querySelectorAll(".v3d-angle, #v3dToggles, .v3d-legend i").forEach(o => {
      (o.tagName === "I" ? o.parentElement : o).hidden = !mounted;
    });
    $("v3dModels").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed",String(b.dataset.mode === mode)));
    if (mounted) setLeg(+$("v3dLeg").value);
    else {
      const tilt = folded ? D.STOCK_FOLD : D.STOCK_STAND;
      stockModule.rotation.z = -rad(tilt);
      legs.forEach(leg => leg.pose(folded, 0)); ground(folded); drawKneeWires();
      cameraLeads(stockWires, stockModule);
      const hip = D.HIPS[0][1] + robot.position.y, low = lowY(stockModule);
      const gap = clearanceToFeet(stockBracket), moduleGap = clearanceToFeet(stockModule);
      const contacts = folded ? [...feet, ...shins] : feet;
      console.assert(Math.abs(hip - (folded ? D.FOLDED_HIP_Y : D.STAND_HIP_Y)) <= 1 &&
        contacts.every(o => lowY(o) >= -0.01 && lowY(o) <= 1), "엉덩이 축 높이와 바닥 접지 확인", mode);
      console.assert(gap > 0 && moduleGap > 0 && low > 0, "턱 브래킷·비전 모듈과 앞발·바닥 사이 간격 확인", mode);
      $("v3dRead").textContent = `모델 추정 · 엉덩이 축 높이 ${hip.toFixed(1)} mm · 비전 모듈 광축 아래로 ${tilt}° · 모듈 최저점 높이 ${low.toFixed(1)} mm · 앞발과 브래킷 ${gap.toFixed(1)} mm, 모듈 ${moduleGap.toFixed(1)} mm`;
    }
    apply(); TARGET.y = mounted ? 93 : folded ? 36 : 50; setView("all");
  };
  $("v3dModels").addEventListener("click", e => { const b=e.target.closest("button[data-mode]"); if(b) setModel(b.dataset.mode); });
  theme(); fit();
  console.assert(setAngle(D.DOWN), "기본 각도에서 바닥 카메라가 초음파 빔 안에 있음");
  console.assert(D.LEG_RANGE.every((a) => (setLeg(a), !clash)), "다리 각도 끝(-30° · 45°)에서 허벅지가 배터리 · Pi · 스피커 칸과 겹침");
  setLeg(0);
  const tail = Math.min(...[pBank, piMount, rpi, deck, mp3, led].map((o) => new THREE.Box3().setFromObject(o).min.x));
  console.assert(tail >= D.TAIL_X - 0.1, "장착 부품이 꼬리 끝보다 뒤로 나감", tail);
  console.assert(legs.length === 4 && feet.length === 4 && servoSeats.length === 8, "네 다리와 여덟 서보의 조립 수량");
  setModel("folded");
  new ResizeObserver(fit).observe(stage);

  let raf = 0, seen = false;
  const tick = () => { // 화면에 보일 때만 그린다
    raf = 0;
    if (k !== kTo) { k = reduce || Math.abs(kTo - k) < 0.01 ? kTo : k + (kTo - k) * 0.18; place(k); }
    controls.update(); if (project.visible) { aim(fovF); aim(fovC); }
    renderer.render(scene, camera);
    if (project.visible && state.label) drawTags();
    if (seen && k !== kTo && !raf) raf = requestAnimationFrame(tick);
  };
  const redraw = () => { if (seen && !raf) raf = requestAnimationFrame(tick); };
  controls.addEventListener("change", redraw);
  root.addEventListener("click", redraw);
  root.addEventListener("input", redraw);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
  new ResizeObserver(redraw).observe(stage);
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(tick); }).observe(stage);

  // ---- 공식 3D 모델 (STEP → GLB, ../assets/3d/): 서보 HPS-0618SG · XIAO ESP32-S3 Sense · 라즈베리 파이 5. 못 읽으면 간략 모델을 그대로 둔다 ----
  const models = (async () => {
    const [sv, xi, pi] = await Promise.allSettled(["mechdog-servo-hps0618sg.glb", "xiao-esp32s3-sense.glb", "raspberry-pi-5.glb"].map((f) => loader.loadAsync(asset(f))));
    const prep = (gl, own) => { // GLB는 m 단위. own: 파일의 색을 쓴다 (아니면 서보 검정)
      const o = gl.scene;
      o.scale.setScalar(1000);
      o.traverse((c) => { if (c.isMesh) { c.castShadow = c.receiveShadow = true; if (own) EXT.add(c.material); else c.material = M.dark; } });
      return o;
    };
    const orient = (o, x, y, z, t) => { o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); o.position.copy(t); return o; }; // 파일 X · Y · Z 축이 놓일 방향
    if (pi.status === "fulfilled") { // PCB 아랫면 모서리 원점, X 85 (이더넷 쪽 +) · Y 56 (GPIO 쪽 +) · Z 위 → 로컬 (42.5 - X, Z, Y - 28)
      rpi.add(orient(prep(pi.value, true), V(-1, 0, 0), V(0, 0, 1), V(0, 1, 0), V(42.5, 0, -28)));
      rpiBoard.visible = false;
    }
    if (xi.status === "fulfilled") { // Y 두께 (PCB 뒷면 -0.25) · X 길이 (USB-C 쪽 +) · Z 폭 → 로컬 (Y + 0.25, X - 1.805, -(Z + 6.11))
      xiao.add(orient(prep(xi.value, true), V(0, 1, 0), V(1, 0, 0), V(0, 0, -1), V(0.25, -1.805, -6.11)));
      xiaoBoard.visible = false;
    }
    if (sv.status === "fulfilled") {
      const one = prep(sv.value, false);
      one.position.set(-27.62, 103.24, -147.15);
      for (const seat of servoSeats) seat.add(one.clone());
      servoBoxes.forEach(o => o.visible = false);
    }
    if (project.visible) measure();
    apply();
    if (seen && !raf) raf = requestAnimationFrame(tick);
  })().catch((e) => console.warn("공식 3D 모델을 불러오지 못해 간략 모델로 보여 준다", e));
  if (location.hash === "#ortho") window.v3dDebug = { THREE, scene, robot, studio, renderer, setModel, models };
  msg.remove();
} catch (e) {
  msg.textContent = "3D 뷰어를 불러오지 못했다. 인터넷 연결과 WebGL 지원을 확인하고, 파일을 바로 열었다면 웹 서버(python -m http.server)로 연다.";
  console.error(e);
}
})();
