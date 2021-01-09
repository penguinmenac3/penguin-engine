import { BaseComponent } from "./BaseComponent"
import { Entity } from "../Entity"




export class InteractionComponent extends BaseComponent {
    constructor(
        public startInteraction: Function,
        public stopInteraction: Function,
        public info: any
    ) {
        super()
    }
    
    public static noop(caller: Entity, callee: Entity): void { }
}
