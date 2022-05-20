declare namespace k7.platform {
    interface IInitOpts {
        /**游戏名称 */
        gameName: string;
        /**读取tag标签 */
        tag: string;
    }
    /**平台适配器 */
    class PlatformAdapter {
        /**适配器唯一实例 */
        /**通用适配器实例 */
        private static adapter;
        /**运行环境是否为web，开发环境一般为web */
        private static _web;
        /**web环境适配器 */
        private static _dummy;
        /**用户授权等设置信息 */
        private static _switch;
        /**是否在前台 */
        private static _inShow;
        /**是否有网络 */
        private static _inNet;
        /**是否在前台 */
        static get inShow(): boolean;
        /**是否有网络 */
        static get inNet(): boolean;
        /**当前平台是否在审核状态 */
        static get switch(): boolean;
        /**
         * 平台适配器实例创建
         */
        static create(): void;
        /**
         * @desc 平台适配器初始化，初始化当前运行平台的适配器配置信息
         * @param path 平台配置路径，例如: "/aa/bb/"；域名默认为 https://download.qipai007.com 若开发环境中需要加载本地配置，则传入完整的url即可
         * @param config 适配器所需配置信息
         * @author yu.zhang
         */
        static init(path: string, config?: any): void;
        /**初始化具体的适配器 */
        private static initAdapter;
        /**web环境初始化虚拟适配器 */
        private static initDummy;
        private static initListener;
        /**
         * @desc 平台账户登录，使用此接口前，需要注册平台登录成功和失败的事件监听：
         * @desc 如果是web开发环境，则不能调用此方法
         * @param forceLogin 是否强制登录，如果强制登录，则在发现未授权时，拉起相关页面
         * @param style 授权组件触发按钮信息
         * @author yu.zhang
         */
        static login(forceLogin?: boolean, style?: ICommonStyle): void;
        /**查询用户授权设置信息 */
        static getUserSetting(param: TSettingParam): void;
        /**第三方平台账户信息 */
        static get platformUserInfo(): IUserInfo;
        /**当前是否可充值 */
        static get canRecharge(): boolean;
        /**
         * @desc 平台充值
         * @author yu.zhang
         */
        static recharge(data: any, callback: (res?: any) => void): void;
        /**
         * @desc 获取系统信息
         * @returns
         */
        static getSystemInfo(): ISystemInfo;
        /**
         * @desc 获取胶囊按钮信息
         * @returns
         */
        static getMenuButtonStyle(): IMenuButtonStyle;
        /**获取游戏启动url参数 */
        static getLaunchQuery(): object;
        /**获取微服务订单参数 */
        static getOrderParam(object: IOrderOpts): any;
        static getBalance(): Promise<number>;
        /**平台下单 */
        static order(params: any, onOrderFail: Function, onRechargeSuccess: Function, onPay: Function): void;
        static order(obj: IOrderParam): void;
        /**平台代付 */
        static behalf(params: any, complete: (ret: boolean) => void): void;
        /**当前操作系统是否Android */
        static get android(): boolean;
        /**当前操作系统是否IOS */
        static get ios(): boolean;
        /**当前是否web运行，非android和ios/ipad均视作web环境 */
        static get web(): boolean;
        private static osMatch;
        /**进入场景是否为收藏 */
        static get fromProfileScene(): boolean;
        /**进入场景是否为桌面快捷图标 */
        static get fromDesktopScene(): boolean;
        /**启动场景是否订阅消息推送 */
        static get fromSubscribeScene(): boolean;
        /**当前运行窗口是否具备操作菜单栏 */
        static get hasMenuBar(): boolean;
        /**当前平台适配器是否提供调起授权页面的UI组件 */
        static get hasAuthComp(): boolean;
        /**获取当前平台标识 */
        static get curAdapterTag(): string;
        /**获取订阅信息 */
        static get subscribe(): any;
        /**创建“游戏圈”组件 */
        static createGameClub(obj: IGameClubStyle, callback: () => void): void;
        static hideGameClub(): void;
        static destroyGameClub(): void;
        /**
         * 请求订阅
         * @param type 订阅类型：0-系统订阅，1-普通订阅
         * @param obj 订阅参数
         */
        static requestSubscribe(type: number, obj: {
            tmplIds: string[];
            success?: Function;
            fail?: Function;
        }): void;
        /**获取网络类型 */
        static getNetworkType(): string;
        /**
         * @desc 分享游戏
         * @param obj 分享卡片参数
         * @param callback 分享成功回调
         */
        static shareAppMessage(obj?: IShareAppParam, callback?: () => void): void;
        /**剪切板操作 */
        static setClipboardData(context: string): void;
        /**创建Banner广告 */
        static createBannerAd(pos: string, callback?: (res?: {
            width: number;
            height: number;
        }) => void, align?: "left" | "center" | "right"): void;
        /**隐藏Banner广告 */
        static hideBannerAd(scene?: string): void;
        /**创建原生模板广告 */
        static createCustomAd(pos: string, callback?: () => void): void;
        /**隐藏原生模板广告 */
        static hideCustomAd(scene?: string): void;
        /**创建视频广告 */
        static createVideoAd(pos: string, callback: (isEnded: boolean) => void): void;
        /**插屏广告 */
        static createInterstitialAd(scene: string, callback?: (res: boolean) => void): void;
        /**原生广告 */
        static createNativeAd(): void;
        /**是否可充值 */
        static get bRecharge(): boolean;
        /**客服*/
        static customService(): void;
        /**获取平台标识 */
        static getPlatform(): string;
        /**跳转其他游戏 */
        static jumpOtherGame(idx: number): void;
        static navigateTo(obj: {
            param: any;
            success: Function;
            fail: Function;
        }): void;
        static postMessageSubCanvas(commanded: any, txt?: string): void;
        /**短震动 */
        static vibrateShort(): void;
        /**长震动 */
        static vibrateLong(): void;
        /**获取平台配置 */
        static getConfig(): any;
        /**将指定url图片文件保存到系统相册 */
        static saveImageToPhotos(url: string): void;
        /**在新页面中全屏预览图片 */
        static previewImage(urls: string[], current?: string): void;
        static exitMiniProgram(): void;
        /**创建一个临时canvas对象，非当前游戏舞台canvas */
        static createCanvas(): any;
        /**创建一个类DOM image对象 */
        static createImage(): any;
        /**将canvas上绘制的图像存储为临时文件并返回文件路径 */
        static saveImageToTempFileSync(canvas: any, info: TTempImageInfo): string;
        /**显示系统loading页面 */
        static showSystemLoading(title: string): void;
        /**隐藏系统loading页面 */
        static hideSystemLoading(): void;
        /**显示系统级模态对话框 */
        static showSysModal(title: string, content: string, confirm: Function, cancel?: Function): void;
        /**显示系统级消息提示框 */
        static showSysToast(title: string, icon?: 'success' | 'loading' | 'none'): void;
        /**隐藏系统级消息提示框 */
        static hideSysToast(): void;
        /**
         * 0. getSetting 查看授权数据，若返回结果显示未授权，则需要申请授权，授权后，调用getUserInfo方可成功
         * 1. getUserInfo=>若成功，返回昵称、头像、性别等基本信息。前提是getSetting得到用户信息授权为true
         * 2. login=>若成功，返回code，提供给微服务server使用
         * 3. 登录后再次getUserInfo 则可以获得更多敏感数据
         */
        /**获取小程序启动参数*/
        static getLaunchOptionsSync(): ILaunchOpts;
        /**添加到桌面图标 */
        static addToDesktop(obj: {
            success?: Function;
            fail?: Function;
        }): void;
        /**添加到彩签：0-普通彩色标签，1-最近浏览彩签 */
        static addColorSign(type: number, obj: {
            query?: string;
            success?: Function;
            fail?: Function;
        }): void;
        /**向平台上报用户托管数据 */
        static setUserCloudStorage(obj: ICloudStorageData): void;
        /**反馈 */
        static showFeedBackBtn(obj: IFeedBackBtnOpts): void;
        /**隐藏反馈按钮 */
        static hideFeedBackBtn(): void;
    }
}
declare namespace k7 {
    /**平台适配器 */
    const PlatformAdapter: typeof platform.PlatformAdapter;
    /**平台能力配置 */
    interface PlatformAbility {
        /**推广 */
        promotion: boolean;
        /**客服 */
        customservice: boolean;
        /**订阅 */
        subscribe: boolean;
        /**收藏 */
        collect: boolean;
        /**分享 */
        sharable: boolean;
        /**组队 */
        team: boolean;
        /**包厢 */
        boxes: boolean;
        /**自定义分享 */
        customshare: boolean;
        /**每日礼包 */
        dailygift: boolean;
        /**彩签 */
        colorsign: boolean;
        /**代付 */
        behalf: boolean;
    }
}
declare namespace k7.platform {
    /**
     * @desc 平台API适配器接口，所有平台适配器必须实现此接口的所有方法
     * @author yu.zhang
     */
    interface IPlatformAdapter {
        /**适配器初始化，获取配置，启动信息，设备信息，注册各类事件监听等 */
        init(config?: any): void;
        /**获取系统信息 */
        getSystemInfo(): ISystemInfo;
        /**获取小游戏菜单按钮尺寸信息 */
        getMenuButtonStyle(): IMenuButtonStyle;
        /**获取平台账户的授权、订阅等信息. 权限包括用户名，定位，保存到相册，摄像头等 */
        getSetting(param: TSettingParam): void;
        /**跳转到平台授权页或准备好授权页入口 */
        gotoAuthorizePage(callback: (info: TPlatformUserInfo) => void): void;
        /**执行适配器的登录接口，包括获取用户信息后，等待微服务验证成功的全部流程，并最终调用callback，参数为登录是否成功标志 */
        login(callback: (success: boolean) => void): void;
        login1(forceLogin?: boolean, style?: ICommonStyle): void;
        /**平台下单 */
        order(params: any, onOrderFail?: Function, onRechargeSuccess?: Function, onPay?: Function): void;
        order(obj: IOrderParam): void;
        /**平台代付 */
        behalf(params: any, complete: (ret: boolean) => void): void;
        /**平台支付 */
        recharge(data: any, callback: (res?: any) => void): void;
        /**设置系统剪贴板的内容 */
        setClipboardData(context: string): void;
        /**分享游戏数据 */
        shareAppMessage(obj?: {
            query?: string;
            shareInfo?: TShareInfo;
        }, callback?: Function): void;
        /**创建Banner广告 */
        createBannerAd(pos?: string, callback?: Function, align?: string): void;
        /**隐藏Banner广告 */
        hideBannerAd(scene?: string): void;
        /**创建原生模板广告 */
        createCustomAd(pos?: string, callback?: Function): void;
        /**隐藏原生模板广告 */
        hideCustomAd(scene?: string): void;
        createNaviteAd(): void;
        /**创建视频广告 */
        createVideoAd(pos: string, callback: (isEnded: boolean) => void): void;
        /**插屏广告 */
        createInterstitialAd(pos?: string, callback?: (ret: boolean) => void): void;
        /**打开客户服务对话窗口 */
        customService(): void;
        /**
         * 跳转至其他游戏
         * @param index 配置中的目标游戏索引值
         */
        jumpToGame(index: number): void;
        /**跳转至其他游戏 */
        navigateTo(obj: {
            param: any;
            success: Function;
            fail: Function;
        }): void;
        /**短震动（约15ms） */
        vibrateShort(object?: {
            success?: Function;
            fail?: Function;
            complete?: Function;
        }): void;
        /**长震动（约400ms） */
        vibrateLong(object?: {
            success?: Function;
            fail?: Function;
            complete?: Function;
        }): void;
        /**保存图片到系统相册，调用之前需要用户授权。 */
        saveImageToPhotosAlbum(object: {
            /**图片文件路径，可以是临时文件路径或永久文件路径，不支持网络图片路径。 */
            filePath: string;
            /**接口调用成功的回调函数。 */
            success?: Function;
            /**接口调用失败的回调函数。 */
            fail?: Function;
            /**接口调用结束的回调函数（调用成功、失败都会执行）。 */
            complete?: Function;
        }): void;
        /**在新页面中全屏预览图片 */
        previewImage(urls: string[], current?: string): void;
        /**创建一个离屏canvas画布对象 */
        createCanvas(): HTMLCanvasElement;
        /**创建一个image元素对象 */
        createImage(): HTMLImageElement;
        /**将canvas上绘制的图像存储为临时文件并返回文件路径 */
        saveImageToTempFileSync(canvas: any, info: TTempImageInfo): string;
        /**显示 loading 提示框 */
        showLoading(object: {
            title: string;
            mask?: boolean;
            success?: Function;
            fail?: Function;
        }): void;
        /**隐藏loading提示框。 */
        hideLoading(object?: {
            success?: Function;
            fail?: Function;
        }): void;
        /**显示系统级模态对话框 */
        showSysModal(object: {
            title: string;
            content: string;
            confirm: Function;
            cancel?: Function;
        }): void;
        /**显示系统级消息提示框 */
        showSysToast(object: {
            title: string;
            icon?: 'success' | 'loading' | 'none';
        }): void;
        /**隐藏系统级消息提示框 */
        hideSysToast(): void;
        /**生成符合当前平台支付接口要求的订单参数 */
        getOrderParam(object: IOrderOpts): any;
        /**
         *
         * @param object
         */
        requestSubscribe(object: {
            /**订阅类型：0-系统订阅，1-普通订阅 */
            type: number;
            params: any;
        }): void;
        /**创建“游戏圈”组件 */
        createGameClub(obj: IGameClubStyle, callback: () => void): void;
        /**隐藏“游戏圈”组件 */
        hideGameClub(): void;
        /**删除“游戏圈”组件 */
        destroyGameClub(): void;
        /**添加到桌面 */
        addToDesktop(obj: {
            success?: Function;
            fail?: Function;
        }): void;
        /**添加彩色标签: 0-普通彩色标签，1-最近浏览彩签 */
        addColorSign(type: number, obj: {
            query?: string;
            success?: Function;
            fail?: Function;
        }): void;
        /**上报排行数据 */
        setUserCloudStorage(obj: {
            KVDataList: {
                key: string;
                value: string;
            }[];
            success?: Function;
            fail?: Function;
            complete?: Function;
        }): void;
        /**退出游戏 */
        exitGame(): void;
        /**反馈 */
        showFeedBackBtn(opt: IFeedBackBtnOpts): void;
        hideFeedBackBtn(): void;
        /**获取第三方货币余额 */
        getBalance(): Promise<number>;
        /**平台标签，获取对应的配置信息，取值范围有 wx, huawei, oppo, vivo, xiaomi 等 */
        tag: string;
        /**是否提供广告服务 */
        adService: boolean;
        /**游戏启动参数 */
        launchQuery: object;
        /**获取当前适配器配置数据 */
        config: any;
        /**设备系统信息 */
        systemInfo: TSystemInfo;
        /**平台用户信息 */
        userInfo: IUserInfo;
        /**入口："收藏"或"最近使用" */
        profile: boolean;
        /**入口："桌面" */
        desktop: boolean;
        /**入口："订阅消息" */
        subsmsg: boolean;
        /**是否具有操作菜单栏 */
        hasMenuBar: boolean;
        /**是否具备调起授权UI组件 */
        hasAuthComp: boolean;
        /**当前网络类型 */
        networkType: string;
        /**游戏启动数据 */
        launchOptions: ILaunchOpts;
        /**订阅信息 */
        subscribe: any;
        /**当前是否可以充值 */
        bRecharge: boolean;
    }
    /**请求平台账户授权设置时的参数 */
    type TSettingParam = {
        success: (res: TSettingInfo) => void;
        fail: (err: any) => void;
        complete?: (res: any) => void;
        withSubscriptions?: boolean;
    };
    /**请求平台账户设置成功时，success回调函数的参数 */
    type TSettingInfo = {
        authSetting: TAuthSetting;
        subscribSetting?: TSubscribeSetting;
    };
    /**用户订阅授权信息对象 */
    type TSubscribeSetting = {
        mainSwitch: boolean;
        itemSettings: any;
    };
    /**用户授权数据对象 */
    type TAuthSetting = {
        /**账户信息 */
        userInfo: boolean;
        userLocation: boolean;
        run: boolean;
        writePhotosAlbum: boolean;
    };
    /**登录所需参数 */
    type TLoginParam = {
        success: (info: TPlatformUserInfo) => void;
        fail?: (err: any) => void;
        complete?: (res: any) => {};
    };
    /**登录成功回调参数 */
    type TLoginInfo = {};
    type TPlatformUserInfo = {
        allow: boolean;
        name: string;
        id?: string;
        avatar?: string;
        gender?: number;
        level?: number;
        country?: string;
        province?: string;
        city?: string;
        language?: string;
        /**华为鉴权标志 */
        auth?: number;
        sign?: string;
        /**时间戳，华为根据auth值使用 */
        ts?: string;
        rawData?: string;
        encryptedData?: string;
        iv?: string;
    };
    /**设备信息，型号，操作系统，品牌等 */
    type TSystemInfo = {
        /**手机品牌。 */
        brand: string;
        /**手机型号。 */
        model: string;
        /**设备像素比。 */
        pixelRatio: number;
        /**屏幕宽度。 */
        screenWidth: number;
        /**屏幕高度。 */
        screenHeight: number;
        /**可使用窗口宽度。 */
        windowWidth: number;
        /**可使用窗口高度。 */
        windowHeight: number;
        /**系统语言。 */
        language: number;
        /**操作系统版本。 */
        system: string;
        /**客户端平台。 */
        platform: string;
        /**渲染引擎版本号。 */
        COREVersion?: string;
        /**客户端基础库版本 */
        SDKVersion?: string;
        /**基础运行库版本。微信/快应用中心 */
        version: string;
        /**状态栏高度，以屏幕的实际分辨率为单位。 */
        statusBarHeight: number;
    };
    /**游戏分享所需信息 */
    type TShareInfo = {
        title: string;
        summary?: string;
        imageUrl: string;
        targetUrl?: string;
    };
    type TTempImageInfo = {
        x: number;
        y: number;
        w: number;
        h: number;
        dw: number;
        dh: number;
    };
}
declare namespace k7.platform {
    /**
     * @desc 发布平台适配器实例工厂，根据当前运行平台信息，创建对应的平台API适配器
     * @author yu.zhang
     * @date 4/15/20
     */
    class PlatformAdapterFactory {
        /**
         * @returns {IPlatformAdapter} adapter 如果无法获取平台信息，返回null
         */
        static createAdapter(): IPlatformAdapter;
        private static getBrowserAdapter;
    }
}
declare namespace k7.platform {
    /**设备网络状态变更 */
    const EVT_PLATFORM_NETCHANGE = "platformNetChange";
    /**跳过登录授权阶段 */
    const EVT_PLATFORM_LOGIN_SKIP = "platformLoginSkip";
    /**第三方登录错误 */
    const EVT_PLATFORM_LOGIN_ERROR = "platformLoginError";
    /**第三方平台账号登录成功 */
    const EVT_PLATFORM_LOGIN_SUCCESS = "platformLoginSuccess";
    /**第三方平台账号登录失败 */
    const EVT_PLATFORM_LOGIN_FAIL = "platformLoginFail";
    /**第三方平台账号信息获取失败 */
    const EVT_GET_USER_INFO_FAIL = "ptmGetUserInfoFail";
    /**账号验证服务器登录成功（.net/yapi...） */
    const EVT_VERIFY_LOGIN_SUCCESS = "verifyLoginSuccess";
    /**账号验证服务器登录失败 (.net/yapi...) */
    const EVT_VERIFY_LOGIN_FAIL = "verifyLoginFail";
    /**平台充值失败 */
    const EVT_PLATFORM_PAY_FAIL = "platformPayFail";
    /**app处于系统前台显示 */
    const EVT_PLATFORM_ON_SHOW = "platformOnShow";
    /**app处于后台状态 */
    const EVT_PLATFORM_ON_HIDE = "platformOnHide";
    /**创建授权组件 */
    const EVT_PLATFORM_CREATE_AUTH_COMP = "crateAuthComp";
    /**获得授权结果 */
    const EVT_PLATFORM_ON_AUTH = "platformOnAuth";
    /**视频拉取失败 */
    const EVT_PLATFORM_VIDEO_ERROR = "platformVideoError";
    /**视频拉取成功 */
    const EVT_PLATFORM_VIDEO_LOAD = "platformVideoLoad";
    /**视频广告关闭 */
    const EVT_PLATFORM_VIDEO_CLOSE = "platformVideoClose";
    /**banner拉取失败 */
    const EVT_PLATFORM_BANNER_ERROR = "platformBnrError";
    /**banner拉取成功 */
    const EVT_PLATFORM_BANNER_LOAD = "platformBnrLoad";
    /**customAd拉取失败 */
    const EVT_PLATFORM_CUSTOMAD_ERROR = "platformCtmAdError";
    /**customAd拉取成功 */
    const EVT_PLATFORM_CUSTOMAD_LOAD = "platformCtmAdLoad";
    /**授权请求取消 */
    const EVT_GAME_AUTH_CANCEL = "gameAuthCancel";
    /**广告隐私策略意见 */
    const EVT_HW_AD_SET = "huaweiadset";
    const EVT_HW_SET_ADPRIVATE = "hwSetAdPriavte";
    /**快游戏授权事件消息 */
    const EVT_QUICKGAME_SETTING = "ptmqgsetting";
}
declare namespace k7.platform {
    /**
     * @desc 平台配置文件的加载模块
     * @desc 同一个平台适配器，可以分配给不同的游戏
     * @author yu.zhang
     */
    class PlatformConfigLoader {
        /**k7小游戏资源载入域名 */
        private static readonly DOMAIN;
        /**重试最大次数 */
        private static readonly MAX_RETRY_NUM;
        /**当前重试次数 */
        private static _numRetry;
        static load(path: string, platform: string): Promise<any>;
        /**
         * 整合资源目录和平台配置文件名称
         * @param path
         * @param tag
         * @returns {string} 配置文件绝对路径
         */
        private static _join;
    }
    /**平台配置文件下载完成事件 */
    const EVT_CONFIG_LOADED: string;
    /**平台配置文件下载失败事件 */
    const EVT_CONFIG_LOADFAIL: string;
}
declare namespace k7.platform {
    /**
     * 通用style结构定义
     */
    interface ICommonStyle {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
    }
    /**
     * 游戏登录信息
     */
    interface ILoginInfo {
        /**当登录类型为gCore.def.gDef.LOGIN_T_THIRD_PLATFORM时使用 */
        accessToken?: string;
        /**当登录类型为gCore.def.gDef.LOGIN_T_THIRD_PLATFORM时使用 */
        platformId?: number;
        oauthToken: string;
        /**口令过期时间，单位：毫秒 */
        oauthExpireTime: number;
        userId: number;
        /**当前渠道标识 */
        channel: string;
    }
    /**
     * 平台账号信息
     */
    interface IUserInfo {
        errMsg?: string;
        /**昵称 */
        nickName: string;
        /**头像地址 */
        avatarUrl: string;
    }
    /**
     * 小游戏启动参数，包括冷启动参数、切换回前台启动参数
     */
    interface ILaunchOpts {
        /** 启动小游戏的场景值*/
        scene: number;
        /** 启动小游戏的 query 参数	*/
        query: Object;
        /** 当前小游戏是否被显示在聊天顶部*/
        referrerInfo: any;
        /** shareTicket，详见获取更多转发信息*/
        shareTicket: string;
    }
    /**
     * 微服务订单基本参数选项
     */
    interface IOrderOpts {
        /**购买道具充值ID */
        rechargeId: number;
        /**是否自动兑换 */
        aotuExchage?: boolean;
        /**代充请求者ID，若非代充，则不填 */
        targetUserId?: number;
        /**换购道具ID */
        mallItemId?: number;
        /**购买抽奖结果组合ID */
        lotteryId?: number;
    }
    /**
     * 拉取微服务订单参数信息
     */
    interface IOrderParam {
        /**订单请求参数 */
        params: any;
        /**订单拉取失败回调 */
        order: {
            fail?: (code: number, msg: string) => void;
        };
        pay: {
            success: (payback: any) => void;
            fail: () => void;
            cancel?: () => void;
            complete: (ret: boolean) => void;
        };
    }
    /**
     * 用户托管数据结构定义
     */
    interface ICloudStorageData {
        KVDataList: {
            key: string;
            value: string;
        }[];
        success?: (res?: any) => void;
        fail?: (err?: any) => void;
        complete?: () => void;
    }
    /**
     * 玩家反馈按钮创建参数
     */
    interface IFeedBackBtnOpts {
        hide?: boolean;
        type: "image" | "text";
        /**图片url，type值为'image'时必填 */
        url?: string;
        /**按钮文本，type值为'image'时选填 */
        text?: string;
        top: number;
        left: number;
        width: number;
        height: number;
    }
    /**
     * 小程序菜单功能按钮信息
     */
    interface IMenuButtonStyle {
        /**按钮左上顶点x坐标，单位：px */
        left?: number;
        /**按钮左上顶点y坐标，单位：px */
        top?: number;
        /**按钮左下顶点y坐标，单位：px */
        bottom?: number;
        /**按钮右上顶点x坐标，单位：px */
        right?: number;
        /**按钮宽度，单位：px */
        width?: number;
        /**按钮高度，单位：px */
        height?: number;
    }
    /**
     * 设备及系统信息
     */
    interface ISystemInfo {
        windowWidth: number;
        windowHeight: number;
        safeArea: {
            top: number;
            left: number;
            bottom: number;
            right: number;
            width: number;
            height: number;
        };
        screenWidth: number;
        screenHeight: number;
    }
    interface IShareInfo {
        /**分享卡片标题 */
        title: string;
        /**分享卡片插图地址 */
        imageUrl: string;
        /**分享内容摘要 */
        summary?: string;
        /** */
        targetUrl?: string;
    }
    interface IShareAppParam {
        /**分享连接参数 */
        query?: string;
        /**分享内容信息 */
        shareInfo?: IShareInfo;
    }
    /**
     * 游戏圈按钮创建参数
     */
    interface IGameClubStyle {
        left?: number;
        top?: number;
        width?: number;
        height?: number;
    }
}
