const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const core = require("../assets/guide.js");
const sandbox = { window: {} };
vm.runInNewContext(read("assets/content.js"), sandbox);
const {
  GUIDE_CONFIG: config,
  GUIDE_PAGES: pages,
  GUIDE_CODES: codes,
  GUIDE_SOURCES: sources,
} = sandbox.window;
const guide = core.createGuide(config, pages, codes);

test("every lecture owns its ordered steps and all IDs are unique", () => {
  const ids = [...pages, ...config.lectures].map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const lecture of config.lectures) {
    assert.equal(new Set(lecture.stepIds).size, lecture.stepIds.length);
    for (const page of guide.sequenceFor(lecture.id)) {
      assert.ok(page);
      assert.equal(page.lectureId, lecture.id);
    }
  }
  assert.equal(guide.sequenceFor("l01").length, 9);
});

test("both languages reference existing commands, sources and routes", () => {
  for (const page of pages) {
    assert.ok(guide.lectureById.has(page.lectureId));
    for (const source of page.sources) assert.ok(sources[source], source);
    for (const lang of ["ar", "en"]) {
      assert.ok(page.title[lang] && page.description[lang] && page.html[lang]);
      for (const [, key] of page.html[lang].matchAll(/data-code="([^"]+)"/g))
        assert.equal(typeof codes[key], "string", key);
      for (const [, id] of page.html[lang].matchAll(/href="#([^"]+)"/g))
        assert.ok(guide.hasRoute(id), id);
    }
  }
});

test("direct links, encoded routes and invalid hashes resolve safely", () => {
  for (const id of [
    "overview",
    "help",
    ...pages.map((p) => p.id),
    ...config.lectures.map((l) => l.id),
  ]) {
    assert.equal(guide.readHash("#" + id), id);
  }
  assert.equal(guide.readHash("#%6botlin-3"), "kotlin-3");
  for (const hash of ["", "#missing", "#%E0%A4%A"]) assert.equal(guide.readHash(hash), "overview");
  assert.equal(guide.lectureFor("kotlin-3").id, "l01");
});

test("corrupt and stale progress cannot complete the readiness step", () => {
  const saved = guide.restoreProgress({
    done: ["step-1", "step-6", "removed"],
    checks: ["studio", "invented", "studio"],
  });
  assert.deepEqual([...saved.done], ["step-1"]);
  assert.deepEqual([...saved.checks], ["studio"]);
  assert.equal(guide.restoreProgress({ done: "step-1", checks: {} }).done.size, 0);
  assert.ok(
    guide.restoreProgress({ done: ["step-6"], checks: core.READINESS_KEYS }).done.has("step-6"),
  );
});

test("changing device invalidates only device-dependent completion", () => {
  const state = {
    device: "emulator",
    done: new Set(["step-1", "step-5", "step-6"]),
    checks: new Set(core.READINESS_KEYS),
  };
  core.chooseDevice(state, "emulator");
  assert.equal(state.done.size, 3);
  core.chooseDevice(state, "phone");
  assert.equal(state.device, "phone");
  assert.deepEqual([...state.done], ["step-1"]);
  assert.deepEqual([...state.checks], ["studio", "sdk"]);
  core.chooseDevice(state, "invalid");
  assert.equal(state.device, "phone");
});

test("readiness requires all three checks and revokes completion when unchecked", () => {
  const state = { done: new Set(), checks: new Set() };
  for (const key of core.READINESS_KEYS) core.setReadiness(state, key, true);
  assert.ok(core.isReady(state));
  state.done.add("step-6");
  core.setReadiness(state, "sdk", false);
  assert.equal(core.isReady(state), false);
  assert.equal(state.done.has("step-6"), false);
});

test("future lecture navigation and reset remain isolated", () => {
  const second = { id: "l02", stepIds: ["l02-demo"] };
  const multi = core.createGuide(
    { lectures: [...config.lectures, second] },
    [...pages, { id: "l02-demo", lectureId: "l02", group: "lesson" }],
    codes,
  );
  assert.equal(multi.lectureFor("l02-demo").id, "l02");
  assert.deepEqual(
    multi.sequenceFor("l02").map((p) => p.id),
    ["l02-demo"],
  );
  const state = { done: new Set(["step-1", "l02-demo"]), checks: new Set(core.READINESS_KEYS) };
  multi.resetProgress(state, "l02");
  assert.deepEqual([...state.done], ["step-1"]);
  assert.ok(core.isReady(state));
  multi.resetProgress(state, "l01");
  assert.equal(state.done.size, 0);
  assert.equal(state.checks.size, 0);
});

