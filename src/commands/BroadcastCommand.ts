import { Command } from "./Command";



export class BroadcastCommand extends Command {
    constructor(
        public readonly command: Command,
        public readonly system: string
    ) {
        super(0, BroadcastCommand.name);
    }
}
