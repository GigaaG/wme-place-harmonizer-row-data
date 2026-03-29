# AGENTS.md

## Workspace topology

This workspace contains two related repositories:

- `wme-place-harmonizer-row-edition`: application code, business logic, UI behavior, tests, and developer docs
- `wme-place-harmonizer-row-data`: schemas, fixtures, reference data, validation inputs, and contract-related docs

These repositories must be treated as one functional system.
A task is not complete until cross-repository impact has been checked.

## Related repository
This repository is consumed by `wme-place-harmonizer-row-edition`.

When changing schemas, fixtures, allowed values, or validation-related structures, always check whether `wme-place-harmonizer-row-edition` also requires updates in:
- models
- validators
- parsers
- tests
- docs

## Waze Map Editor SDK dependency

The data structures in this repository are influenced by the behavior and data models exposed by the Waze Map Editor SDK.

When modifying schemas, fixtures, reference data, or validation rules:
- ensure compatibility with the data structures returned by the WME SDK
- verify that example data and fixtures remain consistent with SDK-driven behavior
- check whether the code repository requires updates when contracts change

If SDK-driven structures change:
- update schemas
- update fixtures
- update validation logic
- update documentation

## Repository purpose
This repository contains data-side assets such as schemas, fixtures, reference data, mappings, examples, validation-related assets, and related documentation.

This workspace also contains a separate code repository that consumes or depends on these assets.

Treat this repository as part of a cross-repository system, not as an isolated data store.

## Cross-repository responsibility
When implementing or modifying functionality in this repository, always check whether the related code repository also needs updates.

Cross-repository impact commonly includes:
- changed schema shape
- new or renamed fields
- changed enums or allowed values
- changed defaults
- changed fixtures or examples
- changed validation expectations
- changed parser or mapper behavior
- changed tests
- changed docs
- changed locale catalogs or the locale template

A task is not complete until cross-repository impact has been evaluated.

## Mandatory completion policy
Any change that introduces or modifies functionality is incomplete unless all relevant related artifacts are also updated.

This includes, when applicable:
- schemas or data contracts
- validation definitions
- fixtures and examples
- reference data
- code-side consumers
- automated tests
- documentation

Do not treat a task as complete after changing only one schema or one data file.

## Change policy for functional work
If functionality changes, the agent must also evaluate and update all relevant supporting artifacts.

Behavior or contract changes normally require:
- schema updates
- validation updates
- fixture or sample data updates
- test updates
- documentation updates
- locale updates for user-facing text

If accepted input or contract behavior changes and no schema was updated, explain why.
If fixtures or examples remain unchanged after a contract change, explain why.
If behavior changes and no tests were updated, explain why.
If documentation was not updated, explain why.
If user-facing text changed and locale files were not updated, explain why.

## Internationalization policy
This repository is the source of truth for WME Place Harmonizer translations.

When adding or changing user-facing text:
- update `locales/en.json`
- update `locales/nl.json`
- update `locales/fr.json`
- update `locales/template.json`
- keep locale keys stable and descriptive
- use locale keys for formatting/help text instead of raw localized strings where possible
- keep `editorNotes` in the dedicated locale-keyed editor-notes data structure rather than the shared locale catalog

## Data consistency policy
When changing any of the following:
- schema fields
- required or optional fields
- enums
- allowed values
- defaults
- mappings
- import/export definitions
- fixtures
- examples
- reference data

also check and update:
- related schemas
- examples
- fixtures
- validators
- code-side consumers
- tests
- docs

Never leave multiple representations of the same contract out of sync.

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

## Test and validation policy
Contract or data changes should normally include updated or new checks.

Relevant checks may include:
- schema validation
- fixture validation
- consistency checks
- import validation
- integration tests
- regression tests

If tests or validation checks are not updated after a meaningful contract change, explain why not.

## Verification requirements
Before finishing, run the most relevant available verification commands for this repository.

Typical required checks include:
- schema validation
- data validation
- consistency checks
- tests
- docs validation or docs build

Prefer project-level verification commands when available.

Do not claim the task is complete without running verification unless running commands is impossible.
If verification cannot be run, clearly state what remains unverified.

## Required completion check
Before finishing a task, explicitly verify:
- What changed in this repository?
- Was the code repository checked?
- Were related code-side consumers evaluated?
- Were schemas updated if contracts changed?
- Were fixtures/examples updated if needed?
- Were tests or validation checks updated?
- Were docs updated?
- What commands were run?
- What remains unverified?

## Final response requirements
At the end of the task, provide a concise summary of:
- what changed in this repository
- whether the code repository was checked
- what changed there, or why no change was needed
- whether validation changed
- whether schemas changed
- whether fixtures/examples changed
- whether tests changed
- whether docs changed
- which verification commands were run
- what remains unverified

## Preferred working style
Prefer precise, contract-consistent, minimal changes.
Do not leave fixtures, examples, validators, or docs outdated after a schema change.
Do not stop after a single schema edit if downstream artifacts are likely affected.
