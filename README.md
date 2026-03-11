# WME Place Harmonizer ROW Edition — Data Repository

Deze repository bevat alle publieke community-data voor WME Place Harmonizer ROW Edition.

De repository is bedoeld als centrale bron voor:

- global configuratie
- community configuratie
- country configuratie
- optionele state/region configuratie
- chains
- exceptions
- locales
- JSON schema’s
- manifestbestanden voor caching en versiebeheer

## Doel

Het userscript gebruikt deze repository als externe configuratiebron. Hierdoor kunnen communities standaarden, chains en uitzonderingen beheren zonder de scriptcode aan te passen.

## Basisstructuur

```text
manifest/
config/
config/communities/
config/countries/
config/states/
chains/
chains/communities/
chains/countries/
exceptions/
exceptions/communities/
exceptions/countries/
locales/
schemas/
examples/
docs/
```
## Configuratiehiërarchie

De basisvolgorde is:

- global
- community
- country
- state/region
- tijdelijke user fallback in het script

Niet alle niveaus zijn verplicht.

## Communities over meerdere landen

Een community mag meerdere landen bedienen.

Voorbeeld:

- DACH community voor Duitsland, Oostenrijk en Zwitserland

In dat geval kan een country-config verwijzen naar of erven van een community-config.

## Manifesten

De map manifest/ bevat de publicatie-ingangen voor het script.

Minimaal zijn er twee kanalen:

- stable.json
- dev.json

Deze bestanden helpen het script bepalen:

- welke data-versie actief is
- welke bestanden bekend zijn
- welke cache invalidatie nodig is

## Governance

Deze repository bevat geen governance-logica in code.
Beheer vindt plaats via normale GitHub-processen, zoals:

- branches
- pull requests
- reviews
- commit history

## Richtlijnen

- houd bestanden klein en gericht
- gebruik consistente sleutels en IDs
- hardcode geen scriptlogica in configuratie
- leg uitzonderingen expliciet vast
- voeg documentatie toe bij nieuwe landen of communities
- voorkom duplicatie wanneer global of community-level hergebruik mogelijk is

## Status

Deze repository is in opbouw en vormt het datamodel voor v1 van WME Place Harmonizer ROW Edition.
