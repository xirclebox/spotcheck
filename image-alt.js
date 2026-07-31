(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__imageAltDemoRecords =
        window.__imageAltDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      function looksLikeFilename(alt) {
        var t = alt.trim();
        return (
          /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff?)$/i.test(t) ||
          /^(img|image|dsc|photo|screenshot)[-_ ]?\d/i.test(t)
        );
      }
      function hasRedundantPhrase(alt) {
        return /^(image|photo|picture|graphic|icon)\s+of\b/i.test(alt.trim());
      }
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      var lines = [];
      Array.prototype.slice
        .call(stage.querySelectorAll("img"))
        .forEach(function (img) {
          var level, label;
          if (!img.hasAttribute("alt")) {
            level = "red";
            label = "No alt attribute";
          } else {
            var alt = img.getAttribute("alt");
            if (alt.trim() === "") {
              level = "green";
              label = "Decorative (empty alt)";
            } else if (looksLikeFilename(alt)) {
              level = "gold";
              label = 'Alt text looks like a filename: "' + alt + '"';
            } else if (hasRedundantPhrase(alt)) {
              level = "gold";
              label = 'Redundant phrase in alt text: "' + alt + '"';
            } else {
              level = "green";
              label = 'OK: "' + alt + '"';
            }
          }
          var color =
            level === "green"
              ? "#1a7d4f"
              : level === "gold"
                ? "#8b6800"
                : "#be412a";
          img.style.outline = "3px solid " + color;
          img.style.outlineOffset = "2px";
          var badge = document.createElement("div");
          badge.textContent = label;
          badge.setAttribute("aria-hidden", "true");
          badge.style.cssText =
            "position:absolute;background:" +
            color +
            ";color:#fff;font:600 14px monospace;padding:1px 5px;border-radius:3px 3px 0 0;z-index:10;pointer-events:none;white-space:nowrap;max-width:min(90vw,24rem);overflow:hidden;text-overflow:ellipsis";
          document.body.appendChild(badge);
          var rect = img.getBoundingClientRect(),
            badgeRect = badge.getBoundingClientRect();
          badge.style.top = rect.top + window.scrollY - badgeRect.height + "px";
          badge.style.left = rect.left + window.scrollX + "px";
          demoRecords.push({ el: img, badge: badge });
          lines.push('<p class="demo__results-line">' + esc(label) + "</p>");
        });
      resultsEl.innerHTML = lines.join("");
      // Run the same logic as the bookmarklet against #demo-stage,
      // then write a short summary into resultsEl.
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__imageAltDemoRecords || [];
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
