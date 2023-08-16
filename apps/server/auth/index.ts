import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dayjs from "dayjs";
import { createHash } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import Crypt from "node-jsencrypt";
import {
    AuthService,
    CheckTokenRes,
    CheckTokenResData,
    PrivateKey
} from "../common";
import * as grpc from "@grpc/grpc-js";

import { createDBConnection } from "../common";

const cache = new Map();
const crypt = new Crypt();
crypt.setKey(PrivateKey);

const db = createDBConnection();

console.log("DB连接成功");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/register", (req, res) => {
    let { account, password } = req.body;
    account = crypt.decrypt(account);
    password = crypt.decrypt(password);

    console.log(account);
    console.log(password);

    const hash = createHash("md5");

    hash.update(password);

    const passwordHash = hash.digest("hex");

    db.then((e) => {
        e.query("insert into user (account, password, created_time) VALUES (?, ?, ?)", [account, passwordHash, dayjs().format("YYYY-MM-DD HH:mm:ss")],
            (error, results) => {
                if (error) {
                    console.log((error));
                    return;
                }
                console.log(results);
            }
        );
    });
    res.json({ code: 200, message: "success" });
});

app.post("/login", (req, res) => {
    let { account, password } = req.body;
    account = crypt.decrypt(account);
    password = crypt.decrypt(password);

    console.log(account);
    console.log(password);

    const hash = createHash("md5");

    hash.update(password);

    const passwordHash = hash.digest("hex");

    db.then((e) => {
        e.query("select * from user where account = ? and password = ?", [account, passwordHash],
            (error, results) => {
                if (error) {
                    console.log((error));
                    return;
                }
                if (results.length > 0) {
                    const token = uuidv4();
                    cache.set(token, account);

                    console.log("cache", cache);
                    res.json({ code: 200, data: token });
                }
            }
        );
    });
});
app.listen(3000);

console.log("auth 服务");

const server = new grpc.Server();
server.addService(AuthService, {
    checkToken(call: any, callback: any) {
        const token = call.request.getToken();
        const res = new CheckTokenRes();
        if (cache.has(token)) {
            const data = new CheckTokenResData();
            data.setAccount(cache.get(token));
            res.setData(data);
        } else {
            res.setError("token not exist");
        }

        callback(null, res);
    }
});

server.bindAsync("localhost:3333", grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log("RPC服务启动");
});
