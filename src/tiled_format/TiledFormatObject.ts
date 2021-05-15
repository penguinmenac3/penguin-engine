import { Point } from "../geometry/Point"
import { BoxXYXY, BoxXYWH } from "../geometry/Box"

export interface TiledFormatObject {
    readonly id: number;
    readonly name: string;
    readonly type: string;
    readonly properties: Map<string, any>;
    aabb: BoxXYXY;
}

export class TiledFormatObjectBox implements TiledFormatObject {
    public aabb: BoxXYXY

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly type: string,
        public readonly properties: Map<string, any>,
        public box: BoxXYWH
    ) {
        this.aabb = box.toBoxXYXY()
    }
}

export class TiledFormatObjectPolygon {
    public aabb: BoxXYXY

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly type: string,
        public readonly properties: Map<string, any>,
        public points: { x: number, y: number}[]
    ) {
        this.aabb = new BoxXYXY(
            Number.MAX_SAFE_INTEGER,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
        )
        for (let point of this.points) {
            this.aabb.x1 = Math.min(this.aabb.x1, point.x);
            this.aabb.y1 = Math.min(this.aabb.y1, point.x);
            this.aabb.x2 = Math.max(this.aabb.x2, point.y);
            this.aabb.y2 = Math.max(this.aabb.y2, point.y);
        }
    }
}
