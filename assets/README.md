# 문서 공통 컴포넌트 안내 (`assets/`)

`week*/*.html` 문서가 함께 쓰는 공통 스타일(`doc.css`)과 스크립트(`doc.js`), 허용 클래스 목록(`components.json`), 견본(`components.html`), 새 문서 뼈대(`template.html`)를 모아 둔 폴더입니다.

> **새 컴포넌트를 만들 때는 `doc.css` · `README.md` · `components.json` · `components.html`을 함께 고친다.**

## 문서에 불러오는 법 (주차 폴더 기준)

```html
<link rel="stylesheet" href="../assets/doc.css">
...
<script src="../assets/doc.js" defer></script>
```

---

## 컴포넌트 목록

### 페이지 틀 · 제목
| 분류 | 클래스 / 요소 | 용도 | 한 줄 HTML 예시 |
|---|---|---|---|
| 페이지 틀 | `div.doc` | 본문 흰 종이 틀 | `<div class="doc">...</div>` |
| 상단 바 | `nav.topnav` | 화면 위 고정 이동 바 | `<nav class="topnav" aria-label="문서 이동"><a href="index.html">← 목차</a><span><a href="01.html" aria-current="page">01<span class="lbl"> 제목</span></a></span></nav>` |
| 바 라벨 | `span.lbl` | 640px 이하에서 숨기는 제목 라벨 | `<a href="01.html">01<span class="lbl"> 주제 · 배경</span></a>` |
| 부제 | `p.sub` | `h1` 아래 한 줄 부제 | `<p class="sub">문서 범위와 기준일</p>` |
| 제목 메타 | `span.meta` | `h2` · `h3` 오른쪽 보조 설명 | `<h2>1. 품목 <span class="meta">총 16건</span></h2>` |
| 요점 상자 | `div.def` | 한 줄 핵심 요약 강조 상자 | `<div class="def">핵심 한 줄 요약</div>` |

### 글 · 보조 박스
| 분류 | 클래스 / 요소 | 용도 | 한 줄 HTML 예시 |
|---|---|---|---|
| 설명 문단 | `p.note` | 표 · 그림 아래 작은 근거/설명 | `<p class="note">근거: 11/16 회의 기록</p>` |
| 흐린 글자 | `.muted` | 보조 정보 흐리게 표시 | `<span class="muted">참고값</span>` |
| 줄바꿈 금지 | `.nw` | 번호 · 날짜가 줄 중간에 끊기지 않게 | `<span class="nw">F-01</span>` |
| 큰 화면 줄바꿈 | `br.w` | 모바일(640px 이하)에서는 숨기는 `<br>` | `앞 문장 <br class="w">이어지는 문장` |
| 출처 목록 | `ol.src` | 각주 출처 번호 목록 | `<ol class="src"><li><a href="...">출처</a></li></ol>` |
| 항목 보조줄 | `span.subnote` | 칸 · 목록 항목 아래 작은 설명 줄 | `<span>항목<span class="subnote">세부 설명</span></span>` |
| 가로 묶음 | `span.item` | 범례 · 배지 설명을 여백 두고 나열 | `<span class="item"><span class="tag must">Must</span> 필수</span>` |
| 안내 상자 | `div.callout` | 연한 회색 배경 안내 상자 | `<div class="callout"><strong>안내:</strong> 내용</div>` |
| 주의 상자 | `div.callout.warn` | 노란빛 테두리 확인/주의 상자 | `<div class="callout warn"><strong>확인:</strong> 내용</div>` |
| 줄 상자 | `div.rows` | 왼쪽 검은 라벨 + 오른쪽 설명 줄 | `<div class="rows"><div><b>평상시</b><span>순찰</span></div></div>` |
| 조건 상자 | `div.specs` | 2열 조건 · 기준 요약 상자 | `<div class="specs"><div><strong>한도</strong><span>30만 원</span></div></div>` |

