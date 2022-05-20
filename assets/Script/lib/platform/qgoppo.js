window.k7 = window.k7 || {};
/// <reference path="../../bin/platform.d.ts" />
/**
 * @desc oppo小游戏平台适配器
 * @author yu.zhang
 * @since 7/1/20
 */

/// <reference path="../../bin/platform.d.ts" />
/**
 * @desc oppo小游戏平台适配器
 * @author yu.zhang
 * @since 7/1/20
 */
(function (k7) {
    var platform;
    (function (platform) {
        /**oppo小游戏授权标记 */
        const STG_POLICY = "k7_oppo_policy";
        class OppoAdapter {
            constructor() {
                /** */
                this._config = null;
                this._networkType = "";
            }
            get launchQuery() { return this._launchOptions && this._launchOptions.query; }
            get systemInfo() { return this._systemInfo; }
            get profile() { return true; /* this.sceneCheck("quickapp"); */ }
            get desktop() { return false; /* this.sceneCheck("shortcut"); */ }
            get subsmsg() { return false; }
            get hasMenuBar() { return false; }
            get hasAuthComp() { return false; }
            get networkType() { return this._networkType; }
            get tag() { return OppoAdapter.PLATFORM_TAG; }
            get adService() { return true; }
            get config() { return this._config; }
            get userInfo() { return this._userInfo; }
            get launchOptions() { return this._launchOptions; }
            get subscribe() { return this._subscribe; }
            set config(val) { this._config = val; }
            init(config) {
                this._bannerAdInfo = {};
                this._config = config || {};
                this.getLaunchOptions();
                this.getNetworkType();
                qg.onNetworkStatusChange((res) => {
                    // 变更为网络变更事件发射
                    mvc.send(k7.platform.EVT_PLATFORM_NETCHANGE, res.isConnected);
                });
                qg.getSystemInfo({
                    success: (res) => {
                        this._systemInfo = res;
                        console.log("@系统信息：", JSON.stringify(res));
                    },
                    fail: () => {
                        console.log('@getSystemInfo:fail');
                    },
                    complete: () => {
                    }
                });
                qg.setKeepScreenOn({
                    keepScreenOn: true,
                    success: () => {
                        console.log('设置屏幕常亮成功');
                    },
                    fail: () => {
                        console.log('设置屏幕常亮失败');
                    }
                });
                qg.onShow((res) => {
                    mvc.send(k7.platform.EVT_PLATFORM_ON_SHOW);
                });
                qg.onHide(() => {
                    console.log('=>onHide');
                    mvc.send(k7.platform.EVT_PLATFORM_ON_HIDE);
                });
            }
            getLaunchOptions() {
                let opts = qg.getLaunchOptionsSync();
                this._launchOptions = {
                    query: opts.query,
                    referrerInfo: opts.referrerInfo
                };
            }
            getSystemInfo() {
                return null;
            }
            getMenuButtonStyle() {
                return null;
            }
            getNetworkType() {
                let success = (res) => {
                    this._networkType = res.networkType;
                };
                qg.getNetworkType({ success });
            }
            gotoAuthorizePage() { }
            login() { }
            getSetting(param) { }
            getStorage(key) {
                const ret = cc.sys.localStorage.getItem(key);
                return ret ? JSON.parse(ret) : null;
            }
            setStorage(key, value) {
                cc.sys.localStorage.setItem(key, JSON.stringify(value));
            }
            login1(force) {
                // 
                const set = this.getStorage(STG_POLICY);
                if (!set && !force) {
                    mvc.on(platform.EVT_QUICKGAME_SETTING, this, (agree) => {
                        this.setStorage(STG_POLICY, agree);
                        if (agree) {
                            this.login1(true);
                        }
                        else {
                            this.exitGame();
                            return;
                        }
                    });
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SKIP);
                    return;
                }
                const success = (res) => {
                    this._userInfo = res.data;
                    this._userInfo.avatarUrl = res.data["avatar"];
                    console.log("[oppo->adp] login success: ", res);
                    this._userInfo.errMsg = "getUserInfo:ok";
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.onGetLoginInfo(res);
                };
                const fail = (res) => {
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                };
                qg.login({ success, fail });
            }
            onGetLoginInfo(res) {
                // client_type 0(未知)，1(PC)，2(移动)，3(小游戏)
                mapi.miniLogin({
                    platform: "oppo",
                    code: res.data.token,
                    body: {
                        spm: "9.14505",
                        os_type_str: "android",
                        client_type: 3
                    },
                    fail: (err, msg) => {
                        console.log("[oppo->adp] verify fail: ", err, msg);
                        mvc.send(k7.platform.EVT_VERIFY_LOGIN_FAIL);
                    },
                    success: (data) => {
                        const info = {
                            platformId: data.platform_id,
                            accessToken: data.access_token,
                            userId: data.user_id,
                            oauthToken: data.oauth_token,
                            oauthExpireTime: (new Date(data.oauth_token_expire)).getTime(),
                            channel: this.tag
                        };
                        mvc.send(k7.platform.EVT_VERIFY_LOGIN_SUCCESS, info);
                    }
                });
            }
            getBalance() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(0);
                    }, 0);
                });
            }
            getOrderParam(object) {
                if (!object)
                    return {};
                return {
                    recharge_id: mapi.stage == "test" ? 1 : object.rechargeId,
                    mall_auto_exchange: !!object.aotuExchage,
                    mall_item_id: object.mallItemId,
                    lottery_id: object.lotteryId,
                    app_version: "2",
                    engine_version: "1060",
                    platform: "android"
                };
            }
            order() {
                const args = arguments;
                let body, onOrderFail, onRechargeSuccess, onPay;
                if (args.length <= 1) {
                    const obj = args[0];
                    body = obj.params;
                    onOrderFail = obj.order.fail;
                    onRechargeSuccess = obj.pay.success;
                    onPay = obj.pay.complete;
                }
                else {
                    body = args[0];
                    onOrderFail = args[1];
                    onRechargeSuccess = args[2];
                    onPay = args[3];
                }
                if (mapi.stage == "test") {
                    mapi.appid = "10001";
                }
                const req = {
                    platform: "oppo",
                    body,
                    fail: (err, msg) => {
                        console.log("[qg->adapter]on order:", err, msg);
                        onOrderFail && onOrderFail(err, msg);
                    },
                    success: (data) => {
                        this.recharge(data, (suc) => {
                            onPay && onPay(suc);
                            if (suc) {
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
            /**付款*/
            onGetOrderInfo(data, onRechargeSuccess) {
                let d = {
                    recharge_order_no: data.order_no
                };
                let url = "";
                onRechargeSuccess && onRechargeSuccess({ url, d, verify: false });
            }
            /**发起oppo支付流程 */
            recharge(data, callback) {
                qg.pay({
                    appId: parseInt(data.app_id),
                    token: data.token,
                    timestamp: parseInt(data.timestamp),
                    orderNo: data.order_no,
                    paySign: data.sign,
                    success: (ret) => {
                        callback && callback(true);
                    },
                    fail: (errMsg, errCode) => {
                        console.log("@支付失败：%s, %s", errMsg, errCode);
                        callback && callback(false);
                    }
                });
            }
            setClipboardData(context) {
                qg.setClipboardData({
                    data: context,
                    success: () => {
                        qg.showModal({
                            title: '提示',
                            content: '复制成功',
                            showCancel: false,
                        });
                    },
                    fail: () => {
                        qg.showModal({
                            title: '提示',
                            content: '复制失败',
                            showCancel: false,
                        });
                    }
                });
            }
            get bRecharge() { return true; }
            shareAppMessage(object, callback) {
            }
            createBannerAd(pos, callback) {
                if (!window['qg'] || typeof qg.createBannerAd != "function") { //做低版本兼容
                    return;
                }
                const configs = this._config.banner;
                if (!configs || !configs[pos]) {
                    console.error("[oppo->adapter] banner配置不存在 %s", pos);
                    return;
                }
                const config = configs[pos];
                let banner = this._bannerAdInfo[pos];
                if (!!banner) {
                    banner.offError(null);
                    banner.offResize(null);
                }
                else {
                    const width = config.width || 300;
                    const height = config;
                    const dlt = window.innerWidth - width;
                    let left = 0;
                    if (config.left == 1) {
                        left = dlt / 2;
                    }
                    else if (config.left == 2) {
                        left = dlt;
                    }
                    banner = this._bannerAdInfo[pos] = qg.createBannerAd({
                        adUnitId: config.adUnitId,
                        style: { top: config.top, left, width, height: config.height }
                    });
                }
                banner.onError((res) => {
                    if (res) {
                        console.error('BannerAd异常', res);
                    }
                });
                banner.onResize(res => {
                    banner.style.top = window.innerHeight - res.height + 0.1;
                });
                banner.show()
                    .then(() => {
                    callback && callback({ width: banner.style.width, height: banner.style.height });
                })
                    .catch(err => {
                    console.log("[Oppo->Error] Banner show error", err);
                });
            }
            hideBannerAd(scene) {
                if (!scene) {
                    for (let key in this._bannerAdInfo) {
                        let banner = this._bannerAdInfo[key];
                        banner && banner.hide();
                    }
                }
                else {
                    let banner = this._bannerAdInfo[scene];
                    banner && banner.hide();
                }
            }
            createVideoAd(pos, callback) {
                const error = (res) => {
                    if (res) {
                        console.error('VideoAd异常', res);
                        mvc.send(platform.EVT_PLATFORM_VIDEO_ERROR, { callback, code: res.errCode, msg: res.errMsg, pos });
                        callback && callback(null);
                        this._videoAd.offError(error);
                    }
                };
                const close = (res) => {
                    callback && callback(!!res && res.isEnded);
                    this._videoAd.offClose(close);
                };
                if (this._videoAd) {
                    this._videoAd.offError(null);
                    this._videoAd.offClose(null);
                }
                pos = "plaza";
                const vCfg = this._config && this._config.video;
                const adUid = vCfg && vCfg[pos];
                if (!adUid) {
                    console.error("[oppo->adapter] video广告id不存在");
                    return;
                }
                if (!this._videoAd) {
                    this._videoAd = qg.createRewardedVideoAd({
                        adUnitId: adUid
                    });
                }
                this._videoAd.onError(error);
                this._videoAd.onClose(close);
                this._videoAd.load()
                    .then(() => this._videoAd.show());
            }
            createNaviteAd() {
            }
            createCustomAd() { }
            hideCustomAd() { }
            behalf() { }
            addToDesktop() { }
            addColorSign() { }
            setUserCloudStorage() { }
            createInterstitialAd(pos, callback) { }
            customService() { }
            requestSubscribe() { }
            createGameClub() { }
            hideGameClub() { }
            destroyGameClub() { }
            showFeedBackBtn() { }
            hideFeedBackBtn() { }
            jumpToGame(index) {
                const jcfg = this._config && this._config['jump'];
                let jumpCfg = jcfg && jcfg[index];
                if (!jumpCfg)
                    return;
            }
            navigateTo(obj) {
            }
            vibrateShort() {
                qg.vibrateShort();
            }
            vibrateLong() {
                qg.vibrateLong();
            }
            saveImageToPhotosAlbum(object) {
            }
            createCanvas() {
                return document.createElement("canvas");
            }
            createImage() {
                return null; // hbs.createImage();
            }
            saveImageToTempFileSync(canvas, info) {
                return "";
            }
            previewImage() { }
            showLoading(object) {
                qg.showLoading(object);
            }
            hideLoading(object) {
                qg.hideLoading();
            }
            showSysToast() { }
            hideSysToast() { }
            showSysModal() { }
            feedBack(obj) { }
            exitGame() {
                qg.exitApplication({
                    success: () => {
                        console.log("[oppo->adp] exit game success.");
                    }
                });
            }
        }
        OppoAdapter.PLATFORM_TAG = "oppo";
        platform.OppoAdapter = OppoAdapter;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
