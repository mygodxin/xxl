export class RuleWin extends k7.AppWindow {
    btnClose: GButton;

    constructor() {
        super('RuleWin', 'start');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            // k7.EVT.UpdateUserItem,
        ];
    }

    bindChild() {
        this.btnClose = this.getButton('btnClose');
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
}