import { BaseSystem } from "./systems/BaseSystem"
import { Command } from "./commands/Command"
import { Entity, hasAttributes } from "./Entity"
import { BroadcastCommand } from "./commands/BroadcastCommand"


export class GameEngine {
    private lastTimestamp: number = -1
    private running = false

    private entityLists = new Map<string, Map<string, Entity>>()
    public recommendedSystemInsertionIndex: number = 3
    private systems: BaseSystem[] = []
    private systemsByName = new Map<string, BaseSystem>()
    private systemsReceiveAllCommands: string[] = []
    public debugOverlay: number = 0
    public timePerSystem = new Map<string, number>()

    private static instance: GameEngine
    public static getInstance(): GameEngine {
        if (GameEngine.instance == null) {
            GameEngine.instance = new GameEngine()
        }
        return GameEngine.instance
    }
    private constructor() {
        this.entityLists.set("", new Map<string, Entity>())
    }

    public sendCommand(command: Command, systemName: string, allowBroadcasting: boolean = true): void {
        if (!this.systemsByName.has(systemName)) return
        let system = this.systemsByName.get(systemName)!

        if (!system.commands.has(command.type)) return
        let handler = system.commands.get(command.type)!
        handler(command)
        if (allowBroadcasting) {
            let wrapped = new BroadcastCommand(command, systemName)
            for (let systemName of this.systemsReceiveAllCommands) {
                this.sendCommand(wrapped, systemName, false)
            }
        }
    }

    public pushSystem(system: BaseSystem, receiveAllCommands: boolean = false): void {
        this.systems.push(system)
        this.systemsByName.set(system.name, system)
        if (receiveAllCommands) {
            this.systemsReceiveAllCommands.push(system.name)
        }
    }

    public addEntity(entity: Entity): string {
        if (entity.uuid == "") {
            throw Error("Entities must have a valid uuid!")
        }
        for (let [requirementStr, list] of this.entityLists) {
            let requirements = requirementStr.split(",")
            if (requirementStr == "" || hasAttributes(entity, requirements)) {
                list.set(entity.uuid, entity)
            }
        }
        return entity.uuid
    }

    public deleteEntity(uuid: string): void {
        for (let [requirementStr, list] of this.entityLists) {
            list.delete(uuid)
        }
    }

    public getEntity(uuid: string): Entity | undefined {
        return this.entityLists.get("")!.get(uuid)
    }

    public createEntityQuery<T>(requirements: string[]) {
        let requirementStr = requirements.sort().join(",")
        if (!this.entityLists.has(requirementStr)) {
            let map = new Map<string, Entity>()
            for (let entity of this.getEntities<Entity>(requirements)) {
                map.set(entity.uuid, entity)
            }
            this.entityLists.set(requirementStr, map)
        }
        return () => {
            return this.entityLists.get(requirementStr)!.values() as IterableIterator<any> as IterableIterator<T>
        }
    }

    public getEntities<T>(requirements: string[]): T[] {
        let start = performance.now()
        let requirementStr = requirements.sort().join(",")
        if (this.entityLists.has(requirementStr)) {
            return Array.from(this.entityLists.get(requirementStr)!.values()) as any[] as T[]
        }
        let result: T[] = []
        for (let [uuid, entity] of this.entityLists.get("")!) {
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
