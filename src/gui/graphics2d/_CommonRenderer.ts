import { Point } from "../../geometry/Point"
import { Pose } from "../../geometry/Pose"
import { Sprite } from './Sprite'



export class _CommonRenderer {
    public static TILESIZE: number = 16
    protected uiScalingFactor: number = 1.0
    private screenRadius: number = 0

    public context: CanvasRenderingContext2D
    private cameraPosition = new Point(0, 0)

    constructor(public canvas: HTMLCanvasElement) {
        this.context = this.canvas.getContext("2d")!
    }

    public setSize(width: number, height: number): void {
        this.canvas.width = width
        this.canvas.height = height
        this.screenRadius = Point.norm(width, height) / 2
    }

    public addEventListener(type: any, listener: (this: HTMLCanvasElement, ev: any) => any, options?: boolean | AddEventListenerOptions | undefined): void {
        this.canvas.addEventListener(type, listener, options)
    }

    public setCamera(position: Point): void {
        this.cameraPosition.x = position.x
        this.cameraPosition.y = position.y
    }

    public screenToIngame(x: number, y: number): Point {
        return new Point((x - this.canvas.width / 2) / this.uiScalingFactor + this.cameraPosition.x, (y - this.canvas.height / 2) / this.uiScalingFactor + this.cameraPosition.y)
    }

    public screenToEgo(x: number, y: number): Point {
        return new Point(x - this.canvas.width / 2, y - this.canvas.height / 2 )
    }

    public setRotationalTransform(dx: number, dy: number, yaw: number): void {
        let c = Math.cos(yaw)
        let s = Math.sin(yaw)
        this.context.setTransform(c, s, -s, c, dx, dy)
    }

    public resetRotationalTransform(): void {
        this.context.resetTransform()
    }

    public drawSprite(
        sprite: Sprite, pose: Pose, size: number[],
        absolute: boolean = false, centered: boolean = true,
        offsetX: number = 0, offsetY: number = 0, offsetYaw: number = 0
    ): void {
        if (sprite.image != null) {
            var { posX, posY, totalScalingFactor } = this.computeOffsets(pose, absolute, centered, size)
            if (!absolute) {
                let objectRadius = Point.norm(size[0] * totalScalingFactor, size[1] * totalScalingFactor)
                if (Point.norm(posX - this.canvas.width / 2, posY - this.canvas.height / 2) > this.screenRadius + objectRadius) {
                    return
                }
            }
            this.setRotationalTransform(posX, posY, pose.yaw + offsetYaw)
            this.context.drawImage(sprite.image, sprite.x, sprite.y, sprite.w, sprite.h, offsetX * totalScalingFactor - size[0] / 2 * totalScalingFactor, offsetY * totalScalingFactor - size[1] / 2 * totalScalingFactor, size[0] * totalScalingFactor, size[1] * totalScalingFactor)
            this.resetRotationalTransform()
        }
    }

    public drawText(text: string, position: Point, color: string, size: number = 22, absolute: boolean = true, centered: boolean = true): void {
        var { posX, posY, totalScalingFactor } = this.computeOffsets(position, absolute, centered, [0, 0])
        if (!absolute && Point.norm(posX - this.canvas.width / 2, posY - this.canvas.height / 2) > (this.screenRadius + size) * 1.2) {
            return
        }
        this.context.fillStyle = color  // "#RRGGBB"
        this.context.font = size + 'px san-serif'
        this.context.fillText(text, posX, posY + size)
    }

    public fillRect(position: Point, color: string, size: number[], absolute: boolean = true, centered: boolean = true): void {
        var { posX, posY, totalScalingFactor } = this.computeOffsets(position, absolute, centered, size)
        if (!absolute) {
            let objectRadius = Point.norm(size[0] * totalScalingFactor, size[1] * totalScalingFactor)
            if (Point.norm(posX - this.canvas.width / 2, posY - this.canvas.height / 2) > this.screenRadius + objectRadius) {
                return
            }
        }
        this.context.fillStyle = color
        this.context.fillRect(posX - size[0] / 2 * totalScalingFactor, posY - size[1] / 2 * totalScalingFactor, size[0] * totalScalingFactor, size[1] * totalScalingFactor)
    }

    public strokeRect(position: Point, color: string, size: number[], absolute: boolean = true, centered: boolean = false): void {
        var { posX, posY, totalScalingFactor } = this.computeOffsets(position, absolute, centered, size)
        if (!absolute) {
            let objectRadius = Point.norm(size[0] * totalScalingFactor, size[1] * totalScalingFactor)
            if (Point.norm(posX - this.canvas.width / 2, posY - this.canvas.height / 2) > this.screenRadius + objectRadius) {
                return
            }
        }
        this.context.strokeStyle = color
        this.context.strokeRect(posX - size[0] / 2 * totalScalingFactor, posY - size[1] / 2 * totalScalingFactor, size[0] * totalScalingFactor, size[1] * totalScalingFactor)
    }

    public strokeCircle(position: Point, color: string, size: number, lineWidth: number = 0.0, absolute: boolean = false, centered: boolean = true): void {
        var { posX, posY, totalScalingFactor } = this.computeOffsets(position, absolute, centered, [size, size])
        if (!absolute) {
            let objectRadius = size / 2
            if (Point.norm(posX - this.canvas.width / 2, posY - this.canvas.height / 2) > this.screenRadius + objectRadius) {
                return
            }
        }
        this.context.strokeStyle = color
        this.context.lineWidth = Math.max(Math.round(lineWidth * totalScalingFactor), 1.0)
        this.context.beginPath()
        this.context.arc(posX, posY, size / 2 * totalScalingFactor, 0, 2 * Math.PI)
        this.context.stroke()
    }

    private computeOffsets(position: Point, absolute: boolean, centered: boolean, size: number[]) {
        var posX = position.x
        var posY = position.y
        var totalScalingFactor = 1.0
        if (!absolute) {
            totalScalingFactor = _CommonRenderer.TILESIZE * this.uiScalingFactor
            posX -= this.cameraPosition.x
            posY -= this.cameraPosition.y
            posX *= totalScalingFactor
            posY *= totalScalingFactor
            if (centered) {
                posX += this.canvas.width / 2
                posY += this.canvas.height / 2
            }
        }
        if (!centered) {
            posX += size[0] / 2 * totalScalingFactor
            posY += size[1] / 2 * totalScalingFactor
        }
        return { posX, posY, totalScalingFactor }
    }

    public clear(): void {
        this.canvas.width = this.canvas.width
        this.context.imageSmoothingEnabled = false
    }

    public toSprite(): Sprite {
        let image = new Image()
        image.src = this.canvas.toDataURL("image/png")
        return new Sprite(image, 0, 0, this.canvas.width, this.canvas.height)
    }
}
