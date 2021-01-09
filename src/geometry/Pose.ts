import { Point } from "./Point"

export class Pose extends Point {
    constructor(x: number, y: number, public yaw: number) {
        super(x, y)
    }
}
