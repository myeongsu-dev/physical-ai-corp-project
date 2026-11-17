/* diagram.js — 공용 화살촉 마커 삽입 및 Mermaid 흑백 테마 렌더링 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";

  function ensureArrowMarker() {
    if (document.getElementById("arrow")) return;
    var needsArrow = document.querySelector(
      "svg .ln.flow, svg .flow, svg .ln.bi, svg [marker-end*=\"#arrow\"], svg [marker-start*=\"#arrow\"]"
    );
    if (!needsArrow) return;

    var host = document.createElementNS(SVG_NS, "svg");
    host.setAttribute("class", "diagram-defs");
    host.setAttribute("width", "0");
    host.setAttribute("height", "0");
    host.setAttribute("aria-hidden", "true");

    var defs = document.createElementNS(SVG_NS, "defs");
    var marker = document.createElementNS(SVG_NS, "marker");
    marker.setAttribute("id", "arrow");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "7");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("orient", "auto-start-reverse");

    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M0 0L10 5L0 10z");
    path.setAttribute("fill", "context-stroke");

    marker.appendChild(path);
    defs.appendChild(marker);
    host.appendChild(defs);
    document.body.insertBefore(host, document.body.firstChild);
  }

  async function renderMermaid() {
    var nodes = document.querySelectorAll("pre.mermaid");
    if (!nodes.length) return;

    try {
      var mod = await import(MERMAID_CDN);
      var mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "strict",
        themeVariables: {
          fontFamily: 'system-ui, "Malgun Gothic", sans-serif',
          fontSize: "14px",
          background: "#ffffff",
          primaryColor: "#ffffff",
          primaryTextColor: "#111111",
          primaryBorderColor: "#111111",
          lineColor: "#111111",
          secondaryColor: "#f3f4f5",
          secondaryTextColor: "#111111",
          secondaryBorderColor: "#111111",
          tertiaryColor: "#ffffff",
          tertiaryTextColor: "#111111",
          tertiaryBorderColor: "#111111",
          mainBkg: "#ffffff",
          nodeBorder: "#111111",
          clusterBkg: "#f3f4f5",
          clusterBorder: "#111111",
          titleColor: "#111111",
          edgeLabelBackground: "#ffffff",
          actorBkg: "#ffffff",
          actorBorder: "#111111",
          actorTextColor: "#111111",
          actorLineColor: "#111111",
          signalColor: "#111111",
          signalTextColor: "#111111",
          labelBoxBkgColor: "#ffffff",
          labelBoxBorderColor: "#111111",
          labelTextColor: "#111111",
          loopTextColor: "#111111",
          noteBkgColor: "#f3f4f5",
          noteBorderColor: "#111111",
          noteTextColor: "#111111",
          activationBkgColor: "#f3f4f5",
          activationBorderColor: "#111111",
          sectionBkgColor: "#f3f4f5",
          altSectionBkgColor: "#ffffff",
          sectionBkgColor2: "#eceff1",
          taskBkgColor: "#ffffff",
          taskBorderColor: "#111111",
          taskTextColor: "#111111",
          taskTextDarkColor: "#111111",
          activeTaskBkgColor: "#f3f4f5",
          activeTaskBorderColor: "#111111",
          doneTaskBkgColor: "#e9ecef",
          doneTaskBorderColor: "#111111",
          critBkgColor: "#ffffff",
          critBorderColor: "#111111",
          todayLineColor: "#111111",
          gridColor: "#b8bec4",
          cScale0: "#ffffff",
          cScale1: "#f3f4f5",
          cScale2: "#eceff1",
          cScale3: "#ffffff",
          cScale4: "#f3f4f5",
          cScale5: "#eceff1",
          cScaleLabel0: "#111111",
          cScaleLabel1: "#111111",
          cScaleLabel2: "#111111",
          cScaleLabel3: "#111111",
          cScaleLabel4: "#111111",
          cScaleLabel5: "#111111"
        }
      });
      await mermaid.run({ nodes: nodes });
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Mermaid를 불러오지 못해 원문을 표시합니다.", err);
      }
    }
  }

  function init() {
    ensureArrowMarker();
    renderMermaid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
