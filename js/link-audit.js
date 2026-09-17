(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  var SLOT_TAG = "SLOT";

  function restoreRecord(record) {
    record.el.style.outline = "";
    record.el.style.outlineOffset = "";
    record.el.style.position = record.position || "";
    if (!(record.el.getAttribute("style") || "").trim())
      record.el.removeAttribute("style");
    if (record.badge && record.badge.parentNode)
      record.badge.parentNode.removeChild(record.badge);
  }

  function flatChildren(node) {
    if (node.tagName === SLOT_TAG && node.assignedElements) {
      var assigned = node.assignedElements({ flatten: true });
      if (assigned.length) return assigned;
    }
    return Array.prototype.slice.call(node.children);
  }

  function deepQuery(selector, root) {
    var found = [];
    var seen = new WeakSet();

    function walk(node) {
      flatChildren(node).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.matches(selector)) found.push(el);
        if (el.shadowRoot) {
          walk(el.shadowRoot);
          return;
        }
        walk(el);
      });
    }

    walk(root);
    return found;
  }

  function defineDemoComponent(name, markup) {
    if (!window.customElements || customElements.get(name)) return;
    customElements.define(
      name,
      class extends HTMLElement {
        connectedCallback() {
          if (this.shadowRoot) return;
          this.attachShadow({ mode: "open" }).innerHTML = markup;
        }
      },
    );
  }

  var SHADOW_STYLE = [
    "<style>",
    ":host{display:block;padding:0.75rem;",
    "border:1px dashed var(--color-hairline,#d8dbdd);",
    "border-radius:var(--border-radius,0.25rem)}",
    "*{font:inherit;color:inherit}",
    "</style>",
  ].join("");

  defineDemoComponent(
    "demo-widget",
    SHADOW_STYLE +
      [
        '<a href="#">Shadow link with text</a>',
        '<a href="#"><img src="" alt="Shadow image link"></a>',
        "<slot></slot>",
      ].join(""),
  );

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__linkDemoRecords =
        window.__linkDemoRecords || []);
      demoRecords.forEach(restoreRecord);
      demoRecords.length = 0;
      var GENERIC = ["click here", "here", "read more", "more", "link"];
      function flatChildNodes(node) {
        if (node.tagName === SLOT_TAG && node.assignedNodes) {
          var assigned = node.assignedNodes({ flatten: true });
          if (assigned.length) return assigned;
        }
        return Array.prototype.slice.call(node.childNodes);
      }
      function flatText(el) {
        var parts = [];
        function walk(node) {
          flatChildNodes(node).forEach(function (child) {
            if (child.nodeType === 3) {
              parts.push(child.nodeValue);
              return;
            }
            if (child.nodeType !== 1) return;
            if (child.getAttribute("aria-hidden") === "true") return;
            if (child.shadowRoot) {
              walk(child.shadowRoot);
              return;
            }
            walk(child);
          });
        }
        walk(el.shadowRoot || el);
        return parts.join(" ").replace(/\s+/g, " ").trim();
      }
      function accName(a) {
        var lab = a.getAttribute("aria-label");
        if (lab && lab.trim()) return lab.trim();
        var t = flatText(a);
        if (t) return t;
        var img = deepQuery("img[alt]", a)[0];
        if (img && img.getAttribute("alt").trim())
          return img.getAttribute("alt").trim();
        return "";
      }
      var links = deepQuery("a", stage);
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
        if (color === "#be412a") {
          a.style.outline = "6px dashed " + color;
        } else if (color === "#8b6800") {
          a.style.outline = "6px dotted " + color;
        } else {
          a.style.outline = "5px solid " + color;
        }
        a.style.outlineOffset = "3px";
        var priorPosition = a.style.position;
        if (getComputedStyle(a).position === "static")
          a.style.position = "relative";
        var badge = document.createElement("span");
        badge.textContent = label;
        badge.setAttribute("aria-hidden", "true");
        badge.style.cssText =
          "position:absolute;top:0;left:0;transform:translateY(-100%);background:" +
          color +
          ";color:#fff;font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;padding:4px 8px;border-radius:4px;z-index:10;pointer-events:none;white-space:nowrap";
        a.insertBefore(badge, a.firstChild);
        demoRecords.push({ el: a, badge: badge, position: priorPosition });
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
      demoRecords.forEach(restoreRecord);
      demoRecords.length = 0;
      // Undo whatever the run handler applied to #demo-stage.
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
