/* 장착 구성 3D 뷰어 (5절). 단위 mm, +X 앞 · +Y 위 · +Z 로봇 오른쪽. 본체는 사양서 4절 도면(서 있을 때 214 × 126 × 138), 장착부는 장착 사진에서 읽은 대략값.
   서보 · XIAO · Pi 5는 공식 STEP을 GLB로 바꾼 ../assets/3d/ 파일을 불러와 간략 모델과 바꾼다 (못 읽으면 간략 모델 유지) */
// 파일을 바로 열어도(file://) 막히지 않게 모듈이 아닌 보통 스크립트로 싣고, three.js만 import()로 CDN에서 받는다
const V3D_BASE = document.currentScript.src; // GLB 경로 기준 (이 스크립트 주소)
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
      <tr><td>XIAO ESP32-S3 Sense (OV3660)</td><td>본체 21 × 17.8 mm + Sense 확장 보드, 렌즈까지 두께 14 mm (Seeed 3D 모델)</td><td>머리 브래킷에 세워 꽂음. 렌즈는 앞, USB-C는 위. USB-C to A 케이블을 안테나 선반 위로 넘겨 배터리 왼쪽 끝 위를 지나 Pi 5 왼쪽 USB 3.0 위 칸에 꽂아 전원과 영상을 함께 보낸다 (경로 약 25 cm, 케이블 30 cm 이상)</td><td>보유</td></tr>
      <tr><td>비접촉 온도 센서 GY-906 (MLX90614ESF-BCC)</td><td>보드 17 × 11 mm, 캔 Ø10.2 × 8.1 mm, 측정 시야 35° (Melexis 데이터시트 Figure 42 · Table 19)</td><td>머리 브래킷 오른쪽 홀더에 세워 꽂음. XIAO 렌즈와 같은 쪽을 보고 10° 숙인다. 캔 앞면이 XIAO 렌즈보다 뒤라 머리 카메라 화면에 들어오지 않는다. 윗변에 ㄱ자 핀헤더를 뒤에서 끼워 핀이 위로 서게 한다 (일자 핀을 뒤로 빼면 안테나 선반에 닿음). 듀폰 암-암 점퍼를 안테나 선반 위 → 배터리 · 받침판 오른쪽 위로 지나 Pi 5 GPIO(뒤 끝 오른쪽)에 연결: VIN → 1번(3.3V), SDA → 3번(GPIO2), SCL → 5번(GPIO3), GND → 9번 (경로 약 18 cm, 20 cm 점퍼. 모자라면 수-암 점퍼를 이어 늘린다)</td><td>구매 (4개) · 받은 모듈이 17 × 11 mm 보드인지 확인 (다르면 홀더 수정)</td></tr>
      <tr><td>2.4 GHz 플렉스 안테나</td><td>약 40 × 20 mm</td><td>머리 브래킷 뒤쪽 13 mm 상단 선반 포켓에 수납 (금속 윗판에서 13 mm 띄움)</td><td>보유</td></tr>
      <tr><td>머리 브래킷</td><td>발판 47 × 48 × 3.2 mm · 앞 12 mm 플랜지 · 높이 25 mm (외벽 2.8~3.0 mm)</td><td>머리 윗판 뒤 엣지(X 42, Z ±16)를 폭 14 mm · 두께 3 mm+ 챔퍼 U자 걸쇠로 잡고 앞 M3 구멍 2곳(X 100, Z ±17)을 Ø3.4 mm 구멍이 뚫린 12 mm 플랜지로 볼트 고정. XIAO · GY-906 포켓 모두 앞·뒤 기둥이 이어진 닫힌 문형 레일(중간 배선 창 개방) + 보강 거셋·상단 스냅으로 파손을 막고, 안테나 선반은 전고 트러스 거셋과 하부 리브로 발판까지 직접 받침</td><td>3D 출력</td></tr>
      <tr><td>라즈베리 파이 5 + 쿨러</td><td>PCB 85 × 56 × 1.6 mm (고정 구멍 58 × 49 mm), 액티브 쿨러 포함 높이 약 15 mm (공식 규격)</td><td>뒤 윗판 위에 긴 쪽을 좌우로 눕혀(X -81.5~-25.5, Z -32.5~52.5) 꼬리 끝 밖으로 나가지 않는다. GPIO는 뒤 끝, USB-C 전원 · HDMI는 앞(배터리 쪽), USB · 이더넷은 왼쪽, microSD · 전원 버튼은 오른쪽이라 microSD를 캐리어에서 빼지 않고 바꿀 수 있다. 바닥에서 약 132 mm 높이로, 앞 끝이 데크 바닥판 위로 살짝 들어간다</td><td>개인 보유 (교부 1 + 김건주 동아리 3 · 사용 승인 확인)</td></tr>
      <tr><td>Pi 5 가로 캐리어</td><td>트레이 56 × 80 × 3 mm · 기둥 6 × 8 × 12 mm 4개 · 아래 리브 4줄 · M2.5 × 5 황동 스탠드오프 4개</td><td>뒤 윗판의 실물 구멍(뒤 모서리 M3 2곳 X -78.5, Z ±22 · 레고 구멍 2곳 X -50, Z ±18)에 기둥을 대고 M3 × 20 볼트 4개와 아래 너트로 조인다. 트레이는 등뼈 덮개 윗면(124 mm)보다 높은 124.6~127.6 mm에 떠서 어깨 브래킷 위로 오른쪽으로 넓어지고, 아래 리브가 넓어진 부분을 받친다. Pi 5는 아래에서 M2.5 나사로 황동 스탠드오프에 조인다. 출력: 트레이 윗면을 베드에 두고 기둥 · 리브가 위로 (서포트 없음)</td><td>3D 출력</td></tr>
      <tr><td>LED · 배터리 데크 (출력 2개)</td><td>① 배터리 칸: 바닥판 45 × 86 × 3.1 mm + 뒤 혀, 벽 두께 3 mm · 높이 27 mm, 나사 보스 7 × 7 mm 4개 ② LED 받침판: 57 × 66 × 3 mm + MP3 거치 턱</td><td>① 배터리 칸은 등뼈 덮개 위(X -25.4~31.5)에 놓고 LED가 쓰던 M3 구멍 4곳(X -22 · +24, Z ±8)에 볼트로 조인다. 네 벽이 배터리를 둘러싸고, 오른쪽 끝 벽은 USB-C 두 단자 앞이 창이라 배터리를 꽂은 채 빈 단자로 충전한다. ② LED 받침판을 벽 위 보스 4곳에 M3 × 10 나사로 덮으면 배터리 윗면 EVA 폼(1 mm)을 눌러 흔들리지 않는다. 배터리를 뺄 때만 나사 4개를 푼다. 받침판은 뒤로 13 mm 나가 LED 뒤 스탠드오프를 받고, 그 아래로 Pi 앞 끝이 들어온다. 출력: ①은 바닥판, ②는 받침판을 베드에 두고 벽 · 턱이 위로 (둘 다 서포트 없음)</td><td>3D 출력</td></tr>
      <tr><td>Pi 5 전용 보조배터리</td><td>후보 UGREEN 미니 5000 mAh 2포트: 79 × 38 × 26 mm, 112 g, USB-C 5V 3A, 18 Wh (제조사 값). 4대 모두 같은 제품. 산 제품을 재면 3D 모델의 <code>BAT</code> 값만 바꾼다</td><td>배터리 칸에 긴 쪽을 좌우로 눕혀 몸 중심(엉덩이 축 가운데) 바로 위, 장착 부품 중 가장 낮은 자리에 둔다. 좌우로 ±40 mm라 몸 폭(±63 mm) 안에 들어온다. 네 벽과 위 받침판이 잡아 따로 묶지 않는다. 단자 쪽(오른쪽 끝)에서 USB-C to C 케이블을 한 번 감아 Pi 5 USB-C(오른쪽 앞)에 꽂고, 남은 USB-C로 꽂은 채 충전한다 (충전하면서 Pi에 전원이 나가는지는 실물 확인)</td><td>구매 예정 (4개 같은 제품) · 실측 필요</td></tr>
      <tr><td>LED 도트 매트릭스 (Hiwonder 8×16, TM1640)</td><td>보드 약 54 × 23 mm, 8×8 매트릭스 2개(각 20 × 20 mm), 4모서리 Ø4.8 mm 구멍 약 46 × 16 mm (실물 사진 대조)</td><td>LED · 배터리 데크 위층 받침판(바닥에서 약 159 mm) 위에 긴 쪽을 앞뒤(세로)로 맞춰, 등뼈 덮개 구멍과 같은 자리(X -22 · +24, Z ±8)의 M3 12 mm 스탠드오프 + M3 나사 · 평와셔로 4점 고정. 아래 12 mm 공간으로 4핀 커넥터를 꽂아 배터리 왼쪽 끝 바깥으로 내려 포트 3(IO32 · IO33)에 잇는다</td><td>보유</td></tr>
      <tr><td>I2C 케이블 (Molex 5264 호환 4P 양쪽 20 cm)</td><td>핀 간격 2.5 mm (포트 실측) · Hiwonder 센서 포트 규격 5264-4AW</td><td>비전 모듈 → 포트 1 (코드에서는 <code>IIC(2)</code>): 경로 약 19 cm로 여유가 1 cm 남짓이라 배 아래에 바짝 붙여 묶는다. MP3 → 포트 2: 데크 앞벽 왼쪽 아래로 경로 약 16 cm. LED → 포트 3: 경로 약 15 cm</td><td>구매 (I2C용 10개 + UART용으로 산 4개를 MP3에 씀)</td></tr>
      <tr><td>MP3 모듈 (Hiwonder V1.1, 스피커 내장)</td><td>보드 48 × 24 × 1.6 mm, 앞면 스피커 Ø22 × 7 mm, Ø4.8 구멍 2개(간격 16 mm), 뒷면 4핀 소켓(SCL · SDA · GND · 5V) · microSD 슬롯 · YX5200 칩 (실물 사진), I2C 0x7B</td><td>LED 받침판 앞 끝의 세운 거치 턱에 6 mm 스페이서를 끼우고 M3 × 16 + 평와셔 2세트로 단다. 스피커는 앞(작업자 쪽)을 보고, 4핀 소켓 끝이 왼쪽(포트 2 쪽), microSD 끝이 오른쪽이라 카드를 뺄 수 있다. 머리 카메라 · 온도 센서보다 뒤 · 위라 시야를 가리지 않는다. Pi는 USB 명령으로 재생 번호만 보낸다</td><td>보유</td></tr>
      <tr><td>USB 케이블 (MechDog 보드 ↔ Pi 5)</td><td>보드 쪽 단자 모양은 실물 확인 (보드 USB 칩 CH34x), Pi 쪽 USB-A</td><td>보드 USB(사양서 사진상 ESP32 코어 보드 뒤 끝, 추정)에서 캐리어 트레이 아래로 빠져 왼쪽으로 나온 뒤 Pi 왼쪽 USB 2.0 위 칸에 꽂는다. 명령 · 상태를 주고받고, Pi가 보드 프로그램을 올릴 때도 같은 선을 쓴다</td><td>보유 확인</td></tr>
      <tr><td>나사 · 스탠드오프 · 폼 · USB 케이블</td><td>M3 12 mm 스탠드오프 4개 + M3 나사·평와셔 4세트(LED), M3 × 8 볼트 2개(머리 브래킷), M3 볼트 4개(배터리 칸), M3 × 10 나사 4개(받침판), M3 × 20 볼트 · 너트 4개(Pi 캐리어), M2.5 × 5 황동 스탠드오프 · M2.5 나사 4개(Pi 5), M3 × 16 · 평와셔 · 너트 2세트(MP3), EVA 폼 테이프 1 mm, 짧은 USB-C to USB-C 전원 케이블, USB-C to A 케이블(XIAO)</td><td>LED 매트릭스는 M3 평와셔로 Ø4.8 mm 구멍을 잡아 스탠드오프로 고정. Pi 5 전원은 배터리 칸의 보조배터리와 USB-C to USB-C 케이블로 직결. 남는 케이블은 데크 · 캐리어 가장자리에 케이블타이로 묶는다</td><td>구매 · 보유</td></tr>
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
    g.strokeStyle = "#9ca0a1"; g.lineWidth=1.05;
    for(let x=-64;x<128;x+=6) {
      g.beginPath(); g.moveTo(x,0); g.lineTo(x+64,64); g.moveTo(x,0); g.lineTo(x-64,64); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const M = {
    body: std({ metalness: 0.25, roughness: 0.38 }), dark: std({ roughness: 0.75 }), rubber: std({ roughness: 0.45 }),
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

  // 판금은 바닥에서 잰 높이(mm)에 놓는다. 세 덮개 사이로 서보 배선과 제어 보드가 보인다.
  const HIPS = [[74.2, 90.1], [-50.8, 90.1]], PORTS = [13, 0, -13];
  const servoBoxes = [], servoSeats = [];
  const servoSeat = (x, y, z, out, dir) => grp(x, y, z, (g) => {
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(dir, out), dir, out));
    servoSeats.push(g); // STEP과 간략 모델 모두 출력축 끝을 원점으로 쓴다.
    servoBoxes.push(grp(0, 0, 0, () => {
      box(13.6, 23.5, 21.5, "dark", 0, 5.75, -19.5);
      box(13.6, 32.1, 2.0, "dark", 0, 5.65, -8.5);
      box(13.6, 23.5, 4.2, "dark", 0, 5.75, -5.6);
      cyl(5.6, 4.0, "dark", 0, 0, -2.8, "z"); cyl(2.4, 3.2, "metal", 0, 0, -0.8, "z");
    }));
  });
  const cable = (points, r, m) => add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => V(...p))), 24, r, 6), m));
  const foldedEdge = (x0, x1, y, z, drop, zOut = 30) => {
    for (const s of [-1, 1]) {
      const o = box(x1 - x0, 1.45, Math.hypot(drop, zOut - z), "body", (x0 + x1) / 2, y - drop / 2, s * (zOut + z) / 2);
      o.rotation.x = s * Math.atan2(drop, zOut - z);
    }
  };
  const hex = (x, y, z, axis, s = 1) => {
    const o = cyl(2.15, 1.05, "dark", x, y, z, axis);
    const recess = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 6), "rubber");
    o.add(recess); recess.position.y = s * 0.55;
  };
  const markings = (label, w, h, sticker = false) => {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 64;
    const g = canvas.getContext("2d"); g.fillStyle = sticker ? "#f5f0df" : "#202126"; g.fillRect(0, 0, 512, 64);
    if (sticker) { g.strokeStyle = "#b75436"; g.lineWidth = 5; g.strokeRect(5, 5, 502, 54); }
    g.fillStyle = sticker ? "#26242a" : "#f9f4e8"; g.font = "bold 45px Arial"; g.textAlign = "center"; g.fillText(label, 256, 49);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const mat = std({ map, roughness: 0.72 }); EXT.add(mat);
    return mesh(new THREE.PlaneGeometry(w, h), mat);
  };

  // 바닥판의 모서리를 비워 각 서보의 케이블이 배 안으로 들어갈 자리를 둔다.
  const belly = [[-81, 28], [-71, 28], [-71, 20], [-35, 20], [-35, 28], [36, 28], [36, 20], [79, 20], [79, 28], [99, 28]];
  const bellyPlate = flat(poly([...belly, ...belly.slice().reverse().map(([x, z]) => [x, -z])]), [H.r(0, 0, 47, 34, 4)], 81.2, "body", 1.4);
  const innerPaint = M.body.clone(); innerPaint.vertexColors = true; EXT.add(innerPaint);
  innerPaint.color.set(css(TOK.body));
  const normals = bellyPlate.geometry.attributes.normal, shades = [];
  for (let i = 0; i < normals.count; i++) {
    const light = normals.getZ(i) < -0.9 ? 0.18 : 1;
    shades.push(light, light, light);
  }
  bellyPlate.geometry.setAttribute("color", new THREE.Float32BufferAttribute(shades, 3));
  bellyPlate.material = innerPaint;
  const lid = [[-33, -15], [-29, -15], [-29, -23], [27, -23], [29, -20], [29, -15], [33, -15],
    [33, 15], [29, 15], [29, 21], [27, 23], [-29, 23], [-29, 15], [-33, 15]];
  flat(poly(lid), [-23, -15, 15, 23].map(x => H.r(x, 0, 3.6, 29)), 79.5, "body", 1.3);
  const idPlate = add(markings("48", 20, 7, true), 0, 78.35, 0);
  idPlate.rotation.set(PI / 2, 0, PI / 2);
  for (const x of [-31, 31]) for (const z of [-13, 13]) hex(x, 78.2, z, "y", -1);
  for (const x of [-35, 35]) for (const z of [-6, 6]) hex(x, 79.3, z, "y", -1);
  for (const x of [-75, 91]) for (const z of [-15, 15]) hex(x, 79.95, z, "y", -1);
  box(61, 19, 38, "dark", -1, 93, 0);
  flat(rr(-1, 0, 62, 48, 2), [], 110, "pcb", 1.4);
  box(34, 1.6, 20, "dark", -5, 113, 0); box(17, 2, 16, "metal", -10, 115, 12);
  box(19, 2, 14, "dark", 4, 115, -2);
  for (const s of [-1, 1]) {
    const z = 29.5 * s;
    side(poly([[-31, 81], [28, 81], [28, 86], [39.5, 97.5], [39.5, 110.5], [20, 110.5], [20, 101.5], [-20, 101.5], [-20, 110.5], [-32, 110.5], [-32, 103], [-27.5, 96.5], [-31, 88]]),
      Array.from({ length: 5 }, (_, i) => { const x = -16 + i * 8; return H.p(i % 2 ? [[x - 4.7, 87.5], [x + 4.7, 87.5], [x, 95.5]] : [[x - 4.7, 95.5], [x + 4.7, 95.5], [x, 87.5]]); }), z);
    side(poly([[-81, 84], [-78, 81], [-31.6, 81], [-31.6, 88], [-28.1, 96.5], [-32.6, 103], [-32.6, 110.8], [-81, 110.8]]), [], z);
    side(poly([[28.6, 81], [96, 81], [101, 85], [106, 110.2], [40.1, 110.2], [40.1, 97.5], [28.6, 86]]), [], z);
    for (const y of [85, 96]) { hex(-75, y, s * 31, "z", s); hex(95, y, s * 31, "z", s); }
    for (const x of [-25, 25.5]) hex(x, 99, s * 31, "z", s);
    hex(-25, 89, s * 31, "z", s); hex(25, 90, s * 31, "z", s);
    hex(-35.5, 99, s * 31, "z", s); hex(38.5, 92.5, s * 31, "z", s); hex(44, 102, s * 31, "z", s);
    for (const [hx, hy] of HIPS) {
      servoSeat(hx, hy, s * 32, V(0, 0, s), V(hx > 0 ? -1 : 1, 0, 0));
      for (const [i, m] of ["w3", "w2", "w1"].entries()) {
        const d = i * 1.45, a = hx > 0 ? -1 : 1;
        cable([[hx + a * 14, 84, s * (18 + d)], [hx + a * 23, 82, s * (16 + d)], [hx + a * 31, 96, s * (14 + d)],
          [hx + a * 30, 114, s * (10 + d)], [hx + a * 34, 118, s * (7 + d)], [hx > 0 ? 33 : -22, 112.5, s * (5 + d)]], 0.72, m);
      }
    }
  }
  // 앞 덮개(X 42~)와 가운데 덮개(X ~29) 사이는 비어 있고, 그 사이로 흰 커넥터와 주황·빨강·갈색 서보 배선 다발이 보인다.
  for (const s of [-1, 1]) {
    box(8, 4.5, 8, "white", 33, 113, s * 17);
    box(7, 4.2, 7, "white", 35, 113, s * 6);
    for (const [i, m] of ["w3", "w2", "w1"].entries()) {
      const d = i * 1.5;
      cable([[63, 90, s * (16 + d)], [54, 99, s * (14 + d)], [46, 111, s * (8 + d)],
        [40, 119, s * (4 + d)], [35, 119, s * (10 + d)], [32, 113, s * (15 + d)]], 0.85, m);
      cable([[44, 108, s * (19 + d)], [40, 117, s * (16 + d)], [37, 120, s * (11 + d)],
        [35, 114, s * (6 + d)]], 0.78, m);
    }
  }
  // 앞 덮개: 얼굴판보다 약 4 mm 앞으로 돌출(X 111) + 3줄×2 슬롯 + 뒤 긴 슬롯 1개.
  flat(poly([[42, -20], [45, -23], [109, -23], [111, -21], [111, 21], [109, 23], [45, 23], [42, 20]]), [
    H.r(51, 0, 4.1, 18), ...[62, 74, 86].flatMap(x => [-10, 10].map(z => H.r(x, z, 4.2, 13, 1.5))),
    ...[-17, 17].map(z => H.c(100, z, 1.75))], 117.1, "body", 1.4);
  foldedEdge(44.5, 109.5, 117.1, 23, 7);
  for (const z of [-17, 17]) hex(100, 118.35, z, "y");
  // 가운데 덮개: 앞 끝 X 29는 수직으로 깔끔히 끝나고, 뒤 끝(-X)은 X -33까지 혀가 돌출한다. 측면 탭은 X ±23.5에서 나사로 고정.
  flat(poly([[-33, -21], [-31, -23], [26.5, -23], [29, -20.5], [29, 20.5], [26.5, 23], [-31, 23], [-33, 21]]), [
    ...[-12.5, -7.5, -2.5, 2.5, 7.5, 12.5].map(x => {
      const a = Math.acos((x + 1.65) / 14.5), b = Math.acos((x - 1.65) / 14.5);
      const slot = new THREE.Path();
      slot.absarc(0, 0, 14.5, a, b, false); slot.lineTo(x - 1.65, -14.5 * Math.sin(b));
      slot.absarc(0, 0, 14.5, -b, -a, false); slot.closePath(); return slot;
    }), ...[-22, 24].flatMap(x => [-8, 8].map(z => H.c(x, z, 1.75)))], 123, "body", 1.4);
  foldedEdge(-26.5, 26.5, 123, 22.5, 5.5, 31.2);
  for (const s of [-1, 1]) {
    side(poly([[-26.5, 117.5], [-26.5, 123], [-32.5, 123], [-32.5, 121.5]]), [], s * 22.0, "body", 1.4);
    side(poly([[-26.5, 117.5], [26.5, 117.5], [26.5, 105], [24, 102.5], [20, 102.5], [20, 111.5], [-20, 111.5], [-20, 102.5], [-24, 102.5], [-26.5, 105]]), [], s * 31.2, "body", 1.4);
    for (const x of [-23.5, 23.5]) hex(x, 107.5, s * 32.3, "z", s);
    const label = add(markings(s === 1 ? "ON      OFF         CHARGE" : "1               2               3", 36, 2.8), 0, 103.0, s * 30.9);
    if (s < 0) label.rotation.y = PI;
  }
  box(40, 11, 1.4, "pcb", 0, 106, 27.5); box(40, 10, 1.0, "dark", 0, 106.5, 29.8);
  box(12, 5, 5, "metal", -10, 107.5, 28); box(4.5, 4, 3, "dark", -11, 107, 31);
  box(9, 8, 6, "dark", 14, 107.5, 29); cyl(2.45, 0.8, "metal", 14, 107.5, 32.2, "z");
  cyl(1.9, 1, "dark", 14, 107.5, 32.3, "z"); cyl(0.55, 1.3, "gold", 14, 107.5, 32.4, "z");
  box(40, 10.5, 1.2, "dark", 0, 106.5, -29.8);
  const sockets = [];
  for (const x of PORTS) {
    box(11, 6, 5, "white", x, 108.5, -29.5); box(9, 4, 0.6, "dark", x, 108.5, -32);
    for (const dx of [-3, -1, 1, 3]) cyl(0.32, 1.2, "gold", x + dx, 108.5, -32.2, "z");
    sockets.push(box(9.9, 4.8, 5.6, "white", x, 108.5, -35.4));
  }
  flat(rr(-57, 0, 49, 49.4, 1.6), [
    ...[-68, -50].flatMap(x => [-17, -8, 8, 17].map(z => H.c(x, z, 2.35))),
    ...[-11, 11].map(z => H.r(-57, z, 4.8, 13)),
    ...[-22, 22].map(z => H.c(-78.5, z, 1.8))], 111.4, "body", 1.4);
  foldedEdge(-81, -33, 111.4, 24.7, 6);
  face(poly([[-29, 82], [29, 82], [29, 105], [23, 111], [-23, 111], [-29, 105]]),
    [...[-11, 11].map(z => H.r(z, 101.5, 14, 4.3)), ...[-16, -8, 8, 16].map(z => H.c(z, 91, 2.2))], -81, "body", 1.4);
  for (const z of [-22, 22]) hex(-78.5, 112.6, z, "y");

  let uEye;
  grp(103.1,98.8,0,g=>{
    g.rotation.z=-rad(11);
    const rim=poly([[-29,-13],[-24,-18],[24,-18],[29,-13],[29,12],[23,17.5],[-23,17.5],[-29,12]]);
    const aperture = new THREE.Path();
    aperture.moveTo(-14,10.5); aperture.lineTo(-6,10.5); aperture.lineTo(-3,7.8);
    aperture.lineTo(3,7.8); aperture.lineTo(6,10.5); aperture.lineTo(14,10.5);
    aperture.absarc(14,-0.8,11.3,PI/2,-PI/2,true); aperture.lineTo(6,-12.1);
    aperture.lineTo(3,-9); aperture.lineTo(-3,-9); aperture.lineTo(-6,-12.1);
    aperture.lineTo(-14,-12.1); aperture.absarc(-14,-0.8,11.3,-PI/2,-3*PI/2,true); aperture.closePath();
    face(rim,[aperture],0,"body",1.5);
    face(rr(0,-0.5,54,28,6),[],-1.6,"dark",1);
    for (const z of [-14,14]) {
      cyl(9.35,4.8,"metal",2.75,-0.8,z,"x");
      cyl(8.05,0.7,"dark",5.25,-0.8,z,"x");
      add(mesh(new THREE.CircleGeometry(7.35,40),"grill"),5.65,-0.8,z).rotation.y=PI/2;
      ring(8.2,0.65,"metal",5.45,-0.8,z,"x");
    }
    for(const z of [-23,23]) for(const y of [-13,12]) hex(1.45,y,z,"x",-1);
    uEye=add(new THREE.Object3D(),5.7,-0.8,0);
  });
  tag("초음파 센서",[130,127,35],[109,98,14]);

  // 안쪽 고관절 축과 바깥 베어링은 동축이다. 허벅지는 이 둘 사이에서 돌고,
  // 허벅지에 눕힌 무릎 서보는 은색 혼과 강철 푸시로드로 검은 아랫다리를 당긴다.
  const feet = [], legs = [], sweeps = [], LEG_RANGE = [-30,45];
  const rodLength = 55, hornRadius = 13;
  const slab = (a,b,w,m,z=0) => {
    const dx=b[0]-a[0], dy=b[1]-a[1];
    const o=box(Math.hypot(dx,dy),1.5,w,m,(a[0]+b[0])/2,(a[1]+b[1])/2,z);
    o.rotation.z=Math.atan2(dy,dx); return o;
  };
  // 허벅지 옆판은 고관절(0, 0) 동심 원호(R 11)에서 폭 22 mm 팔로 내려와 무릎 간격으로 좁아진다.
  const thighSweep = (s, edge, material) => {
    const sections = [];
    for (let i = 0; i <= 8; i++) {
      const a = i * PI / 16;
      sections.push([-60 - 5.5 * Math.cos(a), -5.5 * Math.sin(a), 5.5 * Math.sin(a), 5]);
    }
    sections.push([-44, -8.5, 8.5, 5], [-38, -11, 11, 10.5], [0, -11, 11, 10.5]);
    for (let i = 1; i <= 8; i++) {
      const a = i * PI / 16;
      sections.push([11 * Math.sin(a), -11 * Math.cos(a), 11 * Math.cos(a), 10.5]);
    }
    const vertices = [], indices = [];
    for (let side = 0; side < 4; side++) {
      const start = vertices.length / 3;
      for (const [x, lo, hi, offset] of sections) {
        const z = s * (46 + edge * offset);
        const corners = [[lo, z - 0.95], [hi, z - 0.95], [hi, z + 0.95], [lo, z + 0.95]];
        for (const corner of [side, (side + 1) % 4]) vertices.push(x, ...corners[corner]);
      }
      for (let i = 0; i < sections.length - 1; i++) {
        const a = start + 2 * i; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices); geo.computeVertexNormals(); add(mesh(geo, material));
  };
  const thighKnee = (s, edge, material) => {
    const sections = [];
    for (let i = 0; i <= 8; i++) {
      const a = i * PI / 16;
      sections.push([-60 - 5.5 * Math.cos(a), -5.5 * Math.sin(a), 5.5 * Math.sin(a), 5]);
    }
    sections.push([-45, -8.5, 8.5, 5], [-38, -11, 11, 10.5]);
    const vertices = [], indices = [];
    for (let side = 0; side < 4; side++) {
      const start = vertices.length / 3;
      for (const [x, lo, hi, offset] of sections) {
        const z = s * (46 + edge * offset);
        const corners = [[lo, z - 0.95], [hi, z - 0.95], [hi, z + 0.95], [lo, z + 0.95]];
        for (const corner of [side, (side + 1) % 4]) vertices.push(x, ...corners[corner]);
      }
      for (let i = 0; i < sections.length - 1; i++) {
        const a = start + 2 * i; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices); geo.computeVertexNormals(); add(mesh(geo, material));
  };
  for (const [hx, hy] of HIPS) for (const s of [-1, 1]) {
    grp(hx, hy, 0, () => {
      // 어깨 ㄷ자 브래킷: 고관절 축 기준 안쪽으로 ~25° 기울어진 비스듬한 윗판과 베어링 원판.
      const d = hx > 0 ? -1 : 1;
      const cheek = new THREE.Shape();
      cheek.absarc(0, 0, 9.2, PI, 0, false);
      if (d < 0) { cheek.lineTo(-1.5, 18.5); cheek.lineTo(-17.5, 25.5); }
      else { cheek.lineTo(17.5, 25.5); cheek.lineTo(1.5, 18.5); }
      cheek.closePath();
      side(cheek, [H.c(0, 0, 4.3)], s * 60.5, "body", 1.5);
      grp(d * 9.5, 22.0, s * 45.6, g => {
        g.rotation.z = Math.atan2(d * 7.0, 16.0);
        flat(rr(0, 0, 17.5, 30, 1.5), [H.r(0, 0, 10, 20, 1.2)], 0, "body", 1.5);
      });
      side(poly(d < 0 ? [[-17.5, 25.5], [-1.5, 18.5], [6.5, 5], [-9.5, 5]] : [[1.5, 18.5], [17.5, 25.5], [9.5, 5], [-6.5, 5]]), [], s * 30.8, "body", 1.5);
      cyl(5.1, 1.4, "metal", 0, 0, s * 61.7, "z");
      ring(4.25, 0.35, "white", 0, 0, s * 62.3);
      cyl(4.0, 0.8, "dark", 0, 0, s * 62.2, "z");
      hex(d * 2, 10, s * 31.9, "z", s);
      for (const a of LEG_RANGE) sweeps.push(grp(0, 0, 0, g => {
        g.rotation.z = rad(45 + a); thighSweep(s, -1, "sweep"); thighSweep(s, 1, "sweep");
      }));
    });
    let shin, horn, link;
    const thigh = grp(hx, hy, 0, g => {
      g.rotation.z = rad(45);
      const cheekShape = new THREE.Shape();
      cheekShape.absarc(0, 0, 10.6, -PI / 2, PI / 2, false);
      cheekShape.lineTo(-40, 10.6); cheekShape.lineTo(-40, -10.6); cheekShape.closePath();
      for (const edge of [-1, 1]) {
        side(cheekShape, [H.c(-31, 0, 2.8)], s * (46 + edge * 10.5), "body", 1.1);
        thighKnee(s, edge, "body");
      }
      box(1.5, 14, 21, "body", 9.8, 0, s * 46);
      cyl(8.2, 2.7, "metal", 0, 0, s * 32.2, "z");
      cyl(7.7, 0.8, "body", 0, 0, s * 34.65, "z");
      for (const [x, y] of [[0, 4.6], [4, -2.3], [-4, -2.3]]) hex(x, y, s * 35.4, "z", s);
      for (const [edge, dirZ] of [[-1, -s], [1, s]]) hex(-26, -1.5, s * (46 + edge * 11.45), "z", dirZ);
      // 무릎 서보 장착판(Y 9.5) 바깥면에 서보(출력축 끝 Y 17.5)가 고정되어 귀와 몸체가 판 밖으로 드러난다.
      flat(rr(-10.5, 0, 36, 20.5, 1.5), [H.r(-10.75, 0, 23.6, 12.6, 1)], 9.5, "body", 1.5).position.z = s * 46;
      servoSeat(-5, 17.5, s * 46, V(0, 1, 0), V(-1, 0, 0));
      for (const x of [-24.6, 3.2]) for (const z of [-3.7, 3.7]) hex(x, 12.1, s * 46 + z, "y");
      for (const [i, m] of ["w3", "w2", "w1"].entries())
        cable([[-20, -9, s * (45 + i)], [-11, -10, s * (40 + i)], [0, -8, s * (34 + i)], [2, -3, s * (29 + i)]], 0.65, m);
      shin = grp(-60, 0, s * 46, () => {
        const shinSide = () => poly([[-14, 3.5], [-12, 5], [1, 6], [9, 4.5], [33, 3.1], [39, 2.5], [39, -2.4], [16, -3.4], [4, -5.8], [-9, -5], [-14, -3]]);
        for (const edge of [-1, 1]) side(shinSide(), [H.c(-12, 0, 1.6)], edge * 2.6, "dark", 2.2);
        cyl(2.8, 7.5, "metal", -12, 0, 0, "z"); cyl(2.25, 12.5, "metal", 0, 0, 0, "z");
        cyl(3.2, 1.4, "metal", 0, 0, s * 6.4, "z");
        cyl(2.2, 0.8, "metal", -12, 0, s * 4.2, "z");
        // 고무 발은 앞코가 둥글고 목 쪽이 가늘어진 일체형 캡이다.
        const profile = [[0, 34], [4.1, 34], [4.8, 36], [5.1, 44], [6.2, 51], [6.6, 55], [5.7, 58], [3.8, 60], [0, 61]];
        const toe = new THREE.LatheGeometry(profile.map(([r, x]) => new THREE.Vector2(r, x)), 28);
        toe.rotateZ(-PI / 2); toe.scale(1, 1, 0.91); toe.translate(-55, 0, 0);
        feet.push(add(mesh(toe, "rubber"), 55, 0, 0));
      });
      horn = grp(-5, 18.7, s * 46, () => {
        flat(rr(6, 0, 19, 6.3, 3.1), [H.c(6, 0, 0.95), H.c(9, 0, 0.9)], 0, "metal", 1.7);
        cyl(3.4, 2.5, "metal", 0, -1.4, 0); hex(0, 1.45, 0, "y");
      });
      // 푸시로드 좌표계는 두 볼 중심을 잇는 선을 +Y로 쓴다.
      link = grp(0, 0, 0, () => {
        for (const [lo, hi, r, m] of [[0, 8, 2, "dark"], [8, rodLength - 8, 0.95, "metal"], [rodLength - 8, rodLength, 2, "dark"]])
          cyl(r, hi - lo, m, 0, (lo + hi) / 2, 0);
        for (const y of [0, rodLength]) { ball(3.1, "dark", 0, y, 0); cyl(1.8, 6.1, "metal", 0, y, 0, "z"); }
      });
    });
    legs.push({ thigh, pose(folded, angle) {
      // 엎드린 자세: 허벅지를 뒤로 눕히고 아랫다리를 50° 세워 배가 바닥에서 약 3.5 cm 뜬다 (실물 사진)
      const pitch = folded ? 0 : 45, shinAngle = rad((folded ? -50 : -43) - pitch);
      thigh.rotation.z = rad(pitch + angle); shin.rotation.z = shinAngle;
      const end = V(-60 - 12 * Math.cos(shinAngle), -12 * Math.sin(shinAngle), s * 51.5);
      const d = end.clone().sub(horn.position);
      const cosine = (d.lengthSq() + hornRadius ** 2 - rodLength ** 2) / (2 * hornRadius * Math.hypot(d.x, d.z));
      const azimuth = Math.atan2(s * d.z, d.x) - Math.acos(THREE.MathUtils.clamp(cosine, -1, 1));
      horn.rotation.y = -s * azimuth;
      const start = horn.position.clone().add(V(hornRadius * Math.cos(azimuth), 0, s * hornRadius * Math.sin(azimuth)));
      console.assert(Math.abs(start.distanceTo(end) - rodLength) < 0.01, "무릎 푸시로드 길이 확인");
      link.position.copy(start); link.quaternion.setFromUnitVectors(V(0, 1, 0), end.sub(start).normalize());
    }});
  }
  legs.forEach(leg => leg.pose(false, 0));

  const project = add(new THREE.Group());
  P = project;

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

  // ===== 등뼈 덮개 위: LED · 배터리 데크 = 3D 출력 2개. ① 배터리 칸(바닥판 + 네 벽)을 LED가 쓰던 M3 구멍 4곳에 볼트로 고정, ② LED 받침판을 벽 위 보스에 M3 나사 4개로 덮어 배터리를 위에서 누른다 =====
  // 가장 무거운 배터리를 몸 중심(엉덩이 축 가운데 X 11.7) 바로 위, 가장 낮은 자리에 둔다. 긴 쪽이 좌우라 앞뒤로는 머리 브래킷 · Pi와 겹치지 않는다
  // 출력: ① 바닥판을 베드에 두고 벽이 위로, ② 받침판을 베드에 두고 MP3 턱이 위로 → 둘 다 서포트 없음. 배터리 위 1 mm는 EVA 폼 테이프로 채워 흔들리지 않게 한다
  // shortcut: 배터리 크기는 후보(UGREEN 미니 5000 mAh 79 × 38 × 26 mm)의 제조사 값, 산 제품을 재면 BAT만 바꾼다. 폭(X)이 40 mm를 넘으면 앞벽이 머리 브래킷 걸쇠 쪽으로 나간다
  const BAT = [79, 26, 38], DX = 9, FT = 128.5;                // 배터리 길이(Z) · 두께(Y) · 폭(X), 배터리 가운데 X, 배터리 받침면 (등뼈 덮개 위 3.1 mm)
  const ROOFB = FT + BAT[1] + 1, TOPY = ROOFB + 3;              // LED 받침판 아랫면 (배터리 위 폼 1 mm), 윗면 = LED 스탠드오프 자리
  const WT = 3, WX = BAT[2] / 2 + 0.5 + WT / 2, WZ = BAT[0] / 2 + 0.5 + WT / 2; // 벽 두께, 앞뒤 벽 · 양 끝 벽 가운데 (배터리와 0.5 mm 틈)
  const XR = -25.4, XF = DX + WX + WT / 2, ZW = WZ + WT / 2;  // 판 뒤 끝 (M3 구멍 X -22를 품고 Pi 캐리어 앞 끝 -25.6과 띄움) · 앞 끝 · 칸 바깥 Z
  const LID = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [DX + sx * WX, sz * 30])); // 받침판 나사 보스 4곳 (앞뒤 벽 위)
  const deck = part(grp(0, 0, 0, () => {
    const fy = (125.4 + FT) / 2, ft = FT - 125.4, x0 = DX - WX - WT / 2;
    flat(rr((x0 + XF) / 2, 0, XF - x0, 2 * ZW, 3), [-8, 8].map((z) => H.c(24, z, 1.7)), fy, "print", ft);               // 바닥판 (배터리 칸)
    flat(rr((XR + x0 + 2) / 2, 0, x0 + 2 - XR, 50, 3), [-8, 8].map((z) => H.c(-22, z, 1.7)), fy, "print", ft);         // 바닥판 뒤 혀 (뒤쪽 볼트 2개)
    for (const x of [-22, 24]) for (const z of [-8, 8]) { cyl(2.75, 1.6, "dark", x, FT - 1, z); cyl(1.5, 8, "metal", x, FT - 5, z); } // M3 볼트 4개 (LED 스탠드오프가 쓰던 구멍)
    const h = ROOFB - FT, y = (FT + ROOFB) / 2;
    for (const sx of [1, -1]) box(WT, h, 2 * ZW, "print", DX + sx * WX, y, 0);                                        // 앞 · 뒤 벽
    box(2 * WX - WT, h, WT, "print", DX, y, -WZ);                                                                     // 왼쪽 끝 벽
    for (const [a, b] of [[DX - WX + WT / 2, -8], [20, DX + WX - WT / 2]]) box(b - a, h, WT, "print", (a + b) / 2, y, WZ); // 오른쪽 끝 벽 (USB-C 두 단자 앞은 창: 꽂은 채 충전)
    for (const [x, z] of LID) { box(7, h, 7, "print", x, y, z); cyl(1.5, 10, "metal", x, ROOFB - 3, z); }              // 나사 보스 + M3 × 10 나사 (받침판 → 보스)
    flat(rr((XR + XF) / 2, 0, XF - XR, 66, 3), LID.map(([x, z]) => H.c(x, z, 1.7)), ROOFB + 1.5, "print", 3);       // LED 받침판 (따로 출력)
    for (const [x, z] of LID) cyl(2.75, 2, "dark", x, TOPY + 1, z);                                                   // 받침판 나사 머리
    tag("LED · 배터리 데크 (3D 출력 2개, M3 4점 + 4점)", [70, 196, 78], [DX, TOPY - 1.5, 24], true);
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
  // ===== LED 받침판 앞 끝: Hiwonder MP3 모듈(V1.1)을 세워 스피커가 앞(작업자 쪽)을 보게 한다. 거치 턱은 받침판과 한 덩어리로 출력 =====
  // 실물 사진 기준: 보드 48 × 24 × 1.6, 앞면에 스피커 Ø22 × 7 (microSD 끝에서 18 mm), Ø4.8 구멍 2개(4핀 끝에서 13.5 mm, 간격 16 mm),
  // 뒷면 한쪽 끝에 4핀 소켓(판과 나란히 꽂음, SCL · SDA · GND · 5V), 다른 끝에 microSD 슬롯(카드가 2 mm 나옴). 4핀 끝이 왼쪽(포트 2 쪽), microSD 끝이 오른쪽
  const mp3 = part(grp(XF, TOPY, 0, () => { // 원점 = 받침판 윗면 앞 끝
    const MY = 14, HZ = -24 + 13.5;                                                                                   // 모듈 가운데 높이, 구멍 Z
    box(WT, 28, 50, "print", -WT / 2, 14, 0);                                                                         // 세운 거치 턱
    for (const s of [1, -1]) side(poly([[-WT, 0], [-12, 0], [-WT, 12]]), [], s * 23.5, "print", 3);                  // 뒤 삼각 보강
    for (const dy of [-8, 8]) {
      cyl(3, 6, "print", 3, MY + dy, HZ, "x");                                                                       // 스페이서 6 mm (뒷면 소켓 · 칩 높이 5 mm를 띄움)
      cyl(1.5, 16, "metal", 2.6, MY + dy, HZ, "x"); cyl(3.2, 0.45, "metal", 7.85, MY + dy, HZ, "x"); cyl(2.75, 2, "dark", 9.1, MY + dy, HZ, "x"); // M3 × 16 + 평와셔(Ø4.8 구멍을 잡음)
      box(2.4, 5.5, 5.5, "metal", -WT - 1.2, MY + dy, HZ);                                                           // 턱 뒤 너트
    }
    box(1.6, 24, 48, "dark", 6.8, MY, 0);                                                                             // 검정 PCB 48 × 24
    for (const dy of [-8, 8]) ring(2.5, 0.5, "gold", 7.65, MY + dy, HZ, "x");                                        // 금도금 구멍 테두리
    cyl(11, 7, "dark", 11.1, MY, 6, "x");                                                                             // 스피커 Ø22 × 7
    const holes = [[0, 0], ...[0, 1, 2, 3, 4, 5].map((i) => [3.6 * Math.cos(i * PI / 3), 3.6 * Math.sin(i * PI / 3)]), ...[0, 1, 2, 3, 4, 5].map((i) => [7 * Math.cos(i * PI / 3 + PI / 6), 7 * Math.sin(i * PI / 3 + PI / 6)])];
    holes.forEach(([a, b]) => cyl(0.8, 0.3, "pin", 14.65, MY + a, 6 + b, "x"));                                      // 스피커 망 구멍 13개
    box(5, 12.5, 6.5, "white", 3.5, MY, -20.75); box(4, 10.5, 1, "dark", 3.5, MY, -23.6);                             // 뒷면 4핀 소켓 (왼쪽 끝을 향해 열림)
    box(1.8, 14, 14, "metal", 5.1, MY, 15); box(0.8, 11, 4, "dark", 5.5, MY, 25);                                     // 뒷면 microSD 슬롯 + 튀어나온 카드
    box(1.2, 8, 6, "dark", 5.4, MY, 2);                                                                               // 뒷면 YX5200 칩
    tag("스피커 (MP3 모듈 · 포트 2)", [44, 40, 60], [12, 14, 10]);
  }), [30, 10, 0]);

  // Pi 5 GPIO 핀 n의 자리 (Pi 로컬): 핀 1·2는 USB 반대쪽 끝(x 34.13), 홀수는 안쪽 줄 · 짝수는 가장자리 줄 (공식 기구 도면)
  const gpio = (n, y = 0) => [34.13 - Math.floor((n - 1) / 2) * 2.54, y, n % 2 ? 23.23 : 25.77];
  const IR_GPIO = [1, 9, 5, 3];  // 온도 센서 VIN · GND · SCL · SDA → 1번 3.3V · 9번 GND · 5번 SCL(GPIO3) · 3번 SDA(GPIO2)
  // ===== 뒤 윗판 위: 라즈베리 파이 5를 가로로 눕힌 캐리어. Pi 5 + 액티브 쿨러가 뒤 윗판(X -81.5 ~ -25.5) 안에 들어와 꼬리로 나가지 않는다 =====
  // Pi는 긴 쪽이 좌우: GPIO가 뒤(꼬리 끝), USB-C 전원 · HDMI가 앞(배터리 쪽), USB · 이더넷이 왼쪽, microSD · 전원 버튼이 오른쪽
  const PIP = { x: -53.5, y: 132.6, z: 10 }, TRAY = [-81.1, -25.6, -26, 54], TY = 124.6; // Pi PCB 아랫면 가운데, 트레이 X · Z 범위, 트레이 아랫면 (등뼈 덮개 윗면 124보다 위)
  const POSTS = [[-78.5, -22], [-78.5, 22], [-50, -18], [-50, 18]];                   // 뒤 윗판 실물 구멍: 뒤 모서리 M3 2곳 · 레고 구멍 2곳
  const PI_HOLES = [-24.5, 24.5].flatMap((dz) => [-19, 39].map((dx) => [PIP.x - dz, PIP.z + dx])); // Pi 고정 구멍 58 × 49 (로컬 → 로봇 좌표)
  const piMount = part(grp(0, 0, 0, () => {
    flat(rr((TRAY[0] + TRAY[1]) / 2, (TRAY[2] + TRAY[3]) / 2, TRAY[1] - TRAY[0], TRAY[3] - TRAY[2], 4),
      [...POSTS.map(([x, z]) => H.c(x, z, 1.7)), ...PI_HOLES.map(([x, z]) => H.c(x, z, 1.35))], TY + 1.5, "print", 3); // 트레이 3 mm (M3 · M2.5 관통 구멍)
    for (const [x, z] of POSTS) {
      box(6, TY - 112.4, 8, "print", x, (TY + 112.4) / 2, z);                                                       // 기둥 (뒤 윗판 위 → 트레이)
      cyl(2.75, 2, "dark", x, TY + 4.6, z); cyl(1.5, 16, "metal", x, TY - 4, z); box(5.5, 2.4, 5.5, "metal", x, 109.2, z); // M3 × 16 볼트 · 아래 너트
    }
    for (const s of [1, -1]) box(28.5, 4, 3, "print", -64.25, TY - 2, s * 20);                                      // 기둥을 잇는 앞뒤 보
    for (const x of [-78.5, -50, -29]) box(3, 4, TRAY[3] - TRAY[2] - 4, "print", x, TY - 2, (TRAY[2] + TRAY[3]) / 2); // 트레이 아래 가로 리브 (오른쪽으로 넓어진 부분을 받침)
    box(TRAY[1] - TRAY[0] - 6, 4, 3, "print", (TRAY[0] + TRAY[1]) / 2, TY - 2, 47);                                    // 오른쪽 끝 세로 리브
    for (const [x, z] of PI_HOLES) { cyl(2.5, PIP.y - TY - 3, "gold", x, (PIP.y + TY + 3) / 2, z); cyl(1.3, PIP.y - TY + 2, "metal", x, (PIP.y + TY) / 2, z); } // M2.5 × 5 황동 스탠드오프 · 아래에서 M2.5 나사
    tag("Pi 5 가로 캐리어 (3D 출력, M3 볼트 4개)", [-60, 112, 92], [-40, TY + 1.5, 50], true);
  }), [0, 18, 0]);
  const rpi = part(grp(PIP.x, PIP.y, PIP.z, (g) => { // 원점 = Pi 5 PCB 아랫면 중심. 로컬 축은 Pi 기준(+X microSD · -X USB · +Z GPIO · -Z USB-C), 묶음을 Y로 -90° 돌려 GPIO가 뒤를 본다
    g.rotation.y = -PI / 2;
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
    for (const n of IR_GPIO) box(2.5, 14, 2.5, "dark", ...gpio(n, 11.1));                                            // GPIO 핀에 꽂은 듀폰 암 하우징 (높이 14 mm)
    for (const z of [-1, 15.5]) { box(12, 4.6, 12.4, "metal", -45.5, 13, z); box(16, 8, 15, "cooler", -59.5, 13, z); cyl(2.2, 6, "dark", -70.5, 13, z, "x"); } // USB 위 칸에 꽂은 USB-A 플러그 2개: USB 3.0 = XIAO, USB 2.0 = MechDog 보드
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
    const mod = box(17.5, 43, 59, k("dark"), 11.75, -24, 0);
    mod.visible = false; // 시야·간섭 판정에 쓰는 외형 치수
    const caseProfile = poly([[-29.5,-40],[-25,-45.5],[25,-45.5],[29.5,-40],[29.5,-8],[24,-2.5],[-24,-2.5],[-29.5,-8]]);
    face(caseProfile,[],11.75,k("dark"),16.6);                                                       // 본체 케이스 59 × 43 × 17.5
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
  // ===== LED 데크 아래층: Pi 5 전용 보조배터리를 눕혀(긴 쪽이 좌우) 네 벽 칸에 넣고, 받침판이 폼 패드를 눌러 위에서 잡는다 =====
  const pBank = part(grp(DX, FT + BAT[1] / 2, 0, () => {                                                               // 원점 = 배터리 가운데. 단자는 오른쪽(+Z) 짧은 끝 (Pi USB-C와 같은 쪽)
    const [L, T, W] = BAT, e = L / 2;
    box(W, T, L, "dark", 0, 0, 0);
    box(W - 6, T + 0.2, 30, "cooler", 0, 0, -L / 5);                                                                  // 윗면 라벨
    box(9, 3.2, 1.6, "metal", -10, 0, e + 0.4); box(9, 3.2, 1.6, "metal", 3, 0, e + 0.4);                             // USB-C 2
    box(8.4, 2.6, 3.2, "metal", -10, 0, e + 1.8); box(11, 6, 9, "cooler", -10, 0, e + 7.8); cyl(2, 4, "dark", -10, 0, e + 14, "z"); // C to C 아래쪽 플러그 (Pi 전원)
    box(W - 6, 1, L - 12, "rubber", 0, T / 2 + 0.5, 0);                                                              // 윗면 EVA 폼 1 mm (받침판이 누름)
    tag("Pi 5 전용 보조배터리 (몸 가운데 · 네 벽 + 받침판으로 고정)", [-30, 40, -100], [-6, 6, -L / 2]);
  }), [0, 0, -90]);
  const tubeMesh = (m) => add(mesh(new THREE.BufferGeometry(), m));
  const cables = [0, 1, 2, 3].map(() => tubeMesh("dark")), coax = tubeMesh("dark");
  const irWires = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // 온도 센서 VIN · GND · SCL · SDA → 듀폰 암-암 점퍼
  const ledWires = [0, 1, 2, 3].map(() => tubeMesh("dark")); // LED 매트릭스 → 포트 3
  const piWire = tubeMesh("dark"); // Pi 5 USB-C to USB-C 전원 케이블
  const usbWire = tubeMesh("dark"); // XIAO USB-C ↔ Pi 5 USB-A 케이블 (전원 · 데이터)
  const dogWire = tubeMesh("dark"); // MechDog 보드 USB ↔ Pi 5 USB-A 케이블 (USB 시리얼 명령 · 보드 프로그램 올리기)
  const mp3Wires = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // MP3 모듈 → 포트 2 (5264 양쪽 하네스)
  // shortcut: 보드 USB 단자 자리는 사양서 사진(ESP32 코어 보드 뒤 끝)에서 읽은 추정값, 실물에서 자리 · 단자 모양을 확인하면 DOG_USB만 바꾼다
  const DOG_USB = [-28, 118.5, 6];
  box(6, 3, 8, "metal", DOG_USB[0] - 2, DOG_USB[1], DOG_USB[2]); box(14, 7, 11, "cooler", DOG_USB[0] - 12, DOG_USB[1], DOG_USB[2]); cyl(2, 5, "dark", DOG_USB[0] - 21.5, DOG_USB[1], DOG_USB[2], "x"); // 보드 USB에 꽂은 플러그
  const tube = (o, pts, r = 0.7) => { o.geometry.dispose(); o.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, r, 6); };
  tag("I2C 포트 1 (비전) · 2 (MP3) · 3 (LED)", [-30, 60, -84], [8, 106, -37], false, () => camera.position.z < 40); // 왼쪽에서 볼 때만
  tag("USB-C to A (XIAO ↔ Pi 5)", [-20, 200, -96], [-10, 158, -47]);
  tag("USB (MechDog 보드 ↔ Pi 5 · 보드 단자 자리 추정)", [-120, 96, -96], [-64, 121, -32]);
  tag("듀폰 점퍼 → Pi GPIO (뒤 끝)", [-60, 196, 70], [-30, 160, 34]);
  const wire = () => {
    robot.updateMatrixWorld(true);
    const on = (g) => (x, y, z) => robot.worldToLocal(g.localToWorld(V(x, y, z)));
    const cam = on(bCam), xi = on(xiao), bk = on(brk), ir = on(irMod), le = on(led), rp = on(rpi), pb = on(pBank), mp = on(mp3);
    tube(piWire, [pb(-10, 0, BAT[0] / 2 + 16), pb(-10, 0, BAT[0] / 2 + 22), V(-4, 138, 64), V(-10, 135, 56), rp(31.3, 3.3, -48), rp(31.3, 3.3, -40.5)], 1.05); // 보조배터리 오른쪽 끝 USB-C → 한 번 감아 → Pi 5 USB-C (오른쪽 앞, 남는 길이는 묶음)
    ledWires.forEach((c, i) => {
      const dx = (i - 1.5) * 1.4, lx = 5.0 + i * 2.0;
      tube(c, [le(lx, 6.4, 0), le(lx, 4.4, -2.5), le(lx, 4.2, -14.0), V(4 + dx, 161.5, -30), V(2 + dx, 160, -38), V(0 + dx, 152, -47), V(-3 + dx, 138, -48), V(-6 + dx, 124, -46), V(PORTS[2] + dx, 112, -42), V(PORTS[2] + dx, 109.0, -41.5), V(PORTS[2] + dx, 108.5, -38.2)], 0.55);
    }); // LED 아래 4핀 소켓 → 받침판 위 → 배터리 왼쪽 끝 바깥으로 내려와 → 포트 3
    cables.forEach((c, i) => {
      const dx = (i - 1.5) * 1.5;
      tube(c, [cam(12 + dx * 0.5, -9, 32.5), cam(12 + dx * 0.8, -32, 33.8), cam(8 + dx * 0.8, -50.5, 30.8), cam(2 + dx * 0.6, -51.5, 14), V(44 + dx, 68, -2), V(28 + dx, 76, -24), V(24 + dx, 80, -33), V(22 + dx, 96, -41), V(PORTS[0] + dx, 108.5, -41.5), V(PORTS[0] + dx, 108.5, -38.2)]);
    });                                                                                                               // 비전 모듈 → 배 아래 → 왼쪽 I2C 포트 1
    mp3Wires.forEach((c, i) => {
      const dz = (i - 1.5) * 1.4, dx = (i - 1.5) * 1.4;
      tube(c, [mp(3.5, 14 + dz * 2, -24), mp(3.5, 14 + dz * 2, -30), V(35 + dx * 0.3, 160, -40), V(35, 148, -46 + dz * 0.5), V(34, 132, -40 + dz * 0.5), V(26, 124, -38), V(14 + dx, 115, -41), V(PORTS[1] + dx, 109.5, -42), V(PORTS[1] + dx, 108.5, -38.2)], 0.55);
    }); // MP3 뒷면 4핀 소켓(왼쪽 끝) → 배터리 칸 앞 왼쪽 모서리 밖으로 내려와 → 왼쪽 I2C 포트 2
    tube(coax, [xi(3.2, -8.75, 4.73), xi(3.2, -11.6, 4.7), bk(72.1, 124, 4.5), bk(66, 125.5, 3.5), bk(52.5, 130.5, 2), bk(54.5, 136.5, 0.8), bk(62, 140.5, 0)], 0.55); // U.FL → 뒷벽 구멍(+4.5) → 선반 뒤턱 밖을 돌아 안테나 위로
    tube(usbWire, [xi(2.85, 37.5, 0), xi(2.85, 41, 0), V(70, 175, -5), V(57, 165, -14), V(45, 157, -30), V(0, 160, -46), V(-30, 152, -52), V(-48, 148, -74),
      rp(-80, 13, -1), rp(-73.5, 13, -1)], 1.6);                                                                      // XIAO 위 USB-C → 안테나 선반 위 → 배터리 왼쪽 끝 위 → Pi 왼쪽 USB 3.0 위 칸
    tube(dogWire, [V(DOG_USB[0] - 24, DOG_USB[1], DOG_USB[2]), V(DOG_USB[0] - 30, 119, 4), V(-62, 117.5, -24), V(-66, 121, -34), V(-74, 134, -60),
      rp(-80, 13, 15.5), rp(-73.5, 13, 15.5)], 1.6);                                                                  // 보드 USB → 캐리어 트레이 아래 → 왼쪽으로 나와 → Pi 왼쪽 USB 2.0 위 칸
    irWires.forEach((c, i) => {
      const dz = IR_PINS[i], n = IR_GPIO[i];
      tube(c, [ir(-2.0, 35.3, dz), ir(-2.0, 38.5, dz), V(68, 166, 18 + dz), V(50, 165, 36 + dz * 0.5), V(20, 163, 37 + dz * 0.5), V(-20, 163, 38 + dz * 0.5),
        V(-50, 160, 40 + dz * 0.5), rp(...gpio(n, 25)), rp(...gpio(n, 18.1))], 0.5);
    }); // GY-906 ㄱ자 핀헤더 듀폰 하우징 → 안테나 선반 위 → 배터리 · 받침판 오른쪽 위 → Pi 1 · 9 · 5 · 3번 (뒤 끝 오른쪽)
  };
  P = robot;
  // 사진 속 비전 모듈은 앞쪽 가로 경첩에서 배 아래로 접혀 렌즈가 바닥을 본다.
  const stockCamera = grp(100,74,0,()=>{
    flat(rr(-21,0,44,59,2), [
      ...[-31,-12].flatMap(x=>[-12,0,12].map(z=>H.c(x,z,2.5))),
      H.r(-21,0,5,18)],0,"body",1.4);
    for (const s of [-1,1]) {
      side(poly([[-43,1],[1,1],[0,22],[-5,23],[-12,10],[-30,10],[-36,22],[-41,21]]),
        [H.p([[-37,5],[-32,6],[-37,15]])],s*29.8,"body",1.35);
      for (const x of [-38,-3]) hex(x,19,s*30.9,"z",s);
    }
    cyl(1.6,52,"metal",0,-0.6,0,"z");
    for(const z of [-20,-5,10]) cyl(2.15,11,"dark",0,-0.6,z,"z");
    grp(0,-0.6,0,g=>{g.rotation.z=-PI/2;camModule();});
    for(let i=0;i<4;i++){
      cable([[-9-i, -12, 32],[-10-i,-11,35],[-19-i,-7,36],[-33-i,-2,32],[-47-i,1,22],
        [-58-i,3,1],[-69-i,3,-19],[-76-i,5,-32],[-79+i,15,-35],[-78+(i-1.5)*1.6,34.5,-38]],0.66,"dark");
    }
  });
  tag("본체", [-68,70,50], [-68,95,29]);

  // 발이 바닥에 닿게 내린다 (다리 각도를 바꿀 때마다 다시)
  const ground = () => {
    robot.position.y = 0; robot.updateMatrixWorld(true);
    robot.position.y = -Math.min(...feet.map((f) => new THREE.Box3().setFromObject(f, true).min.y));
    robot.updateMatrixWorld(true);
  };
  ground();
  sweeps.forEach((g) => g.traverse((o) => (o.castShadow = o.receiveShadow = false)));
  const FRONT_FEET = feet.filter((f) => f.getWorldPosition(V()).x > 0);

  // ---- 바닥: 초록 라인 5 cm, 체크포인트 블록 5 × 20 cm ----
  P = scene;
  const plane = (w, d, m, x, y) => { const o = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), M[m]), x, y, 0); o.rotation.x = -PI / 2; o.receiveShadow = true; return o; };
  const course = grp(0,0,0,()=>{ plane(820, 460, "floor", 110, 0); plane(820, 50, "line", 110, 0.3); plane(50, 200, "cpY", 180, 0.6); plane(50, 200, "cpB", 420, 0.6); });
  const studio = grp(0,0,0,()=>{
    const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.ShadowMaterial({opacity:0.09})));
    floor.rotation.x=-PI/2; floor.receiveShadow=true;
    const c=document.createElement("canvas"); c.width=c.height=128;
    const ctx=c.getContext("2d"), shade=ctx.createRadialGradient(64,64,0,64,64,64);
    shade.addColorStop(0,"rgba(56,45,25,0.19)"); shade.addColorStop(0.6,"rgba(56,45,25,0.10)"); shade.addColorStop(1,"rgba(56,45,25,0)");
    ctx.fillStyle=shade; ctx.fillRect(0,0,128,128);
    const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});
    const contact=add(new THREE.Mesh(new THREE.PlaneGeometry(280,168),mat),0,0.15,0);
    contact.rotation.x=-PI/2;
  });

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
  let clash = false; // 마지막 measure()에서 허벅지가 장착 부품과 겹쳤는지
  function measure() { // 조립된 상태에서 바닥 시야 범위, 앞발, 초음파 간섭을 잰다
    place(0); scene.updateMatrixWorld(true); aim(fovF);
    const p = fovF.pos, cm = (x) => Math.round((x - BODY_X) / 10), xs = [1, 2, 3, 4].map((i) => p.getX(i));
    const floorAll = [1, 2, 3, 4].every((i) => p.getY(i) < 1), bo = bEye.getWorldPosition(V()), bd = V(1, 0, 0).transformDirection(bEye.matrixWorld);
    const ray = (v) => { const d = V(1, v * VF, 0).transformDirection(bEye.matrixWorld); return d.y < 0 ? cm(bo.x - d.x * bo.y / d.y) : "수평 위"; }; // v: 화면 세로 위치 (-1 아래 ~ 1 위)
    const span = `${cm(Math.min(...xs))}~${floorAll ? cm(Math.max(...xs)) : "수평 위"}`, low = new THREE.Box3().setFromObject(bBox).min.y / 10;
    const hit = [bBox, xBoard, xCam, xLens, ant, irBoard].some((b) => corners(b).some(inBeam)), footInView = FRONT_FEET.some((f) => sees(bEye, f.getWorldPosition(V())));
    const io = irEye.getWorldPosition(V()), pitch = Math.asin(V(1, 0, 0).transformDirection(irEye.matrixWorld).y);
    const irAt = (a) => Math.max(0, Math.round((io.y + 250 * Math.tan(pitch + a)) / 10)), irSeen = [...corners(irBoard), io].some((q) => sees(fEye, q));
    const boxes = (o, precise = false) => { const r = []; o.traverseVisible(m => { if (m.isMesh) r.push(new THREE.Box3().setFromObject(m, precise)); }); return r; };
    const near = [pBank, piMount, rpi, deck, mp3].flatMap((o) => boxes(o));
    clash = legs.some(({thigh}) => boxes(thigh, true).some((a) => near.some((b) => a.intersectsBox(b)))); // 허벅지 묶음 부품(돌아간 꼭짓점 그대로)과 배터리 · 캐리어 · Pi 부품을 하나씩 비교
    $("v3dRead").innerHTML = `바닥 카메라(몸 중심에서): 보임 <b>${span} cm</b>, 라인 처리(화면 위 2/3) <b>${ray(-1 / 3)}~${ray(1)} cm</b>, 가운데 <b>${ray(0)} cm</b> · 모듈 아래 끝 바닥에서 <b>${low.toFixed(1)} cm</b> · 앞발 <b>${footInView ? "화면 안" : "화면 밖"}</b> · 초음파 빔과 <b>${hit ? "겹침" : "겹치지 않음"}</b> · 온도 센서: 25 cm 앞 높이 <b>${irAt(-IR_FOV / 2)}~${irAt(IR_FOV / 2)} cm</b>, 머리 카메라 화면에 <b>${irSeen ? "보임" : "안 보임"}</b> · 다리 ${legA}°에서 배터리 · Pi 칸과 <b>${clash ? "겹침" : "겹치지 않음"}</b>`;
    place(k);
    return !hit;
  }
  const setAngle = (a) => { bCam.rotation.z = -rad(a); $("v3dAngleOut").textContent = a + "°"; return measure(); };
  const setLeg = (a) => { legA = a; legs.forEach(leg => leg.pose(false, a)); ground(); $("v3dLegOut").textContent = a + "°"; return measure(); }; // 네 허벅지를 같이 돌리고 발을 다시 바닥에

  // ---- 화면 ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const cv = renderer.domElement;
  cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "MechDog 장착 구성 3D 모델");
  stage.prepend(cv);
  scene.add(new THREE.HemisphereLight(0xfff5e4, 0xd4d2ca, 0.8));
  const sun = new THREE.DirectionalLight(0xfff4df, 1.65);
  sun.position.set(180, 410, 245); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -300, right: 300, top: 300, bottom: -300, near: 50, far: 1500 });
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.22;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-180, 100, -300);
  scene.add(fill);
  const bounce = new THREE.DirectionalLight(0xffefd7, 1);
  bounce.position.set(20,-200,35); scene.add(bounce);
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000), controls = new OrbitControls(camera, cv);
  const TARGET = V(0, 80, 0), VIEW = { all: [235, 178, 247], side: [0, 0, 410], front: [380, 0, 0], top: [0, 410, 0.01], rear: [-380, 0, 0], bottom: [0, -410, 0.01] };
  controls.enableDamping = true; controls.minDistance = 150; controls.maxDistance = 2500;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN };
  controls.autoRotate = false; controls.autoRotateSpeed = 0.8;
  controls.enableZoom = false; // 문서를 스크롤할 때 휠을 가로채지 않게, 누른 뒤에만 확대
  cv.addEventListener("mousedown", (e) => { if (e.button === 1) e.preventDefault(); }); // 가운데 버튼 클릭 시 브라우저 자동 스크롤 방지
  cv.addEventListener("pointerdown", () => { controls.enableZoom = true; controls.autoRotate = false; });
  cv.addEventListener("pointerleave", () => (controls.enableZoom = false));
  const fit = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const setView = (name) => { camera.position.copy(TARGET).addScaledVector(V(...VIEW[name]), (project.visible ? 1.43 : 1) * Math.max(1, (project.visible ? 1.5 : 1.17) / camera.aspect)); controls.target.copy(TARGET); controls.update(); };
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
    sockets.forEach((o,i) => o.visible = mounted || i === 0);
    root.querySelectorAll(".v3d-angle, #v3dToggles, .v3d-legend i").forEach(o => {
      (o.tagName === "I" ? o.parentElement : o).hidden = !mounted;
    });
    $("v3dModels").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed",String(b.dataset.mode === mode)));
    if (mounted) setLeg(+$("v3dLeg").value);
    else {
      legs.forEach(leg => leg.pose(folded,0)); ground();
      $("v3dRead").textContent = folded ? "실물 사진의 엎드린 자세. 허벅지를 뒤로 눕히고 아랫다리로 몸을 받치며, 머리 아래 비전 모듈은 바닥을 본다." : "사양서의 기립 자세. 은색 혼과 푸시로드가 무릎 서보의 회전을 아랫다리로 전달한다.";
    }
    apply(); TARGET.y = mounted ? 93 : folded ? 42 : 53; setView("all");
  };
  $("v3dModels").addEventListener("click", e => { const b=e.target.closest("button[data-mode]"); if(b) setModel(b.dataset.mode); });
  theme(); fit();
  console.assert(setAngle(DOWN), "기본 각도에서 바닥 카메라가 초음파 빔 안에 있음");
  console.assert([-30, 45].every((a) => (setLeg(a), !clash)), "다리 각도 끝(-30° · 45°)에서 허벅지가 배터리 · Pi · 스피커 칸과 겹침");
  setLeg(0);
  const tail = Math.min(...[pBank, piMount, rpi, deck, mp3, led].map((o) => new THREE.Box3().setFromObject(o).min.x));
  console.assert(tail >= -81.6, "장착 부품이 꼬리 끝(X -81.5)보다 뒤로 나감", tail);
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
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import("three/addons/loaders/GLTFLoader.js"), import("three/addons/libs/meshopt_decoder.module.js")]);
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [sv, xi, pi] = await Promise.allSettled(["mechdog-servo-hps0618sg.glb", "xiao-esp32s3-sense.glb", "raspberry-pi-5.glb"].map((f) => loader.loadAsync(new URL("./" + f, V3D_BASE).href)));
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
  msg.remove();
} catch (e) {
  msg.textContent = "3D 뷰어를 불러오지 못했다. 인터넷 연결과 WebGL 지원을 확인한다.";
  console.error(e);
}
})();
