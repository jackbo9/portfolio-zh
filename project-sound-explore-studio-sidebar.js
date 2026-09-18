const stageButtons = [...document.querySelectorAll("[data-stage-target]")];
const stagePanels = [...document.querySelectorAll("[data-stage-panel]")];
const stageCopies = [...document.querySelectorAll("[data-stage-copy]")];
const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
// The AI Zhihui pages mark their sections with data-zh-chapter while the other
// cases use data-chapter; accept both so the directory tracks them all.
const chapters = [...document.querySelectorAll("[data-chapter], [data-zh-chapter]")];
const chapterKey = (element) => element.dataset.chapter || element.dataset.zhChapter;
const progress = document.querySelector("[data-progress]");
const indexToggle = document.querySelector("[data-index-toggle]");
const indexStack = document.querySelector("[data-index-stack]");

function showStage(target) {
  stageButtons.forEach((button) => {
    const active = button.dataset.stageTarget === target;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  stagePanels.forEach((panel) => { panel.hidden = panel.dataset.stagePanel !== target; });
  stageCopies.forEach((copy) => { copy.hidden = copy.dataset.stageCopy !== target; });
}

stageButtons.forEach((button) => {
  button.addEventListener("click", () => showStage(button.dataset.stageTarget));
  button.addEventListener("keydown", (event) => {
    const currentIndex = stageButtons.indexOf(button);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % stageButtons.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + stageButtons.length) % stageButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = stageButtons.length - 1;
    if (nextIndex === currentIndex && !["Enter", " "].includes(event.key)) return;
    if (["ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "].includes(event.key)) event.preventDefault();
    const nextButton = stageButtons[nextIndex];
    showStage(nextButton.dataset.stageTarget);
    nextButton.focus();
  });
});

indexToggle?.addEventListener("click", () => {
  const open = indexToggle.getAttribute("aria-expanded") !== "true";
  indexToggle.setAttribute("aria-expanded", String(open));
  indexStack?.classList.toggle("is-open", open);
});

// The sticky bar shows "project · current chapter" so readers mid-scroll know
// where they are and can open the directory in one tap.
const projectName = document.querySelector(".project-card h1")?.textContent.replace(/\s+/g, " ").trim() || "";

function chapterLabel(id) {
  const link = chapterLinks.find((candidate) => candidate.dataset.chapterLink === id);
  if (!link) return "";
  const clone = link.cloneNode(true);
  clone.querySelector("span")?.remove();
  return clone.textContent.replace(/\s+/g, " ").trim();
}

function refreshIndexLabel() {
  if (!indexToggle) return;
  const current = chapterLinks.find((link) => link.classList.contains("is-active"))?.dataset.chapterLink
    || chapterLinks[0]?.dataset.chapterLink;
  const label = chapterLabel(current);
  const text = [projectName, label].filter(Boolean).join(" \u00b7 ");
  if (text) indexToggle.textContent = `${text} \u25be`;
}

if (indexToggle && indexStack) {
  if (!indexStack.id) indexStack.id = "case-index-stack";
  indexToggle.setAttribute("aria-controls", indexStack.id);
}

function closeIndex() {
  if (indexToggle?.getAttribute("aria-expanded") !== "true") return false;
  indexToggle.setAttribute("aria-expanded", "false");
  indexStack?.classList.remove("is-open");
  indexToggle.focus();
  return true;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeIndex();
});

chapterLinks.forEach((link) => {
  link.addEventListener("click", () => {
    indexToggle?.setAttribute("aria-expanded", "false");
    indexStack?.classList.remove("is-open");
  });
});

const chapterObserver = new IntersectionObserver((entries) => {
  const current = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!current) return;
  chapterLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.chapterLink === chapterKey(current.target));
  });
  refreshIndexLabel();
}, { rootMargin: "-18% 0px -65% 0px", threshold: [0, .15, .4] });

chapters.forEach((chapter) => chapterObserver.observe(chapter));
refreshIndexLabel();

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
