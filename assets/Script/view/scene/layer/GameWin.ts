import { GameDef } from "../../../define/GameDef";
import { Notifitions } from "../../../define/Notification";
import { GameManager } from "../../../logic/GameManager";
import { EndWin } from "./EndWin";

export class GameWin extends k7.AppWindow {

    txtGold: GTextField;
    txtTime: GTextField;
    list: GList;
    gridMap
    debug = true;
    private time: number;
    private readonly maxTime: number = 30;

    constructor() {
        super('GameWin', 'game');
    }

    initConfig() {
        super.initConfig();

        this.eventList = [
            Notifitions.CreateNewGrid,
            Notifitions.CheckAndMoveEnd,
            Notifitions.ScoreUpdate,
            Notifitions.Neaton
        ];
    }
    onEvent(eventName: string, params: any) {
        switch (eventName) {
            case Notifitions.CreateNewGrid:
                this.onCreateNewGrid(params);
                break;
            case Notifitions.CheckAndMoveEnd:
                this.onCheckAndMoveEnd(params);
                break;
            case Notifitions.ScoreUpdate:
                this.updateScore();
                break;
            case Notifitions.Neaton:
                this.onNeaton(params);
                break;
        }
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
        loader.url = `ui://game/icon${data.color}`;
        obj.asCom.getChild('title').asTextField.text = this.debug ? data.color : '';
        obj.asCom.visible = true;
        obj.asCom.scaleX = obj.asCom.scaleY = 1;
        // console.log('生成新点', obj.asCom, index);
        // target.getController("show").selectedIndex = data[index] != "" ? 1 : 0;
    }


    readonly MAX_SEL: number = 2;
    curSel;
    canMove = true;
    private clickItem(item: GComponent): void {
        if (!this.canMove) return;

        let sel = this.list.getChildIndex(item);

        if (this.curSel != undefined && this.curSel != sel) {
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
        curFlyItem.getChild('title').asTextField.text = '';
        curFlyItem.x = left + curItem.x;
        curFlyItem.y = top + curItem.y;
        this.addChild(curFlyItem);
        lastItem.getChild('icon').asLoader.url = curUrl;
        lastItem.getChild('title').asTextField.text = this.debug ? curColor : '';


        let lastFlyItem = fgui.UIPackage.createObject('game', 'ListRender').asCom;
        lastFlyItem.getChild('icon').asLoader.url = lastUrl;
        lastFlyItem.getChild('title').asTextField.text = '';
        lastFlyItem.x = left + lastItem.x;
        lastFlyItem.y = top + lastItem.y;
        this.addChild(lastFlyItem);
        curItem.getChild('icon').asLoader.url = lastUrl;
        curItem.getChild('title').asTextField.text = this.debug ? lastColor : '';

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
        this.updateScore();
        // this.countdown();
    }

    updateScore() {
        this.txtGold.text = GameManager.inst.myScore + '金币';
    }

    timeid
    /** 倒计时 */
    countdown() {
        this.time = this.maxTime;
        this.txtTime.text = this.time + '秒';
        this.timeid = setInterval(() => {
            this.time--;
            if (this.time <= 0) {
                clearInterval(this.timeid);
                this.txtTime.text = '0秒';
                this.hide();
                k7.AppWindow.show(EndWin);
                return;
            }
            this.txtTime.text = this.time + '秒';
        }, 1000);
    }

    onCreateNewGrid(p) {
        const left = this.list.x + this.list.margin.left;
        const top = this.list.y + this.list.margin.top;

        const index = GameManager.inst.pointToIndex(p);
        const comp = this.list.getChildAt(index);

        let data = GameManager.inst.getMap()[p.x][p.y];
        const lastUrl = `ui://game/icon${data.color}`;
        let flyComp = fgui.UIPackage.createObject('game', 'ListRender').asCom;
        flyComp.getChild('icon').asLoader.url = lastUrl;
        flyComp.getChild('title').asTextField.text = this.debug ? data.color : '';
        flyComp.x = left + comp.x + flyComp.width / 2;
        flyComp.y = -this.height / 2//top + comp.y + flyComp.height / 2;
        flyComp.setPivot(0.5, 0.5, true);
        this.addChild(flyComp);

        cc.tween(flyComp)
            .to(0.5, { y: top + comp.y + flyComp.height / 2 })
            .call(() => {
                flyComp.removeFromParent();

                this.itemRenderer(index, comp);
                this.canMove = true;
            })
            .start();
    }

    /** 消除 */
    onCheckAndMoveEnd(tempBoomList: cc.Vec2[]) {
        if (tempBoomList.length > 0) {
            for (let f in tempBoomList) {
                const foo = tempBoomList[f];
                for (let m in foo) {
                    const p = GameManager.inst.pointToIndex(foo[m]);
                    console.log('消除点', p);
                    const comp = this.list.getChildAt(p).asCom;

                    const left = this.list.x + this.list.margin.left;
                    const top = this.list.y + this.list.margin.top;

                    const lastUrl = comp.getChild('icon').asLoader.url;
                    let hideComp = fgui.UIPackage.createObject('game', 'ListRender').asCom;
                    hideComp.getChild('icon').asLoader.url = lastUrl;
                    hideComp.getChild('title').asTextField.text = '';
                    hideComp.x = left + comp.x + hideComp.width / 2;
                    hideComp.y = top + comp.y + hideComp.height / 2;
                    hideComp.setPivot(0.5, 0.5, true);
                    this.addChild(hideComp);

                    comp.getChild('icon').asLoader.url = '';
                    cc.tween(hideComp)
                        .sequence(
                            cc.tween().to(0.2, { scaleX: 1.2, scaleY: 1.2 }),
                            cc.tween().to(0.5, { scaleX: 0, scaleY: 0 }),
                        )
                        .call(() => {
                            hideComp.removeFromParent();
                            GameManager.inst.addScore(1);
                        })
                        .start();
                }
            }

            if (!GameManager.inst.neaton()) {
                setTimeout(() => {
                    GameManager.inst.createNewGrid();
                }, 300);
                this.canMove = true;
            }
        } else {
            setTimeout(() => {
                GameManager.inst.createNewGrid();
            }, 300);
            this.canMove = true;
        }
    }

    onNeaton(neatonList: any[]) {
        const left = this.list.x + this.list.margin.left;
        const top = this.list.y + this.list.margin.top;

        if (neatonList.length > 0) {
            for (let i = 0; i < neatonList.length; i++) {
                const neaton = neatonList[i];
                const newP = GameManager.inst.pointToIndex(neaton.new);
                const oldP = GameManager.inst.pointToIndex(neaton.old);

                this.move(newP, oldP);
                // console.log('整理点', newP, oldP);
            }
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