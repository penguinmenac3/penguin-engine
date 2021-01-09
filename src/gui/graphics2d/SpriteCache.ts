import { SpriteManager } from "./SpriteManager"


export class SpriteCache {

    private loadingImages = new Map<string, Promise<HTMLImageElement>>()
    private loadedImages = new Map<string, HTMLImageElement>()

    constructor(
        private readonly spriteManager = SpriteManager.getInstance()
    ) {}

    public queueLoading(name: string): Promise<HTMLImageElement> {
        if (this.loadingImages.has(name)) {
            return this.loadingImages.get(name)!
        }
        let promise = this.spriteManager.getImage(name)
        this.loadingImages.set(name, promise)
        promise.then((image) => { this.loadedImages.set(name, image) })
        return promise
    }

    public async blockUntilLoaded(): Promise<void> {
        await Promise.all(this.loadingImages.values())
    }

    public getLoadedImage(name: string): HTMLImageElement | never {
        if (this.loadedImages.has(name)) {
            return this.loadedImages.get(name)!
        }

        throw new Error(`image with name ${name} not loaded yet`)
    }

    public purge(): void {
        this.loadingImages.clear()
        this.loadedImages.clear()
    }
}
