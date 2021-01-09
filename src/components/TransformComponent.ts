import { BaseComponent } from "./BaseComponent"
import { Pose } from "../geometry/Pose"

export class TransformComponent extends BaseComponent {
    constructor(public pose: Pose = new Pose(0, 0, 0), public time: number = 0) {
        super()
    }
}
