import { BaseComponent } from "./BaseComponent"

export class AnimationComponent extends BaseComponent {
    constructor(public animationTime: number, public animationCallback: Function, public currentAnimation: string, public lastAnimation: string = "") {
        super()
    }
}
