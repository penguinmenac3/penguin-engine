import { BaseComponent } from "./BaseComponent"
import { GeometricObject } from "../geometry/GeometricObject"

export class ColliderComponent extends BaseComponent {
    constructor(public collider: GeometricObject, public type: string) {
        super()
    }
}
