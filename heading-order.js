(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var items = Array.prototype.slice.call(
        stage.querySelectorAll("[data-level]"),
      );
      var lastGood = 0,
        seenH1 = false,
        lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      items.forEach(function (el) {
        el.classList.remove(
          "fake-heading-demo--pass",
          "fake-heading-demo--fail",
        );
        var oldBadge = el.querySelector("[data-a11y-demo-badge]");
        if (oldBadge) oldBadge.parentNode.removeChild(oldBadge);
        var level = parseInt(el.getAttribute("data-level"), 10);
        var ok, reason;
        if (level === 1) {
          if (seenH1) {
            ok = false;
            reason = "multiple top-level headings";
          } else {
            ok = true;
            reason = "pass";
            seenH1 = true;
          }
          lastGood = 1;
        } else if (level > lastGood + 1) {
          ok = false;
          reason = "skipped a level";
        } else {
          ok = true;
          reason = "pass";
          lastGood = level;
        }
        el.classList.add(
          ok ? "fake-heading-demo--pass" : "fake-heading-demo--fail",
        );
        var label = "H" + level + ": " + reason;
        var color = ok ? "#1a7d4f" : "#be412a";
        if (getComputedStyle(el).position === "static")
          el.style.position = "relative";
        var badge = document.createElement("span");
        badge.textContent = label;
        badge.setAttribute("aria-hidden", "true");
        badge.setAttribute("data-a11y-demo-badge", "");
        badge.style.cssText =
          "position:absolute;top:0;left:100%;margin-left:8px;background:" +
          color +
          ";color:#fff;font:600 14px monospace;padding:1px 5px;border-radius:3px;z-index:10;pointer-events:none;white-space:nowrap";
        el.appendChild(badge);
        lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
      });
      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      Array.prototype.forEach.call(
        stage.querySelectorAll("[data-level]"),
        function (el) {
          el.classList.remove(
            "fake-heading-demo--pass",
            "fake-heading-demo--fail",
          );
          var badge = el.querySelector("[data-a11y-demo-badge]");
          if (badge) badge.parentNode.removeChild(badge);
        },
      );
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
