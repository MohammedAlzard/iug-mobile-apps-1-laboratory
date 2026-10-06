/* Render course pages and reusable controls from the current context. */
(() => {
  "use strict";
  window.CourseGuide.createViews = function ({
    config,
    guide,
    state,
    context,
    sources,
    codes,
    $,
    $$,
    t,
    tr,
  }) {
    const lectures = config.lectures;
    const { esc, icon } = CourseGuide.ui;
    function navigation() {
      const lecturePages = guide.pagesFor(context.lecture.id);
      $(".overview-link").href = `#${context.lecture.id}`;
      $(".overview-link").textContent = t("lectureGuide");
      const item = (p) =>
        /* HTML */ `<a
          class="nav-item"
          href="#${p.id}"
          ${state.current === p.id ? 'aria-current="page"' : ""}
          ><span class="nav-number" dir="ltr">${p.num}</span
          ><span>${esc(tr(p.title))}</span
          >${state.done.has(p.id) ? '<span class="nav-completed" aria-label="' + t("completed") + '">✓</span>' : ""}</a
        >`;
      $("#guideNav").innerHTML =
        context.sequence.map(item).join("") +
        /* HTML */ `<div class="nav-extra">
          ${context.lecture.id === "l01" ? /* HTML */ `<a class="nav-item" href="#help">${icon("help")}${t("help")}</a>` : ""}${lecturePages
            .filter((p) => ["optional", "reference"].includes(p.group))
            .map(item)
            .join("")}<a class="nav-item" href="#overview">${t("lectures")}</a>
        </div>`;
      $("#mobileSelect").innerHTML =
        /* HTML */ `<option value="overview">${t("lectures")}</option><option value="${context.lecture.id}">${context.lecture.code} · ${t("lectureGuide")}</option>` +
        context.sequence
          .map((p) => /* HTML */ `<option value="${p.id}">${p.num} · ${esc(tr(p.title))}</option>`)
          .join("") +
        (context.lecture.id === "l01"
          ? /* HTML */ `<option value="help">${t("help")}</option>`
          : "") +
        lecturePages
          .filter((p) => !context.sequence.includes(p))
          .map((p) => /* HTML */ `<option value="${p.id}">${esc(tr(p.title))}</option>`)
          .join("");
      $("#mobileSelect").value = state.current;
      $(".overview-link").setAttribute(
        "aria-current",
        state.current === context.lecture.id ? "page" : "false",
      );
    }
    function catalogHTML() {
      const ar = state.lang === "ar";
      return /* HTML */ `<section class="course-welcome">
          <span class="eyebrow">${config.courseCode} · ${config.semester}</span>
          <h1>${ar ? "أهلًا بك في دليل المساق" : "Welcome to your course guide"}</h1>
          <p>
            ${ar ? "اختر المحاضرة للوصول إلى شرحها وأكوادها وخطوات التطبيق." : "Choose a lecture to find its instructions, code and practical steps."}
          </p>
          <div class="catalog-instructor">
            <img
              src="assets/images/mohammed-alzard.webp"
              width="40"
              height="40"
              alt="${t("portraitAlt")}"
            /><span>${esc(tr(config.author))}<small>${esc(tr(config.role))}</small></span>
          </div>
        </section>
        <section aria-labelledby="lecturesTitle">
          <div class="section-heading"><h2 id="lecturesTitle">${t("lectures")}</h2></div>
          <div class="lecture-grid">
            ${lectures
              .map((lecture) => {
                const completed = lecture.stepIds.filter((id) => state.done.has(id)).length;
                return /* HTML */ `<a class="lecture-card" href="#${lecture.id}"
                  ><span class="lecture-code" dir="ltr">${esc(lecture.code)}</span>
                  <h3>${esc(tr(lecture.title))}</h3>
                  <p>${esc(tr(lecture.description))}</p>
                  <div class="lecture-card-bottom">
                    <span>${t("openLecture")} ${icon("arrow")}</span
                    >${completed ? /* HTML */ `<small>${completed} / ${lecture.stepIds.length} · ${t("completed")}</small>` : ""}
                  </div></a
                >`;
              })
              .join("")}
          </div>
        </section>`;
    }
    function stepLinksHTML() {
      return context.sequence
        .map(
          (p) =>
            /* HTML */ `<a href="#${p.id}"><span dir="ltr">${p.num}</span>${esc(tr(p.title))}</a>`,
        )
        .join("");
    }
    function lectureHTML() {
      if (context.lecture.overviewType === "setup") return overviewHTML();
      return /* HTML */ `<section class="hero">
        <div class="hero-meta" dir="ltr">${esc(context.lecture.code)}</div>
        <h1>${esc(tr(context.lecture.title))}</h1>
        <p class="hero-intro">${esc(tr(context.lecture.description))}</p>
        <div class="overview-steps">${stepLinksHTML()}</div>
      </section>`;
    }
    function overviewHTML() {
      const next = context.sequence.find((p) => !state.done.has(p.id));
      const ar = state.lang === "ar";
      const phases = ar
        ? [
            ["01–03", "ثبّت البرنامج", "المواصفات، التحميل والتشغيل الأول."],
            ["04–06", "جهّز جهاز التجربة", "SDK، المحاكي أو الهاتف، ثم فحص الجاهزية."],
            ["07–09", "شغّل أول كود", "Java، تثبيت Scoop وKotlin، ثم طباعة الاسم."],
          ]
        : [
            ["01–03", "Install the IDE", "Requirements, download and first launch."],
            ["04–06", "Set up a test device", "SDK, emulator or phone, then readiness checks."],
            [
              "07–09",
              "Run your first code",
              "Java, Scoop and Kotlin installation, then print a name.",
            ],
          ];
      return /* HTML */ `<section class="hero">
          <div class="hero-meta">
            <bdi dir="ltr">${context.lecture.code}</bdi> · ${esc(tr(context.lecture.title))}
          </div>
          <h1 class="hero-title">
            ${ar ? '<span class="hero-title-line">من <bdi dir="ltr" lang="en">Windows</bdi> جديد</span> <span class="hero-title-line hero-title-destination">إلى أول كود <bdi dir="ltr" lang="en">Kotlin</bdi></span>' : '<span class="hero-title-line">From fresh Windows</span> <span class="hero-title-line hero-title-destination">to your first Kotlin code</span>'}
          </h1>
          <p class="hero-intro">
            ${ar ? "خطوات مرتّبة من الصفر. لا تحتاج تثبيت Java أو Kotlin مسبقًا." : "A guided setup from scratch. No existing Java or Kotlin installation required."}
          </p>
          <div class="hero-actions">
            <a class="button" href="#${next ? next.id : "step-1"}"
              >${next ? t(context.sequence.some((p) => state.done.has(p.id)) ? "resume" : "start") : ar ? "راجع الخطوات" : "Review the steps"}${icon("arrow")}</a
            ><span class="hero-caption"
              >${ar ? "9 خطوات · اتبع زر التالي" : "9 steps · follow Next"}</span
            >
          </div>
          <div class="journey-map">
            ${phases
              .map(
                ([n, title, desc]) =>
                  /* HTML */ `<div class="journey-phase">
                    <span dir="ltr">${n}</span>
                    <div>
                      <h2>${title}</h2>
                      <p>${desc}</p>
                    </div>
                  </div>`,
              )
              .join("")}
          </div>
          <div class="author-panel">
            <img
              src="assets/images/mohammed-alzard.webp"
              width="48"
              height="48"
              alt="${t("portraitAlt")}"
            />
            <div>
              <strong>${esc(tr(config.author))}</strong><span>${esc(tr(config.role))}</span>
            </div>
          </div>
        </section>
        <div class="home-links">
          <a href="#help">${t("helpCta")}</a><a href="#sources">${t("sources")}</a>
        </div>
        <details class="disclosure">
          <summary>
            ${ar ? "لديك برامج مثبتة؟ انتقل إلى خطوة محددة" : "Already have some tools? Go to a specific step"}
          </summary>
          <div class="disclosure-body overview-steps">
            ${stepLinksHTML()}<a href="#kotlin-4">VS Code · ${t("optional")}</a>
          </div>
        </details>`;
    }
    function sourceHTML(ids) {
      return /* HTML */ `<details class="disclosure source-details">
        <summary>${t("stepSources")}</summary>
        <div class="step-sources">
          ${ids.map((id) => /* HTML */ `<a href="${sources[id].url}" target="_blank" rel="noopener noreferrer" dir="ltr">${esc(sources[id].name)} ↗</a>`).join("")}
        </div>
      </details>`;
    }
    function chapterHTML(page) {
      const index = context.sequence.indexOf(page),
        isStep = index >= 0;
      const badge = isStep
        ? state.lang === "ar"
          ? `الخطوة ${index + 1} من ${context.sequence.length}`
          : `Step ${index + 1} of ${context.sequence.length}`
        : t(
            page.group === "optional"
              ? "optional"
              : page.group === "help"
                ? "helpBadge"
                : "referenceBadge",
          );
      const complete = page.result
        ? /* HTML */ `<div class="result">
              ${icon("circleCheck")}
              <div>
                <strong>${t("result")}</strong>
                <p>${esc(tr(page.result))}</p>
              </div>
            </div>
            <div class="completion">
              <label class="complete-label"
                ><input
                  type="checkbox"
                  data-complete="${page.id}"
                  ${state.done.has(page.id) ? "checked" : ""}
                  ${page.id === "step-6" && !CourseGuide.isReady(state) ? "disabled" : ""}
                /><span>${t("complete")}</span></label
              ><small
                >${t(page.id === "step-6" && !CourseGuide.isReady(state) ? "checkFirst" : "selfCheck")}</small
              >
            </div>`
        : "";
      const prev = index > 0 ? context.sequence[index - 1].id : context.lecture.id,
        next = isStep && index < context.sequence.length - 1 ? context.sequence[index + 1] : null;
      const pagination = isStep
        ? /* HTML */ `<nav class="chapter-pagination" aria-label="${t("nav")}">
            <a class="button secondary" href="#${prev}">${t("prev")}</a
            ><a class="button" href="#${next ? next.id : context.lecture.id}"
              >${next ? t("next") + ": " + esc(tr(next.title)) : t("lectureGuide")}</a
            >
          </nav>`
        : /* HTML */ `<div class="chapter-pagination">
            <a
              class="button secondary"
              href="#${page.group === "help" ? "help" : page.group === "optional" ? context.sequence[context.sequence.length - 1]?.id : context.lecture.id}"
              >${t(page.group === "help" ? "backHelp" : page.group === "optional" ? "prev" : "lectureGuide")}</a
            >
          </div>`;
      return /* HTML */ `<article class="chapter" data-page="${page.id}">
        <div class="print-heading">
          ${esc(tr(config.university))} · ${config.courseCode} · ${esc(tr(config.author))}
        </div>
        <div class="chapter-meta">${badge}</div>
        <h1>${esc(tr(page.title))}</h1>
        <p class="chapter-desc">${esc(tr(page.description))}</p>
        <div class="chapter-body">${tr(page.html)}</div>
        ${complete}${pagination}${page.sources.length ? sourceHTML(page.sources) : ""}
      </article>`;
    }
    function helpHTML() {
      return /* HTML */ `<section>
        <div class="chapter help-heading">
          <div class="chapter-meta">${t("helpBadge")}</div>
          <h1>${t("helpTitle")}</h1>
          <p class="chapter-desc">${t("helpDesc")}</p>
        </div>
        <label class="sr-only" for="helpSearch">${t("searchLabel")}</label
        ><input
          class="help-search"
          id="helpSearch"
          type="search"
          autocomplete="off"
          aria-label="${t("searchLabel")}"
          placeholder="${t("searchPlaceholder")}"
        />
        <div id="helpResults">${helpCards("")}</div>
      </section>`;
    }
    function helpCards(query) {
      const help = guide.searchHelp(context.lecture.id, query);
      return help.length
        ? help
            .map(
              (p) =>
                /* HTML */ `<a class="help-card" href="#${p.id}"
                  >${icon("help")}
                  <div>
                    <h3>${esc(tr(p.title))}</h3>
                    <p>${esc(tr(p.description))}</p>
                  </div></a
                >`,
            )
            .join("")
        : /* HTML */ `<p class="empty-state">${t("noResults")}</p>`;
    }
    function hydrate(root = $("#view")) {
      $$("[data-code]", root).forEach((node) => {
        const key = node.dataset.code,
          output = node.dataset.output === "true";
        const rawLabel = node.dataset.codeLabel || "PowerShell";
        const label =
          rawLabel === "PowerShell"
            ? state.lang === "ar"
              ? "PowerShell · بدون مسؤول"
              : "PowerShell · non-admin"
            : rawLabel.includes("Administrator")
              ? state.lang === "ar"
                ? "PowerShell · كمسؤول"
                : "PowerShell · Administrator"
              : rawLabel;
        node.className = "code-block" + (output ? " code-output" : "");
        const longCommand =
          !output && rawLabel.startsWith("PowerShell") && codes[key].split("\n").length > 10;
        const pre = '<pre tabindex="0" dir="ltr"><code></code></pre>';
        const preview = longCommand
          ? /* HTML */ `<details class="command-details">
              <summary dir="${state.lang === "ar" ? "rtl" : "ltr"}">
                ${state.lang === "ar" ? "عرض أمر الإعداد كاملًا · زر نسخ ينسخه كله" : "View full setup command · Copy includes every line"}
              </summary>
              ${pre}
            </details>`
          : pre;
        node.innerHTML = /* HTML */ `<div class="code-toolbar">
            <span dir="auto">${esc(label)}</span
            >${output ? "" : /* HTML */ `<button type="button" class="copy-code" data-copy-code="${key}" aria-label="${t("copy")} ${esc(label)}">${icon("copy")}<span>${t("copy")}</span></button>`}
          </div>
          ${preview}`;
        $("code", node).textContent = codes[key];
      });
      $$("[data-copy-url]", root).forEach((button) => (button.textContent = t("copyLink")));
      $$("[data-device-picker]", root).forEach((node) => {
        node.className = "device-picker";
        node.setAttribute("role", "group");
        node.setAttribute("aria-label", t("deviceChooser"));
        node.innerHTML = ["emulator", "phone"]
          .map(
            (device) =>
              /* HTML */ `<button
                type="button"
                class="device-option"
                data-choose-device="${device}"
                aria-pressed="${state.device === device}"
              >
                ${icon(device === "emulator" ? "monitor" : "phone")}${state.device === device ? '<span class="device-check" aria-hidden="true">✓</span>' : ""}<strong
                  >${t(device === "emulator" ? "deviceEmulator" : "devicePhone")}</strong
                ><small
                  >${t(device === "emulator" ? "deviceEmulatorDesc" : "devicePhoneDesc")}</small
                >
              </button>`,
          )
          .join("");
      });
      $$("[data-device]", root).forEach((el) => (el.hidden = el.dataset.device !== state.device));
      $$("[data-readiness]", root).forEach((node) => {
        node.className = "check-list";
        node.innerHTML =
          CourseGuide.READINESS_KEYS.map(
            (key) =>
              /* HTML */ `<label class="check-row"
                ><input
                  type="checkbox"
                  data-readiness-check="${key}"
                  ${state.checks.has(key) ? "checked" : ""}
                /><span
                  >${t({ studio: "checkStudio", sdk: "checkSdk", device: "checkDevice" }[key])}</span
                ></label
              >`,
          ).join("") + /* HTML */ `<small class="readiness-hint">${t("checkPending")}</small>`;
      });
      $$("[data-sources]", root).forEach((node) => {
        node.className = "source-list";
        node.innerHTML = Object.values(sources)
          .map(
            (s) =>
              /* HTML */ `<div class="resource-link">
                <a href="${s.url}" target="_blank" rel="noopener noreferrer" dir="ltr"
                  >${esc(s.name)} ↗</a
                ><button type="button" class="copy-link" data-copy-url="${s.url}">
                  ${t("copyLink")}
                </button>
              </div>`,
          )
          .join("");
      });
    }

    return { navigation, catalogHTML, lectureHTML, chapterHTML, helpHTML, helpCards, hydrate };
  };
})();
