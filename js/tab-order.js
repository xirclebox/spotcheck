(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__tabDemoRecords =
        window.__tabDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        r.el.style.position = r.position || "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
        if (r.noteBadge && r.noteBadge.parentNode)
          r.noteBadge.parentNode.removeChild(r.noteBadge);
        if (r.appliedTabindex) r.el.removeAttribute("tabindex");
      });
      demoRecords.length = 0;
      var REPLACED = { INPUT: 1, TEXTAREA: 1, SELECT: 1, IMG: 1 };
      function attachBadge(el, badge, corner) {
        if (!REPLACED[el.tagName]) {
          el.appendChild(badge);
          return;
        }
        document.body.appendChild(badge);
        var rect = el.getBoundingClientRect(),
          badgeRect = badge.getBoundingClientRect();
        badge.style.position = "absolute";
        badge.style.transform = "none";
        badge.style.top =
          (corner ? rect.top - 12 : rect.top - badgeRect.height) +
          window.scrollY +
          "px";
        badge.style.left =
          (corner ? rect.left - 12 : rect.left) + window.scrollX + "px";
      }
      var appliedTabindex = [];
      Array.prototype.forEach.call(
        stage.querySelectorAll("[tabindex]"),
        function (el) {
          el.setAttribute("tabindex", el.getAttribute("tabindex"));
          appliedTabindex.push(el);
        },
      );
      var all = Array.prototype.filter.call(
        stage.querySelectorAll(
          "a[href],button,input,select,textarea,[tabindex]",
        ),
        function (el) {
          return (
            stage.contains(el) &&
            !el.hasAttribute("disabled") &&
            el.tabIndex >= 0
          );
        },
      );
      var positive = all
        .filter(function (el) {
          return el.tabIndex > 0;
        })
        .sort(function (a, b) {
          return a.tabIndex - b.tabIndex;
        });
      var natural = all.filter(function (el) {
        return el.tabIndex <= 0;
      });
      var ordered = positive.concat(natural);
      var lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      ordered.forEach(function (el, i) {
        var level = el.tabIndex > 0 ? "red" : "green";
        var color = level === "green" ? "#1a7d4f" : "#be412a";
        var baseText =
          el.textContent.trim() || el.placeholder || el.tagName.toLowerCase();
        var priorPosition = el.style.position;
        if (color === "#1a7d4f") {
          el.style.outline = "5px solid " + color;
        } else {
          el.style.outline = "6px dashed " + color;
        }
        el.style.outlineOffset = "3px";
        if (getComputedStyle(el).position === "static")
          el.style.position = "relative";

        var badge = document.createElement("span");
        badge.textContent = i + 1;
        badge.setAttribute("aria-hidden", "true");
        badge.style.cssText =
          "position:absolute;top:-12px;left:-12px;background:" +
          color +
          ";color:#fff;font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;min-width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;pointer-events:none;z-index:11";
        attachBadge(el, badge, true);
        var noteBadge = null;

        if (level === "red") {
          noteBadge = document.createElement("span");
          noteBadge.textContent =
            "tabindex=" + el.tabIndex + ", positive tabindex";
          noteBadge.setAttribute("aria-hidden", "true");
          noteBadge.style.cssText =
            "position:absolute;top:0;left:0;transform:translateY(-100%);background:" +
            color +
            ";color:#fff;font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;padding:4px 8px;border-radius:3px 3px 0 0;z-index:10;pointer-events:none;white-space:nowrap";
          if (REPLACED[el.tagName]) {
            attachBadge(el, noteBadge, false);
          } else {
            el.insertBefore(noteBadge, el.firstChild);
          }
        }
        demoRecords.push({
          el: el,
          badge: badge,
          noteBadge: noteBadge,
          position: priorPosition,
          appliedTabindex: appliedTabindex.indexOf(el) !== -1,
        });
        var itemLabel =
          baseText + (el.tabIndex > 0 ? ", positive tabindex" : "");
        lines.push(
          '<p class="demo__results-line">' +
            (i + 1) +
            ". " +
            esc(itemLabel) +
            "</p>",
        );
      });
      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__tabDemoRecords || [];
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        r.el.style.position = r.position || "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
        if (r.noteBadge && r.noteBadge.parentNode)
          r.noteBadge.parentNode.removeChild(r.noteBadge);
      });
      demoRecords.length = 0;
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
