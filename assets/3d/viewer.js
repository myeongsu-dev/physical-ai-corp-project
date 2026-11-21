/* 장착 구성 3D 뷰어 (5절). 단위 mm, +X 앞 · +Y 위 · +Z 로봇 오른쪽.
   형상은 07_corp-project/cad(build123d)가 만든 mechdog.glb, 치수 · 기준점 · 이름표는 mechdog.json에서 읽는다. 치수를 바꿀 때는 cad/mechdog/dims.py를 고치고 다시 빌드한다.
   서보 · XIAO · Pi 5는 공식 STEP을 GLB로 바꾼 파일을 불러와 간략 모델과 바꾼다 (못 읽으면 간략 모델 유지) */
// 모듈이 아닌 보통 스크립트로 싣고, three.js만 import()로 CDN에서 받는다. GLB · JSON을 읽으므로 웹 서버로 연다
const V3D_BASE = document.currentScript.src; // GLB 경로 기준 (이 스크립트 주소)
const asset = (f) => new URL("./" + f, V3D_BASE).href;
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
      <tr><td>Hiwonder 비전 모듈 (ESP32-S3 + GC2145)</td><td>59 × 43 × 17.5 mm</td><td>기존 브래킷째 턱 아래에 단다. 3D 모델에서 광축을 수평 기준 35° 내리면 몸 중심에서 약 14~30 cm 앞 바닥이 라인 처리 화면에 들어온다. 라인 모드는 160 × 140이고 화면 위 2/3를 처리한다.</td><td>보유 (머리 위에서 옮김)</td></tr>
      <tr><td>삼각 트러스 브래킷</td><td>판 약 54 × 64 mm (22.8° 경사), 앞뒤 체결 귀 4개</td><td>얼굴판 아래에 비전 모듈 경첩을 둔다. 앞쪽 체결 귀는 양쪽 머리 옆판의 위 나사 구멍에 맞춘다.</td><td>보유</td></tr>
      <tr><td>바닥 각도 어댑터</td><td>약 42 × 30 × 74 mm</td><td>머리 아랫판, 레고 핀 4개, 15° 단위 구멍</td><td>3D 출력 (각도가 안 맞을 때만 · 모델에는 없음)</td></tr>
      <tr><td>XIAO ESP32-S3 Sense (OV3660)</td><td>본체 21 × 17.8 mm + Sense 확장 보드, 렌즈까지 두께 14 mm (Seeed 3D 모델)</td><td>머리 브래킷에 세워 꽂음. 렌즈는 앞, USB-C는 위. USB-C to A 케이블을 안테나 선반 위로 넘겨 배터리 왼쪽 끝 위를 지나 Pi 5 왼쪽 USB 3.0 위 칸에 꽂아 전원과 영상을 함께 보낸다 (경로 약 25 cm, 케이블 30 cm 이상)</td><td>보유</td></tr>
      <tr><td>비접촉 온도 센서 GY-906 (MLX90614ESF-BCC)</td><td>보드 17 × 11 mm, 캔 Ø10.2 × 8.1 mm, 측정 시야 35° (Melexis 데이터시트 Figure 42 · Table 19)</td><td>머리 브래킷 오른쪽 홀더에 세워 꽂음. XIAO 렌즈와 같은 쪽을 보고 10° 숙인다. 캔 앞면이 XIAO 렌즈보다 뒤라 머리 카메라 화면에 들어오지 않는다. 윗변에 ㄱ자 핀헤더를 뒤에서 끼워 핀이 위로 서게 한다 (일자 핀을 뒤로 빼면 안테나 선반에 닿음). 듀폰 암-암 점퍼를 안테나 선반 위 → 배터리 · 받침판 오른쪽 위로 지나 Pi 5 GPIO(뒤 끝 오른쪽)에 연결: VIN → 1번(3.3V), SDA → 3번(GPIO2), SCL → 5번(GPIO3), GND → 9번 (경로 약 18 cm, 20 cm 점퍼. 모자라면 수-암 점퍼를 이어 늘린다)</td><td>구매 (4개) · 받은 모듈이 17 × 11 mm 보드인지 확인 (다르면 홀더 수정)</td></tr>
      <tr><td>2.4 GHz 플렉스 안테나</td><td>약 40 × 20 mm</td><td>머리 브래킷 뒤쪽 13 mm 상단 선반 포켓에 수납 (금속 윗판에서 13 mm 띄움)</td><td>보유</td></tr>
      <tr><td>머리 브래킷</td><td>발판 49 × 46 × 3.2 mm · 앞 12 mm 플랜지 · 높이 25 mm (외벽 2.8~3.0 mm)</td><td>머리 윗판 뒤 엣지(X 42, Z ±15.5)를 폭 12 mm · 두께 3 mm+ 챔퍼 U자 걸쇠로 잡고 앞 M3 구멍 2곳(X 96, Z ±17)을 Ø3.4 mm 구멍이 뚫린 플랜지로 볼트 고정. XIAO · GY-906 포켓 모두 앞·뒤 기둥이 이어진 닫힌 문형 레일(중간 배선 창 개방) + 보강 거셋·상단 스냅으로 파손을 막고, 안테나 선반은 전고 트러스 거셋과 하부 리브로 발판까지 직접 받침</td><td>3D 출력 · <a href="${asset("print/head_bracket.3mf")}" download>3MF</a> · <a href="${asset("print/head_bracket.stl")}" download>STL</a></td></tr>
      <tr><td>라즈베리 파이 5 + 쿨러</td><td>PCB 85 × 56 × 1.6 mm (고정 구멍 58 × 49 mm), 액티브 쿨러 포함 높이 약 15 mm (공식 규격)</td><td>뒤 윗판 위에 긴 쪽을 좌우로 눕혀(X -81.5~-25.5, Z -32.5~52.5) 꼬리 끝 밖으로 나가지 않는다. GPIO는 뒤 끝, USB-C 전원 · HDMI는 앞(배터리 쪽), USB · 이더넷은 왼쪽, microSD · 전원 버튼은 오른쪽이라 microSD를 캐리어에서 빼지 않고 바꿀 수 있다. 바닥에서 약 132 mm 높이로, 앞 끝이 데크 바닥판 위로 살짝 들어간다</td><td>개인 보유 (교부 1 + 김건주 동아리 3 · 사용 승인 확인)</td></tr>
      <tr><td>Pi 5 가로 캐리어</td><td>트레이 56 × 80 × 3 mm · 기둥 6 × 8 × 12.8 mm 4개 · 아래 리브 4줄 · M2.5 × 5 황동 스탠드오프 4개</td><td>뒤 윗판의 실물 구멍에 기둥을 대고 M3 × 20 볼트 4개와 아래 너트로 조인다. 구멍은 탑뷰 교차 측정 기준으로 뒤 나사 자리 X -71.8, Z ±16.2와 앞 원형 구멍 X -43.0, Z ±14.0에 있다. 트레이는 등뼈 덮개 위 124.6~127.6 mm 높이에서 오른쪽으로 넓어지며 아래 리브가 넓어진 부분을 받친다(앞쪽 가로 리브 X -37로 등 덮개 뒤 플레어 날개와 1 mm 이격). Pi 5는 아래에서 M2.5 나사로 황동 스탠드오프에 조인다. 출력할 때는 트레이 윗면을 베드에 두고 기둥과 리브가 위를 향하게 놓는다.</td><td>3D 출력 · <a href="${asset("print/pi_carrier.3mf")}" download>3MF</a> · <a href="${asset("print/pi_carrier.stl")}" download>STL</a></td></tr>
      <tr><td>LED · 배터리 데크 (출력 2개)</td><td>① 배터리 칸: 바닥판 45 × 86 × 4.2 mm와 앞뒤 체결부, 벽 두께 3 mm · 높이 27 mm, 나사 보스 7 × 7 mm 4개 ② LED 받침판: 57 × 66 × 3 mm + MP3 거치 턱</td><td>① 배터리 칸을 등 덮개 확장 구멍 4곳(M4 탭 리브넛)에 고정한다. 구멍 위치는 LEGO 8 mm 표준 피치(공식 렌더 L005 · L007 · 탑뷰 V01-0000 교차 검증)로 X -18.0, +30.0(간격 48.0 mm)과 Z ±8.0(간격 16.0 mm)이다. 네 벽이 배터리를 둘러싸고, 오른쪽 끝 벽은 USB-C 두 단자 앞이 창이라 배터리를 꽂은 채 빈 단자로 충전한다. ② LED 받침판을 벽 위 보스 4곳에 M3 × 10 나사로 덮으면 배터리 윗면 EVA 폼(1 mm)을 눌러 흔들리지 않는다. 배터리를 뺄 때만 나사 4개를 푼다. 받침판은 뒤로 13 mm 나가 LED 뒤 스탠드오프를 받고, 그 아래로 Pi 앞 끝이 들어온다. 출력: ①은 바닥판, ②는 받침판을 베드에 두고 벽 · 턱이 위로 (둘 다 서포트 없음)</td><td>3D 출력 · 배터리 칸 <a href="${asset("print/battery_bay.3mf")}" download>3MF</a> · <a href="${asset("print/battery_bay.stl")}" download>STL</a>, 받침판 <a href="${asset("print/led_plate.3mf")}" download>3MF</a> · <a href="${asset("print/led_plate.stl")}" download>STL</a></td></tr>
      <tr><td>Pi 5 전용 보조배터리</td><td>후보 UGREEN 미니 5000 mAh 2포트: 79 × 38 × 26 mm, 112 g, USB-C 5V 3A, 18 Wh (제조사 값). 4대 모두 같은 제품. 산 제품을 재면 3D 모델의 <code>BAT</code> 값만 바꾼다</td><td>배터리 칸에 긴 쪽을 좌우로 눕혀 몸 중심(엉덩이 축 가운데) 바로 위, 장착 부품 중 가장 낮은 자리에 둔다. 좌우로 ±40 mm라 몸 폭(±63 mm) 안에 들어온다. 네 벽과 위 받침판이 잡아 따로 묶지 않는다. 단자 쪽(오른쪽 끝)에서 USB-C to C 케이블을 한 번 감아 Pi 5 USB-C(오른쪽 앞)에 꽂고, 남은 USB-C로 꽂은 채 충전한다 (충전하면서 Pi에 전원이 나가는지는 실물 확인)</td><td>구매 예정 (4개 같은 제품) · 실측 필요</td></tr>
      <tr><td>LED 도트 매트릭스 (Hiwonder 8×16, TM1640)</td><td>보드 약 54 × 23 mm, 8×8 매트릭스 2개(각 20 × 20 mm), 4모서리 Ø4.8 mm 구멍 약 46 × 16 mm (실물 사진 대조)</td><td>LED · 배터리 데크 위층 받침판(바닥에서 약 159 mm)에 보드의 긴 쪽을 앞뒤로 놓는다. 보드 구멍에 맞춘 M3 12 mm 스탠드오프 4곳(X -22, +24와 Z ±8)에 나사와 평와셔로 고정한다. 아래 12 mm 공간으로 4핀 커넥터를 꽂아 배터리 왼쪽 끝 바깥으로 내려 포트 3(IO32 · IO33)에 잇는다.</td><td>보유</td></tr>
      <tr><td>I2C 케이블 (Molex 5264 호환 4P 양쪽 20 cm)</td><td>핀 간격 2.5 mm (포트 실측) · Hiwonder 센서 포트 규격 5264-4AW</td><td>비전 모듈 → 포트 1 (코드에서는 <code>IIC(2)</code>): 경로 약 19 cm로 여유가 1 cm 남짓이라 배 아래에 바짝 붙여 묶는다. MP3 → 포트 2: 데크 앞벽 왼쪽 아래로 경로 약 16 cm. LED → 포트 3: 경로 약 15 cm</td><td>구매 (I2C용 10개 + UART용으로 산 4개를 MP3에 씀)</td></tr>
      <tr><td>MP3 모듈 (Hiwonder V1.1, 스피커 내장)</td><td>보드 48 × 24 × 1.6 mm, 앞면 스피커 Ø22 × 7 mm, Ø4.8 구멍 2개(간격 16 mm), 뒷면 4핀 소켓(SCL · SDA · GND · 5V) · microSD 슬롯 · YX5200 칩 (실물 사진), I2C 0x7B</td><td>LED 받침판 앞 끝의 세운 거치 턱에 6 mm 스페이서를 끼우고 M3 × 16 + 평와셔 2세트로 단다. 스피커는 앞(작업자 쪽)을 보고, 4핀 소켓 끝이 왼쪽(포트 2 쪽), microSD 끝이 오른쪽이라 카드를 뺄 수 있다. 머리 카메라 · 온도 센서보다 뒤 · 위라 시야를 가리지 않는다. Pi는 USB 명령으로 재생 번호만 보낸다</td><td>보유</td></tr>
      <tr><td>USB 케이블 (MechDog 보드 ↔ Pi 5)</td><td>보드 쪽 단자 모양은 실물 확인 (보드 USB 칩 CH34x), Pi 쪽 USB-A</td><td>보드 USB(사양서 사진상 ESP32 코어 보드 뒤 끝, 추정)에서 캐리어 트레이 아래로 빠져 왼쪽으로 나온 뒤 Pi 왼쪽 USB 2.0 위 칸에 꽂는다. 명령 · 상태를 주고받고, Pi가 보드 프로그램을 올릴 때도 같은 선을 쓴다</td><td>보유 확인</td></tr>
      <tr><td>나사 · 스탠드오프 · 폼 · USB 케이블</td><td>M3 12 mm 스탠드오프 4개 + M3 나사·평와셔 4세트(LED), M3 × 8 볼트 2개(머리 브래킷), M4 볼트 4개 · M4 열압입 인서트 2개(배터리 칸), M3 × 10 나사 4개(받침판), M3 × 20 볼트 · 너트 4개(Pi 캐리어), M2.5 × 5 황동 스탠드오프 · M2.5 나사 4개(Pi 5), M3 × 16 · 평와셔 · 너트 2세트(MP3), EVA 폼 테이프 1 mm, 짧은 USB-C to USB-C 전원 케이블, USB-C to A 케이블(XIAO)</td><td>LED 매트릭스는 M3 평와셔로 Ø4.8 mm 구멍을 잡아 스탠드오프로 고정. Pi 5 전원은 배터리 칸의 보조배터리와 USB-C to USB-C 케이블로 직결. 남는 케이블은 데크 · 캐리어 가장자리에 케이블타이로 묶는다</td><td>구매 · 보유</td></tr>
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
  const { BAT, PORTS, IR_PINS, CAM_PINS, DOG_USB } = D;
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
  const mp3Wires = ["w2", "dark", "w1", "w3"].map((m) => tubeMesh(m)); // MP3 모듈 → 포트 2
  P = stockCamera;
  const stockWires = CAM_PINS.map(() => tubeMesh("dark"));
  P = robot;
  const tube = (o, pts, r = 0.7) => { o.geometry.dispose(); o.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, r, 6); };
  const cameraLeads = (leads, g) => leads.forEach((o, i) => {
    const cam = (x, y, z) => robot.worldToLocal(g.localToWorld(V(x, y, z)));
    const dx = (i - 1.5) * 1.5, y = CAM_PINS[i];
    tube(o, [cam(12, y, 32.8), cam(10.5, y, 36), cam(8 + dx * 0.6, -43, 34.5),
      cam(4 + dx * 0.6, -50, 21), V(48 + dx, 72, 2), V(28 + dx, 76, -24), V(24 + dx, 80, -33),
      V(22 + dx, 96, -41), V(PORTS[0] + dx, 106.2, -41.5), V(PORTS[0] + dx, 106.2, -38.2)], 0.63);
  }); // 오른쪽 플러그에서 배 아래를 돌아 왼쪽 포트 1로
  const wire = () => {
    robot.updateMatrixWorld(true);
    const on = (g) => (x, y, z) => robot.worldToLocal(g.localToWorld(V(x, y, z)));
    const xi = on(xiao), bk = on(brk), ir = on(irMod), le = on(led), rp = on(rpi), pb = on(pBank), mp = on(mp3);
    tube(piWire, [pb(-10, 0, BAT[0] / 2 + 16), pb(-10, 0, BAT[0] / 2 + 22), V(-4, 138, 64), V(-10, 135, 56), rp(31.3, 3.3, -48), rp(31.3, 3.3, -40.5)], 1.05); // 보조배터리 USB-C → 한 번 감아 → Pi 5 USB-C
    ledWires.forEach((c, i) => {
      const dx = (i - 1.5) * 1.4, lx = 5.0 + i * 2.0;
      tube(c, [le(lx, 6.4, 0), le(lx, 4.4, -2.5), le(lx, 4.2, -14.0), V(4 + dx, 161.5, -30), V(2 + dx, 160, -38), V(0 + dx, 152, -47), V(-3 + dx, 138, -48), V(-6 + dx, 124, -46), V(PORTS[2] + dx, 112, -42), V(PORTS[2] + dx, 107, -41.5), V(PORTS[2] + dx, 106.2, -38.2)], 0.55);
    }); // LED 아래 4핀 소켓 → 받침판 위 → 배터리 왼쪽 끝 바깥으로 내려와 → 포트 3
    cameraLeads(cables, bCam);
    mp3Wires.forEach((c, i) => {
      const dz = (i - 1.5) * 1.4, dx = (i - 1.5) * 1.4;
      tube(c, [mp(3.5, 14 + dz * 2, -24), mp(3.5, 14 + dz * 2, -30), V(35 + dx * 0.3, 160, -40), V(35, 148, -46 + dz * 0.5), V(34, 132, -40 + dz * 0.5), V(26, 124, -38), V(14 + dx, 115, -41), V(PORTS[1] + dx, 107, -42), V(PORTS[1] + dx, 106.2, -38.2)], 0.55);
    }); // MP3 뒷면 4핀 소켓 → 배터리 칸 앞 왼쪽 모서리 밖으로 → 포트 2
    tube(coax, [xi(3.2, -8.75, 4.73), xi(3.2, -11.6, 4.7), bk(72.1, 124, 4.5), bk(66, 125.5, 3.5), bk(52.5, 130.5, 2), bk(54.5, 136.5, 0.8), bk(62, 140.5, 0)], 0.55); // U.FL → 뒷벽 구멍 → 안테나 위로
    tube(usbWire, [xi(2.85, 37.5, 0), xi(2.85, 41, 0), V(70, 175, -5), V(57, 165, -14), V(45, 157, -30), V(0, 160, -46), V(-30, 152, -52), V(-48, 148, -74),
      rp(-80, 13, -1), rp(-73.5, 13, -1)], 1.6); // XIAO 위 USB-C → 안테나 선반 위 → 배터리 왼쪽 끝 위 → Pi 왼쪽 USB 3.0 위 칸
    tube(dogWire, [V(DOG_USB[0] - 24, DOG_USB[1], DOG_USB[2]), V(DOG_USB[0] - 30, 119, 4), V(-62, 117.5, -24), V(-66, 121, -34), V(-74, 134, -60),
      rp(-80, 13, 15.5), rp(-73.5, 13, 15.5)], 1.6); // 보드 USB → 캐리어 트레이 아래 → Pi 왼쪽 USB 2.0 위 칸
    irWires.forEach((c, i) => {
      const dz = IR_PINS[i], n = IR_GPIO[i];
      tube(c, [ir(-2.0, 35.3, dz), ir(-2.0, 38.5, dz), V(68, 166, 18 + dz), V(50, 165, 36 + dz * 0.5), V(20, 163, 37 + dz * 0.5), V(-20, 163, 38 + dz * 0.5),
        V(-50, 160, 40 + dz * 0.5), rp(...gpio(n, 25)), rp(...gpio(n, 18.1))], 0.5);
    }); // GY-906 핀헤더 → 안테나 선반 위 → 배터리 · 받침판 오른쪽 위 → Pi 1 · 9 · 5 · 3번
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
    wire();
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
    $("v3dRead").innerHTML = `바닥 카메라(몸 중심에서): 보임 <b>${range(-1)}</b>, 라인 처리(화면 위 2/3) <b>${range(-1 / 3)}</b>, 가운데 <b>${ray(0)} cm</b> · 모듈 아래 끝 바닥에서 <b>${low.toFixed(1)} cm</b> · 앞발 <b>${footInView ? "화면 안" : "화면 밖"}</b> · 앞발과 턱 장착부 <b>${footGap ? footGap.toFixed(1) + " mm" : "겹침 가능"}</b> · 초음파 빔과 <b>${hit ? "겹침" : "겹치지 않음"}</b> · 온도 센서: 25 cm 앞 높이 <b>${irAt(-D.IR_FOV / 2)}~${irAt(D.IR_FOV / 2)} cm</b>, 머리 카메라 화면에 <b>${irSeen ? "보임" : "안 보임"}</b> · 다리 ${legA}°에서 배터리 · Pi 칸과 <b>${clash ? "겹침" : "겹치지 않음"}</b>`;
    place(k);
    return !hit;
  }
  const setAngle = (a) => { bCam.rotation.z = -rad(a); $("v3dAngleOut").textContent = a + "°"; return measure(); };
  const setLeg = (a) => { legA = a; legs.forEach(leg => leg.pose(false, a)); ground(); $("v3dLegOut").textContent = a + "°"; return measure(); }; // 네 허벅지를 같이 돌리고 발을 다시 바닥에

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
    headScrews.visible = rearScrews.visible = !mounted;
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
      legs.forEach(leg => leg.pose(folded, 0)); ground(folded);
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
