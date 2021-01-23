import { keys } from "ts-transformer-keys"
import { Renderer } from "../gui/graphics2d/Renderer"
import { PlayerComponent } from "../components/PlayerComponent"
import { TransformComponent } from "../components/TransformComponent"
import { GameEngine } from "../GameEngine"
import { BaseSystem } from "./BaseSystem"


interface PlayableEntities {
    transform: TransformComponent,
    player: PlayerComponent
}

export class UserInputSystem extends BaseSystem {
    private engine = GameEngine.getInstance()
    private GP_AXIS_STEPS: number = 50
    private GP_DEAD_ZONE: number = 0.1
    private keyValue = new Map<string, number>()
    private inputMapping = new Map<string, string>()
    private renderer: Renderer
    private actionQueue: any[] = []

    public constructor() {
        super("UserInputSystem")
        this.renderer = Renderer.getInstance()
        this.renderer.addEventListener('touchstart', function(ev) {ev.preventDefault()}, false)
        this.renderer.addEventListener('pointerdown', (ev) => this.pointerdown(ev), false)
        this.renderer.addEventListener('pointermove', (ev) => this.pointermove(ev), false)
        this.renderer.addEventListener('pointerup',   (ev) => this.pointerup(ev), false)
        document.addEventListener('keydown', (ev) => this.handleAction(ev.code, 1))
        document.addEventListener('keyup', (ev) => this.handleAction(ev.code, 0))
        this.renderer.addEventListener("wheel", (ev) => this.scroll(ev), false)
    }
    private compute_position(ev: any) {
        if (ev.layerX || ev.layerX === 0) { // Firefox
          ev._x = ev.layerX
          ev._y = ev.layerY
        } else if (ev.offsetX || ev.offsetX === 0) { // Opera
          ev._x = ev.offsetX
          ev._y = ev.offsetY
        }
    }
    private pointerdown(ev: any) {
        this.compute_position(ev)
        let abs = this.renderer.screenToIngame(ev._x, ev._y)
        /* Try to find target at location */
    }
    private pointermove(ev: any) {
        this.compute_position(ev)
        let rel = this.renderer.screenToEgo(ev._x, ev._y)
        let value = Math.atan2(rel.y, rel.x)
        this.handleAction("mouseStick", value)
    }
    private pointerup(ev: any) {
    }
    
    private hasChanged(code: string, value: number): boolean {
        if (this.keyValue.has(code) && this.keyValue.get(code) == value) return false
        this.keyValue.set(code, value)
        return true
    }

    private triggerAction(code: string, value: number): void {
        let action = this.inputMapping.get(code)!
        this.actionQueue.push({"action": action, "value": value})
    }

    private handleAction(code: string, value: number) {
        if (this.hasChanged(code, value) && this.inputMapping.has(code)) {
            this.triggerAction(code, value)
        }
    }

    private scroll(ev: any) {
        if (ev.deltaY > 0) {
            if (this.inputMapping.has("scrollDown")) {
                this.triggerAction("scrollDown", 0)
            }
        } else if (ev.deltaY < 0) {
            if (this.inputMapping.has("scrollUp")) {
                this.triggerAction("scrollUp", 0)
            }
        }
    }

    private quantizeGP(value: number): number {
        return Math.round(value * this.GP_AXIS_STEPS) / this.GP_AXIS_STEPS
    }

    private isDeadzoneGP(value: number, deadzone: number = this.GP_DEAD_ZONE): boolean {
        return -deadzone < value && value < deadzone
    }
    
    private handleGamepads() {
        var gamepads = navigator.getGamepads()
        if (gamepads) {
            function buttonPressed(b: any) {
                if (typeof (b) == "object") {
                    return b.pressed
                }
                return b == 1.0
            }
            for (let gp of gamepads) {
                if (gp == null) continue
                for (let idx in gp.buttons) {
                    let button = gp.buttons[idx]
                    let code = "gpButton" + idx
                    if (buttonPressed(button)) {
                        this.handleAction(code, 1)
                    } else {
                        this.handleAction(code, 0)
                    }
                }
                for (let idx in gp.axes) {
                    let code = "gpAxis" + idx
                    var value = this.quantizeGP(gp.axes[idx])
                    if (this.isDeadzoneGP(value)) value = 0
                    this.handleAction(code, value)
                }
                this.handleStick("gpStickL", gp, 0, 1)
                this.handleStick("gpStickR", gp, 2, 3)
            }
        }
    }

    private handleStick(code: string, gp: Gamepad, axis0: number, axis1: number) {
        if (this.inputMapping.has(code)) {
            if (this.isDeadzoneGP(gp.axes[axis1], 0.5) && this.isDeadzoneGP(gp.axes[axis0], 0.5)) return
            let value = this.quantizeGP(Math.atan2(gp.axes[axis1], gp.axes[axis0]))
            this.handleAction(code, value)
        }
    }

    tick(elapsedTime: number): void {
        let players = this.engine.getEntities<PlayableEntities>(keys<PlayableEntities>())
        this.handleGamepads()

        let actions = this.actionQueue
        this.actionQueue = []
        for (let entity of players) {
            for (let action of actions) {
                entity.player.actions.push(action)
            }
            this.inputMapping = entity.player.inputMapping
        }
    }
}
