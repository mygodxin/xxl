import { StorageDef } from "../../../define/StorageDef";
import { GameManager } from "../../../logic/GameManager";
import { StartScene } from "../StartScene";
import { GameWin } from "./GameWin";
import { SubValidKey, WxRankProducer } from "../../view/OpenDataContext";
import { RankWin } from "../../view/RankWin";

export class EndWin extends k7.AppWindow {
    btnAgain: GButton;
    btnRank: GButton;
    btnStart: GButton;
    txtScore: GTextField;
    txtMaxScore: GTextField;
    txtTip: GTextField;

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
        this.txtTip = this.getTextField('txtTip');
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
        // WxRankProducer.uploadClounStorage(SubValidKey.Score, score);
        this.txtScore.text = `${score}分`;
        this.txtMaxScore.text = `历史最好成绩:${k7.Engine.readLocal(StorageDef.RECORD, true)}分`;
        this.txtTip.text = `排名保持在前${1}名！`
    }
}