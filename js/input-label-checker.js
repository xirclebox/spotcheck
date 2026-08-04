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

  function describe(el) {
    var tag = el.tagName.toLowerCase();

    return tag === "input" ? tag + "[" + (el.type || "text") + "]" : tag;
  }

  function makeBadge(kind, label) {
    var badge = document.createElement("span");

    badge.textContent = label;
    badge.setAttribute("aria-hidden", "true");
    badge.setAttribute("data-a11y-demo-badge", "");
 
    badge.style.cssText = [
      "display:inline-block",
      "width:fit-content",
      "justify-self:start",
      "margin-left:8px",
      "background:" + COLORS[kind],
      "color:#fff",
      "font:500 16px Arial, Helvetica, 'Helvetica Neue', sans-serif;",
      "padding:4px 8px",
      "border-radius:4px",
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

        if (kind === "explicit") {
          el.style.outline = "5px solid " + COLORS.explicit;
        } else if (kind === "implicit") {
          el.style.outline = "6px dashed " + COLORS.implicit;
        } else {
          el.style.outline = "6px dotted " + COLORS.missing;
        }
        
        el.style.outlineOffset = "3px";
        el.insertAdjacentElement("afterend", record.badge);
        records.push(record);
        addLine(label);
      });
  }

  runButton.addEventListener("click", run);
  clearButton.addEventListener("click", clear);
})();
