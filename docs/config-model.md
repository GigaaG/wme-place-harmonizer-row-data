# WME Place Harmonizer ROW Edition Configuration Model

This document describes the configuration structure that is currently relevant to the checked-in userscript runtime.

## Config file types and locations

The repository stores config files under:

```text
config/global.json
config/communities/*.json
config/countries/*.json
config/states/*.json
```

The schema accepts multiple config types:

- `global-config`
- `community-config`
- `country-config`
- `state-config`

## Current runtime loading model

The current userscript runtime loads:

1. `config/global.json`
2. an optional country config such as `config/countries/nl.json`

If a loaded config file contains `extends`, the loader resolves the parent path and deep-merges the parent into the child.

Current `extends` forms supported by the loader:

- `global`
- `community:<id>`
- `country:<id>`
- `state:<id>`

This means community and state files can participate in inheritance, even though the top-level loader currently starts from global plus country.

## Runtime-consumed fields

The current runtime actively depends on these config fields:

- `id`
- `type`
- `version`
- optional `extends`
- `defaults.locale`
- `formatting.phone`
- `formatting.url`
- `rules.cityInVenueName`
- `googleMapsValidation`
- `categoryStandards`

`categoryStandards` can contain:

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

## Google Maps validation policy

`googleMapsValidation` allows country or community data to disable linked Google Place validation globally or per check.

Supported fields:

- `googleMapsValidation.enabled`
- `googleMapsValidation.checks.notFound`
- `googleMapsValidation.checks.closed`
- `googleMapsValidation.checks.locationDrift`
- `googleMapsValidation.checks.nameMismatch`
- `googleMapsValidation.checks.category`
- `googleMapsValidation.checks.openingHours`
- `googleMapsValidation.severity.notFound`
- `googleMapsValidation.severity.closed`
- `googleMapsValidation.severity.locationDrift`
- `googleMapsValidation.severity.nameMismatch`
- `googleMapsValidation.severity.category`
- `googleMapsValidation.severity.openingHours`

Behavior:

- if `enabled` is `false`, users cannot enable Google-linked validation locally
- if an individual check is `false`, that check is disabled in the UI and not executed by the runtime
- severity values control the issue severity used in the feature editor and in visible-venue scan highlighting
- omitted fields inherit from the parent config, then default to enabled

Example:

```json
{
  "googleMapsValidation": {
    "severity": {
      "openingHours": "warning"
    },
    "checks": {
      "openingHours": false,
      "locationDrift": false
    }
  }
}
```

## Fields that are not active runtime contracts

The config schema is broader than the current runtime.

Do not treat the following as active userscript behavior unless the code-side runtime starts consuming them explicitly:

- `mergeStrategies`
- `highlighting`
- generic `matching` settings
- rule toggles other than the fields actively read by the runtime
- extra `defaults` substructures that are not consumed by the code

These fields may exist for compatibility, future work, or local experimentation, but they are not the current code-side contract.

## Merge behavior

The current config merge behavior is code-side deep merge:

- scalar values overwrite the parent
- nested objects merge recursively
- arrays are overwritten by the child value

The runtime does not execute data-defined merge strategies.

## Category standards

`categoryStandards` defines policy for categories even when no chain matches.

Category keys must use the canonical SDK category id format, for example:

- `FAST_FOOD`
- `GAS_STATION`
- `PARKING_LOT`
- `RESIDENTIAL`

The data validator checks category ids against `reference/sdk-values.json`.

`editorNotes` stay inside config data as locale-keyed text lists because they are data-bound guidance, not shared UI locale catalog entries.

## Excel import and export

Config files can be maintained through the Excel workflow in `scripts/config-excel.py`.

The workbook uses these sheets:

- `Overview`
- `Rules`
- `Formatting`
- `Category Standards`
- `Editor Notes`
- `Extra JSON`

Important behavior:

- blank cells remove a field during import
- list values use one value per line inside a cell
- `isDefined` on the category sheet preserves otherwise empty category entries
- `Extra JSON` keeps unsupported sections round-trip safe

## Editing guidance

When editing config:

- keep `config/global.json` minimal and truthful to current runtime behavior
- use country config overlays for country-specific formatting or category policy
- update docs when a field becomes an active runtime dependency
- do not document or promote inactive config surface as if it were implemented behavior
