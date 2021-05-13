
import Peer from "peerjs"
import { GameEngine } from "../GameEngine";
import { BroadcastCommand } from "../commands/BroadcastCommand";
import { BaseSystem } from "./BaseSystem";
import { Command } from "../commands/Command";


class _Connection {
    public uuid: string = ""
    public name: string = ""
    constructor(private conn: Peer.DataConnection) {}

    public send(packet: any): void {
        this.conn.send(JSON.stringify(packet))
    }
    public close(): void {
        this.conn.close()
    }
}


export class NetworkingSystem extends BaseSystem {
    private peer: Peer
    private activeConnections: _Connection[] = []
    private messageQueue: any[] = []
    private uuid: string = ""
    private timeout: number | undefined = undefined
    
    public constructor(private username: string, localPeerServer: boolean = false) {
        super("NetworkingSystem")
        this.registerCommandHandler(BroadcastCommand, this.handleCommand)

        if (localPeerServer) {
            this.peer = new Peer(undefined, {
                host: "/",
                port: 3001
            })
        } else {
            this.peer = new Peer()
        }
        this.peer.on("open", uuid => {
            this.uuid = uuid
        })
        var that = this;
        this.peer.on('connection', function(conn) {
            let connection = new _Connection(conn)
            that.activeConnections.push(connection)
            connection.send(that.getHandshake())

            conn.on('data', function(data) {
                that.handlePacket(JSON.parse(data), connection)
            });
        });
    }

    public getUUID() {
        return this.uuid
    }

    private getActiveUUIDs(): string[] {
        let result: string[] = []
        for(let connection of this.activeConnections) {
            if (connection.uuid != "") {
                result.push(connection.uuid)
            }
        }
        return result
    }

    private hasConnection(uuid: string) {
        if (uuid == this.getUUID()) {
            return true
        }
        for(let connection of this.activeConnections) {
            if (connection.uuid == uuid) {
                return true
            }
        }
        return false
    }

    public connect(uuid: string) {
        if (this.hasConnection(uuid)) return
        var conn = this.peer.connect(uuid)
        var that = this
        conn.on('open', function() {
            let connection = new _Connection(conn)
            that.activeConnections.push(connection)
            connection.send(that.getHandshake())
            conn.on('data', function(data) {
                that.handlePacket(JSON.parse(data), connection)
            })
        });
    }

    private sendToAllActiveConnections(packet: any) {
        for(let connection of this.activeConnections) {
            // TODO handle when connection closes. maybe this has to be handled somewhere else as a onclose.
            connection.send(packet)
        }
    }

    private sendToPlayer(packet: any, name: string) {
        for(let connection of this.activeConnections) {
            if (connection.name == name) {
                connection.send(packet)
            }
        }
    }

    private getHandshake(): any {
        return {
            "message": "handshake",
            "name": this.username,
            "uuid": this.getUUID(),
            "known_uuids": this.getActiveUUIDs()
        }
    }

    private handlePacket(packet: any, connection: _Connection) {
        var start = new Date()
        if (packet.message == "handshake") {
            connection.name = packet.name
            connection.uuid = packet.uuid
            for (let known_uuid of packet.known_uuids) {
                this.connect(known_uuid)
            }
        } else {
            this.messageQueue.push(packet)
        }
    }

    private handleCommand(command: BroadcastCommand) {
        let packet = {"command": command.command, "system": command.system}
        this.sendToAllActiveConnections(packet)
    }

    tick(elapsedTime: number): void {
        let packets = this.messageQueue
        let engine = GameEngine.getInstance()
        this.messageQueue = []
        for (let packet of packets) {
            engine.sendCommand(packet.command, packet.system, false)
        }
    }
}
