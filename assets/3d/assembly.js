/* MechDog 출력물 4종 · 나사 단계별 분해/조립 3D 위젯 (mechdog.glb 직접 로드) */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const rootEl = document.querySelector('[data-widget="a3d"]');
if (rootEl) {
  const glbUrl = new URL("mechdog.glb", import.meta.url).href;

  rootEl.innerHTML = `
    <div class="a3d">
      <div class="a3d-stage">
        <p class="a3d-msg">조립 3D 모델을 불러오는 중…</p>
        <div class="a3d-tip"></div>
        <div class="a3d-hud">
          <button type="button" data-act="play">조립 재생</button>
          <button type="button" data-act="apart">분해</button>
          <input type="range" min="0" max="1000" value="0" aria-label="분해에서 조립까지">
          <span class="a3d-now"></span>
        </div>
      </div>
      <div class="a3d-side">
        <h3>조립 순서 (단계를 누르면 이동)</h3>
        <ol class="a3d-steps"></ol>
        <h3>색 구분</h3>
        <div class="a3d-key"></div>
        <label class="a3d-opt"><input type="checkbox" checked> 로봇 본체를 흐리게 표시</label>
      </div>
    </div>
  `;

  const stage = rootEl.querySelector(".a3d-stage");
  const msgEl = rootEl.querySelector(".a3d-msg");
  const tipEl = rootEl.querySelector(".a3d-tip");
  const playBtn = rootEl.querySelector('[data-act="play"]');
  const apartBtn = rootEl.querySelector('[data-act="apart"]');
  const rangeEl = rootEl.querySelector('input[type="range"]');
  const nowEl = rootEl.querySelector(".a3d-now");
  const stepsEl = rootEl.querySelector(".a3d-steps");
  const keyEl = rootEl.querySelector(".a3d-key");
  const ghostChk = rootEl.querySelector('input[type="checkbox"]');

  const C = {
    bay: { color: 0xe8a33d, label: "배터리 칸 (출력물)" },
    plate: { color: 0x2fb3a3, label: "LED · 스피커 받침 (출력물)" },
    lid: { color: 0x8f7ad6, label: "Pi 뚜껑 (출력물)" },
    brk: { color: 0xc9cf3a, label: "머리 센서 받침 (출력물)" },
    bought: { color: 0x2f7bf6, label: "M4 × 10 접시머리 렌치볼트 (구매)" },
    buy: { color: 0xe0413a, label: "M2 × 8 십자 둥근머리 (구매)" },
    kitMetal: { color: 0xb9bec7, label: "키트 M4 나사 · 너트 (은색)" },
    kitNylon: { color: 0x2a2c31, label: "키트 M4 나일론 기둥 (검정)" },
    module: { color: 0x3f8f4a, label: "LED · MP3 모듈" },
  };

  const INFO = {
    boltBay: ["bought", "M4 × 10 접시머리 렌치볼트", "배터리 칸 바닥 → 등판 M4 리브넛 (육각렌치 2.5)"],
    boltTab: ["bought", "M4 × 10 접시머리 렌치볼트", "LED 받침 → 배터리 칸 앞 탭 → 아래 M4 너트"],
    nutTab: ["kitMetal", "M4 육각 너트 (키트)", "배터리 칸 앞 탭 아랫면 육각 홈에 끼움"],
    pillarLed: ["kitNylon", "M4 나일론 기둥 · 양쪽 암나사 15 mm (키트)", "LED 받침 ↔ LED 보드"],
    boltLedBot: ["kitMetal", "M4 × 6 십자 둥근머리 (키트)", "LED 받침 아래에서 나일론 기둥으로 체결"],
    boltLedTop: ["kitMetal", "M4 × 6 십자 둥근머리 (키트)", "LED 보드 위에서 나일론 기둥으로 체결"],
    pillarMp3: ["kitNylon", "M4 나일론 기둥 · 한쪽 수나사 10+6 mm (키트)", "LED 받침 세로 탭 → 뒤에서 M4 너트"],
    nutMp3: ["kitMetal", "M4 육각 너트 (키트)", "세로 탭 뒤에서 기둥 수나사를 고정"],
    boltMp3: ["kitMetal", "M4 × 6 십자 둥근머리 (키트)", "MP3 기판 → 나일론 기둥"],
    boltHead: ["buy", "M2 × 8 십자 둥근머리", "머리 센서 받침 → 머리 윗판 아래 플랜지 암나사 (순정 M2×6 교체)"],
    bay: ["bay", "배터리 칸 (battery_bay)", "등판 M4 4곳 체결 · STPB-MB100 수납"],
    plate: ["plate", "LED · 스피커 받침 (led_plate)", "배터리 칸 앞 탭 위에 체결"],
    lid: ["lid", "Pi 뚜껑 (pi_carrier)", "배터리 칸 위에 얹고 벨크로 2줄로 Pi와 함께 묶음"],
    brk: ["brk", "머리 센서 받침 (head_bracket)", "머리 윗판 앞 나사 2곳 · XIAO · GY-906 위에서 삽입"],
    led: ["module", "LED 도트 매트릭스 (8×16)", "15 mm 나일론 기둥 4개 위"],
    mp3: ["module", "MP3 음성 모듈", "세로 탭 앞 10 mm 나일론 기둥 2개"],
  };
  const kind = (name) => Object.keys(INFO).sort((a, b) => b.length - a.length).find((k) => name.startsWith(k));

  const STEPS = [
    {
      title: "배터리 칸 → 등판",
      text: "칸 안쪽에서 M4 × 10 접시머리 4개로 등판 리브넛에 조인다.",
      move: { bay: [0, 70, 0], boltBay: [0, 120, 0] },
    },
    {
      title: "LED 보드 → LED 받침",
      text: "받침 아래에서 M4 × 6 4개로 나일론 기둥(15 mm) 4개를 세우고, LED 보드를 올려 위에서 M4 × 6 4개로 조인다.",
      move: { pillarLed: [0, 30, 0], boltLedBot: [0, -30, 0], led: [0, 70, 0], boltLedTop: [0, 105, 0] },
      sub: "plate",
    },
    {
      title: "MP3 → 받침 세로 탭",
      text: "세로 탭 앞에서 수나사 기둥 2개를 끼우고 뒤에서 M4 너트로 잡는다. MP3 기판을 M4 × 6 2개로 기둥에 조인다.",
      move: { pillarMp3: [30, 0, 0], nutMp3: [-30, 0, 0], mp3: [60, 0, 0], boltMp3: [90, 0, 0] },
      sub: "plate",
    },
    {
      title: "LED 받침 → 배터리 칸 앞 탭",
      text: "칸 앞 탭 아랫면 홈에 M4 너트 2개를 눌러 끼우고, 받침을 얹어 위에서 M4 × 10 접시머리 2개로 조인다.",
      move: { nutTab: [0, -40, 0], plate: [60, 90, 0], boltTab: [60, 140, 0] },
    },
    {
      title: "Pi 뚜껑 → 배터리 칸 위",
      text: "테두리가 칸 벽 바깥을 감싸게 얹는다. 나사 없이 10 mm 벨크로 두 줄로 Pi와 함께 묶는다.",
      move: { lid: [0, 110, 0] },
    },
    {
      title: "머리 센서 받침 → 머리 윗판",
      text: "앞 순정 M2 나사 2개를 빼고 M2 × 8 2개로 조인다(너트 없음). XIAO와 GY-906(센서 캔 아래 · ㄱ자 핀헤더 위)을 위에서 끼운다.",
      move: { brk: [40, 60, 0], boltHead: [40, 110, 0] },
    },
  ];

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f5f7);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 1, 5000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(200, 400, 300);
  scene.add(sun);

  function resize() {
    const w = stage.clientWidth || 640;
    const h = stage.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    glbUrl,
    (gltf) => {
      msgEl.style.display = "none";
      const root = gltf.scene;
      scene.add(root);
      root.updateMatrixWorld(true);

      const byName = {};
      root.traverse((o) => {
        if (o.name) byName[o.name] = o;
      });

      // 배터리 칸 · LED 받침은 한 메시(deck__print)에 합쳐져 있어 둘로 나눈다
      let deckMesh;
      byName["deck__print"].traverse((o) => {
        if (o.isMesh && !deckMesh) deckMesh = o;
      });
      const g = deckMesh.geometry;
      const idx = g.index.array;
      const pos = g.attributes.position;
      const FT = 122.8 + 0.7 + 0.05 + 4.0;
      const WALL_X = 39.75;
      const out = { bay: [], plate: [] };
      const A = new THREE.Vector3();
      const B = new THREE.Vector3();
      const D = new THREE.Vector3();
      const P = (i, v) => v.fromBufferAttribute(pos, i).applyMatrix4(deckMesh.matrixWorld);
      for (let i = 0; i < idx.length; i += 3) {
        P(idx[i], A);
        P(idx[i + 1], B);
        P(idx[i + 2], D);
        const cx = (A.x + B.x + D.x) / 3;
        const cy = (A.y + B.y + D.y) / 3;
        const ny = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(D, A)).y;
        const isPlate = cx > WALL_X && (cy > FT + 0.05 || (cy > FT - 0.3 && ny < 0));
        (isPlate ? out.plate : out.bay).push(idx[i], idx[i + 1], idx[i + 2]);
      }
      const makePart = (arr, name) => {
        const geo = new THREE.BufferGeometry();
        for (const k in g.attributes) geo.setAttribute(k, g.attributes[k]);
        geo.setIndex(arr);
        const m = new THREE.Mesh(geo, deckMesh.material);
        m.name = name;
        deckMesh.parent.add(m);
        m.position.copy(deckMesh.position);
        m.quaternion.copy(deckMesh.quaternion);
        m.scale.copy(deckMesh.scale);
        return m;
      };
      byName.bay = makePart(out.bay, "bay");
      byName.plate = makePart(out.plate, "plate");
      deckMesh.parent.remove(deckMesh);

      byName.lid = byName["piMount__print"];
      byName.lid.name = "lid";

      root.updateMatrixWorld(true);
      const nodes = {};
      for (const s of STEPS) {
        for (const key of Object.keys(s.move)) {
          nodes[key] = Object.values(byName).filter(
            (o) => o.name === key || (o.name.startsWith(key) && /^(L|R|FL|FR|RL|RR)$/.test(o.name.slice(key.length)))
          );
          if (key === "brk") nodes[key] = [byName["brk"]];
        }
      }
      const moving = new Set(Object.values(nodes).flat());
      for (const o of moving) {
        scene.attach(o);
        o.userData.home = o.position.clone();
      }

      const glass = new THREE.MeshStandardMaterial({
        color: 0x9aa3b2,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const hideRoots = ["xiao", "irMod", "rpi", "pBank", "bCam", "chinMount", "piMount", "kneeCable_0", "kneeCable_1", "kneeCable_2", "kneeCable_3"];
      for (const n of hideRoots) if (byName[n] && !moving.has(byName[n])) byName[n].visible = false;
      const ghosts = [];
      root.traverse((o) => {
        if (o.isMesh) {
          o.material = glass;
          ghosts.push(o);
        }
      });

      const mats = {};
      const getMat = (k) =>
        (mats[k] ??= new THREE.MeshStandardMaterial({
          color: C[k].color,
          metalness: /kit|bought|buy/.test(k) && k !== "kitNylon" ? 0.55 : 0.05,
          roughness: k === "kitNylon" ? 0.6 : 0.42,
        }));
      for (const o of moving) {
        const k = kind(o.name);
        if (!k) continue;
        const cat = INFO[k][0];
        o.traverse((m) => {
          if (!m.isMesh) return;
          if (m.parent?.name?.endsWith("__cavity")) {
            m.material = new THREE.MeshStandardMaterial({ color: 0x111111 });
            return;
          }
          if (cat === "module") return;
          m.material = getMat(cat);
        });
        o.traverse((m) => {
          m.userData.info = k;
        });
      }

      const box = new THREE.Box3();
      for (const o of moving) box.expandByObject(o);
      const ctr = box.getCenter(new THREE.Vector3());
      controls.target.copy(ctr).add(new THREE.Vector3(0, 50, 0));
      camera.position.copy(ctr).add(new THREE.Vector3(310, 310, 400));
      resize();

      const N = STEPS.length;
      let t = N;
      let target = N;
      let playing = false;
      const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
      const offsetOf = (key, k) => new THREE.Vector3(...STEPS[k].move[key]).multiplyScalar(1 - ease(t - k));
      const subOf = {};
      STEPS.forEach((s, k) => {
        for (const key in s.move) subOf[key] = { k, sub: s.sub };
      });
      const stepOf = (key) => STEPS.findIndex((s) => key in s.move);

      function apply() {
        for (const key in nodes) {
          const { k, sub } = subOf[key];
          const off = offsetOf(key, k);
          if (sub) off.add(offsetOf(sub, stepOf(sub)));
          for (const o of nodes[key]) o.position.copy(o.userData.home).add(off);
        }
        rangeEl.value = Math.round((t / N) * 1000);
        const cur = Math.min(N - 1, Math.floor(t));
        stepsEl.querySelectorAll("li").forEach((li, i) => {
          li.classList.toggle("done", t >= i + 1 - 1e-3);
          li.classList.toggle("cur", i === cur && t < N);
        });
        nowEl.textContent = t >= N - 1e-3 ? "조립 완료" : t <= 0 ? "모두 분해" : `${cur + 1}단계 · ${STEPS[cur].title}`;
      }

      STEPS.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<b>${s.title}</b>${s.text}`;
        li.onclick = () => {
          target = i + 1;
          playing = true;
        };
        stepsEl.append(li);
      });
      for (const k in C) {
        keyEl.insertAdjacentHTML(
          "beforeend",
          `<span class="a3d-sw" style="background:#${C[k].color.toString(16).padStart(6, "0")}"></span><span>${C[k].label}</span>`
        );
      }

      playBtn.onclick = () => {
        if (t >= N - 1e-3) t = 0;
        target = N;
        playing = true;
      };
      apartBtn.onclick = () => {
        target = 0;
        playing = true;
      };
      rangeEl.oninput = (e) => {
        playing = false;
        t = target = (e.target.value / 1000) * N;
        apply();
      };
      ghostChk.onchange = (e) => ghosts.forEach((m) => (m.visible = e.target.checked));

      const ray = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      renderer.domElement.addEventListener("pointermove", (e) => {
        const r = renderer.domElement.getBoundingClientRect();
        mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects([...moving], true).find((h) => h.object.userData.info && h.object.visible);
        if (!hit) {
          tipEl.style.display = "none";
          return;
        }
        const [, name, use] = INFO[hit.object.userData.info];
        tipEl.innerHTML = `<b>${name}</b><br>${use}`;
        tipEl.style.display = "block";
        tipEl.style.left = Math.min(r.width - 270, e.clientX - r.left + 14) + "px";
        tipEl.style.top = Math.max(8, e.clientY - r.top + 14) + "px";
      });
      renderer.domElement.addEventListener("pointerleave", () => {
        tipEl.style.display = "none";
      });

      let last = performance.now();
      renderer.setAnimationLoop((now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (playing) {
          const step = dt * 0.9 * Math.sign(target - t);
          if (Math.abs(target - t) <= Math.abs(step)) {
            t = target;
            playing = false;
          } else {
            t += step;
          }
          apply();
        }
        controls.update();
        renderer.render(scene, camera);
      });
      apply();
    },
    undefined,
    (err) => {
      msgEl.classList.add("err");
      msgEl.textContent = "조립 3D 모델을 불러오지 못했습니다 (로컬에서는 serve.cmd로 열어 주세요): " + (err?.message || err);
    }
  );
}
