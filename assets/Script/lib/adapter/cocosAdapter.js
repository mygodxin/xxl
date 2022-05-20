var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window.k7 = window.k7 || {};

(function (k7) {
    var KBuffer = /** @class */ (function () {
        function KBuffer() {
            var p = arguments[0];
            if (typeof p == 'number') {
                this._buffer = new ArrayBuffer(p);
                this._maxPos = p;
            }
            else if (p instanceof ArrayBuffer) {
                this._buffer = p;
                this._maxPos = p.byteLength;
            }
            else {
                this._buffer = new ArrayBuffer(4096);
                this._maxPos = 0;
            }
            this._view = new DataView(this.buffer);
            this._position = 0;
        }
        KBuffer.prototype.append = function (buffer) {
            //TODO
            return this;
        };
        KBuffer.prototype.skip = function (value) {
            this._position += value;
            if (this._maxPos < this._position)
                this._maxPos = this._position;
            return this;
        };
        KBuffer.prototype.slice = function (start, end) {
            if (start === void 0) { start = 0; }
            return this.buffer.slice(start, end || this._maxPos);
        };
        KBuffer.prototype.setBE = function () {
            this._isLE = false;
            return this;
        };
        KBuffer.prototype.setLE = function () {
            this._isLE = true;
            return this;
        };
        Object.defineProperty(KBuffer.prototype, "buffer", {
            get: function () {
                return this._buffer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KBuffer.prototype, "length", {
            get: function () {
                return this._maxPos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KBuffer.prototype, "pos", {
            get: function () {
                return this._position;
            },
            enumerable: true,
            configurable: true
        });
        return KBuffer;
    }());
    k7.KBuffer = KBuffer;
})(k7 || (k7 = {}));
/// <reference path="KBuffer.ts" />

(function (k7) {
    var BufferReader = /** @class */ (function (_super) {
        __extends(BufferReader, _super);
        function BufferReader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BufferReader.prototype.int = function () {
            var n = this._view.getInt32(this._position, this._isLE);
            this._position += 4;
            return n;
        };
        BufferReader.prototype.uint = function () {
            var n = this._view.getUint32(this._position, this._isLE);
            this._position += 4;
            return n;
        };
        BufferReader.prototype.byte = function (len) {
            if (isNaN(len)) {
                var n = this._view.getInt8(this._position);
                this._position += 1;
                return n;
            }
            else {
                var buffer = this._view.buffer.slice(this._position, this._position + len);
                this._position += len;
                return buffer;
            }
        };
        BufferReader.prototype.ubyte = function () {
            var n = this._view.getUint8(this._position);
            this._position += 1;
            return n;
        };
        BufferReader.prototype.short = function () {
            var n = this._view.getInt16(this._position, this._isLE);
            this._position += 2;
            return n;
        };
        BufferReader.prototype.ushort = function () {
            var n = this._view.getUint16(this._position, this._isLE);
            this._position += 2;
            return n;
        };
        BufferReader.prototype.long = function () {
            var low, high;
            if (this._isLE) {
                low = this._view.getUint32(this._position, this._isLE);
                high = this._view.getInt32(this._position, this._isLE) * 4294967296.0;
            }
            else {
                high = this._view.getInt32(this._position, this._isLE) * 4294967296.0;
                low = this._view.getUint32(this._position, this._isLE);
            }
            this._position += 8;
            return high + low;
        };
        BufferReader.prototype.ulong = function () {
            var low, high;
            if (this._isLE) {
                low = this._view.getUint32(this._position, this._isLE);
                high = this._view.getUint32(this._position, this._isLE) * 4294967296.0;
            }
            else {
                high = this._view.getUint32(this._position, this._isLE) * 4294967296.0;
                low = this._view.getUint32(this._position, this._isLE);
            }
            this._position += 8;
            return high + low;
        };
        BufferReader.prototype.float = function () {
            var n = this._view.getFloat32(this._position, this._isLE);
            this._position += 4;
            return n;
        };
        BufferReader.prototype.double = function () {
            var n = this._view.getFloat64(this._position, this._isLE);
            this._position += 8;
            return n;
        };
        BufferReader.prototype.char = function (len) {
            var s = '';
            for (var i = 0; i < len; ++i) {
                s += String.fromCharCode(this.byte());
            }
            return s;
        };
        BufferReader.prototype.read = function (func) {
            return func.apply(func, this);
        };
        return BufferReader;
    }(k7.KBuffer));
    k7.BufferReader = BufferReader;
})(k7 || (k7 = {}));
/// <reference path="KBuffer.ts" />

(function (k7) {
    var BufferWriter = /** @class */ (function (_super) {
        __extends(BufferWriter, _super);
        function BufferWriter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BufferWriter.prototype.uint = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setUint32(this._position, arguments[i], this._isLE);
                this.skip(4);
            }
            return this;
        };
        BufferWriter.prototype.int = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setInt32(this._position, arguments[i], this._isLE);
                this.skip(4);
            }
            return this;
        };
        BufferWriter.prototype.ubyte = function () {
            for (var i = 0; i < arguments.length; ++i) {
                var value = arguments[i];
                if (typeof value == 'number') {
                    this._view.setUint8(this._position, value);
                    this.skip(1);
                    return this;
                }
                else if (value instanceof ArrayBuffer) {
                    value = new Uint8Array(value);
                }
                if (value instanceof Uint8Array) {
                    for (var i_1 = 0; i_1 < value.length; ++i_1) {
                        this._view.setUint8(this._position, value[i_1]);
                        this.skip(1);
                    }
                }
            }
            return this;
        };
        BufferWriter.prototype.byte = function () {
            for (var i = 0; i < arguments.length; ++i) {
                var value = arguments[i];
                if (typeof value == 'number') {
                    this._view.setInt8(this._position, value);
                    this.skip(1);
                    return this;
                }
                else if (value instanceof ArrayBuffer) {
                    value = new Int8Array(value);
                }
                if (value instanceof Int8Array || value instanceof Uint8Array) {
                    for (var i_2 = 0; i_2 < value.length; ++i_2) {
                        this._view.setInt8(this._position, value[i_2]);
                        this.skip(1);
                    }
                }
            }
            return this;
        };
        BufferWriter.prototype.short = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setInt16(this._position, arguments[i], this._isLE);
                this.skip(2);
            }
            return this;
        };
        BufferWriter.prototype.ushort = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setUint16(this._position, arguments[i], this._isLE);
                this.skip(2);
            }
            return this;
        };
        BufferWriter.prototype.long = function () {
            for (var i = 0; i < arguments.length; ++i) {
                var value = arguments[i];
                var high = Math.floor(value / 4294967296.0);
                var low = value & 0xffffffff;
                if (this._isLE) {
                    this._view.setUint32(this._position, low, this._isLE);
                    this.skip(4);
                    this._view.setInt32(this._position, high, this._isLE);
                    this.skip(4);
                }
                else {
                    this._view.setInt32(this._position, high, this._isLE);
                    this.skip(4);
                    this._view.setUint32(this._position, low, this._isLE);
                    this.skip(4);
                }
            }
            return this;
        };
        BufferWriter.prototype.ulong = function () {
            for (var i = 0; i < arguments.length; ++i) {
                var value = arguments[i];
                var high = Math.floor(value / 4294967296.0);
                var low = value & 0xffffffff;
                if (this._isLE) {
                    this._view.setUint32(this._position, low, this._isLE);
                    this.skip(4);
                    this._view.setUint32(this._position, high, this._isLE);
                    this.skip(4);
                }
                else {
                    this._view.setUint32(this._position, high, this._isLE);
                    this.skip(4);
                    this._view.setUint32(this._position, low, this._isLE);
                    this.skip(4);
                }
            }
            return this;
        };
        BufferWriter.prototype.float = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setFloat32(this._position, arguments[i], this._isLE);
                this.skip(4);
            }
            return this;
        };
        BufferWriter.prototype.double = function () {
            for (var i = 0; i < arguments.length; ++i) {
                this._view.setFloat64(this._position, arguments[i], this._isLE);
                this.skip(8);
            }
            return this;
        };
        BufferWriter.prototype.char = function () {
            for (var i = 0; i < arguments.length; ++i) {
                var value = arguments[i];
                for (var j = 0; j < value.length; ++j) {
                    this.byte(value.charCodeAt(j));
                }
            }
            return this;
        };
        BufferWriter.prototype.write = function () {
            var func = arguments[0];
            arguments[0] = this;
            func.apply(func, arguments);
            return this;
        };
        return BufferWriter;
    }(k7.KBuffer));
    k7.BufferWriter = BufferWriter;
})(k7 || (k7 = {}));

