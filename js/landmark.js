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
        '<div data-fake-role="navigation" data-fake-label="Shadow nav">Shadow navigation</div>',
        '<div data-fake-role="region">Shadow region with no name</div>',
        "<slot></slot>",
      ].join(""),
  );

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__landmarkDemoRecords =
        window.__landmarkDemoRecords || []);
      demoRecords.forEach(restoreRecord);
      demoRecords.length = 0;
      function role(el) {
        return el.getAttribute("data-fake-role");
      }
      function name(el) {
        var l = el.getAttribute("data-fake-label");
        return l ? l.trim() : "";
      }
      var els = deepQuery("[data-fake-role]", stage);
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
        var priorPosition = el.style.position;
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
        demoRecords.push({ el: el, badge: badge, position: priorPosition });
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
      demoRecords.forEach(restoreRecord);
      demoRecords.length = 0;
      // Undo whatever the run handler applied to #demo-stage.
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
