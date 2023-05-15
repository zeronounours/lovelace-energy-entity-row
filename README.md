# energy-entity-row

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Display energy entities in an entity card row. This integrate with the builtin
[Energy Date Picker][energy-date-picker] (energy-date-selection)

For installation instructions [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

Install `energy-entity-row.js` as a `module`.

```yaml
resources:
  - url: /local/energy-entity-row.js
    type: module
```

## Usage example

**Note:** This is _not_ a card. It's a row for an [entities](https://www.home-assistant.io/lovelace/entities/).

**Note 2:** To work properly, an `energy-date-selection` card must be included
in the view

```yaml
type: entities
title: Default
entities:
  - sensor.smart_plug_energy
  - type: custom:energy-entity-row
    entity: sensor.smart_plug_energy
```

## Options

This element has no options apart from the basic options:
- `entity` (**required**)
- `name`
- `icon`
- `image`
- `type` (must be set to `custom:energy-entity-row`)

## Acknowlegements

Thanks to:
- Custom Card for the [boilerplate template][template]
- [thomasloven][thomasloven] for all its work and numerous example of lovelace elements
- MindFreeze for [ha-sankey-chart][sankey] which showed how to work with energy stats

[energy-date-picker]: https://www.home-assistant.io/dashboards/energy/#energy-date-picker
[template]: https://github.com/custom-cards/boilerplate-card
[thomasloven]: https://github.com/thomasloven
[sankey]: https://github.com/MindFreeze/ha-sankey-chart
