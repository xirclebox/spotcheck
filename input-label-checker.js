/**
 * In-page demo for the Input Label Checker bookmarklet.
 *
 * Mirrors the classification the bookmarklet uses, but scoped to #demo-stage
 * so nothing else on this page gets outlined.
 */
(function () {
  "use strict";

  var stage = document.getElementById("demo-stage");
  var runButton = document.getElementById("demo-run");
  var clearButton = document.getElementById("demo-clear");
  var results = document.getElementById("demo-results");

  if (!stage || !runButton || !clearButton || !results) {
    return;
  }

  var COLORS = {
    explicit: "#1a7d4f",
    implicit: "#8b6800",
    missing: "#be412a"
  };

  var REASONS = {
    explicit: "explicit label",
    implicit: "implicit label",
    missing: "no label"
  };

  var SKIP_TYPES = ["hidden", "submit", "reset", "button", "image"];

  var records = [];

  function normalize(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function textFrom(el) {
    return el ? normalize(el.textContent) : "";
  }

  function ariaLabelledByText(el) {
    var ids = normalize(el.getAttribute("aria-labelledby"));

    if (!ids) {
      return "";
    }

    return normalize(
      ids
        .split(" ")
        .map(function (id) {
          return textFrom(document.getElementById(id));
        })
        .join(" ")
    );
  }

  function classify(el) {
    var labels = el.labels ? Array.prototype.slice.call(el.labels) : [];
    var hasExplicit = false;
    var hasImplicit = false;

    labels.forEach(function (label) {
      if (!textFrom(label)) {
        return;
      }
      if (el.id && label.getAttribute("for") === el.id) {
        hasExplicit = true;
      } else if (label.contains(el)) {
        hasImplicit = true;
      }
    });

    if (hasExplicit) {
      return "explicit";
    }
    if (hasImplicit || ariaLabelledByText(el)) {
      return "implicit";
    }
    if (normalize(el.getAttribute("aria-label"))) {
      return "implicit";
    }
    if (normalize(el.getAttribute("title"))) {
      return "implicit";
    }
    return "missing";
  }

  // "input[email]", "select", "textarea": the equivalent of "H2" in the
  // heading order checker.
  function describe(el) {
    var tag = el.tagName.toLowerCase();

    return tag === "input" ? tag + "[" + (el.type || "text") + "]" : tag;
  }

  function makeBadge(kind, label) {
    var badge = document.createElement("span");

    badge.textContent = label;
    badge.setAttribute("aria-hidden", "true");
    badge.setAttribute("data-a11y-demo-badge", "");
    // A form control is a replaced element and cannot hold children, so the
    // badge sits after the control as an inline sibling rather than being
    // absolutely positioned inside it.
    // .demo__sample-item and .demo__label are grid containers, so the badge
    // becomes a grid item and would otherwise stretch to fill the column.
    badge.style.cssText = [
      "display:inline-block",
      "width:fit-content",
      "justify-self:start",
      "margin-left:8px",
      "background:" + COLORS[kind],
      "color:#fff",
      "font:600 14px monospace",
      "padding:1px 5px",
      "border-radius:3px",
      "vertical-align:middle",
      "pointer-events:none",
      "white-space:nowrap"
    ].join(";");

    return badge;
  }

  function addLine(text) {
    var line = document.createElement("p");

    line.className = "demo__results-line";
    line.textContent = text;
    results.appendChild(line);
  }

  function clear() {
    records.forEach(function (record) {
      record.el.style.outline = record.outline;
      record.el.style.outlineOffset = record.offset;
      if (!normalize(record.el.getAttribute("style"))) {
        record.el.removeAttribute("style");
      }
      if (record.badge.parentNode) {
        record.badge.parentNode.removeChild(record.badge);
      }
    });
    records = [];
    results.textContent = "";
  }

  function run() {
    clear();

    Array.prototype.slice
      .call(stage.querySelectorAll("input, select, textarea"))
      .filter(function (el) {
        return SKIP_TYPES.indexOf(el.type) === -1;
      })
      .forEach(function (el) {
        var kind = classify(el);
        var label = describe(el) + ": " + REASONS[kind];
        var record = {
          el: el,
          outline: el.style.outline,
          offset: el.style.outlineOffset,
          badge: makeBadge(kind, label)
        };

        el.style.outline = "3px solid " + COLORS[kind];
        el.style.outlineOffset = "2px";
        el.insertAdjacentElement("afterend", record.badge);
        records.push(record);
        addLine(label);
      });
  }

  runButton.addEventListener("click", run);
  clearButton.addEventListener("click", clear);
})();
