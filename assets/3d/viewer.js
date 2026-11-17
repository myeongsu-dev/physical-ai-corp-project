/* 장착 구성 3D 뷰어 (5절). 단위 mm, +X 앞 · +Y 위 · +Z 로봇 오른쪽. 본체는 사양서 4절 도면(서 있을 때 214 × 126 × 138), 장착부는 장착 사진에서 읽은 대략값.
   서보 · XIAO · Pi 5는 공식 STEP을 GLB로 바꾼 ../assets/3d/ 파일을 불러와 간략 모델과 바꾼다 (못 읽으면 간략 모델 유지) */
const root = document.querySelector('[data-widget="v3d"]');
if (!root) throw new Error('[data-widget="v3d"] 요소를 찾을 수 없습니다.');
root.innerHTML = `
  <div class="v3d">
    <div class="v3d-bar">
      <span class="v3d-seg" id="v3dViews" role="group" aria-label="시점"><button type="button" data-v="all">전체</button><button type="button" data-v="side">옆</button><button type="button" data-v="front">정면</button><button type="button" data-v="bottom">아래</button></span>
      <span class="v3d-seg" id="v3dToggles" role="group" aria-label="표시"><button type="button" data-k="fov" aria-pressed="true">카메라 시야</button><button type="button" data-k="beam" aria-pressed="true">초음파 빔</button><button type="button" data-k="ir" aria-pressed="true">온도 측정 범위</button><button type="button" data-k="label" aria-pressed="true">이름표</button><button type="button" data-k="print" aria-pressed="false">3D 출력물 강조</button><button type="button" data-k="explode" aria-pressed="false">분해 보기</button><button type="button" data-k="sweep" aria-pressed="false">다리 움직임 범위</button></span>
      <label class="v3d-angle">바닥 카메라 각도<input type="range" id="v3dAngle" min="10" max="65" step="5" value="35"><output id="v3dAngleOut">35°</output></label>
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
      <tr><td>MechDog 본체</td><td>서 있을 때 214 × 126 × 138 mm, 꺼졌을 때 221 × 126 × 96 mm (사양서)</td><td>다리마다 몸통 옆 ㄷ자 어깨 브래킷(비스듬한 윗판 · 베어링이 달린 바깥 팔)은 고정이고, 그 안에서 허벅지 판 · 무릎 서보 · 혼 · 푸시로드 · 아랫다리만 엉덩이 축을 중심으로 돈다. 브래킷 윗면(바닥에서 약 117 mm)보다 위는 다리가 움직여도 빈 공간이라 Z ±62까지 짐을 얹을 수 있다 (브래킷 높이 · 바깥 끝 · 회전 범위는 사진 추정, 실측 뒤 수정)</td><td>보유</td></tr>
      <tr><td>초음파 센서</td><td>46 × 20 mm, 발신부 2개, 측정 각 15°</td><td>머리 앞면</td><td>보유</td></tr>
      <tr><td>Hiwonder 비전 모듈 (ESP32-S3 + GC2145)</td><td>59 × 43 × 17.5 mm</td><td>머리 아랫면 (기존 브래킷째). 경첩을 35°로 꺾어 화면 위 2/3(라인 모드 처리 영역)에 몸 중심 14~30 cm 앞 바닥이 들어오게 한다. 라인 모드는 160 × 140이고 화면 아래 1/3은 처리하지 않아, 블록이 위쪽 2/3에 들어오게 각도를 2주 차에 정한다</td><td>보유 (머리 위에서 옮김)</td></tr>
      <tr><td>삼각 트러스 브래킷</td><td>판 약 45 × 60 mm, 삼각 다리 4개</td><td>비전 모듈과 함께 머리 위 → 머리 아래. 판 앞 모서리(얼굴 아래 7 mm)에 비전 모듈 경첩, 다리는 머리 옆판 바깥으로 올라가 나사로 고정</td><td>보유</td></tr>
      <tr><td>바닥 각도 어댑터</td><td>약 42 × 30 × 74 mm</td><td>머리 아랫판, 레고 핀 4개, 15° 단위 구멍</td><td>3D 출력 (각도가 안 맞을 때만 · 모델에는 없음)</td></tr>
      <tr><td>XIAO ESP32-S3 Sense (OV3660)</td><td>본체 21 × 17.8 mm + Sense 확장 보드, 렌즈까지 두께 14 mm (Seeed 3D 모델)</td><td>머리 브래킷에 세워 꽂음. 렌즈는 앞, USB-C는 위. USB-C to A 케이블을 안테나 선반 위로 넘겨 배터리 위 왼쪽 → Pi 왼쪽 가장자리를 따라 Pi 5 뒤 USB 3.0 위 칸에 꽂아 전원과 영상을 함께 보낸다 (경로 약 28 cm, 케이블 30 cm 이상)</td><td>보유</td></tr>
      <tr><td>비접촉 온도 센서 GY-906 (MLX90614ESF-BCC)</td><td>보드 17 × 11 mm, 캔 Ø10.2 × 8.1 mm, 측정 시야 35° (Melexis 데이터시트 Figure 42 · Table 19)</td><td>머리 브래킷 오른쪽 홀더에 세워 꽂음. XIAO 렌즈와 같은 쪽을 보고 10° 숙인다. 캔 앞면이 XIAO 렌즈보다 뒤라 머리 카메라 화면에 들어오지 않는다. 윗변에 ㄱ자 핀헤더를 뒤에서 끼워 핀이 위로 서게 한다 (일자 핀을 뒤로 빼면 안테나 선반에 닿음). 듀폰 암-암 점퍼를 안테나 선반 위 → 배터리 위 오른쪽(LED 옆)으로 지나 Pi 5 GPIO(오른쪽 앞)에 연결: VIN → 1번(3.3V), SDA → 3번(GPIO2), SCL → 5번(GPIO3), GND → 9번 (경로 약 14 cm, 20 cm 점퍼)</td><td>구매 (4개) · 받은 모듈이 17 × 11 mm 보드인지 확인 (다르면 홀더 수정)</td></tr>
      <tr><td>2.4 GHz 플렉스 안테나</td><td>약 40 × 20 mm</td><td>머리 브래킷 뒤쪽 13 mm 상단 선반 포켓에 수납 (금속 윗판에서 13 mm 띄움)</td><td>보유</td></tr>
      <tr><td>머리 브래킷</td><td>발판 47 × 48 × 3.2 mm · 앞 12 mm 플랜지 · 높이 25 mm (외벽 2.8~3.0 mm)</td><td>머리 윗판 뒤 엣지(X 42, Z ±16)를 폭 14 mm · 두께 3 mm+ 챔퍼 U자 걸쇠로 잡고 앞 M3 구멍 2곳(X 100, Z ±17)을 Ø3.4 mm 구멍이 뚫린 12 mm 플랜지로 볼트 고정. XIAO · GY-906 포켓 모두 앞·뒤 기둥이 이어진 닫힌 문형 레일(중간 배선 창 개방) + 보강 거셋·상단 스냅으로 파손을 막고, 안테나 선반은 전고 트러스 거셋과 하부 리브로 발판까지 직접 받침</td><td>3D 출력</td></tr>
      <tr><td>라즈베리 파이 5 + 쿨러</td><td>PCB 85 × 56 × 1.6 mm (고정 구멍 58 × 49 mm), 액티브 쿨러 포함 높이 약 15 mm (공식 규격)</td><td>LED 데크 뒤쪽의 뒤 윗판 위(X -114.5~-29.5, Z ±28)에 세로 배치해 좌우 다리 · 어깨 브래킷(Z ±31 밖)과 간섭 없이 꼬리 쪽으로 33 mm 여유 돌출. USB · 이더넷은 뒤(-X), USB-C 전원 · HDMI는 왼쪽(-Z), GPIO는 오른쪽(+Z)이고 1~10번 핀이 데크 쪽 앞 끝</td><td>개인 보유 (김건주 3 + 박명수 1 · 사용 승인 확인)</td></tr>
      <tr><td>Pi 5 일체형 캐리어</td><td>외곽 86 × 58 × 3.6 mm, 통짜 4 mm 측면 보 + 가로 리브 3줄 · 플랜지형 M2.5 스탠드오프</td><td>뒤 윗판(X -81.5~-34)의 뒤 모서리 M3 2곳(X -78.5, Z ±22)과 앞 레고 구멍 4곳(X -62 · -50, Z ±18)을 M3 볼트 6개로 조인다 (레고 구멍은 아래에 너트). 뒤 엣지 걸림 리브와 양측 테이퍼 보 · 가로 리브로 꼬리 돌출부를 사다리꼴 박스 구조로 받쳐 위에서 Pi 5를 M2.5 관통 볼트로 조립</td><td>3D 출력</td></tr>
      <tr><td>LED · 배터리 데크</td><td>바닥판 74 × 50 × 3.1 mm(가운데 배선 홈 폭 8 mm) · 앞뒤 벽 2.5 × 17 mm · LED 받침판 74 × 50 × 3 mm · 고무줄 걸이 8개</td><td>등뼈 덮개 위(X -28~46, 가운데 X +9)에 놓고 LED가 쓰던 M3 구멍 4곳(X -22 · +24, Z ±8)에 볼트로 조인다. 바닥판 앞쪽은 등뼈 덮개 끝(X 30)보다 16 mm 나가 머리 브래킷 걸쇠 위 3 mm에 뜬다. 앞뒤 벽 사이 아래층에 보조배터리를 옆에서 밀어 넣고, 위층 받침판 위에 LED를 기존 스탠드오프로 단다. 바닥판 가운데 홈으로 UART 하네스가 배터리 밑을 좌우로 지난다. 뒤벽과 Pi 사이 약 1.5 mm, 앞벽과 안테나 선반 사이 약 8 mm</td><td>3D 출력</td></tr>
      <tr><td>Pi 5 전용 보조배터리</td><td>사진 추정 140 × 68 × 16 mm (5V 3~5A, USB-C 출력). 실측하면 3D 모델의 <code>BAT</code> 값만 바꾼다</td><td>LED 데크 아래층에 가로로 눕혀(긴 쪽이 좌우) 몸 가운데(X +9)에 놓는다. 양 끝은 좌우로 약 70 mm씩 나가지만 이 앞뒤 범위에는 어깨 브래킷이 없어 다리와 겹치지 않는다. 양 끝을 앞뒤 벽 걸이에 건 고무줄 2겹씩으로 감아 좌우로 빠지지 않게 하고, 앞뒤 힘은 벽이 받는다. 단자 쪽(왼쪽 끝)에서 USB-C to C 케이블을 Pi 5 USB-C(왼쪽 앞)에 꽂는다 (경로 약 8 cm). 폭이 68 mm보다 넓으면 데크 뒤벽이 Pi에 닿으니 Pi 캐리어를 그만큼 뒤로 옮긴다</td><td>보유 · 실측 필요</td></tr>
      <tr><td>LED 도트 매트릭스 (Hiwonder 8×16, TM1640)</td><td>보드 약 54 × 23 mm, 8×8 매트릭스 2개(각 20 × 20 mm), 4모서리 Ø4.8 mm 구멍 약 46 × 16 mm (실물 사진 대조)</td><td>LED · 배터리 데크 위층 받침판(바닥에서 약 148 mm) 위에 긴 쪽을 앞뒤(세로)로 맞춰, 등뼈 덮개 구멍과 같은 자리(X -22 · +24, Z ±8)의 M3 12 mm 스탠드오프 + M3 나사 · 평와셔로 4점 고정. 화면이 더 높아져 잘 보인다. 아래 12 mm 공간으로 4핀 커넥터를 꽂아 배터리 왼쪽 끝 바깥으로 내려 포트 3(IO32 · IO33)에 잇는다</td><td>보유</td></tr>
      <tr><td>I2C 케이블 (Molex 5264 호환 4P 양쪽 20 cm)</td><td>핀 간격 2.5 mm (포트 실측) · Hiwonder 센서 포트 규격 5264-4AW</td><td>비전 모듈 → 포트 1 (코드에서는 <code>IIC(2)</code>): 경로 약 19 cm로 여유가 1 cm 남짓이라 배 아래에 바짝 붙여 묶는다. LED → 포트 3: 경로 약 15 cm</td><td>구매 (8개)</td></tr>
      <tr><td>UART 선 (포트 2 ↔ Pi 5)</td><td>5264 호환 4P 양쪽 하네스 20 cm + 듀폰 수-암 점퍼 3가닥</td><td>포트 2에 꽂은 하네스를 왼쪽 덮개 바깥으로 올려 LED 데크 바닥판 홈(배터리 밑)으로 오른쪽으로 건넌 뒤, 배터리 아래 오른쪽에 둔 이음부까지 잇는다. 반대쪽 하우징에 듀폰 수 핀을 꽂고 테이프로 감은 이음부에서 데크 뒤로 올라 Pi 6번(GND) · 8번(TXD) · 10번(RXD)으로 잇는다. 보드 TX는 Pi RXD, 보드 RX는 Pi TXD로 엇갈리고, 5V 선은 이음부 안에서 끝을 절연한다 (하네스 경로 약 11 cm · 점퍼 약 5 cm, 남는 길이는 묶음)</td><td>구매</td></tr>
      <tr><td>M3 스탠드오프·볼트 · USB 케이블</td><td>M3 12 mm 스탠드오프 4개 + M3 나사·평와셔 4세트(LED 직결), M3 × 8 볼트 2개(머리 브래킷), M3 볼트 4개(LED 데크), M3 볼트 6개 · 너트 4개(Pi 캐리어), Pi 5 M2.5 나사 4개, 고무줄 4개 이상, 짧은 USB-C to USB-C 전원 케이블, USB-C to A 케이블(XIAO)</td><td>LED 매트릭스는 M3 평와셔로 Ø4.8 mm 구멍을 잡아 스탠드오프로 고정. Pi 5 전원은 LED 데크 아래층 보조배터리와 USB-C to USB-C 케이블로 직결</td><td>구매 · 보유</td></tr>
    </tbody>
  </table></div>
    <p class="muted">카메라 시야각(가로 60° · 세로 47°)은 가정값이고, 초음파 빔은 매뉴얼의 측정 각 15°를 반각으로 넓게 그렸고, 도면에서 얼굴이 약 11° 숙어 있어 빔도 그만큼 아래를 향한다. 온도 센서의 시야 35°는 데이터시트 값이고 30 cm까지 그렸다.</p>
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
  const grillTex = (() => { // 초음파 발신부의 메쉬
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = c.height = 64;
    g.fillStyle = "#2b2e33"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#a7adb4";
    for (let y = 1; y < 64; y += 4) for (let x = y % 8 === 1 ? 1 : 3; x < 64; x += 4) g.fillRect(x, y, 2, 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const M = {
    body: std({ metalness: 0.25, roughness: 0.3 }), dark: std({ roughness: 0.75 }), rubber: std({ roughness: 0.95 }),
    metal: std({ metalness: 1, roughness: 0.25 }), pcb: std({ roughness: 0.55 }), white: std({ roughness: 0.6 }), pin: std({ roughness: 0.6 }),
    grill: std({ map: grillTex, metalness: 0.4, roughness: 0.5 }), print: std({ roughness: 0.6, transparent: true, opacity: 0.75 }),
    floor: std({ roughness: 1 }), line: std({ roughness: 1 }), cpY: std({ roughness: 1 }), cpB: std({ roughness: 1 }),
    led: new THREE.MeshBasicMaterial(), red: new THREE.MeshBasicMaterial(),
    ghost: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), lead: new THREE.LineBasicMaterial(),
    w1: std({ color: 0xd97706, roughness: 0.7 }), w2: std({ color: 0xb91c1c, roughness: 0.7 }), w3: std({ color: 0x6b3f1d, roughness: 0.7 }), // 서보 배선 (주황 · 빨강 · 갈색)
    gold: std({ color: 0xc9a227, metalness: 1, roughness: 0.35 }),
    rpiPcb: std({ color: 0x15803d, roughness: 0.45 }), rpiBlue: std({ color: 0x1d4ed8, roughness: 0.5 }),
    lens: std({ color: 0x0f2942, metalness: 0.9, roughness: 0.08 }), irPcb: std({ color: 0x5b21b6, roughness: 0.45 }),
    cooler: std({ color: 0x262a30, metalness: 0.78, roughness: 0.34 }),
    fovF: glass(), fovC: glass(), beam: glass(), ir: glass(), sweep: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
  };
  const SOLID = ["body", "dark", "rubber", "metal", "pcb", "white", "pin", "grill", "w1", "w2", "w3", "gold", "rpiPcb", "rpiBlue", "lens", "irPcb", "cooler"];
  const EXT = new Set(); // 공식 3D 모델의 재질 (3D 출력물 강조 때 함께 흐리게)
  const theme = () => { for (const k in TOK) M[k].color.set(css(TOK[k])); };

  // ---- 도형 도우미 ----
  const scene = new THREE.Scene(), robot = new THREE.Group();
  scene.add(robot);
  let P = robot; // 지금 만드는 도형이 들어갈 곳
  const add = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); P.add(o); return o; };
  const grp = (x, y, z, build) => { const g = add(new THREE.Group(), x, y, z), up = P; P = g; build(g); P = up; return g; };
  const mesh = (geo, m) => { const o = new THREE.Mesh(geo, typeof m === "string" ? M[m] : m); o.castShadow = o.receiveShadow = true; return o; };
  const box = (w, h, d, m, x, y, z) => add(mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z);
  const turn = (o, axis) => { if (axis === "x") o.rotation.z = PI / 2; if (axis === "z") o.rotation.x = PI / 2; return o; };
  const cyl = (r, len, m, x, y, z, axis = "y") => turn(add(mesh(new THREE.CylinderGeometry(r, r, len, 28), m), x, y, z), axis);
  const ball = (r, m, x, y, z) => add(mesh(new THREE.SphereGeometry(r, 16, 12), m), x, y, z);
  const ring = (r, tube, m, x, y, z, axis = "z") => { const o = add(mesh(new THREE.TorusGeometry(r, tube, 10, 36), m), x, y, z); if (axis === "x") o.rotation.y = PI / 2; if (axis === "y") o.rotation.x = PI / 2; return o; };
  const rod = (a, b, r, m, z) => { const dx = b[0] - a[0], dy = b[1] - a[1], o = cyl(r, Math.hypot(dx, dy), m, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z); o.rotation.z = Math.atan2(dy, dx) - PI / 2; return o; };
  const screw = (x, y, z) => cyl(1.8, 1.4, "dark", x, y, z, "z");

  // ---- 판금: 윤곽 + 구멍(holes)을 두께 2 mm로 뽑는다 ----
  const poly = (pts, p = new THREE.Shape()) => { pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; };
  const rr = (x, y, w, h, r = Math.min(w, h) / 2 - 0.01, p = new THREE.Shape()) => { // 둥근 사각형
    const a = x - w / 2, b = y - h / 2;
    p.moveTo(a + r, b); p.lineTo(a + w - r, b); p.absarc(a + w - r, b + r, r, -PI / 2, 0);
    p.lineTo(a + w, b + h - r); p.absarc(a + w - r, b + h - r, r, 0, PI / 2);
    p.lineTo(a + r, b + h); p.absarc(a + r, b + h - r, r, PI / 2, PI);
    p.lineTo(a, b + r); p.absarc(a + r, b + r, r, PI, PI * 1.5);
    return p;
  };
  const H = { c: (x, y, r) => new THREE.Path().absarc(x, y, r, 0, PI * 2, true), r: (x, y, w, h, r) => rr(x, y, w, h, r, new THREE.Path()), p: (pts) => poly(pts, new THREE.Path()) };
  const sheet = (shape, holes, t, m) => {
    shape.holes.push(...holes);
    const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 1, curveSegments: 10 });
    g.translate(0, 0, -t / 2);
    return mesh(g, m);
  };
  const side = (shape, holes, z, m = "body", t = 2) => add(sheet(shape, holes, t, m), 0, 0, z);                                                  // 옆판: 윤곽 (x, y)
  const flat = (shape, holes, y, m = "body", t = 2) => { const o = add(sheet(shape, holes, t, m), 0, y, 0); o.rotation.x = PI / 2; return o; };  // 윗판: 윤곽 (x, z)
  const face = (shape, holes, x, m = "body", t = 2) => { const o = add(sheet(shape, holes, t, m), x, 0, 0); o.rotation.y = -PI / 2; return o; }; // 앞판: 윤곽 (z, y)

  const parts = [], tags = [], leads = [];
  const part = (g, ex) => { g.userData = { at: g.position.clone(), ex: V(...ex) }; parts.push(g); return g; }; // 분해 보기에서 움직일 묶음
  const tag = (text, at, from, printed = false, show = null) => { // 이름표는 at에 두고 부품(from)까지 선으로 잇는다
    const el = document.createElement("span");
    el.textContent = text;
    if (printed) el.className = "p";
    $("v3dLabels").append(el);
    tags.push([el, add(new THREE.Object3D(), ...at), show]);
    leads.push(add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(...at), V(...from)]), M.lead)));
  };

  // ===== 몸통 (X -81.5 ~ 42, 바닥에서 80.5 ~ 124): 속이 빈 뒤 프레임, ESP32 메인보드 · 서보 커넥터, 등뼈 덮개, 뒤 윗판 =====
  const truss = (x0, n, y0, y1) => [...Array(n)].map((_, i) => { const x = x0 + i * 8; return H.p(i % 2 ? [[x - 5.5, y0], [x + 5.5, y0], [x, y1]] : [[x - 5.5, y1], [x + 5.5, y1], [x, y0]]); });
  box(64, 26, 52, "dark", -2, 95, 0);                                                                                 // 배터리 · 하부 프레임 (뒤 윗판 아래 X -80~-34는 비어 너트가 들어감)
  box(52, 1.8, 42, "pcb", 0, 117.5, 0); box(5, 3.2, 30, "white", 23, 119.5, 0);                                      // 등뼈 아래 ESP32 메인보드 · 앞쪽 서보/I2C 커넥터
  for (let i = 0; i < 6; i++) { box(3.2, 1.4, 3.4, "dark", 23.2, 120.6, -10 + i * 4); box(0.6, 1.8, 2.4, "gold", 23.2, 120.4, -10 + i * 4); }
  const PORTS = [22, 8, -6];
  for (const s of [1, -1]) {
    side(poly([[-81.5, 80.5], [42, 80.5], [42, 111.4], [-81.5, 111.4]]), truss(-12, 5, 87, 95.5), s * 29);
    [[-76, 86], [-76, 106], [-24, 86], [-24, 95], [33, 86], [33, 95]].forEach(([x, y]) => screw(x, y, s * 30.2));
    side(poly([[-34, 100], [41, 100], [41, 117], [-27, 117], [-34, 112]]), [H.r(8, 108.5, 44, 9, 1.5)], s * 30.6, "body", 1.2); // 등뼈 덮개 날개 (오른쪽 전원 창, 왼쪽 포트 창)
    [[-30, 104], [37, 104], [37, 113.5]].forEach(([x, y]) => screw(x, y, s * 31.4));
    box(43, 8.4, 0.8, "dark", 8, 108.5, s * 30.4);
    box(40, 2.2, 0.3, "white", 8, 101.8, s * 31.3);                                                                   // ON · OFF · CHARGE / 1 · 2 · 3 글자 띠
  }
  box(11, 4.4, 1.4, "metal", -3, 108.5, 31); box(4, 3.6, 2.4, "dark", -6, 108.5, 31.6);                              // ON / OFF 스위치
  cyl(1.1, 1.2, "red", 7, 109, 31, "z");                                                                             // 빨간 LED
  box(9, 8, 3, "dark", 19, 108.5, 31.4); cyl(2.6, 3.2, "metal", 19, 108.5, 31.5, "z");                               // DC 잭 (CHARGE) 외곽 + 배럴 구멍 + 중앙 핀
  cyl(1.75, 3.4, "dark", 19, 108.5, 31.6, "z"); cyl(0.55, 3.6, "gold", 19, 108.5, 31.7, "z");
  PORTS.forEach((x) => {                                                                                             // 왼쪽 I2C 포트 1 · 2 · 3: 소켓 벽 · 키잉 홈 · 어두운 공동 · 4핀 접점
    box(10.6, 5.2, 2.8, "white", x, 108.5, -31.5);
    box(8.8, 3.4, 1.8, "dark", x, 108.5, -32.2);
    for (const dx of [-2.4, 2.4]) box(1.4, 0.8, 1.2, "dark", x + dx, 110.5, -32.3);
    for (let i = 0; i < 4; i++) cyl(0.32, 2.4, "gold", x - 3 + i * 2, 108.5, -32.1, "z");
    box(9.9, 4.8, 5.6, "white", x, 108.5, -35.6);                                                                    // 꽂힌 5264 4P 하우징 (선은 바깥 -Z로 나온다)
  });
  const cham = (x0, x1, y0, y1, z0, z1) => [1, -1].forEach((s) => (box(x1 - x0, 2, Math.hypot(y1 - y0, z1 - z0) + 1, "body", (x0 + x1) / 2, (y0 + y1) / 2, s * (z0 + z1) / 2).rotation.x = s * Math.atan2(y0 - y1, z1 - z0))); // 윗판에서 옆판으로 꺾이는 모서리
  flat(rr(1.5, 0, 57, 46, 2), [...[-2, -1, 0, 1, 2].map((i) => H.r(-2 + i * 4.5, 0, 2.2, 28 - Math.abs(i) * 5)),
    ...[[24, -8], [24, 8], [-22, -8], [-22, 8]].map(([x, z]) => H.c(x, z, 1.6))], 124);                               // 등뼈 덮개 실물 4구멍 (폭 16 × 앞뒤 46 mm: LED 직결 자리)
  cham(-27, 30, 124, 117, 22, 29.6);
  face(poly([[-22, 124], [22, 124], [29.6, 117], [29.6, 111.4], [-29.6, 111.4], [-29.6, 117]]), [], -27);
  [M.w1, M.w2, M.w3, M.w1, M.w2, M.w3].forEach((m, i) => {
    const z = -10 + i * 4;
    add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(25.2, 120.4, z), V(33, 118.5 - (i % 2), z * 0.95), V(41, 112.5, z * 0.75), V(50, 107, z * 0.65), V(60, 101, z < 0 ? -15 : 15)]), 20, 0.7, 6), m)); // 메인보드 → 앞 엉덩이 서보 곡선 배선
  });
  const rearHoles = [];
  [-74, -62, -50].forEach((x, i) => [-18, -6, 6, 18].forEach((z, j) => rearHoles.push((i + j) % 2 ? H.c(x, z, 2) : H.r(x, z, 4, 8))));
  [[-78.5, -22], [-78.5, 22]].forEach(([x, z]) => rearHoles.push(H.c(x, z, 1.6)));                                    // 뒤 모서리 M3 구멍
  flat(rr(-58, 0, 47.5, 60, 2), rearHoles, 111.4);                                                                   // 뒤 윗판 (실물 레고 슬롯·모서리 M3 구멍)
  flat(rr(-19.75, 0, 123.5, 58, 2), [], 80.5);                                                                       // 아랫판
  flat(rr(-1, 0, 78, 46, 3), [-28, -20, 12, 20, 28].map((x) => H.r(x, 0, 2.6, 30)), 78.3);                           // 배터리 덮개
  box(14, 0.3, 24, "white", -4, 77.2, 0);
  face(rr(0, 96, 58, 31, 3), [H.r(0, 96, 26, 5)], -81.5);                                                            // 뒤판

  // ===== 머리 (X 42 ~ 107, 80.5 ~ 117.5): 윗판 아래 빈 공간 + 좌우 앞다리 서보, 실물 레고 슬롯 · 앞 M3 나사, 11° 숙은 얼굴 =====
  const servoBoxes = []; // 간략 서보 (공식 3D 모델을 불러오면 숨긴다)
  for (const s of [1, -1]) {
    servoBoxes.push(box(26, 21, 15, "dark", 74.2, 91, s * 19.5));                                                    // 좌우 앞 엉덩이 서보
    side(poly([[42, 80.5], [99.7, 80.5], [105.7, 111], [42, 111]]), [H.p([[96, 108.5], [101.5, 108.5], [99, 101.5]])], s * 29);
    [[46, 86], [46, 95]].forEach(([x, y]) => screw(x, y, s * 30.2));
  }
  flat(rr(74.5, 0, 65, 46, 2), [...[50, 62, 74, 86].flatMap((x) => [-9, 9].map((z) => H.r(x, z, 4.5, 10))),
    ...[56, 80].map((x) => H.c(x, 0, 1.8)), ...[[100, -17], [100, 17]].map(([x, z]) => H.c(x, z, 1.6))], 117.5);     // 머리 윗판 실물 구멍 (큰 슬롯 + 앞 모서리 M3)
  cham(42, 106, 117.5, 111, 22, 29.6);
  flat(rr(71, 0, 58, 58, 2), [], 80.5);                                                                              // 머리 아랫판
  let uEye;
  grp(103.35, 99, 0, (g) => { // 원점 = 얼굴 가운데, +x = 얼굴이 보는 쪽
    g.rotation.z = -Math.atan2(7.3, 37);
    face(poly([[-29, -13], [-24, -18.5], [24, -18.5], [29, -13], [29, 13], [24, 18.5], [-24, 18.5], [-29, 13]]), [H.r(0, -3.5, 49, 23)], 1); // 노랑 틀
    [[-25, -14], [25, -14], [-25, 14], [25, 14]].forEach(([z, y]) => cyl(1.6, 1.2, "dark", 2.4, y, z, "x"));
    face(rr(0, -3.5, 54, 28, 5), [], -1.5, "dark", 3);                                                               // 초음파 모듈 판
    box(4, 12, 20, "dark", 1.5, -3.5, 0); box(1.6, 5, 10.5, "metal", 2.2, 2.5, 0);                                    // IC 보강 · 수정 발진자(HC-49S)
    box(3, 5, 11, "white", -2.5, 6, 0);                                                                               // 뒷면 4핀 I2C 소켓
    for (const z of [-13.3, 13.3]) {                                                                                 // 발신부: 은색 테두리 + 메쉬 + 파란 LED 링
      cyl(9.2, 5, "dark", 2.5, -3.5, z, "x");
      cyl(8.4, 5, "metal", 3.6, -3.5, z, "x");
      add(mesh(new THREE.CircleGeometry(7.2, 32), "grill"), 6.2, -3.5, z).rotation.y = PI / 2;
      ring(7.7, 0.6, "led", 6.1, -3.5, z, "x");
    }
    uEye = add(new THREE.Object3D(), 6.2, -3.5, 0);
  });
  tag("초음파", [128, 124, 36], [110, 96, 16]);

  // ===== 다리 4개: 좌표는 엉덩이 축 기준, 무릎은 뒤로 =====
  // 고정: 몸통 옆 ㄷ자 어깨 브래킷 (비스듬한 윗판 + 바깥 팔의 베어링). 움직임: 그 안에서 축을 중심으로 도는 허벅지 판 2장 · 무릎 서보 · 혼 · 푸시로드 · 아랫다리
  // shortcut: 브래킷 윗면 높이 · 바깥 끝 · 허벅지 윗끝 반지름 · 다리 회전 범위는 실물 사진에서 잡은 값, 실측하면 SHOULDER · HUB_R · LEG_RANGE만 바꾼다
  const HIPS = [[74.2, 90.1], [-50.8, 90.1]], KNEE = [-42.2, -42.5], SH = Math.atan2(39.9, 42.2); // 아랫다리는 앞으로 43° 내려간다
  const CR = [KNEE[0] - 13 * Math.cos(SH), KNEE[1] + 13 * Math.sin(SH)], HORN = [-9, 9.2];       // 무릎 뒤 크랭크, 무릎 서보 혼
  const HUB_R = 14, LEG_RANGE = [-30, 45];                                                        // 허벅지 윗끝 반지름, 걸을 때 허벅지가 도는 범위 (+ = 앞으로)
  const SHOULDER = [[18.5, 17], [9, 25.8], [-12.5, 14.3], [-11.5, 3], [-6.5, -8.5], [1, -10.5], [7.5, -7.5], [11.5, 2]]; // 브래킷 바깥 팔 옆모습 (윗판 + 베어링을 감싼 아래 끝)
  const arc = [...Array(10)].map((_, i) => { const t = rad(-45 + i * 20); return [HUB_R * Math.cos(t), HUB_R * Math.sin(t)]; }); // 축을 감싼 둥근 윗끝 (-45° ~ 135°)
  const LEG = [...arc, [-47, -34], [-50, -40], [-49, -47], [-43, -51], [-37, -49], [-8, -26]];
  const slab = (a, b, w, m, z = 0) => { const o = box(Math.hypot(b[0] - a[0], b[1] - a[1]), 2, w, m, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z); o.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); return o; }; // 옆에서 본 선분 a → b를 따라 놓는 판
  const feet = [], legs = [], sweeps = [];
  for (const [hx, hy] of HIPS) for (const s of [1, -1]) grp(hx, hy, 0, () => {                                    // 고정 어깨 브래킷
    slab(SHOULDER[0], SHOULDER[1], 30.5, "body", s * 46.75); slab(SHOULDER[1], SHOULDER[2], 30.5, "body", s * 46.75); // 비스듬한 윗판 (Z 31.5 ~ 62)
    side(poly(SHOULDER), [], s * 61.5, "body", 1.6);                                                                // 바깥 팔
    cyl(6.5, 2.4, "dark", 0, 0, s * 63, "z"); ring(5.6, 0.8, "metal", 0, 0, s * 64);                               // 베어링 캡
    screw(14, 9, s * 62.6); screw(-8, 12, s * 62.6);
    for (const a of LEG_RANGE) sweeps.push(grp(0, 0, 0, (g) => {                                                    // 다리 움직임 범위 (양 끝 각도의 허벅지 · 무릎 서보 윤곽)
      g.rotation.z = rad(a);
      side(poly(LEG), [], s * 59, "sweep"); side(poly(LEG), [], s * 33, "sweep");
      box(27, 21, 12.5, "sweep", -3, -14, s * 46).rotation.z = PI / 4;
    }));
  });
  for (const [hx, hy] of HIPS) for (const s of [1, -1]) legs.push([grp(hx, hy, 0, () => {                       // 움직이는 허벅지 묶음 (원점 = 엉덩이 축)
    cyl(6, 4, "metal", 0, 0, s * 30.5, "z"); cyl(8, 1.4, "metal", 0, 0, s * 31.4, "z");                            // 엉덩이 서보 축 · 은색 알루미늄 플랜지
    side(poly(LEG), [], s * 59); side(poly(LEG), [], s * 33);                                                      // 허벅지 바깥판 · 안판
    screw(KNEE[0], KNEE[1], s * 60.4); screw(-21, -22, s * 60.4);
    servoBoxes.push(box(27, 21, 12.5, "dark", -3, -14, s * 46)); servoBoxes.at(-1).rotation.z = PI / 4;             // 무릎 서보 (허벅지 안, 혼이 위)
    grp(KNEE[0], KNEE[1], 0, (g) => {                                                                              // 아랫다리: 크랭크 ~ 고무 발
      g.rotation.z = -SH;
      side(poly([[-17, 4], [-13, 6.5], [0, 7], [44, 5], [50, 5], [50, -5], [44, -5], [0, -7], [-13, -6.5], [-17, -4]]), [], s * 45, "dark", 9);
      const foot = add(mesh(new THREE.CapsuleGeometry(7, 10, 6, 16), "rubber"), 55, 0, s * 45);
      foot.rotation.z = PI / 2;
      feet.push(foot);
    });
    rod(HORN, CR, 1.1, "metal", s * 53);                                                                           // 푸시로드
    for (const p of [HORN, CR]) { ball(2.8, "dark", ...p, s * 53); cyl(1.3, 12, "metal", ...p, s * 51, "z"); }
  }), s]);
  const LEGS = legs; // measure() 안에서 같은 이름의 지역 변수와 구분

  // shortcut: 온도 센서 10° 숙임은 가정값, 캔들 · 랙 아래 높이를 재 보고 IR_TILT만 바꾼다
  const IR_TILT = rad(10), IR_FOV = rad(35), IR_PINS = [3.81, 1.27, -1.27, -3.81]; // 시야 35°는 BCC형 (데이터시트 Table 19)
  // ===== 머리 위: XIAO ESP32S3 Sense + GY-906 + 안테나를 바깥에서 위→아래로 끼우는 3D 출력 브래킷 =====
  // 1) 폭 14 mm · 두께 3.1+ mm 챔퍼 U자 걸쇠로 머리 윗판 뒤 엣지(X 42, Z ±16)를 잡고, 앞 12 mm 플랜지 Ø3.4 mm 구멍(X 100, Z ±17)을 M3 × 8 볼트로 체결
  // 2) XIAO · GY-906 포켓은 앞·뒤 기둥이 상하로 이어진 닫힌 문형 레일(중간 배선 창 개방) + 보강 거셋 + 두께 2.2 mm 이상 스냅 턱으로 출력·조립 시 파손 방지
  // 3) 안테나 선반은 전고 트러스 거셋(Z ±10.6)과 하부 보강 리브로 발판까지 직접 받쳐 캔틸레버 파손 방지
  part(grp(0, 0, 0, () => { for (const z of [-17, 17]) { cyl(2.75, 2, "dark", 100, 122.4, z); cyl(1.5, 8, "metal", 100, 117.5, z); } }), [0, 44, 0]);
  let ant;
  const brk = part(grp(0, 0, 0, () => {
    flat(rr(70.5, 0, 49, 48, 3), [], 120.4, "print", 3.2);                                                           // 발판 49 × 48 × 3.2 (X 46~95, Z ±24)
    box(4.0, 1.6, 24.0, "print", 92.0, 122.8, 0);                                                                     // 앞단 중앙 비틀림 보강 리브 (IR·카메라 시야 밖)
    for (const s of [1, -1]) {
      side(poly([[48, 122.0], [40, 122.0], [37.5, 119.5], [37.5, 115.0], [40, 113.0], [47.5, 113.0], [49.0, 114.5], [47.5, 116.1], [42.0, 116.1], [41.6, 116.5], [41.6, 118.5], [42.0, 118.9], [48.0, 118.9]]), [], s * 16, "print", 13.2); // 뒤 엣지(X 42) 폭 14 mm 챔퍼 일체형 U자 걸쇠
      flat(rr(97, s * 17, 15, 12, 3), [H.c(100, s * 17, 1.7)], 120.4, "print", 3.2);                                  // 앞 M3 고정 플랜지 (폭 12 mm × 3.2 mm, Ø3.4 구멍)
    }
    face(rr(0, 134, 24, 24, 2.5), [H.r(0, 128, 4.5, 5.5), H.r(4.5, 124.5, 5.5, 3.2)], 71.8, "print", 3.0);            // XIAO 뒷벽 (두께 3.0 mm · U.FL/배선 창)
    for (const s of [1, -1]) {
      box(6.0, 2.4, 3.0, "print", 74.8, 123.2, s * 7.6);                                                              // XIAO 하부 받침 (가운데 U.FL 선 자리 개방)
      side(poly([[72.0, 121.9], [72.0, 145.8], [54.0, 130.5], [54.0, 121.9]]), [H.r(66.5, 126.2, 5.5, 4.2)], s * 10.6, "print", 3.0); // 전고 트러스 거셋 (XIAO 뒷벽 + 안테나 선반 동시 지지, 하부 배선 구멍)
      box(2.5, 24.5, 2.8, "print", 71.5, 134.25, s * 10.6);                                                           // XIAO 뒤쪽 수직 기둥 (상·하 레일 직결)
      box(6.0, 5.0, 2.8, "print", 74.2, 124.5, s * 10.6);                                                             // XIAO 하부 가이드 벽
      box(6.0, 3.0, 2.8, "print", 74.2, 145.0, s * 10.6);                                                             // XIAO 상부 가이드 벽 (중간 X 72.75~75.2 비워 핀 배선·손 진입)
      box(2.2, 24.5, 2.4, "print", 76.3, 134.25, s * 9.3);                                                            // 앞 유지 레일 (발판~상부 벽 일체형 문형 프레임)
    }
    box(3.2, 2.2, 3.6, "print", 74.6, 146.2, -8.5);                                                                   // XIAO 상단 스냅 턱 (두께 2.2 mm)
    box(4.5, 1.8, 6.5, "print", 69.2, 122.8, 14.5);                                                                   // 뒤쪽 오픈 하부 배선 안내 턱
    grp(63, 138.8, 0, (g) => {                                                                                        // 뒤쪽 경사 안테나 선반 (거셋 위 직접 안착)
      g.rotation.z = rad(42);
      box(22, 3.0, 44, "print", 0, -0.3, 0);                                                                          // 선반 바닥판 (두께 3.0 mm)
      box(22, 4.4, 3.0, "print", 0, 1.4, -20.5); box(22, 4.4, 3.0, "print", 0, 1.4, 20.5);                            // 좌우 가드 벽 (두께 3.0 mm)
      box(3.0, 2.8, 40, "print", -5.5, -2.6, 0); box(3.0, 2.8, 40, "print", 5.5, -2.6, 0);                            // 선반 하부 가로 보강 리브 (양 날개 처짐 방지)
      for (const s of [1, -1]) box(2.4, 4.4, 10, "print", -9.8, 1.4, s * 14);                                         // 뒤쪽 이탈 방지 턱 (중앙 coax 통로 개방)
      ant = box(20, 0.8, 40, "dark", 0, 1.7, 0);
    });
    side(poly([[72.5, 121.9], [72.5, 134.0], [61.0, 121.9]]), [], 21.0, "print", 3.0);                                // GY-906 뒤쪽 보강 거셋 (Z 19.5~22.5, 배선 공간 Z 12~16 비움)
    grp(74.5, 122, 18.5, (g) => {                                                                                     // GY-906 포켓 (Z +18.5: 발판 내부까지 일체 융합)
      g.rotation.z = -IR_TILT;
      box(6.0, 3.6, 15.6, "print", 0.5, 0.2, 0);                                                                      // 일체형 하부 받침 웨지 (발판과 틈 없이 직결)
      box(2.8, 15.5, 12.6, "print", -1.4, 7.75, 0);                                                                   // 뒷판 (두께 2.8 mm, 위 핀 배선 자리 개방)
      box(5.4, 17.5, 2.8, "print", 0.5, 8.75, 6.9); box(5.4, 17.5, 2.8, "print", 0.5, 8.75, -6.9);                    // 양쪽 U자 PCB 레일 (두께 2.8 mm)
      box(2.0, 5.3, 2.4, "print", 2.8, 14.85, 5.3); box(2.0, 5.3, 2.4, "print", 2.8, 14.85, -5.3);                    // 상부 앞 유지 턱 (두께 2.0 mm, 측면 레일과 견고히 겹침)
      box(2.0, 2.0, 2.4, "print", 2.8, 2.5, 5.3); box(2.0, 2.0, 2.4, "print", 2.8, 2.5, -5.3);                        // 하부 앞 코너 스톱 (캔 아래)
      box(2.6, 2.2, 3.0, "print", 1.2, 17.8, 5.5);                                                                    // 바깥 상단 스냅 후크 (두께 2.2 mm, 겹침 0.8 mm)
    });
    tag("머리 브래킷 (뒤 걸쇠 + 앞 M3×8 · 3D 출력)", [52, 174, -44], [75, 142, -11], true);
    tag("안테나 선반 (+13 mm)", [16, 162, -26], [63, 140, -12]);
  }), [-12, 24, 0]);
  let xBoard, xCam, xLens, fEye, irBoard, irEye, xiaoBoard, rpiBoard;
  const xiao = part(grp(73.5, 134.8, 0, () => { // 원점 = 본체 PCB 뒷면 가운데, +x 렌즈 쪽 · +y USB-C 쪽 (간략 모델: 세부 소자 · 버튼 · 렌즈 경통)
    xiaoBoard = grp(0, 0, 0, () => {
    const pb =(n0, n1, u0, u1, v0, v1, m) => box(n1 - n0, u1 - u0, v1 - v0, m, (n0 + n1) / 2, (u0 + u1) / 2, -(v0 + v1) / 2);
    xBoard = pb(0, 1.25, -10.48, 10.48, -8.89, 8.89, "dark");                                                    // 본체 PCB 21 × 17.8
    for (let i = -3; i <= 3; i++) for (const v of [-8.6, 8.6]) pb(-0.05, 1.32, i * 2.54 - 0.7, i * 2.54 + 0.7, v - 0.45, v + 0.45, "gold"); // 양쪽 7핀 패드
    pb(1.25, 3.25, -6.84, 3.77, -6.3, 6.3, "metal");                                                             // ESP32-S3 실드 캔
    pb(1.25, 4.45, 4.1, 12, -4.47, 4.47, "metal"); pb(2.6, 4.55, 6.2, 12.06, -3.5, 3.5, "dark");                  // USB-C 외피 + 깊은 슬롯 구멍
    pb(3.2, 4.2, 7.6, 12.08, -2.4, 2.4, "gold");                                                                   // USB-C 내부 혀(접점)
    pb(1.25, 2.3, 6.5, 9.2, 5.2, 7.6, "white"); pb(2.3, 2.9, 7.2, 8.5, 5.8, 7.0, "metal");                       // BOOT 버튼
    pb(1.25, 2.3, 6.5, 9.2, -7.6, -5.2, "white"); pb(2.3, 2.9, 7.2, 8.5, -7.0, -5.8, "metal");                   // RESET 버튼
    pb(1.25, 1.9, 4.6, 5.8, -6.8, -5.6, "w1"); pb(1.25, 1.9, 4.6, 5.8, 5.6, 6.8, "led");                         // 충전(주황) · 유저 LED
    pb(1.25, 2.5, -10.25, -7.25, -6.28, -3.18, "gold");                                                          // U.FL 안테나 단자
    pb(1.25, 4.18, -10.2, -6.8, -2.1, 6.4, "dark");                                                              // B2B 커넥터
    xCam = pb(4.18, 5.43, -10.78, 3.9, -8.39, 8.39, "dark");                                                     // Sense 확장 보드
    pb(5.43, 7.43, -10.6, -4.6, -8.07, 8.13, "white"); pb(6.6, 7.6, -9.8, -5.6, -8.2, 8.2, "dark");              // ZIF 카메라 커넥터 + 잠금 랫치
    pb(5.43, 8.03, -1.7, 3.8, -5.97, 5.43, "metal"); pb(5.9, 7.6, 3.4, 4.0, -5.4, 4.8, "dark");                  // microSD 슬롯 + 카드 투입구
    pb(6.1, 7.4, 3.2, 3.85, -4.8, 4.2, "gold");                                                                  // microSD 내부 접점
    pb(8.03, 8.38, -4.6, 2.95, -3.64, 2.36, "w1");                                                               // 캡톤 카메라 FPC
    xLens = pb(8.03, 10.6, 2.95, 10.95, -4.64, 3.36, "dark");                                                    // OV3660 센서 몸체
    cyl(3.5, 0.8, "gold", 10.8, 6.95, 0.64, "x");                                                                // 금색 나사 링
    cyl(3.4, 1.8, "dark", 11.7, 6.95, 0.64, "x"); cyl(2.8, 1.66, "dark", 13.13, 6.95, 0.64, "x");
    cyl(1.6, 0.25, "lens", 13.92, 6.95, 0.64, "x");                                                              // 코팅 유리 렌즈
    });
    box(2.6, 6.5, 8.3, "metal", 2.85, 14.3, 0); box(5.2, 15, 11, "cooler", 2.85, 25, 0); cyl(2.0, 5, "dark", 2.85, 35, 0); // 위로 꽂은 USB-C 플러그 (Pi 5 USB-A로 가는 케이블)
    fEye =add(new THREE.Object3D(), 14, 6.95, 0.64);
    tag("머리 카메라 (XIAO)", [44, 30, 12], [14, 7, 0]);
  }), [26, 40, 0]);

  // ===== XIAO 오른쪽: 비접촉 온도 센서 GY-906 (MLX90614ESF-BCC) =====
  const irMod = part(grp(74.5, 122, 18.5, (g) => {
    g.rotation.z = -IR_TILT;
    irBoard = box(1.6, 17, 11, "irPcb", 0.8, 10, 0);                                                               // 보라색 GY-906 PCB
    cyl(4.65, 1.1, "metal", 2.15, 7, 0, "x"); box(1.1, 1.2, 1.2, "metal", 2.15, 11.8, 0);                        // TO-39 바닥 플랜지 + 기준 노치 탭
    cyl(5.1, 7.07, "metal", 6.17, 7, 0, "x"); ring(4.4, 0.45, "dark", 9.65, 7, 0, "x");                          // TO-39 금속 캔 · 베젤
    cyl(2.2, 0.3, "lens", 9.8, 7, 0, "x");                                                                       // 실리콘/게르마늄 적외선 필터 창
    box(1.1, 1.6, 2.9, "dark", 2.1, 13.4, 2.6);                                                                  // 3.3 V 레귤레이터 (662K SOT-23)
    for (const dz of [-0.95, 0, 0.95]) box(0.6, 0.4, 0.35, "metal", 2.0, 14.3, 2.6 + dz);                        // IC 다리
    for (const z of [-2.4, -0.4]) box(0.8, 1.6, 0.9, "dark", 2.0, 13.8, z);                                      // 0603 풀업 저항 2개
    box(0.9, 1.6, 0.9, "w1", 2.0, 13.8, -4.1);                                                                   // 디커플링 커패시터
    IR_PINS.forEach((z) => { cyl(1.05, 1.72, "gold", 0.8, 17, z, "x"); cyl(0.55, 1.85, "dark", 0.8, 17, z, "x"); }); // 금도금 4핀 스루홀 패드
    box(2.5, 2.5, 10.2, "dark", -2.0, 18.8, 0);                                                                      // ㄱ자 핀헤더 플라스틱 (뒤에서 끼워 핀이 위로 선다, 안테나 선반을 피함)
    IR_PINS.forEach((z) => { box(3.4, 0.64, 0.64, "gold", -0.6, 17, z); box(2.5, 14, 2.5, "dark", -2.0, 28.3, z); }); // 핀 꺾임부 · 듀폰 암 하우징 (높이 14 mm)
    irEye = add(new THREE.Object3D(), 9.9, 7, 0);
    tag("온도 센서 (GY-906)", [36, 24, 48], [8, 9, 5]);
  }), [26, 40, 30]);

  // ===== 등뼈 덮개 위: LED · 배터리 데크 (3D 출력 한 덩어리). LED가 쓰던 M3 구멍 4곳에 볼트로 고정, 아래층에 보조배터리를 가로로 눕히고 위층에 LED =====
  // 배터리는 몸 가운데(X +9)에 오고 양 끝은 좌우로 나간다. 이 앞뒤 범위(X -28 ~ 46)에는 어깨 브래킷이 없어 다리와 겹치지 않는다
  // shortcut: 보조배터리 크기는 사진 추정값, 실측하면 BAT만 바꾼다. 폭이 68 mm를 넘으면 뒤벽이 Pi(X -29.5)에 닿으니 Pi 캐리어도 뒤로 옮긴다
  const BAT = [140, 16, 68], DX = 9, FT = 128.5;               // 배터리 길이(Z) · 두께(Y) · 폭(X), 데크 가운데 X, 배터리 받침면 (등뼈 덮개 위 3.1 mm)
  const ROOFB = FT + BAT[1] + 1, TOPY = ROOFB + 3;              // LED 받침판 아랫면 (배터리 위 1 mm), 윗면 = LED 스탠드오프 자리
  const WX = BAT[2] / 2 + 0.5 + 1.25, GX = [-16, -8];           // 앞뒤 벽 가운데 (DX 기준), 바닥판 배선 홈 X 범위 (UART가 배터리 밑을 좌우로 지남)
  const deck = part(grp(0, 0, 0, () => {
    flat(rr((-WX - 1.25 + DX + GX[0]) / 2, 0, GX[0] - (DX - WX - 1.25), 50, 3), [-8, 8].map((z) => H.c(-22, z, 1.7)), (125.4 + FT) / 2, "print", FT - 125.4); // 바닥판 뒤쪽 (홈 뒤)
    flat(rr((GX[1] + DX + WX + 1.25) / 2, 0, DX + WX + 1.25 - GX[1], 50, 3), [-8, 8].map((z) => H.c(24, z, 1.7)), (125.4 + FT) / 2, "print", FT - 125.4); // 바닥판 앞쪽 (홈 앞)
    for (const x of [-22, 24]) for (const z of [-8, 8]) { cyl(2.75, 1.6, "dark", x, FT - 1, z); cyl(1.5, 8, "metal", x, FT - 5, z); } // M3 볼트 4개 (LED 스탠드오프가 쓰던 구멍)
    for (const sx of [1, -1]) {
      box(2.5, ROOFB - FT, 50, "print", DX + sx * WX, (FT + ROOFB) / 2, 0);                                           // 앞 · 뒤 벽 (배터리 좌우는 열림, 바닥판 앞뒤 끝을 홈 위로 이어 줌)
      for (const sz of [1, -1]) for (const dy of [-5.5, 5.5]) { const y = FT + BAT[1] / 2 + dy; cyl(1.6, 5, "print", DX + sx * (WX + 3.75), y, sz * 24, "x"); cyl(3, 1.2, "print", DX + sx * (WX + 6.4), y, sz * 24, "x"); } // 고무줄 걸이
    }
    flat(rr(DX, 0, 2 * WX + 2.5, 50, 3), [], ROOFB + 1.5, "print", 3);                                                // LED 받침판
    tag("LED · 배터리 데크 (3D 출력, M3 4점)", [70, 196, 78], [DX, TOPY - 1.5, 24], true);
  }), [0, 14, 0]);
  const ARROW = ["       ##       ", "      ####      ", "     ######     ", "    ########    ", "   ### ## ###   ", "  ##   ##   ##  ", "       ##       ", "       ##       "];
  const led = part(grp(1, TOPY, 0, () => { // 원점 = LED 받침판 윗면 (X +1). M3 스탠드오프 [-22·+24, ±8]은 등뼈 덮개 구멍과 같은 자리
    for (const x of [-23, 23]) for (const z of [-8, 8]) {
      cyl(2.6, 12, "gold", x, 6, z); cyl(1.5, 7, "metal", x, 2.5, z);                                                 // M3 12 mm 황동 스탠드오프 + 본체 체결부
      cyl(2.7, 1.72, "gold", x, 12.8, z); cyl(3.2, 0.45, "metal", x, 13.85, z); cyl(2.4, 1.5, "dark", x, 14.8, z);   // 금패드 · M3 평와셔 · M3 나사 머리
    }
    box(54, 1.6, 23, "white", 0, 12.8, 0);                                                                            // PCB 54 × 23 × 1.6 (세로 배치)
    box(11.0, 5.4, 5.8, "white", 8, 9.3, 0); box(9.2, 4.0, 4.0, "dark", 8, 8.5, 0);                                   // 아래 4핀 수직 JST 소켓 · 공동
    for (let i = 0; i < 4; i++) cyl(0.32, 4.5, "gold", 5.0 + i * 2.0, 9.2, 0);                                        // 4핀 금도금 핀
    box(17.9, 2.2, 7.5, "dark", -10, 10.9, 0);                                                                        // TM1640 SOP-28 드라이버 칩
    for (let i = 0; i < 14; i++) for (const s of [-1, 1]) box(0.55, 0.35, 1.2, "metal", -18.2 + i * 1.27, 10.8, s * 4.2); // SOP-28 28핀 다리
    box(2.4, 1.2, 1.6, "w1", 17, 11.4, -3);                                                                           // SMD 칩 부품
    for (const x of [-10.2, 10.2]) box(20, 6, 20, "dark", x, 16.6, 0);                                                // 8×8 매트릭스 2개
    ARROW.forEach((row, r) => [...row].forEach((ch, c) => cyl(0.95, 0.3, ch === "#" ? "red" : "pin", 19.95 - c * 2.5 - (c > 7 ? 0.4 : 0), 19.7, -8.75 + r * 2.5)));
    tag("LED 도트 매트릭스 (데크 위 · 포트 3)", [26, 46, -42], [6, 19, -8]);
  }), [0, 34, 0]);

  // Pi 5 GPIO 핀 n의 자리 (Pi 로컬): 핀 1·2는 USB 반대쪽 끝(x 34.13), 홀수는 안쪽 줄 · 짝수는 가장자리 줄 (공식 기구 도면)
  const gpio = (n, y = 0) => [34.13 - Math.floor((n - 1) / 2) * 2.54, y, n % 2 ? 23.23 : 25.77];
  const IR_GPIO = [1, 9, 5, 3];  // 온도 센서 VIN · GND · SCL · SDA → 1번 3.3V · 9번 GND · 5번 SCL(GPIO3) · 3번 SDA(GPIO2)
  const UART_GPIO = [6, 8, 10];  // 포트 2 GND · RX · TX → 6번 GND · 8번 TXD(GPIO14) · 10번 RXD(GPIO15) (TX ↔ RX 엇갈림)
  // ===== 뒤 윗판 위: 라즈베리 파이 5 + 액티브 쿨러 + M3 볼트 6개(뒤 모서리 2 · 레고 구멍 4) 고정 캐리어 =====
  const piMount = part(grp(-72, 0, 0, () => {
    const holes = [H.r(-21, 0, 26, 28, 3), H.r(17, 0, 26, 28, 3),
      ...[-1, 1].map((s) => H.c(-6.5, s * 22, 3.3)),
      ...[-19, 39].flatMap((x) => [-24.5, 24.5].map((z) => H.c(x, z, 1.35)))];
    flat(rr(-0.5, 0, 86, 58, 3.5), holes, 118.2, "print", 3.6);                                                       // 트레이 86 × 58 × 3.6 (M3 카운터보어 Ø6.6 · M2.5 관통 구멍)
    box(4.0, 4.4, 36, "print", -11.5, 114.6, 0);                                                                      // 뒤 엣지 걸림·비틀림 보강 가로 리브 (X -83.5)
    box(3.5, 2.4, 36, "print", -40.5, 115.4, 0);                                                                      // 꼬리 끝단 가로 보강 리브 (박스 단면 형성)
    box(4.0, 4.4, 36, "print", 32.0, 114.6, 0);                                                                       // 앞단 가로 보강 리브
    for (const s of [1, -1]) {
      side(poly([[-42, 114.4], [-10, 112.4], [34, 112.4], [34, 116.8], [-42, 116.8]]), [], s * 18, "print", 4.0);     // 통짜 4 mm 측면 보 (꼬리 끝 5.6 mm 두께 유지)
      for (const x of [10, 22]) { cyl(2.75, 2, "dark", x, 117.4, s * 18); cyl(1.5, 10, "metal", x, 113, s * 18); box(5.5, 2.4, 5.5, "metal", x, 109.2, s * 18); } // 앞 레고 구멍 4곳(X -62·-50, Z ±18) M3 볼트 · 아래 너트
      flat(rr(-6.5, s * 22, 12, 12, 2.5), [H.c(-6.5, s * 22, 1.7)], 114.4, "print", 4.0);                             // 뒤 모서리 M3 고정 패드 (X -78.5, Z ±22, Ø3.4 구멍)
      cyl(2.75, 2, "dark", -6.5, 117.4, s * 22); cyl(1.5, 8, "metal", -6.5, 113.2, s * 22);                           // M3 × 8 볼트 (카운터보어 내 안착)
    }
    for (const x of [-19, 39]) for (const z of [-24.5, 24.5]) {
      add(mesh(new THREE.CylinderGeometry(3.4, 4.4, 1.0, 24), "print"), x, 120.5, z);                                 // 플랜지형 M2.5 스탠드오프 밑단 (응력 분산)
      cyl(3.4, 1.2, "print", x, 121.4, z); cyl(1.3, 4.5, "metal", x, 122.2, z);                                       // 스탠드오프 상단 + M2.5 관통 볼트
    }
    tag("Pi 5 뒤 윗판 캐리어 (M3 볼트 6개)", [-38, 126, 48], [-10, 118, 28], true);
  }), [0, 18, 0]);
  const rpi = part(grp(-72, 122.0, 0, () => { // 원점 = Pi 5 PCB 아랫면 중심 (LED 데크 뒤 X -114.5~-29.5). USB · 이더넷은 뒤(-X), GPIO는 오른쪽(+Z)이고 1~10번이 앞 끝
    rpiBoard = grp(0, 0, 0, () => { // 간략 모델 (공식 3D 모델을 불러오면 숨긴다)
    box(85, 1.6, 56, "rpiPcb", 0, 0.8, 0);                                                                          // PCB 85 × 56 × 1.6 (모서리 R3)
    for (const x of [-19, 39]) for (const z of [-24.5, 24.5]) { cyl(2.7, 1.72, "gold", x, 0.8, z); cyl(1.3, 1.8, "dark", x, 0.8, z); } // M2.5 금패드
    // 40핀 GPIO (+Z, 두 고정 구멍 사이 가운데) + 핀 1 흰색 기준 표시 (USB 반대쪽 끝, 안쪽 줄)
    box(51, 2.5, 5.2, "dark", 10, 2.85, 24.5); box(1.2, 2.6, 1.2, "white", ...gpio(1, 2.86));
    for (let n = 1; n <= 40; n++) box(0.65, 8.8, 0.65, "gold", ...gpio(n, 6.2));
    // 기가비트 이더넷 RJ45 (-X -33, Z -18) + T자 포트 구멍 + 8핀 접점 + 링크 LED
    box(21, 13.6, 16, "metal", -33, 8.4, -18); box(1.8, 9.8, 12.6, "dark", -42.8, 7.8, -18); box(1.4, 2.4, 5.2, "dark", -42.9, 13.2, -18);
    for (let i = 0; i < 8; i++) box(1.2, 1.4, 0.45, "gold", -42.6, 11.8, -22 + i * 1.15);
    box(0.8, 1.4, 2.2, "led", -43.3, 13.8, -23.5); box(0.8, 1.4, 2.2, "w1", -43.3, 13.8, -12.5);
    // USB 3.0 ×2 (Z -1) · USB 2.0 ×2 (Z +15.5) + 내부 공동 · 혀 · 금접점
    for (const [z, m] of [[-1, "rpiBlue"], [15.5, "dark"]]) {
      box(17, 15.6, 13.5, "metal", -34.5, 9.4, z);
      for (const y of [6.0, 13.0]) {
        box(1.8, 5.2, 11.4, "dark", -42.3, y, z); box(2.2, 1.3, 10.2, m, -42.1, y - 1.1, z);
        for (let i = 0; i < 4; i++) box(1.8, 0.4, 0.7, "gold", -42.2, y - 0.3, z - 3 + i * 2);
      }
    }
    // USB-C 전원(X +31.3, Z -24) + USB-C 플러그 · micro-HDMI ×2(X +16.7, +3.2, Z -25) · UART 3핀
    box(7.5, 3.4, 9, "metal", 31.3, 3.3, -24); box(7.2, 2.2, 1.8, "dark", 31.3, 3.3, -27.8); box(5.4, 0.8, 2.0, "gold", 31.3, 3.3, -27.7);
    for (const x of [16.7, 3.2]) { box(7.6, 3.2, 6.5, "metal", x, 3.2, -25); box(5.6, 1.8, 1.6, "dark", x, 3.2, -27.6); box(4.2, 0.7, 1.8, "gold", x, 3.2, -27.5); }
    box(2.8, 3.2, 6.2, "white", 10, 3.2, -21); box(1.8, 1.8, 4.8, "dark", 10, 4.1, -21);                             // UART 3핀 커넥터
    // 앞쪽 엣지(+X +40): 전원 버튼 + ACT/PWR LED + 아랫면 microSD 카드 슬롯
    box(3.5, 3.4, 5.5, "white", 40.5, 3.3, -21); cyl(1.1, 2.4, "pin", 41.8, 3.3, -21, "x");                         // 전면 전원 버튼
    box(1.6, 1.2, 1.6, "led", 39.2, 2.2, -24.5);                                                                      // 전원/상태 LED
    box(12, 2.0, 13, "metal", 36.8, -0.4, 0); box(1.8, 1.2, 11.2, "dark", 42.1, -0.4, 0); box(2.4, 0.8, 10.6, "dark", 43.2, -0.4, 0); // microSD + 삽입 카드
    // 상면 칩셋 · 커넥터 (Wi-Fi 실드 · RP1 · PMIC · MIPI ×2 · PCIe FFC · RTC · PoE · FAN)
    box(11, 2.2, 13, "metal", -15, 2.7, -18);                                                                         // Wi-Fi/BT RF 실드 캔
    box(13, 1.4, 13, "dark", -14, 2.3, 7);                                                                            // RP1 I/O 컨트롤러
    box(6, 1.4, 6, "dark", 24, 2.3, -15); for (const z of [-19, -11]) box(3.6, 1.8, 3.6, "dark", 24, 2.5, z);         // PMIC + 전원 인덕터
    for (const z of [-13.5, -5.5]) { box(22, 4.2, 3.2, "white", 16, 3.6, z); box(19.5, 1.2, 0.8, "dark", 16, 5.7, z); } // MIPI CSI/DSI ×2
    box(3.5, 4.2, 17, "white", 37, 3.6, 0); box(0.8, 1.2, 14.5, "dark", 37.8, 5.7, 0);                                // PCIe FFC
    box(4.8, 3.8, 6.2, "white", 27, 3.5, -18); box(3.2, 2.2, 4.6, "dark", 27, 4.5, -18);                              // RTC 2핀 소켓
    box(5.2, 2.4, 5.2, "dark", -14, 2.8, 19); for (const dx of [-1.2, 1.2]) for (const dz of [-1.2, 1.2]) box(0.6, 6.5, 0.6, "gold", -14 + dx, 5.2, 19 + dz); // PoE 4핀
    box(4.5, 4.8, 5.2, "white", -24.2, 4, 24); box(3.2, 2.0, 3.8, "dark", -24.2, 5.5, 24);                           // FAN 4핀 소켓 (USB 쪽 GPIO 끝)
    });
    box(6.8, 2.2, 3.2, "metal", 31.3, 3.3, -28.0); box(9.4, 4.8, 7.6, "cooler", 31.3, 3.3, -32.2); cyl(1.8, 3.0, "dark", 31.3, 3.3, -37.2, "z"); // C to C 상단 USB-C 플러그
    for (const n of [...IR_GPIO, ...UART_GPIO]) box(2.5, 14, 2.5, "dark", ...gpio(n, 11.1));                         // GPIO 핀에 꽂은 듀폰 암 하우징 (높이 14 mm)
    box(12, 4.6, 12.4, "metal", -45.5, 13, -1); box(16, 8, 15, "cooler", -59.5, 13, -1); cyl(2.2, 6, "dark", -70.5, 13, -1, "x"); // 뒤 USB 3.0 위 칸에 꽂은 USB-A 플러그 (XIAO 케이블)
    // 공식 Pi 5 액티브 쿨러 (검정 아노다이징 일체형 방열판 + 평평한 수평 블로워 슈라우드 + 11엽 팬 + 스프링 푸시핀 2개 + PWM 케이블)
    box(56, 2.2, 32.5, "metal", 4, 3.1, -3.75);                                                                       // 하부 알루미늄 베이스 플레이트 (FAN 소켓 자리 비움)
    box(30, 8.2, 32.5, "cooler", -7, 8.3, -3.75);                                                                     // 뒤쪽 방열 블록 (Y 4.2 ~ 12.4, FAN·PoE 핀 피함)
    for (let i = 0; i < 7; i++) box(28, 1.4, 2.4, "dark", -7, 12.2, -16.5 + i * 4.5);                                 // 상면 냉각 핀 슬롯 (요철)
    box(28, 8.2, 34, "cooler", 18, 8.3, -1);                                                                          // 앞쪽 팬 하우징 블록 (일체형 사각 + 라운드 슈라우드)
    cyl(15.2, 8.4, "cooler", 15, 8.4, -1);                                                                            // 팬 외곽 원통 턱
    cyl(13.2, 7.6, "dark", 15, 9.0, -1);                                                                              // 오목한 팬 흡입구 공동
    ring(13.6, 0.9, "cooler", 15, 12.6, -1, "y");                                                                     // 수평 원형 팬 베젤 (axis="y" -> 평평하게 눕힘!)
    grp(15, 10.6, -1, () => {                                                                                         // 11엽 곡선 블로워 임펠러 + 3점 가드 스포크
      cyl(4.6, 3.6, "dark", 0, 0, 0); cyl(1.6, 3.8, "metal", 0, 0, 0);
      for (let i = 0; i < 11; i++) { const b = box(8.8, 2.8, 0.85, "cooler", Math.cos(i * PI * 2 / 11) * 7.8, -0.2, Math.sin(i * PI * 2 / 11) * 7.8); b.rotation.y = -i * PI * 2 / 11 + 0.52; }
    });
    for (const [px, pz] of [[-12, -20.5], [29, 17]]) {                                                                // 쿨러 전용 스프링 푸시핀 2개
      cyl(2.2, 3.6, "dark", px, 4.6, pz); cyl(2.6, 2.4, "metal", px, 6.2, pz); cyl(1.8, 4.8, "white", px, 3.6, pz);
    }
    [M.dark, M.red, M.w1, M.rpiBlue].forEach((m, i) => add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      V(4, 5.5, 16.0 + i * 0.2), V(-8, 6.4, 17.0 + i * 0.3), V(-18, 7.4, 21.0 + i * 0.2), V(-24.2, 6.8, 23.6)
    ]), 12, 0.32, 6), m)));                                                                                           // 쿨러 → FAN 소켓 4선 PWM 케이블
    tag("라즈베리 파이 5", [-38, 44, -26], [8, 15, -10]);
  }), [0, 42, 0]);

  // ===== 머리 아래: 비전 모듈을 기존 트러스 브래킷째 뒤집어 달았다. 3D 출력물 없음 (장착 사진 ③ ~ ⑥) =====
  const SLOPE = rad(25), FOLD = 65, DOWN = 35; // 브래킷 판 기울기, 판에 접어 붙였을 때 렌즈가 내려다보는 각 (90 - 25), 기본 각: 라인 처리 영역(화면 위 2/3)이 몸 중심 14~30 cm
  const bracket = (m) => { // 원점 = 판 앞 모서리(경첩 축). 판은 뒤로 25° 내려가고, 삼각 다리 넷이 머리 옆판 바깥으로 올라가 나사로 고정된다
    const k = (name) => m ?? name;
    slab([0, 0], [-45 * Math.cos(SLOPE), -45 * Math.sin(SLOPE)], 60, k("body"));
    for (const s of [1, -1]) { // 다리: 머리 아랫면(+8)보다 아래는 통판 + 삼각 구멍 (장착 사진)
      side(poly([[1, -1], [0.5, 28], [-5.5, 28], [-12, 8], [-31, 8], [-33, 28], [-39.5, 28], [-42, -21]]),
        [H.p([[-2, 18], [-9.5, 2], [-2, 2]]), H.p([[-14, 3], [-28, 3], [-28, -7]]), H.p([[-35, 14], [-38, 14], [-38.6, -9], [-35.6, -5]])], s * 30.8, k("body"), 1.5);
      for (const x of [-2.5, -36.3]) cyl(1.5, 1.2, k("dark"), x, 24, s * 31.9, "z");
    }
    cyl(2.4, 46, k("dark"), 1.6, -1.6, 0, "z");                                                                    // 모듈 경첩
  };
  const camModule = (m) => { // 원점 = 경첩 축, +x = 렌즈가 보는 쪽, 몸체는 -y로 뻗는다 (실물 사진 기준 세부 묘사)
    const k = (name) => m ?? name;
    const mod = box(17.5, 43, 59, k("dark"), 11.75, -24, 0);                                                       // 본체 케이스 59 × 43 × 17.5
    box(0.8, 36, 51, k("pin"), 20.4, -24, 0); box(1.1, 33, 48, k("dark"), 20.5, -24, 0);                             // 앞면 단차 테두리
    cyl(7.2, 1.2, k("pin"), 20.8, -24, 0, "x"); cyl(5.6, 4.8, k("dark"), 22.8, -24, 0, "x");                         // 다단 카메라 경통
    cyl(3.8, 0.8, k("gold"), 25.0, -24, 0, "x"); cyl(2.6, 0.4, k("lens"), 25.3, -24, 0, "x");                        // 금색 테두리 · 광학 유리 렌즈
    box(1.2, 7, 7, k("white"), 20.8, -11, -18); cyl(1.6, 0.4, k("led"), 21.3, -38, -20, "x");                        // 보조 조명 LED · 상태 표시등
    for (const y of [-6, -42]) for (const z of [-26, 26]) cyl(1.3, 0.8, k("metal"), 20.7, y, z, "x");                // 모서리 나사 4개
    box(6, 5, 2.8, k("white"), 12, -9, 30.4); box(4.4, 3.6, 1.8, k("dark"), 12, -9, 31.1);                           // I2C 소켓 외피 · 내부 공동
    for (let i = 0; i < 4; i++) cyl(0.35, 3, k("gold"), 12, -11.5 + i * 1.65, 31.0, "z");                            // 4핀 금도금 핀
    box(7, 2.4, 9.2, k("metal"), 11, -45.5, -10); box(5.4, 1.6, 7.6, k("dark"), 11, -46.0, -10);                     // 아래 USB-C 포트 구멍 + 혀
    box(3.2, 0.8, 5.4, k("gold"), 11, -46.1, -10);
    box(4.8, 2.0, 13.5, k("metal"), 11, -45.5, 8); box(1.4, 1.2, 11.4, k("dark"), 11, -46.1, 8);                     // microSD 슬롯 투입구
    return mod;
  };
  const PV = [100, 73]; // 경첩 축: 얼굴 앞 모서리에서 7 mm 아래 (장착 사진)
  part(grp(...PV, 0, () => { bracket(); tag("트러스 브래킷 (머리에서 옮김)", [-74, -34, -56], [-37, -6, -32]); }), [-6, -14, 0]);
  let bBox, bEye;
  const bCam = part(grp(...PV, 0, () => {
    bBox = camModule();
    bEye = add(new THREE.Object3D(), 25.5, -24, 0);
    tag("바닥 카메라 (비전 모듈)", [34, 22, -58], [12, -20, -30]);
  }), [34, -22, 0]);
  const ghost = grp(105, 118.5, 0, () => { // 옮기기 전: 같은 브래킷이 머리 위에 바로 서 있었다
    bracket(M.ghost);
    grp(0, 0, 0, (g) => { g.rotation.z = -rad(FOLD); camModule(M.ghost); });
    tag("옮기기 전 자리", [-34, -44, -44], [-22, -14, -31], false, () => ghost.visible);
  });
  ghost.scale.y = -1;
  ghost.traverse((o) => (o.castShadow = o.receiveShadow = false));
  // ===== LED 데크 아래층: Pi 5 전용 보조배터리를 가로로 눕히고, 양 끝을 앞뒤 벽의 걸이에 건 고무줄로 감는다 =====
  const pBank = part(grp(DX, FT + BAT[1] / 2, 0, () => {                                                               // 원점 = 배터리 가운데. 단자는 왼쪽(-Z) 짧은 끝
    const [L, T, W] = BAT, e = -L / 2;
    box(W, T, L, "dark", 0, 0, 0);
    box(W - 6, T + 0.2, 30, "cooler", 0, 0, L / 4);                                                                   // 윗면 라벨
    box(9, 3.2, 1.6, "metal", -10, 0, e - 0.4); box(9, 3.2, 1.6, "metal", 3, 0, e - 0.4); box(13, 5.5, 1.2, "rpiBlue", 18, 0, e - 0.3); // USB-C 2 · USB-A 1
    box(8.4, 2.6, 3.2, "metal", -10, 0, e - 1.8); box(11, 6, 9, "cooler", -10, 0, e - 7.8); cyl(2, 4, "dark", -10, 0, e - 14, "z"); // C to C 하단 플러그 (Pi 전원)
    for (const sz of [1, -1]) for (const dy of [-5.5, 5.5]) {                                                         // 고무줄 2겹씩: 앞 걸이 → 배터리 끝을 감아 → 뒤 걸이
      const z0 = sz * 24, z1 = sz * (L / 2 - 6), z2 = sz * (L / 2 + 0.9);
      add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(WX + 4, dy, z0), V(W / 2 + 0.8, dy, z1), V(W / 2 - 6, dy, z2), V(6 - W / 2, dy, z2), V(-W / 2 - 0.8, dy, z1), V(-WX - 4, dy, z0)]), 40, 0.6, 6), "w1"));
    }
    tag("Pi 5 전용 보조배터리 (가로 · 고무줄 고정)", [-30, 36, -112], [-10, 0, e - 8]);
  }), [0, 0, -90]);
  const tubeMesh = (m) => add(mesh(new THREE.BufferGeometry(), m));
  const cables = [0, 1, 2, 3].map(() => tubeMesh("dark")), coax = tubeMesh("dark");
  const irWires = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // 온도 센서 VIN · GND · SCL · SDA → 듀폰 암-암 점퍼
  const ledWires = [0, 1, 2, 3].map(() => tubeMesh("dark")); // LED 매트릭스 → 포트 3
  const piWire = tubeMesh("dark"); // Pi 5 USB-C to USB-C 전원 케이블
  const usbWire = tubeMesh("dark"); // XIAO USB-C ↔ Pi 5 USB-A 케이블 (전원 · 데이터)
  const uartHarness = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // 포트 2 5264 하네스 4선 (5V 선은 이음부 안에서 끝을 절연)
  const uartJumpers = ["dark", "w1", "w3"].map((m) => tubeMesh(m)); // 이음부 → Pi 6 · 8 · 10번 듀폰 수-암 점퍼
  const JOINT = [-17, 123, 35];                                                                                       // 오른쪽, 데크 배터리 아래 · Pi 앞
  cyl(4.2, 18, "dark", ...JOINT, "x");                                                                                // 하네스 하우징에 듀폰 수 핀을 꽂고 테이프로 감은 이음부
  const tube = (o, pts, r = 0.7) => { o.geometry.dispose(); o.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, r, 6); };
  tag("I2C 포트 1 (비전) · 2 (Pi 5 UART) · 3 (LED)", [-30, 60, -84], [8, 106, -37], false, () => camera.position.z < 40); // 왼쪽에서 볼 때만
  tag("하네스↔듀폰 이음부 (테이프)", [10, 150, 100], [-17, 127, 35]);
  tag("USB-C to A (XIAO ↔ Pi 5)", [-96, 182, -86], [-90, 145, -36]);
  tag("듀폰 점퍼 → Pi GPIO", [-60, 190, 60], [-42, 146, 25]);
  const wire = () => {
    robot.updateMatrixWorld(true);
    const on = (g) => (x, y, z) => robot.worldToLocal(g.localToWorld(V(x, y, z)));
    const cam = on(bCam), xi = on(xiao), bk = on(brk), ir = on(irMod), le = on(led), rp = on(rpi), pb = on(pBank);
    tube(piWire, [pb(-10, 0, -BAT[0] / 2 - 16), pb(-10, 0, -BAT[0] / 2 - 22), V(-15, 130, -94), V(-36, 126, -66), rp(31.3, 3.3, -48), rp(31.3, 3.3, -40.5)], 1.05); // 보조배터리 왼쪽 끝 USB-C → 데크 뒤 왼쪽 → Pi 5 USB-C (왼쪽 앞)
    ledWires.forEach((c, i) => {
      const dx = (i - 1.5) * 1.4, lx = 5.0 + i * 2.0;
      tube(c, [le(lx, 6.4, 0), le(lx, 4.4, -2.5), le(lx, 4.2, -14.0), V(-6 + dx, 152, -30), V(-18 + dx, 150, -74), V(-19 + dx, 132, -77), V(-14 + dx, 120, -54), V(PORTS[2] + dx, 109.0, -41.5), V(PORTS[2] + dx, 108.5, -38.2)], 0.55);
    }); // LED 아래 4핀 소켓 → 받침판 위 → 배터리 왼쪽 끝 바깥으로 내려와 → 포트 3
    cables.forEach((c, i) => {
      const dx = (i - 1.5) * 1.5;
      tube(c, [cam(12 + dx * 0.5, -9, 32.5), cam(12 + dx * 0.8, -32, 33.8), cam(8 + dx * 0.8, -50.5, 30.8), cam(2 + dx * 0.6, -51.5, 14), V(44 + dx, 68, -2), V(28 + dx, 76, -24), V(24 + dx, 80, -33), V(22 + dx, 96, -41), V(PORTS[0] + dx, 108.5, -41.5), V(PORTS[0] + dx, 108.5, -38.2)]);
    });                                                                                                               // 비전 모듈 → 배 아래 → 왼쪽 I2C 포트 1
    tube(coax, [xi(3.2, -8.75, 4.73), xi(3.2, -11.6, 4.7), bk(72.1, 124, 4.5), bk(66, 125.5, 3.5), bk(52.5, 130.5, 2), bk(54.5, 136.5, 0.8), bk(62, 140.5, 0)], 0.55); // U.FL → 뒷벽 구멍(+4.5) → 선반 뒤턱 밖을 돌아 안테나 위로
    tube(usbWire, [xi(2.85, 37.5, 0), xi(2.85, 41, 0), V(70, 175, -5), V(57, 165, -14), V(45, 157, -30), V(0, 158, -45), V(-30, 156, -45), V(-60, 150, -36), V(-90, 144, -32),
      V(-126, 141, -31), V(-148, 139, -20), rp(-80, 13, -4), rp(-73.5, 13, -1)], 1.6);                               // XIAO 위 USB-C → 안테나 선반 위 → 배터리 위 왼쪽 → Pi 왼쪽 가장자리 → Pi 뒤 USB 3.0 위 칸
    uartHarness.forEach((c, i) => {
      const dx = (i - 1.5) * 1.4, [jx, jy, jz] = JOINT, gx = (GX[0] + GX[1]) / 2 + dx * 0.3;
      tube(c, [V(PORTS[1] + dx, 108.5, -38.2), V(PORTS[1] + dx, 109.5, -42), V(2 + dx * 0.5, 118, -42), V(-8 + dx * 0.3, 124, -30), V(gx, 126.6, -22), V(gx, 126.6, 22), V(-10 + dx * 0.3, 124.5, 30), V(jx + 13, jy, jz + dx), V(jx + 8.5, jy, jz + dx * 0.6)], 0.55);
    }); // 포트 2 → 왼쪽 덮개 바깥으로 올라와 → 데크 바닥판 홈(배터리 밑)으로 오른쪽 → 이음부
    uartJumpers.forEach((c, i) => {
      const n = UART_GPIO[i], [jx, jy, jz] = JOINT;
      tube(c, [V(jx - 8.5, jy, jz + (i - 1) * 1.2), V(-30, 124, 33), V(-33, 134, 29), V(-37, 146, 26), rp(...gpio(n, 25)), rp(...gpio(n, 18.1))], 0.5);
    }); // 이음부 → 데크 뒤로 올라 → Pi 6번 GND · 8번 TXD · 10번 RXD 위 듀폰 하우징 (오른쪽 앞)
    irWires.forEach((c, i) => {
      const dz = IR_PINS[i], n = IR_GPIO[i];
      tube(c, [ir(-2.0, 35.3, dz), ir(-2.0, 38.5, dz), V(68, 160, 18 + dz), V(50, 154, 22 + dz), V(20, 150, 27 + dz * 0.5), V(-20, 150, 27 + dz * 0.5),
        V(-34, 150, 25), rp(...gpio(n, 25)), rp(...gpio(n, 18.1))], 0.5);
    }); // GY-906 ㄱ자 핀헤더 듀폰 하우징 → 안테나 선반 위 → 배터리 위 오른쪽 (LED 옆) → Pi 1 · 9 · 5 · 3번 (오른쪽 앞)
  };
  tag("본체", [-68, 70, 50], [-68, 95, 29]);

  // 발이 바닥에 닿게 내린다 (다리 각도를 바꿀 때마다 다시)
  const ground = () => {
    robot.position.y = 0; robot.updateMatrixWorld(true);
    robot.position.y = -Math.min(...feet.map((f) => new THREE.Box3().setFromObject(f).min.y));
    robot.updateMatrixWorld(true);
  };
  ground();
  sweeps.forEach((g) => g.traverse((o) => (o.castShadow = o.receiveShadow = false)));
  const FRONT_FEET = feet.filter((f) => f.getWorldPosition(V()).x > 0);

  // ---- 바닥: 초록 라인 5 cm, 체크포인트 블록 5 × 20 cm ----
  P = scene;
  const plane = (w, d, m, x, y) => { const o = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), M[m]), x, y, 0); o.rotation.x = -PI / 2; o.receiveShadow = true; return o; };
  plane(820, 460, "floor", 110, 0); plane(820, 50, "line", 110, 0.3); plane(50, 200, "cpY", 180, 0.6); plane(50, 200, "cpB", 420, 0.6);

  // ---- 카메라 시야 뿔 ----
  // shortcut: 시야각 가로 60° · 세로 47°는 가정값, 렌즈 사양을 확인하면 이 두 값만 바꾼다
  const HF = Math.tan(rad(30)), VF = Math.tan(rad(23.5));
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

  // ---- 초음파 빔: 발신부 두 개를 덮는 반지름에서 반각 15°로 퍼진다. 얼굴이 숙은 만큼 아래를 향한다 ----
  const BEAM = { r0: 22, tan: Math.tan(rad(15)), len: 200 };
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(BEAM.r0 + BEAM.len * BEAM.tan, BEAM.r0, BEAM.len, 40, 1, true), M.beam);
  beam.position.x = BEAM.len / 2; beam.rotation.z = -PI / 2;
  uEye.add(beam);
  const irCone = new THREE.Mesh(new THREE.CylinderGeometry(1.75 + 300 * Math.tan(IR_FOV / 2), 1.75, 300, 32, 1, true), M.ir); // 온도 센서 시야 35°, 30 cm까지
  irCone.position.x = 150; irCone.rotation.z = -PI / 2;
  irEye.add(irCone);
  const inBeam = (p) => { const q = uEye.worldToLocal(p.clone()); return q.x > 0 && Math.hypot(q.y, q.z) < BEAM.r0 + q.x * BEAM.tan; };
  const corners = (b) => { const { width: w, height: h, depth: d } = b.geometry.parameters; return [...Array(8)].map((_, i) => b.localToWorld(V(i & 1 ? w / 2 : -w / 2, i & 2 ? h / 2 : -h / 2, i & 4 ? d / 2 : -d / 2))); };
  const sees = (eye, p) => { const q = eye.worldToLocal(p.clone()); return q.x > 0 && Math.abs(q.y) < q.x * VF && Math.abs(q.z) < q.x * HF; };

  // ---- 분해 보기 · 각도 · 판정 ----
  let k = 0, kTo = 0, legA = 0;
  const place = (t) => {
    parts.forEach((g) => g.position.copy(g.userData.at).addScaledVector(g.userData.ex, t));
    ghost.visible = t > 0.02; M.ghost.opacity = 0.45 * t;
    wire();
  };
  const BODY_X = (HIPS[0][0] + HIPS[1][0]) / 2; // 몸 중심 = 앞뒤 엉덩이 축 가운데
  function measure() { // 조립된 상태에서 바닥 시야 범위, 앞발, 초음파 간섭을 잰다
    place(0); scene.updateMatrixWorld(true); aim(fovF);
    const p = fovF.pos, cm = (x) => Math.round((x - BODY_X) / 10), xs = [1, 2, 3, 4].map((i) => p.getX(i));
    const floorAll = [1, 2, 3, 4].every((i) => p.getY(i) < 1), bo = bEye.getWorldPosition(V()), bd = V(1, 0, 0).transformDirection(bEye.matrixWorld);
    const ray = (v) => { const d = V(1, v * VF, 0).transformDirection(bEye.matrixWorld); return d.y < 0 ? cm(bo.x - d.x * bo.y / d.y) : "수평 위"; }; // v: 화면 세로 위치 (-1 아래 ~ 1 위)
    const span = `${cm(Math.min(...xs))}~${floorAll ? cm(Math.max(...xs)) : "수평 위"}`, low = new THREE.Box3().setFromObject(bBox).min.y / 10;
    const hit = [bBox, xBoard, xCam, xLens, ant, irBoard].some((b) => corners(b).some(inBeam)), legs = FRONT_FEET.some((f) => sees(bEye, f.getWorldPosition(V())));
    const io = irEye.getWorldPosition(V()), pitch = Math.asin(V(1, 0, 0).transformDirection(irEye.matrixWorld).y);
    const irAt = (a) => Math.max(0, Math.round((io.y + 250 * Math.tan(pitch + a)) / 10)), irSeen = [...corners(irBoard), io].some((q) => sees(fEye, q));
    const boxes = (o, precise = false) => { const r = []; o.traverse((m) => m.isMesh && m.visible && r.push(new THREE.Box3().setFromObject(m, precise))); return r; };
    const near = [pBank, piMount, rpi, deck].flatMap((o) => boxes(o));
    const clash = LEGS.some(([g]) => boxes(g, true).some((a) => near.some((b) => a.intersectsBox(b)))); // 허벅지 묶음 부품(돌아간 꼭짓점 그대로)과 배터리 · 캐리어 · Pi 부품을 하나씩 비교
    $("v3dRead").innerHTML = `바닥 카메라(몸 중심에서): 보임 <b>${span} cm</b>, 라인 처리(화면 위 2/3) <b>${ray(-1 / 3)}~${ray(1)} cm</b>, 가운데 <b>${ray(0)} cm</b> · 모듈 아래 끝 바닥에서 <b>${low.toFixed(1)} cm</b> · 앞발 <b>${legs ? "화면 안" : "화면 밖"}</b> · 초음파 빔과 <b>${hit ? "겹침" : "겹치지 않음"}</b> · 온도 센서: 25 cm 앞 높이 <b>${irAt(-IR_FOV / 2)}~${irAt(IR_FOV / 2)} cm</b>, 머리 카메라 화면에 <b>${irSeen ? "보임" : "안 보임"}</b> · 다리 ${legA}°에서 배터리 · Pi 칸과 <b>${clash ? "겹침" : "겹치지 않음"}</b>`;
    place(k);
    return !hit;
  }
  const setAngle = (a) => { bCam.rotation.z = -rad(a); $("v3dAngleOut").textContent = a + "°"; return measure(); };
  const setLeg = (a) => { legA = a; LEGS.forEach(([g]) => (g.rotation.z = rad(a))); ground(); $("v3dLegOut").textContent = a + "°"; return measure(); }; // 네 허벅지를 같이 돌리고 발을 다시 바닥에

  // ---- 화면 ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const cv = renderer.domElement;
  cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "MechDog 장착 구성 3D 모델");
  stage.prepend(cv);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8577, 0.45));
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(200, 380, -420); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -300, right: 300, top: 300, bottom: -300, near: 50, far: 1500 });
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-200, 260, 400);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000), controls = new OrbitControls(camera, cv);
  const TARGET = V(8, 66, 0), VIEW = { all: [270, 165, -310], side: [0, 25, -520], front: [520, 55, 0], bottom: [120, -400, -180] };
  controls.enableDamping = true; controls.minDistance = 150; controls.maxDistance = 2500;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN };
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.8;
  controls.enableZoom = false; // 문서를 스크롤할 때 휠을 가로채지 않게, 누른 뒤에만 확대
  cv.addEventListener("mousedown", (e) => { if (e.button === 1) e.preventDefault(); }); // 가운데 버튼 클릭 시 브라우저 자동 스크롤 방지
  cv.addEventListener("pointerdown", () => { controls.enableZoom = true; controls.autoRotate = false; });
  cv.addEventListener("pointerleave", () => (controls.enableZoom = false));
  const fit = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const setView = (name) => { camera.position.copy(TARGET).addScaledVector(V(...VIEW[name]), Math.max(1, 1.5 / camera.aspect)); controls.target.copy(TARGET); controls.update(); };
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
    fovF.o.visible = fovC.o.visible = state.fov; beam.visible = state.beam; irCone.visible = state.ir;
    sweeps.forEach((g) => (g.visible = state.sweep));
    $("v3dLabels").hidden = !state.label; leads.forEach((l) => (l.visible = state.label));
    M.print.opacity = state.print ? 1 : 0.75;
    for (const m of [...SOLID.map((n) => M[n]), ...EXT]) Object.assign(m, { transparent: state.print, opacity: state.print ? 0.18 : 1, depthWrite: !state.print, needsUpdate: true });
    kTo = +state.explode;
    $("v3dToggles").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.k])));
  };
  $("v3dToggles").addEventListener("click", (e) => { const b = e.target.closest("button[data-k]"); if (b) { state[b.dataset.k] = !state[b.dataset.k]; apply(); } });
  $("v3dViews").addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) { controls.autoRotate = false; setView(b.dataset.v); } });
  $("v3dAngle").addEventListener("input", (e) => setAngle(+e.target.value));
  $("v3dLeg").addEventListener("input", (e) => setLeg(+e.target.value));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", theme);

  theme(); fit(); setView("all"); apply();
  console.assert(setAngle(DOWN), "기본 각도에서 바닥 카메라가 초음파 빔 안에 있음");
  new ResizeObserver(fit).observe(stage);

  let raf = 0, seen = false;
  const tick = () => { // 화면에 보일 때만 그린다
    raf = 0;
    if (k !== kTo) { k = reduce || Math.abs(kTo - k) < 0.01 ? kTo : k + (kTo - k) * 0.18; place(k); }
    controls.update(); aim(fovF); aim(fovC);
    renderer.render(scene, camera);
    if (state.label) drawTags();
    if (seen) raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(tick); }).observe(stage);

  // ---- 공식 3D 모델 (STEP → GLB, ../assets/3d/): 서보 HPS-0618SG · XIAO ESP32-S3 Sense · 라즈베리 파이 5. 못 읽으면 간략 모델을 그대로 둔다 ----
  const models = (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import("three/addons/loaders/GLTFLoader.js"), import("three/addons/libs/meshopt_decoder.module.js")]);
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [sv, xi, pi] = await Promise.allSettled(["mechdog-servo-hps0618sg.glb", "xiao-esp32s3-sense.glb", "raspberry-pi-5.glb"].map((f) => loader.loadAsync(new URL("./" + f, import.meta.url).href)));
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
    if (sv.status === "fulfilled") { // 출력축 +Z, 축 끝 (27.62, -103.24, 147.15). 몸체 23 × 12 × 26: 축에서 +Y로 17.1 · -Y로 5.8
      const one = prep(sv.value, false);
      one.position.set(-27.62, 103.24, -147.15);
      const unit = new THREE.Group().add(one); // 원점 = 축 끝, +Z 축 방향, +Y 몸체 방향
      const put = (parent, tip, out, dir) => parent.add(orient(unit.clone(), V().crossVectors(dir, out), dir, out, tip));
      for (const s of [1, -1]) {
        put(robot, V(HIPS[0][0], HIPS[0][1], s * 32), V(0, 0, s), V(-1, 0, 0)); // 앞 엉덩이: 축이 옆판을 지나 다리 안판에, 몸체는 뒤로
        put(robot, V(HIPS[1][0], HIPS[1][1], s * 32), V(0, 0, s), V(1, 0, 0));  // 뒤 엉덩이: 몸체는 앞으로
      }
      for (const [g, s] of legs) put(g, V(0, -9, s * 60.3), V(0, 0, s), V(-Math.SQRT1_2, -Math.SQRT1_2, 0)); // 무릎: 다리판 사이, 축은 바깥판으로
      servoBoxes.forEach((b) => (b.visible = false));
    }
    apply();
    if (seen && !raf) raf = requestAnimationFrame(tick);
  })().catch((e) => console.warn("공식 3D 모델을 불러오지 못해 간략 모델로 보여 준다", e));
  msg.remove();
} catch (e) {
  msg.textContent = "3D 뷰어를 불러오지 못했다. 인터넷 연결과 WebGL 지원을 확인한다.";
  console.error(e);
}
