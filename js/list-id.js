(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__listDemoRecords =
        window.__listDemoRecords || []);
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      var lines = [];
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      function mark(el, level, label) {
        var color =
          level === "green"
            ? "#1a7d4f"
            : level === "gold"
              ? "#8b6800"
              : "#be412a";
        if (color === "#1a7d4f") {
          el.style.outline = "5px solid " + color;
        } else if (color === "#8b6800") {
          el.style.outline = "6px dotted " + color;
        } else {
          el.style.outline = "6px dashed " + color;
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
      }
      Array.prototype.slice
        .call(stage.querySelectorAll("ul,ol"))
        .forEach(function (list) {
          var kids = Array.prototype.slice.call(list.children);
          var lis = kids.filter(function (c) {
            return c.tagName === "LI";
          });
          var others = kids.filter(function (c) {
            return c.tagName !== "LI";
          });
          var empties = lis.filter(function (li) {
            return !li.textContent.trim() && !li.children.length;
          });
          if (lis.length === 0)
            mark(list, "red", list.tagName.toLowerCase() + ": empty list");
          else if (others.length)
            mark(list, "red", list.tagName.toLowerCase() + ": non-<li> child");
          else if (empties.length)
            mark(
              list,
              "gold",
              list.tagName.toLowerCase() +
                ": " +
                empties.length +
                " empty <li>",
            );
          else
            mark(
              list,
              "green",
              list.tagName.toLowerCase() + ": " + lis.length + " items",
            );
        });
      Array.prototype.slice
        .call(stage.querySelectorAll("li"))
        .forEach(function (li) {
          var p = li.parentElement;
          if (!p || !/^(UL|OL|MENU)$/.test(p.tagName))
            mark(li, "red", "li: not inside a list");
        });
      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__listDemoRecords || [];
      demoRecords.forEach(function (r) {
        r.el.style.outline = "";
        r.el.style.outlineOffset = "";
        if (r.badge && r.badge.parentNode)
          r.badge.parentNode.removeChild(r.badge);
      });
      demoRecords.length = 0;
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
