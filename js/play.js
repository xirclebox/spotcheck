// Demo popover fun
const btn = document.getElementById("fadeOut");
const popupDemo = document.getElementById("example-popup");

let fadeTimeout;

btn.addEventListener("click", () => {
  startFade(popupDemo);
});

function startFade(element) {
  element.classList.add("fading");
  btn.disabled = true;
  btn.classList.add("fade-out-btn");

  clearTimeout(fadeTimeout);
  fadeTimeout = setTimeout(() => {
    element.classList.remove("fading");
    btn.disabled = false;
    btn.classList.remove("fade-out-btn");
  }, 4500);
}

// Copy stuff
var copyBtn = document.getElementById("copy-source");
var codeEl = document.getElementById("source-code");
if (copyBtn && codeEl) {
  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(codeEl.textContent).then(function () {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copy-button--copied");
      setTimeout(function () {
        copyBtn.textContent = "Copy source";
        copyBtn.classList.remove("copy-button--copied");
      }, 2000);
    });
  });
}

// bookmarklet tracking
const track = (name, data) => window.umami?.track(name, data);

const handle = (event, action) => {
  const link = event.target.closest?.("a[data-bookmarklet]");
  const tool = link?.dataset.bookmarklet;
  if (!tool) return null;

  track(`${tool}-${action}`, { tool, action });
  return link;
};

document.addEventListener("dragstart", (event) => {
  handle(event, "drag");
});
