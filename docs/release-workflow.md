# WME Place Harmonizer ROW Edition Data Release Workflow

This document defines the branch promotion model for the data repository.

## Branch roles

- `dev`: active integration branch for data work
- `beta`: frozen beta-candidate data branch
- `main`: stable runtime data branch

## Why this repository needs `beta`

Unlike the code repository, this repository is loaded directly by the userscript runtime from GitHub. That means branch choice is part of runtime behavior, not just source control hygiene.

The intended runtime mapping is:

- code `dev` builds read data repository `dev`
- code `beta` builds read data repository `beta`
- code `main` builds read data repository `main`

Without a `beta` branch here, beta testers would keep testing moving `dev` data instead of a frozen candidate.

## Normal promotion flow

1. Create a feature or maintenance branch from `dev`.
2. Make the data change.
3. Run validation locally.
4. Merge into `dev`.
5. Promote `dev -> beta` when a beta data set is ready.
6. Let beta users validate the promoted data set.
7. Promote `beta -> main` once the beta data is accepted.

`beta` should only receive beta fixes after promotion. Routine authoring still belongs on feature branches into `dev`.

## Change classes

Low-risk runtime data changes still affect users and should follow the normal promotion flow:

- `chains/**`
- `config/countries/**`
- `config/communities/**`
- `locales/**`

Higher-risk contract changes require coordinated review with the code repository:

- `schemas/**`
- `scripts/**`
- `reference/**`
- `manifest/**`
- contract-heavy shared files such as `config/global.json`

When these files change, confirm the code repository is compatible before promoting to `beta` or `main`.

## Validation expectations

Before merging into `dev`, run:

```bash
npm run generate:sdk-values
npm run validate
```

When you touched Excel-managed config structure, also run:

```bash
npm run config:excel:roundtrip -- <config-file>
```

## Emergency fixes

If a stable data hotfix must go straight to `main`, treat it as an exception:

1. apply the hotfix
2. validate it
3. merge or cherry-pick it back into `beta`
4. merge or cherry-pick it back into `dev`

Do not leave `main` carrying unique data changes that are missing from `beta` or `dev`.