test("troubleshooting searches bilingual text and embedded commands", () => {
  assert.ok(guide.searchHelp("l01", "  SERIALIZABLE  ").some((p) => p.id === "help-serializable"));
  assert.ok(guide.searchHelp("l01", "المحاكي").length);
  assert.ok(guide.searchHelp("l01", "Get-Command").length);
  assert.equal(guide.searchHelp("l02", "Java").length, 0);
  assert.equal(guide.searchHelp("l01", "no-such-error-123").length, 0);
});

test("storage tolerates invalid JSON, blocked access and full quota", () => {
  const storageSandbox = {
    window: {},
    localStorage: {
      getItem: () => "{invalid",
      setItem: () => {
        throw new Error("quota");
      },
    },
  };
  vm.runInNewContext(read("assets/guide.js"), storageSandbox);
  const api = storageSandbox.window.CourseGuide;
  assert.equal(Object.keys(api.readStore("key")).length, 0);
  for (const value of ["null", "[]", '"string"']) {
    storageSandbox.localStorage.getItem = () => value;
    assert.equal(Object.keys(api.readStore("key")).length, 0);
  }
  assert.equal(api.saveState({ done: new Set(), checks: new Set() }), false);
  Object.defineProperty(storageSandbox, "localStorage", {
    get() {
      throw new Error("blocked");
    },
  });
  assert.equal(Object.keys(api.readStore("key")).length, 0);
});

test("storage round trip preserves preferences and progress", () => {
  const memory = new Map();
  const storageSandbox = {
    window: {},
    localStorage: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
    },
  };
  vm.runInNewContext(read("assets/guide.js"), storageSandbox);
  const api = storageSandbox.window.CourseGuide;
  const state = {
    lang: "en",
    theme: "dark",
    device: "phone",
    done: new Set(["step-1"]),
    checks: new Set(["studio"]),
  };
  assert.ok(api.saveState(state));
  assert.equal(api.readStore(api.STORAGE_KEYS.preferences).theme, "dark");
  assert.deepEqual(
    [...guide.restoreProgress(api.readStore(api.STORAGE_KEYS.progress)).done],
    ["step-1"],
  );
});

test("all page templates render with complete interface translations", () => {
  const scope = { window: { CourseGuide: core }, CourseGuide: core };
  vm.runInNewContext(read("assets/ui.js"), scope);
  vm.runInNewContext(read("assets/views.js"), scope);
  for (const lang of ["ar", "en"]) {
    const state = { lang, done: new Set(), checks: new Set() };
    const context = { lecture: config.lectures[0], sequence: guide.sequenceFor("l01") };
    const t = (key) => {
      assert.ok(core.ui.strings[lang][key], key);
      return core.ui.strings[lang][key];
    };
    const views = core.createViews({
      config,
      guide,
      state,
      context,
      sources,
      codes,
      t,
      tr: (pair) => pair[lang],
    });
    const html = [
      views.catalogHTML(),
      views.lectureHTML(),
      views.helpHTML(),
      ...pages.map(views.chapterHTML),
    ].join("");
    assert.doesNotMatch(html, /\bundefined\b|\[object Object\]/);
  }
});

test("static entrypoint uses ordered local scripts and available assets", () => {
  const html = read("index.html");
  const scripts = [...html.matchAll(/<script\s+defer\s+src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(scripts, [
    "assets/content.js",
    "assets/guide.js",
    "assets/ui.js",
    "assets/views.js",
    "assets/app.js",
  ]);
  for (const file of scripts) new vm.Script(read(file), { filename: file });
  const documents = [
    html,
    read("assets/views.js"),
    ...pages.flatMap((p) => [p.html.ar, p.html.en]),
  ];
  for (const document of documents) {
    for (const [, url] of document.matchAll(/(?:src|href)="([^"$]+)"/g)) {
      if (/^(#|https?:)/.test(url)) continue;
      assert.ok(!url.startsWith("/"), `Root-relative URL breaks project hosting: ${url}`);
      assert.ok(fs.existsSync(path.join(root, url)), url);
    }
  }
  assert.ok(fs.existsSync(path.join(root, ".nojekyll")));
});

test("downloaded Kotlin examples match the displayed source exactly", () => {
  for (const file of ["main.kt", "main.kts"]) {
    const download = read("downloads/" + file).trim();
    assert.ok(
      Object.values(codes).some((code) => code.trim() === download),
      file,
    );
  }
});
