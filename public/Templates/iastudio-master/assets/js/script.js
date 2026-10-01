'use strict';

(function () {

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * En-tête qui se condense au défilement
 */
const header = document.querySelector('[data-header]');

function onScroll() {
  header.classList.toggle('is-compact', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/**
 * Menu mobile (bouton texte « Menu » / « Fermer »)
 */
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navToggleText = document.querySelector('[data-nav-toggle-text]');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggleText.textContent = open ? 'Fermer' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
}

navToggle.addEventListener('click', function () {
  setMenu(!nav.classList.contains('is-open'));
});
document.querySelectorAll('[data-nav-link]').forEach(function (link) {
  link.addEventListener('click', function () { setMenu(false); });
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
});

/**
 * Apparition en cascade au défilement (IntersectionObserver)
 */
const revealElements = document.querySelectorAll('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach(function (el) { el.classList.add('is-visible'); });
} else {
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    group.querySelectorAll('[data-reveal]').forEach(function (el, index) {
      el.style.setProperty('--delay', Math.min(index, 8) * 90 + 'ms');
    });
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  revealElements.forEach(function (el) { observer.observe(el); });
}

/**
 * Formulaire de rendez-vous -> WhatsApp.
 * Pas de serveur : on compose un message avec les champs saisis et on ouvre
 * WhatsApp sur le numéro de l'entreprise (data-phone, rempli depuis
 * content.topbar.phoneHref). Sans numéro, le formulaire reste inerte.
 */
const form = document.querySelector('[data-whatsapp-form]');

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const phone = (form.dataset.phone || '').replace(/[^\d]/g, '');
    if (!phone) return;

    const data = new FormData(form);
    const lignes = [
      form.dataset.intro || 'Bonjour, je souhaite prendre rendez-vous.',
      'Nom : ' + (data.get('nom') || ''),
      'Entreprise : ' + (data.get('entreprise') || 'non précisée'),
      'Téléphone : ' + (data.get('telephone') || ''),
      'Sujet : ' + (data.get('sujet') || ''),
      'Créneau : ' + (data.get('creneau') || ''),
    ];
    const message = data.get('message');
    if (message) lignes.push('À automatiser : ' + message);

    window.open(
      'https://wa.me/' + phone + '?text=' + encodeURIComponent(lignes.join('\n')),
      '_blank',
      'noopener'
    );
  });
}

})();
