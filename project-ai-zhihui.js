// Long editorial sections need a position-based chapter indicator.
const zhChapters = [...document.querySelectorAll('[data-zh-chapter]')];
const zhLinks = [...document.querySelectorAll('[data-chapter-link]')];
let zhScheduled = false;
function updateZhChapter() {
  const readingLine = window.innerHeight * .3;
  const current = [...zhChapters].reverse().find(section => section.getBoundingClientRect().top <= readingLine) || zhChapters[0];
  zhLinks.forEach(link => {
    const active = link.dataset.chapterLink === current?.dataset.zhChapter;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  zhScheduled = false;
}
function scheduleZhChapter() {
  if (!zhScheduled) { zhScheduled = true; requestAnimationFrame(updateZhChapter); }
}
window.addEventListener('scroll', scheduleZhChapter, { passive: true });
window.addEventListener('resize', scheduleZhChapter);
window.addEventListener('load', updateZhChapter);
updateZhChapter();
