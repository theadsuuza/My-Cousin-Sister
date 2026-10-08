/* My Cousin Sister — page interactions */
(function () {
  'use strict';

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 8, 7) * 60) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Nav shrink on scroll ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Hero parallax ---------- */
  var parallax = document.querySelector('[data-parallax]');
  if (parallax) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          parallax.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0) scale(1.08)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Trailer facade (loads the player only on click) ---------- */
  var facade = document.getElementById('trailerFacade');
  if (facade) {
    facade.addEventListener('click', function () {
      var id = facade.getAttribute('data-video');
      var frame = document.createElement('iframe');
      frame.className = 'trailer__frame';
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      frame.title = 'My Cousin Sister — Trailer';
      frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      frame.setAttribute('allowfullscreen', '');
      facade.replaceWith(frame);
    });
  }

  /* ---------- Screenshot lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImage = lightbox ? lightbox.querySelector('img') : null;
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var current = 0;

  function openLb(index) {
    if (!lightbox || !lbImage || !shots[index]) return;
    current = index;
    lbImage.src = shots[index].querySelector('img').src;
    lightbox.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }
  function closeLb() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }
  function step(dir) {
    if (!shots.length) return;
    current = (current + dir + shots.length) % shots.length;
    lbImage.src = shots[current].querySelector('img').src;
  }

  shots.forEach(function (shot, i) {
    shot.addEventListener('click', function () { openLb(i); });
  });

  if (lightbox) {
    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Download button: 15s wait, then open the link in a new tab ----------
     The tab is opened immediately (browsers only allow window.open during the click)
     onto wait.html, then pointed at the real link once the countdown finishes. */
  var dlBtn = document.getElementById('dlBtn');
  if (dlBtn) {
    var WAIT = 15;
    var label = dlBtn.querySelector('.dl__label');
    var bar = dlBtn.querySelector('.dl__bar i');
    var hint = document.getElementById('dlHint');
    var busy = false;

    dlBtn.addEventListener('click', function () {
      if (busy) return;
      busy = true;

      var href = dlBtn.getAttribute('data-href') || '#';
      var tab = null;
      try { tab = window.open('wait.html', '_blank'); } catch (e) { tab = null; }

      dlBtn.classList.add('is-loading');
      dlBtn.setAttribute('aria-busy', 'true');
      if (hint) hint.textContent = 'Preparing your secure download link…';

      var left = WAIT;
      if (label) label.textContent = 'Please wait ' + left + 's';
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        void bar.offsetWidth;
        bar.style.transition = 'width ' + WAIT + 's linear';
        bar.style.width = '100%';
      }

      var timer = window.setInterval(function () {
        left -= 1;
        if (left > 0) {
          if (label) label.textContent = 'Please wait ' + left + 's';
          return;
        }
        window.clearInterval(timer);
        if (label) label.textContent = 'Opening link…';
        if (hint) hint.textContent = 'Your link opened in a new tab.';

        if (tab && !tab.closed) {
          try { tab.location.href = href; } catch (e) { window.open(href, '_blank', 'noopener'); }
        } else {
          window.open(href, '_blank', 'noopener');
        }

        window.setTimeout(function () {
          busy = false;
          dlBtn.classList.remove('is-loading');
          dlBtn.removeAttribute('aria-busy');
          if (label) label.textContent = 'Download Now';
          if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
          if (hint) hint.textContent = 'Direct link · opens in a new tab';
        }, 1400);
      }, 1000);
    });
  }
})();