### 표
| 분류 | 클래스 / 요소 | 용도 | 한 줄 HTML 예시 |
|---|---|---|---|
| 표 감싸기 | `div.tw` | 좁은 화면 가로 스크롤 감싸기 | `<div class="tw"><table>...</table></div>` |
| 모바일 카드 표 | `table.cards` | 640px 이하 카드 전환 (`doc.js` 자동 부여) | `<table class="cards"><tr><th>항목</th>...</tr>...</table>` |
| 머리 칸 | `td.k` | 줄의 제목 칸(줄바꿈 금지) | `<tr><td class="k">항목명</td><td>내용</td></tr>` |
| 묶음 줄 | `tr.grp` | 표 안 소제목 구분 줄 | `<tr class="grp"><td colspan="4">1. 순찰</td></tr>` |
| 합계 줄 | `tr.total` | 표 마지막 굵은 합계 줄 | `<tr class="total"><td class="k">합계</td><td class="num">100원</td></tr>` |
| 숫자 칸 | `td.num` / `th.num` | 수량 · 금액 오른쪽 정렬 + 고정폭 숫자 | `<td class="num">12,000원</td>` |

### 표시 배지 · 아이콘
| 분류 | 클래스 / 요소 | 용도 | 한 줄 HTML 예시 |
|---|---|---|---|
| 상태 배지 | `span.tag` + `ok` / `chk` / `no` / `buy` / `hold` / `spare` | 보유·확인·없음·구매·보류·여분 | `<span class="tag buy">구매 필요</span>` |
| 우선순위 배지 | `span.tag` + `must` / `should` / `could` / `wont` | MoSCoW 우선순위 | `<span class="tag must">Must</span>` |
| 색깔 점 | `i.dot` + `blue` / `green` / `gray` / `red` | 표 · 목록 앞 구분 원형 점 | `<i class="dot blue"></i>A` |

### 배치 · 수치 · 그림 · 위젯
| 분류 | 클래스 / 요소 | 용도 | 한 줄 HTML 예시 |
|---|---|---|---|
| 2열 배치 | `div.cols-2` / `div.tw.cols-2` | 2열 카드 나열 / 2열 고정폭 표 | `<div class="cols-2"><div><b>A</b>설명</div><div><b>B</b>설명</div></div>` |
| 3열 배치 | `div.cols-3` | 3열 카드 나열 | `<div class="cols-3"><div><b>1층</b>설명</div>...</div>` |
| 수치 요약 | `div.kpis` > `.kpi` (`.kl`, `.kv`, `.kd`) | 상단 4칸 수치 요약 카드 | `<div class="kpis"><div class="kpi"><div class="kl">합계</div><div class="kv">16건</div><div class="kd">비고</div></div></div>` |
| 그림 틀 | `figure.fig[data-kind]` + `figcaption` | 도표·차트·Mermaid·트리 바깥 틀 | `<figure class="fig" data-kind="blocks"><svg role="img" aria-label="설명">...</svg><figcaption>설명</figcaption></figure>` |
| 범례 줄 | `div.legend` | 그림 아래 또는 독립 구분 범례 줄 | `<div class="legend"><span><span class="tag ok">보유</span> 설명</span></div>` |
| 위젯 자리 | `div[data-widget]` | 3D(`v3d`) · 시뮬레이션(`missionmap`) 자리 | `<div data-widget="v3d"></div>` |

---

## 옛 클래스 → 새 클래스 대응표 (문서별)

> **규칙**: `그대로`는 클래스 유지, `지움`은 클래스 속성 제거, `(위젯 몫)`/`(그림 몫)`은 해당 워커가 자리/틀로 바꾼다.

### 1. `week01/01_주제선택_배경.html`
| 옛 클래스 | 새 컴포넌트 | 비고 |
|---|---|---|
| `div.doc` | 그대로 | |
| `nav.topnav` | 그대로 | |
| `span.lbl` | 그대로 | |
| `p.sub` | 그대로 | |
| `div.def` | 그대로 | |
| `br.w` | 그대로 | |
| `div.tw` | 그대로 | |
| `td.k` | 그대로 | |
| `span.ev` | `span.subnote` | `04`의 `.subnote`와 통합 |
| `ol.src` | 그대로 | |
| `div.modes` | `div.rows` | 일반 이름으로 통일 |

