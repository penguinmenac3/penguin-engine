export class Sprite {
    constructor(
        public image: HTMLImageElement,
        public x: number,
        public y: number,
        public w: number,
        public h: number,
        public offsetX = 0,
        public offsetY = 0,
        public offsetYaw= 0
    ) {}

    static fromSpriteSheet(image: HTMLImageElement, idx: number, spriteMapWidth: number = 16, w: number = 16, h: number = 16) {
        let row = Math.floor(idx / spriteMapWidth)
        let col = idx % spriteMapWidth
        return new Sprite(image, col * w, row * h, w, h)
    }
}