(function (k7) {
    var EaseName;
    (function (EaseName) {
        EaseName.CircIn = 'circIn';
        EaseName.CircOut = 'circOut';
        EaseName.CircInOut = 'circInOut';
        EaseName.BackIn = 'backIn';
        EaseName.BackOut = 'backOut';
        EaseName.BackInOut = 'backInOut';
        EaseName.QuadIn = 'quadIn';
        EaseName.QuadOut = 'quadOut';
        EaseName.QuadInOut = 'quadInOut';
        EaseName.LINEAR = 'linear';
        //other add todo
    })(EaseName = k7.EaseName || (k7.EaseName = {}));
})(k7 || (k7 = {}));

(function (k7) {
})(k7 || (k7 = {}));

(function (k7) {
    var Query;
    (function (Query) {
        function parse(text) {
            var start = text.indexOf('?');
            if (start >= 0 && start < text.length - 1) {
                var qstr = text.substr(start + 1);
                var qarr = qstr.split('&');
                var obj = {};
                for (var i = 0; i < qarr.length; ++i) {
                    var p = qarr[i].split('=');
                    if (p.length == 1 && qarr.length == 1) {
                        return p;
                    }
                    obj[p[0]] = p[1];
                }
                return obj;
            }
            else
                return null;
        }
        Query.parse = parse;
        function stringify(value) {
            if (value) {
                if (typeof value == 'string') {
                    return '?' + value;
                }
                var query = '?';
                for (var k in value) {
                    if (query.length > 1)
                        query += '&';
                    if (value[k] === undefined) {
                        query += k;
                    }
                    else {
                        query += k + '=' + value[k];
                    }
                }
                return query;
            }
            else
                return null;
        }
        Query.stringify = stringify;
    })(Query = k7.Query || (k7.Query = {}));
})(k7 || (k7 = {}));
window.mvc = {};
/**
 * 事件抛出器
 */

