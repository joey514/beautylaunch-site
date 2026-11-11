(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page loader ---------- */
  var loader = document.getElementById('page-loader');
  if (loader) {
    var hide = function () { loader.classList.add('loaded'); };
    if (reduceMotion) hide();
    else window.setTimeout(hide, 1400);
    window.addEventListener('load', function () { window.setTimeout(hide, 1600); });
  }

  /* ---------- Header ---------- */
  var hdr = document.getElementById('hdr');
  var onScroll = function () { hdr.classList.toggle('sc', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var tog = document.getElementById('m-tog');
  var mnav = document.getElementById('m-nav');
  function closeMenu() {
    tog.classList.remove('act'); mnav.classList.remove('open');
    tog.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }
  if (tog && mnav) {
    tog.addEventListener('click', function () {
      var open = !mnav.classList.contains('open');
      tog.classList.toggle('act', open); mnav.classList.toggle('open', open);
      tog.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('open')) closeMenu(); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.rv, .rv-l, .rv-s');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('vis'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Safety: anything still hidden after 4s becomes visible */
    window.setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('vis'); }); }, 4000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('vis'); });
  }

  /* ---------- Hero stat count-up ---------- */
  document.querySelectorAll(".hero-stat-n[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) return;
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.setTimeout(function () { window.requestAnimationFrame(step); }, 1700);
  });

  /* ---------- Services: tabs + mobile accordion ---------- */
  var tabBtns = document.querySelectorAll('.svc-nav-item');
  var panels = document.querySelectorAll('.svc-content');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      var panel = document.querySelector('.svc-content[data-panel="' + i + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  var acc = document.getElementById('svc-accordion');
  if (acc && panels.length) {
    panels.forEach(function (p, i) {
      var item = document.createElement('div');
      item.className = 'svc-acc-item' + (i === 0 ? ' open' : '');
      var title = p.querySelector('.svc-content-title').textContent;
      var desc = p.querySelector('.svc-content-desc').textContent;
      item.innerHTML =
        '<button class="svc-acc-trigger" aria-expanded="' + (i === 0) + '">' +
          '<span class="svc-acc-num">0' + (i + 1) + '</span>' +
          '<span class="svc-acc-label"></span>' +
          '<span class="svc-acc-plus"><svg viewBox="0 0 24 24" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>' +
        '</button><div class="svc-acc-body"><p></p></div>';
      item.querySelector('.svc-acc-label').textContent = title;
      item.querySelector('.svc-acc-body p').textContent = desc;
      item.querySelector('.svc-acc-trigger').addEventListener('click', function () {
        var open = !item.classList.contains('open');
        acc.querySelectorAll('.svc-acc-item').forEach(function (it) { it.classList.remove('open'); it.querySelector('.svc-acc-trigger').setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('open'); this.setAttribute('aria-expanded', 'true'); }
      });
      acc.appendChild(item);
    });
  }

  /* ---------- Process connecting line ---------- */
  var strip = document.getElementById('proc-strip');
  if (strip && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { strip.classList.add('line-anim'); sio.disconnect(); } });
    }, { threshold: 0.3 });
    sio.observe(strip);
  } else if (strip) { strip.classList.add('line-anim'); }

  /* ---------- Results carousel ---------- */
  var track = document.getElementById('cc-track');
  var prev = document.getElementById('cc-prev');
  var next = document.getElementById('cc-next');
  if (track && prev && next) {
    var index = 0;
    function perView() { var w = window.innerWidth; return w <= 768 ? 1 : (w <= 1100 ? 2 : 3); }
    function update() {
      var cards = track.children;
      var max = Math.max(0, cards.length - perView());
      if (index > max) index = max;
      if (index < 0) index = 0;
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
      var offset = index * (card.offsetWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      prev.disabled = index === 0; next.disabled = index === max;
      prev.style.opacity = index === 0 ? '.4' : '1'; next.style.opacity = index === max ? '.4' : '1';
    }
    prev.addEventListener('click', function () { index -= 1; update(); });
    next.addEventListener('click', function () { index += 1; update(); });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var open = !item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (it) { it.classList.remove('open'); it.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Reviews marquee: duplicate for seamless loop ---------- */
  ['grev-1', 'grev-2'].forEach(function (id) {
    var t = document.getElementById(id);
    if (!t) return;
    var clone = t.innerHTML;
    t.insertAdjacentHTML('beforeend', clone);
    t.querySelectorAll('.grev-card').forEach(function (c, i, all) { if (i >= all.length / 2) c.setAttribute('aria-hidden', 'true'); });
  });

  /* ---------- Strategy call form (front-end validation only) ---------- */
  var form = document.getElementById('book-form');
  var fine = document.getElementById('form-fine');
  if (form && fine) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (field) {
        var bad = !field.value.trim() || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle('is-invalid', bad);
        if (bad && !firstBad) firstBad = field;
      });
      if (firstBad) {
        fine.classList.remove('is-success');
        fine.textContent = 'Add your name, clinic and a valid email so we know where to send the diagnostic.';
        firstBad.focus();
        return;
      }
      /* TODO: connect to the booking endpoint or CRM (LeadConnector, HubSpot, etc.). */
      fine.classList.add('is-success');
      fine.textContent = 'Request sent. We reply within one business day.';
      form.querySelector('.apply-submit').disabled = true;
    });
  }
})();
