window.k7 = window.k7 || {};

(function (k7) {
    var platform;
    (function (platform) {
        class WxAdapter {
            constructor() {
                this._config = null;
            }
            get ad() {
                return this._ad || (this._ad = new platform.WxAD(this));
            }
            get device() {
                return this._device || (this._device = new platform.WxDevice(this));
            }
            get env() {
                return this._env || (this._env = new platform.WxEnv(this));
            }
            get accnt() {
                return this._account || (this._account = new platform.WxAccount(this));
            }
            get pay() {
                return this._pay || (this._pay = new platform.WxRecharge(this));
            }
            get support() {
                return this._support || (this._support = new platform.WxSupport(this));
            }
            get launchQuery() { return this.env.launchOpts.query; }
            get systemInfo() { return this.device.system; }
            get profile() { return this.from(platform.SCENE.PROFILE_PULL) || this.from(platform.SCENE.PROFILE_FIND); }
            get desktop() { return this.from(platform.SCENE.DESKTOP); }
            get subsmsg() { return this.from(platform.SCENE.SUBSCRIBE); }
            get hasMenuBar() { return true; }
            get hasAuthComp() { return true; }
            get networkType() { return this.device.netType; }
            get tag() { return WxAdapter.PLATFORM_TAG; }
            get adService() { return true; }
            get userInfo() { return this.accnt.userInfo; }
            get launchOptions() { return this.env.launchOpts; }
            get subscribe() { return this.accnt.subscribe; }
            get config() { return this._config; }
            set config(val) { this._config = val; }
            get bRecharge() { return this.pay.bRecharge; }
            getConfig(key) {
                return this._config && this._config[key];
            }
            from(scene) {
                if (!this.launchOptions)
                    return false;
                return this.launchOptions.scene == scene;
            }
            init() {
                this._config = {};
                this.accnt.init();
                this.ad.init();
                this.device.init();
                this.env.init();
                this.pay.init();
            }
            login1(forceLogin, style) {
                this.accnt.login(forceLogin, style);
            }
            login() { }
            getSetting(param) {
                this.accnt.getSetting(param);
            }
            gotoAuthorizePage(callback) {
                this.accnt.gotoAuthorizePage(callback);
            }
            requestSubscribe(object) {
                this.accnt.requestSubscribe(object);
            }
            getOrderParam(object) {
                return this.pay.getOrderParam(object);
            }
            order(params, onOrderFail, onRechargeSuccess, onPay) {
                if (arguments.length > 1) {
                    this.pay.order(params, onOrderFail, onRechargeSuccess, onPay);
                }
                else {
                    this.pay.order(params);
                }
            }
            behalf(params, complete) {
            }
            recharge(data, callback) {
                this.pay.recharge(data, callback);
            }
            getBalance() {
                return this.pay.getBalance();
            }
            createBannerAd(pos, callback, align) {
                this.ad.createBannerAd(pos, align, callback);
            }
            hideBannerAd(scene) {
                this.ad.hideBannerAd(scene);
            }
            createCustomAd(scene, callback) {
                this.ad.createCustomAd(scene, callback);
            }
            hideCustomAd(scene) {
                this.ad.hideCustomAd(scene);
            }
            createNaviteAd() { }
            createVideoAd(pos, callback) {
                this.ad.createVideoAd(pos, callback);
            }
            createInterstitialAd(scene, callback) {
                this.ad.createInterstitialAd(scene, callback);
            }
            getSystemInfo() {
                return this.device.getSystemInfo();
            }
            getMenuButtonStyle() {
                return this.device.getMenuButtonStyle();
            }
            vibrateShort(object) {
                this.device.vibrateShort();
            }
            vibrateLong(object) {
                this.device.vibrateLong();
            }
            saveImageToPhotosAlbum(object) {
                this.device.saveImageToPhotosAlbum(object);
            }
            previewImage(urls, current) {
                this.device.previewImage(urls, current);
            }
            saveImageToTempFileSync(canvas, info) {
                return this.device.saveImageToTempFileSync(canvas, info);
            }
            setClipboardData(context) {
                this.env.setClipboardData(context);
            }
            shareAppMessage(obj, callback) {
                this.env.shareAppMessage(obj, callback);
            }
            jumpToGame(index) {
                this.env.jumpToGame(index);
            }
            navigateTo(obj) {
                this.env.navigateTo(obj);
            }
            createCanvas() {
                return this.env.createCanvas();
            }
            createImage() {
                return this.env.createImage();
            }
            showLoading(object) {
                this.env.showLoading(object);
            }
            hideLoading(object) {
                this.env.hideLoading();
            }
            showSysModal(object) {
                this.env.showSysModal(object);
            }
            showSysToast(object) {
                this.env.showSysToast(object);
            }
            hideSysToast() {
                this.env.hideSysToast();
            }
            customService() {
                this.support.customService();
            }
            createGameClub(obj, callback) {
                this.support.createGameClub(obj, callback);
            }
            hideGameClub() {
                this.support.hideGameClub();
            }
            destroyGameClub() {
                this.support.destroyGameClub();
            }
            addToDesktop(obj) {
            }
            addColorSign(type, obj) {
            }
            setUserCloudStorage(obj) {
                this.support.setUserCloudStorage(obj);
            }
            showFeedBackBtn(obj) {
                this.support.showFeedBackBtn(obj);
            }
            hideFeedBackBtn() {
                this.support.hideFeedBack();
            }
            exitGame() {
                wx.exitMiniProgram({});
            }
        }
        WxAdapter.PLATFORM_TAG = "wx";
        platform.WxAdapter = WxAdapter;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxLogin {
            login(fail, success) {
                if (!this.encryptedData || !this.iv) {
                    console.error("[mapi->login] 验证参数无效");
                    return;
                }
                const req = this.getReq();
                req.fail = fail;
                req.success = success;
                return mapi.miniLogin(req);
            }
            getReq() {
                const req = {
                    platform: "wechat",
                    code: this.code,
                    method: "post"
                };
                const param = {
                    iv: this.iv,
                    encrypted_data: this.encryptedData,
                    spm: this.spm,
                    os_type_str: this.osTypeStr,
                };
                if (this.shareCode && this.inviteSchemeId) {
                    param["invite_scheme_id"] = this.inviteSchemeId;
                    param["share_code"] = this.shareCode;
                    param.iv = encodeURIComponent(this.iv);
                    param.encrypted_data = encodeURIComponent(this.encryptedData);
                    req.method = "get";
                    req.query = param;
                }
                else {
                    param["app_version"] = "1.0.0";
                    param["client_type"] = 3;
                    req.body = param;
                }
                return req;
            }
        }
        platform.WxLogin = WxLogin;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxAccount {
            constructor(owner) {
                this._owner = owner;
                this._logining = false;
            }
            get userInfo() { return this._userinfo; }
            get subscribe() { return this._subscribe; }
            get code() { return this._code; }
            init() {
                mvc.on(k7.platform.EVT_GAME_AUTH_CANCEL, this, this.onAuthReqCancel);
            }
            onAuthReqCancel() {
                if (!this._btnUserInfo)
                    return;
                this._btnUserInfo.hide();
            }
            login(forceLogin, style) {
                if (!!style) {
                    this._authBtnStyle = style;
                }
                let settingParam;
                let success = (res) => {
                    this.onGetSettingSuccess(res, forceLogin);
                };
                let fail = () => {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_ERROR);
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
                    this._subscribe = res.subscriptionsSetting;
                    let setting = {
                        authSetting: auth,
                        subscribSetting: res.subscriptionsSetting
                    };
                    param.success(setting);
                };
                let fail = param.fail;
                let object = { success, fail, withSubscriptions: true };
                wx.getSetting(object);
            }
            onGetSettingSuccess(setting, forceLogin) {
                if (setting.authSetting.userInfo) {
                    this.doLogin();
                }
                else {
                    if (!forceLogin) {
                        mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SKIP);
                        return;
                    }
                    this.gotoAuthorizePage((userInfo) => {
                        if (userInfo.allow) {
                            this.login(forceLogin);
                        }
                    });
                }
            }
            gotoAuthorizePage(callback) {
                this.createUserInfoButton((res) => {
                    let userInfo = {
                        allow: false,
                        name: "",
                    };
                    if (res.errMsg == "getUserInfo:ok") {
                        userInfo.allow = true;
                        userInfo.name = res.userInfo.nickName;
                    }
                    else {
                    }
                    callback(userInfo);
                });
            }
            doLogin() {
                if (this._logining) {
                    return;
                }
                this._logining = true;
                let loginParam;
                let success = (loginInfo) => {
                    this._code = loginInfo.code;
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.getUserInfo((userInfo) => {
                        if (userInfo.errMsg != "getUserInfo:ok") {
                            mvc.send(platform.EVT_GET_USER_INFO_FAIL);
                            return null;
                        }
                        this.mapiLogin(userInfo);
                    });
                };
                let fail = () => {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                };
                loginParam = { success, fail };
                wx.login(loginParam);
            }
            mapiLogin(res) {
                let wxReq = new platform.WxLogin();
                wxReq.code = this._code;
                wxReq.iv = res.iv;
                wxReq.encryptedData = res.encryptedData;
                const laopts = this._owner.launchOptions;
                let scene = laopts && laopts.scene;
                wxReq.spm = platform.SPM_TYPE[scene] ? platform.SPM_TYPE[scene] : platform.SPM_TYPE[0];
                wxReq.osTypeStr = this._owner.systemInfo.platform.match(/android|windows/gi) ? "android" : "ios";
                let query = this._owner.launchQuery;
                if (!!query && query.hasOwnProperty('shareCode')) {
                    wxReq.shareCode = query['shareCode'];
                    wxReq.inviteSchemeId = query['inviteSchemeId'];
                }
                wxReq.login((err, msg) => {
                    this._logining = false;
                    console.log("[wx->adapter] on verify:", err, msg);
                    mvc.send(k7.platform.EVT_VERIFY_LOGIN_FAIL, err);
                }, (data) => {
                    this._logining = false;
                    const info = {
                        platformId: data.platform_id,
                        accessToken: data.access_token,
                        userId: data.user_id,
                        oauthToken: data.oauth_token,
                        oauthExpireTime: (new Date(data.oauth_token_expire)).getTime(),
                        channel: this._owner.tag
                    };
                    mvc.send(k7.platform.EVT_VERIFY_LOGIN_SUCCESS, info);
                });
            }
            getUserInfo(callback) {
                wx.getUserInfo({
                    success: (res) => {
                        if (!res) {
                            return;
                        }
                        this._userinfo = res.userInfo;
                        callback(res);
                    },
                    fail: (err) => {
                        callback(err);
                    }
                });
            }
            createUserInfoButton(callback) {
                if (!this._btnUserInfo) {
                    const bs = this._authBtnStyle || { left: 0, top: window.innerHeight / 2, width: window.innerWidth, height: window.innerHeight };
                    this._btnUserInfo = wx.createUserInfoButton({
                        type: 'text',
                        text: '',
                        withCredentials: true,
                        style: {
                            left: bs.left,
                            top: bs.top,
                            width: bs.width,
                            height: bs.height,
                            backgroundColor: '',
                            borderColor: '',
                            borderWidth: 1,
                            lineHeight: 0,
                            textAlign: 'center',
                            fontSize: 16,
                            borderRadius: 4
                        },
                    });
                    this._btnUserInfo.onTap((res) => {
                        if (res.userInfo) {
                            mvc.send(k7.platform.EVT_PLATFORM_ON_AUTH);
                            this._btnUserInfo.hide();
                            console.log('wx.onTap=>sucess');
                        }
                        else {
                            console.log('wx.onTap=>fail');
                        }
                        callback && callback(res);
                    });
                }
                this._btnUserInfo.show();
                mvc.send(k7.platform.EVT_PLATFORM_CREATE_AUTH_COMP);
                return this._btnUserInfo;
            }
            requestSubscribe(obj) {
                if (!obj)
                    return;
                if (obj.type == 0) {
                    wx.requestSubscribeSystemMessage(obj.params);
                }
                else if (obj.type == 1) {
                    wx.requestSubscribeMessage(obj.params);
                }
            }
        }
        platform.WxAccount = WxAccount;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxAD {
            constructor(owner) {
                this._owner = owner;
            }
            init() {
                this._banners = {};
                this._videos = {};
                this._customs = {};
                this._interstitital = null;
            }
            getDiffKey(obj, key) {
                const keys = Object.keys(obj);
                if (!!key) {
                    const old = keys.indexOf(key);
                    this.swapArr(keys, old, keys.length - 1);
                }
                const idx = Math.floor(Math.random() * (keys.length - 1));
                return keys[idx];
            }
            swapArr(arr, idx1, idx2) {
                const tmp = arr[idx2];
                arr[idx2] = arr[idx1];
                arr[idx1] = tmp;
                return arr;
            }
            createBannerAd(scene, align = "center", callback) {
                if (typeof wx.createBannerAd !== 'function') {
                    callback && callback();
                    return;
                }
                const configs = this._owner.config && this._owner.config['banner'];
                if (!configs) {
                    callback && callback();
                    return;
                }
                const key = this.getDiffKey(configs, this._lastBnrKey);
                const config = configs[key];
                if (!config) {
                    callback && callback();
                    return;
                }
                this._lastBnrKey = key;
                let banner = this._banners[key];
                if (!!banner) {
                    banner.destroy();
                }
                let width = config.width || 300;
                let left = 0;
                if (align == "center") {
                    left = window.innerWidth / 2 - width / 2;
                }
                else if (align == "right") {
                    left = window.innerWidth - width;
                }
                banner = wx.createBannerAd({
                    adUnitId: config.adUnitId,
                    style: { left, width, top: 0 }
                });
                this._banners[key] = banner;
                banner.onError((res) => {
                    if (res) {
                        console.error('BannerAd异常', res);
                        mvc.send(platform.EVT_PLATFORM_BANNER_ERROR, { code: res.errCode, msg: res.errMsg, scene });
                        callback && callback(null);
                    }
                });
                banner.onResize(res => {
                    banner && (banner.style.top = window.innerHeight - res.height + 0.1);
                });
                banner.onLoad(() => {
                    banner.show().then(t => {
                        const height = banner.style.realHeight;
                        banner && (banner.style.top = window.innerHeight - height + 0.1);
                        mvc.send(platform.EVT_PLATFORM_BANNER_LOAD, { scene });
                        callback && callback({ width: banner.style.realWidth, height: banner.style.realHeight });
                    }).catch((e) => {
                        callback && callback(null);
                        console.log("banner error:", e);
                    });
                });
            }
            hideBannerAd(scene) {
                if (!scene) {
                    for (let key in this._banners) {
                        let banner = this._banners[key];
                        banner && banner.destroy();
                    }
                }
                else {
                    let banner = this._banners[scene];
                    banner && banner.destroy();
                }
            }
            createVideoAd(pos, callback) {
                const config = this._owner.getConfig("video");
                if (!config) {
                    callback && callback(false);
                    return;
                }
                const key = this.getDiffKey(config, this._lastVideoKey);
                const vid = config[key];
                if (!vid) {
                    callback && callback(false);
                    return;
                }
                this._lastVideoKey = key;
                let video = this._videos[key];
                if (!!video) {
                    video.offClose(null);
                    video.offError(null);
                }
                else {
                    video = wx.createRewardedVideoAd({
                        adUnitId: vid,
                        multiton: true
                    });
                    this._videos[key] = video;
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
                    mvc.send(platform.EVT_PLATFORM_VIDEO_CLOSE);
                    callback && callback(Boolean(res && res.isEnded || res == undefined));
                    offEvent();
                };
                video.onError(error);
                video.onClose(close);
                video.show()
                    .catch(err => {
                    console.error("[wx->adp] excption on show video: ", err);
                    video.load()
                        .catch((err) => {
                        console.error("[wx->adp] excption on load video: ", err);
                    })
                        .then(() => {
                        video.show()
                            .then(() => {
                            console.error("[wx->adp] show video after load.");
                            mvc.send(k7.platform.EVT_PLATFORM_VIDEO_LOAD, { scene: pos });
                        });
                    });
                })
                    .then((res) => {
                    console.log("");
                    mvc.send(k7.platform.EVT_PLATFORM_VIDEO_LOAD, { scene: pos });
                });
            }
            createCustomAd(scene, callback) {
                if (typeof wx.createCustomAd !== 'function') {
                    callback && callback();
                    return;
                }
                let customAdCfg = this._owner.getConfig("customAd");
                if (!customAdCfg || !customAdCfg[scene]) {
                    callback && callback();
                    return;
                }
                let customAd = this._customs[scene];
                if (customAd) {
                    customAd.destroy();
                }
                let curCfg = customAdCfg[scene];
                customAd = wx.createCustomAd({
                    adUnitId: curCfg.adUnitId,
                    adIntervals: curCfg.adIntervals,
                    style: {
                        left: curCfg.left,
                        top: curCfg.top,
                        fixed: true
                    }
                });
                customAd.show();
                this._customs[scene] = customAd;
                customAd.onError(err => {
                    console.error("CustomAd 异常:", err);
                    mvc.send(platform.EVT_PLATFORM_CUSTOMAD_ERROR, { code: err.errCode, msg: err.errMsg, scene: scene });
                });
                customAd.onLoad(() => {
                    callback && callback();
                    console.log('原生模板广告加载成功!');
                    mvc.send(platform.EVT_PLATFORM_CUSTOMAD_LOAD, { scene: scene });
                });
                customAd.onClose(() => {
                    console.log('原生模板广告关闭');
                });
            }
            hideCustomAd(scene) {
                if (!scene) {
                    for (let key in this._customs) {
                        let customAd = this._customs[key];
                        customAd && customAd.destroy();
                    }
                }
                else {
                    let customAd = this._customs[scene];
                    customAd && customAd.destroy();
                }
            }
            createInterstitialAd(scene, callback) {
                const pcfg = this._owner.getConfig("interstitial");
                if (!pcfg) {
                    return;
                }
                const ad_uid = pcfg[scene];
                if (!ad_uid) {
                    return;
                }
                if (!this._interstitital) {
                    this._interstitital = wx.createInterstitialAd({
                        adUnitId: ad_uid
                    });
                    this._interstitital.onError((res) => {
                        if (res) {
                            callback && callback(false);
                        }
                    });
                    this._interstitital.onClose(() => { });
                }
                this._interstitital.show()
                    .catch((err) => {
                    this._interstitital.load()
                        .then(() => this._interstitital.show(), callback && callback(true));
                });
            }
        }
        platform.WxAD = WxAD;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        platform.SPM_TYPE = {
            "1044": '9.14509',
            "1007": '9.14509',
            "1008": '9.14509',
            "1095": '9.14510',
            "1045": '9.14510',
            "1067": '9.14510',
            "1046": '9.14510',
            "1058": '9.14511',
            "1043": '9.14511',
            "1053": '9.14512',
            "1005": '9.14512',
            "1035": '9.14513',
            "1048": '9.14514',
            "1013": '9.14514',
            "1011": '9.14514',
            "1037": '9.14515',
            "0": '9.14516'
        };
        platform.SCENE = {
            PROFILE_PULL: 1001,
            PROFILE_FIND: 1089,
            DESKTOP: 1023,
            SUBSCRIBE: 1014
        };
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxDevice {
            constructor(owner) {
                this._owner = owner;
            }
            get system() { return this._system; }
            get netType() { return this._nettype; }
            init() {
                wx.onNetworkStatusChange((res) => {
                    this.getNetworkType(() => {
                        mvc.send(k7.platform.EVT_PLATFORM_NETCHANGE, res.isConnected);
                    });
                });
                wx.setKeepScreenOn({
                    keepScreenOn: true,
                });
                wx.getSystemInfo({
                    success: (res) => {
                        this._system = res;
                    },
                    fail: (err) => {
                        console.log("[wx->device] ", err);
                    },
                    complete: () => { }
                });
                this.getNetworkType();
            }
            getNetworkType(complete) {
                wx.getNetworkType({
                    success: (res) => {
                        this._nettype = res.networkType;
                    },
                    complete
                });
            }
            getSystemInfo() {
                const sys = this._system;
                if (!!sys) {
                    const info = {
                        screenWidth: sys.screenWidth,
                        screenHeight: sys.screenHeight,
                        safeArea: this.flatCopy(sys.safeArea),
                        windowWidth: sys.windowWidth,
                        windowHeight: sys.windowHeight
                    };
                    return info;
                }
                return null;
            }
            flatCopy(obj) {
                const ret = {};
                for (let key in obj) {
                    ret[key] = obj[key];
                }
                return ret;
            }
            getMenuButtonStyle() {
                return wx.getMenuButtonBoundingClientRect();
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
            saveImageToPhotosAlbum(object) {
                wx.saveImageToPhotosAlbum({
                    filePath: object.filePath,
                    success(res) {
                        wx.showModal({
                            title: '提示',
                            content: '小程序码已保存到相册',
                            showCancel: false,
                            success: (res) => { }
                        });
                    },
                    fail: (res) => { }
                });
            }
            previewImage(urls, current) {
                wx.previewImage({
                    urls, current,
                    success: () => {
                        console.log("预览图片成功");
                    },
                    fail: () => {
                        console.log("预览图片失败");
                    },
                    complete: () => {
                        console.log("preview image complete.");
                    }
                });
            }
            vibrateLong() {
                wx.vibrateLong(null);
            }
            vibrateShort() {
                wx.vibrateShort(null);
            }
        }
        platform.WxDevice = WxDevice;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxEnv {
            constructor(owner) {
                this._owner = owner;
            }
            get launchOpts() { return this._launchOpts; }
            init() {
                wx.onShow((res) => {
                    this._launchOpts = res;
                    mvc.send(k7.platform.EVT_PLATFORM_ON_SHOW, res);
                });
                wx.onHide(() => {
                    mvc.send(k7.platform.EVT_PLATFORM_ON_HIDE);
                });
                this._launchOpts = wx.getLaunchOptionsSync();
                this.setMenuShare();
                this.setShareProxy();
            }
            setShareProxy() {
                let shareBegin = null;
                let onSuccess = null;
                let onFailed = null;
                let onHideTimes = 0;
                let onShowTimes = 0;
                const getNowMs = () => {
                    return Date.now();
                };
                window['wx'] = new Proxy(wx, {
                    get: function (target, key) {
                        if (key == "shareAppMessage") {
                            let ret = window['Reflect'].get(target, "shareAppMessage");
                            const f = (obj) => {
                                onSuccess = obj.success;
                                obj.success = null;
                                onFailed = obj.fail;
                                obj.fail = null;
                                shareBegin = getNowMs();
                                return ret(obj);
                            };
                            return f;
                        }
                        else {
                            return window['Reflect'].get(target, key);
                        }
                    }
                });
                wx.onShow(() => {
                    onShowTimes++;
                    if (!shareBegin) {
                        return;
                    }
                    if (onShowTimes == onHideTimes) {
                        const onBackgroundTimeGap = getNowMs() - shareBegin;
                        if (onBackgroundTimeGap <= 2000) {
                            onFailed && (console.log("onShow中执行分享失败回调"), onFailed());
                        }
                        else {
                            onSuccess && (console.log("onShow中执行分享成功回调"), onSuccess({ shareTickets: ["success"] }));
                        }
                        onFailed = null;
                        onSuccess = null;
                        shareBegin = null;
                        onShowTimes = onHideTimes = 0;
                    }
                });
                wx.onHide(() => {
                    onHideTimes++;
                });
            }
            setMenuShare() {
                wx.showShareMenu({
                    withShareTicket: true
                });
                wx.onShareAppMessage(() => {
                    return this.getRandomShare();
                });
            }
            getRandomShare() {
                const wxconfig = this._owner.config;
                const share = wxconfig && wxconfig.share;
                if (share && share.length) {
                    let idx = Math.floor(Math.random() * share.length);
                    return share[idx];
                }
                return {
                    title: "",
                    imageUrl: ""
                };
            }
            shareAppMessage(obj, callback) {
                const shareInfo = (obj && obj.shareInfo) || this.getRandomShare();
                wx.shareAppMessage({
                    title: shareInfo.title,
                    imageUrl: shareInfo.imageUrl,
                    query: obj && obj.query,
                    success: () => {
                        callback && callback();
                    },
                    fail: () => {
                        wx.showToast({
                            title: Math.random() > 0.5 ? "请分享到群！" : "请分享到不同群聊"
                        });
                    }
                });
            }
            setClipboardData(context) {
                wx.setClipboardData({
                    data: context,
                    success: function (res) {
                        wx.showModal({
                            title: '提示',
                            content: '复制成功',
                            showCancel: false,
                            success: function (res) { }
                        });
                    }
                });
            }
            createCanvas() {
                let canvas = wx.createCanvas();
                return canvas;
            }
            createImage() {
                let image = wx.createImage();
                return image;
            }
            jumpToGame(idx) {
                const wxconfig = this._owner.config;
                const jumps = wxconfig && wxconfig.jump;
                const jump = jumps && jumps[idx];
                if (!jump)
                    return;
                wx.navigateToMiniProgram({
                    appId: jump.jumpAppid,
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
                wx.navigateToMiniProgram({
                    appId: obj.param.appid || "",
                    extraData: "双扣",
                    success: (res) => {
                        obj.success && obj.success(res);
                    },
                    fail: (err) => {
                        obj.fail && obj.fail(err);
                    }
                });
            }
            showSysModal(obj) {
                wx.showModal({
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
                wx.showToast({
                    title: obj.title,
                    icon: obj.icon || "loading"
                });
            }
            hideSysToast() {
                wx.hideToast(null);
            }
            showLoading(object) {
                wx.showLoading(object);
            }
            hideLoading() {
                wx.hideLoading({});
            }
        }
        platform.WxEnv = WxEnv;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxRecharge {
            constructor(owner) {
                this._owner = owner;
            }
            init() {
            }
            get order_platform() {
                const sys = this._owner.systemInfo;
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
                const sys = this._owner.systemInfo;
                if (!sys) {
                    return false;
                }
                const ptm = sys.platform || "";
                if (!!ptm.match(/android|windows/ig)) {
                    return true;
                }
                if (!!ptm.match(/devtool/ig)) {
                    const stm = sys.system || "";
                    return !!stm.match(/android/ig);
                }
                return false;
            }
            getOrderParam(obj) {
                if (!obj)
                    return {};
                const param = {
                    recharge_id: obj.rechargeId,
                    platform: this.order_platform,
                    mall_auto_exchange: !!obj.aotuExchage,
                    replace_recharge: !!obj.targetUserId,
                    inapp_spm: 20205
                };
                if (!!obj.targetUserId) {
                    param["target_user_id"] = obj.targetUserId;
                }
                if (!!obj.mallItemId) {
                    param["mall_item_id"] = obj.mallItemId;
                }
                if (!!obj.lotteryId) {
                    param["lottery_id"] = obj.lotteryId;
                }
                return param;
            }
            getBalance() {
                return new Promise((resolve, reject) => {
                    mapi.getMidasBalance({}, res => {
                        if (res && res.code == 200) {
                            resolve(res.data.balance);
                        }
                        else {
                            reject(res.msg);
                        }
                    });
                });
            }
            behalf() { }
            order() {
                const args = arguments;
                if (args.length > 1) {
                    this.order_old(args[0], args[1], args[2], args[3]);
                }
                else {
                    this.order_new(args[0]);
                }
            }
            order_new(obj) {
                const req = {
                    platform: "wechat",
                    action: "lightAuth",
                    version: "v3.1",
                    body: obj.params,
                    fail: (err, msg) => {
                        console.log("[wx->adapter] on order:", err, msg);
                        const order = obj.order;
                        order.fail && order.fail(err, msg);
                    },
                    success: (data) => {
                        const opay = obj.pay;
                        if (data.is_enough) {
                            const pb = this.getPaybackParam(data);
                            opay.success(pb);
                            opay.complete(true);
                            return;
                        }
                        data.quantity = data.price * 10;
                        data.env -= 1;
                        this.recharge(data, (successed) => {
                            opay.complete(successed);
                            if (successed) {
                                const pb = this.getPaybackParam(data);
                                opay.success(pb);
                            }
                            else {
                                opay.fail();
                                mvc.send(k7.platform.EVT_PLATFORM_PAY_FAIL);
                            }
                        });
                    }
                };
                mapi.miniPay(req);
            }
            getPaybackParam(info) {
                return {
                    d: {
                        recharge_order_no: info.recharge_order_no,
                        payer_user_id: info.payer_user_id
                    },
                    url: info.call_back_url,
                    verify: true
                };
            }
            order_old(params, onOrderFail, onRechargeSuccess, onPay) {
                delete params.yApi;
                const req = {
                    platform: "wechat",
                    action: "lightAuth",
                    version: "v3.1",
                    body: {
                        recharge_id: params.recharge_id,
                        mall_auto_exchange: params.mall_auto_exchange,
                        replace_recharge: params.replace_recharge,
                        target_user_id: params.target_user_id || "",
                        inapp_spm: params.inapp_spm || "",
                        platform: params.platform
                    },
                    fail: (err, msg) => {
                        console.log("[wx->adapter] on order:", err, msg);
                        onOrderFail && onOrderFail();
                    },
                    success: (data) => {
                        if (data.is_enough) {
                            this.onGetOrderInfo(data, onRechargeSuccess);
                            return;
                        }
                        data.quantity = data.price * 10;
                        data.env -= 1;
                        this.recharge(data, (IsSuccess) => {
                            onPay && onPay(IsSuccess);
                            if (IsSuccess) {
                                this.onGetOrderInfo(data, onRechargeSuccess);
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
                    recharge_order_no: data.recharge_order_no,
                    payer_user_id: data.payer_user_id
                };
                let url = data.call_back_url;
                onRechargeSuccess && onRechargeSuccess({ url, d, verify: true });
            }
            recharge(data, callback) {
                let buyQuantity = data.quantity;
                let env = data.env;
                const cfg = this._owner.config;
                const offerId = cfg && cfg.midasOfferId;
                wx.requestMidasPayment({
                    mode: 'game',
                    env: env,
                    offerId: offerId,
                    currencyType: 'CNY',
                    platform: 'android',
                    buyQuantity: buyQuantity,
                    zoneId: '1',
                    fail: (res) => {
                        console.log('米大师支付失败', res);
                        callback(false);
                    },
                    success: (res) => {
                        console.log('米大师支付成功', res);
                        callback(true);
                    },
                    complete: () => { }
                });
            }
        }
        platform.WxRecharge = WxRecharge;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        class WxSupport {
            constructor(owner) {
                this._owner = owner;
            }
            init() {
            }
            customService() {
                const info = this._owner.userInfo;
                let name = info.nickName;
                let avatarUrl = info.avatarUrl;
                let id = mapi.userid;
                let sessionFrom = '';
                let remoteImgUrl = 'https://download.qipai007.com/app-res/shengji-wxgame/v2.6.0/cloud/custom.png';
                wx.openCustomerServiceConversation({
                    sessionFrom: sessionFrom,
                    showMessageCard: true,
                    sendMessageTitle: `回复"完整"`,
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
            createGameClub(obj, callback) {
                if (!obj) {
                    return;
                }
                if (!this._btnClub) {
                    this._btnClub = wx.createGameClubButton({
                        type: 'image',
                        text: '',
                        image: '',
                        style: {
                            left: obj.left,
                            top: obj.top,
                            width: obj.width,
                            height: obj.height,
                            backgroundColor: '',
                            borderColor: '',
                            borderWidth: 0,
                            borderRadius: 0,
                            textAlign: 'center',
                            fontSize: 16,
                            lineHeight: 4
                        },
                        icon: 'light'
                    });
                    this._btnClub.onTap(() => {
                        callback();
                    });
                }
                this._btnClub.show();
                return this._btnClub;
            }
            hideGameClub() {
                if (this._btnClub) {
                    this._btnClub.hide();
                }
            }
            destroyGameClub() {
                if (this._btnClub) {
                    this._btnClub.destroy();
                    this._btnClub = null;
                }
            }
            setUserCloudStorage(obj) {
                wx.setUserCloudStorage(obj);
            }
            showFeedBackBtn(opt) {
                if (typeof wx.createFeedbackButton !== 'function') {
                    return;
                }
                if (this._btnFeedBack && opt.hide) {
                    this._btnFeedBack.hide();
                    return;
                }
                if (this._btnFeedBack) {
                    this._btnFeedBack.show();
                    return;
                }
                const obj = {
                    type: opt.type,
                    style: {
                        left: opt.left,
                        top: opt.top,
                        width: opt.width,
                        height: opt.height,
                        lineHeight: 40,
                        backgroundColor: '#00000000',
                        textAlign: 'center',
                        fontSize: 16,
                        borderRadius: 4,
                        borderColor: '#000000',
                        borderWidth: 0
                    }
                };
                if (opt.type == "image") {
                    obj.image = opt.url;
                }
                else if (opt.type == "text") {
                    obj.text = opt.text || "";
                }
                this._btnFeedBack = wx.createFeedbackButton(obj);
            }
            hideFeedBack() {
                if (this._btnFeedBack) {
                    this._btnFeedBack.hide();
                }
            }
        }
        platform.WxSupport = WxSupport;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
