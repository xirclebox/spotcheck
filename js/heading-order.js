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
        el.style.outline = "";
        var oldBadge = el.querySelector("[data-a11y-demo-badge]");
        if (oldBadge) oldBadge.parentNode.removeChild(oldBadge);
        var level = parseInt(el.getAttribute("data-level"), 10);
        var ok, reason;
        if (level === 1) {
          if (seenH1) {
            ok = false;
            reason = "Multiple top-level headings";
          } else {
            ok = true;
            reason = "Pass";
            seenH1 = true;
          }
          lastGood = 1;
        } else if (level > lastGood + 1) {
          ok = false;
          reason = "Skipped a level";
        } else {
          ok = true;
          reason = "Pass";
          lastGood = level;
        }
       
        var label = "H" + level + ": " + reason;
        var color = ok ? "#1a7d4f" : "#be412a";
        if (ok){
          el.style.outline = "5px solid " + color;
        } else {
          el.style.outline = "6px dashed " + color;
        }
        el.style.outlineOffset = "3px";
        if (getComputedStyle(el).position === "static")
          el.style.position = "relative";
        var badge = document.createElement("span");
        badge.textContent = label;
        badge.setAttribute("aria-hidden", "true");
        badge.setAttribute("data-a11y-demo-badge", "");
        badge.style.cssText =
          "position:absolute;top:0;left:100%;margin-left:8px;background:" +
          color +
          ';color:#fff;font:500 16px Arial, Helvetica, "Helvetica Neue", sans-serif;padding:4px 8px;border-radius:4px;z-index:10;white-space:nowrap';
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
          el.style.outline = "";
          var badge = el.querySelector("[data-a11y-demo-badge]");
          if (badge) badge.parentNode.removeChild(badge);
        },
      );
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
