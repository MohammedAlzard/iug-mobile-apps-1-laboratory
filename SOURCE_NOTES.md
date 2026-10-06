# Sources and scope

Reviewed: 2026-10-06. Final beginner usability review.

The course identity is limited to the instructor name, course title, instructor portrait and university/faculty logos. Installation paths use standard application locations or the current user's environment variables. No personal website, client portfolio or machine history is included.

## Official references

- Installation and system requirements: https://developer.android.com/studio/install
- SDK and updates: https://developer.android.com/studio/intro/update
- Virtual devices: https://developer.android.com/studio/run/managing-avds
- Emulator acceleration: https://developer.android.com/studio/run/emulator-acceleration
- Windows optional features: https://learn.microsoft.com/en-us/powershell/module/dism/enable-windowsoptionalfeature
- Bundled JDK: https://developer.android.com/build/jdks
- Environment variables: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables
- Scoop installation: https://github.com/ScoopInstaller/Install
- Scoop updates: https://github.com/ScoopInstaller/Scoop/wiki/Quick-Start
- Kotlin package definition: https://github.com/ScoopInstaller/Main/blob/master/bucket/kotlin.json
- Kotlin compiler and scripts: https://kotlinlang.org/docs/command-line.html
- IDE terminal: https://www.jetbrains.com/help/idea/terminal-emulator.html
- Optional VS Code support: https://kotlinlang.org/docs/kotlin-lsp.html

## Editorial decisions

The guide uses available stable releases rather than personal version snapshots. SDK platform and emulator image versions serve different purposes. Emulator image API must satisfy the project's minSdk; compileSdk identifies its build platform.

Android Studio, SDK and AVD installation use the GUI. Kotlin setup uses non-admin PowerShell; Windows feature activation is explicitly labelled Administrator and followed by a manual restart. BIOS virtualization remains a device-specific step.

Scoop installs only when absent. Git is installed if missing for updates. Kotlin is installed or updated through Scoop; checks reveal path conflicts with manual installations. Learners create the practice folder and main.kts manually, edit the file in Android Studio, and explicitly run kotlinc -script main.kts in its PowerShell terminal. VS Code repeats the same example as an optional alternative for basics only. No fixed practice-folder path is assumed. Java settings affect the current user, preserve other Path entries, and cannot automatically override every system-level Java entry.

No external image, font, analytics or JavaScript dependency is loaded by the guide. External documentation opens only when selected. The test report distinguishes source review, simulated checks and actual execution.

## Beginner review

The main route explicitly introduces SDK at first launch, bundled Java before Kotlin, and the purpose of Scoop and Git at installation. Commands are labelled with their execution location and administrator requirements. Advanced SDK version matching and secondary checks are collapsed. Manual folder/file creation remains the primary Android Studio workflow; VS Code is optional for basics.

Scoop list returns named app objects, checked against its official source: https://github.com/ScoopInstaller/Scoop/blob/master/libexec/scoop-list.ps1. Existing Kotlin outside Scoop stops the installation block rather than installing a second copy. Installation/update branches stop when commands report failure; actual downloads were not tested.

## Lecture organization

The course catalog is #overview. The complete current guide belongs to lecture L01 at #l01. Existing page IDs are preserved for direct links and saved progress. Future lecture cards and standard landing pages use GUIDE_CONFIG.lectures and each page’s lectureId.
