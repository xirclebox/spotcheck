(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  function resetRecords(demoRecords) {
    demoRecords.forEach(function (r) {
      r.el.style.outline = r.outline;
      r.el.style.outlineOffset = r.offset;
      r.el.style.position = r.position;
      r.el.style.opacity = r.opacity;
      if (r.badge && r.badge.parentNode)
        r.badge.parentNode.removeChild(r.badge);
    });
    demoRecords.length = 0;
  }

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__contrastDemoRecords =
        window.__contrastDemoRecords || []);
      resetRecords(demoRecords);
      var WHITE = { r: 255, g: 255, b: 255, a: 1 };
      function parseColor(str) {
        var m = String(str).match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        var p = m[1].split(/[\s,\/]+/).filter(function (s) {
          return s.length > 0;
        });
        if (p.length < 3) return null;
        var a = 1;
        if (p.length > 3) {
          a = parseFloat(p[3]);
          if (isNaN(a)) a = 1;
          else if (p[3].indexOf("%") !== -1) a = a / 100;
        }
        return {
          r: parseFloat(p[0]),
          g: parseFloat(p[1]),
          b: parseFloat(p[2]),
          a: a,
        };
      }
      function withAlpha(c, a) {
        return { r: c.r, g: c.g, b: c.b, a: a };
      }
      function blend(top, bottom) {
        var a = top.a + bottom.a * (1 - top.a);
        if (!a) return { r: 0, g: 0, b: 0, a: 0 };
        function ch(k) {
          return (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
        }
        return { r: ch("r"), g: ch("g"), b: ch("b"), a: a };
      }
      function opacityOf(el) {
        var o = parseFloat(getComputedStyle(el).opacity);
        return isNaN(o) ? 1 : o;
      }
      function backdropOf(el) {
        var chain = [],
          node = el;
        while (node) {
          chain.push(node);
          node = node.parentElement;
        }
        chain.reverse();
        var backdrop = WHITE,
          opacity = 1;
        chain.forEach(function (n) {
          opacity *= opacityOf(n);
          var bg = parseColor(getComputedStyle(n).backgroundColor);
          if (bg && bg.a > 0)
            backdrop = blend(withAlpha(bg, bg.a * opacity), backdrop);
        });
        return { color: backdrop, opacity: opacity };
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
          var fg = parseColor(style.color);
          if (!fg) return;
          var backdrop = backdropOf(p);
          var alpha = fg.a * backdrop.opacity;
          if (!alpha) return;
          var painted = blend(withAlpha(fg, alpha), backdrop.color);
          var r = ratio(painted, backdrop.color);
          var level = r < 4.5 ? "red" : r < 7 ? "gold" : "green";
          var hasOpacity = opacityOf(p) < 1;
          var label =
            r.toFixed(2) +
            ":1, " +
            (level === "red"
              ? "fails AA"
              : level === "gold"
                ? "passes AA, not AAA"
                : "passes AAA") +
            (level === "red" && hasOpacity ? ", opacity" : "");
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

          var record = {
            el: p,
            outline: "",
            offset: "",
            position: p.style.position,
            opacity: p.style.opacity,
          };

          p.style.outlineOffset = "3px";
          if (getComputedStyle(p).position === "static") {
            p.style.position = "relative";
          }
          if (hasOpacity) {
            p.style.opacity = "1";
          }

          var badge = document.createElement("span");
          badge.textContent = label;
          badge.setAttribute("aria-hidden", "true");
          badge.style.cssText = [
            "position:absolute",
            "top:0",
            "left:0",
            "transform:translateY(-100%)",
            "max-width:min(90vw, 24rem)",
            "padding:4px 8px",
            "border-radius:4px",
            "background:" + color,
            "color:#fff",
            "font:500 16px/1.2 Arial, Helvetica, \"Helvetica Neue\", sans-serif",
            "pointer-events:none",
            "white-space:nowrap",
            "z-index:2147483646",
          ].join(";");
          p.insertBefore(badge, p.firstChild);

          record.badge = badge;
          demoRecords.push(record);
          lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
        });
      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__contrastDemoRecords || [];
      resetRecords(demoRecords);
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();