declare namespace k7 {
    interface IKBuffer<T> {
        buffer: ArrayBuffer;
        length: number;
        skip(value: number): T;
        append(buffer: ArrayBuffer): T;
        setBE(): T;
        setLE(): T;
    }
    interface IKBufferWriter extends IKBuffer<IKBufferWriter> {
        ubyte(value: number | ArrayBuffer | Uint8Array, ...args: (number | ArrayBuffer | Uint8Array)[]): IKBufferWriter;
        byte(value: number | ArrayBuffer | Uint8Array, ...args: (number | ArrayBuffer | Uint8Array)[]): IKBufferWriter;
        ushort(value: number, ...args: number[]): IKBufferWriter;
        short(value: number, ...args: number[]): IKBufferWriter;
        uint(value: number, ...args: number[]): IKBufferWriter;
        int(value: number, ...args: number[]): IKBufferWriter;
        ulong(value: number, ...args: number[]): IKBufferWriter;
        long(value: number, ...args: number[]): IKBufferWriter;
        float(value: number, ...args: number[]): IKBufferWriter;
        double(value: number, ...args: number[]): IKBufferWriter;
        char(value: string, ...args: string[]): IKBufferWriter;
        write(func: (writer: IKBufferWriter) => number, ...args: any[]): IKBufferWriter;
    }
    interface IKBufferReader extends IKBuffer<IKBufferReader> {
        ubyte(length?: number): number | ArrayBuffer;
        byte(length?: number): number | ArrayBuffer;
        ushort(): number;
        short(): number;
        uint(): number;
        int(): number;
        ulong(): number;
        long(): number;
        float(): number;
        double(): number;
        char(len?: number): string;
        read(func: (reader: IKBufferReader) => number): IKBufferReader;
    }
    class KBuffer {
        protected _buffer: ArrayBuffer;
        protected _length: number;
        protected _position: number;
        protected _maxPos: number;
        protected _view: DataView;
        protected _isLE: boolean;
        constructor(size: number);
        constructor(buffer?: ArrayBuffer);
        append(buffer: ArrayBuffer | Uint8Array): this;
        skip(value: number): this;
        slice(start?: number, end?: number): ArrayBuffer;
        setBE(): this;
        setLE(): this;
        readonly buffer: ArrayBuffer;
        readonly length: number;
        readonly pos: number;
    }
}
declare namespace k7 {
    class BufferReader extends KBuffer implements IKBufferReader {
        int(): number;
        uint(): number;
        byte(len?: number): number | ArrayBuffer;
        ubyte(): number;
        short(): number;
        ushort(): number;
        long(): number;
        ulong(): number;
        float(): number;
        double(): number;
        char(len: number): string;
        read(func: (reader: IKBufferReader) => any): any;
    }
}
declare namespace k7 {
    class BufferWriter extends KBuffer implements IKBufferWriter {
        uint(value: number, ...args: number[]): BufferWriter;
        int(value: number, ...args: number[]): BufferWriter;
        ubyte(value: number | ArrayBuffer | Uint8Array, ...args: any[]): BufferWriter;
        byte(value: number | ArrayBuffer | Int8Array, ...args: any[]): BufferWriter;
        short(value: number, ...args: number[]): BufferWriter;
        ushort(value: number, ...args: number[]): BufferWriter;
        long(value: number, ...args: number[]): BufferWriter;
        ulong(value: number, ...args: number[]): BufferWriter;
        float(value: number, ...args: number[]): BufferWriter;
        double(value: number, ...args: number[]): BufferWriter;
        char(value: string, ...args: string[]): BufferWriter;
        write(func: (IBufferWriter: any) => void, ...args: any[]): BufferWriter;
    }
}
declare namespace k7 {
    namespace EaseName {
        const CircIn = "circIn";
        const CircOut = "circOut";
        const CircInOut = "circInOut";
        const BackIn = "backIn";
        const BackOut = "backOut";
        const BackInOut = "backInOut";
        const QuadIn = "quadIn";
        const QuadOut = "quadOut";
        const QuadInOut = "quadInOut";
        const LINEAR = "linear";
    }
    var Engine: EngineAdapter;
    interface EngineAdapter {
        onClick(engineDisplayObject: any, thisObj: any, callback: any): any;
        /**
         * 播放缓动动画
         * @param target 缓动对象，从数学理论上，应是任何对象，但可能受到引擎实现的差异，以引擎为准
         * @param prop 缓动属性及目标值
         * @param time 缓动目标时间，毫秒值
         * @param ease 缓动曲线，@see k7.EaseName
         * @param thisObj
         * @param callback
         * @param delay 延迟播放时间
         */
        tweenTo(target: any, prop: any, time: number, ease: string, thisObj?: any, callback?: Function, delay?: number): any;
        saveLocal(key: string, value: string | any): any;
        readLocal(key: string, toJson: boolean): string | any;
        /**
         * 调用引擎实现的 httpRequest
         * @param url 请求的URL
         * @param thisObj 指定回调时的this域
         * @param callback: (respData: any, reqLoader: any) => void 回调函数有两个参数，
         * respData为返回的数据，reqLoader为实际的请求对象(包含所有请求与返回信息)
         */
        httpRequest(url: string | IHttpArgs, thisObj: any, callback: (respData: any, reqLoader: any) => void): any;
    }
    /**
     * 发送 HTTP 请求参数。
     */
    interface IHttpArgs {
        /** 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。 */
        url: string;
        /** 发送的数据。(default = null) */
        data?: string | ArrayBuffer | any;
        /** 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。 (default = "get")*/
        method?: string;
        /** Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。(default = "text") */
        responseType?: string;
        /** HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。 (default = null)*/
        headers?: string[];
    }
    interface IEventDispatcher {
        on(type: string, thisObj: any, callback: Function, params?: any[]): any;
        off(type: string, thisObj: any, callback: Function): any;
        event(type: string, data?: any): any;
    }
}
declare namespace k7 {
    var Fairy: FairyAdapter;
    interface FairyAdapter {
        loadPack(url: string, progressCallback: () => void, completeCallback: () => void): any;
        playTransition(comp: any, id: any, thisObj?: any, callback?: any): any;
        onStageEvent(displayObject: any, thisObj: any, listener: (type: any, displayObject: any) => void): any;
    }
}
declare namespace k7 {
    namespace Query {
        function parse(text: string): any;
        function stringify(value: any): string;
    }
}
/**
 * 事件抛出器
 */
