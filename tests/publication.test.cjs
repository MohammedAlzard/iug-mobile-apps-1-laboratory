const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { prepareSite, output } = require("../scripts/prepare-site.cjs");
const files = require("../scripts/site-files.json");
const root = path.resolve(__dirname, "..");

function publishedFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix + entry.name;
    return entry.isDirectory()
      ? publishedFiles(path.join(directory, entry.name), relative + "/")
      : [relative];
  });
}

test("student publication excludes maintenance files and stale output", () => {
  prepareSite();
  fs.writeFileSync(path.join(output, "STALE_PRIVATE.md"), "Must not survive publication.");
  prepareSite();
  assert.deepEqual(publishedFiles(output).sort(), [...files].sort());
  for (const file of files) {
    assert.deepEqual(
      fs.readFileSync(path.join(output, file)),
      fs.readFileSync(path.join(root, file)),
      file,
    );
  }
  const internal = [
    "README.md",
    "README_AR.md",
    "README_EN.md",
    "DEVELOPMENT.md",
    "TEST_REPORT.md",
    "SOURCE_NOTES.md",
    "LICENSE.txt",
    "package.json",
    "tests",
    "scripts",
    ".github",
    ".git",
  ];
  for (const file of internal) {
    assert.ok(fs.existsSync(path.join(root, file)), `Original must be retained: ${file}`);
    assert.equal(fs.existsSync(path.join(output, file)), false, `Internal file published: ${file}`);
  }

  const read = (file) => fs.readFileSync(path.join(output, file), "utf8");
  const data = { window: {} };
  vm.runInNewContext(read("assets/content.js"), data);
  const html = [
    read("index.html"),
    read("assets/views.js"),
    ...data.window.GUIDE_PAGES.flatMap((page) => [page.html.ar, page.html.en]),
  ];
  for (const document of html) {
    for (const [, url] of document.matchAll(/(?:src|href)="([^"$]+)"/g)) {
      if (/^(#|https?:)/.test(url)) continue;
      assert.ok(files.includes(url), `Student link points outside the published site: ${url}`);
    }
  }
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
  assert.match(workflow, /path: _site/);
  assert.doesNotMatch(workflow, /path: ['"]?\.['"]?\s/);
});
