import { _CommonRenderer } from './_CommonRenderer'


export class Renderer extends _CommonRenderer {
    private static instance: Renderer
    public static getInstance(): Renderer {
        if (Renderer.instance == null) {
            Renderer.instance = new Renderer()
        }
        return Renderer.instance
    }

    private viewDistanceInTiles: number = 32

    private constructor(element_id = "maincanvas") {
        super(<HTMLCanvasElement>(document.getElementById(element_id)))
        this.onWindowResize()
        window.addEventListener("resize", () => this.onWindowResize())
    }

    onWindowResize(): void {
        let canvas = <HTMLCanvasElement>(this.canvas)
        this.setSize(canvas.clientWidth, canvas.clientHeight)
        let maxUiSize = Math.max(this.canvas.width, this.canvas.height)
        let viewDistanceInPixels = this.viewDistanceInTiles * _CommonRenderer.TILESIZE
        this.uiScalingFactor = maxUiSize / viewDistanceInPixels
    }

    public setViewDistance(newViewDistance: number): void {
        this.viewDistanceInTiles = newViewDistance
        this.onWindowResize()
    }

    public getViewDistance(): number {
        return this.viewDistanceInTiles
    }
}
