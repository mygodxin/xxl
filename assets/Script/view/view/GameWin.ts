import { GameDef } from "../../define/GameDef";
import { Notifitions } from "../../define/Notification";
import { GameManager } from "../../logic/GameManager";

export class GameWin extends k7.AppWindow {

    txtGold: GTextField;
    txtTime: GTextField;
    list: GList;
    gridMap

    constructor() {
        super('GameWin', 'game');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            Notifitions.CreateNewGrid
        ];
    }

    bindChild() {
        this.txtGold = this.getTextField('txtGold');
        this.txtTime = this.getTextField('txtTime');
        this.list = this.getList('list');
        this.list.itemRenderer = this.itemRenderer.bind(this);
        this.list.on(fgui.Event.CLICK_ITEM, this.clickItem, this);
    }

    private itemRenderer(index: number, obj: GObject): void {
        const x = index % GameDef.GRID_WIDTH;
        const y = parseInt(index / GameDef.GRID_WIDTH + '');
        let loader = obj.asCom.getChild('icon').asLoader;
        let data = GameManager.inst.getMap()[x][y];
        if (!data) {
            loader.url = '';
            return;
        }
        loader.url = `ui://game/组 ${data.color + 1}@2x`;
        // target.getController("show").selectedIndex = data[index] != "" ? 1 : 0;
    }


    readonly MAX_SEL: number = 2;
    lastSel;
    curSel;
    canMove = true;
    private clickItem(item: GComponent): void {
        // if (!this.canMove) return;
        if (this.lastSel && this.curSel) return;

        let sel = this.list.getChildIndex(item);

        if (this.curSel) {
            if (!GameManager.inst.canClick(this.curSel, sel)) {
                console.log('不是相邻点，不能点');
                return;
            }
            if (this.lastSel) {
                const lastItem = this.list.getChildAt(this.lastSel).asCom;
                lastItem.getController('sel').selectedIndex = 0;
            }

            this.lastSel = this.curSel;
        }
        let ctrlSel = item.asCom.getController('sel');
        ctrlSel.selectedIndex = ctrlSel.selectedIndex == 0 ? 1 : 0;

        this.curSel = sel;

        this.check();
    }

    check() {

        GameManager.inst.checkAndRemove();
    }

    refreshUi(): void {
        GameManager.inst.initGame();
        let gridMap = GameManager.inst.getMap();
        this.list.data = gridMap;
        this.list.numItems = GameDef.GRID_TOTAL_COUNT;

        for (let i = 0; i < GameDef.GRID_TOTAL_COUNT; i++) {
            const x = i % GameDef.GRID_WIDTH;
            const y = parseInt(i / GameDef.GRID_WIDTH + '');

        }
    }

    onEvent(eventName: string, params: any) {
        switch (eventName) {
            case Notifitions.CreateNewGrid:
                // this.create
                break;
        }
    }

    onClickButton(target) {
        switch (target) {
            // case this.headIcon:
            //     break;
        }
    }

    createGrid(): void {

    }
}