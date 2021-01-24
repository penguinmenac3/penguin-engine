import { keys } from "ts-transformer-keys";
import { AnimationCommand } from "../commands/AnimationCommands";
import { AnimationComponent } from "../components/AnimationComponent";
import { RenderComponent } from "../components/RenderComponent";
import { RenderComponentList } from "../components/RenderComponentList";
import { GameEngine } from "../GameEngine";
import { BaseSystem } from "./BaseSystem";


interface AnimationEntity {
    render: RenderComponent | RenderComponentList
    animation: AnimationComponent
}

export class AnimationSystem extends BaseSystem {    
    private engine = GameEngine.getInstance()
    private animationEntityQuery: Function

    public constructor() {
        super("AnimationSystem")
        this.registerCommandHandler(AnimationCommand, this.handleChangeAnimation)
        this.animationEntityQuery = this.engine.createEntityQuery<AnimationEntity>(keys<AnimationEntity>())
    }

    private handleChangeAnimation(command: AnimationCommand): void {
        let entity = this.engine.getEntity(command.uuid)
        if (entity) {
            let animationEntity: AnimationEntity = <any>entity
            animationEntity.animation.currentAnimation = command.animation
        }
    }

    tick(elapsedTime: number, ): void {
        let animationComponents = this.animationEntityQuery()
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
