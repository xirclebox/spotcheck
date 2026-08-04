(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__landmarkDemoRecords =
        window.__landmarkDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      function role(el) {
        return el.getAttribute("data-fake-role");
      }
      function name(el) {
        var l = el.getAttribute("data-fake-label");
        return l ? l.trim() : "";
      }
      var els = Array.prototype.slice.call(
        stage.querySelectorAll("[data-fake-role]"),
      );
      var byRole = {};
      els.forEach(function (el) {
        var ro = role(el);
        (byRole[ro] = byRole[ro] || []).push(el);
      });
      var lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      els.forEach(function (el) {
        var ro = role(el),
          group = byRole[ro],
          nm = name(el),
          level,
          label;
        if (ro === "region" && !nm) {
          level = "red";
          label = ro + ": no accessible name (not exposed as landmark)";
        } else if (group.length > 1 && !nm) {
          level = "gold";
          label = ro + ": ambiguous, add aria-label";
        } else {
          level = "green";
          label = ro + (nm ? ": " + nm : "");
        }
        var color =
          level === "green"
            ? "#1a7d4f"
            : level === "gold"
              ? "#8b6800"
              : "#be412a";
        if (color === "#be412a") {
          el.style.outline = "6px dashed " + color;
        } else if (color === "#8b6800") {
          el.style.outline = "6px dotted " + color;
        } else {
          el.style.outline = "5px solid " + color;
        }
        el.style.outlineOffset = "3px";
        if (getComputedStyle(el).position === "static")
          el.style.position = "relative";
        var badge = document.createElement("div");
        badge.textContent = label;
        badge.setAttribute("aria-hidden", "true");
        badge.style.cssText =
          "position:absolute;top:0;left:0;transform:translateY(-100%);background:" +
          color +
          ";color:#fff;font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;padding:4px 8px;border-radius:4px;z-index:10;pointer-events:none;white-space:nowrap";
        el.insertBefore(badge, el.firstChild);
        demoRecords.push({ el: el, badge: badge });
        lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
      });
      resultsEl.innerHTML = lines.join("");
      // Run the same logic as the bookmarklet against #demo-stage,
      // then write a short summary into resultsEl.
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__landmarkDemoRecords || [];
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
