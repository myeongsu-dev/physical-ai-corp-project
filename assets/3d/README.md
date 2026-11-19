# 3D 모델 (GLB)

기능 정의서(`week01/02_기능정의서.html`)의 장착 구성 3D가 불러오는 부품 모델입니다. 제조사 공식 STEP을 GLB로 바꾸고 메시를 줄여 압축했습니다. 단위는 m이고, 뷰어가 mm로 키워 자리를 잡습니다.

| 파일 | 부품 | 원본 | 라이선스 |
|---|---|---|---|
| `mechdog-servo-hps0618sg.glb` | MechDog 다리 서보 HPS-0618SG | Hiwonder MechDog 자료실 `Specification & Drawing/2. Servo Specification & Drawing/HPS-0618SG.stp` | 공개 배포 자료 (별도 표기 없음) |
| `xiao-esp32s3-sense.glb` | Seeed Studio XIAO ESP32-S3 Sense | Seeed Studio XIAO ESP32S3 Sense 3D 모델 (`Seeed Studio XIAO-ESP32-S3-Sense.step`) | 공개 배포 자료 (별도 표기 없음) |
| `raspberry-pi-5.glb` | Raspberry Pi 5 | Raspberry Pi 제품 정보 포털 `rpi-5 3D STEP - No Graphics small file` (RP-010083) | MIT, `LICENSE-raspberry-pi-5.txt` |

## 다시 만들기

1. STEP → GLB: Python `cascadio` (OpenCascade)로 `cascadio.step_to_glb(입력, 출력, tol_linear=0.05, tol_angular=0.5)`. Pi 5는 `tol_linear=0.1`.
2. 압축: `gltfpack -cc -si 0.5` (서보 · XIAO), `gltfpack -cc -si 0.1 -sp` (Pi 5). 뷰어는 three.js `MeshoptDecoder`로 풉니다.
3. 뷰어의 배치 값(파일 좌표 → 로봇 좌표)은 HTML의 `models` 블록 주석에 있습니다. 원본 STEP의 원점이 바뀌면 그 값도 고칩니다.

## 위젯

- `viewer.js`: 3D 장착 구성 위젯(`[data-widget="v3d"]`)의 마크업·부품 표·three.js 뷰어를 그리는 보통 스크립트(`defer`). 파일을 바로 열어도 돌도록 three.js만 `import()`로 CDN에서 받는다.
- `viewer.css`: 3D 뷰어 위젯(`.v3d*`) 스타일.
