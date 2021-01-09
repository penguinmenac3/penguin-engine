import { Point } from "./Point";

export class GeometricObject {
    public isWithin(point: Point): boolean {
        return false
    }
    
    public hasIntersection(other: GeometricObject): boolean {
        return false
    }
}
