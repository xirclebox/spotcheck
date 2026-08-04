(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__contrastDemoRecords =
        window.__contrastDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      function parseColor(str) {
        var m = str.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        var p = m[1].split(",").map(function (s) {
          return parseFloat(s);
        });
        return { r: p[0], g: p[1], b: p[2] };
      }
      function lum(c) {
        function ch(v) {
          v = v / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        }
        return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
      }
      function ratio(a, b) {
        var l1 = lum(a) + 0.05,
          l2 = lum(b) + 0.05;
        return l1 > l2 ? l1 / l2 : l2 / l1;
      }
      var lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      Array.prototype.slice
        .call(stage.querySelectorAll("p"))
        .forEach(function (p) {
          var style = getComputedStyle(p);
          var fg = parseColor(style.color),
            bg = parseColor(style.backgroundColor) || {
              r: 255,
              g: 255,
              b: 255,
            };
          var r = ratio(fg, bg);
          var level = r < 4.5 ? "red" : r < 7 ? "gold" : "green";
          var label =
            r.toFixed(2) +
            ":1, " +
            (level === "red"
              ? "fails AA"
              : level === "gold"
                ? "passes AA, not AAA"
                : "passes AAA");
          var color =
            level === "green"
              ? "#1a7d4f"
              : level === "gold"
                ? "#8b6800"
                : "#be412a";

          if (color === "#be412a") {
            p.style.outline = "6px dashed " + color;
          } else if (color === "#8b6800") {
            p.style.outline = "6px dotted " + color;
          } else {
            p.style.outline = "5px solid " + color;
          }

          p.style.outlineOffset = "3px";
          if (getComputedStyle(p).position === "static")
            p.style.position = "relative";
          var badge = document.createElement("span");
          badge.textContent = label;
          badge.setAttribute("aria-hidden", "true");
          badge.style.cssText =
            "position:absolute;top:0;left:0;transform:translateY(-100%);background:" +
            color +
            ";color:#fff;font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;padding:4px 8px;border-radius:4px;z-index:10;pointer-events:none;white-space:nowrap";
          p.insertBefore(badge, p.firstChild);
          demoRecords.push({ el: p, badge: badge });
          lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
        });
      resultsEl.innerHTML = lines.join("");
      // Run the same logic as the bookmarklet against #demo-stage,
      // then write a short summary into resultsEl.
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__contrastDemoRecords || [];
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      // Undo whatever the run handler applied to #demo-stage.
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
