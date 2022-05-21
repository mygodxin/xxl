import { GameDef } from "../../define/GameDef";
import { GameManager } from "../../logic/GameManager";
import { OpenDataContWinType, RankSetting, SubMsgAction, WxRankProducer } from "./OpenDataContext";

export class RankWin extends k7.AppWindow {

    // loaderFriendInfo: GLoader;
    btnClose: GButton;
    list: GList;

    constructor() {
        super('RankWin', 'rank');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            // k7.EVT.UpdateUserItem,
        ];
    }

    bindChild() {
        this.btnClose = this.getButton('btnClose');
        // this.loaderFriendInfo = this.getLoader('render');
        this.list = this.getList('list');
        this.list.itemRenderer = this.itemRenderer.bind(this);
        // this.on(fgui.Event.TOUCH_MOVE);
    }

    onEvent(eventName: string, params: any) {
        switch (eventName) {
        }
    }

    onClickButton(target) {
        switch (target) {
            case this.btnClose:
                this.hide();
                break;
        }
    }

    refreshUi(): void {
        // this.showRank();
    }

    private itemRenderer(index: number, obj: GObject): void {
        const data = this.list.data[index];
        let txtRank = obj.asCom.getChild('txtRank').asTextField;
        let txtName = obj.asCom.getChild('txtName').asTextField;
        let txtScore = obj.asCom.getChild('txtScore').asTextField;
        txtRank.text = '';
        txtName.text = '';
        txtScore.text = '';
    }

    protected onHide(): void {
        this.shutdown();
    }

    public shutdown(): void {
        WxRankProducer.rank.hideRank();
    }

    // private showRank() {
    //     let setting: RankSetting = {
    //         cvsWidth: this.loaderFriendInfo.width,
    //         cvsHeight: this.loaderFriendInfo.height,
    //         interval: 100,
    //     }
    //     WxRankProducer.rank.showRank(SubMsgAction.FetchFriendRankData, setting, this.loaderFriendInfo, OpenDataContWinType.FriendListWin);
    // }
}