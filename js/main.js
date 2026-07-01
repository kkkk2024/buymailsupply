(function () {
  'use strict';

  var html = document.documentElement;
  var langBtns = document.querySelectorAll('.lang-btn');
  var typedTextEl = document.getElementById('typedText');
  var typedCursor = document.querySelector('.typed-cursor');
  var typeInterval = null;

  // ===== Language Switch =====
  function setLang(lang) {
    // Update text content
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) el.innerHTML = text;
    });
    // Update placeholders
    document.querySelectorAll('[data-' + lang + '-placeholder]').forEach(function (el) {
      var ph = el.getAttribute('data-' + lang + '-placeholder');
      if (ph) el.setAttribute('placeholder', ph);
    });
    // Update buttons
    langBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    html.setAttribute('lang', lang);
    try { localStorage.setItem('clason_lang', lang); } catch (e) {}
    // Restart typewriter on language change
    startTypewriter(lang);
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang'));
    });
  });

  var savedLang = 'en';
  try { savedLang = localStorage.getItem('clason_lang') || 'en'; } catch (e) {}

  // ===== Typewriter effect =====
  function startTypewriter(lang) {
    if (!typedTextEl) return;
    if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
    var text = typedTextEl.getAttribute('data-' + (lang || savedLang)) || typedTextEl.getAttribute('data-en');
    typedTextEl.textContent = '';
    if (typedCursor) typedCursor.style.display = 'inline-block';
    var i = 0;
    typeInterval = setInterval(function () {
      if (i < text.length) {
        typedTextEl.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        typeInterval = null;
      }
    }, 60);
  }

  // Initial load
  setLang(savedLang);

  // ===== Navbar scroll =====
  var navbar = document.getElementById('navbar');
  var backTop = document.getElementById('backTop');
  function onScroll() {
    var y = window.pageYOffset;
    if (navbar) navbar.classList.toggle('scrolled', y > 50);
    if (backTop) backTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Back to top =====
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Mobile menu =====
  var mobileToggle = document.getElementById('mobileToggle');
  var navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // ===== Reveal animations =====
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== Counter animation =====
  var counters = document.querySelectorAll('[data-counter]');
  var counterAnimated = {};
  function animateCounter(el) {
    var targetEl = el.querySelector('[data-target]');
    var target = parseInt(targetEl.getAttribute('data-target'), 10);
    var duration = 1800;
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      targetEl.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else targetEl.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counterAnimated[entry.target]) {
          counterAnimated[entry.target] = true;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.querySelector('[data-target]').textContent = el.querySelector('[data-target]').getAttribute('data-target');
    });
  }

  // ===== Testimonial Slider =====
  var slides = document.querySelectorAll('.testi-slide');
  var dotsContainer = document.getElementById('tcDots');
  var prevBtn = document.getElementById('prevSlide');
  var nextBtn = document.getElementById('nextSlide');
  var currentSlide = 0;
  var slideTimer = null;

  if (slides.length && dotsContainer) {
    slides.forEach(function (_, idx) {
      var dot = document.createElement('span');
      dot.className = 'tc-dot' + (idx === 0 ? ' active' : '');
      dot.addEventListener('click', function () { goTo(idx); });
      dotsContainer.appendChild(dot);
    });

    function goTo(idx) {
      slides[currentSlide].classList.remove('active');
      dotsContainer.children[currentSlide].classList.remove('active');
      currentSlide = (idx + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dotsContainer.children[currentSlide].classList.add('active');
      resetTimer();
    }

    function next() { goTo(currentSlide + 1); }
    function prev() { goTo(currentSlide - 1); }

    function resetTimer() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(next, 5000);
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    resetTimer();
  }

  // ===== Contact form =====
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.innerHTML;
      var currentLang = 'en';
      try { currentLang = localStorage.getItem('clason_lang') || 'en'; } catch (e) {}
      btn.disabled = true;
      btn.innerHTML = currentLang === 'ru' ? 'Отправка...' : 'Sending...';
      setTimeout(function () {
        btn.innerHTML = currentLang === 'ru' ? '✓ Отправлено!' : '✓ Sent!';
        btn.style.background = '#16a34a';
        form.reset();
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }, 1200);
    });
  }

  // ===== Smooth scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || !href) return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
