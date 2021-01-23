import { Command } from "./Command";


export class AnimationCommand extends Command {
    constructor(
        public readonly uuid: string,
        time: number,
        public readonly animation: string
    ) {
        super(time, AnimationCommand.name);
    }
}
