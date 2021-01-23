import { Command } from "./Command";



export class ChangeMotionCommand extends Command {
    constructor(
        public readonly uuid: string,
        time: number,
        public readonly x: number | null,
        public readonly y: number | null,
        public readonly yaw: number | null
    ) {
        super(time, ChangeMotionCommand.name);
    }
}

export class ChangePoseCommand extends Command {
    constructor(
        public readonly uuid: string,
        time: number,
        public readonly x: number | null,
        public readonly y: number | null,
        public readonly yaw: number | null
    ) {
        super(time, ChangePoseCommand.name);
    }
}
