import { Sprite } from "./Sprite"


export class SpriteManager {
    private static instance: SpriteManager
    public static getInstance(): SpriteManager {
        if (SpriteManager.instance == null) {
            SpriteManager.instance = new SpriteManager()
        }
        return SpriteManager.instance
    }
    
    /*  Map<string, HTMLImageElement | OffscreenCanvasRenderingContext2D> */
    private images = new Map<string, Promise<HTMLImageElement>>()

    private constructor() {}

    public getImage(name: string): Promise<HTMLImageElement> {
        if (this.images.has(name)) {
            return this.images.get(name)!
        }
        let promise: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
            var image = new Image()
            image.onload = (ev) => {console.log("Loaded: ", name); resolve(image)}
            image.src = 'sprites/' + name + '.png'
        })
        this.images.set(name, promise)
        return promise
    }
}
