import { Point } from "./Point";
import { GeometricObject } from "./GeometricObject";


export class Box<T> extends GeometricObject {
    isWithin(point: Point): boolean {
        throw Error("Not implemented!")
    }
    
    hasIntersection(other: GeometricObject): boolean {
        throw Error("Not implemented!")
    }

    centered(): T {
        throw Error("Not implemented!")
    }

    getWidth(): number {
        throw Error("Not implemented!")
    }

    getHeight(): number {
        throw Error("Not implemented!")
    }

    growToInclude(point: Point): void {
        throw Error("Not implemented!")
    }
}


export class BoxXYWH extends Box<BoxXYWH> {
    constructor(public cx: number, public cy: number, public w: number, public h: number, public properties: Map<string, any> = new Map<string, any>()) {
        super()
    }
    public isWithin(point: Point): boolean {
        let x1 = this.cx - this.w/2
        let x2 = this.cx + this.w/2
        let y1 = this.cy - this.h/2
        let y2 = this.cy + this.h/2
        return x1 <= point.x && point.x <= x2 && y1 <= point.y && point.y <= y2
    }

    public hasIntersection(other: GeometricObject): boolean {
        return this.toBoxXYXY().hasIntersection(other)
    }

    public centered(): BoxXYWH {
        return new BoxXYWH(0, 0, this.w, this.h)
    }

    public getWidth(): number {
        return this.w
    }

    public getHeight(): number {
        return this.h
    }

    public growToInclude(point: Point): void {
        let xyxy = this.toBoxXYXY()
        xyxy.growToInclude(point)
        let xywh = xyxy.toBoxXYWH()
        this.cx = xywh.cx
        this.cy = xywh.cy
        this.w = xywh.w
        this.h = xywh.h
    }

    public toBoxXYXY(): BoxXYXY {
        return new BoxXYXY(
            this.cx - this.w / 2, this.cy - this.h / 2,
            this.cx + this.w / 2, this.cy + this.h / 2,
            this.properties
        )
    }
}


export class BoxXYXY extends GeometricObject implements Box<BoxXYXY> {
    constructor(public x1: number, public y1: number, public x2: number, public y2: number, public properties: Map<string, any> = new Map<string, any>()) {
        super()
    }

    public static createFromTopLeftAndSize(x1: number, y1: number, w: number, h: number, properties: Map<string, any> = new Map<string, any>()): BoxXYXY {
        return new BoxXYXY(x1, y1, x1 + w, y1 + h, properties)
    }

    public isWithin(point: Point): boolean {
        return this.x1 <= point.x && point.x <= this.x2 && this.y1 <= point.y && point.y <= this.y2
    }

    public hasIntersectionBox(other: BoxXYXY): boolean {
        return !(this.x1 > other.x2 || this.x2 < other.x1 || this.y1 > other.y2 || this.y2 < other.y1)
    }

    public hasIntersection(other: GeometricObject): boolean {
        if (other instanceof BoxXYXY) {
            return this.hasIntersectionBox(other)
        }
        if (other instanceof BoxXYWH) {
            return this.hasIntersectionBox(other.toBoxXYXY())
        }
        return super.hasIntersection(other)
    }

    public centered(): BoxXYXY {
        let w = this.getWidth()
        let h = this.getHeight()
        return new BoxXYXY(-w/2, -h/2, w/2, h/2)
    }

    public getWidth(): number {
        return this.x2 - this.x1
    }

    public getHeight(): number {
        return this.y2 - this.y1
    }

    public growToInclude(point: Point): void {
        this.x1 = Math.min(this.x1, point.x)
        this.y1 = Math.min(this.y1, point.y)
        this.x2 = Math.max(this.x2, point.x)
        this.y2 = Math.max(this.y1, point.y)
    }

    public toBoxXYWH(): BoxXYWH {
        let cx = (this.x2 + this.x1) / 2 
        let cy = (this.y2 + this.y1) / 2 
        let w = this.getWidth()
        let h = this.getHeight()
        return new BoxXYWH(cx, cy, w, h, this.properties)
    }
}
