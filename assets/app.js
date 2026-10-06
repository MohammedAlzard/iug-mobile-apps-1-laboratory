/* Plain JavaScript. No frameworks, external runtime, analytics or build step. */
(() => {
  "use strict";
  const config = window.GUIDE_CONFIG;
  const pages = window.GUIDE_PAGES;
  const sources = window.GUIDE_SOURCES;
  const codes = window.GUIDE_CODES;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const {
    STORAGE_KEYS: KEYS,
    readStore,
    saveState,
    createGuide,
    chooseDevice,
    setReadiness,
    isReady,
  } = CourseGuide;
  const { strings, esc, icon } = CourseGuide.ui;
  const guide = createGuide(config, pages, codes);
  const preferences = readStore(KEYS.preferences);
  const state = {
    lang: document.documentElement.lang === "en" ? "en" : "ar",
    theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    device: preferences.device === "phone" ? "phone" : "emulator",
    focus: false,
    ...guide.restoreProgress(readStore(KEYS.progress)),
    current: guide.readHash(location.hash),
    storageAvailable: true,
  };
  const lectureIds = guide.lectureById;
  const context = { lecture: guide.lectureFor(state.current) };
  context.sequence = guide.sequenceFor(context.lecture.id);
  const t = (key) => strings[state.lang][key] || key;
  const tr = (pair) => pair[state.lang];
  const { navigation, catalogHTML, lectureHTML, chapterHTML, helpHTML, helpCards, hydrate } =
    CourseGuide.createViews({ config, guide, state, context, sources, codes, $, $$, t, tr });
  function store() {
    state.storageAvailable = saveState(state);
  }
  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3300);
  }
  async function copyText(text, message = t("copied")) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.className = "clipboard-fallback";
        document.body.appendChild(el);
        el.select();
        try {
          if (!document.execCommand("copy")) throw new Error("copy failed");
        } finally {
          el.remove();
        }
      }
      toast(message);
      return true;
    } catch (_) {
      toast(t("copyFailed"));
      return false;
    }
  }
  function updateChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = state.theme;
    document.body.classList.toggle("focus-mode", state.focus);
    document.body.classList.toggle(
      "is-overview",
      state.current === "overview" || lectureIds.has(state.current),
    );
    document.body.classList.toggle("is-catalog", state.current === "overview");
    document.title =
      state.current === "overview"
        ? t("pageTitle")
        : `${context.lecture.code} · ${tr(context.lecture.title)} | ${config.courseCode}`;
    $('[name="theme-color"]').content = state.theme === "dark" ? "#111a18" : "#17644d";
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $("#universityName").textContent = tr(config.university);
    $("#facultyName").textContent = tr(config.faculty);
    $("#courseName").textContent = tr(config.course);
    $("#footerAuthor").textContent = tr(config.author);
    $("#uniLogo").alt = t("uniAlt");
    $("#facultyLogo").alt = t("facultyAlt");
    $("#footerUniLogo").alt = t("uniAlt");
    $("#footerFacultyLogo").alt = t("facultyAlt");
    $("#homeLink").setAttribute("aria-label", t("overview"));
    $("#preferencesLabel").setAttribute("aria-label", t("prefs"));
    $("#sidebar").setAttribute("aria-label", t("guideMap"));
    $("#guideNav").setAttribute("aria-label", t("nav"));
    const language = $("#languageButton");
    language.textContent = state.lang === "ar" ? "English" : "العربية";
    language.lang = state.lang === "ar" ? "en" : "ar";
    language.setAttribute("aria-label", t("language"));
    const theme = $("#themeButton");
    theme.innerHTML = icon(state.theme === "dark" ? "sun" : "moon");
    theme.setAttribute("aria-label", t(state.theme === "dark" ? "light" : "dark"));
    theme.title = theme.getAttribute("aria-label");
    $("#focusButton").innerHTML =
      icon("focus") + `<span>${t(state.focus ? "exitFocus" : "focus")}</span>`;
    $("#focusButton").setAttribute("aria-pressed", String(state.focus));
    $("#shareButton").innerHTML = icon("link") + `<span>${t("share")}</span>`;
    $("#printButton").innerHTML = icon("print") + `<span>${t("print")}</span>`;
    updateProgress();
  }
  function updateProgress() {
    const count = context.sequence.filter((p) => state.done.has(p.id)).length,
      total = context.sequence.length;
    $("#progressText").textContent = `${count} / ${total}`;
    $("#mobileProgress").textContent = `${count} / ${total}`;
    $("#progressFill").style.width = `${(total ? count / total : 0) * 100}%`;
    $("#progressBar").setAttribute("aria-valuemax", String(total));
    $("#progressBar").setAttribute("aria-valuenow", String(count));
    $("#progressBar").setAttribute("aria-label", t("yourProgress"));
    $(".progress-area small").textContent = state.storageAvailable
      ? t("localProgress")
      : t("storageBlocked");
  }
  function render(moveFocus = false) {
    const page = guide.pageById.get(state.current);
    context.lecture = guide.lectureFor(state.current);
    context.sequence = guide.sequenceFor(context.lecture.id);
    if (state.current === "overview") state.focus = false;
    updateChrome();
    navigation();
    const isCatalog = state.current === "overview",
      isLecture = lectureIds.has(state.current);
    $(".mobile-navigation").hidden = isCatalog || isLecture;
    $("#pageToolbar").hidden = isCatalog;
    $("#lectureBreadcrumb").hidden = isCatalog;
    $("#lectureBreadcrumb").setAttribute(
      "aria-label",
      state.lang === "ar" ? "مسار التصفح" : "Breadcrumb",
    );
    $("#lectureBreadcrumb").innerHTML =
      `<a href="#overview">${t("lectures")}</a><span aria-hidden="true">/</span>${isLecture ? `<span aria-current="page" dir="ltr">${context.lecture.code}</span>` : `<a href="#${context.lecture.id}" dir="ltr">${context.lecture.code} · ${t("lectureGuide")}</a>`}`;

    $(".toolbar-menu").open = false;
    const badges = {
      android: "coreBadge",
      kotlin: "optionalBadge",
      help: "helpBadge",
      reference: "referenceBadge",
    };
    $("#routeLabel").textContent =
      state.current === "overview"
        ? config.courseCode
        : state.current === "help"
          ? t("help")
          : page
            ? t(badges[page.group] || "lectureGuide")
            : config.courseCode;
    $("#view").innerHTML = isCatalog
      ? catalogHTML()
      : isLecture
        ? lectureHTML()
        : state.current === "help"
          ? helpHTML()
          : chapterHTML(page);
    hydrate();
    if (moveFocus) {
      $("#main").focus({ preventScroll: true });
      const top = $("#main").getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
  }
  document.addEventListener("click", async (event) => {
    if (event.target.closest(".skip-link")) {
      event.preventDefault();
      $("#main").focus({ preventScroll: true });
      $("#main").scrollIntoView();
      return;
    }
    const internal = event.target.closest('a[href^="#"]');
    if (internal && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      const id = internal.getAttribute("href").slice(1);
      if (guide.hasRoute(id)) {
        event.preventDefault();
        if (state.current === id) {
          $("#main").focus({ preventScroll: true });
          $("#main").scrollIntoView();
        } else location.hash = id;
        return;
      }
    }
    const copy = event.target.closest("[data-copy-code]");
    if (copy) {
      const ok = await copyText(codes[copy.dataset.copyCode]);
      if (ok) {
        $("span", copy).textContent = t("copied");
        setTimeout(() => {
          if (copy.isConnected) $("span", copy).textContent = t("copy");
        }, 1500);
      }
      return;
    }
    const linkCopy = event.target.closest("[data-copy-url]");
    if (linkCopy) {
      await copyText(linkCopy.dataset.copyUrl);
      return;
    }
    const deviceButton = event.target.closest("[data-choose-device]");
    if (deviceButton) {
      chooseDevice(state, deviceButton.dataset.chooseDevice);
      store();
      // Re-render the current step to keep controls and branch contents synchronized.
      const scroll = window.scrollY;
      render(false);
      window.scrollTo(0, scroll);
      const target = $(`[data-choose-device="${state.device}"]`);
      if (target) target.focus({ preventScroll: true });
      return;
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-complete]")) {
      const id = event.target.dataset.complete;
      if (event.target.checked) state.done.add(id);
      else state.done.delete(id);
      store();
      updateProgress();
      navigation();
      toast(state.storageAvailable ? t("saved") : t("storageBlocked"));
    }
    if (event.target.matches("[data-readiness-check]")) {
      const key = event.target.dataset.readinessCheck;
      setReadiness(state, key, event.target.checked);
      const done = $('[data-complete="step-6"]');
      if (done) {
        done.checked = state.done.has("step-6");
        done.disabled = !isReady(state);
        $(".completion small").textContent = t(isReady(state) ? "selfCheck" : "checkFirst");
      }
      store();
      updateProgress();
      navigation();
    }
  });
  document.addEventListener("input", (event) => {
    if (event.target.id === "helpSearch")
      $("#helpResults").innerHTML = helpCards(event.target.value);
  });
  $("#mobileSelect").addEventListener("change", (event) => {
    location.hash = event.target.value;
  });
  $("#languageButton").addEventListener("click", () => {
    state.lang = state.lang === "ar" ? "en" : "ar";
    store();
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", state.lang);
      history.replaceState(null, "", url);
    } catch (_) {}
    render(false);
  });
  $("#themeButton").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    store();
    updateChrome();
  });
  $("#focusButton").addEventListener("click", () => {
    state.focus = !state.focus;
    updateChrome();
  });
  $("#shareButton").addEventListener("click", () => {
    if (location.protocol === "file:") {
      toast(
        state.lang === "ar"
          ? "افتح النسخة المنشورة لنسخ رابط الخطوة."
          : "Open the hosted site to copy a step link.",
      );
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set("lang", state.lang);
    url.hash = state.current;
    copyText(url.href);
  });
  const dialog = $("#resetDialog");
  $("#resetButton").addEventListener("click", () => dialog.showModal());
  $("#cancelReset").addEventListener("click", () => dialog.close());
  $("#confirmReset").addEventListener("click", () => {
    guide.resetProgress(state, context.lecture.id);
    store();
    dialog.close();
    render(false);
    toast(t("resetDone"));
  });
  let printRestore = null;
  function preparePrint() {
    if (printRestore) return;
    // Print all steps when printing a lecture landing page.
    printRestore = { scroll: window.scrollY };
    if (lectureIds.has(state.current)) {
      $("#view").innerHTML = context.sequence.map((p) => chapterHTML(p)).join("");
      $$(".chapter", $("#view")).forEach((el) => el.classList.add("print-article"));
      hydrate();
    }
    $$("details", $("#view")).forEach((el) => (el.open = true));
  }
  window.addEventListener("beforeprint", preparePrint);
  $("#printButton").addEventListener("click", () => {
    preparePrint();
    window.print();
  });
  window.addEventListener("afterprint", () => {
    if (printRestore) {
      render(false);
      window.scrollTo(0, printRestore.scroll);
      printRestore = null;
    }
  });
  window.addEventListener("hashchange", () => {
    state.current = guide.readHash(location.hash);
    render(true);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.focus) {
      state.focus = false;
      updateChrome();
    }
  });
  render(false);
})();
