import { HassEntity, STATE_NOT_RUNNING } from "home-assistant-js-websocket";
import {
  computeStateDomain,
  isNumericState,
  numberFormatToLocale,
  FrontendLocaleData,
  HomeAssistant,
  LocalizeFunc,
  NumberFormat,
} from "custom-card-helpers";

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


// Format function imported and adapted from custom-card-helpers
// All rights reserved
// Modifications include:
//   - removing unecessary state type formatting
//   - allowing to pass down formatting options
export const computeStateDisplay = (
  localize: LocalizeFunc,
  stateObj: HassEntity,
  locale: FrontendLocaleData,
  state?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const compareState = state !== undefined ? state : stateObj.state;

  if (compareState === "unknown" || compareState === "unavailable") {
    return localize(`state.default.${compareState}`);
  }

  // Entities with a `unit_of_measurement` or `state_class` are numeric values and should use `formatNumber`
  if (isNumericState(stateObj)) {
    if (stateObj.attributes.device_class === "monetary") {
      try {
        return formatNumber(compareState, locale, {
          ...options,
          style: "currency",
          currency: stateObj.attributes.unit_of_measurement,
        });
      } catch (_err) {
        // fallback to default
      }
    }
    return `${formatNumber(compareState, locale, options)}${
      stateObj.attributes.unit_of_measurement
        ? " " + stateObj.attributes.unit_of_measurement
        : ""
    }`;
  }

  const domain = computeStateDomain(stateObj);

  // content was removed here from the original function

  return (
    // Return device class translation
    (stateObj.attributes.device_class &&
      localize(
        `component.${domain}.state.${stateObj.attributes.device_class}.${compareState}`
      )) ||
    // Return default translation
    localize(`component.${domain}.state._.${compareState}`) ||
    // We don't know! Return the raw state.
    compareState
  );
};

export const round = (value: number, precision = 2): number =>
  Math.round(value * 10 ** precision) / 10 ** precision;
 
/**
 * Formats a number based on the specified language with thousands separator(s) and decimal character for better legibility.
 * @param num The number to format
 * @param locale The user-selected language and number format, from `hass.locale`
 * @param options Intl.NumberFormatOptions to use
 */
export const formatNumber = (
  num: string | number,
  localeOptions?: FrontendLocaleData,
  options?: Intl.NumberFormatOptions
): string => {
  const locale = localeOptions
    ? numberFormatToLocale(localeOptions)
    : undefined;

  // Polyfill for Number.isNaN, which is more reliable than the global isNaN()
  Number.isNaN =
    Number.isNaN ||
    function isNaN(input) {
      return typeof input === "number" && isNaN(input);
    };

  if (
    localeOptions?.number_format !== NumberFormat.none &&
    !Number.isNaN(Number(num)) &&
    Intl
  ) {
    try {
      return new Intl.NumberFormat(
        locale,
        getDefaultFormatOptions(num, options)
      ).format(Number(num));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Don't fail when using "TEST" language
      // eslint-disable-next-line no-console
      console.error(err);
      return new Intl.NumberFormat(
        undefined,
        getDefaultFormatOptions(num, options)
      ).format(Number(num));
    }
  }
  if (typeof num === "string") {
    return num;
  }
  return `${round(num, options?.maximumFractionDigits).toLocaleString()}${
    options?.style === "currency" ? ` ${options.currency}` : ""
  }`;
};

/**
 * Generates default options for Intl.NumberFormat
 * @param num The number to be formatted
 * @param options The Intl.NumberFormatOptions that should be included in the returned options
 */
const getDefaultFormatOptions = (
  num: string | number,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormatOptions => {
  const defaultOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    ...options,
  };

  if (typeof num !== "string") {
    return defaultOptions;
  }

  // Keep decimal trailing zeros if they are present in a string numeric value
  if (
    !options ||
    (!options.minimumFractionDigits && !options.maximumFractionDigits)
  ) {
    const digits = num.indexOf(".") > -1 ? num.split(".")[1].length : 0;
    defaultOptions.minimumFractionDigits = digits;
    defaultOptions.maximumFractionDigits = digits;
  }

  return defaultOptions;
};
