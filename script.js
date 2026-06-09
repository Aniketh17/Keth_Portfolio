/* ============================================
   Aniketh K Portfolio — Interactive Logic
   - Scroll reveal (IntersectionObserver)
   - Navbar scroll effect
   - Active section tracking
   - Mobile menu
   ============================================ */

(function () {
  'use strict';

  // ── Scroll Reveal ──────────────────────────
  // Replaces AOS.js with a lightweight IntersectionObserver

  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Once revealed, stop observing (one-time animation)
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately
    revealElements.forEach((el) => el.classList.add('revealed'));
  }


  // ── Navbar Scroll Effect ───────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run on load


  // ── Active Section Tracking ────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }


  // ── Mobile Menu ────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const navLinksContainer = document.getElementById('navLinks');

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (navLinksContainer.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  navLinksContainer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinksContainer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksContainer.classList.contains('active')) {
      toggleMenu();
    }
  });

  // Keyboard support for menu toggle
  menuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });


  // ── Smooth scroll for nav links & scroll indicator ────────────
  // (Enhances the CSS smooth scroll with offset for fixed navbar)
  const scrollElements = document.querySelectorAll('.nav-links a[href^="#"], .scroll-indicator');
  scrollElements.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = navbar.offsetHeight;
          const targetPosition = target.offsetTop - navHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }
      }
    });
  });

  // ── Typewriter Animation ───────────────────
  const typewriterText = document.getElementById('typewriter-text');
  if (typewriterText) {
    const phrases = [
      '< hello world />',
      'print("AI")',
      'import torch',
      'model.fit()',
      'return results'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isTypingDelay = false;

    function type() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100; // Delete faster than typing

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Finished typing current phrase
        typeSpeed = 2000; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        // Finished deleting current phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before typing next phrase
      }

      setTimeout(type, typeSpeed);
    }

    // Start typewriter after a short delay
    setTimeout(type, 1000);
  }

})();
