
export interface RankSetting {
    openId?: string;            //自己的openid
    cvsWidth: number;           //排行榜宽度
    cvsHeight: number;          //排行榜高度
    itemWidth?: number;         //排行榜单个item宽度
    itemHeigth?: number;        //排行榜单个item高度
    interval?: number;          //主域刷新排行榜间隔
    Index?: number;             //邀请第几个好友
}

export interface ShareSetting {
    index: number;            //邀请第几个好友
    title: string;
    imageUrl: string;
}
//开放域绘制在那个界面上
export enum OpenDataContWinType {
    InviteWindow = "00",//邀请有礼
    FriendListWin = "01",
    TeamViewComp = "02",//2v2组队
}

interface RankItem {
    /**
     * @description 获取子域纹理，仅在调用showRank之后才能正确显示
     */
    getRankTexture: () => cc.SpriteFrame;
    getRankTexture2D: () => cc.Texture2D;
    /**
     * @description 显示排行榜
     * @param msg 排行榜获取数据对应的消息
     * @param renderer 渲染组件
     */
    showRank: (msg: string, setting: RankSetting, renderer: GLoader, type: OpenDataContWinType) => void;

    /**
     * @description 隐藏排行榜
     */
    hideRank: () => void;

}

export enum SubMsgAction {
    FetchFriendInterested = 'FetchFriendInterested',        //好友关卡排行
}

export enum SubValidKey {
    Score = 'score',
    Title = 'title',
    NowTime = "nowTime"
}

export class WxRankProducer implements RankItem {

    private static rankInstance: WxRankProducer;
    public static get rank() {
        if (!this.rankInstance) this.rankInstance = new WxRankProducer();
        return this.rankInstance;
    }

    public static uploadClounStorage(key: SubValidKey, value: any) {
        window['wx'] && window['wx'].setUserCloudStorage && window['wx'].setUserCloudStorage({
            KVDataList: [{
                key: key,
                value: value + ""
            }],
            success: function (args) {
                console.log("上传排行榜成功.", args);
            },
            fail: function (args) {
                console.log("上传排行榜失败.", args);
            }
        })
    }

    private _interval: number;                       //主域刷新排行榜间隔  
    private _openDataContext: any//wx.OpenDataContext;    //开放数据域（子域）
    private _timerId: number;
    private renderer: GLoader;
    private _rankTextureDic: any; //子域构成textureDic字典
    private _rankTexture2DDic: any;//子域构成texture2D字典
    /**当前渲染的那个界面的子域 */
    private _currentRendering: string



    constructor() {
        // this._rankTexture = new cc.SpriteFrame();
        // this._rankTexture2D = new cc.Texture2D();
        // this._rankTexture.setTexture(this._rankTexture2D);
        this._rankTextureDic = {
            "00": new cc.SpriteFrame(),
            "01": new cc.SpriteFrame(),
            "02": new cc.SpriteFrame(),
        }
        this._rankTexture2DDic = {
            "00": new cc.Texture2D(),
            "01": new cc.Texture2D(),
            "02": new cc.Texture2D(),
        }
        for (let key in this._rankTextureDic) {
            this._rankTextureDic[key].setTexture(this._rankTexture2DDic[key]);

        }
        this._currentRendering = "";
        if (window['wx']) this._openDataContext = window["wx"].getOpenDataContext();
    }

    //设置子域canvas大小 该步骤无法在子域进行，canvas宽高在子域readonly
    private resizeSharedCanvas(width: number, height: number) {
        if (!this._openDataContext) return;
        let sharedCanvas = this._openDataContext.canvas;
        sharedCanvas.width = width;
        sharedCanvas.height = height;
    }

    //刷新子域canvas
    private updateRank() {
        if (!this._openDataContext) return;
        this.getRankTexture2D() && this.getRankTexture2D().initWithElement(this._openDataContext.canvas);
        this.renderer.texture = this.getRankTexture();
    }

    /**
     * @description 获取子域纹理，仅在调用showRank之后才能正确获取
     */
    public getRankTexture(): cc.SpriteFrame {
        if (this._currentRendering == "") {
            return null;
        } else {
            return this._rankTextureDic[this._currentRendering];
        }

    }

    public getRankTexture2D(): cc.Texture2D {
        if (this._currentRendering == "") {
            return null;
        } else {
            return this._rankTexture2DDic[this._currentRendering];
        }
    }
    /**
     * @description 显示排行榜
     * @param msg 排行榜获取数据对应的消息
     * @param setting 排行榜渲染参数
     * @param renderer 渲染组件
     */
    public showRank(msg: string, setting: RankSetting, renderer: GLoader, type: OpenDataContWinType) {
        if (!this._openDataContext) return;
        this._currentRendering = type;
        this._interval = setting.interval ? setting.interval : 300;
        this.resizeSharedCanvas(setting.cvsWidth, setting.cvsHeight);

        this._openDataContext.postMessage({
            action: msg,
            setting: setting
        });

        this.renderer = renderer;
        this.renderer.texture = this.getRankTexture();
        this.updateRank();




        if (this._timerId) {
            clearInterval(this._timerId);
        }
        this._timerId = setInterval(() => {
            this.updateRank();
        }, this._interval)
    }

    public shareToFriend(msg: string, setting: ShareSetting) {
        this._openDataContext.postMessage({
            action: msg,
            setting: setting,
        });
    }

    public updateInvited(msg: string, setting: RankSetting) {
        this._openDataContext.postMessage({
            action: msg,
            setting: setting,
        });
    }


    /**
     * @description 隐藏排行榜
     */
    public hideRank() {
        if (this._timerId) {
            clearInterval(this._timerId);
        }
    }

}