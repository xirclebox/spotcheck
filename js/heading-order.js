(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  var SLOT_TAG = "SLOT";

  var priorPositions = new WeakMap();

  function restoreElement(el) {
    el.style.outline = "";
    el.style.outlineOffset = "";
    if (priorPositions.has(el)) {
      el.style.position = priorPositions.get(el);
      priorPositions.delete(el);
    }
    if (!(el.getAttribute("style") || "").trim()) el.removeAttribute("style");
    var badge = el.querySelector("[data-a11y-demo-badge]");
    if (badge) badge.parentNode.removeChild(badge);
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
      ['<p data-level="3">Shadow heading (H3)</p>', "<slot></slot>"].join(""),
  );

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var items = deepQuery("[data-level]", stage);
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
        restoreElement(el);
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
        if (ok) {
          el.style.outline = "5px solid " + color;
        } else {
          el.style.outline = "6px dashed " + color;
        }
        el.style.outlineOffset = "3px";
        if (getComputedStyle(el).position === "static") {
          priorPositions.set(el, el.style.position);
          el.style.position = "relative";
        }
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
      deepQuery("[data-level]", stage).forEach(restoreElement);
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
