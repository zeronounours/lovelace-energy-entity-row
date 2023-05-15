import { STATE_NOT_RUNNING } from "home-assistant-js-websocket";
import { HomeAssistant } from "custom-card-helpers";

export const createEntityNotFoundWarning = (
  hass: HomeAssistant,
  entityId: string
): string =>
  hass.config.state !== STATE_NOT_RUNNING
    ? hass.localize(
        "ui.panel.lovelace.warning.entity_not_found",
        "entity",
        entityId || "[empty]"
      )
    : hass.localize("ui.panel.lovelace.warning.starting");

export const createEntityErrorWarning = (
  error: Error,
  entityId: string
): string => `${error} Entity ${entityId || "[empty]"}`

export function formatState(state: number, round: number): string {
  let rounded: string;
  let decimals = round;
  do {
    // round to first significant digit
    rounded = state.toFixed(decimals++);
  } while (/^[0\.]*$/.test(rounded) && decimals < 100);

  const formattedState = parseFloat(rounded).toLocaleString();
  return formattedState;
}
