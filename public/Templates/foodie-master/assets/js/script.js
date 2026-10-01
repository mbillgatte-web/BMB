'use strict';



/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const menuToggleBtn = document.querySelector("[data-menu-toggle-btn]");

menuToggleBtn.addEventListener("click", function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
});

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    menuToggleBtn.classList.toggle("active");
  });
}



/**
 * header sticky & back to top
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



/**
 * search box toggle
 */

const searchBtn = document.querySelector("[data-search-btn]");
const searchContainer = document.querySelector("[data-search-container]");
const searchSubmitBtn = document.querySelector("[data-search-submit-btn]");
const searchCloseBtn = document.querySelector("[data-search-close-btn]");

const searchBoxElems = [searchBtn, searchSubmitBtn, searchCloseBtn];

for (let i = 0; i < searchBoxElems.length; i++) {
  searchBoxElems[i].addEventListener("click", function () {
    searchContainer.classList.toggle("active");
    document.body.classList.toggle("active");
  });
}



/**
 * formulaire de réservation -> WhatsApp
 *
 * Le template n'a pas de serveur : à l'envoi, on compose un message avec
 * les champs saisis et on ouvre WhatsApp sur le numéro de l'entreprise
 * (data-phone, rempli depuis content.topbar.phoneHref). Sans numéro, on
 * laisse le formulaire inerte plutôt que d'ouvrir wa.me sur rien.
 */

const reservationForm = document.querySelector("[data-reservation-form]");

if (reservationForm) {
  reservationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const phone = (this.dataset.phone || "").replace(/[^\d]/g, "");
    if (!phone) return;

    const data = new FormData(this);
    const lignes = [
      "Bonjour, je souhaite réserver une table.",
      "Nom : " + (data.get("full_name") || ""),
      "Téléphone : " + (data.get("phone") || ""),
      "Personnes : " + (data.get("total_person") || ""),
      "Date : " + (data.get("booking_date") || "non précisée"),
    ];
    const message = data.get("message");
    if (message) lignes.push("Message : " + message);

    window.open(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(lignes.join("\n")),
      "_blank",
      "noopener"
    );
  });
}



/**
 * move cycle on scroll
 */

const deliveryBoy = document.querySelector("[data-delivery-boy]");

let deliveryBoyMove = -80;
let lastScrollPos = 0;

window.addEventListener("scroll", function () {

  let deliveryBoyTopPos = deliveryBoy.getBoundingClientRect().top;

  if (deliveryBoyTopPos < 500 && deliveryBoyTopPos > -250) {
    let activeScrollPos = window.scrollY;

    if (lastScrollPos < activeScrollPos) {
      deliveryBoyMove += 1;
    } else {
      deliveryBoyMove -= 1;
    }

    lastScrollPos = activeScrollPos;
    deliveryBoy.style.transform = `translateX(${deliveryBoyMove}px)`;
  }

});