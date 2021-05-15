import { TiledFormatObjectBox } from "./TiledFormatObject"
import { TiledFormatMap } from "./TiledFormatMap"
import { ChunkLoaderInterface } from "../systems/ChunkLoaderSystem"
import { SpriteCache } from "../gui/graphics2d/SpriteCache"
import { Entity, makeEntity } from "../Entity"
import { GameEngine } from "../GameEngine"
import { RenderComponent } from "../components/RenderComponent"
import { RenderSystem } from "../systems/RenderSystem"
import { TransformComponent } from "../components/TransformComponent"
import { Pose } from "../geometry/Pose"
import { ChunkComponent } from "../components/ChunkComponent"
import { Sprite } from "../gui/graphics2d/Sprite"
import { OffscreenRenderer } from "../gui/graphics2d/OffscreenRenderer"
import { _CommonRenderer } from "../gui/graphics2d/_CommonRenderer"
import { DebugBoxComponent } from "../components/DebugBoxComponent"
import { BoxXYWH } from "../geometry/Box"


export interface EntityBuilder {
    createEntityForObject(object: TiledFormatObjectBox): Entity
    linkEntities(mapping: Map<TiledFormatObjectBox, Entity>): void
}


export class TiledChunkLoader implements ChunkLoaderInterface {
    private spriteCache: SpriteCache = new SpriteCache()
    private loadedMap: string = ""
    private entityUUIDs: string[] = []
    private tiledMapPromise: Promise<TiledFormatMap>

    public constructor(
        private entityBuilder: EntityBuilder,
        initialMapId: string
    ) {
        this.tiledMapPromise = TiledFormatMap.loadMap("maps/" + initialMapId + ".json")
    }

    public removeMapPrefix(rawName: string): string {
        return rawName
    }
    
    public createChunk(id: string, x: number, y: number, chunkWidth: number, chunkHeight: number): void {
        let startLoading = Date.now()
        let entity = this.createEmptyChunk(x, y, chunkWidth, chunkHeight)
        this.loadMapIfIDChanged(id)
        let spritePromise = this.getChunkSprite(entity, x, y, chunkWidth, chunkHeight, startLoading)
        entity.render = new RenderComponent(spritePromise, RenderSystem.BACKGROUND_LAYER, [chunkWidth, chunkHeight])
        GameEngine.getInstance().addEntity(entity)
    }

    private loadMapIfIDChanged(id: string) {
        if (id != this.loadedMap) {
            this.tiledMapPromise = TiledFormatMap.loadMap("maps/" + id + ".json")
            this.loadedMap = id
            this.tiledMapPromise.then((map) => this.createAndAddAllEntities(map))
        }
    }

    public unloadMap(): void {
        let engine = GameEngine.getInstance()
        for (let uuid of this.entityUUIDs) {
            engine.deleteEntity(uuid)
        }
    }

    private createAndAddAllEntities(map: TiledFormatMap): void {
        let mapHeightHalved = map.getHeight() / 2
        let mapWidthHalved = map.getWidth() / 2
        let mapping = new Map<TiledFormatObjectBox, Entity>()
        for (let object of map.getObjects()) {
            let box = object.box
            box.cx -= mapWidthHalved
            box.cy -= mapHeightHalved
            let entity = this.entityBuilder.createEntityForObject(object)
            mapping.set(object, entity)
        }
        this.entityBuilder.linkEntities(mapping)
        for (let entity of mapping.values()) {
            GameEngine.getInstance().addEntity(entity)
            this.entityUUIDs.push(entity.uuid)
        }
    }

    private createEmptyChunk(x: number, y: number, chunkWidth: number, chunkHeight: number): Entity {
        let transform = new TransformComponent(new Pose(x * chunkWidth, y * chunkHeight, 0))
        let entity = makeEntity()
        entity.transform = transform
        entity.chunk = new ChunkComponent(x, y)
        return entity
    }

    private async getChunkSprite(entity: Entity, chunkX: number, chunkY: number, chunkWidth: number, chunkHeight: number, startLoading: number): Promise<Sprite> {
        let map = await this.tiledMapPromise

        map.getTilesets().forEach((tileset) => this.spriteCache.queueLoading(tileset.name))
        await this.spriteCache.blockUntilLoaded()

        let renderer = OffscreenRenderer.getInstance(chunkWidth * _CommonRenderer.TILESIZE, chunkHeight * _CommonRenderer.TILESIZE)

        let mapHeight = map.getHeight()
        let mapWidth = map.getWidth()
        for (let layerID = 0; layerID < map.getLayerCount(); layerID++) {
            for (let y = -chunkHeight/2; y < chunkHeight/2; y++) {
                for (let x = -chunkWidth/2; x < chunkWidth/2; x++) {
                    let tileDescriptor = map.getTileAtPosition(chunkX * chunkWidth + x + mapWidth / 2 , chunkY * chunkHeight + y + mapHeight / 2, layerID)
                    if (tileDescriptor == null) {
                        continue
                    }

                    let spriteDescriptor = tileDescriptor.spriteDescriptor
                    let loadedImage = this.spriteCache.getLoadedImage(spriteDescriptor.spriteMapName)

                    let sprite = Sprite.fromSpriteSheet(
                        loadedImage,
                        spriteDescriptor.spriteIndex,
                        spriteDescriptor.spriteMapWidth,
                        spriteDescriptor.tileWidth,
                        spriteDescriptor.tileHeight
                    )

                    renderer.drawSprite(sprite, new Pose(x + chunkWidth / 2, y + chunkHeight / 2, tileDescriptor.yaw), [1, 1], false, false)
                }
            }
        }
        let sprite = renderer.toSprite()

        let elapsed = Date.now() - startLoading
        entity.debugBox = new DebugBoxComponent(new BoxXYWH(0, 0, chunkWidth, chunkHeight), "Chunk (" + chunkX + ", " + chunkY + ") in " + elapsed + "ms", "#FF0000")
        return sprite
    }

    public deleteChunk(uuid: string): void {
        GameEngine.getInstance().deleteEntity(uuid)
    }
}
