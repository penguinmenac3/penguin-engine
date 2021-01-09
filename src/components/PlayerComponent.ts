import { BaseComponent } from "./BaseComponent";
import { Entity } from "../Entity";
import { InteractionComponent } from "./InteractionComponent";
import { TransformComponent } from "./TransformComponent";

export interface Action {
    action: string
    value: number
}

export interface TargetableEntity {
    uuid: string
    transform: TransformComponent,
    interaction: InteractionComponent
}


export class PlayerComponent extends BaseComponent {
    constructor(
        public name: string,
        public map: string = "spawn",
        public actions: Action[] = [],
        public inputMapping = new Map<string, string>(),
        public target: TargetableEntity | null = null,
        public interacting: boolean = false,
        public usingGUI: boolean = false
    ) {
        super()
    }
}
