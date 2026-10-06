# Course lecture guide

Islamic University of Gaza · Faculty of Information Technology · MOBC 2101.
Prepared by Eng. Mohammed A. Alzard — Course Instructor.

## Run

Open `index.html`, keeping `assets` and `downloads` beside it. No dependencies, build process or server required. Downloads and official links need internet.

## Student journey

The site opens with a welcome page and lecture cards. The only published card is **L01 — Set up Android Studio and run your first Kotlin code**. All current steps, help and sources belong to L01.

L01 contains a nine-step sequence: requirements, Android Studio installation, first launch, SDK, emulator or phone, readiness, bundled Java, installing or updating Scoop and Kotlin, then manually creating the folder and main.kts and running it in Android Studio Terminal.

Open the lecture card, then Start from scratch and follow Next. Direct step navigation, browser-local progress and troubleshooting search remain available. VS Code is optional after the main sequence.

Android Studio includes the required Java (JDK); a separate Java download is unnecessary. Step 7 configures it, and step 8 installs Scoop, Git when needed, and Kotlin. Long setup commands can be expanded for reading; Copy always includes every line.

Kotlin commands use regular PowerShell. Only Windows Hypervisor Platform feature checks and activation are labelled Administrator. The page copies commands; it never executes them on the student's machine.

## Publish

For GitHub Pages, choose Settings → Pages → Source → GitHub Actions. `.github/workflows/pages.yml` tests the project and publishes only the student-facing `_site` directory when changes are pushed to `main`. Documentation and tests remain in the project and are excluded from the published website.

For another static host, run `npm run prepare:site` and upload only the contents of `_site`. Do not serve the entire project root to students. Node.js is used to prepare publication; the website itself does not require it.

Step links use the current hosted URL. On a local file, sharing asks for the hosted version to avoid copying a device path. Existing anchors such as `#step-1` and `#kotlin-1` still work.

## Maintain

- `assets/content.js`: paired Arabic/English instructions, commands and references.
- `assets/guide.js`: page indexes, routing and progress persistence.
- `assets/ui.js`: shared interface translations and icons.
- `assets/views.js`: page templates and reusable display controls.
- `assets/app.js`: navigation, clipboard and interaction handlers.
- `assets/styles.css`: responsive design and printing.
- `assets/images`: only the course instructor portrait and two institutional logos.
- `downloads`: matching `.kts` and `.kt` examples.

Printing the L01 landing page prints the nine main steps. Printing a step prints that section. See `TEST_REPORT.md` for verification scope and `SOURCE_NOTES.md` for references.

See [Development](DEVELOPMENT.md) for implementation and test instructions. These tools are for maintainers; students do not need them to open the guide.

## Add a lecture

In `assets/content.js`, add a record to `GUIDE_CONFIG.lectures` with a unique `id` (for example `l02`), `code`, bilingual `title` and `description`, ordered `stepIds`, and `overviewType: "standard"`. The `setup` overview type is reserved for L01.

Add pages to `GUIDE_PAGES` with unique IDs (such as `l02-example`) and the matching `lectureId`. General documentation pages can use `group: "lesson"`. Provide bilingual title, description and HTML, plus num, sources and an optional result. Add copyable code to `GUIDE_CODES` and reference it with data-code. The catalog, lecture landing and step navigation use these records automatically. Only published lectures should be included.

`#overview` is the catalog and `#l01` opens the existing lecture. Existing step links such as `#kotlin-3` and saved progress remain compatible.
