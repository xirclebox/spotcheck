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

  function hostOf(node) {
    var root = node.getRootNode ? node.getRootNode() : null;
    return root && root.host ? root.host : null;
  }

  function flatParentOf(el) {
    if (el.assignedSlot)
      return el.assignedSlot.parentElement || hostOf(el.assignedSlot);
    if (el.parentElement) return el.parentElement;
    return hostOf(el);
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
    SHADOW_STYLE + ["<ul><slot></slot></ul>", "<ul></ul>"].join(""),
  );

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var demoRecords = (window.__listDemoRecords =
        window.__listDemoRecords || []);
      demoRecords.forEach(restoreRecord);
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
      }
      function childrenOf(el) {
        var found = [];
        flatChildren(el).forEach(function (child) {
          if (child.tagName === SLOT_TAG) {
            found = found.concat(flatChildren(child));
            return;
          }
          found.push(child);
        });
        return found;
      }
      deepQuery("ul,ol", stage).forEach(function (list) {
        var kids = childrenOf(list);
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
            list.tagName.toLowerCase() + ": " + empties.length + " empty <li>",
          );
        else
          mark(
            list,
            "green",
            list.tagName.toLowerCase() + ": " + lis.length + " items",
          );
      });
      deepQuery("li", stage).forEach(function (li) {
        var p = flatParentOf(li);
        if (!p || !/^(UL|OL|MENU)$/.test(p.tagName))
          mark(li, "red", "li: not inside a list");
      });
      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      var demoRecords = window.__listDemoRecords || [];
      demoRecords.forEach(restoreRecord);
      demoRecords.length = 0;
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