(function (mvc) {
    var eventDispatcher;
    /**
     * 初始化 mvc功能，需要使用标准接口，实现事件收发器（具体参考各大引擎）
     * @param evtInst
     */
    function init(evtInst) {
        if (!eventDispatcher)
            eventDispatcher = evtInst;
    }
    mvc.init = init;
    var Mediator = /** @class */ (function () {
        function Mediator(name, view) {
            this.mediatorName = name;
            this.viewComponent = view;
            this.eventList = [];
        }
        Mediator.prototype.onRegister = function () { };
        Mediator.prototype.onEvent = function (eventName, params) { };
        Mediator.prototype.onRemove = function () { };
        return Mediator;
    }());
    mvc.Mediator = Mediator;
    /**
     * 发布一个事件，会同时响应：所有mvc.on监听的事件、新的ICommand实例、IMediator的onEvent函数。
     * 3个响应方式级别相同，先后顺序由注册顺序决定
     * 自定义的函数响应，使用on注册，使用off关闭，使用once监听一次自动关闭
     * Mediator使用registerMediator注册，使用removeMediator关闭
     * Command使用registerCommand注册，使用removeCommand关闭
     * @param eventName 事件名
     * @param params 事件参数
     */
    function send(eventName, params) {
        if (params === void 0) { params = null; }
        if (undefined === params) {
            eventDispatcher.event(eventName);
        }
        else {
            eventDispatcher.event(eventName, params);
        }
    }
    mvc.send = send;
    function on(eventName, thisObj, callback) {
        eventDispatcher.on(eventName, thisObj, callback);
    }
    mvc.on = on;
    function off(eventName, thisObj, callback) {
        eventDispatcher && eventDispatcher.off(eventName, thisObj, callback);
    }
    mvc.off = off;
    function once(eventName, thisObj, callback) {
        function onceListener() {
            callback.apply(thisObj, arguments);
            eventDispatcher.off(eventName, thisObj, onceListener);
        }
        eventDispatcher.on(eventName, thisObj, onceListener);
    }
    mvc.once = once;
    var commandMap = {}; //boolean map
    function registerCommand(eventName, commandClassRef) {
        commandMap[eventName] = true;
        eventDispatcher.on(eventName, null, executeCommand, [eventName, commandClassRef]);
    }
    mvc.registerCommand = registerCommand;
    function removeCommand(eventName) {
        if (commandMap[eventName]) {
            commandMap[eventName] = false;
            eventDispatcher.off(eventName, null, executeCommand);
        }
    }
    mvc.removeCommand = removeCommand;
    function hasCommand(eventName) {
        return commandMap[eventName];
    }
    mvc.hasCommand = hasCommand;
    function executeCommand(eventName, CommandClassRef, params) {
        new CommandClassRef().execute(eventName, params);
    }
    var mediatorMap = {};
    var inMediatorMap = {}; //boolean map
    function registerMediator(mediator) {
        var name = mediator.mediatorName;
        if (mediatorMap[name])
            return;
        mediatorMap[name] = mediator;
        var interests = mediator.eventList;
        var len = interests.length;
        for (var i = 0; i < len; i++) {
            var inter = interests[i];
            if (typeof inter === 'string') {
                inMediatorMap[inter] = true;
                eventDispatcher.on(inter, mediator, mediator.onEvent, [inter]);
            }
            else {
                var _a = inter, name_1 = _a.name, handler = _a.handler;
                if (typeof handler == 'function') {
                    inMediatorMap[name_1] = true;
                    eventDispatcher.on(name_1, mediator, handler);
                }
                else {
                    for (var j = 0; j < handler.length; j++) {
                        inMediatorMap[name_1] = true;
                        eventDispatcher.on(name_1, mediator, handler[j]);
                    }
                }
            }
        }
        mediator.onRegister();
    }
    mvc.registerMediator = registerMediator;
    function removeMediator(mediatorName) {
        var mediator = mediatorMap[mediatorName];
        if (!mediator)
            return null;
        var interests = mediator.eventList;
        var i = interests.length;
        while (--i > -1) {
            var inter = interests[i];
            if (typeof inter == 'string') {
                inMediatorMap[inter] = false;
                eventDispatcher.off(inter, mediator, mediator.onEvent);
            }
            else {
                var _a = inter, name_2 = _a.name, handler = _a.handler;
                if (typeof handler == 'function') {
                    inMediatorMap[name_2] = false;
                    eventDispatcher.off(name_2, mediator, handler);
                }
                else {
                    for (var j = 0; j < handler.length; j++) {
                        inMediatorMap[name_2] = false;
                        eventDispatcher.off(name_2, mediator, handler[j]);
                    }
                }
            }
        }
        delete mediatorMap[mediatorName];
        mediator.onRemove();
        return mediator;
    }
    mvc.removeMediator = removeMediator;
    function retrieveMediator(mediatorName) {
        return mediatorMap[mediatorName] || null;
    }
    mvc.retrieveMediator = retrieveMediator;
    function hasMediator(mediatorName) {
        return mediatorMap[mediatorName] != null;
    }
    mvc.hasMediator = hasMediator;
    function hasInMediator(eventName) {
        return inMediatorMap[eventName];
    }
    mvc.hasInMediator = hasInMediator;
})(mvc || (mvc = {}));

