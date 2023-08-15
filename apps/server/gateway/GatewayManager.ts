import { Singleton } from "../common/common/base";
import { WebSocketServer, WebSocket } from "ws";
import { RpcFunc } from "../common";

export class GatewayManager extends Singleton {
    static get Instance() {
        return super.GetInstance<GatewayManager>();
    }

    init() {
        const wss = new WebSocketServer({ port: 4000 });

        wss.on("connection", (ws) => {
            ws.on("error", console.error);

            ws.on("message", (buffer: Buffer) => {
                this.handleMessage(ws, buffer);
            });
        });
    }

    handleMessage(ws: WebSocket, buffer: Buffer) {
        console.log(buffer.toString());
        const { name, data } = JSON.parse(buffer.toString());

        if(name === RpcFunc.enterGame) {
            //TODO 做鉴权
        } else {
            //TODO 跟Game服务通信
        }
        ws.send(buffer.toString());
    }
}