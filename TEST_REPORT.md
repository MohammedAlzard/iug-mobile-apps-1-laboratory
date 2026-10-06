# Final beginner usability review

Reviewed 2026-10-06.

## Student-only publication — 2026-10-06

- Added an explicit 13-file publication list and `npm run prepare:site`. It creates `_site` using only the HTML, local runtime assets, three images and Kotlin examples. Markdown, tests, scripts, package metadata, license and Git internals are retained in the source project but absent from the website artifact. Generated output is ignored by Git.
- Removed README links from the JavaScript-disabled fallback. Added a GitHub Pages workflow that checks the project and uploads `_site` only. Publication instructions now use Settings → Pages → Source → GitHub Actions.
- All 14 automated tests passed, including a publication integration test that checks retained originals, identical public copies, local links and removal of a stale internal file from generated output. Workflow YAML parsed successfully. No GitHub workflow was executed in this task.
- Served `_site` locally and checked 19 HTTP URLs: all 12 maintenance/internal URLs returned 404, while all seven sampled public files returned 200. Browser checks confirmed the welcome page, logos and Kotlin execution example, with zero Markdown links or JavaScript errors.
- Website exclusion is separate from repository visibility: files committed to a public GitHub repository remain publicly readable through GitHub. Serve only `_site` on other static hosts; serving the source project root exposes its documentation. No original files were deleted; no commit or push was made.

## Remove repeated setup choices — 2026-10-06

- Step 1 now covers requirements only, with a short note about a physical phone reducing the computer's workload. Its completion result no longer asks for a device choice.
- Step 5 is the only page with a device picker. The emulator branch now includes installing Android Emulator from SDK Manager, acceleration, creating the AVD and starting it. Step 4 covers shared SDK tools; the installer step keeps default components without requiring an early device decision.
- Removed duplicated Device Manager route prose, the generic Next reminder in step 6 and the consecutive restart instruction before opening the Kotlin practice folder. Combined optional Java path checks with missing-JDK troubleshooting; moved the optional Scoop/Kotlin pre-check into installation troubleshooting. Both languages were updated.
- Compared all command strings, configuration and sources with the pre-change data: unchanged. Every page retains the same copyable code-block references, including relocated diagnostic checks. Downloadable examples are unchanged.
- All 13 existing automated tests passed. Browser checks passed for the eight changed pages in both languages at 390/1440 px: 32 views, with no horizontal overflow or missing content. Confirmed zero pickers in step 1 and exactly one in step 5, the three emulator stages, and that selecting a phone displays only phone instructions. No JavaScript errors were recorded.
- Reviewed the Android Developers SDK Manager and AVD documentation for the relocated emulator setup. Installation itself was not executed; no commit or push was made.

## Implementation cleanup — 2026-10-06

- Split page lookup and progress rules (`guide.js`), shared labels/icons (`ui.js`), and view templates (`views.js`) from the interaction controller (`app.js`). Retained plain deferred scripts and relative URLs; no build step or runtime dependencies.
- Removed the unused route-tab DOM and rendering, 23 unused label keys in each language, four unused icons, obsolete CSS selectors and redundant declarations. CSS now has 464 rules / 1,256 declarations, down from 524 / 1,465. Files are formatted for maintenance rather than minified; fewer rules does not imply fewer physical lines or bytes.
- SHA-256 comparisons against the pre-refactor files confirm `assets/content.js`, `downloads/main.kts` and `downloads/main.kt` are byte-for-byte unchanged.
- `npm test`: all 13 tests passed. Coverage includes route resolution, bilingual content references, future lecture isolation, readiness gating, device changes, malformed/blocked storage, persistence, search, rendered templates, local asset paths and downloadable examples. Tests use Node built-ins; no package installation is required.
- Compared all 20 routes in both languages at 390, 675 and 1440 px: 120 views. Text (ignoring formatting whitespace), exact code blocks, visible element dimensions, font sizes, colors and display properties matched the pre-refactor baseline. No horizontal overflow. Two CSS class additions replace inline styles without changing layout.
- Tested all 40 route/language combinations under `/iug-mobile-apps-1-laboratory/` on a local HTTP server, including images and headings. This checks the subdirectory layout used by a GitHub Pages project site. Another eight views passed in dark mode at 390 px.
- Browser interactions passed: lecture card → first step, Back, troubleshooting search, language switch, mobile selector, copying an entire collapsed setup script, progress persistence after reload, device-dependent progress invalidation, reset cancellation/confirmation, sharing a URL that retains the project path, teaching view and Escape. Temporary progress marks were removed and the clipboard restored. No browser JavaScript errors were recorded.
- Deployment was not performed, and no commit or push was made. Live GitHub Pages configuration was not tested. The browser does not permit local `file://` navigation; direct file opening was reviewed structurally, not browser-verified. Physical printing and actual Windows/Android/Kotlin installation were not repeated during this implementation-only cleanup.

