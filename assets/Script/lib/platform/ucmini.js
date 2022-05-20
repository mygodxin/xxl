window.k7 = window.k7 || {};

(function (k7) {
    var platform;
    (function (platform) {
        /**游戏启动场景值 */
        const SCENE = {
            PROFILE_PULL: 1001,
            PROFILE_FIND: 1089,
            DESKTOP: 1023,
            SUBSCRIBE: 1014
        };
        class UCAdapter {
            constructor() {
                /**登录码，每次执行uc.login返回的登录码均不同 */
                this.m_ucCode = "";
                this.m_userInfo = null;
                this.m_systemInfo = null;
                this.m_config = null;
                this.m_networkType = "";
                this.m_launchOptionsSync = null; // 获取小程序启动参数
                /**
                 * uc小游戏需要在微服务验证后方可请求授权，因此在mapi验证后，需要保留验证结果信息，
                 * 如果玩家拒绝授权，则不发送验证成功消息，对业务端而言，此时是未登录微服务状态。
                 */
                this.m_verifyInfo = null;
                /**请求uc浏览器登录状态次数 */
                this._reqLoginStatusTimes = 0;
            }
            get launchQuery() { return this.m_launchOptionsSync && this.m_launchOptionsSync.query; }
            get systemInfo() { return this.m_systemInfo; }
            get profile() { return this.sceneCheck(SCENE.PROFILE_FIND) || this.sceneCheck(SCENE.PROFILE_PULL); }
            get desktop() { return this.sceneCheck(SCENE.DESKTOP); }
            get subsmsg() { return false; }
            get hasMenuBar() { return true; }
            get hasAuthComp() { return true; }
            get networkType() { return this.m_networkType; }
            get tag() { return UCAdapter.PLATFORM_TAG; }
            get adService() { return true; }
            get config() { return this.m_config; }
            get userInfo() { return this.m_userInfo; }
            get launchOptions() { return this.m_launchOptionsSync; }
            get subscribe() { return; }
            set config(val) { this.m_config = val; }
            sceneCheck(scene) {
                if (!this.m_launchOptionsSync)
                    return false;
                // return this.m_launchOptionsSync.scene == scene;
            }
            /**初始化 */
            init(config) {
                this.m_bannerAdInfo = {};
                this.m_videoAdInfo = {};
                this.m_config = config || {};
                this.getLaunchOptions();
                uc.getSystemInfo({
                    success: (res) => {
                        this.m_systemInfo = res;
                    },
                    fail: (err) => {
                        console.error('[uc->adapter] get system info fail: ', err);
                    }
                });
                this.getNetworkType();
                mvc.on(k7.platform.EVT_GAME_AUTH_CANCEL, this, this.onAuthReqCancel);
                uc.onLaunch((res) => {
                    console.log("[uc->adapter] on launch: ", res);
                    this.m_launchOptionsSync = res;
                    mvc.send(k7.platform.EVT_PLATFORM_ON_SHOW, res);
                });
                uc.requestScreenOrientation({
                    orientaiton: 2,
                    success: () => {
                        console.log("[uc->adapter] 设置横屏成功");
                    },
                    fail: () => {
                        console.log("[uc->adapter] 设置横屏失败");
                    }
                });
                const _uc = cc.sys.BROWSER_TYPE_UC;
                cc.sys.BROWSER_TYPE_UC = "";
                setTimeout(() => {
                    cc.sys.BROWSER_TYPE_UC = _uc;
                }, 1500);
            }
            onAuthReqCancel() {
                // if(!this.btnUserInfo) return;
                // this.btnUserInfo.hide();
            }
            login1(forceLogin) {
                // 已获取过微服务验证
                const vInfo = this.m_verifyInfo;
                if (!!vInfo) {
                    // 授权未过期，再次获取userInfo，此过程若未授权，则拉起授权请求组件
                    if (vInfo.oauthExpireTime > Date.now()) {
                        this.getUCSetting(forceLogin);
                        return;
                    }
                    else {
                        // 微服务登录授权已过期
                        this.m_verifyInfo = null;
                    }
                }
                // 1.检查UC浏览器是否已经登录，而非是否使用UC账号登录小游戏
                const success = (data) => {
                    this._reqLoginStatusTimes = 0;
                    if (data.isLogin || forceLogin) {
                        this.doLogin(forceLogin);
                    }
                    else {
                        mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SKIP);
                    }
                };
                const fail = (err) => {
                    console.log("[uc->adapter] is login fail: ", err);
                    if (this._reqLoginStatusTimes < UCAdapter.MAX_RETRY) {
                        this._reqLoginStatusTimes++;
                        this.login1(forceLogin);
                    }
                    else {
                        this._reqLoginStatusTimes = 0;
                        uc.showModal({
                            title: "登录失败",
                            content: "获取登录状态异常，是否重新登录？",
                            cancelText: "退出游戏",
                            success: data => {
                                if (data.confirm) {
                                    this._reqLoginStatusTimes = 0;
                                    this.login1(forceLogin);
                                }
                                else if (data.cancel) {
                                    this.exitGame();
                                }
                            }
                        });
                    }
                };
                uc.isLogin({ success, fail });
            }
            /**若uc浏览器已登录，则返回code。若未登录，则先调起登录，成功登录后再返回code */
            doLogin(force) {
                let success = (res) => {
                    this.m_ucCode = res.code;
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.mapiLogin(force);
                };
                let fail = (err) => {
                    console.log("[uc->adapter] login fail: ", err);
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                };
                uc.login({ success, fail });
            }
            /**微服务验证登录 */
            mapiLogin(force) {
                let ucReq = new platform.UCLogin();
                ucReq.code = this.m_ucCode;
                ucReq.spm = "9.14496";
                ucReq.osTypeStr = this.systemInfo.platform.match(/android|windows/gi) ? "android" : "ios";
                let query = this.launchQuery;
                if (!!query && query.hasOwnProperty('shareCode')) {
                    ucReq.shareCode = query['shareCode'];
                    ucReq.inviteSchemeId = query['inviteSchemeId'];
                }
                ucReq.login((err, msg) => {
                    console.log("[uc->adapter] verify fail:", err, msg);
                    mvc.send(k7.platform.EVT_VERIFY_LOGIN_FAIL, err);
                }, (data) => {
                    mapi.userid = data.user_id + "";
                    mapi.token = data.oauth_token;
                    const info = {
                        platformId: data.platform_id,
                        accessToken: data.access_token,
                        userId: data.user_id,
                        oauthToken: data.oauth_token,
                        oauthExpireTime: (new Date(data.oauth_token_expire)).getTime(),
                        channel: this.tag
                    };
                    this.m_verifyInfo = info;
                    this.getUCSetting(force);
                    // mvc.send(k7.platform.EVT_VERIFY_LOGIN_SUCCESS, info);
                });
            }
            /**
             * 拉取账号授权设置信息
             * uc的授权及其信息获取是建立在会话有效的基础上的，因此与微信小游戏不同的是，需要先执行微服务的验证流程，成功后，执行getSetting、authorize才能成功回调
             * @param force 是否强制要求授权
             */
            getUCSetting(force) {
                const success = (res) => {
                    if (res.userInfo) {
                        this.getUserInfo(null);
                    }
                    else if (force) {
                        this.gotoAuthorizePage();
                    }
                    else {
                        mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SKIP);
                    }
                };
                const fail = (err) => {
                    console.log("[uc->adapter] get setting fail: ", err);
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_ERROR);
                };
                uc.getSetting({ success, fail });
            }
            /**前往授权页 */
            gotoAuthorizePage(callback) {
                const success = (res) => {
                    // 同意授权
                    if (res.userInfo) {
                        this.getUserInfo(null);
                    }
                    else { // 拒绝授权
                        console.log("[uc->adapter] auth refused.");
                    }
                };
                const fail = (err) => {
                    console.log("[uc->adapter] auth fail: ", err);
                };
                uc.authorize({ scope: 'userInfo', success, fail });
            }
            /**拉取uc用户信息，若授权过，则可以获得敏感数据 */
            getUserInfo(callback) {
                const success = (res) => {
                    if (res) {
                        this.m_userInfo = res;
                        callback && callback(res);
                        mvc.send(k7.platform.EVT_VERIFY_LOGIN_SUCCESS, this.m_verifyInfo);
                    }
                };
                const fail = (res) => {
                    callback && callback(res);
                };
                uc.getUserInfo({ success, fail });
            }
            getSetting(param) { }
            /**
             * @desc 执行适配器的登录接口，获取用户敏感信息，交给yApi验证。
             * @param onLogin
             */
            login(onLogin) { }
            // private btnGameClub:uc.GameClubButton;
            createGameClub(obj, callback) { }
            hideGameClub() { }
            destroyGameClub() { }
            getSystemInfo() {
                return null;
            }
            getMenuButtonStyle() {
                return null;
            }
            /**获取平台配置 */
            getConfig() {
                return this.m_config;
            }
            /**获取小程序启动参数*/
            getLaunchOptions() {
                this.m_launchOptionsSync = uc.getLaunchOptionsSync();
                console.log("[uc->adapter] launch options: ", this.m_launchOptionsSync);
            }
            /**请求订阅 */
            requestSubscribe(obj) { }
            /**分享游戏 */
            shareAppMessage(obj, callback) {
                // var shareInfo = (obj && obj.shareInfo) || this.getRandomShare();
                // uc小游戏的分享功能依赖第三方社交app实现，因此受到分享内容安全性策略限制，无法自定义，只能使用uc提供的默认分享文本与图标
                uc.shareAppMessage({
                    title: "",
                    imageUrl: "",
                    query: (obj && obj.query) || "key=value",
                    success: () => {
                        callback && callback();
                    },
                    fail: (err) => {
                        // console.log("[uc->adapter] share fail: ", err);
                        uc.showToast({
                            content: Math.random() > 0.5 ? '请分享到群！' : "请分享到不同群聊"
                        });
                    }
                });
            }
            /**随机获取一条分享 */
            getRandomShare(shareId) {
                let shareCfg = this.m_config && this.m_config['share'];
                if (shareCfg && shareCfg.length) {
                    let idx = shareId ? shareId : Math.floor(Math.random() * shareCfg.length);
                    return shareCfg[idx];
                }
                return {
                    title: "",
                    imageUrl: ''
                };
            }
            /**监听网络状态变化事件 */
            getNetworkType() {
                // uc.getNetworkType({
                //     success:(res: {networkType: string})=> {
                //         this.m_networkType = res.networkType;
                //     }
                // })
            }
            /**剪切板操作 */
            setClipboardData(context) {
                // uc.setClipboardData({
                //     data: context,
                //     success: function (res) {
                //         uc.showModal({
                //             title: '提示',
                //             content: '复制成功',
                //             showCancel: false,
                //             success: function (res) {}
                //         });
                //     }
                // });
            }
            /**创建Banner广告 */
            createBannerAd(pos, callback) {
                if (typeof uc.createBannerAd !== 'function') { //做低版本兼容
                    callback && callback();
                    return;
                }
                const bannerCfg = this.m_config && this.m_config['banner'];
                if (!bannerCfg || !bannerCfg[pos]) {
                    callback && callback();
                    return;
                }
                try {
                    if (this.ucplatform == "ios") {
                        this.iosShow(bannerCfg[pos], pos, callback);
                    }
                    else if (this.ucplatform == "android") {
                        this.androidShow(bannerCfg[pos], pos, callback);
                    }
                }
                catch (e) {
                    console.error("[uc] ios show error:", e);
                }
            }
            androidShow(config, pos, callback) {
                console.log("[uc->adapter] android show banner");
                let banner = this.m_bannerAdInfo[pos];
                if (!!banner) {
                    banner.destroy();
                }
                const width = config.width || 300;
                banner = uc.createBannerAd({
                    style: {
                        width: width,
                        height: Math.floor(width / 1.78),
                        gravity: 7
                    }
                });
                banner.onError(function (res) {
                    if (res) {
                        console.error('BannerAd异常', res);
                        callback && callback(null);
                    }
                });
                banner.onLoad(() => {
                    const sys = this.m_systemInfo;
                    const inner = sys.windowWidth < sys.windowHeight ? sys.windowWidth : sys.windowHeight;
                    callback && callback({ width: width, height: Math.floor(width / 1.78), inner });
                });
                banner.show();
                this.m_bannerAdInfo[pos] = banner;
            }
            iosShow(config, pos, callback) {
                console.log("[uc->adapter] ios show banner");
                const width = config.width || 300;
                let banner = this.m_bannerAdInfo[pos];
                if (!!banner) {
                    banner.hide();
                }
                else {
                    banner = uc.createBannerAd({
                        style: {
                            width: width,
                            height: Math.floor(width / 1.78),
                            gravity: 7
                        }
                    });
                    banner.onError(function (res) {
                        if (res) {
                            console.error('[uc->adapter] BannerAd异常', res);
                            callback && callback(null);
                        }
                    });
                    banner.onLoad(() => {
                        // callback && callback({width:width, height:Math.floor(width/1.78)});
                    });
                }
                banner.show();
                this.m_bannerAdInfo[pos] = banner;
                const sys = this.m_systemInfo;
                const inner = sys.windowWidth < sys.windowHeight ? sys.windowWidth : sys.windowHeight;
                callback && callback({ width: width, height: Math.floor(width / 1.78), inner: inner * sys.pixelRatio });
            }
            hideBannerAd(scene) {
                console.log("[uc->adapter] hide banner: ", scene || "none");
                scene = null;
                if (!scene) {
                    for (let key in this.m_bannerAdInfo) {
                        let banner = this.m_bannerAdInfo[key];
                        banner && banner.hide();
                    }
                }
                else {
                    let banner = this.m_bannerAdInfo[scene];
                    banner && banner.hide();
                }
            }
            createVideoAd(pos, callback) {
                pos = 'plaza';
                const config = this.m_config && this.m_config['video'];
                if (!config || !config[pos]) {
                    callback && callback(false);
                    return;
                }
                let video = this.m_videoAdInfo[pos];
                if (!!video) {
                    video.offClose(null);
                    video.offError(null);
                }
                video = uc.createRewardVideoAd();
                const offEvent = () => {
                    video.offError(error);
                    video.offClose(close);
                };
                const error = (res) => {
                    res && mvc.send(k7.platform.EVT_PLATFORM_VIDEO_ERROR, callback);
                    offEvent();
                };
                const close = (res) => {
                    callback && callback(Boolean(res && res.isEnded || res == undefined));
                    offEvent();
                };
                video.onError(error);
                video.onClose(close);
                video.show()
                    .catch(err => {
                    video.load()
                        .then(() => video.show());
                });
                this.m_videoAdInfo[pos] = video;
            }
            createNaviteAd() { }
            createInterstitialAd(pos, callback) {
                const config = this.m_config.interstitial;
                if (!config[pos]) {
                    return;
                }
                if (this.m_systemInfo.SDKVersion < "1.1.2") {
                    return callback && callback(null);
                }
                let ad = this.m_interstititalAd;
                if (!ad) {
                    this.m_interstititalAd = ad = uc.createInterstitialAd();
                }
                ad.onError((err) => {
                    if (err) {
                        console.log("[uc->adapter] InterstitialAd Error: ", err);
                    }
                    callback && callback(false);
                });
                ad.show()
                    .catch(err => {
                    ad.load()
                        .then(() => ad.show(), callback && callback(true));
                });
            }
            /**微服务的微信pay接口需要判定客户端运行环境 */
            get ucplatform() {
                const sys = this.m_systemInfo;
                if (!sys)
                    return "";
                const ptm = sys.platform;
                if (!ptm)
                    return "";
                if (ptm.match(/android/ig))
                    return "android";
                if (ptm.match(/ios/ig))
                    return "ios";
                if (ptm.match(/windows|mac/ig))
                    return "pc";
            }
            get bRecharge() {
                return !!this.m_systemInfo && !!this.m_systemInfo.platform.match(/android|windows|ios/ig);
            }
            getOrderParam(obj) {
                if (!obj)
                    return {};
                let yApi = {
                    recharge_id: mapi.stage == "test" ? 1 : obj.rechargeId,
                    platform: this.ucplatform,
                    mall_auto_exchange: !!obj.aotuExchage,
                    replace_recharge: !!obj.targetUserId,
                    inapp_spm: 20205,
                };
                if (!!obj.targetUserId) {
                    yApi["target_user_id"] = obj.targetUserId;
                }
                if (!!obj.mallItemId) {
                    yApi["mall_item_id"] = obj.mallItemId;
                }
                if (!!obj.lotteryId) {
                    yApi["lottery_id"] = obj.lotteryId;
                }
                return yApi;
            }
            order() {
                const args = arguments;
                let body, ofail, paysuc, onpay;
                if (args.length > 1) {
                    body = args[0];
                    ofail = args[1];
                    paysuc = args[2];
                    onpay = args[3];
                }
                else {
                    const obj = args[0];
                    body = obj.params;
                    ofail = obj.order.fail;
                    paysuc = obj.pay.success;
                    onpay = obj.pay.complete;
                }
                let ucReq = new platform.UCPay();
                ucReq.recharge_id = body.recharge_id;
                ucReq.mall_auto_exchange = body.mall_auto_exchange;
                ucReq.platform = body.platform;
                ucReq.sys_info = encodeURIComponent(JSON.stringify(this.m_systemInfo));
                ucReq.target_user_id = body.target_user_id;
                ucReq.mall_item_id = body.mall_item_id;
                ucReq.lottery_id = body.lottery_id;
                // ucReq.inapp_spm = 
                ucReq.order((err, msg) => {
                    console.log("[uc->adapter] order fail:", err, msg);
                    ofail && ofail();
                    return;
                }, (res) => {
                    if (res.is_enough) {
                        this.onGetOrderInfo(res, paysuc);
                        return;
                    }
                    this.recharge(res, (IsSuccess) => {
                        onpay && onpay(IsSuccess);
                        if (IsSuccess) {
                            this.onGetOrderInfo(res, paysuc);
                        }
                        else {
                            mvc.send(k7.platform.EVT_PLATFORM_PAY_FAIL);
                        }
                    });
                });
            }
            onGetOrderInfo(data, onRechargeSuccess) {
                let d = {
                    recharge_order_no: data.order_id,
                    payer_user_id: data.payer_user_id
                };
                let url = data.call_back_url;
                onRechargeSuccess && onRechargeSuccess({ url, d, verify: false });
            }
            recharge(data, callback) {
                const cfg = this.m_config;
                const bizId = (cfg && cfg.bizId) || 'fa8071397df9402ead3c07d546c352ce';
                uc.requestPayment({
                    biz_id: bizId,
                    token: data.token,
                    order_id: data.order_id,
                    fail: function (res) {
                        console.log('[uc->adapter] 支付失败：', res);
                        callback && callback(false);
                    },
                    success: function (res) {
                        console.log('[uc->adapter] 支付成功：', res);
                        callback && callback(true);
                    },
                });
            }
            getBalance() {
                return new Promise((resolve) => {
                    resolve(0);
                });
            }
            customService() { }
            /**跳转到其他游戏 */
            jumpToGame(idx) {
            }
            navigateTo(obj) {
            }
            showSysModal(obj) {
                uc.showModal({
                    title: obj.title,
                    content: obj.content,
                    success: (res) => {
                        if (res.confirm) {
                            obj.confirm && obj.confirm();
                        }
                        else if (res.cancel) {
                            obj.cancel && obj.cancel();
                        }
                    }
                });
            }
            showSysToast(obj) {
                uc.showToast({
                    content: obj.title,
                });
            }
            hideSysToast() {
                // uc.hideToast(null);
            }
            vibrateLong() {
                // uc.vibrateLong(null);
            }
            vibrateShort() {
                // uc.vibrateShort(null);
            }
            createCanvas() {
                let canvas = document.createElement("canvas");
                return canvas;
            }
            createImage() {
                let image = document.createElement("image");
                return image;
            }
            previewImage() { }
            saveImageToTempFileSync(canvas, info) {
                // return "";
                let cvs = canvas;
                return cvs.toTempFilePathSync({
                    x: info.x,
                    y: info.y,
                    width: info.w,
                    height: info.h,
                    destWidth: info.dw,
                    destHeight: info.dh
                });
            }
            showLoading(object) {
                // uc.showLoading(object);
            }
            hideLoading() {
                // uc.hideLoading({});
            }
            behalf() { }
            feedBack() { }
            createCustomAd() { }
            hideCustomAd() { }
            addColorSign() { }
            addToDesktop() { }
            setUserCloudStorage() { }
            /**保存图片到本地 */
            saveImageToPhotosAlbum(object) {
                // uc.saveImageToPhotosAlbum({
                //     filePath: object.filePath,
                //     success(res) {
                //         uc.showModal({
                //             title: '提示',
                //             content: '小程序码已保存到相册',
                //             showCancel: false,
                //             success: function (res) {
                //             }
                //         });
                //     },
                //     fail: function (res) { }
                // });
            }
            exitGame() {
                uc.exit();
            }
        }
        /**聊天页下拉，最近/我的 进入 */
        UCAdapter.SCENE_PROFILE_PULL = 1001;
        /**发现页->小程序，最近/我的 进入 */
        UCAdapter.SCENE_PROFILE_FIND = 1089;
        UCAdapter.SCENE_DESKTOP = 1023;
        UCAdapter.PLATFORM_TAG = "uc";
        UCAdapter.MAX_RETRY = 5;
        platform.UCAdapter = UCAdapter;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class UCLogin {
            login(fail, success) {
                const req = this.getReq();
                req.fail = fail;
                req.success = success;
                return mapi.miniLogin(req);
            }
            getReq() {
                const req = {
                    platform: "uc",
                    code: this.code,
                    method: "post"
                };
                const body = {
                    spm: this.spm,
                    os_type_str: this.osTypeStr,
                    app_version: "1.0.0",
                    client_type: 3
                };
                if (this.shareCode && this.inviteSchemeId) {
                    body["invite_scheme_id"] = this.inviteSchemeId;
                    body["share_code"] = this.shareCode;
                    req.method = "get";
                }
                req.body = body;
                return req;
            }
        }
        platform.UCLogin = UCLogin;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class UCPay {
            constructor() {
                this.mall_auto_exchange = true;
            }
            order(fail, success) {
                mapi.MApiRequest.create("ucorder")
                    .path(UCPay.URL_PAY, "post")
                    .variable({ platform: "uc" })
                    .body(this.body)
                    .version("v3.1")
                    .request({
                    success,
                    fail
                });
            }
            get body() {
                return {
                    recharge_id: this.recharge_id,
                    sys_info: this.sys_info,
                    platform: this.platform,
                    mall_item_id: this.mall_item_id,
                    lottery_id: this.lottery_id,
                    mall_auto_exchange: this.mall_auto_exchange
                };
            }
        }
        UCPay.URL_PAY = "https://{host}/recharge/mini/pay/{platform}";
        platform.UCPay = UCPay;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
