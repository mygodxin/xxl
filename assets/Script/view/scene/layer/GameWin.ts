import { GameDef, Grid } from "../../../define/GameDef";
import { Notifitions } from "../../../define/Notification";
import { GameManager } from "../../../logic/GameManager";

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
            Notifitions.CreateNewGrid,
            Notifitions.CheckAndMoveEnd
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
        obj.asCom.getChild('title').asTextField.text = data.color;
        // target.getController("show").selectedIndex = data[index] != "" ? 1 : 0;
    }


    readonly MAX_SEL: number = 2;
    curSel;
    canMove = true;
    private clickItem(item: GComponent): void {
        if (!this.canMove) return;

        let sel = this.list.getChildIndex(item);

        if (this.curSel != undefined) {
            //不是相邻点 重置原来选新点
            const curItem = this.list.getChildAt(this.curSel).asCom;
            curItem.getController('sel').selectedIndex = 0;

            if (GameManager.inst.canClick(this.curSel, sel)) {
                //相邻点 开启移动，移动完成开始检测
                this.move(this.curSel, sel);
                this.curSel = undefined;
            } else {

                let ctrlSel = item.asCom.getController('sel');
                ctrlSel.selectedIndex = ctrlSel.selectedIndex == 0 ? 1 : 0;

                this.curSel = sel;
            }
        } else {
            let ctrlSel = item.asCom.getController('sel');
            ctrlSel.selectedIndex = ctrlSel.selectedIndex == 0 ? 1 : 0;

            this.curSel = sel;
        }

    }

    move(curSel: number, lastSel: number) {
        GameManager.inst.move(curSel, lastSel);
        const lastItem = this.list.getChildAt(curSel).asCom;
        const curItem = this.list.getChildAt(lastSel).asCom;
        const lastUrl = lastItem.getChild('icon').asLoader.url;
        const curUrl = curItem.getChild('icon').asLoader.url
        const lastColor = lastItem.getChild('title').asTextField.text;
        const curColor = curItem.getChild('title').asTextField.text;
        this.canMove = false;
        const left = this.list.x + this.list.margin.left;
        const top = this.list.y + this.list.margin.top;
        let curFlyItem = fgui.UIPackage.createObject('game', 'ListRender').asCom;
        curFlyItem.getChild('icon').asLoader.url = curUrl;
        curFlyItem.x = left + curItem.x;
        curFlyItem.y = top + curItem.y;
        this.addChild(curFlyItem);
        lastItem.getChild('icon').asLoader.url = curUrl;
        lastItem.getChild('title').asTextField.text = curColor;


        let lastFlyItem = fgui.UIPackage.createObject('game', 'ListRender').asCom;
        lastFlyItem.getChild('icon').asLoader.url = lastUrl;
        lastFlyItem.x = left + lastItem.x;
        lastFlyItem.y = top + lastItem.y;
        this.addChild(lastFlyItem);
        curItem.getChild('icon').asLoader.url = lastUrl;
        curItem.getChild('title').asTextField.text = lastColor;

        lastItem.visible = curItem.visible = false;

        cc.tween(lastFlyItem)
            .to(0.5, { x: left + curItem.x, y: top + curItem.y })
            .start();
        cc.tween(curFlyItem)
            .to(0.5, { x: left + lastItem.x, y: top + lastItem.y })
            .call(() => {
                lastFlyItem.visible = false;
                curFlyItem.visible = false;
                lastItem.visible = curItem.visible = true;
                this.check();
            })
            .start();
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
            case Notifitions.CheckAndMoveEnd:
                this.onCheckAndMoveEnd(params);
                break;
        }
    }

    onCheckAndMoveEnd(tempBoomList: cc.Vec2[]) {
        if (tempBoomList.length > 0) {
            for (let f in tempBoomList) {
                const foo = tempBoomList[f];
                const comp = this.list.getChildAt(GameManager.inst.pointToIndex(foo));
                cc.tween(comp)
                    .sequence(
                        cc.tween().to(0.2, { scaleX: 1.2, scaleY: 1.2 }),
                        cc.tween().to(0.5, { scaleX: 0, scaleY: 0 }),
                    )
                    .call(() => {

                    })
                    .start();
            }
        } else
            this.canMove = true;
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