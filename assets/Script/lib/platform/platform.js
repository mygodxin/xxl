window.k7 = window.k7 || {};

(function (k7) {
    var platform;
    (function (platform) {
        /**平台适配器 */
        class PlatformAdapter {
            /**是否在前台 */
            static get inShow() { return this._inShow; }
            /**是否有网络 */
            static get inNet() { return this._inNet; }
            /**当前平台是否在审核状态 */
            static get switch() { return this._switch; }
            /**
             * 平台适配器实例创建
             */
            static create() {
                if (!!this.adapter) {
                    return;
                }
                let adp = platform.PlatformAdapterFactory.createAdapter();
                if (!adp) {
                    this._dummy = {};
                    return;
                }
                this._web = false;
                this.adapter = adp;
                this.adapter.init();
                this.initListener();
            }
            /**
             * @desc 平台适配器初始化，初始化当前运行平台的适配器配置信息
             * @param path 平台配置路径，例如: "/aa/bb/"；域名默认为 https://download.qipai007.com 若开发环境中需要加载本地配置，则传入完整的url即可
             * @param config 适配器所需配置信息
             * @author yu.zhang
             */
            static init(path, config) {
                if (this.web) {
                    this.initDummy(path, config);
                }
                else {
                    this.initAdapter(path, config);
                }
            }
            /**初始化具体的适配器 */
            static initAdapter(path, config) {
                const adp = this.adapter;
                if (!adp)
                    return;
                if (!!config) {
                    adp.config = config || {};
                }
                else {
                    platform.PlatformConfigLoader.load(path, adp.tag)
                        .then((res) => {
                        this._switch = res.switch;
                        delete res.switch;
                        adp.config = res;
                        mvc.send(k7.platform.EVT_CONFIG_LOADED);
                    })
                        .catch((obj) => {
                        mvc.send(k7.platform.EVT_CONFIG_LOADFAIL, obj);
                    });
                }
            }
            /**web环境初始化虚拟适配器 */
            static initDummy(path, config) {
                if (!path) {
                    this._dummy.config = config || {};
                }
                else {
                    platform.PlatformConfigLoader.load(path, null)
                        .then((res) => {
                        this._dummy.config = res;
                        mvc.send(k7.platform.EVT_CONFIG_LOADED);
                    })
                        .catch((obj) => {
                        console.error("[init->dummy] 平台配置加载失败，配置文件地址：", obj.url);
                    });
                }
            }
            static initListener() {
                mvc.on(k7.platform.EVT_PLATFORM_ON_SHOW, this, () => {
                    this._inShow = true;
                });
                mvc.on(k7.platform.EVT_PLATFORM_ON_HIDE, this, () => {
                    this._inShow = false;
                });
                mvc.on(k7.platform.EVT_PLATFORM_NETCHANGE, this, (flag) => {
                    this._inNet = flag;
                });
            }
            /**
             * @desc 平台账户登录，使用此接口前，需要注册平台登录成功和失败的事件监听：
             * @desc 如果是web开发环境，则不能调用此方法
             * @param forceLogin 是否强制登录，如果强制登录，则在发现未授权时，拉起相关页面
             * @param style 授权组件触发按钮信息
             * @author yu.zhang
             */
            static login(forceLogin, style) {
                if (this.web)
                    return;
                this.adapter.login1(forceLogin, style);
            }
            /**查询用户授权设置信息 */
            static getUserSetting(param) {
                if (this.web)
                    return;
                this.adapter.getSetting(param);
            }
            /**第三方平台账户信息 */
            static get platformUserInfo() {
                if (this.web)
                    return { errMsg: "getUserInfo:ok", nickName: "", avatarUrl: "" };
                return this.adapter.userInfo /*  || {errMsg: "getUserInfo:not ok"} */;
            }
            /**当前是否可充值 */
            static get canRecharge() {
                if (this.web)
                    return false;
                return this.android;
            }
            /**
             * @desc 平台充值
             * @author yu.zhang
             */
            static recharge(data, callback) {
                if (this.web)
                    return;
                this.adapter.recharge(data, callback);
            }
            /**
             * @desc 获取系统信息
             * @returns
             */
            static getSystemInfo() {
                if (this.web) {
                    return;
                }
                return this.adapter.getSystemInfo();
            }
            /**
             * @desc 获取胶囊按钮信息
             * @returns
             */
            static getMenuButtonStyle() {
                if (this.web) {
                    return;
                }
                return this.adapter.getMenuButtonStyle();
            }
            /**获取游戏启动url参数 */
            static getLaunchQuery() {
                if (this.web)
                    return null;
                return this.adapter.launchQuery;
            }
            /**获取微服务订单参数 */
            static getOrderParam(object) {
                if (this.web)
                    return {};
                return this.adapter.getOrderParam(object);
            }
            static getBalance() {
                if (this.web) {
                    return new Promise((res, rej) => {
                        res(0);
                    });
                }
                return this.adapter.getBalance();
            }
            static order() {
                if (this.web || !arguments)
                    return;
                const args = arguments;
                if (args.length > 1) {
                    this.adapter.order(args[0], args[1], args[2], args[3]);
                }
                else {
                    this.adapter.order(args[0]);
                }
            }
            /**平台代付 */
            static behalf(params, complete) {
                if (this.web)
                    return;
                this.adapter.behalf(params, complete);
            }
            /**当前操作系统是否Android */
            static get android() {
                return this.osMatch(/android/ig);
            }
            /**当前操作系统是否IOS */
            static get ios() {
                return this.osMatch(/ios|ipad/ig);
            }
            /**当前是否web运行，非android和ios/ipad均视作web环境 */
            static get web() {
                return this._web;
            }
            static osMatch(reg) {
                if (this.web) {
                    return false;
                }
                let device = this.adapter.systemInfo;
                return !!device.platform.match(reg);
            }
            /**进入场景是否为收藏 */
            static get fromProfileScene() {
                return !this.web && this.adapter.profile;
            }
            /**进入场景是否为桌面快捷图标 */
            static get fromDesktopScene() {
                return !this.web && this.adapter.desktop;
            }
            /**启动场景是否订阅消息推送 */
            static get fromSubscribeScene() {
                return !this.web && this.adapter.subsmsg;
            }
            /**当前运行窗口是否具备操作菜单栏 */
            static get hasMenuBar() {
                return !this.web && this.adapter.hasMenuBar;
            }
            /**当前平台适配器是否提供调起授权页面的UI组件 */
            static get hasAuthComp() {
                return !this.web && this.adapter.hasAuthComp;
            }
            /**获取当前平台标识 */
            static get curAdapterTag() {
                if (this.web)
                    return "";
                return this.adapter.tag;
            }
            /**获取订阅信息 */
            static get subscribe() {
                if (this.web)
                    return null;
                return this.adapter.subscribe;
            }
            /**创建“游戏圈”组件 */
            static createGameClub(obj, callback) {
                if (this.web)
                    return;
                this.adapter.createGameClub(obj, callback);
            }
            static hideGameClub() {
                if (this.web)
                    return;
                this.adapter.hideGameClub();
            }
            static destroyGameClub() {
                if (this.web)
                    return;
                this.adapter.destroyGameClub();
            }
            /**
             * 请求订阅
             * @param type 订阅类型：0-系统订阅，1-普通订阅
             * @param obj 订阅参数
             */
            static requestSubscribe(type, obj) {
                if (this.web) {
                    console.log("[INFO] 当前平台不支持接口:requestSubscribeSystemMessage");
                    return;
                }
                this.adapter.requestSubscribe({ type, params: obj });
            }
            /**获取网络类型 */
            static getNetworkType() {
                if (this.web) {
                    return "";
                }
                return this.adapter.networkType;
            }
            /**
             * @desc 分享游戏
             * @param obj 分享卡片参数
             * @param callback 分享成功回调
             */
            static shareAppMessage(obj, callback) {
                if (this.web) {
                    console.log('平台未适配 shareAppMessage');
                    callback && callback();
                    return;
                }
                this.adapter.shareAppMessage(obj, callback);
            }
            /**剪切板操作 */
            static setClipboardData(context) {
                if (this.web) {
                    console.log('平台未适配setClipboardData');
                    return;
                }
                this.adapter.setClipboardData(context);
            }
            /**创建Banner广告 */
            static createBannerAd(pos, callback, align) {
                if (this.web) {
                    console.log('平台未适配createBannerAd');
                    callback && callback();
                    return;
                }
                this.adapter.createBannerAd(pos, callback, align);
            }
            /**隐藏Banner广告 */
            static hideBannerAd(scene) {
                if (this.web) {
                    console.log('平台未适配hideBannerAd');
                    return;
                }
                this.adapter.hideBannerAd(scene);
            }
            /**创建原生模板广告 */
            static createCustomAd(pos, callback) {
                if (this.web) {
                    console.log('平台未适配createCustomAd');
                    callback && callback();
                    return;
                }
                this.adapter.createCustomAd(pos, callback);
            }
            /**隐藏原生模板广告 */
            static hideCustomAd(scene) {
                if (this.web) {
                    console.log('平台未适配hideCustomAd');
                    return;
                }
                this.adapter.hideCustomAd(scene);
            }
            /**创建视频广告 */
            static createVideoAd(pos, callback) {
                if (this.web) {
                    console.log('平台未适配createVideoAd');
                    callback && callback(true);
                    return;
                }
                this.adapter.createVideoAd(pos, callback);
            }
            /**插屏广告 */
            static createInterstitialAd(scene, callback) {
                if (this.web) {
                    console.log('平台未适配 createInterstitialAd');
                    callback && callback(false);
                    return;
                }
                this.adapter.createInterstitialAd(scene, callback);
            }
            /**原生广告 */
            static createNativeAd() {
                if (this.web) {
                    console.log('平台未适配 createNativeAd');
                    return;
                }
                this.adapter.createNaviteAd();
            }
            /**是否可充值 */
            static get bRecharge() {
                if (this.web)
                    return true;
                // return this.android;
                return this.adapter.bRecharge;
            }
            /**客服*/
            static customService() {
                if (this.web) {
                    console.log('平台未适配customService');
                    return;
                }
                this.adapter.customService();
            }
            /**获取平台标识 */
            static getPlatform() {
                if (this.web) {
                    console.log('平台未适配getPlatform');
                    return "";
                }
                return this.adapter.tag;
            }
            /**跳转其他游戏 */
            static jumpOtherGame(idx) {
                if (this.web) {
                    console.log('平台未适配getPlatform');
                    return;
                }
                this.adapter.jumpToGame(idx);
            }
            static navigateTo(obj) {
                if (this.web) {
                    console.log("[INFO] web环境不支持navigate");
                    return;
                }
                this.adapter.navigateTo(obj);
            }
            static postMessageSubCanvas(commanded, txt) {
                if (this.web)
                    return;
                this.adapter["postMessageSubCanvas"](commanded, txt);
            }
            /**短震动 */
            static vibrateShort() {
                if (this.web)
                    return;
                this.adapter.vibrateShort();
            }
            /**长震动 */
            static vibrateLong() {
                if (this.web) {
                    console.log('平台未适配 vibrateLong');
                    return;
                }
                this.adapter.vibrateLong();
            }
            /**获取平台配置 */
            static getConfig() {
                if (this.web) {
                    return this._dummy.config;
                }
                return this.adapter.config;
            }
            /**将指定url图片文件保存到系统相册 */
            static saveImageToPhotos(url) {
                if (this.web) {
                    console.log('平台未适配saveImage');
                    return;
                }
                this.adapter.saveImageToPhotosAlbum({ filePath: url });
            }
            /**在新页面中全屏预览图片 */
            static previewImage(urls, current) {
                if (this.web) {
                    console.log('平台未适配previewImage');
                    return;
                }
                this.adapter.previewImage(urls, current);
            }
            static exitMiniProgram() {
                if (this.web)
                    return;
                this.adapter.exitGame();
            }
            /**创建一个临时canvas对象，非当前游戏舞台canvas */
            static createCanvas() {
                if (this.web) {
                    return new HTMLCanvasElement();
                }
                return this.adapter.createCanvas();
            }
            /**创建一个类DOM image对象 */
            static createImage() {
                if (this.web)
                    return new HTMLImageElement();
                return this.adapter.createImage();
            }
            /**将canvas上绘制的图像存储为临时文件并返回文件路径 */
            static saveImageToTempFileSync(canvas, info) {
                if (this.web)
                    return "";
                return this.adapter.saveImageToTempFileSync(canvas, info);
            }
            /**显示系统loading页面 */
            static showSystemLoading(title) {
                if (this.web)
                    return;
                this.adapter.showLoading({ title });
            }
            /**隐藏系统loading页面 */
            static hideSystemLoading() {
                if (this.web)
                    return;
                this.adapter.hideLoading();
            }
            /**显示系统级模态对话框 */
            static showSysModal(title, content, confirm, cancel) {
                if (this.web)
                    return;
                this.adapter.showSysModal({ title, content, confirm, cancel });
            }
            /**显示系统级消息提示框 */
            static showSysToast(title, icon) {
                if (this.web)
                    return;
                this.adapter.showSysToast({ title, icon });
            }
            /**隐藏系统级消息提示框 */
            static hideSysToast() {
                if (this.web)
                    return;
                this.adapter.hideSysToast();
            }
            /**
             * 0. getSetting 查看授权数据，若返回结果显示未授权，则需要申请授权，授权后，调用getUserInfo方可成功
             * 1. getUserInfo=>若成功，返回昵称、头像、性别等基本信息。前提是getSetting得到用户信息授权为true
             * 2. login=>若成功，返回code，提供给微服务server使用
             * 3. 登录后再次getUserInfo 则可以获得更多敏感数据
             */
            /**获取小程序启动参数*/
            static getLaunchOptionsSync() {
                if (this.web) {
                    return { query: {}, scene: 0, referrerInfo: null, shareTicket: '0' };
                }
                return this.adapter.launchOptions;
            }
            /**添加到桌面图标 */
            static addToDesktop(obj) {
                if (this.web) {
                    return;
                }
                this.adapter.addToDesktop(obj);
            }
            /**添加到彩签：0-普通彩色标签，1-最近浏览彩签 */
            static addColorSign(type, obj) {
                if (this.web) {
                    return;
                }
                this.adapter.addColorSign(type, obj);
            }
            /**向平台上报用户托管数据 */
            static setUserCloudStorage(obj) {
                if (this.web)
                    return;
                this.adapter.setUserCloudStorage(obj);
            }
            /**反馈 */
            static showFeedBackBtn(obj) {
                if (this.web)
                    return;
                this.adapter.showFeedBackBtn(obj);
            }
            /**隐藏反馈按钮 */
            static hideFeedBackBtn() {
                if (this.web)
                    return;
                this.adapter.hideFeedBackBtn();
            }
        }
        /**运行环境是否为web，开发环境一般为web */
        PlatformAdapter._web = true;
        /**用户授权等设置信息 */
        // private static adapterSetting: TSettingInfo = null;
        PlatformAdapter._switch = false;
        /**是否在前台 */
        PlatformAdapter._inShow = true;
        /**是否有网络 */
        PlatformAdapter._inNet = true;
        platform.PlatformAdapter = PlatformAdapter;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
(function (k7) {
    /**平台适配器 */
    k7.PlatformAdapter = k7.platform.PlatformAdapter;
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        /**
         * @desc 发布平台适配器实例工厂，根据当前运行平台信息，创建对应的平台API适配器
         * @author yu.zhang
         * @date 4/15/20
         */
        class PlatformAdapterFactory {
            /**
             * @returns {IPlatformAdapter} adapter 如果无法获取平台信息，返回null
             */
            static createAdapter() {
                let adapter; // IPlatformAdapter;
                // let ctor: Function;
                switch (cc.sys.platform) //此处严格意义上应当隔离引擎的直接依赖
                 {
                    case cc.sys.WECHAT_GAME:
                        if (window["qq"] && !!k7.platform.QQAdapter) {
                            adapter = new k7.platform.QQAdapter();
                        }
                        else if (!!k7.platform.WxAdapter) {
                            adapter = new k7.platform.WxAdapter();
                        }
                        break;
                    case cc.sys.HUAWEI_GAME:
                        if (!!k7.platform.HuaweiAdapter) {
                            adapter = new k7.platform.HuaweiAdapter();
                        }
                        break;
                    case cc.sys.MOBILE_BROWSER: //其他内嵌webview的H5游戏平台
                        adapter = this.getBrowserAdapter();
                        break;
                    case cc.sys.OPPO_GAME:
                        adapter = new k7.platform.OppoAdapter();
                        break;
                }
                return adapter; // ctor() as IPlatformAdapter;
            }
            static getBrowserAdapter() {
                let adapter = null;
                if (window["$cgUnion"]) {
                    // return new ChiguaAdapter();
                }
                else if (!!window["uc"]) {
                    adapter = new k7.platform.UCAdapter();
                }
                return adapter;
            }
        }
        platform.PlatformAdapterFactory = PlatformAdapterFactory;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        /**设备网络状态变更 */
        platform.EVT_PLATFORM_NETCHANGE = "platformNetChange";
        /**跳过登录授权阶段 */
        platform.EVT_PLATFORM_LOGIN_SKIP = "platformLoginSkip";
        /**第三方登录错误 */
        platform.EVT_PLATFORM_LOGIN_ERROR = "platformLoginError";
        /**第三方平台账号登录成功 */
        platform.EVT_PLATFORM_LOGIN_SUCCESS = "platformLoginSuccess";
        /**第三方平台账号登录失败 */
        platform.EVT_PLATFORM_LOGIN_FAIL = "platformLoginFail";
        /**第三方平台账号信息获取失败 */
        platform.EVT_GET_USER_INFO_FAIL = "ptmGetUserInfoFail";
        /**账号验证服务器登录成功（.net/yapi...） */
        platform.EVT_VERIFY_LOGIN_SUCCESS = "verifyLoginSuccess";
        /**账号验证服务器登录失败 (.net/yapi...) */
        platform.EVT_VERIFY_LOGIN_FAIL = "verifyLoginFail";
        /**平台充值失败 */
        platform.EVT_PLATFORM_PAY_FAIL = 'platformPayFail';
        /**app处于系统前台显示 */
        platform.EVT_PLATFORM_ON_SHOW = "platformOnShow";
        /**app处于后台状态 */
        platform.EVT_PLATFORM_ON_HIDE = "platformOnHide";
        /**创建授权组件 */
        platform.EVT_PLATFORM_CREATE_AUTH_COMP = "crateAuthComp";
        /**获得授权结果 */
        platform.EVT_PLATFORM_ON_AUTH = "platformOnAuth";
        /**视频拉取失败 */
        platform.EVT_PLATFORM_VIDEO_ERROR = "platformVideoError";
        /**视频拉取成功 */
        platform.EVT_PLATFORM_VIDEO_LOAD = "platformVideoLoad";
        /**视频广告关闭 */
        platform.EVT_PLATFORM_VIDEO_CLOSE = "platformVideoClose";
        /**banner拉取失败 */
        platform.EVT_PLATFORM_BANNER_ERROR = "platformBnrError";
        /**banner拉取成功 */
        platform.EVT_PLATFORM_BANNER_LOAD = "platformBnrLoad";
        /**customAd拉取失败 */
        platform.EVT_PLATFORM_CUSTOMAD_ERROR = "platformCtmAdError";
        /**customAd拉取成功 */
        platform.EVT_PLATFORM_CUSTOMAD_LOAD = "platformCtmAdLoad";
        /**授权请求取消 */
        platform.EVT_GAME_AUTH_CANCEL = "gameAuthCancel";
        /**广告隐私策略意见 */
        platform.EVT_HW_AD_SET = "huaweiadset";
        platform.EVT_HW_SET_ADPRIVATE = "hwSetAdPriavte";
        /**快游戏授权事件消息 */
        platform.EVT_QUICKGAME_SETTING = "ptmqgsetting";
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform_1) {
        /**
         * @desc 平台配置文件的加载模块
         * @desc 同一个平台适配器，可以分配给不同的游戏
         * @author yu.zhang
         */
        class PlatformConfigLoader {
            static load(path, platform) {
                return new Promise((resolve, reject) => {
                    const url = this._join(path, platform);
                    cc.assetManager.loadRemote(url, cc.JsonAsset, (err, res) => {
                        if (!!err) {
                            if (this._numRetry < this.MAX_RETRY_NUM) {
                                this._numRetry++;
                                this.load(path, platform);
                            }
                            else {
                                this._numRetry = 0;
                                reject({ err, url });
                            }
                        }
                        else {
                            this._numRetry = 0;
                            resolve(res);
                        }
                    });
                });
            }
            /**
             * 整合资源目录和平台配置文件名称
             * @param path
             * @param tag
             * @returns {string} 配置文件绝对路径
             */
            static _join(path, tag) {
                if (path.match(/\.json/ig)) {
                    return `${path}?${Date.now()}`;
                }
                path = path.replace(/\\/g, "/");
                if (path[0] != "/")
                    path = "/" + path;
                if (path[path.length - 1] != "/")
                    path += "/";
                return this.DOMAIN + path + `${tag}.json?${Date.now()}`;
            }
        }
        /**k7小游戏资源载入域名 */
        PlatformConfigLoader.DOMAIN = "https://download.qipai007.com";
        /**重试最大次数 */
        PlatformConfigLoader.MAX_RETRY_NUM = 2;
        /**当前重试次数 */
        PlatformConfigLoader._numRetry = 0;
        platform_1.PlatformConfigLoader = PlatformConfigLoader;
        /**平台配置文件下载完成事件 */
        platform_1.EVT_CONFIG_LOADED = "pconfigloaded";
        /**平台配置文件下载失败事件 */
        platform_1.EVT_CONFIG_LOADFAIL = "pconfigloadfail";
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
// 平台适配器数据结构接口定义
