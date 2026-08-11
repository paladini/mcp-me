/* ============================================
   mcp-me Landing Page — Interactions
   ============================================ */

(function () {
  "use strict";

  // --- Scroll-based nav shadow ---
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("nav--scrolled", window.scrollY > 10);
      },
      { passive: true }
    );
  }

  // --- Mobile menu toggle ---
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    // Close on link click
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Intersection Observer for fade-in ---
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in, .fade-in-group").forEach((el) => {
    observer.observe(el);
  });

  // --- Copy to clipboard ---
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector("svg");
        const original = icon ? icon.innerHTML : "";
        if (icon) {
          icon.innerHTML =
            '<polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
          setTimeout(() => {
            icon.innerHTML = original;
          }, 1500);
        }
      });
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const top =
          target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
})();
