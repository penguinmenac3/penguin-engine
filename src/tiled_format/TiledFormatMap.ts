import { Point } from "../geometry/Point"
import { BoxXYXY } from "../geometry/Box"
import { RawTiledFormatLayer, RawTiledFormatMap, RawTiledFormatTileset } from "./TiledFormatInterfaces"
import { TiledFormatLayer } from "./TiledFormatLayer"
import { TiledFormatObject, TiledFormatObjectBox } from "./TiledFormatObject"
import { TiledFormatObjectLink } from "./TiledFormatObjectProperty"
import { SpriteDescriptor, TiledFormatTileset } from "./TiledFormatTileset"
import { default as TypeChecks } from "./TiledFormatTypeChecks"
import { TiledFormatObjectTypes } from "./TiledObjectType"

export async function loadObjectFromRemoteJSONFile(path: string): Promise<any | null> {
    let fetchResult = await fetch(path)
    if (!fetchResult.ok) {
        return null
    }
    let resultAsText = await fetchResult.text()
    return JSON.parse(resultAsText)
}

export class TileDescriptor {

    public constructor(
        public readonly spriteDescriptor: SpriteDescriptor,
        public readonly yaw: number
    ) {}
}

export class TiledFormatMap {

    private readonly layers: TiledFormatLayer[] = []
    private readonly objects: TiledFormatObjectBox[] = []
    private readonly tilesets: TiledFormatTileset[] = []

    private worldBoundingBox = new BoxXYXY(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
    )

    private constructor(public readonly path: string) {

    }

    public static async loadMap(path: string, objectTypesPath: string = "maps/custom/objecttypes.json"): Promise<TiledFormatMap> {
        let rawMap: RawTiledFormatMap
        {
            let rawObject: any = await loadObjectFromRemoteJSONFile(path)
            if (rawObject == null) {
                throw new Error("Could not download Tileset: " + path)
            }

            try {
                TypeChecks.assertTypeMap(rawObject)
                rawMap = rawObject
            } catch (e) {
                console.log(e)
                throw new Error("Map does not match expected interface.")
            }
        }

        let map = new TiledFormatMap(path)

        let objectTypes = await TiledFormatObjectTypes.load(objectTypesPath)
        for (let layer of rawMap.layers) {
            switch(layer.type) {
                case "objectgroup":
                    map.parseObjectLayer(layer, objectTypes)
                    break
                case "tilelayer":
                    map.parseTileLayer(layer)
                    break
                default:
                    console.log("Unsupported layer " + layer.type)
            }
        }

        await map.loadTilesets(rawMap.tilesets)

        map.findActualBoundingBox()
        map.correctObjectBoxes()
        map.resolveObjectLinks()

        return map
    }

    private parseTileLayer(layer: RawTiledFormatLayer) {
        this.layers.push(new TiledFormatLayer(
            layer.name,
            layer.startx ?? 0,
            layer.starty ?? 0,
            layer.width!,
            layer.height,
            layer.chunks == undefined ? [] : layer.chunks
        ))
    }

    private parseObjectLayer(layer: RawTiledFormatLayer, objectTypes: TiledFormatObjectTypes) {
        for (let object of layer.objects!) {
            let properties = new Map<string, any>()

            properties.set("color", "#000000")

            let type = objectTypes.types.get(object.type)
            if (type) {
                properties.set("color", type.color)
                for (let [name, value] of type.properties) {
                    properties.set(name, value)
                }
            }

            if (object.properties) {
                for (let property of object.properties) {
                    let value: any
                    if (property.type == "object") {
                        value = new TiledFormatObjectLink(property.value)
                    } else {
                        value = property.value
                    }
                    properties.set(property.name, value)
                }
            }

            let objectBox = new BoxXYXY(
                object.x,
                object.y,
                object.x + object.width,
                object.y + object.height
            )
            let tiledFormatObject = new TiledFormatObjectBox(
                object.id,
                object.name,
                object.type,
                properties,
                objectBox.toBoxXYWH()
            )
            this.objects.push(tiledFormatObject)
        }
    }

    private correctObjectBoxes(): void {
        this.objects.map((object) => object.box).forEach((box) => {
            box.cx = (box.cx / 16) - this.worldBoundingBox.x1
            box.cy = (box.cy / 16) - this.worldBoundingBox.y1
            box.w = box.w / 16
            box.h = box.h / 16
        })
    }

    private resolveObjectLinks(): void {
        let map = new Map<number, TiledFormatObject>()

        for (let object of this.objects) {
            map.set(object.id, object);
        }

        for (let object of this.objects) {
            for (let key of object.properties.keys()) {
                let value = object.properties.get(key)

                if (value instanceof TiledFormatObjectLink) {
                    let partner = map.get(value.targetID)
                    object.properties.set(key, partner)

                    // console.log(`Linked: ${object.id} -> ${partner?.id}`)
                }
            }
        }
    }

