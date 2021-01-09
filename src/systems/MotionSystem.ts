import { keys } from "ts-transformer-keys";
import { ColliderComponent } from "../components/ColliderComponent";
import { MotionComponent } from "../components/MotionComponent";
import { TransformComponent } from "../components/TransformComponent";
import { GameEngine } from "../GameEngine";
import { Point } from "../geometry/Point";
import { BaseSystem } from "./BaseSystem";


interface MotionEntity {
    transform: TransformComponent,
    motion: MotionComponent
}

interface CollidableEntity {
    transform: TransformComponent,
    collider: ColliderComponent
}


export class MotionSystem implements BaseSystem {
    public name = "MotionSystem"
    private engine = GameEngine.getInstance()
    public constructor() {}

    tick(elapsedTime: number): void {
        let motionEntities = this.engine.getEntities<MotionEntity>(keys<MotionEntity>())
        let collidableEntities = this.engine.getEntities<CollidableEntity>(keys<CollidableEntity>())
        for (let entity of motionEntities) {
            entity.transform.pose.x += elapsedTime * entity.motion.pose.x
            entity.transform.pose.y += elapsedTime * entity.motion.pose.y
            
            let isColliding = false
            if (entity.motion.canCollide) {
                for (let x of collidableEntities) {
                    if (this.isColliding(entity.transform, x.transform, x.collider)) {
                        isColliding = true
                        break
                    }
                }
            }
            
            if (isColliding) {
                //console.log("Collision")
                entity.transform.pose.x -= elapsedTime * entity.motion.pose.x
                entity.transform.pose.y -= elapsedTime * entity.motion.pose.y
            }
        }
    }

    public isColliding(ownTransform: TransformComponent, transform: TransformComponent, collider: ColliderComponent): boolean {
        if (collider.type == "solid") {
            let relativePoint = new Point(transform.pose.x - ownTransform.pose.x, transform.pose.y - ownTransform.pose.y)
            if (collider.collider.isWithin(relativePoint)) {
                //console.log("Collision")
                return true
            }
        }
        return false
    }
}
