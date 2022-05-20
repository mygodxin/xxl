window.k7 = window.k7 || {};

(function (k7) {
    k7.EVT_FAIRY_CLICK = 'EVT_FAIRY_CLICK';
    k7.EVT_STAGE_ADDED = 'EVT_STAGE_ADDED';
    k7.EVT_FAIRY_SHOW = 'EVT_FAIRY_SHOW';
    k7.EVT_STAGE_REMOVED = 'EVT_STAGE_REMOVED';
    k7.EVT_FAIRY_HIDE = 'EVT_FAIRY_HIDE';
    k7.EVT_STAGE_RESIZE = 'EVT_STAGE_RESIZE';
    k7.EVT_UI_ONREADY = 'EVT_UI_ONREADY';
    k7.EVT_UI_ONHIDE = 'EVT_UI_ONHIDE';
    var FairyChild = /** @class */ (function () {
        function FairyChild(viewComponent, owner) {
            this.windowDict = {};
            this.setRoot(viewComponent, owner);
        }
        FairyChild.prototype.setRoot = function (viewRoot, owner) {
            this.viewComponent = viewRoot;
            this.owner = owner;
            if (!this.owner)
                this.owner = this;
            return this;
        };
        FairyChild.prototype.onClickButton = function (button) {
            if (this.owner != this)
                this.owner.onClickButton(button);
        };
        FairyChild.prototype.onCloseWindow = function (window) {
            if (this.owner != this)
                this.owner.onCloseWindow(window);
        };
        /** 监听所有按钮类型的事件发布，暂未应用，必要性，有待论证 */
        FairyChild.prototype.listenAllButton = function (view) {
            var _loop_1 = function (i) {
                var child = view.getChildAt(i);
                if (child.asButton) {
                    k7.Engine.onClick(child.asButton, this_1, function () {
                        mvc.send(k7.EVT_FAIRY_CLICK, { view: child, path: getFairyPath(child) });
                    });
                }
                else if (child.asCom) {
                    this_1.listenAllButton(child.asCom);
                }
            };
            var this_1 = this;
            for (var i = 0; i < view.numChildren; ++i) {
                _loop_1(i);
            }
        };
        /**
         * 根据点运算符获取末端对象
         * @param path 点运算路径
         * @param view 要获取的对象的相对更路径
         * @param type 要获取对象的类型（全小写的对象类型名称）
         */
        FairyChild.prototype.getObj = function (path, view, type) {
            if (type === void 0) { type = 'component'; }
            var pathStr = path.split(".");
            var len = pathStr.length;
            if (view == null)
                view = this.viewComponent;
            for (var i = 0; i < len - 1; ++i) {
                view = view.getChild(pathStr[i]).asCom;
                if (view == null)
                    return null;
            }
            switch (type) {
                case 'controller': return view ? view.getController(pathStr[i]) : null;
                case 'transition': return view ? view.getTransition(pathStr[i]) : null;
            }
            return view ? view.getChild(pathStr[i]) : null;
        };
        FairyChild.prototype.getComp = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asCom;
        };
        FairyChild.prototype.getButton = function (path, clickListener, parent) {
            var _this = this;
            if (parent == null)
                parent = this.viewComponent;
            var gobj = this.getObj(path, parent);
            if (gobj != null) {
                k7.Engine.onClick(gobj, this, function () {
                    mvc.send(k7.EVT_FAIRY_CLICK, { view: gobj, path: getFairyPath(gobj) });
                    clickListener && clickListener.apply(_this.owner);
                    _this.onClickButton(gobj.asButton);
                });
            }
            return gobj == null ? null : gobj.asButton;
        };
        FairyChild.prototype.getLabel = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asLabel;
        };
        FairyChild.prototype.getProgressBar = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asProgress;
        };
        FairyChild.prototype.getTextField = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asTextField;
        };
        FairyChild.prototype.getRichTextField = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asRichTextField;
        };
        FairyChild.prototype.getTextInput = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asTextInput;
        };
        FairyChild.prototype.getLoader = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asLoader;
        };
        FairyChild.prototype.getList = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asList;
        };
        FairyChild.prototype.getGraph = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asGraph;
        };
        FairyChild.prototype.getGroup = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asGroup;
        };
        FairyChild.prototype.getSlider = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asSlider;
        };
        FairyChild.prototype.getComboBox = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asComboBox;
        };
        FairyChild.prototype.getImage = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asImage;
        };
        FairyChild.prototype.getMovieClip = function (path) {
            var gobj = this.getObj(path);
            return gobj == null ? null : gobj.asMovieClip;
        };
        FairyChild.prototype.getController = function (path) {
            return this.getObj(path, null, 'controller');
        };
        FairyChild.prototype.getTransition = function (path) {
            return this.getObj(path, null, 'transition');
        };
        FairyChild.prototype.getWindow = function (name, closeListener, parent) {
            var _this = this;
            if (parent == null)
                parent = this.viewComponent;
            if (this.windowDict[name] == null) {
                var win = new AniWindow(parent.getChild(name).asCom);
                if (win.closeButton == null) {
                    win.closeButton = win.contentPane.getChild("closeButton");
                }
                if (win.closeButton != null) {
                    k7.Engine.onClick(win.closeButton, this, function () {
                        if (closeListener != null) {
                            closeListener.apply(_this.owner);
                        }
                        _this.onCloseWindow(win);
                    });
                }
                this.windowDict[name] = win;
            }
            return this.windowDict[name];
        };
        FairyChild.TEMP = new FairyChild();
        return FairyChild;
    }());
    k7.FairyChild = FairyChild;
    var AniWindow = /** @class */ (function (_super) {
        __extends(AniWindow, _super);
        function AniWindow(comp) {
            var _this = _super.call(this) || this;
            _this.contentPane = comp;
            _this.modal = true;
            if (_this.closeButton == null) {
                _this.closeButton = comp.getChild("closeButton");
            }
            return _this;
        }
        // doShowAnimation() {
        //     this.contentPane.getTransition('show').play(() => { this.onShown() });
        // }
        // doHideAnimation() {
        //     this.contentPane.getTransition('hide').play(() => { this.hideImmediately() });
        // }
        AniWindow.prototype.doShowAnimation = function () {
            this.touchable = false;
            if (!k7.Fairy.playTransition(this.contentPane, 'show', this, this.onShowAniComplete)) {
                this.onShowAniComplete();
            }
        };
        AniWindow.prototype.onShowAniComplete = function () {
            this.touchable = true;
            this.onShown();
        };
        AniWindow.prototype.doHideAnimation = function () {
            this.touchable = false;
            if (!k7.Fairy.playTransition(this.contentPane, 'hide', this, this.hideImmediately)) {
                this.hideImmediately(); //ccc回调有BUG
            }
        };
        return AniWindow;
    }(GWindow));
    k7.AniWindow = AniWindow;
    function getFairyPath(obj) {
        var path = obj.name;
        while (obj.parent && obj.parent != GRoot.inst) {
            if (obj.parent.parent != null &&
                !(obj.parent.parent instanceof GWindow)) {
                path = obj.parent.name + '/' + path;
            }
            obj = obj.parent;
        }
        return path;
    }
    k7.getFairyPath = getFairyPath;
    k7.fairyUrlLocalPrefix = '';
    k7.fairyUrlRemotePrefix = '';
})(k7 || (k7 = {}));
/// <reference path="FairyChild.ts" />