(function (k7) {
    var CocosAdapter = /** @class */ (function () {
        function CocosAdapter() {
        }
        CocosAdapter.prototype.onClick = function (engineDisplayObject, thisObj, callback) {
            engineDisplayObject.onClick(callback, thisObj);
        };
        CocosAdapter.prototype.tweenTo = function (target, prop, time, ease, thisObj, callback, delay) {
            if (ease === void 0) { ease = k7.EaseName.QuadOut; }
            var tw = new cc.Tween().target(target);
            if (delay)
                tw.delay(delay / 1000);
            tw.to(time / 1000, prop, { progress: null, easing: ease });
            if (callback)
                tw.call(callback.bind(thisObj));
            tw.start();
        };
        CocosAdapter.prototype.saveLocal = function (key, value) {
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }
            cc.sys.localStorage.setItem(key, value);
        };
        CocosAdapter.prototype.readLocal = function (key, toJson) {
            var value = cc.sys.localStorage.getItem(key);
            return toJson && value ? JSON.parse(value) : value;
        };
        CocosAdapter.prototype.httpRequest = function (url, thisObj, callback) {
            var p = typeof url === 'string' ? { url: url } : url;
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    callback && callback.call(thisObj, xhr.response, xhr);
                }
                else {
                    callback && callback.call(thisObj, null, xhr);
                }
            };
            xhr.open(p.method, p.url);
            if (p.headers)
                for (var i = 0; i < p.headers.length; i++) {
                    xhr.setRequestHeader(p.headers[i++], p.headers[i]);
                }
            if (typeof p.data == 'string')
                xhr.send(p.data);
            else if (p.data) {
                var key = "Content-Type";
                var value = "application/json";
                p.headers && p.headers.push(key, value);
                xhr.setRequestHeader(key, value);
                xhr.send(JSON.stringify(p.data));
            }
            else
                xhr.send();
        };
        return CocosAdapter;
    }());
    k7.CocosAdapter = CocosAdapter;
    k7.Engine = new CocosAdapter();
    var CocosEventDispatcher = /** @class */ (function () {
        function CocosEventDispatcher() {
            this.eventTarget = new cc.EventTarget();
            this.eventMap = [];
        }
        CocosEventDispatcher.prototype.searchEvent = function (type, thisObj, callback) {
            for (var i = 0; i < this.eventMap.length; ++i) {
                var evt = this.eventMap[i];
                if (evt.type === type && evt.thisObj === thisObj && evt.callback === callback) {
                    return true;
                }
            }
            return false;
        };
        CocosEventDispatcher.prototype.on = function (type, thisObj, callback, params) {
            if (!this.searchEvent(type, thisObj, callback)) {
                var evt = {
                    type: type, thisObj: thisObj, callback: callback, params: params, _listen: function () {
                        var data = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            data[_i] = arguments[_i];
                        }
                        var i = data.length;
                        while (--i > -1)
                            if (data[i] === undefined)
                                data.pop();
                        if (params)
                            data.unshift.apply(data, params);
                        callback && callback.apply(thisObj, data);
                    }
                };
                this.eventMap.push(evt);
                this.eventTarget.on(type, evt._listen, thisObj);
            }
        };
        CocosEventDispatcher.prototype.off = function (type, thisObj, callback) {
            for (var i = 0; i < this.eventMap.length; ++i) {
                var evt = this.eventMap[i];
                if (evt.type === type && evt.thisObj === thisObj && evt.callback === callback) {
                    this.eventMap.splice(i, 1);
                    this.eventTarget.off(type, evt._listen, thisObj);
                    return;
                }
            }
        };
        CocosEventDispatcher.prototype.event = function (type, data) {
            this.eventTarget.emit(type, data);
        };
        return CocosEventDispatcher;
    }());
    k7.CocosEventDispatcher = CocosEventDispatcher;
    mvc.init(new CocosEventDispatcher());
})(k7 || (k7 = {}));






















