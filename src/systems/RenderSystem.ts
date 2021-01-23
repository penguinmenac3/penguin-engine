import { keys } from "ts-transformer-keys";
import { Renderer } from "../gui/graphics2d/Renderer";
import { PlayerComponent } from "../components/PlayerComponent";
import { RenderComponent } from "../components/RenderComponent";
import { RenderComponentList } from "../components/RenderComponentList";
import { TransformComponent } from "../components/TransformComponent";
import { GameEngine } from "../GameEngine";
import { Point } from "../geometry/Point";
import { BaseSystem } from "./BaseSystem";


interface RenderableEntity {
    transform: TransformComponent,
    render: RenderComponent | RenderComponentList
}

interface PlayableEntities {
    transform: TransformComponent,
    player: PlayerComponent
}


export class RenderSystem extends BaseSystem {
    public static BACKGROUND_LAYER: number = 0
    public static MIDGROUND_LAYER: number = 1
    public static FOREGROUND_LAYER: number = 2

    private renderer = Renderer.getInstance()
    private engine = GameEngine.getInstance()

    private elapsedTime = 0.01

    public constructor(private layer: number) {
        super("RenderSystem")
    }

    tick(elapsedTime: number): void {
        this.elapsedTime = elapsedTime
        if (this.layer == RenderSystem.BACKGROUND_LAYER) {
            this.renderer.clear()
            let pos = new Point(0, 0)
            let players = this.engine.getEntities<PlayableEntities>(keys<PlayableEntities>())
            for (let player of players) {
                pos = player.transform.pose
            }
            this.renderer.setCamera(pos)
        }

        for (let entity of this.engine.getEntities<RenderableEntity>(keys<RenderableEntity>())) {
            if (entity.render instanceof RenderComponentList) {
                for (let [name, component] of entity.render.components) {
                    this.renderIfCorrectLayer(component, entity.transform)
                }
            } else {
                this.renderIfCorrectLayer(entity.render, entity.transform)
            }
        }
    }

    private renderIfCorrectLayer(render: RenderComponent, transform: TransformComponent) {
        if (render.layer == this.layer && render.sprite != null) {
            this.renderer.drawSprite(render.sprite, transform.pose, render.size, undefined, undefined, render.offsetX, render.offsetY, render.offsetYaw);
        }
    }
}
