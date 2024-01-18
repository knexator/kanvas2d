import { GenericDrawer } from "./core";
import isEqual from "lodash.isequal"
// import isEqual = require('lodash.isequal');

/**
 * Wraps around GenericDrawer, changing the API to be stateful
 */
export class StatefulDrawer<SpriteData extends Record<string, any>, GlobalData extends Record<string, any>> {
    
    constructor(
        private readonly drawer: GenericDrawer<SpriteData, GlobalData>,
        private global_state: GlobalData,
        private compare_states?: (a: GlobalData, b: GlobalData) => boolean,
    ) {}

    set(global_params: Partial<GlobalData>): void {
        let new_state = {...this.global_state, ...global_params};

        let state_changed = false;
        if (this.compare_states === undefined) {
            // no compare function provided, use lodash' isEqual
            state_changed = !isEqual(this.global_state, new_state);
        } else {
            state_changed = this.compare_states(this.global_state, new_state);
        }

        if (state_changed) {
            this.endFrame();
            this.global_state = new_state;
        }
    }

    add(sprite_params: SpriteData): void {
        if (this.drawer._n_queued >= this.drawer._MAX_SPRITES) {
            this.endFrame();
        }
        this.drawer.add(sprite_params);
    }

    /** Flush anything remaining */
    endFrame(): void {
        this.drawer.end(this.global_state);
    }
}