'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = 'Menu';
  navLinks.classList.remove('open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.querySelector('span').textContent = opening ? 'Close' : 'Menu';
  navLinks.classList.toggle('open', opening);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (menuButton.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 621px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const links = [...navLinks.querySelectorAll('a[href^="#"]')];
const sections = links.map(link => document.querySelector(link.getAttribute('href')));
let framePending = false;
function updateActiveSection() {
  let active = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight * .42) active = section.id;
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = 'contact';
  for (const link of links) {
    if (link.getAttribute('href') === '#' + active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  framePending = false;
}
window.addEventListener('scroll', () => {
  if (!framePending) { framePending = true; requestAnimationFrame(updateActiveSection); }
}, { passive: true });
window.addEventListener('resize', updateActiveSection);
updateActiveSection();
const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
let copyReset;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyReset);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('ZaidAsaireh@gmail.com');
    copyButton.querySelector('span').textContent = 'Copied';
    copyStatus.textContent = 'Email address copied to your clipboard.';
    copyReset = setTimeout(() => { copyButton.querySelector('span').textContent = 'Copy email'; copyStatus.textContent = ''; }, 5000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email-link span'));
    const selection = window.getSelection();
    if (selection) { selection.removeAllRanges(); selection.addRange(range); }
    copyStatus.textContent = 'Email selected. Use your device’s Copy command, or tap the email to open your mail app.';
  }
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }, { threshold: 0.06 });
  document.querySelectorAll('[data-reveal]').forEach(element => { element.classList.add('reveal-ready'); observer.observe(element); });
}
