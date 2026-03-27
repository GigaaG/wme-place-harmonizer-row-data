# WME Place Harmonizer ROW Edition Chains Model

This document describes the chain dataset structure that matters to the current userscript runtime.

## Dataset locations

Chain datasets live under:

```text
chains/global.json
chains/communities/*.json
chains/countries/*.json
```

The current userscript runtime requires `chains/global.json` and optionally loads a country overlay such as `chains/countries/nl.json`.

## Dataset shape

Each dataset uses this top-level shape:

```json
{
  "id": "global-chains",
  "type": "chain-dataset",
  "version": 1,
  "items": []
}
```

## Current runtime merge behavior

Global and country chain datasets are merged by `id` in the userscript code:

- records with a new `id` are appended
- records with an existing `id` are deep-merged
- the merged dataset keeps the override dataset id when present

This merge behavior is implemented in the code repository. It is not driven by data-side merge strategy metadata.

## Chain fields used by the current runtime

The current runtime and proposal generation pipeline actively use:

- `id`
- `canonicalName`
- `match.aliases`
- `match.regex`
- selected `standard` fields such as:
  - `name`
  - `brand`
  - `url`
  - `aliases`
  - `optionalAliases`
  - `openingHoursTemplate`
  - `externalProviderIds`
- selected `policy` fields such as:
  - `geometry`
  - `lockLevel`
  - `cityInVenueName`
  - `phone`
  - `url`
  - `openingHours`
  - `navigationPoints`
  - `externalProviderIds`
  - `services`
  - `address`
- `editorNotes`

## Fields that are present but not strong runtime contracts

Some fields appear in schemas, examples, or existing data but are not currently strong runtime dependencies.

In particular:

- `match.categoryAnyOf` is part of the model and validation surface, but the current matcher only checks canonical name, aliases, and regex
- `scope` and `meta` are useful for maintenance and debugging, but not central to matching
- additional match concepts should not be documented as active behavior unless the code-side matcher starts using them

## Matching behavior

The current chain matcher checks, in order:

1. canonical name equality after normalization
2. alias equality after normalization
3. regex matches

The first match wins.

## Editing guidance

When editing chain data:

- keep `id` stable
- keep `canonicalName` truly canonical
- use aliases for known variations and misspellings
- use regex only when aliases are not sufficient
- avoid documenting category hints or other advanced match concepts as if they already affect matching unless the code starts using them

## Validation

Chain datasets are validated in the data repository before publication.

Current validation covers:

- schema compliance
- duplicate chain ids
- duplicate aliases within a chain
- duplicate regex values within a chain
- allowed SDK-facing values such as geometry, categories, services, and lock levels
