import { STATE_NOT_RUNNING } from "home-assistant-js-websocket";
import { HomeAssistant } from "custom-card-helpers";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createEntityNotFoundWarning = (
  hass: HomeAssistant,
  entityId: string
) =>
  hass.config.state !== STATE_NOT_RUNNING
    ? hass.localize(
        "ui.panel.lovelace.warning.entity_not_found",
        "entity",
        entityId || "[empty]"
      )
    : hass.localize("ui.panel.lovelace.warning.starting");
