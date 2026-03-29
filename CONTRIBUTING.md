# Contributing to WME Place Harmonizer ROW Edition Data

This repository is the data-side source of truth for WME Place Harmonizer ROW Edition.

Changes here can affect the userscript runtime, validation, and the code repository that consumes this data. Treat contract changes carefully.

## Before you change data

If you change schemas, fixtures, reference data, allowed values, or validation-related structures, check whether the code repository also needs updates in:

- models
- validators
- parsers
- tests
- docs

## Validation

Install dependencies:

```bash
npm install
```

Generate the SDK value snapshot:

```bash
npm run generate:sdk-values
```

Validate the repository:

```bash
npm run validate
```

The current validation pipeline checks:

- manifest references
- config schema
- chain dataset schema
- locale schema
- duplicate chain ids
- duplicate aliases inside a chain
- duplicate regex values inside a chain
- allowed geometry, service, lock-level, and category values

The current validator does not validate exception dataset structure yet.

## Excel workflow

Config files can be exported to and imported from Excel through `scripts/config-excel.py`.

Examples:

```bash
npm run config:excel:export -- config/countries/nl.json exports/nl-config.xlsx
npm run config:excel:import -- exports/nl-config.xlsx config/countries/nl.json
npm run config:excel:roundtrip -- config/countries/nl.json
```

Use the round-trip command to confirm that exporting and immediately re-importing a config preserves the JSON structure.

## Change guidelines

For normal data changes:

1. make the data change
2. run `npm run validate`
3. run a round-trip check when you touched Excel-managed config structure
4. update the related documentation when behavior or data contracts changed

If a change affects user-facing text, update the locale files and the locale template together.

## Documentation policy

Update documentation whenever changes affect:

- schema shape
- field meanings
- allowed values
- import/export formats
- examples
- setup or usage instructions
- migration notes
- operator or developer guidance

Prefer updating canonical docs instead of creating duplicate docs.

## Cross-repo responsibility

This repository is consumed by `wme-place-harmonizer-row-edition`.

When a change affects the data contract, check whether the code repository also needs updates in:

- schemas
- validation logic
- fixtures or examples
- tests
- docs

## Final check

Before finishing, confirm:

- what changed in this repository
- whether the code repository was checked
- whether schemas changed
- whether fixtures or examples changed
- whether tests or validation checks changed
- whether docs changed
- which verification commands were run
- what remains unverified
