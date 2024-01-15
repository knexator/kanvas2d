import { GenericDrawer } from "./core";

/**
 * Wraps around GenericDrawer, changing the API to be stateful
 */
export class StatefulDrawer<SpriteData extends Record<string, any>, GlobalData extends Record<string, any>> {
    
    constructor(
        private readonly drawer: GenericDrawer<SpriteData, GlobalData>,
        private global_state: GlobalData,
    ) {}

    set(global_params: Partial<GlobalData>): void {
        this.endFrame();
        this.global_state = {...this.global_state, ...global_params};
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