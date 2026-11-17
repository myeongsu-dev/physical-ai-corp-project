// 미션맵 시뮬레이션 — 세계 · 로봇 · 서버를 나눠서 돌린다
//   세계: 실제 위치를 들고 센서 값(초음파 거리, 표면 온도)만 만든다
//   로봇: 자기 센서와 서버 명령만으로 움직인다. 다른 로봇이 어디 있는지 모른다. 0.5초마다 위치를 보고
//   서버: 로봇 보고만 보고 판단해 명령한다 (명령 · 보고는 0.15초 늦게 도착)
// 단위 cm
// 로그는 Day11 로깅 원칙: "시각,밀리초 레벨 로거이름 메시지", 레벨 5단계, 로거는 점으로 이은 계층
(function(){
  var root = document.querySelector('[data-widget="missionmap"]');
  if (!root) return;
  root.innerHTML = "<div class=\"player\">\n  <button type=\"button\" id=\"sim-play\">일시정지</button>\n  <button type=\"button\" id=\"sim-reset\">처음부터</button>\n  <div class=\"grp\" id=\"sim-speed\" role=\"group\" aria-label=\"재생 속도\">속도\n    <button type=\"button\" data-sp=\"1\" aria-pressed=\"false\">1×</button>\n    <button type=\"button\" data-sp=\"2\" aria-pressed=\"true\">2×</button>\n    <button type=\"button\" data-sp=\"4\" aria-pressed=\"false\">4×</button>\n  </div>\n  <div class=\"grp\" id=\"sim-ch\" role=\"group\" aria-label=\"장면으로 이동\">장면\n    <button type=\"button\" data-ch=\"0\">1 평상시 순찰</button>\n    <button type=\"button\" data-ch=\"1\">2 바닥 물건</button>\n    <button type=\"button\" data-ch=\"2\">3 막힘 발견</button>\n    <button type=\"button\" data-ch=\"3\">4 충전 교대</button>\n    <button type=\"button\" data-ch=\"4\">5 과열 교차 확인</button>\n    <button type=\"button\" data-ch=\"5\">6 화재 대피 안내</button>\n  </div>\n  <span class=\"clock\" id=\"sim-clock\">0:00</span>\n</div>\n<div class=\"simwrap\">\n  <div class=\"simmain\">\n    <div class=\"chapter\" id=\"sim-chapter\"></div>\n    <div class=\"graph\"><svg id=\"sim\" viewBox=\"-36 -8 482 452\" role=\"img\" aria-label=\"평상시 순찰, 바닥 물건 발견, 막힘 발견, 충전 교대, 과열 교차 확인, 화재 대피 안내로 이어지는 4.1m × 4.35m 한 방향 미션맵 시나리오 애니메이션\"></svg></div>\n    <div class=\"status\" id=\"sim-status\" aria-live=\"off\"></div>\n  </div>\n  <div class=\"logbox\">\n    <div class=\"loghead\">관제 로그\n      <span><label title=\"디버그: 서버가 추정한 로봇 위치(점선 원) 표시\"><input type=\"checkbox\" id=\"ghost-on\"> 추정 위치</label>\n      <label>레벨 <select id=\"log-level\"><option value=\"10\">DEBUG</option><option value=\"20\" selected>INFO</option><option value=\"30\">WARNING</option></select></label></span>\n    </div>\n    <ol class=\"log\" id=\"sim-log\" aria-live=\"off\"></ol>\n  </div>\n</div>\n";
  var NS = "http://www.w3.org/2000/svg";
  var meas = document.createElementNS(NS, "svg");
  meas.setAttribute("width", "0"); meas.setAttribute("height", "0"); meas.setAttribute("aria-hidden", "true");
  meas.style.position = "absolute"; meas.style.visibility = "hidden"; meas.style.pointerEvents = "none";
  document.body.appendChild(meas);
  // 경로마다 STEP cm 간격 점을 한 번만 재 두고 보간한다 (getPointAtLength는 호출마다 느려서 매 걸음 부르면 화면이 멈춤)
  var STEP = 0.5, cache = {};
  function path(d){
    if (cache[d]) return cache[d];
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); meas.appendChild(p);
    var L = p.getTotalLength(), n = Math.max(1, Math.ceil(L / STEP)), xs = new Float64Array(n + 1), ys = new Float64Array(n + 1);
    for (var i = 0; i <= n; i++){ var q = p.getPointAtLength(L * i / n); xs[i] = q.x; ys[i] = q.y; }
    meas.removeChild(p);
    return cache[d] = {L:L, n:n, xs:xs, ys:ys};
  }
  function len(d){ return path(d).L; }
  function at(t, s){
    var f = t.L ? Math.max(0, Math.min(t.L, s)) / t.L * t.n : 0, i = Math.min(t.n - 1, Math.floor(f)), r = f - i;
    return {x:t.xs[i] + (t.xs[i + 1] - t.xs[i]) * r, y:t.ys[i] + (t.ys[i + 1] - t.ys[i]) * r};
  }
  function pt(d, s){
    var t = path(d), a = at(t, s), b = at(t, s + 0.6), c = at(t, s - 0.6);
    var tx = b.x - c.x, ty = b.y - c.y, n = Math.hypot(tx, ty) || 1;
    return {x:a.x, y:a.y, tx:tx / n, ty:ty / n};
  }
  function el(tag, attrs, text){
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function dist(a, b){ return Math.hypot(a.x - b.x, a.y - b.y); }
  function plen(P){ var L = 0; for (var i = 0; i < P.length - 1; i++) L += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); return L; }
  function along(P, d){
    for (var i = 0; i < P.length - 1; i++){ var L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); if (d <= L){ var f = L ? d / L : 0; return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f]; } d -= L; }
    return P[P.length - 1];
  }

  /* ================= 경로 (4.1m × 4.35m, 3줄 한 방향 · 후진 없음) ================= */
  // ponytail: 바닥 카메라 = 머리의 모듈형 카메라를 아래로 꺾어 비스듬히 앞 바닥을 봄.
  //   02 장착 구성 3D(35° 꺾음)에서 라인 모드가 처리하는 화면 위 2/3 = 몸 중심 앞 15~33cm → 가운데 24 · 앞뒤 ±9. 좌우 ±10cm는 가정 — 실측하면 이 세 값만 바꾼다
  var CAM_AHEAD = 24, CAM_D = 9, CAM_W = 10;
  var A_LOOP = "M65 365 H55 A30 30 0 0 1 25 335 V55 A30 30 0 0 1 55 25 H355 A30 30 0 0 1 385 55 V335 A30 30 0 0 1 355 365 H165 A25 25 0 0 0 140 390 A25 25 0 0 1 90 390 A25 25 0 0 0 65 365 Z";
  var B_CORR1 = "M25 160 A25 25 0 0 1 50 135 H360 A25 25 0 0 1 385 160";
  var B_CORR2 = "M385 230 A25 25 0 0 1 360 255 H50 A25 25 0 0 1 25 230";
  var AISLE_A12 = "M120 135 A25 25 0 0 0 145 110 V50 A25 25 0 0 1 170 25";
  var AISLE_A23 = "M240 25 A25 25 0 0 1 265 50 V110 A25 25 0 0 0 290 135";
  var AISLE_B12 = "M230 255 A25 25 0 0 1 205 230 V160 A25 25 0 0 1 230 135";
  var AISLE_C12 = "M230 255 A25 25 0 0 0 205 280 V340 A25 25 0 0 1 180 365";
  var DOCK_UTURN = "M165 365 A25 25 0 0 0 140 390 A25 25 0 0 1 90 390 A25 25 0 0 0 65 365";
  var PATROLS = {
    A:{steps:[
      "도크를 나와 왼쪽 외곽을 북쪽으로 · CP5 직진",
      "위쪽 외곽을 동쪽으로 · 갈림길 직진",
      "오른쪽 외곽을 남쪽으로 · 합류점 통과",
      "아래 외곽을 서쪽으로 · 도크 U턴 통과"
    ], segs:[
      {d:"M65 365 H55 A30 30 0 0 1 25 335 V55", st:0},
      {d:"M25 55 A30 30 0 0 1 55 25 H355", st:1},
      {d:"M355 25 A30 30 0 0 1 385 55 V335", st:2},
      {d:"M385 335 A30 30 0 0 1 355 365 H165 A25 25 0 0 0 140 390 A25 25 0 0 1 90 390 A25 25 0 0 0 65 365", st:3}
    ]},
    B:{steps:[
      "도크를 나와 왼쪽 외곽을 북쪽으로 · CP5 빨강에서 1번 간선으로",
      "1번 간선을 동쪽으로 직진 · 합류점 대기 확인",
      "오른쪽 외곽을 거쳐 2번 간선 서쪽으로 · B1·B2 통로 입구",
      "B1·B2 사이 통로를 북쪽으로 통과해 1번 간선 합류",
      "1번 간선 동쪽 끝에서 합류 허가 후 2번 간선 서쪽으로",
      "왼쪽 외곽 합류 후 CP5에서 다시 1번 간선으로",
      "CP6 빨강 → A1·A2 통로를 북쪽으로 통과",
      "위쪽 외곽 합류 후 CP7 → A2·A3 통로를 남쪽으로 통과",
      "1번 간선 동쪽 끝 합류 후 2번 간선으로 내려감",
      "CP8 빨강 → C1·C2 통로를 남쪽으로 통과해 도크 복귀"
    ], segs:[
      {gate:"start", st:0},
      {d:"M65 365 H55 A30 30 0 0 1 25 335 V160", st:0},
      {d:"M25 160 A25 25 0 0 1 50 135 H360", st:1},
      {gate:"merge2", st:1},
      {d:"M360 135 A25 25 0 0 1 385 160 V230 A25 25 0 0 1 360 255 H230", st:2},
      {d:"M230 255 A25 25 0 0 1 205 230 V160 A25 25 0 0 1 230 135 H360", st:3},
      {gate:"merge2", st:4},
      {d:"M360 135 A25 25 0 0 1 385 160 V230 A25 25 0 0 1 360 255 H50", st:4},
      {gate:"merge3", st:5},
      {d:"M50 255 A25 25 0 0 1 25 230 V160 A25 25 0 0 1 50 135 H120", st:5},
      {d:"M120 135 A25 25 0 0 0 145 110 V50", st:6},
      {gate:"merge1", st:6},
      {d:"M145 50 A25 25 0 0 1 170 25 H240 A25 25 0 0 1 265 50 V110 A25 25 0 0 0 290 135 H360", st:7},
      {gate:"merge2", st:8},
      {d:"M360 135 A25 25 0 0 1 385 160 V230 A25 25 0 0 1 360 255 H230", st:8},
      {d:"M230 255 A25 25 0 0 0 205 280 V340", st:9},
      {gate:"merge4", st:9},
      {d:"M205 340 A25 25 0 0 1 180 365 H165 A25 25 0 0 0 140 390 A25 25 0 0 1 90 390 A25 25 0 0 0 65 365", st:9}
    ]}
  };

  /* ================= 라인 연결망 (한 방향 그래프 · 후진 없음) ================= */
  var NODES = {
    DOUT:1, M3:1, CP5:1, M1:1, TOP:1, D_A2:1, M2:1, D_C2:1, M4:1, DIN:1,
    C1_W:1, D_A1:1, M_B12:1, M_A23:1, C1_E:1, C2_E:1, D_BC:1, C2_W:1
  };
  var NODE_KO = {
    DOUT:"도크 출구", M3:"왼쪽 합류점", CP5:"CP5", M1:"위쪽 합류점", TOP:"위쪽 외곽 가운데", D_A2:"CP7",
    M2:"1번 간선 동쪽 끝", D_C2:"2번 간선 입구", M4:"아래 합류점", DIN:"도크 입구",
    C1_W:"1번 간선 서쪽 끝", D_A1:"CP6", M_B12:"1번 간선 가운데", M_A23:"A2·A3 합류점", C1_E:"비상구 2 앞",
    C2_E:"2번 간선 동쪽 끝", D_BC:"CP8", C2_W:"2번 간선 서쪽 끝"
  };
  var EDGES = [
    ["DOUT", "M3", "M65 365 H55 A30 30 0 0 1 25 335 V230"],
    ["M3", "CP5", "M25 230 V160"],
    ["CP5", "M1", "M25 160 V55 A30 30 0 0 1 55 25 H170"],
    ["M1", "TOP", "M170 25 H205"],
    ["TOP", "D_A2", "M205 25 H240"],
    ["D_A2", "M2", "M240 25 H355 A30 30 0 0 1 385 55 V160"],
    ["M2", "D_C2", "M385 160 V230"],
    ["D_C2", "M4", "M385 230 V335 A30 30 0 0 1 355 365 H180"],
    ["M4", "DIN", "M180 365 H165"],
    ["DIN", "DOUT", DOCK_UTURN],
    ["CP5", "C1_W", "M25 160 A25 25 0 0 1 50 135"],
    ["C1_W", "D_A1", "M50 135 H120"],
    ["D_A1", "M_B12", "M120 135 H230"],
    ["M_B12", "M_A23", "M230 135 H290"],
    ["M_A23", "C1_E", "M290 135 H360"],
    ["C1_E", "M2", "M360 135 A25 25 0 0 1 385 160"],
    ["D_C2", "C2_E", "M385 230 A25 25 0 0 1 360 255"],
    ["C2_E", "D_BC", "M360 255 H230"],
    ["D_BC", "C2_W", "M230 255 H50"],
    ["C2_W", "M3", "M50 255 A25 25 0 0 1 25 230"],
    ["D_A1", "M1", AISLE_A12],
    ["D_A2", "M_A23", AISLE_A23],
    ["D_BC", "M_B12", AISLE_B12],
    ["D_BC", "M4", AISLE_C12]
  ].map(function(e){
    var L = len(e[2]), smp = [];
    for (var s = 0; s <= L; s += 2){ var q = pt(e[2], s); smp.push([s, q.x, q.y]); }
    var xs = smp.map(function(q){ return q[1]; }), ys = smp.map(function(q){ return q[2]; });
    return {a:e[0], b:e[1], d:e[2], L:L, smp:smp, box:[Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]};
  });
  var EDGE_BY_D = {}, NODE_XY = [];
  EDGES.forEach(function(e){ EDGE_BY_D[e.d] = e; NODE_XY.push(pt(e.d, 0), pt(e.d, e.L)); });
  var NODE_POS = {}; EDGES.forEach(function(e){ NODE_POS[e.a] = pt(e.d, 0); NODE_POS[e.b] = pt(e.d, e.L); });
  // 바닥 마커: 로봇은 좌표를 모르고 이 표식이 카메라에 들어올 때 "무슨 마커를 봤다"만 서버에 알린다
  var MARKERS = [["CP5", 25, 182, "red"], ["CP6", 100, 135, "red"], ["CP7", 224, 25, "red"], ["CP8", 250, 255, "red"]]
    .map(function(m){ return {name:m[0], x:m[1], y:m[2], c:m[3]}; });
  (function(){ var z = 0; EDGES.forEach(function(e){ for (var s = 25; s < e.L - 10; s += 55){
    var q = pt(e.d, s), qa = pt(e.d, s - CAM_AHEAD), qb = pt(e.d, s + CAM_AHEAD);
    // 구간 마커는 직선에만: 앞을 비스듬히 보는 카메라는 곡선 위 마커를 화면에 못 담는다 (앞뒤 CAM_AHEAD가 곧아야 둠)
    if (q.tx * qa.tx + q.ty * qa.ty < 0.999 || q.tx * qb.tx + q.ty * qb.ty < 0.999) continue;
    if (MARKERS.some(function(m){ return Math.hypot(m.x - q.x, m.y - q.y) < 18; }) || NODE_XY.some(function(n){ return Math.hypot(n.x - q.x, n.y - q.y) < 12; })) continue;
    z++; MARKERS.push({name:"Z" + z, x:q.x, y:q.y, c:z % 2 ? "yellow" : "green"});
  } }); })();
  MARKERS.forEach(function(m){ var n = nearestRaw(m.x, m.y), t = pt(n.e.d, n.s); m.tx = t.tx; m.ty = t.ty; });
  function nearestRaw(x, y){ var best = null; EDGES.forEach(function(e){ e.smp.forEach(function(q){ var dd = Math.hypot(q[1] - x, q[2] - y); if (!best || dd < best.dd) best = {e:e, s:q[0], dd:dd}; }); }); return best; }
  var M_KO = {red:"빨강", yellow:"노랑", green:"초록"};
  function markerName(m){ return m.name + "(" + M_KO[m.c] + ")"; }
  function nearest(x, y, skip){
    var best = null;
    EDGES.forEach(function(e){
      if (skip && skip(e)) return;
      var bx = Math.max(e.box[0] - x, 0, x - e.box[2]), by = Math.max(e.box[1] - y, 0, y - e.box[3]);
      if (best && Math.hypot(bx, by) > best.dd) return;
      e.smp.forEach(function(q){ var dd = Math.hypot(q[1] - x, q[2] - y); if (!best || dd < best.dd) best = {e:e, s:q[0], dd:dd}; });
    });
    return best;
  }
  function zoneOf(x, y){ var n = nearest(x, y); return NODE_KO[n.e.a] + "~" + NODE_KO[n.e.b]; }
  // (x, y)에서 tgt(노드 이름 또는 [x, y])까지 한 방향 선을 따라가는 조각 [{d, s0, s1}]과 길이 (후진 없음)
  // avoid: [{e, dir}] 다른 로봇이 쓸 구간 → 가급적 피한다
  // stops: [{x, y}] 멈춰 있는 장애물 · 로봇 자리 → 그 자리를 지나는 길은 쓰지 않는다
  function route(x, y, tgt, avoid, stops, undirected){
    function rangeBlocked(e, s0, s1){ var lo = Math.min(s0, s1), hi = Math.max(s0, s1); return (stops || []).some(function(p){ return e.smp.some(function(q){ return q[0] >= lo - 1 && q[0] <= hi + 1 && Math.hypot(q[1] - p.x, q[2] - p.y) < 22; }); }); }
    function blocked(f, u){ var td = f.a === u ? 1 : -1; return (avoid || []).some(function(o){ return o.e === f && (undirected ? o.dir !== td : true); }) || rangeBlocked(f, 0, f.L); }
    var n = nearest(x, y), e = n.e, dd = {}, prev = {}, todo = Object.keys(NODES);
    todo.forEach(function(k){ dd[k] = Infinity; });
    if (undirected && !rangeBlocked(e, n.s, 0)){ dd[e.a] = n.s; prev[e.a] = {start:true, s1:0}; }
    if (!rangeBlocked(e, n.s, e.L) && e.L - n.s < dd[e.b]){ dd[e.b] = e.L - n.s; prev[e.b] = {start:true, s1:e.L}; }
    while (todo.length){
      todo.sort(function(p, q){ return dd[p] - dd[q]; });
      var u = todo.shift(); if (dd[u] === Infinity) break;
      EDGES.forEach(function(f){
        if (undirected ? (f.a !== u && f.b !== u) : (f.a !== u)) return;
        if (blocked(f, u)) return;
        var v = f.a === u ? f.b : f.a;
        if (dd[u] + f.L < dd[v]){ dd[v] = dd[u] + f.L; prev[v] = {from:u, edge:f}; }
      });
    }
    var endK = tgt, last = null, total;
    if (typeof tgt !== "string"){
      var t = nearest(tgt[0], tgt[1]), f = t.e;
      var ca = rangeBlocked(f, 0, t.s) ? Infinity : dd[f.a] + t.s;
      var cb = undirected && !rangeBlocked(f, t.s, f.L) ? dd[f.b] + (f.L - t.s) : Infinity;
      if (f === e && (undirected || t.s >= n.s) && !rangeBlocked(e, n.s, t.s) && Math.abs(t.s - n.s) <= Math.min(ca, cb)) return finish([{d:e.d, s0:n.s, s1:t.s}], Math.abs(t.s - n.s));
      if (ca === Infinity && cb === Infinity) return {pieces:[], L:Infinity};
      if (ca <= cb){ endK = f.a; last = {d:f.d, s0:0, s1:t.s}; total = ca; } else { endK = f.b; last = {d:f.d, s0:f.L, s1:t.s}; total = cb; }
    } else total = dd[tgt];
    if (!prev[endK]) return {pieces:[], L:Infinity};
    var pieces = [], k = endK;
    while (!prev[k].start){ var p = prev[k]; pieces.unshift(p.edge.a === p.from ? {d:p.edge.d, s0:0, s1:p.edge.L} : {d:p.edge.d, s0:p.edge.L, s1:0}); k = p.from; }
    pieces.unshift({d:e.d, s0:n.s, s1:prev[k].s1});
    if (last) pieces.push(last);
    return finish(pieces, total);
    function finish(pc, Lsum){
      if (n.dd > 3){ var q = pt(e.d, n.s), ds = "M" + x.toFixed(1) + " " + y.toFixed(1) + " L" + q.x.toFixed(1) + " " + q.y.toFixed(1); pc.unshift({d:ds, s0:0, s1:len(ds)}); Lsum += n.dd; }
      return {pieces:pc.filter(function(p){ return Math.abs(p.s1 - p.s0) > 0.01; }), L:Lsum};
    }
  }
  function edgeAt(x, y, hx, hy){ // 이 자리 · 이 방향이면 어느 구간을 가는가 (갈림길 바로 위는 판단하지 않음)
    if (NODE_XY.some(function(n){ return Math.hypot(n.x - x, n.y - y) < 6; })) return null;
    var n = nearest(x, y); if (n.dd > 6) return null;
    return {e:n.e, dir:1};
  }
  function addE(out, o){ if (o && !out.some(function(q){ return q.e === o.e && q.dir === o.dir; })) out.push(o); }
  function pieceEdges(pieces, k0){ var out = []; pieces.slice(k0 || 0).forEach(function(pc){ var e = EDGE_BY_D[pc.d]; if (e) addE(out, {e:e, dir:1}); }); return out; }
  function goAhead(pieces, k, prog, K){
    var out = [], left = K;
    while (k < pieces.length && left > 0){
      var pc = pieces[k], span = Math.abs(pc.s1 - pc.s0), sign = pc.s1 > pc.s0 ? 1 : -1;
      for (var u = prog; u <= span && left > 0; u += 8, left -= 8){ var q = pt(pc.d, pc.s0 + sign * u); addE(out, edgeAt(q.x, q.y, q.tx * sign, q.ty * sign)); }
      k++; prog = 0;
    }
    return out;
  }
  function patrolAhead(segs, i, s, K){
    var out = [], left = K, guard = 0;
    while (left > 0 && guard++ < 24){
      var sg = segs[i];
      if (sg.d){ var L = len(sg.d); for (var u = s; u <= L && left > 0; u += 8, left -= 8){ var q = pt(sg.d, u); addE(out, edgeAt(q.x, q.y, q.tx, q.ty)); } }
      i = (i + 1) % segs.length; s = 0;
    }
    return out;
  }
  function clash(a, b){ for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if (a[i].e === b[j].e && a[i].dir !== b[j].dir) return a[i]; return null; }
  function sameEdge(a, b){ for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if (a[i].e === b[j].e) return a[i]; return null; }
  function edgeName(o){ return NODE_KO[o.e.a] + "→" + NODE_KO[o.e.b]; }
  function pathText(pieces){ return pieceEdges(pieces).map(edgeName).join(" · "); }
  function backAlong(segs, i, s, d){ // 순찰 경로에서 d만큼 뒤 (진행 위치 i, s)
    while (d > 0){
      if (s >= d){ s -= d; d = 0; }
      else { d -= s; do { i = (i - 1 + segs.length) % segs.length; } while (!segs[i].d); s = len(segs[i].d); }
    }
    return {i:i, s:s};
  }

  /* ================= 세계: 실제 위치와 센서 ================= */
  var T = 0;
  var WORLD;
  var ROBOT_R = 7, STOP_GAP = 14, GO_GAP = 18;
  function sonarRead(rb){ // 앞쪽 초음파: 콘 안의 가장 가까운 물체까지 남은 거리(cm). 무엇인지는 모른다
    var p = rb.pose, best = 999, objs = [];
    Object.keys(ROBOTS).forEach(function(id){ if (id !== rb.id) objs.push({x:ROBOTS[id].pose.x, y:ROBOTS[id].pose.y, r:ROBOT_R}); });
    if (WORLD.box.on) objs.push({x:WORLD.box.x, y:WORLD.box.y, r:9});
    if (WORLD.mgr.state !== "off"){ var m = along(WORLD.mgr.P, WORLD.mgr.d); objs.push({x:m[0], y:m[1], r:5}); }
    workerPos().forEach(function(q){ objs.push({x:q[0], y:q[1], r:5}); });
    objs.forEach(function(o){
      var dx = o.x - p.x, dy = o.y - p.y, t = dx * p.hx + dy * p.hy, lat = Math.abs(dx * p.hy - dy * p.hx);
      if (t > 0 && lat < o.r + 6) best = Math.min(best, Math.max(0, t - 13.5 - o.r));
    });
    return best;
  }
  function thermalRead(rb){ // 표면 온도: 열원과 멀수록 주변 온도에 가까워진다
    var h = WORLD.heat; if (!h.on) return 24.1;
    return 24.1 + h.H * Math.exp(-dist(rb.pose, h) / 25);
  }
  function flameRead(rb){ // 머리 카메라: 열원 앞쪽에서 불꽃이 보이는지 확인
    var h = WORLD.heat; if (!h.on) return false;
    return dist(rb.pose, h) < 48 && h.H >= 60;
  }
  function floorCamRead(rb){ // 바닥 카메라: 발 앞 바닥에 놓인 물건이 화면에 들어왔는가 (낮아서 초음파 콘에는 안 잡힌다)
    var it = WORLD.item; if (!it.on) return false;
    var p = rb.pose, dx = it.x - p.x, dy = it.y - p.y, t = dx * p.hx + dy * p.hy;
    return t > 0 && t < 45 && Math.abs(dx * p.hy - dy * p.hx) < 18;
  }
  var MGR_P = [[418, 135], [398, 135], [398, 152], [312, 152]], MGR_P2 = [[418, 135], [398, 135], [398, 12], [252, 12]]; // 관리자 동선: 1번 간선 박스 / 위쪽 외곽 바닥 물건 (비상구 2로 들어옴)
  var WORKERS = [[[100, 35], [398, 35], [398, 135], [418, 135]], [[265, 80], [265, 135], [418, 135]], [[140, 355], [398, 355], [398, 135], [418, 135]]];
  function workerPos(){
    if (!WORLD.people.on) return [];
    return WORKERS.map(function(P, i){ var d = Math.max(0, (T - (WORLD.people.t0 + 1.5 + i * 0.4)) * 22); return d > plen(P) ? null : along(P, d); }).filter(Boolean);
  }

  /* ================= 통신 ================= */
  var BUS, LAT = 0.15;
  function send(to, msg){ BUS.push({at:T + LAT, to:to, msg:msg}); }
  function deliver(){
    var now = BUS.filter(function(m){ return m.at <= T; }); BUS = BUS.filter(function(m){ return m.at > T; });
    now.forEach(function(m){ if (m.to === "server") SV.onMsg(m.msg); else ROBOTS[m.to].onCmd(m.msg); });
  }

  /* ================= 로봇: 자기 센서와 서버 명령만 ================= */
  var V = 30;
  function nameOf(id){ return id === "A" || id === "B" ? id : id + "호"; }
  function Robot(id, pose, bat){
    this.id = id; this.pose = pose; this.bat = bat; this.task = "idle"; this.role = "standby";
    this.hold = null; this.display = ""; this.stop = ""; this.wait = "";
    this.grant = {}; this.asked = {}; this.lastRep = -9; this.warned = false; this.lastNav = -1; this.lastMv = null; this.lastMark = -1;
  }
  Robot.prototype.say = function(lv, sub, msg){ log(lv, "robot." + this.id + (sub ? "." + sub : ""), msg); };
  Robot.prototype.onCmd = function(c){
    if (c.type === "PATROL"){
      var P = PATROLS[c.route];
      this.task = "patrol"; this.role = c.role; this.patrol = c.route; this.steps = P.steps; this.segs = P.segs;
      this.i = c.i; this.s = c.s; this.t = 0; this.started = c.started; this.mover = null;
      this.hold = null; this.stop = ""; this.display = ""; this.lastNav = -1;
      this.pose = this.poseAt(this.firstSeg(), this.i === this.firstIdx() ? this.s : 0);
      this.say("INFO", "", "명령 수신 PATROL role=" + ROLE_LOG[c.role] + " progress=구간 " + (this.segs[this.i].st + 1) + "/" + this.steps.length);
    } else if (c.type === "GO"){
      var pcs = c.pieces.slice();
      if (pcs.length){ var st0 = pt(pcs[0].d, pcs[0].s0); if (dist(st0, this.pose) > 0.5){ var cd = "M" + this.pose.x.toFixed(1) + " " + this.pose.y.toFixed(1) + " L" + st0.x.toFixed(1) + " " + st0.y.toFixed(1); pcs.unshift({d:cd, s0:0, s1:len(cd)}); } }
      this.task = "go"; this.role = c.role; this.purpose = c.purpose; this.arrive = c.display || ""; this.pieces = pcs; this.seq = c.seq;
      this.k = 0; this.prog = 0; this.arrived = !pcs.length; this.hold = null; this.stop = ""; this.display = c.purpose === "guide" ? (c.display || "") : "";
      this.say("INFO", "", "명령 수신 GO purpose=" + PURPOSE_LOG[c.purpose] + " length=" + Math.round(c.L) + "cm");
    } else if (c.type === "HOLD"){ this.hold = c.by; this.say("INFO", "", "명령 수신 HOLD reason=" + c.by + " 우선 → 정지"); }
    else if (c.type === "RELEASE"){ this.hold = null; this.say("INFO", "", "명령 수신 RELEASE → 주행 재개"); }
    else if (c.type === "DISPLAY"){ this.display = c.sym; if (this.task === "go" && this.purpose === "guide") this.say("DEBUG", "display", "LED 표시 " + (c.sym === "✕" ? "✕ 진입 금지" : symText(c.sym))); }
    else if (c.type === "GRANT"){ this.grant[c.gate] = true; }
    else if (c.type === "IDLE"){ this.task = "idle"; this.role = "standby"; this.display = ""; this.pose = c.pose; this.say("INFO", "", "도크 도착 · 충전 시작 battery=" + Math.round(this.bat) + "%"); }
  };
  // 순찰 진행 위치 계산 (자기 경로만)
  Robot.prototype.firstIdx = function(){ var k = this.i; while (!this.segs[k].d) k = (k + 1) % this.segs.length; return k; };
  Robot.prototype.firstSeg = function(){ return this.segs[this.firstIdx()]; };
  Robot.prototype.poseAt = function(seg, s){
    var p = pt(seg.d, s);
    return {x:p.x, y:p.y, hx:p.tx, hy:p.ty, mx:p.tx, my:p.ty};
  };
  Robot.prototype.nextSeg = function(){
    this.i = (this.i + 1) % this.segs.length; this.s = 0; this.t = 0;
    var st = this.segs[this.i].st;
    if (st !== this.lastNav){ this.lastNav = st; this.say("DEBUG", "nav", "마커 인식 · 구간 " + (st + 1) + "/" + this.steps.length + " 시작: " + this.steps[st]); }
  };
  Robot.prototype.report = function(force){ // 상태만 보고 (움직이는 중인지 · 멈춘 이유 · 배터리). 좌표는 모른다
    var mv = this.moved ? 1 : 0;
    if (!force && mv === this.lastMv && T - this.lastRep < 0.5) return;
    this.lastRep = T; this.lastMv = mv;
    send("server", {type:"STATE", id:this.id, moving:mv, task:this.task, stop:this.stop, hold:!!this.hold, arrived:!!this.arrived, bat:this.bat, seq:this.seq});
  };
  Robot.prototype.readMarkers = function(){ // 바닥 카메라: 머리에서 비스듬히 내려다보는 앞쪽 바닥(CAM_AHEAD)에 들어온 마커를 읽어 서버에 알린다
    var p = this.pose, self = this;
    MARKERS.forEach(function(m, k){
      var dx = m.x - p.x, dy = m.y - p.y, fwd = dx * p.hx + dy * p.hy, side = dx * p.hy - dy * p.hx; // 곡선에선 보는 곳이 선 밖으로 벗어나서 화면 폭이 필요
      if (Math.abs(fwd - CAM_AHEAD) < CAM_D && Math.abs(side) < CAM_W && self.lastMark !== k){ self.lastMark = k; self.say("DEBUG", "cam", "마커 인식 " + markerName(m)); send("server", {type:"MARK", id:self.id, m:k}); }
    });
  };
  Robot.prototype.tick = function(dt){
    this.moved = false;
    var moving = (this.task === "patrol" || (this.task === "go" && !this.arrived)) && !this.hold && !this.stop;
    if (this.task === "idle") this.bat = Math.min(100, this.bat + 0.6 * dt);
    else if (moving) this.bat = Math.max(0, this.bat - (this.id === "A" ? 0.3 : 0.08) * dt);
    if (this.bat < 20 && !this.warned && this.task === "patrol"){ this.warned = true; this.say("WARNING", "battery", "배터리 부족 battery=" + Math.round(this.bat) + "% threshold=20%"); this.report(true); }
    this.wait = "";
    if (this.task === "idle"){ this.report(); return; }
    if (this.hold){ this.wait = "양보 · " + this.hold + " 우선"; this.report(); return; }
    if (this.task === "go" && this.arrived){
      if (this.purpose === "check" && T - this.heatT >= 2){ // 교차 확인 로봇은 도착한 자리에서 2초마다 온도와 불꽃을 다시 잰다
        this.heatT = T; var tc = thermalRead(this), fl = flameRead(this);
        this.say("DEBUG", "thermal", "표면 온도 temp=" + tc.toFixed(1) + "℃ flame=" + (fl ? "감지" : "미감지"));
        send("server", {type:"CHECK", id:this.id, temp:tc, flame:fl});
      }
      this.report(); return;
    }
    // 초음파 (전진 한 방향)
    var g = sonarRead(this);
    if (this.stop === "sonar"){
      if (g > GO_GAP){ this.stop = ""; this.say("DEBUG", "sonar", "전방 해소 dist=" + Math.round(g) + "cm → 주행 재개"); send("server", {type:"CLEAR", id:this.id}); }
      else { this.wait = "전방 물체 · 정지"; this.nearGoal(); this.report(); return; }
    } else if (g < STOP_GAP){
      this.stop = "sonar"; this.wait = "전방 물체 · 정지";
      this.say("DEBUG", "sonar", "전방 물체 dist=" + Math.round(g) + "cm threshold=" + STOP_GAP + "cm → 정지");
      if (!SV.ev.obstacle && SV.mode !== "evac") this.say("INFO", "cam", "머리 카메라 막힘 사진 촬영 · 서버 전송");
      send("server", {type:"OBSTACLE", id:this.id, dist:g, photo:true});
      this.nearGoal(); this.report(true); return;
    }
    // 온도 · 불꽃 확인 (온도 이상이 먼저 잡히면 정지 후 머리 카메라로 불꽃 확인)
    var temp = thermalRead(this), fl0 = flameRead(this);
    if (this.stop === "heat"){
      this.wait = "온도 이상 · 멈춰서 측정";
      if (T - this.heatT >= 2){ this.heatT = T; this.say("DEBUG", "thermal", "표면 온도 temp=" + temp.toFixed(1) + "℃ flame=" + (fl0 ? "감지" : "미감지")); send("server", {type:"TEMP", id:this.id, temp:temp, flame:fl0}); }
      this.report(); return;
    }
    if (this.task === "patrol" && temp > 45){
      this.stop = "heat"; this.display = "!"; this.heatT = T;
      this.say("DEBUG", "thermal", "표면 온도 temp=" + temp.toFixed(1) + "℃ ambient=24.1℃ flame=" + (fl0 ? "감지" : "미감지"));
      this.say("WARNING", "", "온도 이상 → 정지 temp=" + temp.toFixed(1) + "℃ threshold=45℃");
      send("server", {type:"TEMP", id:this.id, temp:temp, flame:fl0}); this.report(true); return;
    }
    if (this.task === "patrol") this.stepPatrol(dt); else this.stepGo(dt);
    if (this.moved) this.readMarkers();
    if (this.task === "patrol" && !this.sawItem && floorCamRead(this)){ // 멈추지 않고 사진만 보낸다 (통행은 막지 않음)
      this.sawItem = true; this.say("DEBUG", "cam", "바닥 물체 인식 · 초음파 반응 없음 → 낮은 물체, 사진 전송");
      send("server", {type:"FLOOR", id:this.id});
    }
    this.report();
  };
  Robot.prototype.stepPatrol = function(dt){
    var sg = this.segs[this.i];
    if (sg.pause){ this.t += dt; this.wait = "멈춰서 통로 확인"; if (this.t >= sg.pause) this.nextSeg(); return; }
    if (sg.gate){
      if (sg.gate === "start" && this.started){ this.nextSeg(); return; }
      if (this.grant[sg.gate]){ delete this.grant[sg.gate]; this.asked[sg.gate] = false; if (sg.gate === "start") this.started = true; this.nextSeg(); return; }
      if (!this.asked[sg.gate]){ this.asked[sg.gate] = true; this.say("DEBUG", "", (sg.gate === "start" ? "출발" : "합류") + " 허가 요청"); send("server", {type:"REQUEST", id:this.id, gate:sg.gate}); }
      this.wait = sg.gate === "start" ? "출발 허가 대기" : "합류 허가 대기"; return;
    }
    var L = len(sg.d); this.s = Math.min(L, this.s + V * dt); this.pose = this.poseAt(sg, this.s); this.moved = true;
    if (this.s >= L - 0.01) this.nextSeg();
  };
  Robot.prototype.stepGo = function(dt){
    var pc = this.pieces[this.k], span = Math.abs(pc.s1 - pc.s0), sign = pc.s1 > pc.s0 ? 1 : -1;
    this.prog = Math.min(span, this.prog + V * dt);
    var q = pt(pc.d, pc.s0 + sign * this.prog);
    this.pose = {x:q.x, y:q.y, hx:q.tx * sign, hy:q.ty * sign, mx:q.tx * sign, my:q.ty * sign}; this.moved = true;
    if (this.prog >= span - 0.01){ this.k++; this.prog = 0; if (this.k >= this.pieces.length) this.arrive_(); }
  };
  Robot.prototype.goal = function(){ var pc = this.pieces[this.pieces.length - 1]; return pt(pc.d, pc.s1); };
  Robot.prototype.nearGoal = function(){ // 목적지 바로 앞에서 막히면 그 자리를 도착으로 본다
    if (this.task === "go" && !this.arrived && dist(this.pose, this.goal()) < 20) this.arrive_();
  };
  Robot.prototype.arrive_ = function(){
    this.arrived = true; if (this.purpose !== "guide") this.display = this.arrive; this.stop = ""; this.heatT = T;
    var msg = {type:"ARRIVED", id:this.id, purpose:this.purpose, seq:this.seq};
    if (this.purpose === "check"){
      msg.temp = thermalRead(this); msg.flame = flameRead(this);
      this.say("DEBUG", "thermal", "표면 온도 temp=" + msg.temp.toFixed(1) + "℃ flame=" + (msg.flame ? "감지" : "미감지"));
    }
    if (this.purpose === "guide") this.say("INFO", "", "갈림길 도착 · 현재 표시 " + (this.display ? symText(this.display) : "없음 (서버 지시 대기)"));
    send("server", msg); this.report(true);
  };

  /* ================= 서버: 보고만 보고 판단해 명령 ================= */
  var ROLE_LOG = {outer:"외곽", corr:"간선·통로", standby:"대기", check:"과열 교차 확인", guide:"대피 안내", relay:"외곽(교대)", dock:"도크 복귀"};
  var PURPOSE_LOG = {relay:"교대 · 인수 위치로", dock:"도크 복귀 · 충전", check:"교차 확인 측정", guide:"대피 안내", evade:"위험 구역 회피 · 대기 지점으로"};
  var PRIO = {guide:3, check:2, relay:2, outer:1, corr:1, dock:0, standby:0};
  var SPOTS = [
    {no:"①", name:"1번 간선 서쪽 끝", node:"C1_W", sym:"✕"},
    {no:"②", name:"1번 간선 동쪽 끝", node:"C1_E", sym:"→"},
    {no:"③", name:"2번 간선 가운데", node:"D_BC", sym:["E", "N"]},
    {no:"④", name:"위쪽 외곽 가운데", node:"TOP", sym:["E", "S"]}
  ];
  var DOCK_EXIT = {x:65, y:365}, SLOT = [{x:205, y:402, hx:-1, hy:0}, {x:255, y:402, hx:-1, hy:0}];
  var SV;
  function newServer(){
    return {view:{}, st:{}, plan:{}, pend:[], holds:[], ev:{}, relay:null, tt:0,
      onMsg:function(m){ svMsg(m); }};
  }
  // 서버가 내린 경로를 한 줄로 펴 놓은 것: 진행 거리 → 위치
  function Track(pieces, loop, segIdx){
    this.p = pieces; this.loop = loop; this.segIdx = segIdx || null; this.cum = [0];
    for (var k = 0; k < pieces.length; k++) this.cum.push(this.cum[k] + Math.abs(pieces[k].s1 - pieces[k].s0));
    this.L = this.cum[pieces.length];
  }
  Track.prototype.at = function(prog){
    if (!this.p.length) return null;
    prog = this.loop ? ((prog % this.L) + this.L) % this.L : Math.max(0, Math.min(this.L, prog));
    var k = 0; while (k < this.p.length - 1 && this.cum[k + 1] <= prog) k++;
    var pc = this.p[k], u = prog - this.cum[k], sign = pc.s1 > pc.s0 ? 1 : -1, q = pt(pc.d, pc.s0 + sign * u);
    return {x:q.x, y:q.y, mx:q.tx * sign, my:q.ty * sign, hx:q.tx * sign, hy:q.ty * sign, k:k, u:u};
  };
  Track.prototype.snap = function(prog, m){ // 이 마커를 지금 추정 위치 근처 어디에서 봤나 (카메라는 몸 앞 CAM_AHEAD를 봄)
    var best = null;
    for (var p = prog - 60; p <= prog + 150; p += 1){
      if (!this.loop && (p < 0 || p > this.L)) continue;
      var a = this.at(p), d = Math.hypot(a.x + a.hx * CAM_AHEAD - m.x, a.y + a.hy * CAM_AHEAD - m.y);
      if (d < CAM_W + 2 && (!best || d < best.d - 0.5 || (d < best.d + 0.5 && Math.abs(p - prog) < Math.abs(best.p - prog)))) best = {p:p, d:d};
    }
    return best && best.p;
  };
  function patrolTrack(name){
    var segs = PATROLS[name].segs, pcs = [], idx = [];
    segs.forEach(function(sg, i){ if (!sg.d) return; var L = len(sg.d); pcs.push({d:sg.d, s0:0, s1:L}); idx.push(i); });
    return new Track(pcs, true, idx);
  }
  function refresh(){ // 추정 위치를 지금 시각까지 굴려서 view를 만든다
    Object.keys(SV.st).forEach(function(id){
      var s = SV.st[id];
      if (s.track && s.moving) s.prog += s.moving * V * (T - s.lastT);
      s.lastT = T;
      var a = s.track ? s.track.at(s.prog) : null, base = a || s.park;
      var v = {x:base.x, y:base.y, hx:base.hx, hy:base.hy, mx:base.mx != null ? base.mx : base.hx, my:base.my != null ? base.my : base.hy,
        task:s.task, role:s.role, stop:s.stop, hold:s.hold, arrived:s.arrived, bat:s.bat, purpose:s.purpose};
      if (a && s.track.segIdx){ v.i = s.track.segIdx[a.k]; v.s = a.u; }
      if (a && !s.track.segIdx){ v.k = a.k; v.prog = a.u; }
      SV.view[id] = v;
    });
  }
  function lg(lv, sub, msg){ log(lv, "server" + (sub ? "." + sub : ""), msg); }
  function cmd(id, c){ send(id, c); }
  function sendGo(id, rt, purpose, role, display){
    SV.plan[id] = {kind:"go", pieces:rt.pieces, purpose:purpose, role:role};
    var s = SV.st[id]; s.goSeq = (s.goSeq || 0) + 1; s.track = new Track(rt.pieces, false); s.prog = 0; s.moving = 0; s.lastT = T; s.task = "go"; s.arrived = !rt.pieces.length; s.role = role; s.purpose = purpose; s.hold = false; s.stop = "";
    cmd(id, {type:"GO", pieces:rt.pieces, L:rt.L, purpose:purpose, role:role, display:display, seq:s.goSeq});
  }
  function sendPatrol(id, routeName, role, i, s, started){
    SV.plan[id] = {kind:"patrol", route:routeName, role:role};
    var st = SV.st[id], tr = patrolTrack(routeName), k = tr.segIdx.indexOf(i);
    if (k < 0){ k = 0; while (tr.segIdx[k] < i) k++; s = 0; }
    st.track = tr; st.prog = tr.cum[k] + s; st.moving = 0; st.lastT = T; st.task = "patrol"; st.role = role; st.arrived = false; st.hold = false; st.stop = "";
    cmd(id, {type:"PATROL", route:routeName, role:role, i:i, s:s, started:started});
  }
  function viewPos(id){ var v = SV.view[id]; return v ? {x:v.x, y:v.y, hx:v.hx, hy:v.hy} : null; }
  function aheadOf(id, K){ // 서버가 아는 계획 + 보고된 진행 위치로 앞으로 지날 구간
    var v = SV.view[id], p = SV.plan[id]; if (!v || !p) return [];
    if (p.kind === "go") return v.task === "go" ? goAhead(p.pieces, v.k || 0, v.prog || 0, K) : pieceEdges(p.pieces);
    return patrolAhead(PATROLS[p.route].segs, v.i, v.s, K);
  }
  function patrolUse(except){ // 앞으로 움직일 순찰 로봇들이 쓸 구간 (멈춰서 측정 중인 로봇은 장애물로만 본다)
    var out = []; Object.keys(SV.plan).forEach(function(id){ var p = SV.plan[id], v = SV.view[id]; if (id !== except && p && p.kind === "patrol" && !(v && v.stop === "heat")) aheadOf(id, 250).forEach(function(o){ addE(out, o); }); }); return out;
  }
  function stationary(v){ return v.task !== "idle" && (v.stop || v.hold || (v.task === "go" && v.arrived)); }
  function stopsFor(id){ return Object.keys(SV.view).filter(function(o){ return o !== id && stationary(SV.view[o]); }).map(function(o){ return SV.view[o]; }); }
  function movingUse(except){ // 움직이는 로봇(순찰 + 출동)이 앞으로 쓸 구간과 방향
    var out = patrolUse(except);
    Object.keys(SV.plan).forEach(function(id){ var p = SV.plan[id], v = SV.view[id]; if (id !== except && p && p.kind === "go" && v && !stationary(v)) aheadOf(id, 600).forEach(function(o){ addE(out, o); }); });
    return out;
  }
  function smartRoute(id, x, y, tgt, extraStops){ // 최단 경로와, 움직이는 로봇과 마주치지 않는 경로 중 고른다 (멈춘 로봇 자리는 둘 다 피한다)
    var stops = stopsFor(id).concat(extraStops || []);
    var a = route(x, y, tgt, null, stops), b = route(x, y, tgt, movingUse(id), stops);
    if (b.L < Infinity && (a.L === Infinity || b.L <= a.L * 1.35)){ if (b.L > a.L + 1) lg("INFO", "traffic", "우회 경로 선택 robot=" + nameOf(id) + " extra=+" + Math.round(b.L - a.L) + "cm reason=순찰 로봇과 마주침 회피"); return b; }
    return a;
  }
  function svMsg(m){
    refresh();
    var V_ = SV.view, S_ = SV.st[m.id];
    if (m.type === "STATE"){ // 도착 여부는 '지금 내린 출동'에 대한 보고일 때만 믿는다 (명령이 가는 중이면 예전 상태가 올 수 있다)
      S_.moving = m.moving; S_.stop = m.stop; S_.hold = m.hold; S_.bat = m.bat;
      if (S_.task === "go") S_.arrived = S_.arrived || (m.task === "go" && m.arrived && S_.goSeq === m.seq);
      refresh(); checkBattery(SV.view[m.id], m.id); return;
    }
    if (m.type === "MARK"){
      var mk = MARKERS[m.m]; if (!S_.track) return;
      var p = S_.track.snap(S_.prog, mk);
      if (p == null){ lg("WARNING", "pos", "경로 밖 마커 robot=" + nameOf(m.id) + " marker=" + markerName(mk) + " → 위치 재확인 필요"); return; }
      lg("DEBUG", "pos", "위치 보정 robot=" + nameOf(m.id) + " marker=" + markerName(mk) + " err=" + Math.round(Math.abs(p - S_.prog)) + "cm");
      S_.prog = p; refresh(); return;
    }
    if (m.type === "REQUEST"){ SV.pend.push({id:m.id, gate:m.gate, logged:false}); return; }
    if (m.type === "OBSTACLE"){
      // 보고한 로봇 앞 60cm 안에 다른 로봇이 있다고 알고 있으면 로봇끼리 가까워진 것 (사건 아님)
      var who = null, me = V_[m.id];
      Object.keys(V_).forEach(function(id){
        if (id === m.id) return; var o = V_[id], dx = o.x - me.x, dy = o.y - me.y;
        if (Math.hypot(dx, dy) < 60 && dx * me.hx + dy * me.hy > 0) who = id;
      });
      if (who){ lg("DEBUG", "traffic", "근접 정지 robot=" + nameOf(m.id) + " ahead=" + nameOf(who) + " → 간격 유지 대기 (정상)"); return; }
      if (SV.mode === "evac"){ lg("DEBUG", "traffic", "대피 중 전방 물체 robot=" + nameOf(m.id) + " → 사람일 수 있어 대기"); return; }
      if (SV.ev.obstacle) return;
      SV.ev.obstacle = {by:m.id, x:me.x + me.hx * 30, y:me.y + me.hy * 30, zone:zoneOf(me.x, me.y)};
      lg("WARNING", "event", "미확인 장애물 · 사진 수신 robot=" + nameOf(m.id) + " dist=" + Math.round(m.dist) + "cm zone=" + SV.ev.obstacle.zone + " (근처에 아는 로봇 없음)");
      lg("ERROR", "event", "대피로 통행 불가 zone=" + SV.ev.obstacle.zone + " cause=적치물 의심");
      lg("INFO", "alert", "대시보드 지도 구역·사진 팝업 알림 · 관리자 호출 zone=" + SV.ev.obstacle.zone);
      cmd(m.id, {type:"DISPLAY", sym:"✕"}); callManager("box");
      return;
    }
    if (m.type === "FLOOR"){ // 바닥 물건: 통행은 되지만 사람이 밟을 수 있다 → 주의 알림, 순찰은 계속
      if (SV.ev.item) return;
      var fv = V_[m.id]; SV.ev.item = {by:m.id, zone:zoneOf(fv.x, fv.y)};
      lg("WARNING", "event", "바닥 물건 감지 robot=" + nameOf(m.id) + " zone=" + SV.ev.item.zone + " sensor=바닥 카메라 (초음파 반응 없음 = 낮은 물체)");
      lg("INFO", "alert", "밟힘 주의 · 관리자 호출 zone=" + SV.ev.item.zone + " → 로봇은 순찰 계속");
      callManager("item");
      return;
    }
    if (m.type === "RESOLVE" && m.ev === "item"){
      if (!SV.ev.item) return;
      lg("INFO", "event", "이벤트 해제 zone=" + SV.ev.item.zone + " by=관리자(체크) · 바닥 물건 치움"); SV.ev.item = null; flags.itemDone = T; return;
    }
    if (m.type === "RESOLVE"){ // 관리자 체크와 로봇 재통과는 어느 쪽이 먼저 와도 된다 (통신 지연)
      var o2 = SV.ev.obstacle; if (!o2) return;
      lg("INFO", "event", "이벤트 해제 zone=" + o2.zone + " by=관리자(체크)"); o2.resolved = true; closeObstacle(); return;
    }
    if (m.type === "CLEAR"){
      var ob = SV.ev.obstacle;
      if (ob && ob.by === m.id){ cmd(m.id, {type:"DISPLAY", sym:""}); ob.recheck = true; lg("INFO", "traffic", "주행 재개 확인 robot=" + nameOf(m.id) + " → 재점검 대기"); }
      return;
    }
    if (m.type === "TEMP"){
      var h = SV.ev.heat;
      if (!h){
        var hv = V_[m.id]; SV.ev.heat = h = {first:m.id, temp:m.temp, flame:!!m.flame, x:hv.x, y:hv.y, zone:zoneOf(hv.x, hv.y)};
        lg("WARNING", "event", "과열 · 불꽃 의심 등록 zone=" + h.zone + " temp=" + m.temp.toFixed(1) + "℃ flame=" + (m.flame ? "감지" : "미감지") + " reporter=" + nameOf(m.id) + " status=교차 확인 필요");
        dispatchCheck(); flags.heatSeen = T;
      } else if (m.id === h.first){ h.temp = m.temp; h.flame = h.flame || !!m.flame; }
      return;
    }
    if (m.type === "ARRIVED"){
      if (m.seq !== S_.goSeq) return; // 지난 출동의 도착 보고
      if (S_.track) S_.prog = S_.track.L; S_.arrived = true; S_.moving = 0; refresh();
      if (m.purpose === "relay") handOver();
      if (m.purpose === "dock"){ cmd(m.id, {type:"IDLE", pose:SLOT[0]}); SV.plan[m.id] = null; S_.track = null; S_.park = SLOT[0]; S_.task = "idle"; S_.role = "standby"; flags.docked = T; refresh(); }
      if (m.purpose === "check"){
        var hh = SV.ev.heat;
        lg("INFO", "event", "교차 확인 측정 first=" + nameOf(hh.first) + " " + hh.temp.toFixed(1) + "℃ second=" + nameOf(m.id) + " " + m.temp.toFixed(1) + "℃ flame=" + (m.flame ? "감지" : "미감지") + " threshold=50℃");
        if (hh.temp >= 50 && hh.flame && m.temp >= 50 && m.flame) confirmFire(); else lg("INFO", "event", "기준 미달 → 두 로봇 계속 측정");
      }
      return;
    }
    if (m.type === "CHECK"){
      var h2 = SV.ev.heat; if (!h2 || h2.confirmed) return;
      if (h2.temp >= 50 && h2.flame && m.temp >= 50 && m.flame){ lg("INFO", "event", "교차 확인 일치 first=" + nameOf(h2.first) + " " + h2.temp.toFixed(1) + "℃ second=" + nameOf(m.id) + " " + m.temp.toFixed(1) + "℃ flame=감지"); confirmFire(); }
      return;
    }
  }
  function closeObstacle(){ var o = SV.ev.obstacle; if (o && o.resolved && o.passed){ lg("INFO", "event", "막힘 해소 zone=" + o.zone); SV.ev.obstacle = null; flags.cleared = T; } }
  function checkBattery(v, id){
    if (v.task === "patrol" && v.role === "outer" && v.bat < 20 && !SV.relay) startRelay(id);
  }
  function svTick(){
    refresh();
    // 출발 · 합류 허가 (A 우선 · B 대기, 모든 교차점 한 방향 합류)
    SV.pend = SV.pend.filter(function(r){
      var ok = true, why = "";
      Object.keys(SV.view).forEach(function(id){
        if (id === r.id) return; var o = SV.view[id];
        if (r.gate === "start" && o.task === "patrol" && Math.hypot(o.x - DOCK_EXIT.x, o.y - DOCK_EXIT.y) < 55){ ok = false; why = nameOf(id) + " 도크 출구 통과 중"; }
        if (r.gate === "merge1" && o.task === "patrol" && o.y < 40 && o.x > 65 && o.x < 185){ ok = false; why = nameOf(id) + " 위쪽 외곽 우선"; }
        if (r.gate === "merge2" && o.task === "patrol" && o.x > 370 && o.y > 45 && o.y < 175){ ok = false; why = nameOf(id) + " 오른쪽 외곽 우선"; }
        if (r.gate === "merge3" && o.task === "patrol" && o.x < 40 && o.y > 215 && o.y < 345){ ok = false; why = nameOf(id) + " 왼쪽 외곽 우선"; }
        if (r.gate === "merge4" && o.task === "patrol" && o.y > 350 && o.x > 165 && o.x < 295){ ok = false; why = nameOf(id) + " 아래 외곽 우선"; }
        var p = SV.plan[id];
        if (ok && p && p.kind === "go" && !(o.task === "go" && o.arrived) && clash(aheadOf(id, 400), aheadOf(r.id, 150))){ ok = false; why = nameOf(id) + " 통과 예정"; }
      });
      if (!ok){ if (!r.logged){ r.logged = true; lg("DEBUG", "traffic", (r.gate === "start" ? "출발" : "합류") + " 대기 robot=" + nameOf(r.id) + " reason=" + why); } return true; }
      cmd(r.id, {type:"GRANT", gate:r.gate}); lg("DEBUG", "traffic", (r.gate === "start" ? "출발" : "합류") + " 허가 robot=" + nameOf(r.id)); return false;
    });
    tryPendGo();
    if (SV.mode === "evac") Object.keys(SV.guide).forEach(function(id){
      var g = SV.guide[id], v = SV.view[id]; if (!v) return;
      var sym = v.arrived && g.spot.node === "C1_W" ? "✕" : guideDirs(v, SV.fireXY); if (!sym) return;
      var txt = symText(sym); if (txt === g.last){ g.cand = null; return; }
      if (sym !== "✕"){ if (g.cand !== txt){ g.cand = txt; g.candT = T; return; } if (T - g.candT < 0.75) return; } // 0.75초 넘게 같은 방향일 때만 바꾼다 (곡선에서 깜빡임 방지)
      g.last = txt; g.cand = null; cmd(id, {type:"DISPLAY", sym:sym});
      lg("INFO", "dispatch", "표시 변경 robot=" + nameOf(id) + " zone=" + zoneOf(v.x, v.y) + " → " + (sym === "✕" ? "✕ 진입 금지" : txt) + (v.arrived ? " (도착)" : " (이동 중)"));
    });
    if (SV.ev.heat && !SV.ev.heat.confirmed) evadeOthers(SV.ev.heat);
    // 막힘 해소 확인: 보고한 로봇이 그 자리를 지나가면
    var ob = SV.ev.obstacle, v;
    if (ob && ob.recheck && !ob.passed && (v = SV.view[ob.by]) && (v.x - ob.x) * v.hx + (v.y - ob.y) * v.hy > 12){
      lg("INFO", "event", "재점검 통과 zone=" + ob.zone + " robot=" + nameOf(ob.by)); ob.passed = true; closeObstacle();
    }
    // 교대: A가 비켜나면 3호에게 순찰을 넘긴다
    var rl = SV.relay;
    if (rl && rl.met && !rl.done && SV.view[rl.from] && Math.hypot(SV.view[rl.from].x - rl.holdAt.x, SV.view[rl.from].y - rl.holdAt.y) > 45){
      rl.done = true; sendPatrol(rl.to, "A", "outer", rl.meet.i, rl.meet.s, true);
      lg("INFO", "dispatch", "순찰 인계 robot=" + nameOf(rl.to) + " role=외곽 progress=구간 " + (PATROLS.A.segs[rl.meet.i].st + 1) + "/" + PATROLS.A.steps.length);
    }
    // 양보 해제
    SV.holds = SV.holds.filter(function(h){
      var p = SV.plan[h.by], vb = SV.view[h.by];
      if (p && p.kind === "go" && (!vb || vb.task !== "go")) return true; // 명령이 아직 가는 중
      if (p && p.kind === "go" && !vb.arrived && clash(aheadOf(h.by, 400), aheadOf(h.who, 220))) return true;
      cmd(h.who, {type:"RELEASE"}); lg("INFO", "traffic", "양보 해제 robot=" + nameOf(h.who) + " → 주행 재개"); return false;
    });
  }
  // 서버가 id를 보낼 때: 같은 구간을 지나갈 순찰 로봇을 잠시 세워 우선 통행시킨다 (후진 없음)
  function planYield(id, why){
    var mine = pieceEdges(SV.plan[id].pieces);
    lg("INFO", "traffic", "구간 예약 robot=" + nameOf(id) + " path=" + pathText(SV.plan[id].pieces));
    Object.keys(SV.view).forEach(function(o){
      var v = SV.view[o], p = SV.plan[o];
      if (o === id || !p || p.kind !== "patrol" || v.hold || v.stop === "heat") return;
      var c = clash(mine, aheadOf(o, 220)); if (!c) return;
      cmd(o, {type:"HOLD", by:nameOf(id)}); lg("INFO", "traffic", "양보 지시 robot=" + nameOf(o) + " wait=현 위치 conflict=" + edgeName(c) + " reason=" + why + " 우선");
      v.hold = true; SV.holds.push({who:o, by:id});
    });
  }
  function startRelay(from){
    var v = SV.view[from], to = Object.keys(SV.view).filter(function(id){ return SV.view[id].task === "idle" && SV.view[id].bat >= 50; })[0];
    if (!to) return;
    chapter(3);
    var meet = backAlong(PATROLS.A.segs, v.i, v.s, 40), mp = pt(PATROLS.A.segs[meet.i].d, meet.s);
    SV.relay = {from:from, to:to, meet:meet, holdAt:{x:v.x, y:v.y}, hold:{i:v.i, s:v.s}};
    lg("INFO", "dispatch", "교대 결정 from=" + nameOf(from) + " battery=" + Math.round(v.bat) + "% to=" + nameOf(to) + " role=외곽 progress=구간 " + (PATROLS.A.segs[v.i].st + 1) + "/" + PATROLS.A.steps.length);
    cmd(from, {type:"HOLD", by:"교대"});
    var rt = smartRoute(to, SV.view[to].x, SV.view[to].y, [mp.x, mp.y]);
    sendGo(to, rt, "relay", "relay");
    lg("INFO", "dispatch", "인수 위치 지정 robot=" + nameOf(to) + " meet=" + nameOf(from) + " 뒤 40cm (" + Math.round(mp.x) + "," + Math.round(mp.y) + ")");
    planYield(to, "교대");
  }
  function handOver(){
    var rl = SV.relay; rl.met = true;
    lg("INFO", "dispatch", "인수인계 완료 from=" + nameOf(rl.from) + " to=" + nameOf(rl.to) + " role=외곽 progress=구간 " + (PATROLS.A.segs[rl.hold.i].st + 1) + "/" + PATROLS.A.steps.length);
    // 받는 로봇이 뒤에 붙어 있으므로 A는 후진 없이 진행 방향 그대로 돌아 도크 충전 자리로
    var segs = PATROLS.A.segs, pieces = [{d:segs[rl.hold.i].d, s0:rl.hold.s, s1:len(segs[rl.hold.i].d)}];
    for (var k = rl.hold.i + 1; k < segs.length; k++) pieces.push({d:segs[k].d, s0:0, s1:len(segs[k].d)});
    var tail = "M65 365 L115 402 H205"; pieces.push({d:tail, s0:0, s1:len(tail)});
    var L = pieces.reduce(function(t, p){ return t + Math.abs(p.s1 - p.s0); }, 0);
    sendGo(rl.from, {pieces:pieces, L:L}, "dock", "dock");
  }
  var WAIT_PT = [300, 255]; // 대기 지점: 2번 간선 동쪽 — 위험 구역과 비상구 동선을 비껴선 위치
  function evadeOthers(h){ // 의심 구역 250cm 안으로 들어올 순찰 로봇은 대기 지점으로 보내 세워 둔다
    Object.keys(SV.plan).forEach(function(id){
      var p = SV.plan[id], v = SV.view[id]; if (id === h.first || !p || p.kind !== "patrol" || !v || v.stop === "heat") return;
      var segs = PATROLS[p.route].segs, near = false;
      for (var d = 0; d <= 250 && !near; d += 10){ var q = forwardAlong(segs, v.i, v.s, d); if (Math.hypot(q.x - h.x, q.y - h.y) < 55) near = true; }
      if (!near) return;
      var rt = smartRoute(id, v.x, v.y, WAIT_PT, [{x:h.x, y:h.y}]);
      if (rt.L === Infinity){ lg("INFO", "traffic", "위험 구역 접근 금지 robot=" + nameOf(id) + " zone=" + h.zone + " → 갈 길이 없어 현 위치 대기"); cmd(id, {type:"HOLD", by:"위험 구역"}); SV.plan[id] = {kind:"hold"}; return; }
      lg("INFO", "traffic", "위험 구역 접근 금지 robot=" + nameOf(id) + " zone=" + h.zone + " → 대기 지점(2번 간선 동쪽) length=" + Math.round(rt.L) + "cm");
      sendGo(id, rt, "evade", p.role); planYield(id, "위험 구역 회피");
    });
  }
  function forwardAlong(segs, i, s, d){ // 순찰 경로에서 d만큼 앞
    var guard = 0;
    while (d > 0 && guard++ < 30){
      if (!segs[i].d){ i = (i + 1) % segs.length; s = 0; continue; }
      var L = len(segs[i].d);
      if (L - s >= d){ s += d; d = 0; } else { d -= L - s; i = (i + 1) % segs.length; s = 0; }
    }
    while (!segs[i].d){ i = (i + 1) % segs.length; s = 0; } // 허가 · 멈춤 칸은 위치가 없으니 다음 선으로
    return pt(segs[i].d, s);
  }
  function dispatchCheck(){
    var h = SV.ev.heat, v0 = SV.view[h.first];
    // 교차 확인 지점: 한 방향 동선에 맞춰 열원의 다른 접근로 반대편(A1·A2 통로 ↔ 위쪽 외곽)
    var tp = v0.y < 38 ? {x:145, y:55} : {x:124, y:25};
    var pick = null;
    Object.keys(SV.view).filter(function(id){ return SV.view[id].task === "idle"; }).forEach(function(id){
      var v = SV.view[id];
      if (v.bat < 50){ lg("DEBUG", "dispatch", "교차 확인 후보 제외 robot=" + nameOf(id) + " battery=" + Math.round(v.bat) + "%"); return; }
      if (!pick || dist(v, tp) < dist(SV.view[pick], tp)) pick = id;
    });
    lg("INFO", "dispatch", "교차 확인 지시 robot=" + nameOf(pick) + " target=(" + Math.round(tp.x) + "," + Math.round(tp.y) + ") = 반대편 접근로에서 온도·불꽃 재확인");
    SV.pendGo = {id:pick, tgt:[tp.x, tp.y], purpose:"check", role:"check", why:"교차 확인", since:T, logged:false};
  }
  function tryPendGo(){ // 순찰 로봇과 마주치지 않는 길이 생기면 출발 (20초 넘게 안 생기면 양보시키고 출발)
    var g = SV.pendGo; if (!g) return;
    var v = SV.view[g.id], rt = smartRoute(g.id, v.x, v.y, g.tgt), c = rt.L < Infinity ? clash(pieceEdges(rt.pieces), movingUse(g.id)) : true;
    if (c && T - g.since < 20){ if (!g.logged){ g.logged = true; lg("INFO", "traffic", "출동 대기 robot=" + nameOf(g.id) + " reason=" + (rt.L < Infinity ? "순찰 로봇이 " + edgeName(c) + " 반대 방향으로 지나는 중" : "갈 수 있는 길 없음")); } return; }
    SV.pendGo = null;
    lg("INFO", "dispatch", "출동 robot=" + nameOf(g.id) + " purpose=" + PURPOSE_LOG[g.purpose] + " length=" + Math.round(rt.L) + "cm");
    sendGo(g.id, rt, g.purpose, g.role); planYield(g.id, g.why);
  }
  function confirmFire(){
    if (SV.ev.heat.confirmed) return; SV.ev.heat.confirmed = true;
    lg("CRITICAL", "event", "화재 확정 zone=" + SV.ev.heat.zone + " → 순찰 중단 · 대피 안내 모드");
    WORLD.heat.big = true; flags.fireT = T;
  }
  var DIR_TXT = {E:"→", W:"←", N:"↑", S:"↓"};
  function symText(sym){ return Array.isArray(sym) ? sym.map(function(d){ return DIR_TXT[d]; }).join("") : sym; }
  function guideDirs(p0, fireXY){ // 사람 대피 기준: 이 자리에서 안전한 비상구(C1_E → 비상구 2)까지 최단 동선의 처음 두 방향
    var rt = route(p0.x, p0.y, "C1_E", null, [fireXY], true), runs = [];
    if (rt.L === Infinity) return null;
    var P = [[p0.x, p0.y]]; rt.pieces.forEach(function(pc){ var span = Math.abs(pc.s1 - pc.s0), sg = pc.s1 > pc.s0 ? 1 : -1; for (var u = 0; u <= span; u += 4){ var q = pt(pc.d, pc.s0 + sg * u); P.push([q.x, q.y]); } });
    P.push([410, 135]); // 1번 간선 동쪽 끝에서 비상구 2로
    for (var i = 1; i < P.length; i++){
      var dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1], d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : (dy > 0 ? "S" : "N"), l = Math.hypot(dx, dy);
      if (runs.length && runs[runs.length - 1].d === d) runs[runs.length - 1].l += l; else runs.push({d:d, l:l});
    }
    var main = runs.filter(function(r){ return r.l >= 40; }), out = [];
    main.forEach(function(r){ if (!out.length || out[out.length - 1] !== r.d) out.push(r.d); });
    return out.length ? out.slice(0, 2) : ["E"];
  }
  function startFire(){
    spotG.setAttribute("display", "inline");
    var ids = ["A", "B", "3", "4"], best = null, Lm = {}, Em = {};
    ids.forEach(function(id){
      var v = SV.view[id], stops = ids.filter(function(o){ return o !== id; }).map(function(o){ return SV.view[o]; });
      Lm[id] = SPOTS.map(function(s){ return route(v.x, v.y, s.node, null, stops); }); Em[id] = Lm[id].map(function(rt){ return pieceEdges(rt.pieces); });
    });
    (function perm(arr, used){ // 4대 × 4자리: 마지막 도착이 가장 빠른 한 방향 배정
      if (arr.length === 4){
        var worst = 0, sum = 0, cf = 0;
        var none = 0;
        arr.forEach(function(k, i){ var L = Lm[ids[i]][k].L; if (L === Infinity){ none++; return; } worst = Math.max(worst, L); sum += L; for (var j = i + 1; j < 4; j++) if (clash(Em[ids[i]][k], Em[ids[j]][arr[j]])) cf++; });
        cf += none * 100;
        if (!best || cf < best.cf || (cf === best.cf && (worst < best.worst - 1e-6 || (Math.abs(worst - best.worst) < 1e-6 && sum < best.sum)))) best = {a:arr.slice(), worst:worst, sum:sum, cf:cf};
        return;
      }
      for (var k = 0; k < 4; k++) if (!used[k]){ used[k] = true; arr.push(k); perm(arr, used); arr.pop(); used[k] = false; }
    })([], {});
    lg("INFO", "dispatch", "갈림길 배정 " + ids.map(function(id, i){ return SPOTS[best.a[i]].no + "=" + nameOf(id); }).join(" ") + " conflicts=" + (best.cf % 100) + " no_path=" + Math.floor(best.cf / 100) + " worst=" + Math.round(best.worst) + "cm");
    SV.holds = []; SV.mode = "evac"; SV.pendGo = null;
    var fireXY = {x:SV.ev.heat.x, y:SV.ev.heat.y};
    SV.fireXY = fireXY; SV.guide = {};
    SPOTS.forEach(function(sp){ sp.sym = sp.node === "C1_W" ? "✕" : guideDirs(NODE_POS[sp.node], fireXY); });
    lg("INFO", "dispatch", "자리별 표시 " + SPOTS.map(function(sp){ return sp.no + "=" + symText(sp.sym); }).join(" ") + " (길이 꺾이면 꺾인 화살표)");
    ids.forEach(function(id, i){
      var rt = Lm[id][best.a[i]], sp = SPOTS[best.a[i]];
      // 도착 전부터 서버가 아는 지금 위치 기준으로 안내한다 (✕는 ① 자리에 섰을 때만)
      var now = guideDirs(SV.view[id], fireXY) || (sp.sym === "✕" ? "" : sp.sym);
      SV.guide[id] = {spot:sp, last:symText(now)};
      if (rt.L === Infinity){ lg("WARNING", "dispatch", "갈 수 있는 길 없음 robot=" + nameOf(id) + " → 현 위치에서 안내"); sendGo(id, {pieces:[], L:0}, "guide", "guide", now); }
      else sendGo(id, rt, "guide", "guide", now);
    });
    WORLD.people.on = true; WORLD.people.t0 = T;
    lg("INFO", "dispatch", "이동 중 표시 " + ids.map(function(id){ return nameOf(id) + "=" + SV.guide[id].last; }).join(" ") + " (위치가 바뀌면 다시 계산)");
    lg("INFO", "alert", "대피 방송 · 비상구 2로 안내");
  }

  /* ================= 그리기 ================= */
  var svg = document.getElementById("sim");
  svg.innerHTML = '' +
    '<rect x="0" y="0" width="410" height="435" fill="#fff"/>' +
    '<path d="M0 120 V0 H410 V120 M410 150 V435 H0 V150" fill="none" stroke="#111" stroke-width="2"/>' +
    '<g fill="#e9ecef" stroke="#111" stroke-width=".8">' +
      '<rect x="45" y="45" width="80" height="60"/><rect x="165" y="45" width="80" height="60"/><rect x="285" y="45" width="80" height="60"/>' +
      '<rect x="45" y="165" width="140" height="60"/><rect x="225" y="165" width="140" height="60"/>' +
      '<rect x="45" y="285" width="140" height="60"/><rect x="225" y="285" width="140" height="60"/>' +
    '</g>' +
    '<g class="t" font-size="6.5" text-anchor="middle">' +
      '<text x="85" y="78">A1</text><text x="205" y="78">A2</text><text x="325" y="78">A3</text>' +
      '<text x="115" y="198">B1</text><text x="295" y="198">B2</text>' +
      '<text x="115" y="318">C1</text><text x="295" y="318">C2</text>' +
    '</g>' +
    '<rect x="76" y="374" width="78" height="56" fill="none" stroke="#111" stroke-width="1" stroke-dasharray="3 2"/>' +
    '<text class="t" x="115" y="396" font-size="5.5" text-anchor="middle">도크</text>';
  var ex1 = el("text", {"class":"t", x:-4, y:138, "font-size":6, "text-anchor":"end", "font-weight":700}, "비상구 1");
  var ex2 = el("text", {"class":"t", x:414, y:138, "font-size":6, "font-weight":700}, "비상구 2");
  svg.appendChild(ex1); svg.appendChild(ex2);
  var hl = el("g", {fill:"none", "stroke-width":11, "stroke-linejoin":"round", "stroke-linecap":"round", opacity:.14});
  hl.appendChild(el("path", {d:A_LOOP, stroke:"#1971c2"}));
  [B_CORR1, B_CORR2, AISLE_A12, AISLE_A23, AISLE_B12, AISLE_C12].forEach(function(d){ hl.appendChild(el("path", {d:d, stroke:"#2f9e44"})); });
  svg.appendChild(hl);
  var MCOL = {red:"#e03131", yellow:"#f2c94c", green:"#40c057"};
  MARKERS.forEach(function(m){ var nx = m.ty, ny = -m.tx, h = m.c === "red" ? 16 : 7, w = m.c === "red" ? 4 : 3;
    svg.appendChild(el("line", {x1:m.x - nx * h, y1:m.y - ny * h, x2:m.x + nx * h, y2:m.y + ny * h, stroke:MCOL[m.c], "stroke-width":w})); });
  var ln = el("g", {fill:"none", stroke:"#111", "stroke-width":2, "stroke-linejoin":"round"});
  [A_LOOP, B_CORR1, B_CORR2, AISLE_A12, AISLE_A23, AISLE_B12, AISLE_C12].forEach(function(d){ ln.appendChild(el("path", {d:d})); });
  svg.appendChild(ln);
  // 마커 이름은 띠 · 선과 겹치지 않는 빈 자리에 (흰 테두리로 위에 지나가는 것과도 구분)
  var HALO = {stroke:"#fff", "stroke-width":2, "paint-order":"stroke"};
  var lb = el("g", Object.assign({"class":"t", "font-size":5.5, "text-anchor":"middle"}, HALO));
  [["CP5", 33, 184, "start"], ["CP6", 100, 118], ["CP7", 224, 15], ["CP8", 250, 240]].forEach(function(c){ lb.appendChild(el("text", {x:c[1], y:c[2], "text-anchor":c[3] || "middle"}, c[0])); });
  svg.appendChild(lb);
  var spotG = el("g", {display:"none"});
  [["①", 50, 135], ["②", 360, 135], ["③", 230, 255], ["④", 205, 25]].forEach(function(s){
    spotG.appendChild(el("circle", {cx:s[1], cy:s[2], r:9, fill:"none", stroke:"#2f9e44", "stroke-width":1, "stroke-dasharray":"2 2"}));
    spotG.appendChild(el("text", Object.assign({"class":"t", x:s[1], y:s[2] + 19, "font-size":6, "font-weight":700, "text-anchor":"middle"}, HALO), s[0]));
  });
  svg.appendChild(spotG);
  // 소품은 위에서 내려다본 미니어처 무대 모습: 골판지 박스 · 드라이버 · 가스버너(화재 때는 불꽃 여러 개)
  var defs = el("defs", {}), glowG = el("radialGradient", {id:"sim-glow"});
  glowG.appendChild(el("stop", {offset:"0", "stop-color":"#ff6b00", "stop-opacity":.55})); glowG.appendChild(el("stop", {offset:"1", "stop-color":"#ff6b00", "stop-opacity":0}));
  defs.appendChild(glowG); svg.appendChild(defs);
  var boxG = el("g", {display:"none"});
  boxG.appendChild(el("rect", {x:293.2, y:128.2, width:16, height:16, rx:.6, fill:"#000", opacity:.18}));
  boxG.appendChild(el("rect", {x:292, y:127, width:16, height:16, rx:.6, fill:"#c8a26b", stroke:"#6d4c2f", "stroke-width":.7}));
  boxG.appendChild(el("path", {d:"M292 135 H308", stroke:"#8d6e45", "stroke-width":.5}));
  boxG.appendChild(el("rect", {x:298.6, y:127, width:2.8, height:16, fill:"#e9d8b4", opacity:.9}));
  boxG.appendChild(el("text", {"class":"t", x:300, y:153, "font-size":5.5, "text-anchor":"middle"}, "박스"));
  var itemG = el("g", {display:"none", transform:"translate(230 14)"});
  var drv = el("g", {transform:"rotate(-20)"});
  drv.appendChild(el("rect", {x:-5.5, y:-1.4, width:11, height:3.4, rx:1.4, fill:"#000", opacity:.15}));
  drv.appendChild(el("rect", {x:-6, y:-1.8, width:5.5, height:3.6, rx:1.5, fill:"#f76707", stroke:"#111", "stroke-width":.4}));
  drv.appendChild(el("path", {d:"M-5.2 -.6 H-1.3 M-5.2 .6 H-1.3", stroke:"#d9480f", "stroke-width":.4}));
  drv.appendChild(el("rect", {x:-.5, y:-.45, width:5.2, height:.9, fill:"#adb5bd", stroke:"#495057", "stroke-width":.25}));
  drv.appendChild(el("path", {d:"M4.7 -.7 L5.8 0 L4.7 .7 Z", fill:"#868e96"}));
  itemG.appendChild(drv);
  var itemLbl = el("text", {"class":"t", y:-5, "font-size":5.5, "text-anchor":"middle"}, "바닥 물건");
  itemG.appendChild(itemLbl); svg.appendChild(itemG);
  var FLAME = "M0 -6 C1.7 -3.6 2.1 -1.6 0 0 C-2.1 -1.6 -1.7 -3.6 0 -6 Z";
  function makeFlame(){ var g = el("g", {}); g.appendChild(el("path", {d:FLAME, fill:"#fd7e14"})); g.appendChild(el("path", {d:FLAME, fill:"#ffd43b", transform:"translate(0 -.4) scale(.55)"})); return g; }
  var heatG = el("g", {display:"none", transform:"translate(124 48)"});
  var heatGlow = el("circle", {r:9, fill:"url(#sim-glow)"});
  var burner = el("g", {});
  burner.appendChild(el("rect", {x:-4.2, y:-3.2, width:8.4, height:6.4, rx:1, fill:"#495057", stroke:"#212529", "stroke-width":.5}));
  burner.appendChild(el("circle", {cx:-.6, cy:0, r:2.4, fill:"#212529"}));
  burner.appendChild(el("circle", {cx:-.6, cy:0, r:1.2, fill:"#4dabf7", opacity:.85}));
  var cFlame = makeFlame(); burner.appendChild(cFlame);
  var fireG = el("g", {}), FIRE = [[-4.5, 2.5, 1.4, 0], [4.5, 2, 1.3, 2.1], [0, 1, 2.1, 4.2], [-1.8, 3.5, 1, 1.3], [2.2, 3.8, 1, 3.3]];
  var fireF = FIRE.map(function(){ var f = makeFlame(); fireG.appendChild(f); return f; });
  fireF.forEach(function(f){ f.firstChild.setAttribute("fill", "#f03e3e"); });
  var heatLbl = el("text", {"class":"t", y:-11, "font-size":5.5, "text-anchor":"middle", "font-weight":700, fill:"#e03131"}, "과열");
  [heatGlow, burner, fireG, heatLbl].forEach(function(e){ heatG.appendChild(e); });
  [boxG, heatG].forEach(function(g){ svg.appendChild(g); });
  function makeBot(label){
    var g = el("g", {}), body = el("g", {});
    var shell = el("rect", {x:-13.5, y:-6.5, width:27, height:13, rx:2, fill:"#2b3640", "stroke-width":1.4});
    // 바닥 카메라가 보는 곳 (머리 끝에서 비스듬히 내려다본 앞 바닥)
    body.appendChild(el("path", {d:"M13.5 0 L" + (CAM_AHEAD - CAM_D) + " 0", stroke:"#e67700", "stroke-width":.6, "stroke-dasharray":"1.5 1"}));
    body.appendChild(el("rect", {x:CAM_AHEAD - CAM_D, y:-CAM_W, width:CAM_D * 2, height:CAM_W * 2, fill:"#fab005", "fill-opacity":.45, stroke:"#e67700", "stroke-width":.6}));
    body.appendChild(shell); body.appendChild(el("path", {d:"M8 -3 L12 0 L8 3 Z", fill:"#fff"}));
    g.appendChild(body);
    var tx = el("text", {"text-anchor":"middle", "font-size":7, fill:"#fff", "font-family":"Consolas, monospace", "font-weight":700}, label);
    g.appendChild(tx);
    var bub = el("g", {display:"none"});
    var bubR = el("rect", {x:-8, y:-9, width:16, height:12, rx:2});
    var bubT = el("text", {"text-anchor":"middle", y:0.5, "font-size":9, "font-weight":700, fill:"#fff"});
    var bubA = el("path", {fill:"none", stroke:"#fff", "stroke-width":1.6, "stroke-linejoin":"round", "stroke-linecap":"round"}), bubH = el("path", {fill:"#fff"});
    bub.appendChild(bubR); bub.appendChild(bubT); bub.appendChild(bubA); bub.appendChild(bubH); g.appendChild(bub);
    svg.appendChild(g);
    return {body:body, shell:shell, text:tx, bub:bub, bubR:bubR, bubT:bubT, bubA:bubA, bubH:bubH};
  }
  var ROLE_COLOR = {outer:"#1971c2", relay:"#1971c2", corr:"#2f9e44"};
  function placeBot(bot, pose, role, sym){
    var ang = Math.atan2(pose.hy, pose.hx) * 180 / Math.PI;
    bot.body.setAttribute("transform", "translate(" + pose.x.toFixed(1) + " " + pose.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");
    bot.shell.setAttribute("stroke", ROLE_COLOR[role] || "#868e96");
    bot.text.setAttribute("x", pose.x.toFixed(1)); bot.text.setAttribute("y", (pose.y + 2.4).toFixed(1));
    if (Array.isArray(sym) && !sym.length) sym = "";
    bot.bub.setAttribute("display", sym ? "inline" : "none");
    if (sym){
      bot.bub.setAttribute("transform", "translate(" + pose.x.toFixed(1) + " " + (pose.y - 10).toFixed(1) + ")");
      bot.bubR.setAttribute("fill", sym === "✕" || sym === "!" ? "#e03131" : "#2f9e44");
      if (Array.isArray(sym)){ // 화살표를 그린다: 한 방향이면 곧은 화살표, 두 방향이면 꺾인 화살표
        var V2 = {E:[1, 0], W:[-1, 0], N:[0, -1], S:[0, 1]}, a = V2[sym[0]], b = V2[sym[1] || sym[0]], two = sym.length > 1;
        var p1 = two ? [-a[0] * 3 - b[0] * 3, -a[1] * 3 - b[1] * 3 - 3] : [-a[0] * 5, -a[1] * 5 - 3];
        var p2 = two ? [p1[0] + a[0] * 6, p1[1] + a[1] * 6] : p1, p3 = two ? [p2[0] + b[0] * 5, p2[1] + b[1] * 5] : [p1[0] + a[0] * 8, p1[1] + a[1] * 8];
        bot.bubA.setAttribute("d", "M" + p1 + " L" + p2 + " L" + p3);
        var hx = b[0], hy = b[1], tip = [p3[0] + hx * 2.5, p3[1] + hy * 2.5];
        bot.bubH.setAttribute("d", "M" + tip + " L" + [p3[0] - hy * 2.5, p3[1] + hx * 2.5] + " L" + [p3[0] + hy * 2.5, p3[1] - hx * 2.5] + " Z");
        bot.bubT.textContent = "";
      } else { bot.bubA.setAttribute("d", ""); bot.bubH.setAttribute("d", ""); bot.bubT.textContent = sym; }
    }
  }
  // 사람(위에서 본 모습): 어깨 · 머리(안전모)가 걷는 방향을 본다. 작업자는 형광 조끼 + 반사띠, 관리자는 남색 옷 + 흰 안전모
  function makePerson(g, wear, hat, stripe){
    var b = el("g", {});
    b.appendChild(el("ellipse", {cx:-.4, cy:0, rx:2.7, ry:4.6, fill:wear, stroke:"#111", "stroke-width":.6}));
    if (stripe) b.appendChild(el("path", {d:"M-1.8 -4 V4", stroke:"#e9ecef", "stroke-width":.9}));
    b.appendChild(el("circle", {cx:.7, cy:0, r:2.2, fill:hat, stroke:"#111", "stroke-width":.6}));
    g.appendChild(b); g.body = b; svg.appendChild(g); return g;
  }
  function faceAlong(g, P, d, back){ // 동선 P의 d 지점에서 걷는 방향으로 돌린다 (back: 되돌아가는 중)
    var L = plen(P), a = along(P, Math.max(0, Math.min(L, d) - .5)), b = along(P, Math.min(L, Math.max(.5, d) + .5));
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + (back ? 180 : 0);
    g.body.setAttribute("transform", "rotate(" + ang.toFixed(0) + ") scale(1.3)");
  }
  var mgrG = makePerson(el("g", {display:"none"}), "#364fc7", "#fff", false);
  mgrG.appendChild(el("text", {"class":"t", x:7.5, y:2, "font-size":5.5}, "관리자")); // 옆에 둬야 박스 · 물건 이름과 안 겹침
  var wkG = [0, 1, 2].map(function(){ return makePerson(el("g", {display:"none"}), "#c0eb75", "#fcc419", true); });
  // 서버가 추정한 위치 (점선 원): 로봇은 자기 좌표를 모르고, 서버가 마커와 움직인 시간으로 추정해 저장한다
  var GHOST = {}; ["A", "B", "3", "4"].forEach(function(id){ GHOST[id] = el("circle", {r:9, fill:"none", stroke:"#868e96", "stroke-width":1, "stroke-dasharray":"2 2", display:"none"}); svg.appendChild(GHOST[id]); });
  var BOTS = {A:makeBot("A"), B:makeBot("B"), "3":makeBot("3"), "4":makeBot("4")};

  /* ================= 로그 (Day11 원칙) ================= */
  var LV = {DEBUG:10, INFO:20, WARNING:30, ERROR:40, CRITICAL:50};
  var minLv = 20;
  var logEl = document.getElementById("sim-log"), lvSel = document.getElementById("log-level");
  // 디버그: 서버 추정 위치(점선 원)는 헷갈려서 기본은 숨김 · 체크하면 표시
  var ghostOn = document.getElementById("ghost-on");
  ghostOn.addEventListener("change", function(){ draw(); });
  function stamp(t){ // 14:30:00 기준 시뮬레이션 시각 (asctime 모양)
    var ms = Math.round(t * 1000), s = 14 * 3600 + 30 * 60 + Math.floor(ms / 1000);
    function p2(v){ return String(v).padStart(2, "0"); }
    return p2(Math.floor(s / 3600)) + ":" + p2(Math.floor(s / 60) % 60) + ":" + p2(s % 60) + "," + String(ms % 1000).padStart(3, "0");
  }
  function addLi(li){ logEl.appendChild(li); if (!li.hidden) logEl.scrollTop = logEl.scrollHeight; }
  function log(lv, name, msg){
    // 시각 | 레벨 | 내용(로거 이름 + 메시지) 3칸: 내용이 길면 내용 칸 안에서만 줄바꿈 (내어쓰기)
    var li = document.createElement("li"), a = document.createElement("time"), b = document.createElement("b"), body = document.createElement("span"), c = document.createElement("span");
    a.textContent = stamp(T); b.textContent = lv; b.className = "lv " + lv; body.className = "msg"; c.className = "nm"; c.textContent = name;
    body.appendChild(c); body.appendChild(document.createTextNode(" " + msg));
    li.setAttribute("data-lv", LV[lv]); li.hidden = LV[lv] < minLv;
    li.appendChild(a); li.appendChild(b); li.appendChild(body);
    addLi(li);
  }
  function note(text, cls){ var li = document.createElement("li"); li.className = cls || "note"; li.textContent = text; addLi(li); }
  lvSel.addEventListener("change", function(){
    minLv = +lvSel.value;
    [].slice.call(logEl.children).forEach(function(li){ var v = li.getAttribute("data-lv"); if (v) li.hidden = +v < minLv; });
    logEl.scrollTop = logEl.scrollHeight;
  });

  /* ================= 시나리오 (세계에 소품을 놓고 치우는 쪽) ================= */
  var ROBOTS, dir, flags, playing;
  var CHAPTERS = ["평상시 순찰", "바닥 물건", "막힘 발견", "충전 교대", "과열 교차 확인", "화재 대피 안내"];
  var CHTXT = [
    "<b>1 평상시 순찰</b> · A는 외곽(큰 바퀴), B는 1·2번 간선과 블록 사이 통로, 3·4호는 도크 충전 대기. 전진 한 방향으로 돌며 합류점에선 A 우선으로 양보한다.",
    "<b>2 바닥 물건</b> · 위쪽 외곽 바닥에 공구. 초음파엔 안 잡히고 A의 바닥 카메라가 본다. A는 순찰을 계속하고 서버가 '밟힘 주의'로 관리자 호출 → 치우고 체크하면 해제.",
    "<b>3 막힘 발견</b> · 1번 간선에 박스. B가 초음파로 멈춰 보고하고 머리 카메라 사진을 전송 → 대시보드 지도 구역·사진 팝업 알림 → 치우고 B가 다시 지나가면 해소.",
    "<b>4 충전 교대</b> · A 배터리 부족. 서버가 A를 세우고 3호를 A 뒤 40cm로 보냄 → 인수인계 → A는 진행 방향 그대로 도크로 복귀, 3호가 A의 진행 위치부터 이어 돎.",
    "<b>5 과열 교차 확인</b> · A1 랙 오른쪽 위 모서리 과열(가스버너). 지나던 로봇이 온도·머리 카메라 불꽃 확인 후 정지 → 서버가 대기 로봇을 반대편 접근로로 보내 재확인 → 둘 다 50℃ 초과·불꽃 확인 시 화재 확정.",
    "<b>6 화재 대피 안내</b> · 4대를 갈림길 ①~④에 배정. 출발부터 LED를 켜고 사람 대피 동선 기준으로 화살표 갱신 (꺾이면 꺾인 화살표) · ✕는 ① 자리에서."
  ];
  var statusEl = document.getElementById("sim-status"), chEl = document.getElementById("sim-chapter"), clockEl = document.getElementById("sim-clock");
  var chBtns = [].slice.call(document.querySelectorAll("#sim-ch button"));
  function fmt(t){ return Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0"); }
  function chapter(k){ if (dir.ch >= k) return; dir.ch = k; note("─ 장면 " + (k + 1) + " " + CHAPTERS[k]); }
  function callManager(kind){ var m = WORLD.mgr; m.kind = kind; m.P = kind === "item" ? MGR_P2 : MGR_P; m.state = "in"; }

  function reset(){
    T = 0; BUS = []; SV = newServer();
    WORLD = {box:{on:false, x:300, y:135}, heat:{on:false, x:124, y:48, H:62, big:false}, item:{on:false, x:230, y:14}, mgr:{state:"off", d:0, t:0, P:MGR_P, kind:"box"}, people:{on:false, t0:0}};
    var a0 = PATROLS.A.segs[0], b0 = PATROLS.B.segs[PATROLS.B.segs.length - 1];
    ROBOTS = {A:new Robot("A", pt(a0.d, 0), 37), B:new Robot("B", pt(b0.d, len(b0.d) - 40), 82), "3":new Robot("3", SLOT[0], 100), "4":new Robot("4", SLOT[1], 100)};
    ["A", "B", "3", "4"].forEach(function(id){ var p = ROBOTS[id].pose; ROBOTS[id].pose = {x:p.x, y:p.y, hx:p.hx != null ? p.hx : p.tx, hy:p.hy != null ? p.hy : p.ty}; });
    dir = {ch:0, end:false}; flags = {};
    logEl.textContent = "";
    note("─ 장면 1 " + CHAPTERS[0]);
    lg("INFO", "", "관제 서버 시작 robots=4 report=0.5s latency=0.15s");
    // 첫 명령: A 외곽, B 간선(도크 안 40cm 뒤에서), 3·4호 대기
    // 처음 배치는 운영자가 서버에 입력해 둔 것 (A 도크 출구, B 도크 안, 3·4호 충전 자리)
    ["A", "B", "3", "4"].forEach(function(id){ SV.st[id] = {track:null, prog:0, moving:0, lastT:0, task:"idle", role:"standby", stop:"", hold:false, arrived:false, bat:ROBOTS[id].bat, park:id === "4" ? SLOT[1] : SLOT[0]}; });
    sendPatrol("A", "A", "outer", 0, 0, true);
    sendPatrol("B", "B", "corr", PATROLS.B.segs.length - 1, len(b0.d) - 40, false);
    ["3", "4"].forEach(function(id){ ROBOTS[id].report(true); });
    draw();
  }
  function direct(){
    var B = ROBOTS.B;
    if (dir.ch === 0 && T >= 10){ chapter(1); WORLD.item.on = true; note("[연출] 위쪽 외곽 통로 바닥에 공구가 떨어짐", "stage"); }
    if (dir.ch === 1 && flags.itemDone && T >= 15 && B.task === "patrol" && (B.segs[B.i].st === 1 || B.segs[B.i].st === 3) && B.pose.x < 255){ chapter(2); WORLD.box.on = true; note("[연출] 1번 간선 동쪽에 박스(적치물)가 놓임", "stage"); }
    // 관리자: 호출되면 걸어와 확인하고 치운 뒤 관제 대시보드에서 체크 (서버로 RESOLVE)
    var m = WORLD.mgr;
    var what = m.kind === "item" ? "바닥 물건" : "박스";
    if (m.state === "in" && (m.d += 40 * DT) >= plen(m.P)){ m.d = plen(m.P); m.state = "stand"; m.t = T; note("[연출] 관리자 도착 · " + what + " 확인", "stage"); }
    if (m.state === "stand" && T - m.t >= 3){
      if (m.kind === "item") WORLD.item.on = false; else WORLD.box.on = false;
      m.state = "out"; note("[연출] 관리자가 " + (m.kind === "item" ? "바닥 물건을" : "박스를") + " 치우고 관제 대시보드에서 체크", "stage"); send("server", {type:"RESOLVE", ev:m.kind === "item" ? "item" : "obstacle"});
    }
    if (m.state === "out" && (m.d -= 40 * DT) <= 0){ m.d = 0; m.state = "off"; }
    if (dir.ch === 3 && flags.docked && T - flags.docked >= 2 && !WORLD.heat.on){ chapter(4); WORLD.heat.on = true; note("[연출] A1 랙 오른쪽 위 모서리에 과열 발생 (실외 시험 기준: 가스버너)", "stage"); }
    if (WORLD.heat.on) WORLD.heat.H += 3 * DT;
    if (flags.fireT && !flags.evac && T - flags.fireT >= 1.5){ flags.evac = true; chapter(5); startFire(); }
    if (flags.evac && !dir.end){
      var gone = WORKERS.every(function(P, i){ return (T - (WORLD.people.t0 + 1.5 + i * 0.4)) * 22 > plen(P); });
      if (gone && !flags.allOut){ flags.allOut = T; lg("INFO", "event", "대피 완료 exit=비상구 2 people=3"); }
      var allSet = Object.keys(ROBOTS).every(function(id){ return ROBOTS[id].task === "go" && ROBOTS[id].arrived; });
      if (flags.allOut && T - flags.allOut >= 3 && (allSet || T - flags.allOut > 15)){ dir.end = true; note("─ 시나리오 끝"); playing = false; syncPlay(); }
    }
  }
  var DT = 0.05;
  function step(d){
    DT = d; T += d;
    deliver();
    Object.keys(ROBOTS).forEach(function(id){ ROBOTS[id].tick(d); });
    if (T - SV.tt >= 0.25){ SV.tt = T; svTick(); }
    direct();
  }

  /* ================= 화면 ================= */
  var ROLE_NAME = {outer:"외곽 담당", corr:"간선 담당", standby:"대기 · 충전", check:"과열 교차 확인", guide:"대피 안내", relay:"교대 · 인수하러", dock:"도크 복귀"};
  function statusLine(id){
    var r = ROBOTS[id], mode, detail = r.wait ? r.wait + " · " : "";
    if (r.task === "patrol"){ var sg = r.segs[r.i]; mode = r.wait ? "대기" : "전진"; detail += (sg.st + 1) + ". " + r.steps[sg.st]; }
    else if (r.task === "go"){ mode = r.arrived ? "도착" : r.wait ? "대기" : "이동"; detail += PURPOSE_LOG[r.purpose] + (r.display ? " · 표시 " + symText(r.display) : ""); }
    else { mode = "대기"; detail += "도크 옆에서 충전"; }
    return "<span><b>" + nameOf(id) + " · " + ROLE_NAME[r.role] + " · " + mode + "</b> 배터리 " + Math.round(r.bat) + "% · " + detail + "</span>";
  }
  function draw(){
    ["A", "B", "3", "4"].forEach(function(id){ var r = ROBOTS[id]; placeBot(BOTS[id], r.pose, r.role, r.display); });
    refresh(); Object.keys(GHOST).forEach(function(id){ var v = SV.view[id]; if (!v || !ghostOn.checked){ GHOST[id].setAttribute("display", "none"); return; } GHOST[id].setAttribute("display", "inline"); GHOST[id].setAttribute("cx", v.x.toFixed(1)); GHOST[id].setAttribute("cy", v.y.toFixed(1)); });
    boxG.setAttribute("display", WORLD.box.on ? "inline" : "none");
    heatG.setAttribute("display", WORLD.heat.on ? "inline" : "none");
    itemG.setAttribute("display", WORLD.item.on ? "inline" : "none"); itemLbl.textContent = SV.ev.item ? "바닥 물건 · 주의" : "바닥 물건";
    // 불꽃은 시뮬레이션 시각(T)으로 일렁인다 (정지하면 멈춤)
    var big = WORLD.heat.big;
    heatLbl.textContent = big ? "화재" : "과열"; heatLbl.setAttribute("y", big ? -19 : -11);
    burner.setAttribute("display", big ? "none" : "inline"); fireG.setAttribute("display", big ? "inline" : "none");
    heatGlow.setAttribute("r", ((big ? 18 : 9) * (1 + .08 * Math.sin(T * 5))).toFixed(2));
    cFlame.setAttribute("transform", "translate(-0.6 -0.8) scale(" + (.8 + .06 * Math.sin(T * 23)).toFixed(3) + " " + (.9 + .15 * Math.sin(T * 17)).toFixed(3) + ")");
    if (big) fireF.forEach(function(f, i){ var c = FIRE[i]; f.setAttribute("transform", "translate(" + c[0] + " " + c[1] + ") scale(" + (c[2] * (1 + .07 * Math.sin(T * 19 + c[3]))).toFixed(3) + " " + (c[2] * (1 + .18 * Math.sin(T * 13 + c[3]))).toFixed(3) + ")"); });
    if (dir.ch < 5) spotG.setAttribute("display", "none");
    var fire = dir.ch === 5;
    [[ex1, 1], [ex2, 2]].forEach(function(e){ // 화재 때는 두 줄 (한 줄이면 지도 밖으로 잘림)
      var sub = fire ? (e[1] === 2 ? "대피" : "불 쪽") : "";
      if (e[0].__sub === sub) return; e[0].__sub = sub;
      e[0].textContent = "비상구 " + e[1]; e[0].style.fill = !fire ? "#555" : e[1] === 2 ? "#2f9e44" : "#e03131";
      if (sub) e[0].appendChild(el("tspan", {x:e[0].getAttribute("x"), dy:"1.2em"}, sub));
    });
    mgrG.setAttribute("display", WORLD.mgr.state === "off" ? "none" : "inline");
    var mp = along(WORLD.mgr.P, WORLD.mgr.d); mgrG.setAttribute("transform", "translate(" + mp[0].toFixed(1) + " " + mp[1].toFixed(1) + ")"); faceAlong(mgrG, WORLD.mgr.P, WORLD.mgr.d, WORLD.mgr.state === "out");
    var wp = WORLD.people.on ? WORKERS.map(function(P, i){ var d = Math.max(0, (T - (WORLD.people.t0 + 1.5 + i * 0.4)) * 22); return d > plen(P) ? null : along(P, d); }) : [null, null, null];
    wkG.forEach(function(g, i){ if (!wp[i]){ g.setAttribute("display", "none"); return; } g.setAttribute("display", "inline"); g.setAttribute("transform", "translate(" + wp[i][0].toFixed(1) + " " + wp[i][1].toFixed(1) + ")"); faceAlong(g, WORKERS[i], (T - (WORLD.people.t0 + 1.5 + i * 0.4)) * 22); });
    statusEl.innerHTML = ["A", "B", "3", "4"].map(statusLine).join("");
    chEl.innerHTML = CHTXT[dir.ch]; clockEl.textContent = fmt(T);
    chBtns.forEach(function(b){ b.setAttribute("aria-pressed", +b.getAttribute("data-ch") === dir.ch ? "true" : "false"); });
  }

  /* ================= 조작 ================= */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var speed = 2, last = 0;
  playing = !reduce;
  var playBtn = document.getElementById("sim-play");
  function syncPlay(){ playBtn.textContent = playing ? "일시정지" : dir && dir.end ? "다시 재생" : "재생"; }
  playBtn.addEventListener("click", function(){ if (dir.end){ reset(); playing = true; } else playing = !playing; syncPlay(); });
  document.getElementById("sim-reset").addEventListener("click", function(){ reset(); syncPlay(); });
  document.getElementById("sim-speed").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    speed = +b.getAttribute("data-sp");
    this.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
  });
  // 장면으로 이동: 처음부터 그 장면이 시작될 때까지 빨리 돌린다 (로그도 그대로 쌓인다)
  chBtns.forEach(function(b){
    b.addEventListener("click", function(){
      var k = +b.getAttribute("data-ch");
      reset();
      for (var n = 0; n < 40000 && dir.ch < k && !dir.end; n++) step(0.05);
      playing = true; syncPlay(); draw();
    });
  });

  reset(); syncPlay();
  function frame(ts){
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (playing && dt > 0){ var d = dt * speed; while (d > 0){ var h = Math.min(d, 0.05); step(h); d -= h; } draw(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
