window.k7 = window.k7 || {};
/// <reference path="../../bin/platform.d.ts" />

/// <reference path="../../bin/platform.d.ts" />
(function (k7) {
    var platform;
    (function (platform) {
        const SCENE = {
            /**桌面下拉，我的小程序 */
            PROFILE_PULL: 3003,
            /**桌面下拉，最近在玩 */
            PROFILE_FIND: 3001,
            DESKTOP: 1023,
            /**小程序模板消息 */
            SUBSCRIBE: 1014
        };
        /**
         * 手机qq小游戏平台适配器
         */
        class QQAdapter {
            constructor() {
                /**微信登录码，每次执行qq.login返回的登录码均不同 */
                this.m_wxCode = "";
                this.m_userInfo = null;
                this.m_curInterstititalAd = null;
                this.m_systemInfo = null;
                this.m_config = null;
                this.m_networkType = "";
                this.m_launchOptionsSync = null;
                /**订阅信息 */
                this.m_subscribe = null;
            }
            get launchQuery() { return this.m_launchOptionsSync && this.m_launchOptionsSync.query; }
            get systemInfo() { return this.m_systemInfo; }
            get profile() { return this.sceneCheck(SCENE.PROFILE_FIND) || this.sceneCheck(SCENE.PROFILE_PULL); }
            get desktop() {
                const device = this.m_systemInfo;
                const ptf = device.platform;
                if (ptf.match(/android/ig)) {
                    return this.sceneCheck(SCENE.DESKTOP);
                }
                else if (ptf.match(/ios/ig)) {
                    const query = this.m_launchOptionsSync.query;
                    return query && query["desktoplnk"];
                }
                return false;
            }
            get subsmsg() {
                return this.sceneCheck(SCENE.SUBSCRIBE);
            }
            get hasMenuBar() { return true; }
            get hasAuthComp() { return true; }
            get networkType() { return this.m_networkType; }
            get tag() { return QQAdapter.PLATFORM_TAG; }
            get adService() { return true; }
            get config() { return this.m_config; }
            get userInfo() { return this.m_userInfo; }
            get launchOptions() { return this.m_launchOptionsSync; }
            get subscribe() { return this.m_subscribe; }
            set config(val) { this.m_config = val || {}; }
            sceneCheck(scene) {
                if (!this.m_launchOptionsSync)
                    return false;
                return this.m_launchOptionsSync.scene == scene;
            }
            /**初始化 */
            init(config) {
                this.m_bannerAdInfo = {};
                this.m_videoAdInfo = {};
                this.m_config = config || {};
                this.setMenuShare();
                this.getLaunchOptions();
                qq.getSystemInfo({
                    success: (res) => {
                        this.m_systemInfo = res;
                    },
                    fail: function (err) {
                        console.log('getSystemInfo失败', err);
                    },
                    complete: function () {
                    }
                });
                this.getNetworkType();
                this._loginTime = Date.now();
                this._interAdCD = 1000 * 30;
                this._lastInterAdTime = 0;
                mvc.on(k7.platform.EVT_GAME_AUTH_CANCEL, this, this.onAuthReqCancel);
                qq.onNetworkStatusChange((res) => {
                    qq.getNetworkType({
                        success: (res) => {
                            this.m_networkType = res.networkType;
                        },
                        complete: () => {
                            mvc.send(k7.platform.EVT_PLATFORM_NETCHANGE, res.isConnected);
                        }
                    });
                });
                qq.setKeepScreenOn({
                    keepScreenOn: true,
                    success: () => {
                        console.log('qq设置屏幕常亮成功');
                    },
                    fail: () => {
                        console.log('qq设置屏幕常亮失败');
                    }
                });
                qq.onShow((res) => {
                    console.log('qq=>onShow', res);
                    this.m_launchOptionsSync = res;
                    mvc.send(k7.platform.EVT_PLATFORM_ON_SHOW);
                });
                qq.onHide(() => {
                    console.log('qq=>onHide');
                    mvc.send(k7.platform.EVT_PLATFORM_ON_HIDE);
                });
            }
            onAuthReqCancel() {
                if (!this.btnUserInfo)
                    return;
                this.btnUserInfo.hide();
            }
            login1(forceLogin) {
                // 1.拉取授权设置信息
                let settingParam;
                let success = (res) => {
                    this.onGetSettingSuccess(res, forceLogin);
                };
                let fail = () => {
                };
                settingParam = { success, fail };
                this.getSetting(settingParam);
            }
            getSetting(param) {
                let success = (res) => {
                    let auth = {
                        userInfo: res.authSetting["scope.userInfo"],
                        userLocation: res.authSetting["scope.userLocation"],
                        run: res.authSetting["scope.werun"],
                        writePhotosAlbum: res.authSetting["scope.writePhotosAlbum"]
                    };
                    this.m_subscribe = res.subscriptionsSetting;
                    let setting = {
                        authSetting: auth
                    };
                    param.success(setting);
                };
                let fail = param.fail;
                let object = { success, fail, withSubscriptions: true };
                qq.getSetting(object);
            }
            onGetSettingSuccess(setting, forceLogin) {
                if (setting.authSetting.userInfo) { // 用户已对此应用首次权限申请同意过
                    this.doLogin();
                }
                else { //未曾授权，则需要跳转授权页
                    if (this.devtool) { // QQ小程序开发工具环境下，getSetting会出现成功但无数据问题，导致无法正常登陆
                        this.getUserInfo((res) => {
                            if (res && !!res.errMsg.match(/getUserInfo:fail/ig)) {
                                this.onAuthFail(forceLogin);
                            }
                            else {
                                this.doLogin();
                            }
                        });
                    }
                    else {
                        this.onAuthFail(forceLogin);
                    }
                }
            }
            /**查询用户设置未授权 */
            onAuthFail(force) {
                if (!force) {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SKIP);
                    return;
                }
                this.gotoAuthorizePage((userInfo) => {
                    if (userInfo.allow) {
                        // 允许授权后刷新授权设置信息
                        this.login1(force);
                    }
                });
            }
            get devtool() {
                return !!this.m_systemInfo.platform.match(/devtool/ig);
            }
            /**前往授权页 */
            gotoAuthorizePage(callback) {
                this.createUserInfoButton((res) => {
                    let userInfo = {
                        allow: false,
                        name: "",
                    };
                    if (res.errMsg == "getUserInfo:ok") { // 用户点击“允许”
                        userInfo.allow = true;
                        userInfo.name = res.userInfo.nickName;
                    }
                    else { // 用户点击“拒绝”
                    }
                    callback(userInfo);
                });
            }
            doLogin() {
                let loginParam;
                let success = (loginInfo) => {
                    this.m_wxCode = loginInfo.code;
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.getUserInfoAfterLogin();
                };
                let fail = () => {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                };
                loginParam = { success, fail };
                qq.login(loginParam);
            }
            /**
             * @desc 执行适配器的登录接口，获取用户敏感信息，交给yApi验证。
             * @param onLogin
             */
            login(onLogin) {
                let loginParam;
                let success = (loginInfo) => {
                    this.m_wxCode = loginInfo.code;
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.getUserInfoAfterLogin();
                };
                let fail = () => {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                };
                loginParam = { success, fail };
                qq.login(loginParam);
            }
            /**成功登录后，获取用户的敏感数据 */
            getUserInfoAfterLogin() {
                this.getUserInfo((userInfo) => {
                    this.onGetRealUserInfo(userInfo);
                });
            }
            showAlert(content, callback) {
            }
            /**
             * @desc 在登录成功之后调用，获取微信用户的部分敏感数据
             * @param res
             * @param onLogin
             */
            onGetRealUserInfo(res) {
                if (res.errMsg != "operateWXData:ok" && res.errMsg != "getUserInfo:ok") {
                    this.showAlert("获取用户信息失败", () => {
                        this.getUserInfoAfterLogin();
                    });
                    return null;
                }
                const scene = this.launchOptions && this.launchOptions.scene;
                const qqReq = new platform.QQLogin();
                qqReq.code = this.m_wxCode;
                qqReq.spm = SPM_TYPE[scene] ? SPM_TYPE[scene] : SPM_TYPE[0];
                qqReq.osTypeStr = this.systemInfo.platform.match(/android/gi) ? "android" : "ios";
                let query = this.launchQuery;
                if (!!query && query.hasOwnProperty('shareCode')) {
                    qqReq.shareCode = query['shareCode'];
                }
                qqReq.login((err, msg) => {
                    console.log("[qq->adapter] on verify:", err, msg);
                    mvc.send(k7.platform.EVT_VERIFY_LOGIN_FAIL);
                }, (data) => {
                    const info = {
                        platformId: data.platform_id,
                        accessToken: data.access_token,
                        userId: data.user_id,
                        oauthToken: data.oauth_token,
                        oauthExpireTime: (new Date(data.oauth_token_expire)).getTime(),
                        channel: this.tag
                    };
                    mvc.send(k7.platform.EVT_VERIFY_LOGIN_SUCCESS, info);
                });
                /**执行yApi的账号验证，并获得大厅或游戏服务器登录凭证 */
            }
            /**拉取微信用户信息，若登录过，则可以获得敏感数据 */
            getUserInfo(callback) {
                qq.getUserInfo({
                    success: (res) => {
                        if (res) {
                            console.log("@userinfo:", res);
                            this.m_userInfo = res.userInfo;
                            callback && callback(res);
                        }
                    },
                    fail: (res) => {
                        callback && callback(res);
                    }
                });
            }
            /**创建登录按钮 */
            createUserInfoButton(callback) {
                if (!this.btnUserInfo) {
                    this.btnUserInfo = qq.createUserInfoButton({
                        type: 'text',
                        text: '',
                        withCredentials: true,
                        style: {
                            left: 0,
                            top: window.innerHeight / 2,
                            width: window.innerWidth,
                            height: window.innerHeight,
                            backgroundColor: '',
                            borderColor: '',
                            borderWidth: 1,
                            lineHeight: 0,
                            textAlign: 'center',
                            fontSize: 16,
                            borderRadius: 4
                        },
                    });
                    this.btnUserInfo.onTap((res) => {
                        if (res.userInfo) {
                            mvc.send(k7.platform.EVT_PLATFORM_ON_AUTH);
                            this.btnUserInfo.hide();
                        }
                        else {
                            console.log('qq.onTap=>fail');
                        }
                        callback && callback(res);
                    });
                }
                this.btnUserInfo.show();
                mvc.send(k7.platform.EVT_PLATFORM_CREATE_AUTH_COMP);
                return this.btnUserInfo;
            }
            createGameClub(obj, callback) { }
            hideGameClub() { }
            destroyGameClub() { }
            getSystemInfo() {
                let width = 0, height = 0;
                const info = this.m_systemInfo;
                if (!!info) {
                    width = info.windowWidth * info.pixelRatio;
                    height = info.windowHeight * info.pixelRatio;
                }
                return { windowWidth: width, windowHeight: height };
            }
            getMenuButtonStyle() {
                return qq.getMenuButtonBoundingClientRect();
            }
            /**获取平台配置 */
            getConfig() {
                if (!this.m_config) {
                }
                return this.m_config;
            }
            /**获取小程序启动参数*/
            getLaunchOptions() {
                this.m_launchOptionsSync = qq.getLaunchOptionsSync();
                console.log("启动信息:", this.m_launchOptionsSync);
            }
            /**请求订阅 */
            requestSubscribe(obj) {
                if (!obj)
                    return;
                if (obj.type == 0) {
                    qq.requestSubscribeSystemMessage(obj.params);
                }
                else if (obj.type == 1) {
                    if (obj.params.tmplIds) {
                        // obj.params.tmplIds = this.m_config["subscribeTmplIds"];
                    }
                    qq.subscribeAppMsg(obj.params);
                }
            }
            /**右上角分享游戏 */
            setMenuShare() {
                qq.showShareMenu({
                    withShareTicket: true
                });
                qq.onShareAppMessage(() => {
                    return this.getRandomShare();
                });
            }
            /**分享游戏 */
            shareAppMessage(obj, callback) {
                var shareInfo = (obj && obj.shareInfo) || this.getRandomShare();
                qq.shareAppMessage({
                    title: shareInfo.title,
                    imageUrl: shareInfo.imageUrl,
                    query: obj && obj.query,
                    success: () => {
                        callback && callback();
                    },
                    fail: () => {
                        qq.showToast({
                            title: Math.random() > 0.5 ? '请分享到群！' : "请分享到不同群聊"
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
                qq.getNetworkType({
                    success: (res) => {
                        this.m_networkType = res.networkType;
                    }
                });
            }
            /**剪切板操作 */
            setClipboardData(context) {
                qq.setClipboardData({
                    data: context,
                    success: function (res) {
                        qq.showModal({
                            title: '提示',
                            content: '复制成功',
                            showCancel: false,
                            success: function (res) {
                            }
                        });
                    }
                });
            }
            /**创建Banner广告 */
            createBannerAd(pos, callback) {
                if (typeof qq.createBannerAd !== 'function') { //做低版本兼容
                    callback && callback();
                    return;
                }
                let banner = this.m_bannerAdInfo[pos];
                if (banner) {
                    banner.destroy();
                }
                let bannerCfg = this.m_config && this.m_config['banner'];
                if (!bannerCfg || !bannerCfg[pos]) {
                    callback && callback();
                    return;
                }
                let curCfg = bannerCfg[pos];
                let width = curCfg.width || 300;
                let left = 0;
                if (curCfg.left == 1) {
                    left = (window.innerWidth - width) / 2;
                }
                else if (curCfg.left == 2) {
                    left = window.innerWidth - width;
                }
                // QQ平台创建banner广告较快，导致点击靠近广告的按钮跳动时差太短，不易误点banner
                setTimeout(() => {
                    banner = qq.createBannerAd({
                        adUnitId: curCfg.adUnitId,
                        style: { left, top: 0, width }
                    });
                    banner.onError((res) => {
                        if (res) {
                            callback && callback();
                        }
                    });
                    banner.onResize(res => {
                        banner && (banner.style.top = window.innerHeight - res.height + 1);
                        callback && callback({ width: banner.style.realWidth, height: banner.style.realHeight });
                    });
                    banner.onLoad(() => {
                        banner.show();
                    });
                    this.m_bannerAdInfo[pos] = banner;
                }, 500);
            }
            hideBannerAd(scene) {
                if (!scene) {
                    for (const key in this.m_bannerAdInfo) {
                        this.destroyBannerAd(key);
                    }
                }
                else {
                    this.destroyBannerAd(scene);
                }
            }
            /**销毁Banner广告 */
            destroyBannerAd(scene) {
                const banner = this.m_bannerAdInfo[scene];
                if (banner) {
                    banner.destroy();
                    this.m_bannerAdInfo[scene] = null;
                }
            }
            createVideoAd(pos, callback) {
                pos = !pos ? "default" : pos;
                let video = this.m_videoAdInfo[pos];
                if (video) {
                    video.offClose(null);
                    video.offError(null);
                }
                else {
                    const vconfig = this.m_config && this.m_config['video'];
                    if (!vconfig) {
                        return;
                    }
                    const aduid = vconfig[pos] || vconfig["default"];
                    if (!aduid) {
                        console.log("[qq->adapter] 视频广告id未配置. ", pos);
                        return;
                    }
                    video = qq.createRewardedVideoAd({ adUnitId: aduid });
                    this.m_videoAdInfo[pos] = video;
                }
                const offEvent = () => {
                    video.offError(error);
                    video.offClose(close);
                };
                const error = (res) => {
                    res && mvc.send(k7.platform.EVT_PLATFORM_VIDEO_ERROR, { callback, code: res.errCode, msg: res.errMsg, scene: pos });
                    offEvent();
                };
                const close = (res) => {
                    callback && callback(Boolean(res && res.isEnded || res == undefined));
                    offEvent();
                };
                video.onError(error);
                video.onClose(close);
                video.show().catch(err => {
                    video.load().then(() => video.show());
                });
            }
            createInterstitialAd(scene, callback) {
                const now = Date.now();
                const cd = this._interAdCD;
                if (now - this._loginTime <= cd) {
                    return;
                }
                const lastTime = this._lastInterAdTime;
                if (!!lastTime && (now - lastTime <= cd)) {
                    return;
                }
                this._lastInterAdTime = now;
                const pcfg = this.m_config["interstitial"];
                if (!pcfg) {
                    return;
                }
                const ad_uid = pcfg[scene];
                if (!ad_uid) {
                    return;
                }
                if (!this.m_curInterstititalAd) {
                    this.m_curInterstititalAd = qq.createInterstitialAd({
                        adUnitId: ad_uid
                    });
                    this.m_curInterstititalAd.onError(function (res) {
                        if (res) {
                            callback && callback(false);
                        }
                    });
                    this.m_curInterstititalAd.onClose(() => { });
                }
                this.m_curInterstititalAd.show()
                    .catch((err) => {
                    this.m_curInterstititalAd.load()
                        .then(() => this.m_curInterstititalAd.show(), callback && callback(true));
                });
            }
            createNaviteAd() { }
            createCustomAd() { }
            hideCustomAd() { }
            /**是否可充值 */
            get bRecharge() {
                const sys = this.m_systemInfo;
                if (!sys) {
                    return false;
                }
                const ptm = sys.platform || "";
                if (!!ptm.match(/android/ig)) {
                    return true;
                }
                if (!!ptm.match(/devtool/ig)) {
                    const stm = sys.system || "";
                    return !!stm.match(/android/ig);
                }
                return false;
            }
            getOrderParam(object) {
                if (!object)
                    return {};
                const inapp_spm = this.m_config.inapp_spm;
                return {
                    recharge_id: mapi.stage == "test" ? 1 : object.rechargeId,
                    platform: this.order_platform,
                    mall_auto_exchange: !!object.aotuExchage,
                    inapp_spm,
                    mall_item_id: object.mallItemId,
                    lottery_id: object.lotteryId
                };
            }
            getBalance() {
                return new Promise((resolve) => {
                    resolve(0);
                });
            }
            /**微服务的微信pay接口需要判定客户端运行环境 */
            get order_platform() {
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
                return ptm;
            }
            requestOrder(params) {
                return new Promise((resolve, reject) => {
                    const req = {
                        platform: "qq",
                        action: "lightAuth",
                        version: "v3.1",
                        body: {
                            recharge_id: params.recharge_id,
                            mall_auto_exchange: params.mall_auto_exchange,
                            inapp_spm: params.inapp_spm || "",
                            platform: this.order_platform
                        },
                        fail: (err, msg) => {
                            console.log("[qq->adapter] on order:", err, msg);
                            reject();
                        },
                        success: (data) => {
                            resolve(data);
                        }
                    };
                    mapi.miniPay(req);
                });
            }
            order() {
                const args = arguments;
                let body, orderfail, paysuccess, paycomplete;
                if (args.length <= 1) {
                    const obj = args[0];
                    body = obj.params;
                    orderfail = obj.order.fail;
                    paysuccess = obj.pay.success;
                    paycomplete = obj.pay.complete;
                }
                else {
                    body = args[0];
                    orderfail = args[1];
                    paysuccess = args[2];
                    paycomplete = args[3];
                }
                const req = {
                    platform: "qq",
                    action: "lightAuth",
                    version: "v3.1",
                    body,
                    fail: (err, msg) => {
                        console.log("[qq->adapter] on order:", err, msg);
                        orderfail && orderfail();
                    },
                    success: (data) => {
                        if (data.is_enough) {
                            this.onGetOrderInfo(data, paysuccess);
                            return;
                        }
                        this.recharge(data, (IsSuccess) => {
                            paycomplete && paycomplete(IsSuccess);
                            if (IsSuccess) {
                                this.onGetOrderInfo(data, paysuccess);
                            }
                            else {
                                mvc.send(k7.platform.EVT_PLATFORM_PAY_FAIL);
                            }
                        });
                    }
                };
                mapi.miniPay(req);
            }
            onGetOrderInfo(data, onRechargeSuccess) {
                let d = {
                    recharge_order_no: data.order_no
                };
                let url = data.call_back_url || "";
                onRechargeSuccess && onRechargeSuccess({ url, d, verify: false });
            }
            recharge(data, callback) {
                qq.requestMidasPayment({
                    prepayId: data.prepay_id,
                    starCurrency: data.amt,
                    setEnv: data.env == 1 ? 0 : 1,
                    fail: (res) => {
                        console.log('米大师支付失败', res);
                        // 星币延迟到账
                        if (res && res.errCode == -3) {
                            // setTimeout(()=>{
                            //     this.recharge(data, callback);
                            // }, 1000);
                            callback(false);
                        }
                        else {
                            callback && callback(false);
                        }
                    },
                    success: function (res) {
                        console.log('米大师支付成功', res);
                        callback && callback(true);
                    },
                    complete: function () {
                    }
                });
            }
            behalf(params, complete) {
                this.requestOrder(params)
                    .catch(() => {
                    complete(false);
                })
                    .then((data) => {
                    qq.requestFriendPayment({
                        prepayId: data.prepay_id,
                        setEnv: data.env - 1,
                        title: params.title || "",
                        imageUrl: params.imageUrl || "",
                        fail: (err) => {
                            complete(false);
                        },
                        success: (res) => {
                            complete(true);
                        }
                    });
                });
            }
            customService() {
                let name = this.m_userInfo.userInfo.nickName;
                let avatarUrl = this.m_userInfo.userInfo.avatarUrl;
                let id = mapi.userid;
                let sessionFrom = '';
                if (id) {
                    let params = JSON.stringify({
                        "uname": name,
                        "realname": id
                    });
                    sessionFrom = 'sobot|' + name + '|' + avatarUrl + '|' + params;
                }
                let remoteImgUrl = 'resources/plaza/texture/shareBg/shareBg_2.jpg';
                remoteImgUrl = cc.url.raw(remoteImgUrl);
                if (cc.loader.md5Pipe) {
                    if (window['wxDownloader'].REMOTE_SERVER_ROOT != "" && window['wxDownloader'].REMOTE_SERVER_ROOT != 'undefined') {
                        remoteImgUrl = window['wxDownloader'].REMOTE_SERVER_ROOT + '/' + cc.loader.md5Pipe.transformURL(remoteImgUrl);
                    }
                    else {
                        remoteImgUrl = cc.loader.md5Pipe.transformURL(remoteImgUrl);
                    }
                }
                qq.openCustomerServiceConversation({
                    sessionFrom: sessionFrom,
                    showMessageCard: false,
                    sendMessageTitle: '',
                    sendMessagePath: remoteImgUrl,
                    sendMessageImg: remoteImgUrl,
                    fail: function (res) {
                    },
                    success: function (res) {
                        console.log('微信客服会话');
                    },
                    complete: function () {
                    }
                });
            }
            /**跳转到其他游戏 */
            jumpToGame(idx) {
                let jumpCfg = this.m_config && this.m_config['jump'] && this.m_config['jump'][idx];
                if (!jumpCfg)
                    return;
                qq.navigateToMiniProgram({
                    appId: jumpCfg.jumpAppid,
                    extraData: '双扣',
                    success(res) {
                    },
                    fail(res) {
                    }
                });
            }
            navigateTo(obj) {
                if (!obj || !obj.param)
                    return;
                qq.navigateToMiniProgram({
                    appId: obj.param.appid || "",
                    extraData: "双扣",
                    success: (res) => {
                        obj.success && obj.success(res);
                    },
                    fail: (res) => {
                        obj.fail && obj.fail();
                    }
                });
            }
            vibrateLong() {
                qq.vibrateLong(null);
            }
            vibrateShort() {
                qq.vibrateShort(null);
            }
            createCanvas() {
                let canvas = qq.createCanvas();
                return canvas;
            }
            createImage() {
                let image = qq.createImage();
                return image;
            }
            previewImage(urls, current) {
                qq.previewImage({
                    urls, current,
                    success: () => {
                    },
                    fail: () => {
                    }
                });
            }
            saveImageToTempFileSync(canvas, info) {
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
                qq.showLoading(object);
            }
            hideLoading() {
                qq.hideLoading({});
            }
            /**保存图片到本地 */
            saveImageToPhotosAlbum(object) {
                qq.saveImageToPhotosAlbum({
                    filePath: object.filePath,
                    success(res) {
                        qq.showModal({
                            title: '提示',
                            content: '小程序码已保存到相册',
                            showCancel: false,
                            success: function (res) {
                            }
                        });
                    },
                    fail: function (res) { }
                });
            }
            showSysToast() { }
            hideSysToast() { }
            showSysModal() { }
            exitGame() {
                qq.exitMiniProgram({});
            }
            addToDesktop(obj) {
                qq.saveAppToDesktop(obj);
            }
            addColorSign(type, obj) {
                const exist = qq.isColorSignExistSync && qq.isColorSignExistSync();
                if (exist) {
                    obj.fail("当前游戏已添加至彩签内，请勿重复添加");
                    return;
                }
                if (type == 0) {
                    qq.addColorSign(obj);
                }
                else if (type == 1) {
                    const sign = qq.addRecentColorSign || qq.addColorSign;
                    if (!sign) {
                        obj.fail("当前版本qq不支持此功能，请检查更新");
                    }
                    sign.call(qq, ({
                        success: obj.success,
                        fail: (err) => {
                            console.log("[qq->adapter] 彩签失败：", err);
                            obj.fail("添加彩签失败");
                        }
                    }));
                }
            }
            setUserCloudStorage(obj) {
                qq.setUserCloudStorage(obj);
            }
            feedBack(obj) { }
        }
        QQAdapter.PLATFORM_TAG = "qq";
        platform.QQAdapter = QQAdapter;
        /**qq小游戏平台注册用户来源统计定义 */
        const SPM_TYPE = {
            "3026": "9.74533",
            "3003": "9.74532",
            "3002": "9.74531",
            "3001": "9.74530",
            "2062": "9.74529",
            "1044": "9.74528",
            "1023": "9.74527",
            "1007": "9.74526",
            "1005": "9.74525",
            "1037": "9.74524",
            "0": "9.74523",
            "2001": "9.44532",
            "1027": "9.44531",
            "2077": "9.44529",
            "1011": "9.44528",
            "1012": "9.44528",
        };
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        /**
         * 微服务登录-QQ登录
         */
        class QQLogin {
            login(fail, success) {
                const req = this.getReq();
                req.fail = fail;
                req.success = success;
                return mapi.miniLogin(req);
            }
            getReq() {
                const req = {
                    platform: "qq",
                    code: this.code,
                    method: "post"
                };
                const param = {
                    spm: this.spm,
                    os_type_str: this.osTypeStr,
                };
                if (this.shareCode) {
                    param["share_code"] = this.shareCode;
                    req.method = "get";
                    req.query = param;
                }
                else {
                    param["client_type"] = 3;
                    req.body = param;
                }
                return req;
            }
        }
        platform.QQLogin = QQLogin;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
