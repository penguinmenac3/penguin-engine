import { _CommonRenderer } from "./_CommonRenderer";

export class OffscreenRenderer extends _CommonRenderer {
    private static instance = new OffscreenRenderer(0, 0)

    public static getInstance(width: number, height: number): OffscreenRenderer {
        this.instance.setSize(width, height)
        this.instance.resetRotationalTransform()
        return this.instance
    }

    private constructor(width: number, height: number) {
        let canvas = document.createElement("canvas")
        canvas.hidden = true
        super(canvas)
        this.setSize(width, height)
    }
}
