import { keys } from "ts-transformer-keys";
import { ColliderComponent } from "../components/ColliderComponent";
import { MotionComponent } from "../components/MotionComponent";
import { TransformComponent } from "../components/TransformComponent";
import { GameEngine } from "../GameEngine";
import { Point } from "../geometry/Point";
import { BaseSystem } from "./BaseSystem";
import { Commands, Command } from "../Commands";
import { Pose } from "../geometry/Pose";
import { AnimationComponent } from "../components/_api";


interface MotionEntity {
    uuid: string,
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
    public constructor() {
        Commands.register("ChangeMotion", (command: Command) => this.handleChangeMotion(command))
        Commands.register("ChangePose", (command: Command) => this.handleChangePose(command))
    }

    public static changeMotion(uuid: string, time: number, x: number | null, y: number | null, yaw: number | null, getAnimation: Function | null) {
        let command = Commands.makeCommand(time, "ChangeMotion")
        command.uuid = uuid
        command.x = x
        command.y = y
        command.yaw = yaw
        command.getAnimation = getAnimation
        return command
    }

    private handleChangeMotion(command: Command): void {
        let entity = this.engine.getEntity(command.uuid)
        if (entity) {
            let motionEntity: MotionEntity = <any>entity
            if (command.x != null) motionEntity.motion.pose.x = command.x
            if (command.y != null) motionEntity.motion.pose.y = command.y
            if (command.yaw != null) motionEntity.motion.pose.yaw = command.yaw
            if (entity.animation && command.getAnimation != null) {
                (entity.animation as AnimationComponent).currentAnimation = command.getAnimation(motionEntity.motion.pose)
            }
        }
    }

    public static changePose(uuid: string, time: number, x: number | null, y: number | null, yaw: number | null) {
        let command = Commands.makeCommand(time, "ChangePose")
        command.uuid = uuid
        command.x = x
        command.y = y
        command.yaw = yaw
        return command
    }

    private handleChangePose(command: Command): void {
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
