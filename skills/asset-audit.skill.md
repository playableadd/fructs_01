# asset-audit

## Purpose

Audit asset folders against `config.versions` to find unused or missing files before production build.

## When to use

- Verify assets before running `npm run prod`
- Detect missing files referenced by `config.versions`
- Identify files that are not included in any version list

## Triggers

- "check assets"
- "audit assets"
- "find unused textures"

## What it does

- Scans `assets/textures/`, `assets/sheets/`, `assets/fonts/`, `assets/audio/`, and `assets/spine/`
- Reports files not referenced in any version list (these will be globally included)
- Reports `config.versions` entries that do not match any file on disk
- Helps prevent broken builds and asset mismatches
