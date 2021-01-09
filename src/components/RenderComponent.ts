import { BaseComponent } from "./BaseComponent"
import { RenderSystem } from "../systems/RenderSystem"
import { Sprite } from "../gui/graphics2d/Sprite"

export class RenderComponent extends BaseComponent {
    public sprite: Sprite | null = null
    constructor(
        sprite: Promise<Sprite> | Sprite,
        public layer: number = RenderSystem.MIDGROUND_LAYER,
        public size: number[] = [1, 1], 
        public offsetX: number = 0,
        public offsetY: number = 0,
        public offsetYaw: number = 0
    ) {
        super()
        if (sprite instanceof Promise) {
            this.sprite = null
            sprite.then((x) => {
                this.sprite = x
            })
        } else {
            this.sprite = sprite
        }
    }
}
