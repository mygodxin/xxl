window.k7 = window.k7 || {};
/// <reference path="../../bin/platform.d.ts" />

/// <reference path="../../bin/platform.d.ts" />
(function (k7) {
    var platform;
    (function (platform) {
        class HuaweiAdapter {
            constructor() {
                /** */
                this._config = null;
                this._networkType = "";
                /**防止短时间频繁点击触发视频广告拉取 */
                this._last_video_time = 0;
            }
            get launchQuery() { return this._launchOptions && this._launchOptions.query; }
            get systemInfo() { return this._systemInfo; }
            get profile() { return this.sceneCheck("quickapp"); }
            get desktop() { return this.sceneCheck("shortcut"); }
            get subsmsg() { return this.sceneCheck(""); }
            get hasMenuBar() { return false; }
            get hasAuthComp() { return false; }
            get networkType() { return this._networkType; }
            get tag() { return HuaweiAdapter.PLATFORM_TAG; }
            get adService() { return true; }
            get config() { return this._config; }
            get userInfo() { return this._userInfo; }
            get launchOptions() { return this._launchOptions; }
            get subscribe() { return this._subscribe; }
            set config(val) {
                this._config = val;
                if (this._config.debug) {
                    this.setStorage(platform.HW_STG.ad_set, false);
                }
            }
            sceneCheck(type) {
                const launch = this._launchOptions;
                if (!launch || !launch.referrerInfo)
                    return false;
                return launch.referrerInfo.type == type;
            }
            init(config) {
                this._config = config || {};
                this._bannerAds = {};
                this._videosAds = {};
                this._interAd = null;
                this.getLaunchOptions();
                this.getSystemInfoSync();
                this.getNetworkType();
                qg.onNetworkStatusChange((res) => {
                    // 变更为网络变更事件发射
                    this.getNetworkType(() => {
                        mvc.send(k7.platform.EVT_PLATFORM_NETCHANGE);
                    });
                });
                qg.setKeepScreenOn({
                    keepScreenOn: true,
                    success: () => {
                        console.log("设置屏幕常亮成功");
                    },
                    fail: () => {
                        console.log("设置屏幕常亮失败");
                    }
                });
                qg.onShow((res) => {
                    if (!!res) {
                        this._launchOptions = res;
                    }
                    mvc.send(k7.platform.EVT_PLATFORM_ON_SHOW);
                });
                qg.onHide(() => {
                    mvc.send(k7.platform.EVT_PLATFORM_ON_HIDE);
                });
            }
            getLaunchOptions() {
                this._launchOptions = qg.getLaunchOptionsSync();
            }
            getSystemInfoSync() {
                qg.getSystemInfo({
                    success: (res) => {
                        console.log("[qg->adp] system info：", JSON.stringify(res));
                        this._systemInfo = res;
                    },
                    fail: () => {
                        console.error("[qg->adp] getSystemInfo:fail");
                    }
                });
            }
            getNetworkType(callback) {
                let success = (res) => {
                    this._networkType = res.networkType;
                };
                qg.getNetworkType({ success, complete: callback });
            }
            getStorage(key) {
                return cc.sys.localStorage.getItem(key);
            }
            setStorage(key, value) {
                cc.sys.localStorage.setItem(key, value);
            }
            loginTip() {
                qg.showModal({
                    title: "提示消息",
                    content: "为确保您的最佳游戏体验，\n请使用华为账号登录本游戏",
                    cancelText: "退出游戏",
                    confirmText: "重新登录",
                    success: (res) => {
                        if (res.cancel) {
                            this.exitGame();
                        }
                        else if (res.confirm) {
                            this.login1();
                        }
                    }
                });
            }
            getSystemInfo() {
                return null;
            }
            getMenuButtonStyle() {
                return null;
            }
            login1(force) {
                // 登陆前，判定广告隐私策略是否得到用户授权，如果未授权，需要弹窗显示隐私数据使用策略，并等待用户同意
                const uset = this.getStorage(platform.HW_STG.ad_set);
                if (!uset) {
                    // 广告使用用户隐私数据授权设置事件监听
                    mvc.on(platform.EVT_HW_AD_SET, this, (agree) => {
                        this.setStorage(platform.HW_STG.ad_set, agree);
                        if (!agree) {
                            this.exitGame();
                            return;
                        }
                        else {
                            this.login1();
                        }
                    });
                    mvc.send(platform.EVT_HW_SET_ADPRIVATE);
                    return;
                }
                else {
                    this.preloadVideoAd();
                }
                // 华为的登录授权流程简洁，直接调用gameLoginWithReal即可
                let appid = this._config.appid;
                let success = (res) => {
                    this._userInfo = res;
                    this._userInfo["errMsg"] = "getUserInfo:ok";
                    mvc.send(k7.platform.EVT_PLATFORM_LOGIN_SUCCESS);
                    this.onGetLoginInfo(res);
                };
                qg.gameLoginWithReal({
                    forceLogin: 1,
                    appid, success,
                    fail: (data, code) => {
                        console.log("[qg->adp] login fail:", data, code);
                        if (code == 7004 || code == 2012) {
                            this.loginTip();
                        }
                        else {
                            mvc.send(k7.platform.EVT_PLATFORM_LOGIN_FAIL);
                        }
                    },
                    complete: () => { }
                });
            }
            getSetting(param) {
                let success = (res) => {
                    let auth = {
                        userInfo: res.authSetting["scope.userInfo"],
                        userLocation: res.authSetting["scope.userLocation"],
                        run: res.authSetting["scope.werun"],
                        writePhotosAlbum: res.authSetting["scope.writePhotosAlbum"]
                    };
                    let setting = {
                        authSetting: auth
                    };
                    param.success(setting);
                };
                let fail = param.fail;
                let object = { success, fail };
                qg.getSetting(object);
            }
            gotoAuthorizePage(callback) {
                // let scope = "userInfo";
                // let params: qg.UserInfoExtraParam = {
                //     appid: "102031899",
                //     type: "token",
                //     scope: "scope.baseProfile",
                //     state: ""
                // }
                // let success = (res: any[])=>{
                //     if(!res) {
                //         return
                //     }
                //     if(res[0] == "userInfo") {
                //         this._authInfo = res[1];
                //         callback({allow: true, name: res[1].nickName});
                //     }
                // }
                // let fail = (res?:any)=>{
                //     callback({allow: false, name: ""});
                // }
                // let object = {scope, params, success, fail};
                // qg.authorize(object);
            }
            login() {
            }
            onGetLoginInfo(res) {
                mapi.miniLogin({
                    code: "",
                    platform: "huawei",
                    body: {
                        player_id: res.playerId,
                        player_level: res.playerLevel,
                        player_ssign: res.gameAuthSign,
                        ts: res.ts,
                        display_name: res.displayName,
                        image_uri: res.imageUri,
                        spm: platform.HW_SPM,
                        os_type_str: "android",
                        client_type: 3
                    },
                    method: "post"
                }, (res) => {
                    if (res.code != 200) {
                        console.log("[qg->adp] verify fail:", res.code, res.msg);
                        mvc.send(k7.platform.EVT_VERIFY_LOGIN_FAIL);
                        return;
                    }
                    const data = res.data;
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
            }
            getOrderParam(object) {
                if (!object)
                    return {};
                return {
                    recharge_id: mapi.stage == "test" ? 1 : object.rechargeId,
                    platform: "android",
                    mall_auto_exchange: !!object.aotuExchage,
                    mall_item_id: object.mallItemId,
                    lottery_id: object.lotteryId
                };
            }
            order() {
                const args = arguments;
                if (args.length > 1) {
                    this.order_old(args[0], args[1], args[2], args[3]);
                }
                else {
                    const obj = args[0];
                    this.order_old(obj.params, obj.order.fail, obj.pay.success, obj.pay.complete);
                }
            }
            order_old(params, orderfail, paysuccess, paycomplete) {
                const req = {
                    platform: "huawei",
                    body: params,
                    fail: (err, msg) => {
                        console.log("[qg->adp] on order:", err, msg);
                        orderfail && orderfail();
                    },
                    success: (data) => {
                        // 若不需要充值则直接兑换
                        if (data.is_enough) {
                            paysuccess({ verify: false });
                            return;
                        }
                        this.recharge(data, (suc) => {
                            paycomplete && paycomplete(suc);
                            if (suc) {
                                paysuccess({ verify: false });
                            }
                            else {
                                mvc.send(k7.platform.EVT_PLATFORM_PAY_FAIL);
                            }
                        });
                    }
                };
                mapi.miniPay(req);
            }
            behalf() { }
            recharge(data, callback) {
                let info = {
                    amount: data.amount,
                    applicationID: data.application_id,
                    productDesc: data.product_desc,
                    productName: data.product_name,
                    requestId: data.request_id,
                    serviceCatalog: "X6",
                    merchantId: data.merchant_id,
                    merchantName: "杭州开启网络科技有限公司",
                    country: "CN",
                    currency: "CNY",
                    url: data.call_back_url,
                    urlver: "2",
                    sdkChannel: 3,
                    sign: data.sign,
                    publicKey: data.public_key
                };
                qg.hwPay({
                    orderInfo: info,
                    success: (ret) => {
                        callback && callback(true);
                    },
                    fail: (msg, code) => {
                        console.log("@支付失败：%s, [%s]", msg, code);
                        callback && callback(false);
                    }
                });
            }
            get bRecharge() {
                return true;
            }
            getBalance() {
                return new Promise(resolve => {
                    resolve(0);
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
            shareAppMessage(object, callback) {
                let info;
                if (!!object && object.shareInfo) {
                    info = object.shareInfo;
                }
                else {
                    info = this.getRandomShareInfo();
                }
                console.log("@分享数据：", JSON.stringify(info));
                let tarurl = platform.SHARE_URL + this._config.packageName;
                if (object && object.query) {
                    tarurl += "?" + object.query;
                }
                qg.serviceShare({
                    shareType: 0,
                    title: info.title,
                    summary: "",
                    imagePath: "",
                    targetUrl: tarurl,
                    success: (res) => {
                        console.log("@分享成功,", res);
                        callback && callback();
                    },
                    fail: (data, code) => {
                        console.log("@分享失败", data, code);
                    },
                    cancel: () => {
                        console.log("@取消分享");
                    }
                });
            }
            getRandomShareInfo() {
                let shares = this._config.share || [];
                if (!shares || !shares.length) {
                    return { title: "", imageUrl: "", targetUrl: "" };
                }
                let index = Math.floor(Math.random() * shares.length);
                return shares[index];
            }
            /**当前快应用基础库版本是否支持广告创建 */
            get ad_supp() {
                const sys = this._systemInfo;
                const version = sys && sys.platformVersionCode;
                return !!version && version >= 1078;
            }
            createBannerAd(scene, cb, align = "center") {
                if (!this.ad_supp) {
                    console.warn("[qg->adp] 当前平台版本不支持banner广告.");
                    cb && cb();
                    return;
                }
                const bannerAd = this._config.bannerAd;
                if (!bannerAd) {
                    console.error("[qg->adp] 未配置banner数据");
                    cb && cb();
                    return;
                }
                const config = bannerAd[scene];
                if (!config) {
                    console.error("[qg->adp] banner：%s 未配置", scene);
                    cb && cb();
                    return;
                }
                let left = 0;
                // 华为快游戏banner广告尺寸固定为360x57；
                const sysinfo = this._systemInfo;
                const top = this._config.bannerResize ? config.top : (sysinfo.safeArea.height - 57);
                // const rw = ((sysinfo.screenHeight - config.top) / 57) * 360;
                // const dlt = sysinfo.screenWidth - rw;
                if (align == "center") {
                }
                else if (align == "right") {
                    // left = dlt;
                }
                const unitId = config.id;
                let banner = this._bannerAds[unitId];
                if (!!banner) {
                    banner.offLoad();
                    banner.offError();
                }
                else {
                    banner = this._bannerAds[unitId] = qg.createBannerAd({
                        adUnitId: unitId,
                        style: { top, left, width: 360, height: 57 },
                        adIntervals: 60
                    });
                }
                banner.onError((res) => {
                    console.error('BannerAd异常', res.errMsg, res.errCode);
                    mvc.send(platform.EVT_PLATFORM_BANNER_ERROR, { code: res.errCode, msg: res.errMsg, scene });
                    cb && cb(null);
                });
                banner.onLoad(() => {
                    console.log("[qg->adp] banner on load.");
                    mvc.send(platform.EVT_PLATFORM_BANNER_LOAD, { scene });
                    cb && cb({ width: banner.style.realWidth, height: (sysinfo.screenHeight - top) * sysinfo.pixelRatio });
                });
                banner.show();
            }
            hideBannerAd(scene) {
                const ads = this._bannerAds;
                if (!scene) {
                    for (let k in ads) {
                        const bnr = ads[k];
                        bnr && bnr.hide();
                    }
                }
                else {
                    const config = this._config.bannerAd;
                    const bnr = ads[config[scene].id];
                    bnr && bnr.hide();
                }
            }
            createInterstitialAd(scene, cb) {
                if (!cb) {
                    return;
                }
                if (!this.ad_supp) {
                    cb && cb(false);
                    return;
                }
                const ad_id = this._config.interstitialAd;
                if (!this._interAd) {
                    this._interAd = qg.createInterstitialAd({
                        adUnitId: ad_id
                    });
                    const iad = this._interAd;
                    iad.onError((res) => {
                        console.error("[qg->adp] 插屏广告异常", res.errMsg, res.errCode);
                        cb && cb(false);
                    });
                    iad.onLoad(() => {
                        console.info("[qg->adp] 插屏广告 on load.");
                        this._interAd.show();
                        cb && cb(true);
                    });
                }
                this._interAd.load();
            }
            createVideoAd(scene, cb) {
                const now = Date.now();
                if (!!this._last_video_time && (now - this._last_video_time < 500)) {
                    return;
                }
                else {
                    this._last_video_time = now;
                }
                if (!this.ad_supp) {
                    cb && cb(false);
                    return;
                }
                const videoAd = this._config.videoAd;
                if (!videoAd) {
                    console.error("[qg->adp] 未配置video ad数据");
                    cb && cb(false);
                    return;
                }
                const ad_id = videoAd[scene];
                if (!ad_id) {
                    console.error("[qg->adp] video：%s 未配置", scene);
                    cb && cb(false);
                    return;
                }
                const info = this._getVideoInfo(ad_id);
                let video = info.obj;
                if (!!video) {
                    video.offClose();
                    video.offError();
                    video.offLoad();
                }
                else {
                    video = info.obj = qg.createRewardedVideoAd({
                        adUnitId: ad_id,
                        multiton: true,
                        success: () => {
                            console.log("[qg->adp] video create success.");
                        },
                        fail: (msg, code) => {
                            console.warn("[qg->adp] video create fail.", msg, code);
                        }
                    });
                }
                const error = (res) => {
                    console.warn("[qg->adp] video error.", JSON.stringify(res));
                    res && mvc.send(k7.platform.EVT_PLATFORM_VIDEO_ERROR, { callback: cb, code: res.errCode, msg: res.errMsg, scene });
                };
                const close = (res) => {
                    cb && cb(Boolean(res && res.isEnded || res == undefined));
                };
                video.onError(error);
                video.onClose(close);
                if (info.loaded) {
                    video.show();
                    mvc.send(k7.platform.EVT_PLATFORM_VIDEO_LOAD, { scene });
                    setTimeout(() => {
                        video.onLoad(() => {
                            console.log("[qg->adp] video delay load.");
                            info.loaded = true;
                        });
                        video.load();
                    }, 5000);
                    info.loaded = false;
                }
                else {
                    video.onLoad(() => {
                        console.log("[qg->adp] video on load.");
                        info.loaded = true;
                        video.show();
                        mvc.send(k7.platform.EVT_PLATFORM_VIDEO_LOAD, { scene });
                    });
                    video.load();
                }
            }
            _getVideoInfo(unitId) {
                let info = this._videosAds[unitId];
                if (!info) {
                    info = this._videosAds[unitId] = { obj: null, loaded: false };
                }
                return info;
            }
            /**在系统初始化时，预加载视频广告 */
            preloadVideoAd() {
                const videoAd = this._config.videoAd;
                if (!videoAd) {
                    console.error("[qg->adp] 未配置video ad数据");
                    return;
                }
                const keys = Object.keys(videoAd);
                const ad_id = videoAd[keys[0]];
                const info = this._getVideoInfo(ad_id);
                const video = info.obj = qg.createRewardedVideoAd({
                    adUnitId: ad_id,
                    multiton: true,
                    success: () => {
                        console.log("[qg->adp] video preload create success.");
                    },
                    fail: (msg, code) => {
                        console.warn("[qg->adp] video preaload create fail.", msg, code);
                    }
                });
                video.onLoad(() => {
                    console.log("[qg->adp] video on preload.");
                    info.loaded = true;
                    video.offLoad();
                });
                video.load();
            }
            createNaviteAd() { }
            createCustomAd() { }
            hideCustomAd() { }
            addColorSign() { }
            addToDesktop(obj) {
                qg.hasShortcutInstalled({
                    success: (ret) => {
                        if (ret) {
                            obj.fail("已添加过");
                        }
                        else {
                            qg.installShortcut(obj);
                        }
                    },
                    fail: () => {
                        qg.installShortcut(obj);
                    }
                });
            }
            setUserCloudStorage() { }
            customService() { }
            requestSubscribe() { }
            createGameClub() { }
            hideGameClub() { }
            destroyGameClub() { }
            jumpToGame(index) {
                let jumpCfg = this._config && this._config['jump'] && this._config['jump'][index];
                if (!jumpCfg)
                    return;
                // qg.navigateToQuickApp({
                // packageName: jumpCfg.packageName,
                // extraData: '双扣',
                // });
            }
            navigateTo(obj) {
                // if(!obj || !obj.param) return;
                // qg.navigateToQuickApp({
                //     appId: obj.param.appid || "",
                //     extraData: "双扣",
                //     success:(res: any)=>{
                //         obj.success && obj.success(res);
                //     },
                //     fail: (res: any)=>{
                //         obj.fail && obj.fail();
                //     }
                // })
            }
            vibrateShort() {
                qg.vibrateShort();
            }
            vibrateLong() {
                qg.vibrateLong();
            }
            saveImageToPhotosAlbum(object) {
                // qg.saveImageToPhotosAlbum({
                //     filePath: object.filePath,
                //     success: ()=>{
                //         qg.showModal({
                //             title:"提示",
                //             content:"已保存至相册",
                //             showCancel: false
                //         });
                //     }
                // });
            }
            createCanvas() {
                return document.createElement("canvas");
            }
            createImage() {
                return qg.createImage();
            }
            previewImage() {
            }
            saveImageToTempFileSync(canvas, info) {
                // let cvs = <HTMLCanvasElement> canvas;
                // let dataurl = cvs.toDataURL();
                // let arr = dataurl.split(',');
                // let bstr = atob(arr[1]), n = bstr.length;
                // let u8arr = new Uint8Array(n);
                // while(n--) {
                //     u8arr[n] = bstr.charCodeAt(n);
                // }
                return "";
                // return qg.saveImageTempSync({
                //     data: u8arr,
                //     width: info.w,
                //     height: info.h,
                //     fileType: "png",
                //     reverse: false
                // });
            }
            showLoading(object) {
                qg.showLoading({
                    title: object.title,
                    mask: true
                });
            }
            hideLoading(object) {
                qg.hideLoading();
            }
            showSysToast(obj) {
                qg.showToast(obj);
            }
            hideSysToast() {
                qg.hideToast();
            }
            showSysModal(object) {
                qg.showModal(object);
            }
            feedBack() { }
            exitGame() {
                qg.exitApplication({
                    success: () => {
                        console.log("[qg->adp] exit success.");
                    },
                    fail: () => {
                        console.log("[qg->adp] exit fail.");
                    }
                });
            }
        }
        HuaweiAdapter.PLATFORM_TAG = "huawei";
        platform.HuaweiAdapter = HuaweiAdapter;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));

(function (k7) {
    var platform;
    (function (platform) {
        /**华为广告隐私策略公告设置 */
        platform.HW_STG = {
            ad_set: "hw_adset",
        };
        platform.HW_SPM = "9.14494";
        platform.SHARE_URL = "https://hapjs.org/app/";
        /**重新拉取视频广告素材的时间间隔，10分钟 */
        platform.RELOAD_DUR = 10 * 60 * 1000;
    })(platform = k7.platform || (k7.platform = {}));
})(k7 || (k7 = {}));
