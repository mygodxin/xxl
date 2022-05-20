import { RankWin } from "../view/RankWin";
import { RuleWin } from "../view/RuleWin";
import { GameScene } from "./GameScene";

export class StartScene extends k7.AppScene {
    btnStart: GButton;
    btnRank: GButton;
    btnRule: GButton;
    constructor() {
        super('StartScene', 'start');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            // k7.EVT.UpdateUserItem,
        ];
    }

    bindChild() {
        this.btnStart = this.getButton('btnStart');
        this.btnRank = this.getButton('btnRank');
        this.btnRule = this.getButton('btnRule');
    }


    onEvent(eventName: string, params: any) {
        switch (eventName) {
        }
    }

    onClickButton(target) {
        switch (target) {
            case this.btnStart:
                k7.AppScene.show(GameScene);
                break;
            case this.btnRank:
                k7.AppWindow.show(RankWin);
                break;
            case this.btnRule:
                k7.AppWindow.show(RuleWin);
                break;
        }
    }
}