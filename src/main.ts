/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, nothing } from "lit";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { property, state } from "lit/decorators.js";
import pjson from "../package.json";
import { HomeAssistant, EntityConfig, computeStateDisplay } from "custom-card-helpers";
import { HassEntities } from 'home-assistant-js-websocket';

import { EnergyCollection,
  getEnergyDataCollection,
  getStatistics,
} from './energy';
import { SubscribeMixin } from './subscribe-mixin';
import { createEntityNotFoundWarning, formatState } from './utils';


export interface EnergyEntityConfig extends EntityConfig {
  round?: number;
}

const ENERGY_DATA_TIMEOUT = 10000;

class EnergyEntityRow extends SubscribeMixin(LitElement) {

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private states: HassEntities = {};
  @state() private entityIds: string[] = [];
  @state() private error?: Error | unknown;
  @state() private config!: EnergyEntityConfig;

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('config') || changedProps.has('states')) {
      return true;
    }
    return false;
  }

  public hassSubscribe() {
    /*
     * This methode is imported from ha-sankey-chart and is licensed under
     * MIT licence
     * It was slighly modified to fit needs
     */
    const start = Date.now();
    const getEnergyDataCollectionPoll = (
      resolve: (value: EnergyCollection | PromiseLike<EnergyCollection>) => void,
      reject: (reason?: any) => void,
    ) => {
      const energyCollection = getEnergyDataCollection(this.hass);
      if (energyCollection) {
        resolve(energyCollection);
      } else if (Date.now() - start > ENERGY_DATA_TIMEOUT) {
        console.debug(getEnergyDataCollection(this.hass));
        reject(
          new Error('No energy data received. Make sure to add a `type: energy-date-selection` card to this screen.'),
        );
      } else {
        setTimeout(() => getEnergyDataCollectionPoll(resolve, reject), 100);
      }
    };
    const energyPromise = new Promise<EnergyCollection>(getEnergyDataCollectionPoll);
    setTimeout(() => {
      if (!this.error && !Object.keys(this.states).length) {
        this.error = new Error('Something went wrong. No energy data received.');
        console.debug(getEnergyDataCollection(this.hass));
      }
    }, ENERGY_DATA_TIMEOUT * 2);
    energyPromise.catch(err => {
      this.error = err;
    });
    return [
      energyPromise.then(async collection => {
        return collection.subscribe(async data => {
          const stats = await getStatistics(this.hass, data, [this.config.entity]);
          const states: HassEntities = {};
          Object.keys(stats).forEach(id => {
            if (this.hass.states[id]) {
              states[id] = { ...this.hass.states[id], state: formatState(stats[id], this.config.round !== undefined ? this.config.round : 2) };
            }
          });
          this.states = states;
        });
      }),
    ];
  }

  render() {
    if (!this.config || !this.hass) {
      return nothing;
    }

    const stateObj = this.states[this.config.entity];

    if (!stateObj) {
      return html`
        <hui-warning>
          ${createEntityNotFoundWarning(this.hass, this.config.entity)}
        </hui-warning>
      `;
    }

    return html`
      <hui-generic-entity-row .hass=${this.hass} .config=${this.config}>
        <div
          class="text-content value"
        >
          ${computeStateDisplay(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.hass!.localize,
            stateObj,
            this.hass.locale,
          )}
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get styles() {
    return [
      (customElements.get("hui-sensor-entity-row") as any)?.styles,
    ];
  }
}

if (!customElements.get("energy-entity-row")) {
  customElements.define("energy-entity-row", EnergyEntityRow);
  console.info(
    `%c ENERGY-ENTITY-ROW %c Version ${pjson.version} `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
  );
}

