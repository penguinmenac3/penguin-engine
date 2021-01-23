import { keys } from "ts-transformer-keys";
import { Renderer } from "../gui/graphics2d/Renderer";
import { DebugBoxComponent } from "../components/DebugBoxComponent";
import { TransformComponent } from "../components/TransformComponent";
import { GameEngine } from "../GameEngine";
import { Point } from "../geometry/Point";
import { BaseSystem } from "./BaseSystem";


interface DebugBoxEntity {
    transform: TransformComponent,
    debugBox: DebugBoxComponent
}


export class DebugBoxSystem extends BaseSystem {
    private renderer = Renderer.getInstance()
    private engine = GameEngine.getInstance()

    public constructor() {
        super("DebugBoxSystem")
    }

    tick(elapsedTime: number): void {
        if (this.engine.debugOverlay == 2) {
            for (let entity of this.engine.getEntities<DebugBoxEntity>(keys<DebugBoxEntity>())) {
                let position = new Point(entity.transform.pose.x + entity.debugBox.box.cx, entity.transform.pose.y + entity.debugBox.box.cy)
                let topLeft = new Point(entity.transform.pose.x + entity.debugBox.box.cx - entity.debugBox.box.w / 2, entity.transform.pose.y + entity.debugBox.box.cy - entity.debugBox.box.h / 2)
                this.renderer.strokeRect(position, entity.debugBox.color, [entity.debugBox.box.w, entity.debugBox.box.h], false, true)
                this.renderer.drawText(entity.debugBox.text, topLeft, entity.debugBox.color, 12, false, true)
            }
        }
        if (this.engine.debugOverlay != 0) {
            this.renderer.drawText("FPS: " + Math.round(1 / elapsedTime), new Point(0, 0), "#00FF99")
            var offY = 0
            var totalTime = 0
            for (let [system, time] of this.engine.timePerSystem) {
                offY += 20
                if (system[0] == system.toUpperCase()[0])
                    totalTime += time
                this.renderer.drawText(system + ": " + Math.round(time * 10) / 10 + "ms", new Point(0, offY), "#00FF99")
            }
            offY += 20
            this.renderer.drawText("Total: " + Math.round(totalTime * 10) / 10 + "ms", new Point(0, offY), "#00FF99")
            offY += 20
            this.renderer.drawText("FrameTime: " + Math.round(elapsedTime * 1000 * 10) / 10 + "ms", new Point(0, offY), "#00FF99")
        }
    }
}
