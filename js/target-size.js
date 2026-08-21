(function () {
  var runBtn = document.getElementById("demo-run");
  var clearBtn = document.getElementById("demo-clear");
  var resultsEl = document.getElementById("demo-results");
  var stage = document.getElementById("demo-stage");

  if (!stage) return;

  var MIN_SIZE = 24;
  var ENHANCED_SIZE = 44;
  var SPACING_RADIUS = 12;
  var BADGE_GAP = 8;
  var BADGE_STEP = 4;
  var MAX_PASSES = 40;

  var COLORS = {
    green: "#1a7d4f",
    gold: "#8b6800",
    red: "#be412a",
    grey: "#4a5464",
  };

  var OUTLINES = {
    green: "5px solid",
    gold: "6px dotted",
    red: "6px dashed",
    grey: "3px dotted",
  };

  var LEVELS = {
    enhanced: "green",
    minimum: "gold",
    spacing: "gold",
    small: "red",
    inline: "grey",
  };

  var BADGES = {
    enhanced: "Meets 2.5.5 Enhanced",
    minimum: "Meets 2.5.8 Minimum",
    spacing: "Under 24, spacing exception",
    small: "Under 24 by 24",
    inline: "Inline in text, exempt",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function normalize(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function center(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function circleHitsRect(point, radius, rect) {
    var nearestX = Math.max(rect.left, Math.min(point.x, rect.right));
    var nearestY = Math.max(rect.top, Math.min(point.y, rect.bottom));
    var dx = point.x - nearestX;
    var dy = point.y - nearestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function passesSpacing(item, items) {
    var point = center(item.rect);
    var i, other, otherPoint, dx, dy;

    for (i = 0; i < items.length; i += 1) {
      other = items[i];
      if (other === item) continue;
      if (other.undersized) {
        otherPoint = center(other.rect);
        dx = point.x - otherPoint.x;
        dy = point.y - otherPoint.y;
        if (dx * dx + dy * dy < MIN_SIZE * MIN_SIZE) return false;
      } else if (circleHitsRect(point, SPACING_RADIUS, other.rect)) {
        return false;
      }
    }
    return true;
  }

  function isInlineTarget(el) {
    if (getComputedStyle(el).display !== "inline") return false;
    var parent = el.parentNode;
    if (!parent) return false;
    var nodes = parent.childNodes;
    var text = "";
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i] !== el && nodes[i].nodeType === 3) {
        text += nodes[i].nodeValue;
      }
    }
    return normalize(text).length > 0;
  }

  function classify(item, items) {
    if (item.rect.width >= ENHANCED_SIZE && item.rect.height >= ENHANCED_SIZE) {
      return "enhanced";
    }
    if (isInlineTarget(item.el)) return "inline";
    if (item.rect.width >= MIN_SIZE && item.rect.height >= MIN_SIZE) {
      return "minimum";
    }
    return passesSpacing(item, items) ? "spacing" : "small";
  }

  function makeBadge(label, level) {
    var badge = document.createElement("span");

    badge.textContent = label;
    badge.setAttribute("aria-hidden", "true");
    badge.setAttribute("data-a11y-demo-badge", "");
    badge.style.cssText = [
      "position:absolute",
      "top:0",
      "left:-9999px",
      "max-width:min(100%, 17rem)",
      "padding:2px 6px",
      "border-radius:4px",
      "background:" + COLORS[level],
      "color:#fff",
      'font:500 13px/1.3 Arial, Helvetica, "Helvetica Neue", sans-serif',
      "pointer-events:none",
      "z-index:2",
    ].join(";");
    return badge;
  }

  function intersects(box, other) {
    return (
      box.left < other.right &&
      box.right > other.left &&
      box.top < other.bottom &&
      box.bottom > other.top
    );
  }

  function firstHit(box, boxes) {
    var i;
    for (i = 0; i < boxes.length; i += 1) {
      if (intersects(box, boxes[i])) return boxes[i];
    }
    return null;
  }

  function settle(box, width, height, obstacles, placed) {
    var pass, hit, next;

    for (pass = 0; pass < MAX_PASSES; pass += 1) {
      hit = firstHit(box, obstacles);
      if (hit) {
        next = hit.right + BADGE_GAP;
        if (next <= box.left) break;
        box.left = next;
        box.right = next + width;
        continue;
      }
      hit = firstHit(box, placed);
      if (hit) {
        next = hit.bottom + BADGE_STEP;
        if (next <= box.top) break;
        box.top = next;
        box.bottom = next + height;
        continue;
      }
      break;
    }
  }

  function placeBadges(entries, obstacles, stageWidth) {
    var placed = [];

    entries.forEach(function (entry) {
      var width = entry.badge.offsetWidth;
      var height = entry.badge.offsetHeight;
      var top = entry.box.top + entry.box.height / 2 - height / 2;
      var box = {
        left: entry.box.right + BADGE_GAP,
        top: top,
        right: entry.box.right + BADGE_GAP + width,
        bottom: top + height,
      };
      var clamped;

      settle(box, width, height, obstacles, placed);

      clamped = Math.max(0, Math.min(box.left, stageWidth - width));
      if (clamped !== box.left) {
        box.left = clamped;
        box.right = clamped + width;
        settle(box, width, height, [], placed);
      }

      entry.badge.style.left = box.left + "px";
      entry.badge.style.top = box.top + "px";
      placed.push(box);
    });
  }

  function reset() {
    Array.prototype.forEach.call(
      stage.querySelectorAll("[data-target]"),
      function (el) {
        el.style.outline = "";
        el.style.outlineOffset = "";
      },
    );
    Array.prototype.forEach.call(
      stage.querySelectorAll("[data-a11y-demo-badge]"),
      function (badge) {
        badge.parentNode.removeChild(badge);
      },
    );
  }

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      reset();

      var stageRect = stage.getBoundingClientRect();
      var items = Array.prototype.map.call(
        stage.querySelectorAll("[data-target]"),
        function (el) {
          var rect = el.getBoundingClientRect();
          return {
            el: el,
            rect: rect,
            box: {
              left: rect.left - stageRect.left,
              top: rect.top - stageRect.top,
              right: rect.right - stageRect.left,
              bottom: rect.bottom - stageRect.top,
              width: rect.width,
              height: rect.height,
            },
            undersized: rect.width < MIN_SIZE || rect.height < MIN_SIZE,
          };
        },
      );

      var entries = [];
      var lines = [];

      items.forEach(function (item) {
        var kind = classify(item, items);
        var level = LEVELS[kind];
        var size =
          Math.round(item.rect.width) +
          "\u00d7" +
          Math.round(item.rect.height);
        var label = size + " \u00b7 " + BADGES[kind];
        var name = normalize(item.el.textContent) || "unnamed control";
        var badge = makeBadge(label, level);

        item.el.style.outline = OUTLINES[level] + " " + COLORS[level];
        item.el.style.outlineOffset = "3px";
        stage.appendChild(badge);
        entries.push({ badge: badge, box: item.box });

        lines.push(
          '<p class="demo__results-line">' + esc(name + ": " + label) + "</p>",
        );
      });

      placeBadges(
        entries,
        items.map(function (item) {
          return item.box;
        }),
        stage.clientWidth,
      );

      resultsEl.innerHTML = lines.join("");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      reset();
      if (resultsEl) resultsEl.textContent = "";
    });
  }
})();