declare namespace mvc {
    /**
     * 初始化 mvc功能，需要使用标准接口，实现事件收发器（具体参考各大引擎）
     * @param evtInst
     */
    function init(evtInst: k7.IEventDispatcher): void;
    interface ICommand {
        execute(eventName: string, params: any): void;
    }
    interface IMediatorCaller {
        name: string;
        handler: Function | Function[];
    }
    interface IMediator {
        mediatorName: string;
        viewComponent: any;
        eventList: (string | IMediatorCaller)[];
        onRegister(): void;
        onEvent(eventName: string, params: any): void;
        onRemove(): void;
    }
    class Mediator implements IMediator {
        mediatorName: any;
        viewComponent: any;
        eventList: any;
        constructor(name?: any, view?: any);
        onRegister(): void;
        onEvent(eventName: string, params: any): void;
        onRemove(): void;
    }
    /**
     * 发布一个事件，会同时响应：所有mvc.on监听的事件、新的ICommand实例、IMediator的onEvent函数。
     * 3个响应方式级别相同，先后顺序由注册顺序决定
     * 自定义的函数响应，使用on注册，使用off关闭，使用once监听一次自动关闭
     * Mediator使用registerMediator注册，使用removeMediator关闭
     * Command使用registerCommand注册，使用removeCommand关闭
     * @param eventName 事件名
     * @param params 事件参数
     */
    function send(eventName: string, params?: any): void;
    function on(eventName: string, thisObj: any, callback: Function): void;
    function off(eventName: string, thisObj: any, callback: Function): void;
    function once(eventName: string, thisObj: any, callback: Function): void;
    function registerCommand(eventName: string, commandClassRef: any): void;
    function removeCommand(eventName: string): void;
    function hasCommand(eventName: string): boolean;
    function registerMediator(mediator: IMediator): void;
    function removeMediator(mediatorName: string): IMediator;
    function retrieveMediator(mediatorName: string): IMediator;
    function hasMediator(mediatorName: string): boolean;
    function hasInMediator(eventName: string): boolean;
}
declare namespace k7 {
    class CocosAdapter implements EngineAdapter {
        onClick(engineDisplayObject: any, thisObj: any, callback: any): void;
        tweenTo(target: any, prop: any, time: number, ease?: string, thisObj?: any, callback?: Function, delay?: number): void;
        saveLocal(key: string, value: string | any): void;
        readLocal(key: string, toJson: boolean): string | any;
        httpRequest(url: string | IHttpArgs, thisObj: any, callback: (respData: any, reqLoader: any) => void): void;
    }
    class CocosEventDispatcher implements IEventDispatcher {
        protected eventTarget: cc.EventTarget;
        protected eventMap: {
            type: string;
            thisObj: any;
            callback: Function;
            params?: any[];
            _listen: (...data: any[]) => void;
        }[];
        protected searchEvent(type: any, thisObj: any, callback: any): boolean;
        on(type: string, thisObj: any, callback: Function, params?: any[]): void;
        off(type: string, thisObj: any, callback: Function): void;
        event(type: string, data?: any): void;
    }
}
import GObject = fgui.GObject;
import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GLabel = fgui.GLabel;
import GProgressBar = fgui.GProgressBar;
import GTextField = fgui.GTextField;
import GRichTextField = fgui.GRichTextField;
import GTextInput = fgui.GTextInput;
import GLoader = fgui.GLoader;
import GList = fgui.GList;
import GGraph = fgui.GGraph;
import GGroup = fgui.GGroup;
import GSlider = fgui.GSlider;
import GComboBox = fgui.GComboBox;
import GImage = fgui.GImage;
import GMovieClip = fgui.GMovieClip;
import GController = fgui.Controller;
import GTransition = fgui.Transition;
import GWindow = fgui.Window;
import GRoot = fgui.GRoot;
import FUIPackage = fgui.UIPackage;
import FEvent = fgui.Event;
import IUISource = fgui.IUISource;
declare namespace k7 {
    class CocosFairyAdapter implements FairyAdapter {
        loadPack(url: string, progressCallback: () => void, completeCallback: (err: any) => void): void;
        playTransition(comp: GComponent, id: string, thisObj: any, callback: Function): boolean;
        onStageEvent(displayObject: GObject, thisObj: any, listener: (type: string, displayObject: GObject) => void): void;
    }
}
