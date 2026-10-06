/* Data lookup and persistence. Also usable by the Node test runner. */
(function () {
  "use strict";

  const STORAGE_KEYS = {
    preferences: "mobc2101-preferences",
    progress: "mobc2101-progress-v1",
  };
  const READINESS_KEYS = ["studio", "sdk", "device"];

  const isReady = (state) => READINESS_KEYS.every((key) => state.checks.has(key));

  function chooseDevice(state, device) {
    if (!["emulator", "phone"].includes(device) || state.device === device) return;
    state.device = device;
    state.done.delete("step-5");
    state.done.delete("step-6");
    state.checks.delete("device");
  }

  function setReadiness(state, key, checked) {
    if (!READINESS_KEYS.includes(key)) return;
    if (checked) state.checks.add(key);
    else state.checks.delete(key);
    if (!isReady(state)) state.done.delete("step-6");
  }

  function readStore(key, fallback = {}) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.preferences,
        JSON.stringify({
          lang: state.lang,
          theme: state.theme,
          device: state.device,
        }),
      );
      localStorage.setItem(
        STORAGE_KEYS.progress,
        JSON.stringify({
          done: [...state.done],
          checks: [...state.checks],
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  function createGuide(config, pages, codes) {
    const pageById = new Map(pages.map((page) => [page.id, page]));
    const lectureById = new Map(config.lectures.map((lecture) => [lecture.id, lecture]));
    const lecturePages = new Map(
      config.lectures.map((lecture) => [
        lecture.id,
        pages.filter((page) => page.lectureId === lecture.id),
      ]),
    );
    const sequences = new Map(
      config.lectures.map((lecture) => [lecture.id, lecture.stepIds.map((id) => pageById.get(id))]),
    );
    const helpText = new Map(
      pages
        .filter((page) => page.group === "help")
        .map((page) => {
          const html = page.html.ar + page.html.en;
          const code = Array.from(
            html.matchAll(/data-code="([^"]+)"/g),
            (match) => codes[match[1]] || "",
          );
          return [
            page.id,
            [
              page.title.ar,
              page.title.en,
              page.description.ar,
              page.description.en,
              page.html.ar,
              page.html.en,
              ...code,
            ]
              .join(" ")
              .toLocaleLowerCase(),
          ];
        }),
    );
    const hasRoute = (id) =>
      id === "overview" || id === "help" || pageById.has(id) || lectureById.has(id);

    return {
      pageById,
      lectureById,
      hasRoute,
      readHash(hash) {
        try {
          const id = decodeURIComponent(hash.replace(/^#/, ""));
          return hasRoute(id) ? id : "overview";
        } catch {
          return "overview";
        }
      },
      lectureFor(route) {
        return (
          lectureById.get(route) ||
          lectureById.get(pageById.get(route)?.lectureId) ||
          config.lectures[0]
        );
      },
      sequenceFor: (id) => sequences.get(id) || [],
      pagesFor: (id) => lecturePages.get(id) || [],
      resetProgress(state, lectureId) {
        (lecturePages.get(lectureId) || []).forEach((page) => state.done.delete(page.id));
        if (lectureId === "l01") state.checks.clear();
      },
      searchHelp(lectureId, query) {
        const text = query.trim().toLocaleLowerCase();
        return (lecturePages.get(lectureId) || []).filter(
          (page) => helpText.has(page.id) && helpText.get(page.id).includes(text),
        );
      },
      restoreProgress(saved = {}) {
        const done = new Set(
          Array.isArray(saved.done) ? saved.done.filter((id) => pageById.has(id)) : [],
        );
        const checks = new Set(
          Array.isArray(saved.checks)
            ? saved.checks.filter((id) => READINESS_KEYS.includes(id))
            : [],
        );
        if (checks.size < READINESS_KEYS.length) done.delete("step-6");
        return { done, checks };
      },
    };
  }

  const api = {
    STORAGE_KEYS,
    READINESS_KEYS,
    isReady,
    chooseDevice,
    setReadiness,
    readStore,
    saveState,
    createGuide,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else window.CourseGuide = api;
})();
