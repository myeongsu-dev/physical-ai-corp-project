# 3D 모델 (GLB)

로봇 하드웨어 문서(`week02/04_로봇하드웨어.html`)의 장착 구성 3D가 불러오는 파일입니다.

## MechDog · 3D 출력물 (CAD에서 만듦)

`07_corp-project/cad`(build123d)가 `build.py`로 만듭니다. 직접 고치지 않고, 치수는 `cad/mechdog/dims.py`에서 바꾼 뒤 다시 빌드합니다 (`cad/README.md`).

| 파일 | 내용 |
|---|---|
| `mechdog.glb` | 본체 · 다리 · 장착물 전체. 단위 mm, 뷰어 좌표(X 앞 · Y 위 · Z 오른쪽). 이름 있는 노드를 뷰어가 찾아 움직이고, 이름 끝 `__재질`로 색을 씌운다 |
| `mechdog.json` | 뷰어가 쓰는 치수(`dims`), 센서 눈 기준점, 이름표, 캔버스 판(라벨 · 실크스크린) 자리, 분해 방향, 출력물 목록 |
| `print/<부품>.3mf` · `.stl` | 3D 출력용. Z가 위, 베드에 놓을 자세, 단위 mm (`head_bracket` · `battery_bay` · `led_plate` · `pi_carrier`) |
| `MEASURE.md` | 실측 체크리스트. 잰 값을 `dims.py`에 넣는다 |

## 공식 부품 모델

제조사 공식 STEP을 GLB로 바꾸고 메시를 줄여 압축했습니다. 단위는 m이고, 뷰어가 mm로 키워 자리를 잡습니다.

| 파일 | 부품 | 원본 | 라이선스 |
|---|---|---|---|
| `mechdog-servo-hps0618sg.glb` | MechDog 다리 서보 HPS-0618SG | Hiwonder MechDog 자료실 `Specification & Drawing/2. Servo Specification & Drawing/HPS-0618SG.stp` | 공개 배포 자료 (별도 표기 없음) |
| `xiao-esp32s3-sense.glb` | Seeed Studio XIAO ESP32-S3 Sense | Seeed Studio XIAO ESP32S3 Sense 3D 모델 (`Seeed Studio XIAO-ESP32-S3-Sense.step`) | 공개 배포 자료 (별도 표기 없음) |
| `raspberry-pi-5.glb` | Raspberry Pi 5 | Raspberry Pi 제품 정보 포털 `rpi-5 3D STEP - No Graphics small file` (RP-010083) | MIT, `LICENSE-raspberry-pi-5.txt` |

### 다시 만들기

1. STEP → GLB: Python `cascadio` (OpenCascade)로 `cascadio.step_to_glb(입력, 출력, tol_linear=0.05, tol_angular=0.5)`. Pi 5는 `tol_linear=0.1`.
2. 압축: `gltfpack -cc -si 0.5` (서보 · XIAO), `gltfpack -cc -si 0.1 -sp` (Pi 5). 뷰어는 three.js `MeshoptDecoder`로 풉니다.
3. 뷰어의 배치 값(파일 좌표 → 로봇 좌표)은 HTML의 `models` 블록 주석에 있습니다. 원본 STEP의 원점이 바뀌면 그 값도 고칩니다.

## 위젯

- `viewer.js`: 3D 장착 구성 위젯(`[data-widget="v3d"]`)의 마크업 · 부품 표 · three.js 뷰어. `mechdog.glb` · `mechdog.json`을 읽어 다리 · 카메라 각도, 분해 보기, 시야 판정을 한다. three.js만 `import()`로 CDN에서 받고, GLB를 읽으므로 웹 서버로 연다 (로컬은 `python -m http.server`).
- `viewer.css`: 3D 뷰어 위젯(`.v3d*`) 스타일.
