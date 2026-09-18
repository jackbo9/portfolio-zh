const viewButtons = [...document.querySelectorAll("[data-view-target]")];
const viewPanels = [...document.querySelectorAll("[data-view-panel]")];
const viewer = document.querySelector(".viewer");
const practiceView = document.querySelector(".practice-view");
const practiceBalance = document.querySelector("#practice-balance");
const practiceCopy = document.querySelector("[data-practice-copy]");
const practiceNote = document.querySelector("[data-practice-note]");
const practiceLink = document.querySelector("[data-practice-link]");
const practicePoles = [...document.querySelectorAll("[data-practice-value]")];
const evidencePieces = [...document.querySelectorAll("[data-evidence-piece]")];
const evidenceDepthLabels = [...document.querySelectorAll("[data-evidence-depth]")];
const languageSwitch = document.querySelector(".language-switch");
const viewList = document.querySelector(".index-list");

function syncViewSemantics() {
  viewList?.setAttribute("role", "tablist");
  viewList?.setAttribute("aria-orientation", window.innerWidth < 821 ? "horizontal" : "vertical");

  viewButtons.forEach((button, index) => {
    const target = button.dataset.viewTarget;
    const panel = viewPanels.find((candidate) => candidate.dataset.viewPanel === target);
    const isActive = button.classList.contains("is-active");
    button.id = `portfolio-tab-${target}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `portfolio-panel-${target}`);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    button.removeAttribute("aria-pressed");
    if (panel) {
      panel.id = `portfolio-panel-${target}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      if (index === 0) panel.tabIndex = 0;
    }
  });
}

const isEnglish = document.documentElement.lang === "en";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const practiceStates = isEnglish ? [
  {
    id: "research",
    label: "Research emphasis",
    copy: "I look first at how people detour, hesitate, and explain their own behaviour.",
    note: "Research is not a pre-build ceremony; it identifies the problem worth designing.",
    href: "project-youfeed-en.html",
    link: "See this thinking in YouFeed →",
  },
  {
    id: "between",
    label: "Between research and making",
    copy: "Research tells me what deserves to exist. Prototypes show me what I missed.",
    note: "I move between both until an abstract judgement becomes a testable experience.",
    href: "project-ai-zhihui-en.html",
    link: "See this thinking in AI Zhihui →",
  },
  {
    id: "making",
    label: "Making emphasis",
    copy: "I build early enough for an idea to be touched, misused, and challenged.",
    note: "A prototype is not a conclusion; it makes the next question more honest.",
    href: "project-ai-zhihui-en.html",
    link: "Open AI Zhihui →",
  },
] : [
  {
    id: "research",
    label: "偏向研究",
    copy: "我先去看真实的人怎样绕路、犹豫和自我解释。",
    note: "研究不是前置流程，而是找到值得被设计的问题。",
    href: "project-youfeed.html",
    link: "在 YouFeed 里看这条思路 →",
  },
  {
    id: "between",
    label: "研究与构建之间",
    copy: "研究告诉我什么值得做，原型告诉我漏掉了什么。",
    note: "我在两边往返，直到一个抽象判断变成可感知的体验。",
    href: "project-ai-zhihui.html",
    link: "在 AI智绘 里看这条思路 →",
  },
  {
    id: "making",
    label: "偏向构建",
    copy: "我会尽快把想法做成一个能被触碰、误用和质疑的东西。",
    note: "原型不是结论，它是让下一轮判断更诚实的提问方式。",
    href: "project-ai-zhihui.html",
    link: "打开 AI智绘案例 →",
  },
];

function updatePractice(rawValue, shouldSnap = false) {
  if (!practiceView || !practiceBalance) return;

  let balance = Math.max(0, Math.min(2, Number(rawValue)));
  if (shouldSnap) balance = Math.round(balance);

  const state = practiceStates[Math.round(balance)];
  const researchLevel = (2 - balance) / 2;
  const makingLevel = balance / 2;

  practiceBalance.value = String(balance);
  practiceBalance.setAttribute("aria-valuetext", state.label);
  practiceView.dataset.practiceState = state.id;
  practiceView.style.setProperty("--practice-balance", balance);
  practiceView.style.setProperty("--research-col", `${(.85 + researchLevel).toFixed(3)}fr`);
  practiceView.style.setProperty("--making-col", `${(.85 + makingLevel).toFixed(3)}fr`);

  evidencePieces.forEach((piece) => {
    const level = piece.dataset.evidencePiece === "research" ? researchLevel : makingLevel;
    const symbolOpacity = Math.max(0, 1 - level * 2);
    const detailOpacity = Math.min(1, level * 2);
    const sceneProgress = Math.max(0, level * 2 - 1);
    const sceneOpacity = sceneProgress > 0 ? 1 : 0;
    const frameHeight = 150 + level * 180;

    piece.style.setProperty("--evidence-level", level.toFixed(3));
    piece.style.setProperty("--symbol-opacity", symbolOpacity.toFixed(3));
    piece.style.setProperty("--detail-opacity", detailOpacity.toFixed(3));
    piece.style.setProperty("--scene-opacity", sceneOpacity.toFixed(3));
    piece.style.setProperty("--scene-progress", sceneProgress.toFixed(3));
    piece.style.setProperty("--frame-height", `${frameHeight.toFixed(0)}px`);
    piece.style.flexGrow = String(.55 + level * 1.45);
  });

  evidenceDepthLabels.forEach((label) => {
    const level = label.dataset.evidenceDepth === "research" ? researchLevel : makingLevel;
    label.textContent = level < .34 ? "Signal" : level < .67 ? "Interface" : "Context";
  });

  if (practiceCopy) practiceCopy.textContent = state.copy;
  if (practiceNote) practiceNote.textContent = state.note;
  if (practiceLink) {
    practiceLink.textContent = state.link;
    practiceLink.href = state.href;
  }

  practicePoles.forEach((pole) => {
    const isCurrent = Number(pole.dataset.practiceValue) === Math.round(balance);
    pole.classList.toggle("is-current", isCurrent);
    pole.setAttribute("aria-pressed", String(isCurrent));
  });
}

