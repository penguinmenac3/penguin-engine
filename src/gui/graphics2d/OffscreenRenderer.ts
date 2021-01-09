import { v4 as uuid_v4 } from 'uuid'
import { _CommonRenderer } from "./_CommonRenderer";

export class OffscreenRenderer extends _CommonRenderer {
    public constructor(width: number, height: number) {
        let canvas = document.createElement("canvas")
        //canvas.setAttribute('id', uuid_v4())
        canvas.hidden = true
        super(canvas)
        this.setSize(width, height)
    }
}
