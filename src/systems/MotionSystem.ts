import { keys } from "ts-transformer-keys";
import { ColliderComponent } from "../components/ColliderComponent";
import { MotionComponent } from "../components/MotionComponent";
import { TransformComponent } from "../components/TransformComponent";
import { GameEngine } from "../GameEngine";
import { Point } from "../geometry/Point";
import { BaseSystem } from "./BaseSystem";
import { Pose } from "../geometry/Pose";
import { AnimationComponent } from "../components/_api";
import { ChangeMotionCommand, ChangePoseCommand } from "../commands/MotionCommands";


interface MotionEntity {
    uuid: string,
    transform: TransformComponent,
    motion: MotionComponent
}


interface CollidableEntity {
    transform: TransformComponent,
    collider: ColliderComponent
}


export class MotionSystem extends BaseSystem {
    private engine = GameEngine.getInstance()
    public constructor() {
        super("MotionSystem")
        this.registerCommandHandler(ChangeMotionCommand, this.handleChangeMotion)
        this.registerCommandHandler(ChangePoseCommand, this.handleChangePose)
    }

    private handleChangeMotion(command: ChangeMotionCommand): void {
        let entity = this.engine.getEntity(command.uuid)
        if (entity) {
            let motionEntity: MotionEntity = <any>entity
            if (command.x != null) motionEntity.motion.pose.x = command.x
            if (command.y != null) motionEntity.motion.pose.y = command.y
            if (command.yaw != null) motionEntity.motion.pose.yaw = command.yaw
        }
    }

    private handleChangePose(command: ChangePoseCommand): void {
        let entity = this.engine.getEntity(command.uuid)
        if (entity) {
            let motionEntity: MotionEntity = <any>entity
            if (command.x != null) motionEntity.transform.pose.x = command.x
            if (command.y != null) motionEntity.transform.pose.y = command.y
            if (command.yaw != null) motionEntity.transform.pose.yaw = command.yaw
        }
    }

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
