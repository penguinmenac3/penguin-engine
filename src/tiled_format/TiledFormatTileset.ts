import { BoxXYWH } from "../geometry/Box"
import { RawTiledFormatObject, RawTiledFormatTileset } from "./TiledFormatInterfaces";
import { loadObjectFromRemoteJSONFile } from "./TiledFormatMap";
import { TiledFormatObject, TiledFormatObjectBox, TiledFormatObjectPolygon } from "./TiledFormatObject";
import TypeChecks from "./TiledFormatTypeChecks";


export class SpriteDescriptor {

    constructor(
        public readonly typeName: string | null,
        public readonly spriteImagePNG: string,
        public readonly spriteMapName: string,
        public readonly spriteIndex: number,
        public readonly spriteMapWidth: number,
        public readonly spriteMapHeight: number,
        public readonly tileWidth: number,
        public readonly tileHeight: number,
        public readonly objects: RawTiledFormatObject[],
        public readonly properties: Map<string, any>
    ) { }
}

export class TiledFormatTileset {

    private readonly spriteDescriptors = new Map<number, SpriteDescriptor>();

    private constructor(
        public readonly firstgid: number,
        public readonly name: string = "",
        public readonly imagePNG: string = "",
        public readonly imageWidth: number = 16,
        public readonly imageHeight: number = 16,
        public readonly tileWidth: number = 16,
        public readonly tileHeight: number = 16
    ) { }

    public static async loadTileset(path: string, firstgid: number): Promise<TiledFormatTileset> {
        let rawTileset: RawTiledFormatTileset
        {
            let rawObject: any = await loadObjectFromRemoteJSONFile(path)
            if (rawObject == null) {
                throw new Error("Could not download Tileset: " + path)
            }

            try {
                TypeChecks.assertTypeTileset(rawObject)
                rawTileset = rawObject
            } catch (e) {
                console.log(e)
                throw new Error("Tileset does not match expected interface.")
            }
        }

        if (rawTileset.tilewidth != 16 || rawTileset.tileheight != 16) {
            throw new TypeError("Invalid imagesize " + rawTileset.tilewidth + "/" + rawTileset.tileheight);
        }

        let tileset = new TiledFormatTileset(
            firstgid,
            rawTileset.name,
            rawTileset.image,
            rawTileset.imagewidth,
            rawTileset.imageheight,
            rawTileset.tilewidth,
            rawTileset.tileheight
        );

        if (!("tiles" in rawTileset)) {
            console.log("No tiles in tileset")
            return tileset
        }

        for (let tile of rawTileset.tiles!) {
            let tileProperties = new Map<string, any>();
            for (let property of tile.properties ?? []) {
                tileProperties.set(property.name, property.value);
            }

            let tileObjects: TiledFormatObject[] = []
            if ("objectgroup" in tile && "objects" in tile.objectgroup!) {
                for (let object of tile.objectgroup!.objects!) {
                    tileObjects.push(TiledFormatTileset.parseObject(object))
                }
            }

            let spriteDescriptor = new SpriteDescriptor(
                tile.type ?? null,
                tileset.imagePNG,
                tileset.name,
                tile.id,
                tileset.imageWidth / tileset.tileWidth,
                tileset.imageHeight / tileset.tileHeight,
                tileset.tileWidth,
                tileset.tileHeight,
                [],
                tileProperties
            );

            tileset.spriteDescriptors.set(tile.id, spriteDescriptor);
        }
        return tileset;
    }

    private static parseObject(rawObject: RawTiledFormatObject): TiledFormatObject {
        let properties = new Map<string, any>();
        for (let property of rawObject.properties ?? []) {
            properties.set(property.name, property.value);
        }

        if (rawObject.polygon) {
            let points = []
            for (let point of rawObject.polygon!) {
                points.push({
                    x: rawObject.x + point.x,
                    y: rawObject.y + point.y
                })
            }

            return new TiledFormatObjectPolygon(
                rawObject.id,
                rawObject.name,
                rawObject.type,
                properties,
                points
            )
        } else {
            let box = new BoxXYWH(
                rawObject.x,
                rawObject.y,
                rawObject.width,
                rawObject.height
            )

            return new TiledFormatObjectBox(
                rawObject.id,
                rawObject.name,
                rawObject.type,
                properties,
                box
            )
        }
    }

    public getSpriteDescriptor(index: number): SpriteDescriptor | null {
        return this.spriteDescriptors.has(index) ? this.spriteDescriptors.get(index)! : null;
    }
}
