
import Peer from "peerjs"
import { GameEngine, Message } from "../GameEngine";
import { BaseSystem } from "./BaseSystem";


class _Connection {
    constructor(private conn: Peer.DataConnection) {}

    public send(packet: any): void {
        this.conn.send(JSON.stringify(packet))
    }
    public close(): void {
        this.conn.close()
    }
}

export class NetworkingSystem implements BaseSystem {
    public name = "NetworkingSystem"
    private peer: Peer
    private activeConnections: _Connection[] = []
    private messageQueue: any[] = []
    private timeout: number | undefined = undefined
    
    public constructor(private username: string, localPeerServer: boolean = false) {
        if (localPeerServer) {
            this.peer = new Peer(undefined, {
                host: "/",
                port: 3001
            })
        } else {
            this.peer = new Peer()
        }
        this.peer.on("open", uuid => {
            console.log(uuid)
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
        GameEngine.getInstance().addMessageListener("networking", (message: Message) => this.handleMessage(message))
    }

    public connect(uuid: string) {
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
            connection.send(packet)
        }
    }

    private getHandshake(): any {
        return {"name": this.username}
    }

    private handlePacket(packet: any, connection: _Connection) {
        var start = new Date()
        if (packet.message) {
            this.messageQueue.push(packet)
        }
    }

    private handleMessage(message: Message) {
        let packet = {"message": message.message, "channel": message.channel}
        this.sendToAllActiveConnections(packet)
    }

    tick(elapsedTime: number): void {
        let packets = this.messageQueue
        let engine = GameEngine.getInstance()
        this.messageQueue = []
        for (let packet of packets) {
            engine.sendMessage(packet.message, packet.channel, false)
        }
    }
}
