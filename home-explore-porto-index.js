const introVeil = document.querySelector("[data-intro-veil]");
if (introVeil && (sessionStorage.getItem("introSeen") || window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
  introVeil.remove();
} else if (introVeil) {
  document.body.classList.add("intro-lock");
  const leaveIntro = () => {
    introVeil.classList.add("is-leaving");
    document.body.classList.remove("intro-lock");
    sessionStorage.setItem("introSeen", "1");
    window.removeEventListener("pointerdown", leaveIntro);
    window.removeEventListener("keydown", leaveIntro);
    window.removeEventListener("wheel", leaveIntro);
    window.removeEventListener("touchstart", leaveIntro);
    setTimeout(() => introVeil.remove(), 550);
  };
  window.addEventListener("pointerdown", leaveIntro);
  window.addEventListener("keydown", leaveIntro);
  window.addEventListener("wheel", leaveIntro, { passive: true });
  window.addEventListener("touchstart", leaveIntro, { passive: true });
}

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
    href: "project-sound-explore-studio-sidebar-en.html",
    link: "See this thinking in Sound Mirror →",
  },
  {
    id: "making",
    label: "Making emphasis",
    copy: "I build early enough for an idea to be touched, misused, and challenged.",
    note: "A prototype is not a conclusion; it makes the next question more honest.",
    href: "project-sound-explore-studio-sidebar-en.html",
    link: "Open Sound Mirror →",
  },
] : [
  {
    id: "research",
    label: "偏向研究",
    copy: "我先去看真实的人怎样绕路、犹豫和自我解释。",
    note: "研究不是前置流程，而是找到值得被设计的问题。",
    href: "project-youfeed.html",
    link: "See this thinking in YouFeed →",
  },
  {
    id: "between",
    label: "研究与构建之间",
    copy: "研究告诉我什么值得做，原型告诉我漏掉了什么。",
    note: "我在两边往返，直到一个抽象判断变成可感知的体验。",
    href: "project-sound-explore-studio-sidebar.html",
    link: "See this thinking in Sound Mirror →",
  },
  {
    id: "making",
    label: "偏向构建",
    copy: "我会尽快把想法做成一个能被触碰、误用和质疑的东西。",
    note: "原型不是结论，它是让下一轮判断更诚实的提问方式。",
    href: "project-sound-explore-studio-sidebar.html",
    link: "Open Sound Mirror →",
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

function showView(target, updateHash = true) {
  if (!viewPanels.some((panel) => panel.dataset.viewPanel === target)) return;

  viewButtons.forEach((button) => {
    const active = button.dataset.viewTarget === target;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== target;
    panel.classList.toggle("is-active", panel.dataset.viewPanel === target);
    if (panel.dataset.viewPanel === target) panel.scrollTop = 0;
  });
  if (window.innerWidth < 821) window.scrollTo(0, 0);

  if (updateHash) {
    const nextHash = target === "about" ? "#about" : `#${target}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  }

  if (languageSwitch) {
    const languageUrl = new URL(languageSwitch.getAttribute("href"), window.location.href);
    languageUrl.hash = target === "about" ? "about" : target;
    languageSwitch.href = `${languageUrl.pathname.split("/").pop()}${languageUrl.hash}`;
  }

  if (window.innerWidth < 821 && updateHash) viewer?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const nextButton = viewButtons[nextIndex];
    nextButton.focus();
    showView(nextButton.dataset.viewTarget);
  });
});

const initialTarget = {
  "#work": "sound",
  "#experience": "about",
  "#contact": "about",
}[window.location.hash] || window.location.hash.slice(1);

if (initialTarget) showView(initialTarget, false);

window.addEventListener("hashchange", () => {
  const target = window.location.hash === "#work" ? "sound" : window.location.hash.slice(1);
  if (target) showView(target, false);
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

const activeView = viewPanels.find((panel) => !panel.hidden)?.dataset.viewPanel || "about";
showView(activeView, false);
