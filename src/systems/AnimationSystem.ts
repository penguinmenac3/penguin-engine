import { keys } from "ts-transformer-keys";
import { AnimationComponent } from "../components/AnimationComponent";
import { RenderComponent } from "../components/RenderComponent";
import { RenderComponentList } from "../components/RenderComponentList";
import { GameEngine } from "../GameEngine";
import { BaseSystem } from "./BaseSystem";


interface AnimationComponents {
    render: RenderComponent | RenderComponentList
    animation: AnimationComponent
}

export class AnimationSystem implements BaseSystem {
    public name = "AnimationSystem"
    
    private engine = GameEngine.getInstance()
    public constructor() {}

    tick(elapsedTime: number, ): void {
        let animationComponents = this.engine.getEntities<AnimationComponents>(keys<AnimationComponents>())
        for (let entity of animationComponents) {
            entity.animation.animationTime += elapsedTime
            if (entity.animation.currentAnimation != entity.animation.lastAnimation) {
                entity.animation.animationTime = 0
                entity.animation.lastAnimation = entity.animation.currentAnimation
            }
            entity.animation.animationCallback(entity.render, entity.animation.currentAnimation, entity.animation.animationTime)
        }
    }
}
