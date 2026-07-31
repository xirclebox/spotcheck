(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__linkDemoRecords =
        window.__linkDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      var GENERIC = ["click here", "here", "read more", "more", "link"];
      function accName(a) {
        var lab = a.getAttribute("aria-label");
        if (lab && lab.trim()) return lab.trim();
        var t = a.textContent.replace(/\s+/g, " ").trim();
        if (t) return t;
        var img = a.querySelector("img[alt]");
        if (img && img.getAttribute("alt").trim())
          return img.getAttribute("alt").trim();
        return "";
      }
      var links = Array.prototype.slice.call(stage.querySelectorAll("a"));
      var lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      links.forEach(function (a) {
        var nm = accName(a),
          level,
          label;
        if (!nm) {
          level = "red";
          label = "No accessible name";
        } else if (GENERIC.indexOf(nm.toLowerCase()) !== -1) {
          level = "red";
          label = 'Generic text: "' + nm + '"';
        } else if (nm.length < 4) {
          level = "gold";
          label = 'Very short text: "' + nm + '"';
        } else {
          level = "green";
          label = 'OK: "' + nm + '"';
        }
        var color =
          level === "green"
            ? "#1a7d4f"
            : level === "gold"
              ? "#8b6800"
              : "#be412a";
        a.style.outline = "3px solid " + color;
        a.style.outlineOffset = "2px";
        if (getComputedStyle(a).position === "static")
          a.style.position = "relative";
        var badge = document.createElement("span");
        badge.textContent = label;
        badge.setAttribute("aria-hidden", "true");
        badge.style.cssText =
          "position:absolute;top:0;left:0;transform:translateY(-100%);background:" +
          color +
          ";color:#fff;font:600 14px monospace;padding:1px 5px;border-radius:3px 3px 0 0;z-index:10;pointer-events:none;white-space:nowrap";
        a.insertBefore(badge, a.firstChild);
        demoRecords.push({ el: a, badge: badge });
        lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
      });
      resultsEl.innerHTML = lines.join("");
      // Run the same logic as the bookmarklet against #demo-stage,
      // then write a short summary into resultsEl.
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__linkDemoRecords || [];
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
