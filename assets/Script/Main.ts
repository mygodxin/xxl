import { ResManager } from "./manager/ResManager";
import { GameScene } from "./view/scene/GameScene";
import { StartScene } from "./view/scene/StartScene";

const { ccclass } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    private static FRAME_RATE: number = 60;

    protected onLoad(): void {
        cc.game.setFrameRate(Main.FRAME_RATE);
        // cc.macro.DOWNLOAD_MAX_CONCURRENT = 2;
        fgui.UIConfig.modalLayerColor = cc.color(0, 0, 0, 128);
        fgui.UIConfig.globalModalWaiting = 'ui://5hq6g0n199g922';
        k7.AppWindow.configLoadingWaiting = 'ui://5hq6g0n1flox3i';
        fgui.UIConfig.bringWindowToFrontOnClick = false;
        fgui.addLoadHandler();
        fgui.GRoot.create();
        k7.fairyUrlLocalPrefix = 'fui/';
        k7.fairyUrlRemotePrefix = 'fui/';
        k7.PlatformAdapter.create();
        // fgui.UIPackage.branch = GameDef.tag;
        mvc.on(k7.EVT_SourceLoader_CompleteEvent, this, this.onLoaderComplete);
        ResManager.inst.init();
    }

    protected start(): void {
    }

    private onLoaderComplete(res: k7.ASourceLoader) {
        if (res.fileName == 'end')
            k7.AppScene.show(StartScene);
    }
}
