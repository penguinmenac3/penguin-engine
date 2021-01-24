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
    private renderer = Renderer.getInstance()
    private engine = GameEngine.getInstance()
    public static BACKGROUND_LAYER = 0
    public static MIDGROUND_LAYER = 100
    public static FOREGROUND_LAYER = 200
    private playerQuery: Function
    private renderEntityQuery: Function

    private elapsedTime = 0.01

    public constructor(private ySorting: boolean = true) {
        super("RenderSystem")
        this.playerQuery = this.engine.createEntityQuery<PlayableEntities>(keys<PlayableEntities>())
        this.renderEntityQuery = this.engine.createEntityQuery<RenderableEntity>(keys<RenderableEntity>())
    }

    tick(elapsedTime: number): void {
        this.elapsedTime = elapsedTime
        this.renderer.clear()
        let pos = new Point(0, 0)
        let players = this.playerQuery()
        for (let player of players) {
            pos = player.transform.pose
        }
        this.renderer.setCamera(pos)

        let layers = this.sortEntitiesIntoLayers();
        this.renderLayers(layers);
    }

    private renderLayers(layers: Map<number, RenderableEntity[]>) {
        let layer_ids = Array.from(layers.keys()).sort();
        for (let id of layer_ids) {
            let entities = layers.get(id)!;
            if (this.ySorting) {
                entities.sort((a, b) => a.transform.pose.y - b.transform.pose.y)
            }
            for (let entity of entities) {
                if (entity.render instanceof RenderComponentList) {
                    for (let [name, component] of entity.render.components) {
                        this.renderIfValid(component, entity.transform);
                    }
                } else {
                    this.renderIfValid(entity.render, entity.transform);
                }
            }
        }
    }

    private sortEntitiesIntoLayers() {
        let layers = new Map<number, RenderableEntity[]>();
        for (let entity of this.renderEntityQuery()) {
            let layer = entity.render.layer;
            if (!layers.has(layer)) {
                layers.set(layer, []);
            }
            layers.get(layer)!.push(entity);
        }
        return layers;
    }

    private renderIfValid(render: RenderComponent, transform: TransformComponent) {
        if (render.sprite != null) {
            this.renderer.drawSprite(render.sprite, transform.pose, render.size, undefined, undefined, render.offsetX, render.offsetY, render.offsetYaw);
        }
    }
}