window['GObject'] = fgui.GObject;
window['GComponent'] = fgui.GComponent;
window['GButton'] = fgui.GButton;
window['GLabel'] = fgui.GLabel;
window['GProgressBar'] = fgui.GProgressBar;
window['GTextField'] = fgui.GTextField;
window['GRichTextField'] = fgui.GRichTextField;
window['GTextInput'] = fgui.GTextInput;
window['GLoader'] = fgui.GLoader;
window['GList'] = fgui.GList;
window['GGraph'] = fgui.GGraph;
window['GGroup'] = fgui.GGroup;
window['GSlider'] = fgui.GSlider;
window['GComboBox'] = fgui.GComboBox;
window['GImage'] = fgui.GImage;
window['GMovieClip'] = fgui.GMovieClip;
window['GController'] = fgui.Controller;
window['GTransition'] = fgui.Transition;
window['GWindow'] = fgui.Window;
window['GRoot'] = fgui.GRoot;
window['FUIPackage'] = fgui.UIPackage;
window['FEvent'] = fgui.Event;

(function (k7) {
    var CocosFairyAdapter = /** @class */ (function () {
        function CocosFairyAdapter() {
        }
        CocosFairyAdapter.prototype.loadPack = function () {
            console.warn("方法已被废弃");
        }
        CocosFairyAdapter.prototype.playTransition = function (comp, id, thisObj, callback) {
            //TODO
            if (!id || !comp || typeof comp.getTransition != 'function')
                return false;
            var tr = comp.getTransition(id);
            if (!tr || typeof tr.play != 'function')
                return false;
            tr.play(function () { callback.apply(thisObj); });
            return true;
        };
        CocosFairyAdapter.prototype.onStageEvent = function (displayObject, thisObj, listener) {
            //TODO
        };
        return CocosFairyAdapter;
    }());
    k7.CocosFairyAdapter = CocosFairyAdapter;
    k7.Fairy = new CocosFairyAdapter();
})(k7 || (k7 = {}));
