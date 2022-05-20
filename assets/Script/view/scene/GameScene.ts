import { GameWin } from "../view/GameWin";

export class GameScene extends k7.AppScene {
    constructor() {
        super('GameScene', 'game');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            // k7.EVT.UpdateUserItem,
        ];
    }

    bindChild() {
    }


    onEvent(eventName: string, params: any) {
        switch (eventName) {
        }
    }

    onClickButton(target) {
        switch (target) {
            // case this.headIcon:
            //     break;
        }
    }

    refreshUi(): void {
        k7.AppWindow.show(GameWin);
    }
}