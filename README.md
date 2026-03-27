# WME Place Harmonizer ROW Edition Data Repository

This repository contains the data published for WME Place Harmonizer ROW Edition.

It is intentionally separate from the userscript repository so that manifests, config, chains, locales, and validation tooling can evolve without changing userscript code for every data update.

## Relationship to the code repository

This repository is consumed by:

- [wme-place-harmonizer-row-edition](https://github.com/GigaaG/wme-place-harmonizer-row-edition)

The current userscript runtime depends on:

- manifest files
- `config/global.json` and optional country config overlays
- `chains/global.json` and optional country chain overlays
- locale files listed in the manifest

The code repository also imports `reference/sdk-values.json` during local build and test workflows.

Exception datasets are published here but are not consumed by the current userscript runtime.

## Repository structure

```text
.github/workflows/     Data validation workflow
chains/                Chain datasets
config/                Global, community, and country config files
docs/                  Retained data-side reference docs
exceptions/            Published but currently inactive runtime datasets
locales/               Locale files
manifest/              Runtime manifests
reference/             Generated SDK value snapshot
schemas/               JSON schemas used by validation
scripts/               Validation and Excel tooling
```

## Validation and tooling

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

Country or community config can also disable Google-linked venue validation globally or per check through the `googleMapsValidation` config section. See [docs/config-model.md](docs/config-model.md).

## Excel config workflow

Config files can be exported to and imported from Excel through the Python tooling in `scripts/config-excel.py`.

Examples:

```bash
npm run config:excel:export -- config/countries/nl.json exports/nl-config.xlsx
npm run config:excel:import -- exports/nl-config.xlsx config/countries/nl.json
npm run config:excel:roundtrip -- config/countries/nl.json
```

Use the round-trip command to confirm that exporting and immediately re-importing a config preserves the JSON structure.

## Contribution expectations

For normal data changes:

1. make the data change
2. run `npm run validate`
3. run a round-trip check when you touched Excel-managed config structure
4. update the related documentation when behavior or data contracts changed

If a change affects user-facing text, update the locale files and the locale template together.

## Documentation map

- [docs/config-model.md](docs/config-model.md)
- [docs/chains-model.md](docs/chains-model.md)
- [docs/manifest-model.md](docs/manifest-model.md)

The documentation set intentionally focuses on the current runtime contract. Published exception datasets remain in the repository, but they are not treated as an active userscript feature in the retained docs.
