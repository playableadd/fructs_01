# add-version

## Purpose

Add a new A/B test version entry to `config.versions` with the correct asset lists.

## When to use

- Create a new version variation for the playable ad
- Add a second or third creative variant
- Prepare separate asset sets for desktop/mobile or campaign variants

## Triggers

- "add a new version"
- "create an A/B variant"

## What it does

- Adds a new version key to `config.versions` in `config.js`
- Prompts for textures, sheets, fonts, and audio assets for this version
- Optionally updates `config.currentVersion` for development mode
- Ensures version-specific builds generate separate `dist/<version>/` output
