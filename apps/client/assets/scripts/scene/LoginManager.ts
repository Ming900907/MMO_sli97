import { _decorator, Component, EditBox } from "cc";
import Crypt from "jsencrypt";
import { PublicKey } from "db://assets/scripts/common/secret";
import NetworkManager from "db://assets/scripts/global/NetworkManager";
import { RpcFunc } from "db://assets/scripts/common/enum";

const { ccclass, property } = _decorator;

const crypt = new Crypt();

crypt.setKey(PublicKey);

@ccclass("LoginManager")
export class LoginManager extends Component {

    account: EditBox;
    password: EditBox;

    onLoad() {
        this.account = this.node.getChildByName("Account").getComponent(EditBox);
        this.password = this.node.getChildByName("Password").getComponent(EditBox);
    }

    async register() {
        const account = crypt.encrypt(this.account.string);
        const password = crypt.encrypt(this.password.string);

        console.log("account", account);
        console.log("password", password);

        await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account,
                password
            })
        })
            .then((res) => {
                res.json();
            });
    }

    async Login() {
        const account = crypt.encrypt(this.account.string);
        const password = crypt.encrypt(this.password.string);

        console.log("account", account);
        console.log("password", password);

        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account,
                password
            })
        })
            .then((response) => response.json());
        console.log(res);

        await this.connect(res.data);
    }

    async connect(token: string) {
        await NetworkManager.Instance.connect();
        const res = await NetworkManager.Instance.call(RpcFunc.enterGame, { token });
        console.log(res);
    }
}

