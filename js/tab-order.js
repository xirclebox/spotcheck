(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");

  var FOCUSABLE_SELECTOR =
    'a[href],button,input,select,textarea,details,[tabindex],[contenteditable="true"]';
  var REPLACED = { INPUT: 1, TEXTAREA: 1, SELECT: 1, IMG: 1 };
  var COLORS = { natural: "#1a7d4f", positive: "#be412a" };
  var OUTLINES = { natural: "5px solid", positive: "6px dashed" };
  var OUTLINE_OFFSET = "3px";
  var BADGE_FONT = '500 16px Arial, Helvetica, "Helvetica Neue", sans-serif';

  function defineDemoWidget() {
    if (!window.customElements || customElements.get("demo-widget")) return;
    var markup = [
      "<style>",
      ":host{display:inline-flex;align-items:center;gap:0.75rem;",
      "padding:0.75rem;border:1px dashed var(--color-hairline,#d8dbdd);",
      "border-radius:var(--border-radius,0.25rem)}",
      "a,button{font:inherit;color:var(--color-navy-dark,#181720);",
      "padding:0.5rem 0.75rem;border:1px solid var(--color-hairline,#d8dbdd);",
      "border-radius:var(--border-radius,0.25rem);background:transparent;",
      "position:relative}",
      "</style>",
      '<a href="#">Shadow link E</a>',
      '<button type="button" tabindex="2">Shadow button F</button>',
      "<slot></slot>",
    ].join("");
    customElements.define(
      "demo-widget",
      class extends HTMLElement {
        connectedCallback() {
          if (this.shadowRoot) return;
          this.attachShadow({ mode: "open" }).innerHTML = markup;
        }
      },
    );
  }

  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isCustomElement(el) {
    return el.tagName.indexOf("-") !== -1;
  }

  function isClosedHost(el) {
    return (
      isCustomElement(el) &&
      !el.shadowRoot &&
      !el.children.length &&
      !!(window.customElements && customElements.get(el.localName))
    );
  }

  function isVisible(el) {
    var styles = getComputedStyle(el);
    if (styles.display === "none" || styles.visibility === "hidden")
      return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isFocusable(el) {
    return (
      el.matches(FOCUSABLE_SELECTOR) &&
      !el.hasAttribute("disabled") &&
      el.tabIndex >= 0 &&
      (el.tagName !== "INPUT" || el.type !== "hidden") &&
      isVisible(el)
    );
  }

  function flatChildren(node) {
    if (node.tagName === "SLOT" && node.assignedElements) {
      var assigned = node.assignedElements({ flatten: true });
      if (assigned.length) return assigned;
    }
    return Array.prototype.slice.call(node.children);
  }

  function orderScope(entries) {
    var positive = entries
      .filter(function (entry) {
        return entry.tabIndex > 0;
      })
      .sort(function (a, b) {
        return a.tabIndex - b.tabIndex;
      });
    var natural = entries.filter(function (entry) {
      return entry.tabIndex <= 0;
    });
    return positive.concat(natural);
  }

  function collectScope(root, host, seen, closedHosts) {
    var entries = [];

    function walk(node) {
      flatChildren(node).forEach(function (el) {
        if (seen.indexOf(el) !== -1) return;
        seen.push(el);

        var entry = null;
        if (isFocusable(el)) {
          entry = { el: el, tabIndex: el.tabIndex, host: host, sub: null };
          entries.push(entry);
        }

        var shadow = el.shadowRoot;
        if (shadow) {
          var sub = orderScope(collectScope(shadow, el, seen, closedHosts));
          if (shadow.delegatesFocus && entry && sub.length) {
            entries.splice(entries.indexOf(entry), 1);
            entry = null;
          }
          if (sub.length) {
            if (entry) entry.sub = sub;
            else
              entries.push({
                el: null,
                tabIndex: el.tabIndex > 0 ? el.tabIndex : 0,
                host: host,
                sub: sub,
              });
          }
          return;
        }

        if (isClosedHost(el)) {
          closedHosts.push(el);
          return;
        }

        walk(el);
      });
    }

    walk(root);
    return entries;
  }

  function flatten(entries, out) {
    entries.forEach(function (entry) {
      if (entry.el) out.push(entry);
      if (entry.sub) flatten(entry.sub, out);
    });
    return out;
  }

  function attachBadge(el, badge, corner) {
    if (!REPLACED[el.tagName]) {
      el.appendChild(badge);
      return;
    }
    var owner = el.getRootNode();
    (owner.body || document.body).appendChild(badge);
    var rect = el.getBoundingClientRect();
    var badgeRect = badge.getBoundingClientRect();
    badge.style.position = "absolute";
    badge.style.transform = "none";
    badge.style.top =
      (corner ? rect.top - 12 : rect.top - badgeRect.height) +
      window.scrollY +
      "px";
    badge.style.left =
      (corner ? rect.left - 12 : rect.left) + window.scrollX + "px";
  }

  function hostName(host) {
    return host ? host.tagName.toLowerCase() : "";
  }

  function labelFor(el) {
    return (
      el.textContent.trim() || el.placeholder || el.tagName.toLowerCase()
    );
  }

  function notesFor(entry) {
    var notes = [];
    if (entry.el.tabIndex > 0)
      notes.push("tabindex=" + entry.el.tabIndex + ", positive tabindex");
    if (entry.host)
      notes.push(
        entry.el.getRootNode() === entry.host.shadowRoot
          ? "inside " + hostName(entry.host) + " shadow DOM"
          : "slotted into " + hostName(entry.host),
      );
    return notes;
  }

  function restore(records) {
    records.forEach(function (record) {
      record.el.style.outline = "";
      record.el.style.outlineOffset = "";
      record.el.style.position = record.position || "";
      if (!(record.el.getAttribute("style") || "").trim())
        record.el.removeAttribute("style");
      if (record.badge && record.badge.parentNode)
        record.badge.parentNode.removeChild(record.badge);
      if (record.noteBadge && record.noteBadge.parentNode)
        record.noteBadge.parentNode.removeChild(record.noteBadge);
    });
    records.length = 0;
  }

  function mark(entry, index, records) {
    var el = entry.el;
    var level = el.tabIndex > 0 ? "positive" : "natural";
    var color = COLORS[level];
    var notes = notesFor(entry);
    var priorPosition = el.style.position;

    el.style.outline = OUTLINES[level] + " " + color;
    el.style.outlineOffset = OUTLINE_OFFSET;
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";

    var badge = document.createElement("span");
    badge.textContent = index + 1;
    badge.setAttribute("aria-hidden", "true");
    badge.style.cssText = [
      "position:absolute",
      "top:-12px",
      "left:-12px",
      "background:" + color,
      "color:#fff",
      "font:" + BADGE_FONT,
      "min-width:22px",
      "height:22px",
      "line-height:22px",
      "text-align:center",
      "border-radius:50%",
      "pointer-events:none",
      "z-index:11",
    ].join(";");
    attachBadge(el, badge, true);

    var noteBadge = null;
    if (notes.length) {
      noteBadge = document.createElement("span");
      noteBadge.textContent = notes.join(", ");
      noteBadge.setAttribute("aria-hidden", "true");
      noteBadge.style.cssText = [
        "position:absolute",
        "top:0",
        "left:0",
        "transform:translateY(-100%)",
        "background:" + color,
        "color:#fff",
        "font:" + BADGE_FONT,
        "padding:4px 8px",
        "border-radius:3px 3px 0 0",
        "pointer-events:none",
        "white-space:nowrap",
        "z-index:10",
      ].join(";");
      if (REPLACED[el.tagName]) attachBadge(el, noteBadge, false);
      else el.insertBefore(noteBadge, el.firstChild);
    }

    records.push({
      el: el,
      badge: badge,
      noteBadge: noteBadge,
      position: priorPosition,
    });

    var itemLabel = labelFor(el);
    return notes.length ? itemLabel + ", " + notes.join(", ") : itemLabel;
  }

  defineDemoWidget();

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var stage = document.getElementById("demo-stage");
      var records = (window.__tabDemoRecords = window.__tabDemoRecords || []);
      restore(records);

      var closedHosts = [];
      var ordered = flatten(
        orderScope(collectScope(stage, null, [], closedHosts)),
        [],
      );

      var lines = ordered.map(function (entry, index) {
        return (
          '<p class="demo__results-line">' +
          (index + 1) +
          ". " +
          esc(mark(entry, index, records)) +
          "</p>"
        );
      });

      var summary = plural(ordered.length, "tab stop");
      lines.unshift('<p class="demo__results-line">' + esc(summary) + "</p>");

      closedHosts.forEach(function (host) {
        lines.push(
          '<p class="demo__results-line">' +
            esc(
              hostName(host) + ", closed shadow root, not inspectable",
            ) +
            "</p>",
        );
      });

      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      restore(window.__tabDemoRecords || []);
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
