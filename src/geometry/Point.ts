export class Point {
    constructor(public x: number, public y: number) {}

    public euclideanDist(a: Point): number {
        let dx = a.x - this.x
        let dy = a.y - this.y
        return Point.norm(dx, dy)
    }

    public static norm(x: number, y: number): number {
        return Math.sqrt(x*x + y*y)
    }

    public static norm2(x: number, y: number): number {
        return x*x + y*y
    }
}
