import { BaseComponent } from "./BaseComponent"
import { BoxXYWH } from "../geometry/Box"

export class DebugBoxComponent extends BaseComponent {
    constructor(public box: BoxXYWH, public text: string, public color: string) {
        super()
    }
}
