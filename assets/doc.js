// 공통 문서 동작: 모바일 카드 표 칸 이름 붙이기 + 상단 바 현재 문서 표시
(function () {
  function init() {
    // 1. 모바일 카드 표: 머리줄(전부 th) · 3칸 이상인 표에만 칸 이름을 붙여 둔다
    document.querySelectorAll("table").forEach(function (t) {
      if (!t.rows || !t.rows.length) return;
      var h = [].map.call(t.rows[0].cells, function (c) {
        return c.tagName === "TH" ? c.textContent : null;
      });
      if (h.length < 3 || h.indexOf(null) >= 0) return;
      t.classList.add("cards");
      [].slice.call(t.rows, 1).forEach(function (r) {
        [].forEach.call(r.cells, function (c, i) {
          if (!c.hasAttribute("data-l") && h[i]) {
            c.setAttribute("data-l", h[i]);
          }
        });
      });
    });

    // 2. 상단 바에서 현재 문서 링크에 aria-current="page"가 없으면 주소로 찾아 붙인다
    var nav = document.querySelector("nav.topnav");
    if (nav && !nav.querySelector("[aria-current]")) {
      var norm = function (p) {
        try { p = decodeURIComponent(p); } catch (e) {}
        return p.replace(/\/index\.html$/, "/");
      };
      var cur = norm(location.pathname);
      var links = nav.querySelectorAll("a[href]");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        try {
          var u = new URL(a.href, location.href);
          if (norm(u.pathname) === cur) {
            a.setAttribute("aria-current", "page");
            break;
          }
        } catch (e) {}
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
