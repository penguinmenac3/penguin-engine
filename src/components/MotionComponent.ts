import { BaseComponent } from "./BaseComponent"
import { Pose } from "../geometry/Pose"

export class MotionComponent extends BaseComponent {
    constructor(public pose: Pose = new Pose(0, 0, 0), public canCollide: boolean = false) {
        super()
    }
}
