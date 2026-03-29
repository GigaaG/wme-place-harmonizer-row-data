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

## Required versus published entries

The manifest may list more files than the runtime actively consumes. For example, current manifests still publish:

- locale files
- exception dataset files

Locale entries are used by the runtime. Exception entries are currently informative only because the userscript does not consume exception datasets yet.

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
- do not imply that a published entry is necessarily an active runtime dependency
