# build-debug

## Purpose

Diagnose common production build failures in the asset pipeline and recommend fixes.

## When to use

- A production build fails or hangs
- Assets are missing from the generated HTML
- Build output contains webpack or builder plugin errors

## Triggers

- "build is failing"
- "webpack error"
- "asset not loading"

## What it does

- Inspects build output to identify which builder module failed (`Textures`, `Sheets`, `Audio`, `Fonts`, `Spine`)
- Checks FFmpeg availability and version for audio generation
- Verifies `temp/` is writable and that asset directories exist
- Points to the exact file or configuration issue causing failure