    private async loadTilesets(tilesets: RawTiledFormatTileset[]): Promise<void> {
        let basedir = this.path.substring(0, this.path.lastIndexOf('/') + 1);

        let promises: Promise<TiledFormatTileset>[] = []

        for (var tileset of tilesets) {
            let firstgid: number = tileset.firstgid ?? 0
            let sourcePath = basedir + tileset.source

            promises.push(TiledFormatTileset.loadTileset(sourcePath, firstgid))
        }

        await Promise.all(promises)
        promises.forEach(async (loadedTileset) => this.tilesets.push(await loadedTileset))
    }

    private findActualBoundingBox(): void {
        let isPointOnEdge = (point: Point, boundingBox: BoxXYXY) =>
            (point.x == boundingBox.x1 || point.x == boundingBox.x2 || point.y == boundingBox.y1 || point.y == boundingBox.y2)

        let growWorldBoundingBox = (chunk: any) => {
            let chunkWidth = chunk.width
            for (let [idx, tileID] of chunk.data.entries()) {
                if (tileID != 0) {
                    let x = chunk.x + (idx % chunkWidth)
                    let y = chunk.y + Math.floor(idx / chunkWidth)
                    this.worldBoundingBox.growToInclude(new Point(x, y))
                }
            }
        }

        for (let layer of this.layers) {
            let chunks = layer.chunks
            let chunkCoordinateBoundingBox = new BoxXYXY(
                layer.mapStartX + layer.mapWidth - 16,
                layer.mapStartY + layer.mapHeight - 16,
                layer.mapStartX,
                layer.mapStartY
            )
            chunks.forEach((chunk) => chunkCoordinateBoundingBox.growToInclude(new Point(chunk.x, chunk.y)))
            chunks
                .filter((chunk) => isPointOnEdge(new Point(chunk.x, chunk.y), chunkCoordinateBoundingBox))
                .forEach(growWorldBoundingBox)
        }

        // Tile is only considered as top left for box grow -> fix box
        this.worldBoundingBox.x2 += 1
        this.worldBoundingBox.y2 += 1
    }

    private getTileID(x: number, y: number, layerID: number): number | null {
        let mappedX = x + this.worldBoundingBox.x1
        let mappedY = y + this.worldBoundingBox.y1

        let chunkX = 16 * Math.floor(mappedX / 16)
        let chunkY = 16 * Math.floor(mappedY / 16)

        for (var chunk of this.layers[layerID].chunks) {
            if (chunk.x != chunkX || chunk.y != chunkY) {
                continue
            }

            var localX = mappedX - chunkX
            var localY = mappedY - chunkY

            return chunk.data[localY * 16 + localX] as number
        }

        return null
    }

    public getTileAtPosition(x: number, y: number, layerID: number): TileDescriptor | null {
        let tileID = this.getTileID(x, y, layerID)
        if (tileID == null) {
            return null
        }

        let shift = 2**29
        let flagInt =  Math.floor(tileID / shift)
        let tileIDCleaned =  tileID - (flagInt * shift)
        var yaw = this.calculateYawFromFlags(flagInt)

        for (var i = 0; i < this.tilesets.length; i++) {
            let tileset0 = this.tilesets[i]
            let tileset1 = this.tilesets[i + 1]

            if (tileset0.firstgid <= tileIDCleaned && (!tileset1 || tileset1.firstgid > tileIDCleaned)) {
                let id = tileIDCleaned - tileset0.firstgid
                let spriteDescriptor = tileset0.getSpriteDescriptor(id)

                if (spriteDescriptor == null) {
                    continue
                }

                return new TileDescriptor(spriteDescriptor, yaw)
            }
        }

        return null
    }

    private calculateYawFromFlags(flagInt: number): number {
        switch (flagInt) {
            case 0:
                return 0
            case 5:
                return Math.PI / 2
            case 6:
                return Math.PI
            case 3:
                return -Math.PI / 2
            default:
                throw Error("Unsupported mirror mode: " + flagInt)
        }
    }

    public getWidth(): number {
        return this.worldBoundingBox.getWidth()
    }

    public getHeight(): number {
        return this.worldBoundingBox.getHeight()
    }

    public getLayerCount(): number {
        return this.layers.length
    }

    public getLayers(): TiledFormatLayer[] {
        return this.layers
    }

    public getObjects(): TiledFormatObjectBox[] {
        return this.objects
    }

    public getTilesets(): TiledFormatTileset[] {
        return this.tilesets
    }
}
