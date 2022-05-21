/**工具类 */
export class Util {

	static getRandom(max, min = 0) {
		let maxNum = max;
		let minNum = min;
		if (min > max) {
			maxNum = min;
			minNum = max;
		}
		return parseInt(Math.random() * maxNum - minNum + '');
	}

	/**获取当前时间戳 */
	static getDate(): number {
		let date = new Date();
		return date.getTime();
	}

	/**
 * 格式化日期
 * @param {Date} date
 * @param {String} format "yyyy-mm-dd hh:ii:ss.S"
 */
	static formatDate(date, format): any {
		var o = {
			"m+": date.getMonth() + 1, //月份   
			"d+": date.getDate(), //日   
			"h+": date.getHours(), //小时   
			"i+": date.getMinutes(), //分   
			"s+": date.getSeconds(), //秒   
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度   
			"S": date.getMilliseconds() //毫秒   
		};
		if (/(y+)/.test(format))
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(format))
				format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return format;
	}
	// 格式化日期
	static formatDate2(timestamp) {
		var date = new Date(timestamp * 1000);
		var createTimeStr = this.formatDate(date, 'mm/dd hh:ii');
		return createTimeStr;
	}

	/**格式化日期 xx天xx时xx分xx秒 */
	static formatDate1(timestamp) {
		var expireTime = timestamp;
		var expireDay = 0;
		var str = '';
		if (expireTime <= 0) {
			// 已经过期
		} else if (expireTime > 0 && expireTime <= 60) {
			// 秒
			str = Math.floor(expireTime / 60) + '秒' + str;
		} else if (expireTime > 60 && expireTime <= 60 * 60) {
			// 分
			str = Math.floor(expireTime / (60 * 60)) + '分' + str;
		} else if (expireTime > 60 * 60 && expireTime <= 60 * 60 * 24) {
			// 时 
			str = Math.floor(expireTime / (60 * 60 * 24)) + '时' + str;
		} else if (expireTime > 60 * 60 * 24) {
			// 天   
			str = Math.floor(expireTime / (60 * 60 * 24)) + '天' + str;
		}
		return str;
	}
	/**
	 * 将整数秒转换为00:00:00格式的格式字符串
	 * @param sec 秒数（整数秒）
	 * @param showHour 是否显示“小时”位，x:x:x/x:x
	 * @param pad 小于10时是否使用数字0补位
	 * @returns 
	 */
	public static getTimeStr(sec: number, showHour: boolean, pad: boolean): string {
		if (sec == null || isNaN(sec) || sec < 0) {
			sec = 0;
		}
		sec = Math.floor(sec);
		const snds: number = sec % 60;
		const tm: number = Math.floor(sec / 60);
		const minutes = tm % 60;
		const hour: number = Math.floor(tm / 60);
		const arr = showHour ? [hour, minutes, snds] : [minutes, snds];
		if (pad) {
			arr.forEach((v, idx) => {
				if (v < 10) {
					arr[idx] = Util.padLeft(v, 2, "0");
				}
			})
		}
		const str = arr.join(':');
		return str;
	}
	/**
	 * 用千分符格式化数字
	 * @param {Number} value 数字
	 */
	static formatNumberWithTS(value) {
		if (value == null) return value;
		if (value.length <= 3) {
			return value;
		}
		if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(value)) {
			return value;
		}
		var a = RegExp.$1,
			b = RegExp.$2,
			c = RegExp.$3;
		var re = new RegExp("(\\d)(\\d{3})(,|$)");
		// re.compile("(\\d)(\\d{3})(,|$)");
		while (re.test(b)) {
			b = b.replace(re, "$1,$2$3");
		}
		return a + "" + b + "" + c;
	}
	/**
	 * 在变量的左侧填充字符到一定长度
	 * @param {Number} value 目标值
	 * @param {Number} n 目标长度
	 * @param {String} c 填充字符
	 */
	static padLeft(value, n, c) {
		value += '';
		if (n == null || value.length >= n) return value;
		if (c == null) c = ' ';
		return (Array(n).join(c) + value).slice(-n);
	}
	/**
	 * 在变量的右侧填充字符到一定长度
	 * @param {Number} value 目标值
	 * @param {Number} n 目标长度
	 * @param {String} c 填充字符
	 */
	static padRight(value, n, c) {
		value += '';
		if (n == null || value.length >= n) return value;
		if (c == null) c = ' ';
		return (value + Array(n).join(c)).substr(0, n);
	}

	/**
	 * 指定日期是否今天
	 * @param time 日期
	 */
	public static today(time: string | number): boolean {
		let ts = 0;
		if (typeof time == "string") {
			ts = this.dateToTimestamp(time);
		} else ts = time;
		const time0 = this.getToday0Timestamp(this.getTime());
		return this.compareDate(ts, time0);
	}

	/**
	 * 获得今天0点时间戳 ms
	 * @return {[number]} [ms]
	 */
	static getToday0Timestamp(time?: number) {
		var date = new Date(time);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		var timestamp = date.getTime();
		return timestamp
	}

	/**获取当前时间戳 */
	static getTime(): number {
		return Date.now();
	}

	static dateToTimestamp(dateStr: string) {
		var date = new Date(dateStr);
		return date.getTime();
	}

	static todayTimeToTimestamp(time: string) {
		const today0Time = Util.getToday0Timestamp(Date.now());
		const date = new Date(today0Time);

		const hhmmArr = time.split(':');
		const hours = Number(hhmmArr[0]);
		const minutes = Number(hhmmArr[1]);
		date.setHours(hours);
		date.setMinutes(minutes);
		return date.getTime();
	}

	/**比较两个时间是否是同一天
	 * [s]非[ms]
	*/
	static compareDate(time1: number, time2: number) {
		// let date1 = new Date(time1);
		// let date2 = new Date(time2);
		return this.getToday0Timestamp(time1 * 1000) == this.getToday0Timestamp(time2 * 1000);
	}

	/**格式化参数格式化成url参数 */
	static toUrlParams(data) {
		let str: string = '';
		for (var p in data) {
			// if(!data[p]) {
			// 	return null
			// }
			str += "&" + p + "=" + encodeURIComponent(data[p]);
		}
		return str.substring(1, str.length)
	}

	/**格式化字符串中所有的% */
	static formatStr(str: string, ...args): string {
		if (typeof str !== 'string') return;
		let arr = str.split('') || [];
		let strIdx: number = 0;
		while (args.length > 0) {
			let arg = args.shift();
			if (arg != undefined) {
				for (let i = strIdx, j = 0; i < arr.length; i++) {
					let char = arr[i];
					if (char == '%') {
						arr[i] = arg[j];
						strIdx = i;
						j++;
					}
				}
			}
		}
		return arr.join('');
	}

	/**深度拷贝对象 */
	static deepCopy(obj) {
		var result = Array.isArray(obj) ? [] : {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object' && obj[key] !== null) {
					result[key] = this.deepCopy(obj[key]);   //递归复制
				} else {
					result[key] = obj[key];
				}
			}
		}
		return result;
	}
	/**获取游戏入口url参数数据 */
	static getQueryData(): any {
		let data = {};
		if (!window.location ||
			!window.location.search ||
			!window.location.search.substr) {
			return data;
		}

		let params = window.location.search.substr(1);
		if (!params) {
			return data;
		}
		let arr = params.split('&');
		for (let i = 0; i < arr.length; ++i) {
			let p = arr[i].split('=');
			data[p[0]] = p[1];
		}
		return data;
	}
	/**获取开发者账号信息 */
	static getDevAccountInfo(): any {
		// let data = Util.getQueryData();
		// if (!data.dev) {
		// 	if (data.un && data.ps) {
		// 		return {
		// 			loginType: gCore.def.gDef.LOGIN_T_USER_NAME,
		// 			account: data.un || "",
		// 			md5Password: gCore.def.md5.hex_md5(data.ps || "")
		// 		}
		// 	} else {
		// 		console.error("@请附加开发者账号信息：/?dev=xxx或者?un=xxx&ps=xxx");
		// 		console.error("@当前使用默认账号登录：tammon1");
		// 		// return ;
		// 		data.dev = "default";
		// 	}
		// }
		// let config = DevAccount[data.dev];
		// if (!config) {
		// 	console.error("@开发者账号：%s的配置信息未填写。参考DevAccount.ts", data.dev);
		// 	return {};
		// }
		// return config;
	}


	/*
	* 打印 JavaScript 函数调用堆栈
	*/
	static Trace(str = "", count = 20) {
		var i = 0;
		var fun = arguments.callee;

		console.log(str);
		do {
			fun = fun.arguments.callee.caller;
			console.log(++i + ': ' + fun);

			if (i >= count)
				break;
		} while (fun);
	}

	static checkTodayIsFirstLogin() {
		// let lastLoginTime = k7.Engine.readLocal(STGKEY.LastLoginTime, true);
		// let nowTime = Date.now();
		// let today0Time = Util.getToday0Timestamp(nowTime);
		// let isTodayFirstLogin = false;
		// if (lastLoginTime == null || lastLoginTime < today0Time) {
		// 	isTodayFirstLogin = true;
		// }
		// k7.Engine.saveLocal(STGKEY.LastLoginTime, nowTime);
		// k7.Engine.saveLocal(STGKEY.IsFirstLoginToday, isTodayFirstLogin);
	}

	/**解析时间 */
	public static parseDate(time: any) {
		if (cc.sys.os == cc.sys.OS_IOS) {
			var reg = /-/g;
			time = time && time.replace(reg, '/')
		}
		time = Date.parse(time);
		return time;
	}

	/** 计算两个时间戳的间隔 天数*/
	public static getTimeBetweenDay(time1: any, time2: any) {
		let data1 = this.getToday0Timestamp(time1);
		let data2 = this.getToday0Timestamp(time2);
		return Math.floor((data1 - data2) / (24 * 3600 * 1000));
	}

	/**解析时间 */
	public static parseDate2(time: any) {
		if (cc.sys.os == cc.sys.OS_IOS) {
			var reg = /-/g;
			time = time && time.replace(reg, '/')
		}
		return time;
	}
}