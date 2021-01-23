export interface Command {
    time: number
    type: string
    [propName: string]: any
}


export class Commands {
    private constructor() {}
    private static commands = new Map<string, Function>()

    public static makeCommand(time: number, type: string): Command {
        return {time: time, type: type}
    }

    public static register(name: string, handler: Function): void {
        this.commands.set(name, handler)
    }

    public static execute(command: Command): void {
        if (this.commands.has(command.type)) {
            let handler = this.commands.get(command.type)!
            handler(command)
        }
    }
}
