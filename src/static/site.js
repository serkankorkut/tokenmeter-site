document.querySelectorAll("[data-copy]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = document.getElementById(btn.dataset.copy).textContent.trim();
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const r = document.createRange(); r.selectNodeContents(document.getElementById(btn.dataset.copy));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges();
    }
    const label = btn.textContent; btn.textContent = "Copied"; btn.classList.add("done");
    setTimeout(() => { btn.textContent = label; btn.classList.remove("done"); }, 1600);
  });
});
const tabs = document.querySelector("[data-os-tabs]");
if (tabs) {
  const pick = os => {
    tabs.querySelectorAll("[role=tab]").forEach(t => t.setAttribute("aria-selected", t.dataset.os === os));
    document.querySelectorAll("[data-os-panel]").forEach(p => p.hidden = p.dataset.osPanel !== os);
  };
  tabs.querySelectorAll("[role=tab]").forEach(t => t.addEventListener("click", () => pick(t.dataset.os)));
  const ua = navigator.userAgent;
  pick(/Windows/.test(ua) ? "windows" : /Linux|X11/.test(ua) && !/Android/.test(ua) ? "linux" : "macos");
}