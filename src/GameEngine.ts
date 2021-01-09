import { BaseSystem } from "./systems/BaseSystem"
import { Entity, hasAttributes } from "./Entity"


export interface Message {
    time: number
    [propName: string]: any
}


export class GameEngine {
    private lastTimestamp: number = -1
    private running = false

    private messageListeners = new Map<string, Function[]>()
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

    public addMessageListener(channel: string, callback: Function) {
        if (!this.messageListeners.has(channel)) {
            this.messageListeners.set(channel, [])
        }
        let listeners = this.messageListeners.get(channel)!
        listeners.push(callback)
    }

    public sendMessage(message: Message, channel: string, allowNetworking: boolean = true) {
        if (this.messageListeners.has(channel)) {
            for (let listener of this.messageListeners.get(channel)!) {
                listener(message)
            }
        }
        if (allowNetworking) {
            this.sendMessage({"time": 0, "message": message, "channel": channel}, "networking", false)
        }
    }

    public addSystem(system: BaseSystem, index: number): void {
        this.systems.splice(index, 0, system)
    }

    public pushSystem(system: BaseSystem): void {
        this.systems.push(system)
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
            system.tick(elapsedTime)
            let elapsed = performance.now() - start
            this.timePerSystem.set(system.name, elapsed)
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
