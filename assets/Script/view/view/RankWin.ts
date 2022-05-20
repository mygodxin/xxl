import { OpenDataContWinType, RankSetting, SubMsgAction, WxRankProducer } from "./OpenDataContext";

export class RankWin extends k7.AppWindow {

    loaderFriendInfo: GLoader;
    btnClose: GButton;

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
        this.loaderFriendInfo = this.getLoader('render');
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
        this.showRank();
    }

    protected onHide(): void {
        this.shutdown();
    }

    public shutdown(): void {
        WxRankProducer.rank.hideRank();
    }

    private showRank() {
        let setting: RankSetting = {
            cvsWidth: this.loaderFriendInfo.width,
            cvsHeight: this.loaderFriendInfo.height,
            interval: 100,
        }
        WxRankProducer.rank.showRank(SubMsgAction.FetchFriendInterested, setting, this.loaderFriendInfo, OpenDataContWinType.FriendListWin);
    }
}