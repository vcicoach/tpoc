/* ============================================================
   EVENT LANDING — RENDERER
   Reads window.SITE (content) + window.THEME (token overrides)
   and builds the page into #app. Add/remove/reorder sections by
   editing SITE.sections — no layout code changes needed.

   Section types:
     header · hero · marquee · prose · quote · cards · ctaBand ·
     split · numberedGrid · numberedList · mentors · feature ·
     valueGrid · statement · finalCta · footer ·
     logosStrip · testimonials · faq
   Extras (outside sections): SITE.stickyBar, SITE.tracking
   ============================================================ */
(function () {
  var SITE = window.SITE || {};
  var THEME = window.THEME || {};

  // Apply theme token overrides to :root (re-theme without touching ds.css)
  var rootStyle = document.documentElement.style;
  Object.keys(THEME).forEach(function (k) { rootStyle.setProperty('--' + k, THEME[k]); });

  /* —— tiny helpers —— */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // author-authored copy may contain intentional HTML; expand markers only:
  //   **bold**, *italic*, ==accent==, newline → <br>
  function rich(s) {
    return String(s == null ? '' : s)
      .replace(/==(.+?)==/g, '<span class="ds-orange">$1</span>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.+?)\*/g, '<i>$1</i>')
      .replace(/\n/g, '<br>');
  }
  function attr(s) { return esc(s).replace(/"/g, '&quot;'); }
  // image with lazy-loading by default (hero passes {eager:true})
  function img(src, alt, opts) {
    opts = opts || {};
    return '<img src="' + attr(src) + '" alt="' + attr(alt || '') + '"' +
      (opts.cls ? ' class="' + opts.cls + '"' : '') +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
  }
  function cta(c, cls) {
    if (!c) return '';
    var inner = '<span class="main">' + esc(c.label) + '</span>' +
      (c.sub ? '<span class="sub">' + esc(c.sub) + '</span>' : '');
    // Mọi nút là link tới trang đăng ký (không popup)
    var href = SITE.registerUrl || c.href || '#register';
    return '<a href="' + attr(href) + '" class="btn shine ' + (cls || '') + '">' + inner + '</a>';
  }
  function wordmark(w) {
    if (!w) return '';
    return esc(w.pre) +
      (w.accent ? '<span class="for">' + esc(w.accent) + '</span>' : ' ') +
      esc(w.mid || '') + ' ' +
      '<span class="live">' + esc(w.post) +
      (w.brush ? '<img src="' + attr(w.brush) + '" class="brush" alt="">' : '') +
      '</span>';
  }

  /* —— section renderers —— */
  var R = {
    header: function (s) {
      return '<header><div class="nav">' +
        '<img src="' + attr(s.logo) + '" class="logo" alt="' + attr(s.alt || 'Logo') + '" fetchpriority="high">' +
        (s.note ? '<div class="nav-mid"><span class="dot"></span>' + esc(s.note) + '</div>' : '') +
        cta(s.cta) + '</div></header>';
    },

    hero: function (s) {
      var f = s.form || {};
      var fields = (f.fields || []).map(function (fl, i) {
        var id = 'fld_' + i;
        return '<div class="field">' +
          '<label for="' + id + '">' + esc(fl.label || fl.placeholder) + '</label>' +
          '<input id="' + id + '" name="' + attr(fl.name || ('f' + i)) + '" type="' + attr(fl.type || 'text') + '" placeholder="' +
          attr(fl.placeholder) + '"' + (fl.required ? ' required' : '') +
          (fl.type === 'tel' ? ' inputmode="tel" pattern="[0-9 +().-]{8,}"' : '') +
          (fl.type === 'email' ? ' inputmode="email"' : '') + '>' +
          (fl.icon ? '<span class="ic" aria-hidden="true">' + fl.icon + '</span>' : '') + '</div>';
      }).join('');
      var cd = s.countdown ? '<div class="countdown" id="countdown" aria-live="off">' +
        (s.countdownLabels || ['Days', 'Hours', 'Minutes', 'Seconds']).map(function (l, i) {
          return '<div class="cd"><div class="num" data-cd="' + 'dhms'[i] +
            '">00</div><div class="lbl">' + esc(l) + '</div></div>';
        }).join('') + '</div>' : '';
      var head = (s.present ? '<div class="present">' + esc(s.present) + '</div>' : '') +
        '<h1 class="wordmark">' + wordmark(s.wordmark) + '</h1>' +
        (s.sub ? '<p class="sub">' + rich(s.sub) + '</p>' : '') +
        (s.date ? '<div class="date">' + esc(s.date) + '</div>' : '');
      var hasCard = !!(f && (f.fields || f.heading || f.cta || f.demand));
      var cardInner = f.fields
        ? '<form class="reg" novalidate onsubmit="return MFL.submit(event)">' + fields + cta(f.cta) +
            (f.consent ? '<p class="consent">' + f.consent + '</p>' : '') +
            '<p class="form-msg" role="status" aria-live="polite"></p></form>'
        : cta(f.cta) + (f.note ? '<p class="consent">' + f.note + '</p>' : '');
      var formHtml = hasCard ? '<div class="formcard" id="register">' +
        (f.demand ? '<div class="demand"><span class="pill">' + esc(f.demand.pill) + '</span> <span>' + rich(f.demand.text) + '</span></div>' : '') +
        (f.heading ? '<h2 class="big">' + f.heading + '</h2>' : '') +
        (f.join ? '<p class="join">' + esc(f.join) + '</p>' : '') +
        cd + cardInner + '</div>' : '';
      // Split = 2-column hero (media left, form right) like the Meant-for-More reference
      if (s.split && s.image && formHtml) {
        var media = '<div class="hero-media">' +
          (s.mediaLabel ? '<span class="hero-media-top">' + esc(s.mediaLabel) + '</span>' : '') +
          img(s.image, s.imageAlt, { cls: 'hero-img', eager: true }) +
          (s.video ? '<button type="button" class="hero-play" aria-label="Xem video giới thiệu" onclick="MFL.openVideo(\'' + attr(s.video) + '\')"><span class="hero-play-ring"></span></button>' : '') +
          (s.mediaCaption ? '<span class="hero-media-bot">' + esc(s.mediaCaption) + '</span>' : '') +
          '</div>';
        return '<section class="hero"><div class="ds-wrap">' +
          '<div class="hero-head">' + head + '</div>' +
          '<div class="hero-cols">' + media + formHtml + '</div>' +
          '</div></section>';
      }
      // Default stacked hero (unchanged)
      return '<section class="hero"><div class="ds-wrap">' + head +
        (s.image ? img(s.image, s.imageAlt, { cls: 'hero-group', eager: true }) : '') +
        '</div>' + formHtml + '</section>';
    },

    marquee: function (s) {
      var run = (s.items || []).map(function (i) { return '<span>' + esc(i) + '</span><span class="dot">&bull;</span>'; }).join('');
      // One "half" must overflow the widest screen for a seamless, gap-free loop.
      var half = run + run + run;
      return '<div class="marquee" aria-hidden="true"><div class="track">' + half + half + '</div></div>';
    },

    embed: function (s) {
      return '<section class="ds-section embed-section"' + (s.id ? ' id="' + attr(s.id) + '"' : '') + '><div class="ds-wrap ds-center">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        (s.title ? '<h2 class="ds-title">' + rich(s.title) + '</h2>' : '') +
        (s.lead ? '<p class="ds-lead">' + rich(s.lead) + '</p>' : '') +
        (s.html || '') +
        '</div></section>';
    },

    logosStrip: function (s) {
      var logos = (s.logos || []).map(function (l) {
        return l.img ? img(l.img, l.name, { cls: 'logo-item' }) : '<span class="logo-text">' + esc(l.name) + '</span>';
      }).join('');
      return '<section class="logos-strip"><div class="ds-wrap">' +
        (s.label ? '<p class="logos-label">' + esc(s.label) + '</p>' : '') +
        '<div class="logos-row">' + logos + '</div></div></section>';
    },

    prose: function (s) {
      return (s.edgeTop ? '<div class="edge edge-' + s.edgeTop + '-top"></div>' : '') +
        '<section class="ds-section prose ' + (s.pattern ? 'pattern' : '') + '"><div class="ds-wrap ds-center">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        '<div class="body">' + (s.paragraphs || []).map(function (p, i) {
          return '<p class="' + (s.emphasizeIndex === i ? 'lg' : '') + '">' + rich(p) + '</p>';
        }).join('') + '</div></div></section>' +
        (s.edgeBot ? '<div class="edge edge-' + s.edgeBot + '-bot"></div>' : '');
    },

    quote: function (s) {
      return (s.edge ? '<div class="edge edge-soft-top"></div>' : '') +
        '<section class="quote"><div class="qm" aria-hidden="true">&ldquo;</div><div class="ds-wrap">' +
        '<h2>' + (s.text ? '"' + esc(s.text) + ' ' : '') + (s.dim ? '<span class="dim">' + esc(s.dim) + '</span>"' : '') + '</h2>' +
        (s.caption ? '<p class="caption">' + s.caption + '</p>' : '') + cta(s.cta) +
        '</div></section>' + (s.edge ? '<div class="edge edge-soft-bot"></div>' : '');
    },

    cards: function (s) {
      var cards = (s.cards || []).map(function (c) {
        var lead = c.icon ? '<div class="card-ic" aria-hidden="true">' + esc(c.icon) + '</div>'
                          : (c.n ? '<div class="n">' + esc(c.n) + '</div>' : '');
        return '<div class="card' + (c.icon ? ' card-iconled' : '') + '">' + lead +
          '<h3>' + esc(c.h) + '</h3><p>' + rich(c.p) + '</p></div>';
      }).join('');
      return '<section class="ds-section"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        (s.lead ? '<p class="ds-lead">' + rich(s.lead) + '</p>' : '') +
        '<div class="cards-box">' + cards + '</div>' +
        (s.note ? '<div class="afternote"><h3>' + esc(s.note.h) + '</h3>' +
          (s.note.p ? '<p>' + rich(s.note.p) + '</p>' : '') +
          (s.note.em ? '<p class="em">' + rich(s.note.em) + '</p>' : '') + '</div>' : '') +
        (s.cta ? '<div class="btnwrap">' + cta(s.cta) + '</div>' : '') +
        '</div></section>';
    },

    ctaBand: function (s) {
      var ov = s.overlay || 'rgba(27,42,39,.86),rgba(27,42,39,.92)';
      var bg = s.bgImage ? 'background-image:linear-gradient(' + ov + '),url(' + s.bgImage + ');background-size:cover;background-position:center;' : '';
      return '<div class="edge edge-dark-top"></div><section class="ctaband" style="' + bg + '"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2>' + rich(s.title) + '</h2>' + (s.sub ? '<p>' + esc(s.sub) + '</p>' : '') + cta(s.cta) +
        '</div></section><div class="edge edge-dark-bot"></div>';
    },

    split: function (s) {
      var imgs = s.statItems
        ? (s.statItems).map(function (it) {
            return '<div class="statcard" style="background-image:url(' + attr(it.img) + ')">' +
              '<div class="statcard-in"><div class="statnum">' + esc(it.stat) + '</div>' +
              '<div class="statlbl">' + esc(it.label) + '</div></div></div>';
          }).join('')
        : (s.images || []).map(function (i) { return img(i.src, i.alt); }).join('');
      var chips = (s.chips || []).map(function (c) { return '<span class="chip">' + rich(c) + '</span>'; }).join('');
      return '<section class="ds-section"><div class="ds-wrap"><div class="split ' + (s.flip ? 'flip' : '') + '">' +
        '<div class="stack">' + imgs + '</div>' +
        '<div class="txt"><h2>' + rich(s.title) + '</h2>' +
        (s.paragraphs || []).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('') +
        (chips ? '<div class="chips">' + chips + '</div>' : '') +
        '</div></div></div></section>';
    },

    numberedGrid: function (s) {
      var cards = (s.items || []).map(function (c) {
        return '<div class="gc"><div class="n">' + esc(c.n) + '</div><h3>' + esc(c.h) + '</h3><p>' + rich(c.p) + '</p></div>';
      }).join('');
      return '<section class="ds-section band-gray"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        '<div class="grid-cards">' + cards + '</div>' +
        (s.foot ? '<div class="grid-foot">' + rich(s.foot) + '</div>' : '') +
        '</div></section>';
    },

    numberedList: function (s) {
      var rows = (s.items || []).map(function (c) {
        return '<div class="li-row"><div class="num">' + esc(c.n) + '</div><div><h3>' + esc(c.h) + '</h3><p>' + rich(c.p) + '</p></div></div>';
      }).join('');
      return '<section class="dark-list"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        '<div class="listwrap">' + rows + '</div>' +
        (s.cta ? '<div class="btnwrap">' + cta(s.cta) + '</div>' : '') +
        '</div></section>';
    },

    mentors: function (s) {
      var cards = (s.mentors || []).map(function (m) {
        return '<div class="mcard">' + img(m.img, m.name) +
          '<div class="b"><h3>' + esc(m.name) + '</h3><div class="role">' + esc(m.role) + '</div><p>' + rich(m.bio) + '</p></div></div>';
      }).join('');
      var guests = (s.guests || []).map(function (g) { return img(g, 'Guest mentor'); }).join('');
      return '<section class="ds-section"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        '<div class="mgrid">' + cards + '</div>' +
        (s.text ? '<p class="mtext">' + rich(s.text) + '</p>' : '') +
        (guests ? '<p class="alongside">' + esc(s.alongside || '') + '</p><div class="guests">' + guests + '</div>' : '') +
        '</div></section>' +
        (s.banner ? '<div class="pathbanner">' + rich(s.banner) + '</div>' : '');
    },

    feature: function (s) {
      return '<section class="feature' + (s.light ? ' feature-light' : '') + '"><div class="ds-wrap"><div class="grid">' +
        (s.image ? img(s.image, s.imageAlt) : '') +
        '<div><h2>' + rich(s.title) + '</h2>' +
        (s.paragraphs || []).map(function (p) {
          return p.q ? '<p class="q">' + esc(p.q) + '</p>' : '<p>' + rich(p) + '</p>';
        }).join('') +
        '</div></div></div></section>';
    },

    valueGrid: function (s) {
      var items = (s.items || []).map(function (v) {
        return '<div class="vc"><h3>' + esc(v.h) + '</h3><p>' + rich(v.p) + '</p></div>';
      }).join('');
      var total = s.total ? '<div class="vc total"><div class="t">' + esc(s.total.t) + '</div>' +
        '<div class="price">' + esc(s.total.price) + '</div><div class="free">' + esc(s.total.free) + '</div></div>' : '';
      var dates = (s.dateRow || []).map(function (d) {
        return '<div class="dr"><div class="big ' + (d.dark ? 'dark' : '') + '">' + esc(d.big) + '</div><div class="sm">' + esc(d.sm) + '</div></div>';
      }).join('');
      return '<section class="value"><div class="vwrap"><div class="value-inner">' +
        '<div class="ds-center">' + (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2></div>' +
        '<div class="vgrid">' + items + total + '</div>' +
        (dates ? '<div class="daterow">' + dates + '</div>' : '') +
        (s.cta ? '<div class="btnwrap">' + cta(s.cta) + '</div>' : '') +
        '</div></div></section>';
    },

    testimonials: function (s) {
      var cards = (s.items || []).map(function (t) {
        var av = t.avatar ? img(t.avatar, t.name, { cls: 'tavatar' })
          : '<span class="tavatar tinitial">' + esc((t.name || '?').charAt(0)) + '</span>';
        return '<figure class="tcard">' +
          '<div class="stars" aria-label="5 sao">★★★★★</div>' +
          '<blockquote>' + rich(t.quote) + '</blockquote>' +
          '<figcaption>' + av + '<span class="tmeta"><b>' + esc(t.name) + '</b>' +
          (t.role ? '<i>' + esc(t.role) + '</i>' : '') + '</span></figcaption>' +
          '</figure>';
      }).join('');
      var vids = (s.videos || []).map(function (v) {
        return '<button type="button" class="tvideo" data-yt="' + attr(v) + '" onclick="MFL.playVideo(this)" ' +
          'style="background-image:url(https://img.youtube.com/vi/' + attr(v) + '/hqdefault.jpg)" aria-label="Xem video cảm nhận học viên">' +
          '<span class="tplay" aria-hidden="true"></span></button>';
      }).join('');
      var imgs = (s.images || []).map(function (i) { return img(i, 'Cảm nhận học viên'); }).join('');
      return '<section class="ds-section testimonials"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        (s.lead ? '<p class="ds-lead">' + rich(s.lead) + '</p>' : '') +
        (vids ? '<div class="tvideo-grid">' + vids + '</div>' : '') +
        (cards ? '<div class="tgrid">' + cards + '</div>' : '') +
        (imgs ? '<div class="timg-grid">' + imgs + '</div>' : '') +
        '</div></section>';
    },

    faq: function (s) {
      var items = (s.items || []).map(function (q) {
        return '<div class="faq-item">' +
          '<button type="button" class="faq-q" aria-expanded="false" onclick="MFL.toggleFaq(this)">' +
          '<span>' + esc(q.q) + '</span><i class="faq-ic" aria-hidden="true"></i></button>' +
          '<div class="faq-a"><div class="faq-a-in">' + rich(q.a) + '</div></div></div>';
      }).join('');
      return '<section class="ds-section faq"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        '<div class="faq-list">' + items + '</div></div></section>';
    },

    statement: function (s) {
      return '<section class="ds-section statement"><div class="ds-wrap">' +
        (s.kicker ? '<div class="ds-kicker">' + esc(s.kicker) + '</div>' : '') +
        '<h2 class="ds-title">' + rich(s.title) + '</h2>' +
        (s.lead ? '<p class="ds-lead">' + rich(s.lead) + '</p>' : '') +
        (s.big ? '<div class="big">' + rich(s.big) + '</div>' : '') +
        '<div class="body">' + (s.paragraphs || []).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('') + '</div>' +
        '</div></section>';
    },

    finalCta: function (s) {
      return '<section class="final"><div class="ds-wrap">' +
        '<h2>' + rich(s.title) + '</h2>' +
        (s.infoChip ? '<div class="infochip">' + s.infoChip.map(function (i, idx) {
          return (idx ? '<span class="dot">·</span>' : '') + esc(i);
        }).join(' ') + '</div>' : '') +
        '<div>' + cta(s.cta) + '</div></div></section>';
    },

    footer: function (s) {
      var cols = (s.columns || []).map(function (c) {
        return '<div><h4>' + esc(c.title) + '</h4><ul>' +
          (c.links || []).map(function (l) { return '<li><a href="' + attr(l.href || '#') + '">' + esc(l.label) + '</a></li>'; }).join('') +
          '</ul></div>';
      }).join('');
      return '<footer><div class="ds-wrap"><div class="foot">' +
        '<div class="flogo">' + (s.logoHtml || '') + '</div>' + cols + '</div>' +
        (s.disclaimer ? '<p class="earn"><b>' + esc(s.disclaimerLabel || 'DISCLAIMER:') + '</b> ' + esc(s.disclaimer) + '</p>' : '') +
        (s.copyright ? '<p class="copy">' + esc(s.copyright) + '</p>' : '') +
        '</div></footer>';
    }
  };

  /* —— mount sections —— */
  var html = (SITE.sections || []).map(function (s) {
    var fn = R[s.type];
    if (!fn) { console.warn('Unknown section type:', s.type); return ''; }
    return fn(s);
  }).join('');
  document.getElementById('app').innerHTML = html;

  /* —— sticky CTA bar (optional) —— */
  if (SITE.stickyBar) {
    var sb = document.createElement('div');
    sb.className = 'sticky-cta';
    sb.innerHTML = '<div class="ds-wrap sticky-in">' +
      '<div class="sticky-logo">' + (SITE.stickyBar.logoHtml || '') + '</div>' +
      cta(SITE.stickyBar.cta) + '</div>';
    document.body.appendChild(sb);
    var onScroll = function () { sb.classList.toggle('show', window.scrollY > 700); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* —— behaviors —— */
  window.MFL = {
    toggleFaq: function (btn) {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
    playVideo: function (btn) {
      var id = btn.getAttribute('data-yt');
      var ifr = document.createElement('iframe');
      ifr.className = 'tvideo';
      ifr.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      ifr.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      ifr.setAttribute('allowfullscreen', '');
      ifr.setAttribute('title', 'Video cảm nhận học viên');
      btn.replaceWith(ifr);
    },
    openVideo: function (id) {
      var lb = document.createElement('div');
      lb.className = 'video-lightbox';
      lb.innerHTML = '<div class="vl-backdrop"></div><div class="vl-inner">' +
        '<button type="button" class="vl-close" aria-label="Đóng video">&times;</button>' +
        '<div class="vl-frame"><iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" ' +
        'allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video giới thiệu"></iframe></div></div>';
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';
      var onKey = function (e) { if (e.key === 'Escape') close(); };
      function close() { lb.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); }
      lb.querySelector('.vl-backdrop').onclick = close;
      lb.querySelector('.vl-close').onclick = close;
      document.addEventListener('keydown', onKey);
    },
    submit: function (e) {
      e.preventDefault();
      var form = e.target, msg = form.querySelector('.form-msg');
      // basic validation
      var invalid = [].slice.call(form.querySelectorAll('[required]')).filter(function (i) { return !i.value.trim() || !i.checkValidity(); });
      if (invalid.length) {
        invalid[0].focus();
        if (msg) { msg.textContent = 'Vui lòng kiểm tra lại thông tin đã nhập.'; msg.className = 'form-msg err'; }
        return false;
      }
      var btn = form.querySelector('.btn'), data = {};
      [].slice.call(form.querySelectorAll('input')).forEach(function (i) { data[i.name] = i.value; });
      if (btn) { btn.classList.add('loading'); }
      var done = function (ok) {
        if (btn) btn.classList.remove('loading');
        if (ok) {
          form.querySelector('#register, .formcard');
          if (msg) { msg.textContent = SITE.submitMessage || 'Đăng ký thành công!'; msg.className = 'form-msg ok'; }
          form.reset();
        } else if (msg) { msg.textContent = 'Có lỗi xảy ra, vui lòng thử lại.'; msg.className = 'form-msg err'; }
      };
      if (SITE.formEndpoint) {
        fetch(SITE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { done(r.ok); }).catch(function () { done(false); });
      } else {
        done(true); // demo mode
      }
      return false;
    }
  };

  /* —— countdown —— */
  if (SITE.countdownTarget) {
    var target = new Date(SITE.countdownTarget).getTime();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var set = function (k, v) { var el = document.querySelector('[data-cd="' + k + '"]'); if (el) el.textContent = pad(v); };
    var tick = function () {
      var d = target - Date.now(); if (d < 0) d = 0;
      set('d', Math.floor(d / 86400000));
      set('h', Math.floor((d % 86400000) / 3600000));
      set('m', Math.floor((d % 3600000) / 60000));
      set('s', Math.floor((d % 60000) / 1000));
    };
    tick(); setInterval(tick, 1000);
  }

  /* —— optional tracking (config-driven; fires only if IDs provided) —— */
  var T = SITE.tracking || {};
  function loadScript(src) { var el = document.createElement('script'); el.async = true; el.src = src; document.head.appendChild(el); }
  if (T.ga4) {
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + T.ga4);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', T.ga4);
  }
  if (T.metaPixel) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', T.metaPixel); fbq('track', 'PageView');
  }
})();
