(function () {
  var STATE_KEY = "__a11yTableNameChecker";
  var LINK_SELECTOR = "[data-bookmarklet=\"table-name-checker\"]";
  var PANEL_SELECTOR = "[data-a11y-table-name-check=\"panel\"]";
  var BADGE_SELECTOR = "[data-a11y-table-name-check=\"badge\"]";
  var PREFIX = "javascript:";
  var DOT = "●";
  var LIST_LABEL = "Results by table";
  var ERROR_TEXT = "The check could not run on this page.";
  var SEPARATOR = " \u00b7 ";

  var STATUSES = {
    solid: { kind: "pass", text: "Pass" },
    dotted: { kind: "review", text: "Needs review" },
    dashed: { kind: "fail", text: "Fail" }
  };

  var link = document.querySelector(LINK_SELECTOR);
  var stage = document.getElementById("demo-stage");
  var runButton = document.getElementById("demo-run");
  var clearButton = document.getElementById("demo-clear");
  var results = document.getElementById("demo-results");

  if (!link || !stage || !runButton || !clearButton || !results) {
    return;
  }

  function clearResults() {
    results.textContent = "";
  }

  function clearChecker() {
    if (window[STATE_KEY]) {
      window[STATE_KEY].clear();
    }
  }

  function runBookmarklet() {
    var href = link.getAttribute("href") || "";
    if (href.indexOf(PREFIX) !== 0) {
      throw new Error("Missing bookmarklet code");
    }
    new Function(decodeURIComponent(href.slice(PREFIX.length)))();
  }

  function syncClear() {
    var state = window[STATE_KEY];
    if (!state) {
      return;
    }
    var original = state.clear;
    state.clear = function () {
      original();
      clearResults();
    };
  }

  function removePanel(panel) {
    if (panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
  }

  function makeLine(text) {
    var line = document.createElement("p");
    line.className = "demo__results-line";
    line.textContent = text;
    return line;
  }

  function renderSummary(panel) {
    Array.prototype.slice.call(panel.querySelectorAll("p")).forEach(function (line) {
      results.appendChild(makeLine(line.textContent.replace(DOT, "").trim()));
    });
  }

  function statusFor(badge) {
    var table = badge.nextElementSibling;
    return table ? STATUSES[table.style.outlineStyle] || null : null;
  }

  function makeItem(badge) {
    var item = document.createElement("li");
    var status = statusFor(badge);
    item.className = "demo__results-item";
    if (status) {
      var label = document.createElement("span");
      label.className = "demo__results-status demo__results-status--" + status.kind;
      label.textContent = status.text;
      item.appendChild(label);
      item.appendChild(document.createTextNode(SEPARATOR));
    }
    item.appendChild(document.createTextNode(badge.textContent));
    return item;
  }

  function renderTables() {
    var badges = Array.prototype.slice.call(stage.querySelectorAll(BADGE_SELECTOR));
    if (!badges.length) {
      return;
    }
    var list = document.createElement("ol");
    list.className = "demo__results-list";
    list.setAttribute("aria-label", LIST_LABEL);
    badges.forEach(function (badge) {
      list.appendChild(makeItem(badge));
    });
    results.appendChild(list);
  }

  function renderResults() {
    var panel = document.querySelector(PANEL_SELECTOR);
    clearResults();
    if (!panel) {
      return;
    }
    renderSummary(panel);
    removePanel(panel);
    renderTables();
  }

  runButton.addEventListener("click", function () {
    clearChecker();
    try {
      runBookmarklet();
    } catch (error) {
      clearChecker();
      clearResults();
      results.appendChild(makeLine(ERROR_TEXT));
      return;
    }
    syncClear();
    renderResults();
  });

  clearButton.addEventListener("click", function () {
    clearChecker();
    clearResults();
  });
})();
