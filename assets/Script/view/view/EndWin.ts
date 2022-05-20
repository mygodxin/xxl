import { StorageDef } from "../../define/StorageDef";
import { GameManager } from "../../logic/GameManager";
import { StartScene } from "../scene/StartScene";
import { GameWin } from "./GameWin";
import { SubValidKey, WxRankProducer } from "./OpenDataContext";
import { RankWin } from "./RankWin";

export class EndWin extends k7.AppWindow {
    btnAgain: GButton;
    btnRank: GButton;
    btnStart: GButton;
    txtScore: GTextField;
    txtMaxScore: GTextField;

    constructor() {
        super('EndWin', 'end');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            // k7.EVT.UpdateUserItem,
        ];
    }

    bindChild() {
        this.btnAgain = this.getButton('btnAgain');
        this.btnRank = this.getButton('btnRank');
        this.btnStart = this.getButton('btnStart');
        this.txtScore = this.getTextField('txtScore');
        this.txtMaxScore = this.getTextField('txtMaxScore');
    }


    onEvent(eventName: string, params: any) {
        switch (eventName) {
        }
    }

    onClickButton(target) {
        switch (target) {
            case this.btnRank:
                k7.AppWindow.show(RankWin);
                break;
            case this.btnStart:
                this.hide();
                k7.AppWindow.show(StartScene);
                break;
            case this.btnAgain:
                this.hide();
                k7.AppWindow.show(GameWin);
                break;
        }
    }

    refreshUi(): void {
        const score = GameManager.inst.myScore;
        WxRankProducer.uploadClounStorage(SubValidKey.Score, score);
        this.txtScore.text = score + '';
        this.txtMaxScore.text = k7.Engine.readLocal(StorageDef.RECORD, true);
    }
}