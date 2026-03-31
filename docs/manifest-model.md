# WME Place Harmonizer ROW Edition Manifest Model

This document describes the manifest structure and its current role in the checked-in userscript runtime.

## Current implementation scope

The userscript currently uses the manifest for:

- channel metadata
- dataset version information
- `dataRevision` cache busting
- locale file availability checks

Config and chain loading still use fixed runtime paths such as `config/global.json` and `chains/global.json`. The manifest is not yet the full authoritative loader for those files.

## Manifest locations

```text
manifest/stable.json
manifest/dev.json
```

These manifest files exist within each long-lived repository branch. The repository branch selects the promotion lane (`dev`, `beta`, or `main`), while the manifest file selects the runtime data channel inside that branch.

## Required top-level fields

Each manifest currently needs:

- `channel`
- `version`
- `generatedAt`
- `dataRevision`
- `files`

The code-side loader validates all of these fields.

## `channel`

Supported values:

- `stable`
- `dev`

## `files`

`files` is a map of repository-relative paths to entries of this shape:

```json
{
  "required": true
}
```

The current code-side manifest validator requires these entries to exist and be marked as required:

- `config/global.json`
- `chains/global.json`

In current runtime behavior, `locales/en.json` is the effective fallback locale and should stay published.
Additional locale files such as `locales/nl.json` and `locales/fr.json` may be published as optional entries because the runtime can fall back to English.

## Required versus published entries

The manifest may list more files than the runtime actively consumes. For example, current manifests still publish:

- locale files
- exception dataset files

Locale entries are used by the runtime. Exception entries are currently informative only because the userscript does not consume exception datasets yet.

That means current manifests should generally follow this pattern:

- mark `config/global.json` and `chains/global.json` as required
- mark `locales/en.json` as required
- mark additional locale files as optional unless the runtime truly depends on them
- mark exception datasets as optional until the runtime actively consumes them

## Runtime behavior

The current userscript manifest flow is:

1. load the manifest for the active channel
2. validate the manifest structure
3. cache the manifest and `dataRevision`
4. fall back to a cached manifest if the live load fails and the cached manifest is still valid

If neither a live manifest nor a valid cached manifest is available, startup fails.

## Editing guidance

When editing manifests:

- keep `channel`, `version`, `generatedAt`, and `dataRevision` accurate
- update `dataRevision` when the published dataset changes in a meaningful way
- keep `config/global.json` and `chains/global.json` listed as required
- only mark files as required when the current runtime actually depends on them for startup or fallback guarantees
- do not imply that a published entry is necessarily an active runtime dependency