const scrollMemory = new Map();
const hashForTarget = (target) => (target === "about" ? "#about" : `#${target}`);

function viewButtonFor(target) {
  return viewButtons.find((button) => button.dataset.viewTarget === target);
}

function panelFor(target) {
  return viewPanels.find((panel) => panel.dataset.viewPanel === target);
}

function activeTarget() {
  return viewPanels.find((panel) => !panel.hidden)?.dataset.viewPanel || "about";
}

/**
 * mode:
 *   "push"    - a deliberate project switch, so Back/Forward moves between projects
 *   "replace" - initial load and hash normalisation
 *   "silent"  - history already moved (popstate / hashchange); do not write it again
 */
function showView(target, mode = "push") {
  if (!viewPanels.some((panel) => panel.dataset.viewPanel === target)) return;

  const previous = activeTarget();
  if (previous !== target && window.innerWidth >= 821) {
    const previousPanel = panelFor(previous);
    if (previousPanel) scrollMemory.set(previous, previousPanel.scrollTop);
  }

  viewButtons.forEach((button) => {
    const active = button.dataset.viewTarget === target;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== target;
    panel.classList.toggle("is-active", panel.dataset.viewPanel === target);
  });

  const targetPanel = panelFor(target);
  if (targetPanel) targetPanel.scrollTop = scrollMemory.get(target) ?? 0;

  if (mode !== "silent") {
    const nextHash = hashForTarget(target);
    if (window.location.hash !== nextHash) {
      const url = `${window.location.pathname}${window.location.search}${nextHash}`;
      if (mode === "replace") history.replaceState({ target }, "", url);
      else history.pushState({ target }, "", url);
    } else {
      history.replaceState({ target }, "", window.location.href);
    }
  }

  if (languageSwitch) {
    const languageUrl = new URL(languageSwitch.getAttribute("href"), window.location.href);
    languageUrl.hash = target === "about" ? "about" : target;
    languageSwitch.href = `${languageUrl.pathname.split("/").pop()}${languageUrl.hash}`;
  }

  if (window.innerWidth < 821 && mode === "push") {
    viewer?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.viewTarget));
  button.addEventListener("keydown", (event) => {
    const horizontal = window.innerWidth < 821;
    const previousKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    if (![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = viewButtons.indexOf(button);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? viewButtons.length - 1
        : event.key === nextKey
          ? (currentIndex + 1) % viewButtons.length
          : (currentIndex - 1 + viewButtons.length) % viewButtons.length;
    // Arrow keys only move focus; Enter/Space commits, so keyboard traversal
    // does not flood the history stack with a project per keypress.
    viewButtons[nextIndex].focus();
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    showView(button.dataset.viewTarget, "push");
  });
});

const initialTarget = {
  "#work": "zhihui",
  "#experience": "about",
  "#contact": "about",
}[window.location.hash] || window.location.hash.slice(1);

const resolvedInitial = viewPanels.some((panel) => panel.dataset.viewPanel === initialTarget)
  ? initialTarget
  : activeTarget();

showView(resolvedInitial, "replace");

window.addEventListener("hashchange", () => {
  const target = window.location.hash === "#work"
    ? "zhihui"
    : (window.location.hash.slice(1) || activeTarget());
  showView(target, "silent");
});

window.addEventListener("popstate", (event) => {
  const fromState = event.state && event.state.target;
  const fromHash = window.location.hash === "#work"
    ? "zhihui"
    : window.location.hash.slice(1);
  const target = viewPanels.some((panel) => panel.dataset.viewPanel === fromState)
    ? fromState
    : fromHash;
  if (viewPanels.some((panel) => panel.dataset.viewPanel === target)) showView(target, "silent");
});

practiceBalance?.addEventListener("input", () => {
  updatePractice(practiceBalance.value);
});

practiceBalance?.addEventListener("change", () => updatePractice(practiceBalance.value));

practicePoles.forEach((pole) => {
  pole.addEventListener("click", () => {
    updatePractice(pole.dataset.practiceValue, true);
  });
});

syncViewSemantics();
window.addEventListener("resize", syncViewSemantics);
updatePractice(practiceBalance?.value ?? 1, true);

showView(activeTarget(), "replace");
