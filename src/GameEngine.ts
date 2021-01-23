import { BaseSystem } from "./systems/BaseSystem"
import { Entity, hasAttributes } from "./Entity"
import { Commands, Command } from "./Commands"


export class GameEngine {
    private lastTimestamp: number = -1
    private running = false

    private commandBuffer = new Map<string, Command[]>()
    private entities = new Map<string, Entity>()
    public recommendedSystemInsertionIndex: number = 3
    private systems: BaseSystem[] = []
    public debugOverlay: number = 0
    public timePerSystem = new Map<string, number>()

    private static instance: GameEngine
    public static getInstance(): GameEngine {
        if (GameEngine.instance == null) {
            GameEngine.instance = new GameEngine()
        }
        return GameEngine.instance
    }
    private constructor() {}

    public sendCommand(command: Command, system: string, allowNetworking: boolean = true) {
        if (this.commandBuffer.has(system)) {
            this.commandBuffer.get(system)!.push(command)
        }
        if (allowNetworking) {
            this.sendCommand({"time": 0, "type": "NetworkSend", "command": command, "system": system}, "NetworkingSystem", false)
        }
    }

    public pushSystem(system: BaseSystem): void {
        this.systems.push(system)
        this.commandBuffer.set(system.name, [])
    }

    public addEntity(entity: Entity): string {
        if (entity.uuid == "") {
            throw Error("Entities must have a valid uuid!")
        }
        this.entities.set(entity.uuid, entity)
        return entity.uuid
    }

    public deleteEntity(uuid: string): void {
        this.entities.delete(uuid)
    }

    public getEntity(uuid: string): Entity | undefined {
        return this.entities.get(uuid)
    }

    public getEntities<T>(requirements: string[]): T[] {
        let start = performance.now()
        let result: T[] = []
        for (let [uuid, entity] of this.entities) {
            if (hasAttributes(entity, requirements)) {
                result.push(entity as any as T)
            }
        }
        let elapsed = performance.now() - start
        let name = "getEntities"
        this.timePerSystem.set(name, this.timePerSystem.get(name)! + elapsed)
        return result
    }

    private looper(timestamp: number): void {
        if (this.lastTimestamp == -1)
            this.lastTimestamp = timestamp
        let elapsedTime = (timestamp - this.lastTimestamp) / 1000.0
        this.lastTimestamp = timestamp
        this.tick(elapsedTime)
        window.requestAnimationFrame((t) => this.looper(t))
    }

    private tick(elapsedTime: number) {
        if (!this.running) return
        let name = "getEntities"
        this.timePerSystem.set(name, 0)
        for (let system of this.systems) {
            let start = performance.now()
            this.executeCommands(system)
            system.tick(elapsedTime)
            let elapsed = performance.now() - start
            this.timePerSystem.set(system.name, elapsed)
        }
    }

    private executeCommands(system: BaseSystem) {
        if (this.commandBuffer.has(system.name)) {
            for (let command of this.commandBuffer.get(system.name)!) {
                Commands.execute(command)
            }
            this.commandBuffer.set(system.name, [])
        }
    }

    public startMainLoop() {
        if (!this.running) {
            window.requestAnimationFrame((t) => this.looper(t))
            this.running = true
        }
    }

    public interruptMainLoop(): void {
        this.running = false
    }
}
