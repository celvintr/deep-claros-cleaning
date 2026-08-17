(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ 1. Idioma ═══════════════════════════════════════ */
  var LANG = "es";

  function detect() {
    try {
      var saved = localStorage.getItem("dc_lang");
      if (saved && I18N.supported.indexOf(saved) > -1) return saved;
    } catch (e) { /* almacenamiento bloqueado: seguimos con el navegador */ }

    var list = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).toLowerCase().split("-")[0];
      if (I18N.supported.indexOf(code) > -1) return code;
    }
    return I18N.fallback;
  }

  function t(key) {
    var d = I18N[LANG] || {};
    return d[key] !== undefined ? d[key] : (I18N[I18N.fallback][key] || key);
  }

  function apply(lang) {
    LANG = I18N.supported.indexOf(lang) > -1 ? lang : I18N.fallback;
    document.documentElement.lang = LANG;
    try { localStorage.setItem("dc_lang", LANG); } catch (e) {}

    $$("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    // data-i18n-attr="placeholder:clave" o varios separados por coma
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var p = pair.split(":");
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });

    $$(".lang__b").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === LANG));
    });

    if (cityOut && cityOut.dataset.city) showCity(cityOut.dataset.city);
  }

  $$(".lang__b").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.dataset.lang); });
  });

  /* ═══ 2. Slider del hero ══════════════════════════════ */
  var slider = $("#slider");
  if (slider) {
    var slides = $$(".slide", slider);
    var dotsBox = $("#dots");
    var idx = 0, timer = null, DELAY = 5200;

    // construir los puntos
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === 0));
      b.addEventListener("click", function () { go(i, true); });
      dotsBox.appendChild(b);
    });
    var dots = $$("button", dotsBox);

    function paint() {
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      dots.forEach(function (d, i) { d.setAttribute("aria-selected", String(i === idx)); });
    }
    function go(n, manual) {
      idx = (n + slides.length) % slides.length;
      paint();
      if (manual) restart();
    }
    function next() { go(idx + 1); }
    function start() { if (!reduce && !timer) timer = setInterval(next, DELAY); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    $$("[data-slide]", $(".hero")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(idx + (btn.dataset.slide === "next" ? 1 : -1), true);
      });
    });

    var heroEl = $(".hero");
    heroEl.addEventListener("mouseenter", stop);
    heroEl.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    paint();
    start();
  }

  /* ═══ 2b. Antes / después (arrastre) ══════════════════ */
  var ba = $("#ba");
  if (ba) {
    var baGrip = $("#baGrip");
    var baPos = 50;
    var baDrag = false;

    function setBa(v) {
      baPos = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--wipe", baPos + "%");
      baGrip.setAttribute("aria-valuenow", Math.round(baPos));
    }
    function baFrom(e) {
      var r = ba.getBoundingClientRect();
      setBa(((e.clientX - r.left) / r.width) * 100);
    }
    ba.addEventListener("pointerdown", function (e) {
      baDrag = true; ba.setPointerCapture(e.pointerId); baFrom(e);
    });
    ba.addEventListener("pointermove", function (e) {
      if (baDrag) { e.preventDefault(); baFrom(e); }
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      ba.addEventListener(ev, function () { baDrag = false; });
    });
    baGrip.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setBa(baPos - step); e.preventDefault(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") { setBa(baPos + step); e.preventDefault(); }
      else if (e.key === "Home") { setBa(0); e.preventDefault(); }
      else if (e.key === "End") { setBa(100); e.preventDefault(); }
    });
    setBa(50);
  }

  /* ═══ 2b. Menú móvil (drawer) ═════════════════════════ */
  var burger = $("#burger");
  var drawer = $("#drawer");
  if (burger && drawer) {
    var panel = $(".drawer__panel", drawer);
    var closeTimer = null;

    var openDrawer = function () {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      drawer.hidden = false;
      document.body.classList.add("no-scroll");
      // forzar reflow para que la transición corra desde translateX(100%)
      void drawer.offsetWidth;
      drawer.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      var first = $(".drawer__nav a", drawer);
      if (first) first.focus();
    };

    var closeDrawer = function () {
      drawer.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      closeTimer = setTimeout(function () { drawer.hidden = true; }, reduce ? 0 : 400);
      burger.focus();
    };

    burger.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) closeDrawer(); else openDrawer();
    });

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeDrawer();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });

    // el foco no debe escapar del panel mientras está abierto
    drawer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !drawer.classList.contains("is-open")) return;
      var f = $$("a[href], button:not([disabled])", panel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }

  /* ═══ 3. Acordeón ═════════════════════════════════════ */
  $$(".acc__b").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      $$(".acc__b", b.closest(".acc")).forEach(function (o) {
        o.setAttribute("aria-expanded", "false");
      });
      b.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ═══ 4. ¿Llegamos a tu ciudad? ═══════════════════════ */
  var cityForm = $("#cityForm");
  var cityInput = $("#cityInput");
  var cityOut = $("#cityOut");
  var cityList = $$("#cities li");

  var norm = function (s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z ]/g, "").trim();
  };

  function showCity(raw) {
    var q = norm(raw);
    var hit = null;
    cityList.forEach(function (li) {
      var n = norm(li.textContent);
      var match = q.length > 2 && (n === q || n.indexOf(q) === 0 || q.indexOf(n) === 0);
      li.classList.toggle("is-hit", !!match);
      if (match) hit = li.textContent;
    });

    var name = hit || raw.trim().replace(/\s+/g, " ");
    var pretty = name.charAt(0).toUpperCase() + name.slice(1);
    cityOut.textContent = t(hit ? "areas.yes" : "areas.mdYes").replace("{city}", pretty);
    cityOut.classList.toggle("is-ask", !hit);
    cityOut.dataset.city = raw;
    if (hit) document.querySelector(".cities li.is-hit").scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }

  cityForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = cityInput.value.trim();
    if (!v) {
      cityOut.textContent = t("areas.empty");
      cityOut.classList.add("is-ask");
      delete cityOut.dataset.city;
      cityList.forEach(function (li) { li.classList.remove("is-hit"); });
      return;
    }
    showCity(v);
  });

  cityList.forEach(function (li) {
    li.addEventListener("click", function () {
      cityInput.value = li.textContent;
      showCity(li.textContent);
    });
  });

  /* ═══ 5. Formulario → WhatsApp o correo ═══════════════ */
  var form = $("#estForm");
  var out = $("#formOut");
  var PHONE = "12404086532";
  var MAIL = "deep.claroscleaningservices@gmail.com";

  function label(sel) {
    var el = $(sel);
    if (el.tagName === "SELECT") return el.options[el.selectedIndex].textContent;
    return el.value.trim();
  }

  function build() {
    var name = $("#fName").value.trim();
    var phone = $("#fPhone").value.trim();

    $("#fName").classList.toggle("is-bad", !name);
    $("#fPhone").classList.toggle("is-bad", !phone);

    if (!name || !phone) {
      out.textContent = t("f.need");
      out.classList.add("is-bad");
      (!name ? $("#fName") : $("#fPhone")).focus();
      return null;
    }

    var rows = [
      [t("f.l.name"), name],
      [t("f.l.phone"), phone],
      [t("f.l.city"), label("#fCity")],
      [t("f.l.type"), label("#fType")],
      [t("f.l.svc"), label("#fSvc")],
      [t("f.l.size"), label("#fSize")],
      [t("f.l.msg"), label("#fMsg")]
    ].filter(function (r) { return r[1]; });

    out.textContent = t("f.ready");
    out.classList.remove("is-bad");

    return t("f.wa.head") + "\n\n" + rows.map(function (r) {
      return r[0] + ": " + r[1];
    }).join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var body = build();
    if (body) window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(body), "_blank", "noopener");
  });

  $("#sendMail").addEventListener("click", function () {
    var body = build();
    if (body) window.location.href = "mailto:" + MAIL +
      "?subject=" + encodeURIComponent(t("f.subject")) +
      "&body=" + encodeURIComponent(body);
  });

  ["#fName", "#fPhone"].forEach(function (s) {
    $(s).addEventListener("input", function () { $(s).classList.remove("is-bad"); });
  });

  /* ═══ 6. Barra fija y apariciones al hacer scroll ═════ */
  var bar = $("#bar");
  var onScroll = function () { bar.classList.toggle("is-stuck", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var targets = $$(".sec .eyebrow, .sec .h2, .lede, .card, .acc, .check, .cities, .cities__note, .step, .quote, .badges, .direct, .form");
  if (!reduce && "IntersectionObserver" in window) {
    targets.forEach(function (el, i) {
      el.classList.add("rv");
      el.style.transitionDelay = (i % 3) * 70 + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* arranque */
  apply(detect());
})();