## Lecture catalog update

- The default URL and #overview show the course welcome page with exactly one published L01 card. #l01 opens the existing setup guide. All 17 content pages are assigned to L01; its nine steps and old deep links remain intact.
- Lecture records define titles, descriptions and ordered step IDs; a standard landing supports future documentation lectures. No placeholder lectures are published.
- Verified card click and keyboard activation, all nine Next links, return to the lecture landing, breadcrumb return to the catalog, and browser Back.
- Verified completion progress on the catalog card and persistence after reload; test marks were removed.
- 20 routes × 2 languages × 2 widths (390/1366 px) passed heading, missing-content and horizontal-overflow checks: 80 views. Another 8 checks covered both landing pages in dark mode at 320/1366 px in both languages. No browser JavaScript errors were recorded.
- Confirmed lecture ownership, ordered step references and no route collisions; JavaScript syntax checks passed. Printing behavior was updated so L01 prints its steps while the catalog remains a catalog; physical printing was not tested.

## Earlier beginner review scope

Reviewed all project files: HTML, application/content JavaScript, CSS, documentation, license, sample downloads and the three local images. Walked the guide as a first-time student, from requirements through manual main.kts creation and Android Studio Terminal execution.

## Changes

- Explain that Kotlin needs Java (JDK), supplied by Android Studio, before the Java configuration command. Provide a route for a custom install path or missing bundled Java.
- Explain Windows PowerShell, copy/paste, expected results, Scoop and Git at their first relevant step.
- Keep advanced SDK/project terms and pre-existing-installation checks in optional disclosures.
- Keep long setup commands available for inspection while allowing full copying with their details closed. Kotlin source and short run commands remain visible.
- Distinguish Kotlin editor support from the standalone kotlinc command.
- Correct phone troubleshooting to verify ADB immediately; allow Kotlin learning to continue while emulator/phone setup is pending.
- Preserve manual folder/file creation, the requested name-printing example, Terminal terminology and the institutional footer logos.
- Improve troubleshooting search to include command/error text and correct the Sources page return link.
- Prepare expanded instructions for printing through both the page button and the browser beforeprint event; physical printing was not exercised.

## Completed checks

- Followed Start and Next through all nine main steps and back to Home.
- Rendered 19 views in 2 languages, 2 themes and 2 widths (390 and 1366 px): 152 states with one main heading, no undefined code blocks, no broken loaded images and no page-level horizontal overflow.
- Checked the Java command expanded at 320 px, and inspected the Kotlin installation page at that width.
- Copied the complete 16-line Java setup command with its disclosure closed and compared it with the displayed source. Restored the previous clipboard.
- Checked phone/emulator branch visibility, mobile step navigation, readiness gating, and progress persistence after reload. Removed test completion marks.
- Found the Serializable troubleshooting page by searching its error name.
- 80 bilingual code references, internal anchors and source keys resolve. Both downloadable samples match the displayed source.
- JavaScript syntax checks passed. All 26 PowerShell snippets parsed successfully.
- 11 simulated installation/update assertions passed: fresh/existing Git and Kotlin, missing Scoop, manual Kotlin detection, and reported install/update failures. These were mocks; no installers ran.
- Checked Android Studio, bundled JDK, AVD acceleration, Scoop prerequisites and package handling, and Kotlin script execution against official references in SOURCE_NOTES.md.

## Privacy and assets

No personal financial, family, employer or client details appear in the shipped guide. Only the requested instructor identity and example remain. The three local images are the instructor portrait and the university/faculty logos. The earlier image inspection found no EXIF/XMP/text metadata. No external image, font, analytics or JavaScript dependency is loaded.

## Limits

This was a content, interface, source and simulated-command review, not a clean Windows installation or a study with actual students. Android Studio, SDK, AVD, Scoop and Kotlin were not installed during the review. No environment variables or execution policies were changed. Kotlin execution was not performed because kotlinc is unavailable locally. Hardware/BIOS, actual downloads, physical printing and deployment remain untested. Browser checks used local HTTP; the browser tool blocks direct file URLs.