(function (k7) {
    var AppComp = /** @class */ (function (_super) {
        __extends(AppComp, _super);
        function AppComp(viewComponent, pack) {
            var _this = _super.call(this) || this;
            if (!viewComponent)
                return _this;
            if (typeof viewComponent == "string") {
                if (pack && !FUIPackage.getByName(pack)) {
                    FUIPackage.addPackage(this.prefix + pack); //前缀TODO
                }
                _this.contentPane = FUIPackage.createObject(pack, viewComponent).asCom;
            }
            else {
                _this.contentPane = viewComponent.asCom;
            }
            _this.addChild(_this.contentPane);

            this.fairyAdapter = new k7.FairyChild(this.contentPane, this);
            // this.mediatorAdapter = new k7.MediatorUiAdapter(this.prefix + this.pack + '/' + this.name, this);
            // this.uiMediators = [this.mediatorAdapter];

            mvc.on(k7.EVT_STAGE_RESIZE, _this, _this.onResize);
            _this.bindChild();
            return _this;
        }
        AppComp.prototype.bindChild = function () { };
        AppComp.prototype.onResize = function () { };
        AppComp.prototype.onClickButton = function (button) { };
        AppComp.prototype.onCloseWindow = function (window) { };
        AppComp.prototype.setRoot = function (view) { this.fairyAdapter.setRoot(view); };
        AppComp.prototype.getComp = function (path) { return this.fairyAdapter.getComp(path); };
        AppComp.prototype.getLabel = function (path) { return this.fairyAdapter.getLabel(path); };
        AppComp.prototype.getProgressBar = function (path) { return this.fairyAdapter.getProgressBar(path); };
        AppComp.prototype.getTextField = function (path) { return this.fairyAdapter.getTextField(path); };
        AppComp.prototype.getRichTextField = function (path) { return this.fairyAdapter.getRichTextField(path); };
        AppComp.prototype.getTextInput = function (path) { return this.fairyAdapter.getTextInput(path); };
        AppComp.prototype.getLoader = function (path) { return this.fairyAdapter.getLoader(path); };
        AppComp.prototype.getList = function (path) { return this.fairyAdapter.getList(path); };
        AppComp.prototype.getGraph = function (path) { return this.fairyAdapter.getGraph(path); };
        AppComp.prototype.getGroup = function (path) { return this.fairyAdapter.getGroup(path); };
        AppComp.prototype.getSlider = function (path) { return this.fairyAdapter.getSlider(path); };
        AppComp.prototype.getComboBox = function (path) { return this.fairyAdapter.getComboBox(path); };
        AppComp.prototype.getImage = function (path) { return this.fairyAdapter.getImage(path); };
        AppComp.prototype.getMovieClip = function (path) { return this.fairyAdapter.getMovieClip(path); };
        AppComp.prototype.getController = function (path) { return this.fairyAdapter.getController(path); };
        AppComp.prototype.getTransition = function (path) { return this.fairyAdapter.getTransition(path); };
        AppComp.prototype.getButton = function (path, clickListener, parent) {
            return this.fairyAdapter.getButton(path, clickListener, parent);
        };
        AppComp.prototype.getWindow = function (path, closeListener, parent) {
            return this.fairyAdapter.getWindow(path, closeListener, parent);
        };
        Object.defineProperty(AppComp.prototype, "mediatorName", {
            get: function () { return this.mediatorAdapter.mediatorName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppComp.prototype, "viewComponent", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        AppComp.prototype.onRegister = function () { };
        AppComp.prototype.onEvent = function (eventName, params) { };
        AppComp.prototype.onRemove = function () { };
        return AppComp;
    }(GComponent));
    k7.AppComp = AppComp;
})(k7 || (k7 = {}));

(function (k7) {
    var instHistory = [];
    function getFairyInstence(type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < instHistory.length; ++i) {
            var item = instHistory[i];
            if (item.type == type)
                return item.inst;
        }
        var inst = new (type.bind.apply(type, [void 0].concat(args)))();
        instHistory.push({ type: type, inst: inst });
        return inst;
    }
    k7.getFairyInstence = getFairyInstence;
})(k7 || (k7 = {}));
/// <reference path="FairyChild.ts" />
/// <reference path="InstenceManager.ts" />

(function (k7) {
    var AppWindow = /** @class */ (function (_super) {
        __extends(AppWindow, _super);
        /** 导出的组件名，组件所在的包，指定加载的(如果纹理需要独立加载的情况) */
        function AppWindow(name, pack) {

            var _this = _super.call(this) || this;
            _this.transShowName = 'show';
            _this.transHideName = 'hide';
            /** 绑定在此窗口下的子窗口列表 */
            _this.subWindowsList = {};
            _this.uiMediators = [];
            _this.name = name;
            _this.pack = pack;
            _this.prefix = k7.fairyUrlRemotePrefix || k7.fairyUrlLocalPrefix;
            k7.Fairy.onStageEvent(_this, _this, _this.onStageEvent);
            var sources = [];
            for (var i = 2; i < arguments.length; ++i) {
                var lib = arguments[i];
                if (!!lib) {
                    sources.push(lib);
                    _this.addUISource(lib);
                }
            }
            if (!sources.length) {
                _this.addUISource(k7.floader.get(pack));
            }
            _this.modal = true;
            _this.isCenter = true;
            _this.initConfig();
            return _this;
        }
        AppWindow.show = function (type, param) {
            var win = k7.getFairyInstence(type);
            // if (param != undefined)
            //     win.showByParams(param);
            // else
            //     win.show();
            //fix:为避免showByParams与show交叉使用，改为统一
            win && win.showByParams(param);
            return win;
        };
        AppWindow.prototype.getUISources = function () {
            return this['_uiSources'].slice();
        };
        AppWindow.prototype.onStageEvent = function (type) {
            switch (type) {
                case k7.EVT_STAGE_ADDED:
                    mvc.send(k7.EVT_FAIRY_SHOW, { view: this.contentPane, path: k7.getFairyPath(this) });
                    break;
                case k7.EVT_STAGE_REMOVED:
                    mvc.send(k7.EVT_FAIRY_HIDE, { view: this.contentPane, path: k7.getFairyPath(this) });
                    break;
                case k7.EVT_STAGE_RESIZE:
                    this.onResize();
                    break;
            }
        };
        AppWindow.prototype.initConfig = function () {
        };
        AppWindow.prototype.show = function () {
            if (this.isPopup)
                GRoot.inst.showPopup(this);
            else if (this.parent == GRoot.inst) {
                if (this._inited) {
                    this.refreshUi();
                    this.onShowAniComplete();
                }
            }
            else {
                _super.prototype.show.call(this);
            }
        };
        AppWindow.prototype.showByParams = function (param) {
            // if (param !== undefined)
            //     this.openData = param;
            this.openData = param
            this.show();
            return this;
        };
        AppWindow.prototype.hide = function () {
            this.closeAllSubWindow();
            this.doHideAnimation();
            // if (this._mgr) {
            //     this._mgr.hide(this);
            // } else {
            //     _super.prototype.hide.call(this);
            // }
            this.refreshOwnerWindow();
        };
        AppWindow.prototype.hideThen = function (next, nextObj) {
            this.hideThenCall = next;
            this.hideThenObj = nextObj;
            this.hide();
        };
        AppWindow.prototype.init = function () {
            _super.prototype.init.call(this);
            if (this.loading && AppWindow.configLoadingWaiting) {
                this.showLoadingWait();
            }
        };
        AppWindow.prototype.onShowFail = function () {
            this.closeLoadingWait();
            this.manager.hide(this);
        };
        AppWindow.prototype.showLoadingWait = function () {
            if (!this.loadingWaitPane)
                this.loadingWaitPane = FUIPackage.createObjectFromURL(AppWindow.configLoadingWaiting);
            this.layoutLoadingWaitPane();
            GRoot.inst.addChild(this.loadingWaitPane);
            var closeBtn = this.loadingWaitPane.getChild('closeBtn');
            if (!!closeBtn) {
                closeBtn.visible = false;
                this.timeId = setTimeout(() => {
                    closeBtn.visible = true;
                }, 6000);
                closeBtn.clearClick();
                closeBtn.onClick(() => {
                    this.onShowFail();
                }, this);
            }
        };
        AppWindow.prototype.layoutLoadingWaitPane = function () {
            this.loadingWaitPane.makeFullScreen();
        };
        AppWindow.prototype.closeLoadingWait = function () {
            if (this.loadingWaitPane && this.loadingWaitPane.parent != null)
                this.loadingWaitPane.removeFromParent();
        };
        AppWindow.prototype.onInit = function () {
            this.closeLoadingWait();
            if (this.contentPane == null) {
                if (this.pack && !FUIPackage.getByName(this.pack)) {
                    FUIPackage.addPackage(this.prefix + this.pack);
                }
                this.contentPane = FUIPackage.createObject(this.pack, this.name).asCom;
            }
            this.topArea = this.contentPane.getChild("top");
            this.bottomArea = this.contentPane.getChild("bottom");
            this.centerArea = this.contentPane.getChild("center");
            this.fairyAdapter = new k7.FairyChild(this.contentPane, this);
            this.mediatorAdapter = new k7.MediatorUiAdapter(this.prefix + this.pack + '/' + this.name, this);
            this.uiMediators = [this.mediatorAdapter];
            this.bindChild();
        };
        AppWindow.prototype.doShowAnimation = function () {
            mvc.send(k7.EVT_UI_ONREADY, this);
            this.onResize();
            this.refreshUi();
            this.registerMediators();
            this.touchable = false;
            if (this.showAnimation) {
                this.showAnimation(this, this.onShowAniComplete);
            }
            else {
                k7.Fairy.playTransition(this, this.transShowName, this, this.onShowAniComplete) || this.onShowAniComplete();
            }
        };
        AppWindow.prototype.doHideAnimation = function () {
            this.removeMediators();
            this.touchable = false;
            if (this.hideAnimation) {
                this.hideAnimation(this, this.onHideAniComplete);
            }
            else {
                k7.Fairy.playTransition(this, this.transHideName, this, this.onHideAniComplete) || this.onHideAniComplete();
            }
        };
        AppWindow.prototype.onShowAniComplete = function () {
            this.touchable = true;
            this.onShown();
        };
        AppWindow.prototype.onHideAniComplete = function () {
            this.touchable = true;
            if (this._mgr) {
                this._mgr.hide(this);
            } else {
                // _super.prototype.hide.call(this);
                this.hideImmediately();
            }
            if (this.hideThenCall) {
                this.hideThenCall.call(this.hideThenObj);
                this.hideThenCall = null;
                this.hideThenObj = null;
            }
            mvc.send(k7.EVT_UI_ONHIDE, this);
        };
        AppWindow.prototype.onResize = function () {
            if (this.isFullScreen)
                this.makeFullScreen();
            else if (this.isCenter)
                this.center();
        };
        AppWindow.prototype.bindChild = function () { };
        AppWindow.prototype.refreshUi = function () { };
        AppWindow.prototype.onClickButton = function (button) { };
        AppWindow.prototype.onCloseWindow = function (window) { };
        AppWindow.prototype.onSubWindowClose = function (win) { };
        /** 注册一个子窗口，随后可以用字符串打开该窗口，并绑定了子窗口该子窗口，详见bindSubWindow */
        AppWindow.prototype.registerSubWindow = function (WinClass, name, pack, tex) {
            if (this.subWindowsList[name] == null) {
                if (!pack)
                    pack = this.pack;
                this.bindSubWindow(new WinClass(name, pack, tex));
            }
            return this.subWindowsList[name];
        };
        /** 绑定一个窗口实例为当前窗口的子窗口，启动关闭将会有冒泡联动通知（比如：用于刷新） */
        AppWindow.prototype.bindSubWindow = function (win) {
            if (this.subWindowsList[win.name] == null) {
                win.ownerWindow = this;
                this.subWindowsList[win.name] = win;
            }
            return this.subWindowsList[win.name];
        };
        /** 打开一个子窗口 */
        AppWindow.prototype.showSubWindow = function (name, openData) {
            var win = this.subWindowsList[name];
            if (win == null)
                return;
            if (openData || openData === null)
                win.openData = openData;
            win.show();
            return win;
        };
        /** 关闭所有子窗口 */
        AppWindow.prototype.closeAllSubWindow = function () {
            for (var name in this.subWindowsList) {
                this.subWindowsList[name].hide();
            }
        };
        /** 刷新父窗口界面(使用场景举例：子界面某操作更新大厅数据) */
        AppWindow.prototype.refreshOwnerWindow = function () {
            this.ownerWindow && this.ownerWindow.onSubWindowClose(this);
        };
        AppWindow.prototype.registerMediators = function () {
            for (var i = 0; i < this.uiMediators.length; ++i) {
                mvc.registerMediator(this.uiMediators[i]);
            }
        };
        AppWindow.prototype.removeMediators = function () {
            for (var i = 0; i < this.uiMediators.length; ++i) {
                mvc.removeMediator(this.uiMediators[i].mediatorName);
            }
        };
        AppWindow.prototype.setRoot = function (view) { this.fairyAdapter.setRoot(view); };
        AppWindow.prototype.getComp = function (path) { return this.fairyAdapter.getComp(path); };
        AppWindow.prototype.getLabel = function (path) { return this.fairyAdapter.getLabel(path); };
        AppWindow.prototype.getProgressBar = function (path) { return this.fairyAdapter.getProgressBar(path); };
        AppWindow.prototype.getTextField = function (path) { return this.fairyAdapter.getTextField(path); };
        AppWindow.prototype.getRichTextField = function (path) { return this.fairyAdapter.getRichTextField(path); };
        AppWindow.prototype.getTextInput = function (path) { return this.fairyAdapter.getTextInput(path); };
        AppWindow.prototype.getLoader = function (path) { return this.fairyAdapter.getLoader(path); };
        AppWindow.prototype.getList = function (path) { return this.fairyAdapter.getList(path); };
        AppWindow.prototype.getGraph = function (path) { return this.fairyAdapter.getGraph(path); };
        AppWindow.prototype.getGroup = function (path) { return this.fairyAdapter.getGroup(path); };
        AppWindow.prototype.getSlider = function (path) { return this.fairyAdapter.getSlider(path); };
        AppWindow.prototype.getComboBox = function (path) { return this.fairyAdapter.getComboBox(path); };
        AppWindow.prototype.getImage = function (path) { return this.fairyAdapter.getImage(path); };
        AppWindow.prototype.getMovieClip = function (path) { return this.fairyAdapter.getMovieClip(path); };
        AppWindow.prototype.getController = function (path) { return this.fairyAdapter.getController(path); };
        AppWindow.prototype.getTransition = function (path) { return this.fairyAdapter.getTransition(path); };
        AppWindow.prototype.getButton = function (path, clickListener, parent) {
            return this.fairyAdapter.getButton(path, clickListener, parent);
        };
        AppWindow.prototype.getWindow = function (path, closeListener, parent) {
            return this.fairyAdapter.getWindow(path, closeListener, parent);
        };
        Object.defineProperty(AppWindow.prototype, "mediatorName", {
            get: function () { return this.mediatorAdapter.mediatorName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppWindow.prototype, "viewComponent", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppWindow.prototype, "manager", {
            get: function () { return this._mgr; },
            set: function (val) { this._mgr = val; },
            enumerable: true,
            configurable: true
        })
        AppWindow.prototype.onRegister = function () { };
        AppWindow.prototype.onEvent = function (eventName, params) { };
        AppWindow.prototype.onRemove = function () { };
        return AppWindow;
    }(GWindow));
    k7.AppWindow = AppWindow;
})(k7 || (k7 = {}));
/// <reference path="AppWindow.ts" />
/// <reference path="InstenceManager.ts" />

(function (k7) {
    var AppScene = /** @class */ (function (_super) {
        __extends(AppScene, _super);
        function AppScene() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AppScene.show = function (type, param) {
            var scene = k7.getFairyInstence(type);
            // if (param)
            //     scene.showByParams(param);
            // else
            //     scene.show();
            //fix:为避免showByParams与show交叉使用，改为统一
            scene && scene.showByParams(param);
            return scene;
        };
        AppScene.prototype.initConfig = function () {
            this.modal = false;
            this.isCenter = false;
            this.isFullScreen = true;
            this.bringToFontOnClick = false;
        };
        /** 场景显示，若已有场景，会自带切换功能(旧版逻辑在代码尾部，若遇到问题可参考) */
        AppScene.prototype.show = function () {
            /**TUDO: */
            let curChild = fgui.GRoot.inst._children.concat();
            for (var i = 1; i < curChild.length; i++) {
                let child = curChild[i]
                if (!(child instanceof k7.AppScene)) {
                    child.removeFromParent();
                }
            }

            if (AppScene.current == null) {
                AppScene.current = this;
                _super.prototype.show.call(this);
                mvc.on(k7.EVT_STAGE_RESIZE, this, this.onResize);
            }
            else if (AppScene.current == this) {
                _super.prototype.show.call(this);
            }
            else {
                var scene = AppScene.current;
                AppScene.current = null;
                scene.hideThen(this.show, this);
            }
        };
        AppScene.prototype.onHide = function () {
            mvc.off(k7.EVT_STAGE_RESIZE, this, this.onResize);
        };
        AppScene.current = null;
        return AppScene;
    }(k7.AppWindow));
    k7.AppScene = AppScene;
})(k7 || (k7 = {}));
/// <reference path="AppScene.ts" />
/// <reference path="AppWindow.ts" />

(function (k7) {
    //由于多继承，且被多个类包含使用，所以该类使用适配器模式进行多继承匹配，目的在于方便统一修改维护
    var MediatorUiAdapter = /** @class */ (function (_super) {
        __extends(MediatorUiAdapter, _super);
        function MediatorUiAdapter(name, view) {
            var _this = _super.call(this, 'mediator://' + name, view) || this;
            _this.subMediators = [];
            _this.owner = view;
            return _this;
        }
        MediatorUiAdapter.prototype.onShow = function () {
            mvc.registerMediator(this);
            for (var i = 0; i < this.subMediators.length; ++i) {
                mvc.registerMediator(this.subMediators[i]);
            }
        };
        MediatorUiAdapter.prototype.onReady = function () {
            mvc.send(k7.EVT_UI_ONREADY, this.owner);
        };
        MediatorUiAdapter.prototype.onHide = function () {
            mvc.removeMediator(this.mediatorName);
            for (var i = 0; i < this.subMediators.length; ++i) {
                mvc.removeMediator(this.subMediators[i].mediatorName);
            }
        };
        MediatorUiAdapter.prototype.bindMediator = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            (_a = this.subMediators).push.apply(_a, args);
        };
        MediatorUiAdapter.prototype.onRegister = function () {
            this.owner && this.owner.onRegister && this.owner.onRegister();
        };
        Object.defineProperty(MediatorUiAdapter.prototype, "eventList", {
            get: function () {
                return this.owner ? this.owner.eventList || [] : [];
            },
            enumerable: true,
            configurable: true
        });
        MediatorUiAdapter.prototype.onEvent = function (eventName, params) {
            this.owner && this.owner.onEvent && this.owner.onEvent(eventName, params);
        };
        MediatorUiAdapter.prototype.onRemove = function () {
            this.owner && this.owner.onRemove && this.owner.onRemove();
        };
        return MediatorUiAdapter;
    }(mvc.Mediator));
    k7.MediatorUiAdapter = MediatorUiAdapter;
})(k7 || (k7 = {}));

(function (k7) {
    // FairyLoader本次加载任务最大重试次数
    k7.MAX_FUI_RETRY_NUM = 5;
    k7.EVT_SourceLoader_CompleteEvent = 'EVT_SourceLoader_CompleteEvent';
    k7.EVT_SourceLoader_FailEvent = "EVT_SL_Fail";
    k7.EVT_SourceLoader_ErrorEvent = "EVT_SL_Error";
    //by myx
    k7.EVT_SourceLoader_ProgressEvent = 'EVT_SourceLoader_ProgressEvent';
    var ASourceLoader = /** @class */ (function () {
        function ASourceLoader() {
            this.loaded = false;
            this.callbacks = [];
            this.thisObjs = [];
            this.failbacks = [];
            this.failObjs = [];
            this.loading = false;
            this.retry = 0;
            this.startime = 0;
            this.loadtime = 0;
            //by myx
            this.completedCount = 0;
            this.totalCount = 0;
        }
        /**
         * 若正在加载过程中，重复调用，将只会注册不同的回调函数，但不会重复换起加载。
         * 加载成功后，将自动清除所有回调。
         *  若想维护监听状态，则不要传入回调函数，使用事件机制来处理回调。
         */
        ASourceLoader.prototype.load = function (callback, thisObj, atlases) {
            if (callback) {
                var cbidx = this.callbacks.indexOf(callback);
                var toidx = this.thisObjs.indexOf(thisObj);
                if (cbidx == -1 && toidx == -1) {
                    this.callbacks.push(callback);
                    this.thisObjs.push(thisObj);
                }
            }
            if (this.loaded) {
                this.complete();
                return;
            }
            if (this.loading) {
                return;
            }
            this.succeed = false;
            this.loading = true;
            this.startime = Date.now();
            this.loadtime = 0;
            this.retry += 1;
            this.start(atlases);
        };
        ASourceLoader.prototype.fail = function (callback, thisObj) {
            if (callback && thisObj) {
                var cbidx = this.failbacks.indexOf(callback);
                var toidx = this.failObjs.indexOf(thisObj);
                if (cbidx == -1 && toidx == -1) {
                    this.failbacks.push(callback);
                    this.failObjs.push(thisObj);
                }
            }
        }
        ASourceLoader.prototype.complete = function () {
            this.loading = false;
            this.succeed = true;
            this.loadtime += Date.now() - this.startime;
            mvc.send(k7.EVT_SourceLoader_CompleteEvent, this);
            for (var i = 0; i < this.callbacks.length; ++i) {
                var cb = this.callbacks[i];
                var to = this.thisObjs[i];
                cb && cb.apply(to);
            }
            this.callbacks = [];
            this.thisObjs = [];
            // mvc.send(k7.EVT_SourceLoader_CompleteEvent, this);
        };
        ASourceLoader.prototype.success = function () {
            this.isPreload = false;
            this.complete();
        };
        //by myx
        ASourceLoader.prototype.onfailed = function () {
            this.loading = false;
            this.failed = true;
            console.error("[src->loader] fail to load: %s", this.fileName);
            mvc.send(k7.EVT_SourceLoader_FailEvent, this);
            for (var i = 0, j = this.failbacks.length; i < j; i++) {
                var cb = this.failbacks[i];
                var to = this.failObjs[i];
                cb && cb.apply(to);
            }
            this.failbacks = [];
            this.failObjs = [];
        };
        //by myx
        ASourceLoader.prototype.progress = function (completedCount, totalCount, item) {
            this.completedCount = completedCount;
            this.totalCount = totalCount;
            mvc.send(k7.EVT_SourceLoader_ProgressEvent, this);
        };
        ASourceLoader.prototype.preload = function () {
            this.isPreload = true;
            this.load();
        };
        ASourceLoader.prototype.preloadFail = function () {
            this.isPreload = false;
            this.onfailed();
        };
        return ASourceLoader;
    }());
    k7.ASourceLoader = ASourceLoader;
})(k7 || (k7 = {}));
/// <reference path="ASourceLoader.ts" />

(function (k7) {
    var FairyLoader = /** @class */ (function (_super) {
        __extends(FairyLoader, _super);
        function FairyLoader() {
            var _this = _super.call(this) || this;
            _this.fileName = arguments[0];
            _this.bundle = arguments[1];
            if (arguments.length > 2) {
                _this.data = [];
                for (var i = 2; i < arguments.length; i += 2) {
                    var type = arguments[i];
                    var name_1 = arguments[i + 1];
                    var inst = k7.getFairyInstence(type);
                    inst.name = name_1;
                    inst.pack = _this.fileName;
                    inst.addUISource(_this);
                    _this.data.push({ type: type, name: name_1, inst: inst });
                }
            }
            _this.atlases = null;
            return _this;
        }
        FairyLoader.prototype.start = function (atlases) {
            if (!this.atlases) {
                this.atlases = atlases;
            }
            if (!this.bundle) {
                var url = k7.fairyUrlLocalPrefix + this.fileName;
                fgui.UIPackage.loadPackage(url, this.atlases, this.onLoadProcess.bind(this), this.onPackLoaded.bind(this));
            } else {
                fgui.UIPackage.loadPackage(this.bundle, this.fileName, this.atlases, this.onLoadProcess.bind(this), this.onPackLoaded.bind(this));
            }
        };
        //by myx
        FairyLoader.prototype.onLoadProcess = function (completedCount, totalCount, item) {
            _super.prototype.progress.call(this, completedCount, totalCount, item);
        };
        FairyLoader.prototype.onPackLoaded = function (err, pkg) {
            //add myx
            var _this = this;
            if (!err) {
                _this.retry = 0;
                this.loaded = pkg && pkg.finished;
                this.atlases = null;
                this.preCreateAppWindow();
            } else {
                if (this.isPreload) {// 执行预加载任务，重试行为由预加载管理模块控制
                    console.error("[fairy->loader] preload %s err.", this.fileName, err);
                    this.loading = false;
                    setTimeout(() => {
                        mvc.send(k7.EVT_SourceLoader_ErrorEvent, this);
                    }, 1000);
                } else if (this.retry < k7.MAX_FUI_RETRY_NUM) {// 执行独立加载任务
                    this.retry++;
                    setTimeout(() => {
                        this.start();
                    }, 1000);
                } else {
                    this.retry = 0;
                    this.atlases = null;
                    _super.prototype.onfailed.call(this);
                }
            }
        };
        FairyLoader.prototype.preCreateAppWindow = function (position) {
            var _this = this;
            if (position === void 0) { position = 0; }
            if (this.data && this.data.length > 0 && position < this.data.length) {
                var win_1 = this.data[position].inst;
                var create = new fgui.AsyncOperation();
                create.callback = function (gObject) {
                    win_1.contentPane = gObject.asCom;
                    _this.preCreateAppWindow(position + 1);
                };
                create.createObject(this.fileName, win_1.name);
            }
            else {
                _super.prototype.success.call(this);
            }
        };
        return FairyLoader;
    }(k7.ASourceLoader));
    k7.FairyLoader = FairyLoader;
})(k7 || (k7 = {}));

(function (k7) {
    var SourcePreLoader = /** @class */ (function () {
        function SourcePreLoader() {
            this.isLoading = false;
            this.isComplete = false;
            this.hasError = false;
            this.numRetrys = 5;
            mvc.on(k7.EVT_SourceLoader_CompleteEvent, this, this.onItemLoaded);
            mvc.on(k7.EVT_SourceLoader_ErrorEvent, this, this.onItemLoaded);
            this.loaderList = [];
        }
        Object.defineProperty(SourcePreLoader.prototype, "numSources", {
            get: function () { return this._numSources; },
            enumerable: true,
            configurable: true
        });
        SourcePreLoader.prototype.addSource = function (srcs) {
            var _a;
            var sourceLoader = [];
            if (srcs instanceof Array) {
                sourceLoader = srcs;
            } else {
                for (var _i = 0; _i < arguments.length; _i++) {
                    sourceLoader[_i] = arguments[_i];
                }
            }
            this._numSources = (_a = this.loaderList).push.apply(_a, sourceLoader);
        };
        SourcePreLoader.prototype.preload = function (index) {
            if (index === void 0) { index = 0; }
            if (this.isComplete) {
                return;
            }
            if (index >= this._numSources) {
                for (var i = 0; i < this._numSources; ++i) {
                    var item_1 = this.loaderList[i];
                    if (!item_1.succeed) { // 本次加载任务未成功
                        if (item_1.retry < k7.MAX_FUI_RETRY_NUM) {
                            this.preload(i);
                            return;
                        }
                        else {
                            item_1.preloadFail();
                            this.hasError = true;
                        }
                    }
                }
                this.isComplete = true;
                if (!this.hasError) {
                }
                return;
            }
            var item = this.loaderList[index];
            if (item.loading || item.succeed) {
                this.preload(index + 1);
                return;
            }
            // if (item.retry >= 7) {
            //     this.hasError = true;
            //     this.preload(index + 1);
            //     return;
            // }
            this.isLoading = true;
            this.loadPosition = index;
            item.preload();
        };
        SourcePreLoader.prototype.onItemLoaded = function (sourceLoader) {
            var index = this.loaderList.indexOf(sourceLoader);
            if (index != -1 && this.loadPosition == index) {
                this.preload(index + 1);
            }
        };
        SourcePreLoader.prototype.reload = function () {
            if (this.isLoading)
                return;
            if (this.isComplete && this.hasError) {
                this.isComplete = false;
                this.hasError = false;
                for (var i = 0; i < this.loaderList.length; ++i) {
                    this.loaderList[i].retry = 0;
                }
                this.preload();
            }
        };
        SourcePreLoader.prototype.forEach = function (callback) {
            for (var i = 0; i < this._numSources; ++i) {
                callback(i, this.loaderList[i]);
            }
        };
        return SourcePreLoader;
    }());
    k7.SourcePreLoader = SourcePreLoader;
})(k7 || (k7 = {}));
/// <reference path="ASourceLoader.ts" />

(function (k7) {
    var SpineLoader = /** @class */ (function (_super) {
        __extends(SpineLoader, _super);
        function SpineLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpineLoader.prototype.start = function () {
        };
        return SpineLoader;
    }(k7.ASourceLoader));
    k7.SpineLoader = SpineLoader;
})(k7 || (k7 = {}));

(function (k7) {
    var EAlertType;
    (function (EAlertType) {
        /** 显示两个按钮 */
        EAlertType[EAlertType["DOUBLE"] = 0] = "DOUBLE";
        /** 只显示左边的 */
        EAlertType[EAlertType["LEFT"] = 1] = "LEFT";
        /** 只显示右边的 */
        EAlertType[EAlertType["RIGHT"] = 2] = "RIGHT";
        /** 左右按钮颜色交换[TODO] */
        EAlertType[EAlertType["SWAP"] = 3] = "SWAP";
        /** 什么按钮都没有 */
        EAlertType[EAlertType["NONE"] = 4] = "NONE";
    })(EAlertType = k7.EAlertType || (k7.EAlertType = {}));
    /**
     *  Alert弹窗，具体界面由fairygui完成，需要遵循以下规则，即可快速完成一个Alert弹窗的制作
     * 1、必须放置一个命名为frame的组件，且里面有一个top控制器，控制closeButton是否显示，0不显示，1显示
     * 2、必须有两个按钮和一个文本框，且按钮需命名为leftButton,rightButton,文本框需命名为contentTextFiled
     * 3、使用方法为继承使用，列子如下
        export class AlertWindow extends kqframe.AlertWindow {
            static inst: AlertWindow;
            static show(content: string, param: kqframe.IAlertParam = {}): AlertWindow {
                if (AlertWindow.inst == null) {
                    AlertWindow.inst = new AlertWindow('Alert', 'Gobang');
                }
                AlertWindow.inst.setAndShow(content,param);
                return AlertWindow.inst;
            }
        }
        //也可以直接创建一个全局函数，简化API，例子如下：
        function appAlert(content: string, param: kqframe.IAlertParam = {}) {
            if (null == kqframe.AlertWindow.inst) {
                kqframe.AlertWindow.inst = new kqframe.AlertWindow('Alert', 'Gobang');
            }
            return kqframe.AlertWindow.inst.setAndShow(content, param);
        }
     * 4、如果要默认配置一种类型的文本，可直接在fgui的ide里写死，若需要配置不同的名称，可继承AlertWindow扩展refurbish函数，如下：
        refurbish(){
            super.refurbish();
            this.leftButton.title = this.param.textL || (this.param.type == EAlertType.SWAP ? "取消" : "同意");
            this.rightButton.title = this.param.textR || (this.param.type == EAlertType.DOUBLE ? "拒绝" : "确定");
        }
     * 5、可使用import appAlert = AlertWindow.show 的方式，缩短访问路径
     */
    var AlertWindow = /** @class */ (function (_super) {
        __extends(AlertWindow, _super);
        function AlertWindow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AlertWindow.prototype.bindChild = function () {
            this.stateCtrl = this.getController('state');
            this.topCtrl = this.getController('frame.top');
            this.leftButton = this.getButton("leftButton");
            this.rightButton = this.getButton("rightButton");
            this.contentTextFiled = this.getTextField("contentTextFiled");
        };
        AlertWindow.prototype.setAndShow = function (content, param) {
            if (param === void 0) { param = {}; }
            this.contentString = content;
            this.param = param;
            this.show();
            return this;
        };
        AlertWindow.prototype.refreshUi = function () {
            if (this.topCtrl)
                this.topCtrl.selectedIndex = this.param.noClose ? 1 : 0;
            if (this.param.type !== 1 && this.param.type !== 2 && this.param.type !== 3)
                this.param.type = 0;
            this.stateCtrl.selectedIndex = this.param.type;
            this.contentTextFiled.text = this.contentString;
            if (this.param.title)
                this.frame.icon = this.param.title;
            if (this.param.textL)
                this.leftButton.title = this.param.textL;
            if (this.param.textR)
                this.rightButton.title = this.param.textR;
        };
        AlertWindow.prototype.onClickButton = function (button) {
            switch (button) {
                case this.leftButton:
                    this.param.type == EAlertType.SWAP ? this.onClickRight() : this.onClickLeft();
                    break;
                case this.rightButton:
                    this.param.type == EAlertType.SWAP ? this.onClickLeft() : this.onClickRight();
                    break;
            }
        };
        AlertWindow.prototype.onClickLeft = function () {
            if (!this.param.stayL)
                this.hide();
            if (typeof this.param.subL == "function") {
                this.param.subL.call(this.param.objL || this.param.thisObj || this);
            }
        };
        AlertWindow.prototype.onClickRight = function () {
            if (!this.param.stayL)
                this.hide();
            if (typeof this.param.subR == "function") {
                this.param.subR.call(this.param.objR || this.param.thisObj || this);
            }
        };
        AlertWindow.prototype.hide = function () {
            _super.prototype.hide.call(this);
            if (typeof this.param.onClose == "function") {
                this.param.onClose.call(this.param.objCLose || this.param.thisObj || this);
            }
        };
        return AlertWindow;
    }(k7.AppWindow));
    k7.AlertWindow = AlertWindow;
    var AlertTip = /** @class */ (function (_super) {
        __extends(AlertTip, _super);
        function AlertTip() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tweenTime = 350;
            return _this;
        }
        AlertTip.prototype.setAndShow = function (content, y, time, lock) {
            if (time === void 0) { time = 1500; }
            this.viewComponent.asLabel.title = content;
            this.showTime = time;
            this.lock = lock;
            if (lock) {
                if (!this.win) {
                    this.win = new GWindow();
                    this.win.modal = true;
                }
                this.win.contentPane = this.viewComponent;
                this.win.show();
                this.win.center();
                if (y > 0)
                    this.win.y = y;
            }
            else {
                GRoot.inst.addChild(this);
                this.center();
                if (y > 0)
                    this.y = y;
            }
            this.alpha = 0;
            k7.Engine.tweenTo(this, { alpha: 1 }, this.tweenTime, k7.EaseName.QuadOut);
            this.timeoutId = setTimeout(this.hide.bind(this), time);
            return this;
        };
        AlertTip.prototype.hide = function () {
            var _this = this;
            if (!isNaN(this.timeoutId)) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            k7.Engine.tweenTo(this, { alpha: 0 }, this.tweenTime, k7.EaseName.QuadIn, this, function () {
                if (_this.lock) {
                    _this.win && _this.win.hide();
                }
                else {
                    _this.removeFromParent();
                }
            });
        };
        return AlertTip;
    }(k7.AppComp));
    k7.AlertTip = AlertTip;
})(k7 || (k7 = {}));
