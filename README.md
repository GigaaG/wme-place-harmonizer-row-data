# WME Place Harmonizer ROW Edition Data Repository

This repository contains the data published for WME Place Harmonizer ROW Edition.

It is intentionally separate from the userscript repository so that manifests, config, chains, locales, and validation inputs can evolve without forcing a code release for every data update.

## What is here

The repository publishes the data used by the current runtime:

- manifests
- config files
- chain datasets
- locale files
- reference values for validation

Exception datasets are published here as part of the repository, but they are not yet consumed by the current userscript runtime.

## Related repository

This repository is consumed by:

- [wme-place-harmonizer-row-edition](https://github.com/GigaaG/wme-place-harmonizer-row-edition)

The code repository also imports `reference/sdk-values.json` during local build and test workflows.

## Layout

```text
chains/                Chain datasets
config/                Global, community, and country config files
docs/                  Contract reference docs
exceptions/            Published but currently inactive runtime datasets
locales/               Locale files
manifest/              Runtime manifests
reference/             Generated SDK value snapshot
schemas/               JSON schemas used by validation
scripts/               Validation and Excel tooling
```

## Documentation

- [docs/config-model.md](docs/config-model.md)
- [docs/chains-model.md](docs/chains-model.md)
- [docs/manifest-model.md](docs/manifest-model.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## For contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for validation commands, Excel workflow, and change guidelines.
