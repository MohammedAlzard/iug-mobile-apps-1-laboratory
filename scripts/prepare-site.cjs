/* Publish only explicitly listed student-facing files. */
const fs = require("node:fs");
const path = require("node:path");
const files = require("./site-files.json");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "_site");

function prepareSite() {
  // Validate all sources before replacing the generated directory.
  if (new Set(files).size !== files.length) throw new Error("Duplicate publish paths.");
  for (const file of files) {
    if (path.isAbsolute(file) || file.split(/[\\/]/).includes("..")) {
      throw new Error(`Invalid publish path: ${file}`);
    }
    const source = path.join(root, file);
    const realSource = fs.realpathSync(source);
    const relative = path.relative(root, realSource);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.statSync(source).isFile()) {
      throw new Error(`Publish source must be a file inside the project: ${file}`);
    }
  }

  // Never recursively remove a symlink or a path outside this workspace.
  if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) {
    throw new Error("The generated _site directory must not be a symlink.");
  }
  if (path.dirname(output) !== root || path.basename(output) !== "_site") {
    throw new Error("Invalid generated directory.");
  }
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output);
  for (const file of files) {
    const destination = path.join(output, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, file), destination);
  }
  return output;
}

if (require.main === module) {
  prepareSite();
  console.log(`Prepared _site with ${files.length} student-facing files.`);
}

module.exports = { prepareSite, output };
