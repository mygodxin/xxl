declare namespace k7 {
    const EVT_FAIRY_CLICK: string;
    const EVT_STAGE_ADDED: string;
    const EVT_FAIRY_SHOW: string;
    const EVT_STAGE_REMOVED: string;
    const EVT_FAIRY_HIDE: string;
    const EVT_STAGE_RESIZE: string;
    // ui资源缓存系统
    const EVT_UI_ONREADY: string;
    const EVT_UI_ONHIDE: string;
    class FairyChild implements IFairyChildOnwer {
        static TEMP: FairyChild;
        protected owner: IFairyChildOnwer;
        protected viewComponent: GComponent;
        constructor(viewComponent?: any, owner?: IFairyChildOnwer);
        setRoot(viewRoot: GComponent, owner?: IFairyChildOnwer): FairyChild;
        onClickButton(button: GButton): void;
        onCloseWindow(window: GWindow): void;
        /** 监听所有按钮类型的事件发布，暂未应用，必要性，有待论证 */
        protected listenAllButton(view: GComponent): void;
        /**
         * 根据点运算符获取末端对象
         * @param path 点运算路径
         * @param view 要获取的对象的相对更路径
         * @param type 要获取对象的类型（全小写的对象类型名称）
         */
        protected getObj(path: string, view?: GComponent, type?: string): GObject | GController | GTransition;
        getComp(path: string): GComponent;
        getButton(path: string, clickListener?: Function, parent?: GComponent): GButton;
        getLabel(path: string): GLabel;
        getProgressBar(path: string): GProgressBar;
        getTextField(path: string): GTextField;
        getRichTextField(path: string): GRichTextField;
        getTextInput(path: string): GTextInput;
        getLoader(path: string): GLoader;
        getList(path: string): GList;
        getGraph(path: string): GGraph;
        getGroup(path: string): GGroup;
        getSlider(path: string): GSlider;
        getComboBox(path: string): GComboBox;
        getImage(path: string): GImage;
        getMovieClip(path: string): GMovieClip;
        getController(path: string): GController;
        getTransition(path: string): GTransition;
        protected windowDict: any;
        getWindow(name: string, closeListener?: Function, parent?: GComponent): GWindow;
    }
    class AniWindow extends GWindow {
        constructor(comp: GComponent);
        doShowAnimation(): void;
        onShowAniComplete(): void;
        doHideAnimation(): void;
    }
    interface IFairyChildOnwer {
        onClickButton(view: GButton): void;
        onCloseWindow(window: GWindow): void;
    }
    interface IFairyChild {
        setRoot(view: GComponent): void;
        getComp(path: string): GComponent;
        getButton(path: string): GButton;
        getLabel(path: string): GLabel;
        getProgressBar(path: string): GProgressBar;
        getTextField(path: string): GTextField;
        getRichTextField(path: string): GRichTextField;
        getTextInput(path: string): GTextInput;
        getLoader(path: string): GLoader;
        getList(path: string): GList;
        getGraph(path: string): GGraph;
        getGroup(path: string): GGroup;
        getSlider(path: string): GSlider;
        getComboBox(path: string): GComboBox;
        getImage(path: string): GImage;
        getMovieClip(path: string): GMovieClip;
        getController(path: string): GController;
        getTransition(path: string): GTransition;
        getWindow(path: string): GWindow;
    }
    function getFairyPath(obj: GObject): string;
    var fairyUrlLocalPrefix: string;
    var fairyUrlRemotePrefix: string;
}
declare namespace k7 {
    class AppComp extends GComponent implements IFairyChild, IFairyChildOnwer, mvc.IMediator {
        contentPane: GComponent;
        constructor(viewComponent: GObject | string, pack?: string);
        bindChild(): void;
        onResize(): void;
        onClickButton(button: GButton): void;
        onCloseWindow(window: GWindow): void;
        protected fairyAdapter: FairyChild;
        setRoot(view: GComponent): void;
        getComp(path: string): GComponent;
        getLabel(path: string): GLabel;
        getProgressBar(path: string): GProgressBar;
        getTextField(path: string): GTextField;
        getRichTextField(path: string): GRichTextField;
        getTextInput(path: string): GTextInput;
        getLoader(path: string): GLoader;
        getList(path: string): GList;
        getGraph(path: string): GGraph;
        getGroup(path: string): GGroup;
        getSlider(path: string): GSlider;
        getComboBox(path: string): GComboBox;
        getImage(path: string): GImage;
        getMovieClip(path: string): GMovieClip;
        getController(path: string): GController;
        getTransition(path: string): GTransition;
        getButton(path: string, clickListener?: Function, parent?: GComponent): GButton;
        getWindow(path: string, closeListener?: Function, parent?: GComponent): GWindow;
        protected mediatorAdapter: mvc.Mediator;
        readonly mediatorName: string;
        readonly viewComponent: this;
        eventList: (string | mvc.IMediatorCaller)[];
        onRegister(): void;
        onEvent(eventName: string, params: any): void;
        onRemove(): void;
    }
}
declare namespace k7 {
    function getFairyInstence(type: any, ...args: any[]): AppWindow;
}
declare namespace k7 {
    class AppWindow extends GWindow implements IFairyChild, IFairyChildOnwer, mvc.IMediator {
        static configLoadingWaiting: string;
        static show(type: any, param?: any): AppWindow;
        /**点击空白处关闭 */
        hideOnTap: boolean;
        /** 资源的包名 */
        pack: string;
        /** 加载地址前缀 */
        prefix: string;
        /** 是否 是一个全屏界面，全屏界面会无视isCenter属性 */
        isFullScreen: boolean;
        /** 是否 是一个居中对齐的界面 */
        isCenter: boolean;
        /** 是否 是一个被弹出管理的window，此类window点击空白处即关闭 */
        isPopup: boolean;
        /** 指定进场动画函数 */
        showAnimation: (window: AppWindow, complete: Function) => void;
        /** 指定出场动画函数 */
        hideAnimation: (window: AppWindow, complete: Function) => void;
        /** 打开win时需要传递的参数 */
        protected openData: any;
        /** 导出的组件名，组件所在的包，指定加载的(如果纹理需要独立加载的情况) */
        constructor(name: string, pack: string, ...sources: IUISource[]);
        getUISources(): IUISource[];
        protected onStageEvent(type: string): void;
        protected initConfig(): void;
        show(): void;
        showByParams(param?: any): AppWindow;
        hide(): void;
        protected hideThenCall: Function;
        protected hideThenObj: any;
        hideThen(next: Function, nextObj: any): void;
        init(): void;
        protected loadingWaitPane: GObject;
        protected showLoadingWait(): void;
        protected layoutLoadingWaitPane(): void;
        protected closeLoadingWait(): void;
        protected onInit(): void;
        protected topArea: GComponent;
        protected bottomArea: GComponent;
        protected centerArea: GComponent;
        protected transShowName: string;
        protected transHideName: string;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        protected onShowAniComplete(): void;
        protected onHideAniComplete(): void;
        onResize(): void;
        bindChild(): void;
        refreshUi(): void;
        onClickButton(button: GButton): void;
        onCloseWindow(window: GWindow): void;
        onSubWindowClose(win: AppWindow): void;
        /** 绑定在此窗口下的子窗口列表 */
        subWindowsList: {};
        /** 当前窗口绑定在哪个窗口下，缓存在此变量中 */
        ownerWindow: AppWindow;
        /** 注册一个子窗口，随后可以用字符串打开该窗口，并绑定了子窗口该子窗口，详见bindSubWindow */
        registerSubWindow(WinClass: any, name: string, pack?: string, tex?: string): AppWindow;
        /** 绑定一个窗口实例为当前窗口的子窗口，启动关闭将会有冒泡联动通知（比如：用于刷新） */
        bindSubWindow(win: AppWindow): AppWindow;
        /** 打开一个子窗口 */
        showSubWindow(name: string, openData?: any): AppWindow;
        /** 关闭所有子窗口 */
        closeAllSubWindow(): void;
        /** 刷新父窗口界面(使用场景举例：子界面某操作更新大厅数据) */
        refreshOwnerWindow(): void;
        protected uiMediators: mvc.IMediator[];
        registerMediators(): void;
        removeMediators(): void;
        protected fairyAdapter: FairyChild;
        setRoot(view: GComponent): void;
        getComp(path: string): GComponent;
        getLabel(path: string): GLabel;
        getProgressBar(path: string): GProgressBar;
        getTextField(path: string): GTextField;
        getRichTextField(path: string): GRichTextField;
        getTextInput(path: string): GTextInput;
        getLoader(path: string): GLoader;
        getList(path: string): GList;
        getGraph(path: string): GGraph;
        getGroup(path: string): GGroup;
        getSlider(path: string): GSlider;
        getComboBox(path: string): GComboBox;
        getImage(path: string): GImage;
        getMovieClip(path: string): GMovieClip;
        getController(path: string): GController;
        getTransition(path: string): GTransition;
        getButton(path: string, clickListener?: Function, parent?: GComponent): GButton;
        getWindow(path: string, closeListener?: Function, parent?: GComponent): GWindow;
        protected mediatorAdapter: mvc.Mediator;
        readonly mediatorName: string;
        readonly viewComponent: this;
        eventList: (string | mvc.IMediatorCaller)[];
        onRegister(): void;
        onEvent(eventName: string, params: any): void;
        onRemove(): void;
    }
}
declare namespace k7 {
    class AppScene extends AppWindow {
        static current: AppScene;
        /**在部分场景中，如果直接使用instance of表达式可能会导致循环依赖的异常 */
        sceneName: string;
        static show(type: any, param?: any): AppWindow;
        protected initConfig(): void;
        /** 场景显示，若已有场景，会自带切换功能(旧版逻辑在代码尾部，若遇到问题可参考) */
        show(): void;
        onHide(): void;
    }
}
declare namespace k7 {
    class MediatorUiAdapter extends mvc.Mediator {
        subMediators: mvc.IMediator[];
        owner: mvc.IMediator;
        constructor(name: any, view: any);
        onShow(): void;
        onReady(): void;
        onHide(): void;
        bindMediator(...args: mvc.IMediator[]): void;
        onRegister(): void;
        readonly eventList: (string | mvc.IMediatorCaller)[];
        onEvent(eventName: string, params: any): void;
        onRemove(): void;
    }
}
declare namespace k7 {
    const EVT_SourceLoader_CompleteEvent = "EVT_SourceLoader_CompleteEvent";
    const EVT_SourceLoader_FailEvent = "EVT_SL_Fail";
    const EVT_SourceLoader_ProgressEvent = "EVT_SourceLoader_ProgressEvent";
    abstract class ASourceLoader implements IUISource {
        fileName: string;
        /**file name 对应的包所有资源已经加载完成 */
        loaded: boolean;
        /**本次加载任务成功 */
        succeed: boolean;
        /**本次加载任务失败 */
        failed: boolean;
        /**本次任务是否预加载 */
        preload: boolean;
        callbacks: Function[];
        thisObjs: any[];
        loading: boolean;
        retry: number;
        startime: number;
        loadtime: number;
        //by myx
        completedCount
        totalCount
        /**
         * 若正在加载过程中，重复调用，将只会注册不同的回调函数，但不会重复换起加载。
         * 加载成功后，将自动清除所有回调。
         *  若想维护监听状态，则不要传入回调函数，使用事件机制来处理回调。
         */
        load(callback?: Function, thisObj?: any, atlases?: number[]): void;
        fail(callback?: Function, thisObj?: any): void;
        /**
         * 由具体业务抽象实现加载过程
         */
        protected abstract start(atlases: number[]): any;
        protected complete(): void;
        protected success(): void;
        protected onfailed(): void;
    }
}
declare namespace k7 {
    class FairyLoader extends ASourceLoader {
        protected data: FairyGObjectItem[];
        constructor(packName: string, bundle?: cc.AssetManager.Bundle, classType?: any, gObjectName?: string, ...args: any[]);
        protected start(atlases: number[]): void;
        protected onLoadProcess(count: number, total: number): void;
        protected onPackLoaded(err: any, pkg: UIPackage): void;
        protected preCreateAppWindow(position?: number): void;
    }
    interface FairyGObjectItem {
        /** 要创建的目标Class类定义 */
        type: any;
        /** 要绑定的FGUI里的资源导出名 */
        name: string;
        /** 以目标Class创建出来的实例 */
        inst?: k7.AppWindow;
    }
}
declare namespace k7 {
    class SourcePreLoader {
        protected loaderList: ASourceLoader[];
        protected _numSources: number;
        protected loadPosition: number;
        readonly numSources: number;
        isLoading: boolean;
        isComplete: boolean;
        hasError: boolean;
        numRetrys: number;
        constructor();
        addSource(...sourceLoader: ASourceLoader[]): void;
        addSource(sources: ASourceLoader[]): void;
        preload(index?: number): void;
        protected onItemLoaded(sourceLoader: ASourceLoader): void;
        reload(): void;
        forEach(callback: (index: number, loader: ASourceLoader) => void): void;
    }
}
declare namespace k7 {
    class SpineLoader extends ASourceLoader {
        protected start(): void;
    }
}
declare namespace k7 {
    interface IAlertParam {
        /** 按钮数量及颜色配置 */
        type?: EAlertType;
        /** 默认this指针 */
        thisObj?: any;
        /** 自定义左按钮文字 */
        textL?: string;
        /** 左按钮回调 */
        subL?: Function;
        /**  */
        objL?: any;
        /** 点击后界面是否停留不关闭 */
        stayL?: boolean;
        /** 自定义右按钮文字 */
        textR?: string;
        /** 右按钮回调 */
        subR?: Function;
        /**  */
        objR?: any;
        /** 点击后界面是否停留不关闭 */
        stayR?: boolean;
        title?: string;
        /** 没有关闭按钮 */
        noClose?: boolean;
        /** 关闭回调(只要关闭就会回调，和关闭方式无关) */
        onClose?: Function;
        /**  */
        objCLose?: any;
    }
    enum EAlertType {
        /** 显示两个按钮 */
        DOUBLE = 0,
        /** 只显示左边的 */
        LEFT = 1,
        /** 只显示右边的 */
        RIGHT = 2,
        /** 左右按钮颜色交换[TODO] */
        SWAP = 3,
        /** 什么按钮都没有 */
        NONE = 4
    }
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
    class AlertWindow extends AppWindow {
        static inst: AlertWindow;
        protected contentString: string;
        protected param: IAlertParam;
        protected stateCtrl: GController;
        protected topCtrl: GController;
        protected leftButton: GButton;
        protected rightButton: GButton;
        protected contentTextFiled: GTextField;
        bindChild(): void;
        setAndShow(content: string, param?: k7.IAlertParam): AlertWindow;
        refreshUi(): void;
        onClickButton(button: GButton): void;
        onClickLeft(): void;
        onClickRight(): void;
        hide(): void;
    }
    class AlertTip extends AppComp {
        static inst: AlertTip;
        tweenTime: number;
        protected showTime: number;
        protected lock: boolean;
        protected win: GWindow;
        protected timeoutId: number;
        setAndShow(content: string, y?: number, time?: number, lock?: boolean): AlertTip;
        hide(): void;
    }
}
