import { BaseComponent } from "./BaseComponent"
import { RenderComponent } from "./RenderComponent"

export class RenderComponentList extends BaseComponent {
    constructor(public components = new Map<string, RenderComponent>(), public layer: number = 0) {
        super()
    }
}