### 2. `week01/02_기능정의서.html`
| 옛 클래스 | 새 컴포넌트 | 비고 |
|---|---|---|
| `div.doc`, `nav.topnav`, `span.lbl`, `p.sub` | 그대로 | |
| `div.tw`, `tr.grp`, `td.k`, `span.nw`, `br.w`, `p.note`, `p.muted` | 그대로 | |
| `div.split.tw` | `div.tw.cols-2` | 2열 표 폭 유지 |
| `span.pri.must` | `span.tag.must` | |
| `span.pri.should` | `span.tag.should` | |
| `span.pri.could` | `span.tag.could` | |
| `span.pri.wont` | `span.tag.wont` | |
| `span.pair` | `span.item` | `03`의 `.it`와 통합 |
| `div.legend` | 그대로 | 그림 아래 범례 |
| `div.graph` | `figure.fig[data-kind="blocks"]` + `figcaption` | (그림 몫 · W10) |
| `div.v3d`, `div.v3d-bar`, `span.v3d-seg`, `label.v3d-angle`, `div.v3d-stage`, `p.v3d-msg`, `div.v3d-labels`, `p.v3d-read`, `div.v3d-legend`, `table.v3d-parts` | `<div data-widget="v3d">` | (위젯 몫 · W3) |

### 3. `week01/03_미션맵_시연구성안.html`
| 옛 클래스 | 새 컴포넌트 | 비고 |
|---|---|---|
| `div.doc`, `nav.topnav`, `span.lbl`, `p.sub` | 그대로 | |
| `div.tw`, `td.k`, `tr.grp`, `span.nw`, `br.w`, `p.note` | 그대로 | |
| `div.key.tw` | `div.tw` (`key` 지움) | `td.k`로 폭 유지 |
| `span.it` | `span.item` | `02`의 `.pair`와 통합 |
| `i.dot` (+ 인라인 `style="background:var(--*)"`) | `i.dot.blue` / `i.dot.green` / `i.dot.gray` | 인라인 `style` 제거 |
| `div.player`, `div.grp`, `span.clock`, `div.simwrap`, `div.simmain`, `div.chapter`, `div.graph`(내부), `div.status`, `div.logbox`, `div.loghead`, `ol.log` | `<div data-widget="missionmap">` | (위젯 몫 · W4) |

### 4. `week02/02_재료_목록.html`
| 옛 클래스 | 새 컴포넌트 | 비고 |
|---|---|---|
| `div.doc`, `nav.topnav`, `span.lbl`, `p.sub`, `span.nw` | 그대로 | |
| `div.rules` | `div.specs` | 일반 이름으로 통일 |
| `div.kpis`, `div.kpi`, `div.kl`, `div.kv`, `div.kd` | 그대로 | |
| `div.summary` | `div.callout` | 일반 이름으로 통일 |
| `div.summary.todo` | `div.callout.warn` | |
| `div.legend` | 그대로 | |
| `span.badge.buy` | `span.tag.buy` | |
| `span.badge.spare` | `span.tag.spare` | |
| `span.badge.hold` | `span.tag.hold` | |
| `span.badge.mk` | `span.tag.ok` | `05`의 "만들 것(`ok`)"과 통합 |
| `span.h2-meta` | `span.meta` | `h3 .meta`와 통합 |
| `span.meta` | 그대로 | |
| `div.tw`, `table.cards`, `td.k`, `span.subnote`, `tr.total` | 그대로 | |
| `th.col-item`, `th.col-qty`, `th.col-price`, `th.col-sum`, `th.col-st` | 지움 | 표 자동 폭으로 통일 |
| `td.qty` | `td.num` | 오른쪽 정렬 · 고정폭 |
| `td.price` | `td.num` | 오른쪽 정렬 · 고정폭 |
| `td.price.muted` | `td.num.muted` | |

### 5. `week02/01_시스템_아키텍처.html`
| 옛 클래스 | 새 컴포넌트 | 비고 |
|---|---|---|
| `div.doc`, `nav.topnav`, `span.lbl`, `p.sub`, `p.note` | 그대로 | |
| `div.tw`, `tr.grp`, `td.k`, `span.nw`, `td.nw` | 그대로 | |
| `div.three` | `div.cols-3` | |
| `div.fig` | `figure.fig[data-kind="blocks"]` + `figcaption` | (그림 몫 · W10) |
| `span.tag.ok`, `span.tag.chk`, `span.tag.no` | 그대로 | |
| `span.todo` | `span.tag.chk` | |
