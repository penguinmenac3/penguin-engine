export class BaseSystem {
    constructor(public name: string) {}

    public tick(elapsedTime: number): void {
        throw Error("Not implemented!")
    }
}
