import { BaseComponent } from "./BaseComponent"

export class ChunkComponent extends BaseComponent {
    constructor(
        public readonly chunkX: number,
        public readonly chunkY: number
    ) {
        super()
    }
}
