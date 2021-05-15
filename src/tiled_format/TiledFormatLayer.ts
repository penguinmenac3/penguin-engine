import { TiledFormatChunk } from "./TiledFormatChunk";


export class TiledFormatLayer {

    public constructor(
        public readonly name: string,
        public readonly mapStartX: number,
        public readonly mapStartY: number,
        public readonly mapWidth: number,
        public readonly mapHeight: number,
        public readonly chunks: TiledFormatChunk[]
    ) { }
}
