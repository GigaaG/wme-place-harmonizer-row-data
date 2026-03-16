# WME Place Harmonizer ROW Edition Data Repository

This repository contains the data files used by **WME Place Harmonizer ROW Edition**.

It is intentionally separated from the code repository so that communities can maintain standards, chains, exceptions and translations without changing the userscript code.

---

## Repository purpose

This repository stores:

- runtime manifest files
- global and local configuration
- chain definitions
- exceptions
- locales / translations
- schemas
- validation tooling
- SDK value snapshots used for validation

The code repository consumes these files at runtime.

---

## Current status

This repository is the **data layer** for the MVP of WME Place Harmonizer ROW Edition.

The validation pipeline currently checks:

- manifest references
- chain schema
- config schema
- allowed geometry values
- allowed service values
- allowed lock level values
- duplicate chain ids
- duplicate aliases within a chain
- duplicate regex values within a chain

GitHub Actions runs validation automatically on:

- push
- pull request

---

## Repository structure

```text
.github/workflows/     CI validation workflows

chains/                Chain definitions
  communities/
  countries/

config/                Config files
  communities/
  countries/
  states/

docs/                  Data model and contribution docs

examples/              Example data files and examples

exceptions/            Community / country exceptions
  communities/
  countries/

locales/               Locale files

manifest/              Runtime manifests

reference/             Generated SDK value snapshots

schemas/               JSON schemas

scripts/               Validation and generation scripts
```

## Key files

Important runtime files include:

manifest/stable.json
config/global.json
chains/global.json
locales/en.json

## How runtime loading works

The userscript loads a manifest file first.

The manifest points to the data files that are needed at runtime, such as:

global config

country config

global chains

country chains

locale files

This allows the code repository to stay stable while communities update data independently.

## Local development and validation

### Install dependencies
npm install

### Generate SDK reference values

npm run generate:sdk-values

This writes:

reference/sdk-values.json

### Validate the repository

npm run validate

The validation must pass before opening or merging a pull request.

## What the validator checks

### Structure validation

- JSON schema validation for supported data files
- required fields
- valid object structure
- expected data types

### Enum / SDK value validation

- geometry values
- service values
- lock level values
- category ids
- supported severity values

### Consistency validation

- manifest references existing files
- duplicate chain ids
- duplicate aliases within a chain
- duplicate regex values within a chain

## Contribution workflow

### For contributors

- Create a branch
- Make your data changes
- Run local validation
- Commit the changes
- Open a pull request

### Recommended local workflow

```bash
npm install
npm run generate:sdk-values
npm run validate
```

## Adding or editing chain data

Chain data belongs in:

- chains/global.json
- chains/countries/
- chains/communities/

### Use the existing structure for:

- id
- canonicalName
- match
- standard
- policy
- scope
- meta

### When adding chain data:

- use a unique id
- keep canonicalName canonical
- do not duplicate the canonical name in aliases
- only use valid SDK service values
- keep geometry values to point or polygon
- keep lockLevel values between 1 and 6

## Adding or editing config data

Config data belongs in:

- config/global.json
- config/countries/
- config/communities/
- config/states/

### Use config files for:

- rules
- category standards
- geometry recommendations
- required / recommended / forbidden services
- community-specific behavior

### When editing config:

- use valid severity values
- use valid geometry values
- use valid service values
- use lockLevel values between 1 and 6
- keep structures aligned with the schema

## Locales

Locale files belong in:

- locales/

For MVP, locale files should remain simple and valid JSON.

## Pull request expectations

A pull request should:

- be limited in scope
- explain what changed
- explain why the change is needed
- pass validation
- avoid unrelated formatting-only changes unless requested

### Examples of good PRs:

- add one new chain
- update one country config
- fix one invalid service value
- add one locale update

## CI validation

GitHub Actions validates the repository automatically on push and pull request.

If validation fails, the pull request should not be merged until the issue is fixed.

## Design principles

- data-driven behavior
- safe defaults
- global-first with local overrides
- no code changes required for normal community data updates
- validation before merge
- prevent runtime breakage caused by bad data

## Related repository

The userscript code lives in the separate code repository for WME Place Harmonizer ROW Edition.

This repository only contains the data layer.

## Notes

The SDK values snapshot in reference/sdk-values.json is used to validate data safely and consistently.

Contributors should not invent new SDK-facing values without first confirming that they are valid and updating the reference pipeline when needed.
