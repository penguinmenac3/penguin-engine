export class BaseSystem {
    public readonly commands = new Map<string, Function>()
    
    constructor(public readonly name: string) {}

    public tick(elapsedTime: number): void {
        throw Error("Not implemented!")
    }

    protected registerCommandHandler(commandClass: any, handler: Function) {
        this.commands.set(commandClass.name, handler.bind(this))
    }
}
