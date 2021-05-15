
export class TiledFormatChunk {

    public constructor(
        public readonly data: number[],
        public readonly height: number,
        public readonly width: number,
        public readonly x: number,
        public readonly y: number
    ) { }
}
