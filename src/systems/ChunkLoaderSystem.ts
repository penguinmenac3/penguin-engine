import { keys } from "ts-transformer-keys";
import { BaseSystem } from "./BaseSystem";
import { GameEngine } from "../GameEngine";
import { ChunkComponent } from "../components/ChunkComponent";
import { TransformComponent } from "../components/TransformComponent";
import { RenderComponent } from "../components/RenderComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { Point } from "../geometry/Point";
import { Pose } from "../geometry/Pose";
import { Renderer } from "../gui/graphics2d/Renderer";

interface Chunk {
    uuid: string
    transform: TransformComponent
    render: RenderComponent
    chunk: ChunkComponent
}

interface PlayableEntities {
    transform: TransformComponent,
    player: PlayerComponent
}

export interface ChunkLoaderInterface {
    deleteChunk(uuid: string): void;
    unloadMap(): void;
    removeMapPrefix(rawName: string): string;
    createChunk(id: string, x: number, y: number, chunkWidth: number, chunkHeight: number): void;
}


export class ChunkLoaderSystem extends BaseSystem {
    private engine = GameEngine.getInstance()
    public static CHUNK_WIDTH: number = 16
    public static CHUNK_HEIGHT: number = 16
    private map: string = "spawn"
    private playableEntityQuery: Function
    private chunkEntityQuery: Function

    constructor(private chunkLoader: ChunkLoaderInterface) {
        super("ChunkLoaderSystem")
        this.playableEntityQuery = this.engine.createEntityQuery<PlayableEntities>(keys<PlayableEntities>())
        this.chunkEntityQuery = this.engine.createEntityQuery<Chunk>(keys<Chunk>())
    }

    tick(elapsedTime: number): void {
        let player = this.playableEntityQuery().next().value
        let playerPos = player.transform.pose
        let viewDistance = Renderer.getInstance().getViewDistance()
        var chunks: Chunk[] = Array.from(this.chunkEntityQuery())
        if (this.map != player.player.map) {
            this.unloadMap(chunks)
            chunks = []
            this.map = player.player.map
        }
        this.deleteOldChunks(chunks, playerPos, viewDistance);
        this.createNewChunks(viewDistance, playerPos, chunks);
    }

    private createNewChunks(viewDistance: number, playerPos: Pose, chunks: Iterable<Chunk>) {
        let width = ChunkLoaderSystem.CHUNK_WIDTH
        let height = ChunkLoaderSystem.CHUNK_HEIGHT
        let size = Math.max(width, height)
        let numChunks = {x: viewDistance / width + 1, y: viewDistance / height + 1}
        let playerChunk = this.getPlayerChunk(playerPos, width, height);
        for (let i = Math.floor(playerChunk.x - numChunks.x / 2) - 1; i <= Math.ceil(playerChunk.x + numChunks.x / 2) + 1; i++) {
            for (let j = Math.floor(playerChunk.y - numChunks.y / 2) - 1; j <= Math.ceil(playerChunk.y + numChunks.y / 2) + 1; j++) {
                let newPose = new Point(i * width, j * height)
                if (newPose.euclideanDist(playerPos) <= 1.4 * (viewDistance + size/2)) {
                    if (!this.chunkExists(chunks, i, j)) {
                        this.createChunk(i, j)
                    }
                }
            }
        }
    }

    private getPlayerChunk(playerPos: Pose, width: number, height: number): { x: number, y: number } {
        let x = Math.floor(playerPos.x / width);
        let y = Math.floor(playerPos.y / height);
        return { x: x, y: y };
    }

    private deleteOldChunks(chunks: Iterable<Chunk>, playerPos: Pose, viewDistance: number): void {
        for (let chunk of chunks) {
            let size = Math.max(chunk.render.size[0], chunk.render.size[1])
            if (chunk.transform.pose.euclideanDist(playerPos) > 1.4 * (viewDistance + size/2)) {
                this.deleteChunk(chunk);
            }
        }
    }

    private deleteChunk(chunk: Chunk): void {
        this.chunkLoader!.deleteChunk(chunk.uuid);
    }

    private unloadMap(chunks: Chunk[]): void {
        if (!this.chunkLoader) {
            return
        }

        this.chunkLoader!.unloadMap()
        for (let chunk of chunks) {
            this.deleteChunk(chunk)
        }
    }

    private chunkExists(chunks: Iterable<Chunk>, i:number, j: number): boolean {
        for (let chunk of chunks) {
            if (chunk.chunk.chunkX == i && chunk.chunk.chunkY == j) {
                return true
            }
        }
        return false
    }

    private createChunk(i: number, j: number) {
        let mapName = this.chunkLoader!.removeMapPrefix(this.map)
        this.chunkLoader!.createChunk(mapName, i, j, ChunkLoaderSystem.CHUNK_WIDTH, ChunkLoaderSystem.CHUNK_HEIGHT)
    }
}
