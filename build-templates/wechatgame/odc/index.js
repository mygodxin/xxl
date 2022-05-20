const SubValidValue = {
	//子域接收消息名
	FetchFriendInterested: "FetchFriendInterested", 	//获取感兴趣的好友
	ShareToFriend: "ShareToFriend",                      //好友定向分享
}

let ResUrl = "subProject/rank1/"
const TEX_ITEM_BG = "itemBg.png";
const TEX_SELF_BG = "selfBg.png";
const TEX_MASK = "mask.png";
const TEX_BG = "bg.png";
const TEX_RANK_FIRST = "first.png";
const TEX_RANK_SECOND = "second.png";
const TEX_RANK_THIRD = "third.png";
const TEX_RANKING_BG = "rankingBg.png";

const AVATAR_WIDTH = 40;					//用户头像宽度
const AVATAR_HEIGHT = 40;					//用户头像高度
const MASK_WIDTH = 68;						//用户头像遮罩宽度
const MASK_HEIGHT = 68;						//用户头像遮罩高度
const MEDAL_WIDTH = 30;						//奖牌宽度
const MEDAL_HEIGHT = 30;					//奖牌高度
const ADJOIN_AVATAR_WIDTH = 80;				//相邻好友排行榜用户头像宽度
const ADJOIN_AVATAR_HEIGHT = 80;			//相邻好友排行榜用户头像高度
const ADJOIN_MASK_WIDTH = 88;				//相邻好友排行榜用户头像遮罩宽度
const ADJOIN_MASK_HEIGHT = 88;				//相邻好友排行榜用户头像遮罩高度

const TOP_BORDER = 15;						//顶间距
const LEFT_BORDER = 30;						//左间距
const ITEM_GAP = 8;							//排行榜项间距
const ADJOIN_LEFT_BORDER = 5;				//相邻好友排行榜左间距
const ADJOIN_TOP_BORDER = 15;				//相邻好友排行榜顶间距
const ADJOIN_ITEM_GAP = 40;					//相邻好友排行榜项间距
const RANKING_PADDING_LEFT = 30;			//用户排名左内边距（基于排行榜项）
const RANKING_PADDING_TOP = 30;				//用户排名上内边距（基于排行榜项）
const NICKNAME_PADDING_LEFT = 60			//用户昵称左内边距（基于排行榜项）
const NICKNAME_PADDING_TOP = 20;			//用户昵称上内边距（基于排行榜项）
const SCORE_PADDING_LEFT = 530;				//用户分数左内边距（基于排行榜项）
const SCORE_PADDING_TOP = 35;				//用户分数上内边距（基于排行榜项）
const AVATAR_PADDING_LEFT = 10;			//用户头像左内边距（基于排行榜项）
const AVATAR_PADDING_TOP = 0;				//用户头像上内边距（基于排行榜项）
const ADJOIN_NICKNAME_MARGIN_TOP = 35;		//相邻好友排行榜用户昵称上外边距（基于相邻好友排行榜项）

const ADJOIN_SELF_POS = 3;					//相邻好友排行榜自己所处的位置，有效值 0，1，2，3，4				

let ITEM_WIDTH = 500;						//排行榜单个用户宽
let ITEM_HEIGHT = 40;						//排行榜单个用户高

let PAGE_SIZE = 7;
let Max_Page = 0;

const dataSorter = (gameDatas) => {
	let data = []
	for (let i = 0; i < gameDatas.length; i++) {
		if (gameDatas[i].KVDataList[0]) {
			data.push(gameDatas[i])
		}
	}

	let newData = data.sort((a, b) => {
		let va = a.KVDataList[0] ? a.KVDataList[0].value - 0 : 0
		let vb = b.KVDataList[0] ? b.KVDataList[0].value - 0 : 0
		return vb - va;

	});

	let offset = 0;
	if (data.length % PAGE_SIZE === 0) {
		offset = 1;
	}

	Max_Page = Math.ceil(data.length / PAGE_SIZE) - 1 + offset;
	console.log(Max_Page, "Max_Page");
	return newData;
}

class RankListRenderer {
	constructor() {
		this.clearFlag = false
		this.offsetY = 0;
		this.maxOffsetY = 0;
		this.gameDatas = [];
		this.curPageIndex = 0; 			//当前页码
		this.drawIconCount = 0;
		this.rankCanvasList = [];

		this.selfUserInfo = null
		this.selfOpenId = null;			//自己的openid

		this.nearCanvas = null;
		this.nearRankData = [];			//相邻数据

		this.overStepCanvas = null;
		this.curScore = 10;				//当前关卡
		this.nextFriend = null;			//即将超越数据

		this.overstepScore = 0;			//即将超越分数
		this.gameScore = 0;				//本局分数

		this.init();
	}

	init() {
		this.sharedCanvas = wx.getSharedCanvas();
		this.sharedCtx = this.sharedCanvas.getContext('2d');

		this.fetchSelfInfo();
	}


	listen() {
		wx.onMessage(msg => {
			console.log('msg', msg);
			switch (msg.action) {
				case SubValidValue.FetchFriendInterested:
					this.clearFlag = true;
					this.initRank(msg.setting);
					this.fetchFriendInterested();
					break;
				case SubValidValue.ShareToFriend:
					this.clearFlag = true;
					this.shareToFriend(msg.setting);
					break;
				case SubValidValue.FetchOverStep:
					this.clearFlag = true;
					this.initRank(msg.setting);
					this.showOverStep();
					break;
				case SubValidValue.NextPage:
					if (this.curPageIndex < Max_Page && this.curPageIndex >= 0) {
						this.curPageIndex++;
						this.drawToCanvas();
					} else {
						return;
					}
					break;
				case SubValidValue.LastPage:
					if (this.curPageIndex > 0) {
						this.curPageIndex--
						this.drawToCanvas();
					} else {
						return;
					}
					break;
				case SubValidValue.UpdateScore:
					this.compareGameScore(msg.setting);
					break;
				default:
					console.log(`未知消息类型:msg.action=${msg.action}`);
					break;
			}
		});
	}

	initRank(setting) {
		if (!setting) return;
		setting.itemWidth && (ITEM_WIDTH = setting.itemWidth);
		setting.itemHeigth && (ITEM_HEIGHT = setting.itemHeigth);
	}


	//取出感兴趣的好友
	fetchFriendInterested() {
		wx.getPotentialFriendList({

			success: res => {
				console.log("wx.getPotentialFriendList success", res);
				//this.gameDatas = dataSorter(res.data, this.curDataType);
				this.gameDatas = res.list;
				let dataLen = this.gameDatas.length;
				this.offsetY = 0;
				this.maxOffsetY = dataLen * ITEM_HEIGHT;
				if (dataLen) {
					this.drawToCanvas();
				}
			},
			fail: res => {
				console.log("wx.getPotentialFriendList fail", res);
			},
		});
	}

	shareToFriend(setting) {
		if (this.gameDatas[setting.index]) {
			let openId = this.gameDatas[setting.index].openid
			wx.shareMessageToFriend({
				openId: openId,
				title: setting.title,
				imageUrl: setting.imageUrl

			})
		}

	}

	/** 比较游戏分数和待超越分数 */
	compareGameScore(setting) {
		if (setting.curScore >= this.overstepScore && setting.curScore !== 0) {
			this.clearFlag = true;
			this.initRank(setting);
			this.showOverStep();
		} else {
			return;
		}
	}

	//找出自己排名
	fetchSelfInfo() {
		wx.getUserInfo({
			openIdList: ["selfOpenId"],
			success: res => {
				console.log("fetchSelfCloudData success res=>", res)
				this.selfUserInfo = res.data[0]
			}
		})
	}

	//取出所有好友数据
	fetchFriendRankData() {
		wx.getFriendCloudStorage({
			keyList: [
				this.curDataType,
			],
			success: res => {
				console.log("wx.getFriendCloudStorage success", res);
				this.gameDatas = dataSorter(res.data, this.curDataType);

				let dataLen = this.gameDatas.length;
				this.offsetY = 0;
				this.maxOffsetY = dataLen * ITEM_HEIGHT;
				if (dataLen) {
					this.drawToCanvas();
				}
			},
			fail: res => {
				console.log("wx.getFriendCloudStorage fail", res);
			},
		});
	}

	//画布渲染
	drawToCanvas() {
		let sharedWidth = this.sharedCanvas.width;
		let sharedHeight = this.sharedCanvas.height;
		this.sharedCtx.clearRect(0, 0, sharedWidth, sharedHeight);
		if (this.clearFlag) {
			this.clearFlag = false
			this.rankCanvasList = [];
		}

		let rankCanvas = this.getCanvasByPageIndex();
		this.sharedCtx.drawImage(rankCanvas, 0, 0, sharedWidth, sharedHeight, 0, 0, sharedWidth, sharedHeight);
	}

	//获取指定页码的canvas
	getCanvasByPageIndex() {
		let canvas = this.rankCanvasList[this.curPageIndex];
		if (!canvas) {
			canvas = wx.createCanvas();
			canvas.width = this.sharedCanvas.width;
			canvas.height = this.sharedCanvas.height;
			this.rankCanvasList[this.curPageIndex] = canvas;
			let ctx = canvas.getContext('2d');
			this.drawPageRanks(ctx);
		}
		return canvas;
	}

	//绘制单页排行榜
	drawPageRanks(ctx) {
		for (let i = 0; i < this.gameDatas.length; i++) {
			let data = this.gameDatas[i];
			this.drawRankItem(ctx, data, ITEM_HEIGHT * i + i * ITEM_GAP);
		}
	}

	drawLastPage(ctx, itemGapY) {
		DrawUtil.drawText(ctx, {
			content: "到底啦",
			x: this.sharedCanvas.width / 2,
			y: 60 + itemGapY,
			align: "center",
			color: "#777063",
			fontSize: 25,
		});
	}

	//绘制排行榜项
	drawRankItem(ctx, data, itemGapY) {


		let nick = data.nickname.length <= 5 ? data.nickname : data.nickname.substr(0, 4) + "...";
		itemGapY += TOP_BORDER;

		DrawUtil.drawText(ctx, {
			content: nick + "",
			x: NICKNAME_PADDING_LEFT,
			y: NICKNAME_PADDING_TOP + itemGapY,
			align: "left",
			baseLine: "top",
			color: "#000000",
			fontSize: 18,
		});


		//头像
		DrawUtil.drawImage(ctx, {
			url: data.avatarUrl,
			x: AVATAR_PADDING_LEFT,
			y: AVATAR_PADDING_TOP + itemGapY,
			w: AVATAR_WIDTH,
			h: AVATAR_HEIGHT
		}, () => {
			this.drawToCanvas();
		});
	}

	//根据排名获取资源
	getResUrlByRanking(rank) {
		let url = null;
		if (rank == 1) {
			url = ResUrl + TEX_RANK_FIRST;
		} else if (rank == 2) {
			url = ResUrl + TEX_RANK_SECOND;
		} else if (rank == 3) {
			url = ResUrl + TEX_RANK_THIRD;
		}
		return url;
	}

	/**
	 * @description 绘制相邻排行榜
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	fetchAdjoinFriend() {
		wx.getFriendCloudStorage({
			keyList: [
				this.curDataType,
			],
			success: res => {
				console.log("wx.getFriendCloudStorage success", res);
				this.gameDatas = dataSorter(res.data, this.curDataType);
				let dataLen = this.gameDatas.length;
				this.offsetY = 0;
				this.maxOffsetY = dataLen * ITEM_HEIGHT;
				if (dataLen) {
					this.getAdjoinFriend(this.gameDatas);
				}
			},
			fail: res => {
				console.log("wx.getFriendCloudStorage fail", res);
			},
		});
	}

	//获取相邻玩家
	getAdjoinFriend(arr) {
		this.nearRankData = [];
		let index = 0;
		if (this.selfUserInfo) {
			for (let i = 0; i < arr.length; ++i) {
				if (arr[i].nickname == this.selfUserInfo.nickName) {
					index = i;
				}
			}

			for (let i = index - ADJOIN_SELF_POS; i < index + 5; ++i) {
				let len = this.nearRankData.length < 5 ? true : false;
				if (i >= 0 && arr[i] && len) {
					arr[i].rankIndex = (i + 1);
					this.nearRankData.push(arr[i]);
				}
			}
		} else {
			this.nearRankData = arr;
		}
		this.drawToAdjoinCanvas();
	};

	//显示自己附近排名
	drawToAdjoinCanvas() {
		let sharedWidth = this.sharedCanvas.width;
		let sharedHeight = this.sharedCanvas.height;

		if (this.clearFlag) {
			this.clearFlag = false
			this.nearCanvas = null;
		}

		if (!this.nearCanvas) {
			this.nearCanvas = wx.createCanvas();
			this.nearCanvas.width = this.sharedCanvas.width;
			this.nearCanvas.height = this.sharedCanvas.height;
			let ctx = this.nearCanvas.getContext('2d');
			this.drawAdjoinRank(ctx);
		}

		this.sharedCtx.drawImage(this.nearCanvas, 0, 0, sharedWidth, sharedHeight, 0, 0, sharedWidth, sharedHeight);
	}

	//绘制排行榜
	drawAdjoinRank(ctx) {
		for (let i = 0; i < this.nearRankData.length; ++i) {
			let data = this.nearRankData[i];
			this.drawAdjoinRankItem(ctx, data, i);
		}
	};

	//绘制单人排行
	drawAdjoinRankItem(ctx, data, index) {
		let nick = data.nickname.length <= 5 ? data.nickname : data.nickname.substr(0, 4) + "...";
		let rank = data.rankIndex;

		let itemX = ADJOIN_AVATAR_WIDTH * index + ADJOIN_ITEM_GAP * index + ADJOIN_LEFT_BORDER;
		//头像
		DrawUtil.drawImage(ctx, {
			url: data.avatarUrl,
			x: itemX,
			y: ADJOIN_TOP_BORDER,
			w: ADJOIN_AVATAR_WIDTH,
			h: ADJOIN_AVATAR_HEIGHT
		}, () => {
			this.showAdjoinMask(ctx, rank, itemX);
		});

		let nameColor = "#FFFFFF";
		if (this.checkSelf(data)) nameColor = "#13E41D";
		DrawUtil.drawText(ctx, {
			content: nick + "",
			x: itemX + ADJOIN_AVATAR_WIDTH / 2,
			y: ADJOIN_TOP_BORDER + ADJOIN_AVATAR_HEIGHT + ADJOIN_NICKNAME_MARGIN_TOP,
			align: "center",
			color: nameColor,
			fontSize: 20,
		});
	};

	showAdjoinMask(ctx, rank, itemX) {
		DrawUtil.drawImage(ctx, {
			url: ResUrl + TEX_MASK,
			x: itemX - (ADJOIN_MASK_WIDTH - ADJOIN_AVATAR_WIDTH) / 2,
			y: ADJOIN_TOP_BORDER - (ADJOIN_MASK_HEIGHT - ADJOIN_AVATAR_HEIGHT) / 2,
			w: ADJOIN_MASK_WIDTH,
			h: ADJOIN_MASK_HEIGHT
		}, () => {
			this.showAdjoinRankIndex(ctx, rank, itemX)
		});
	}

	//绘制个人排名
	showAdjoinRankIndex(ctx, rank, itemX) {
		let url = this.getResUrlByRanking(rank);
		if (!url) {
			url = ResUrl + TEX_RANKING_BG;
		}

		DrawUtil.drawImage(ctx, {
			url: url,
			x: itemX + ADJOIN_AVATAR_WIDTH - MEDAL_WIDTH / 2,
			y: -MEDAL_HEIGHT / 2 + ADJOIN_TOP_BORDER,
			w: MEDAL_WIDTH,
			h: MEDAL_HEIGHT
		}, () => {
			if (rank > 3) {
				DrawUtil.drawText(ctx, {
					content: rank + "",
					x: itemX + ADJOIN_AVATAR_WIDTH,
					y: ADJOIN_TOP_BORDER,
					align: "center",
					color: "#ffffff",
					fontSize: 25,
				});
			}
			this.drawToAdjoinCanvas();
		});
	}

	//即将超越
	showOverStep() {
		if (!this.curScore && this.curScore !== 0) {
			return;
		}

		wx.getFriendCloudStorage({
			keyList: [
				this.curDataType
			],
			success: res => {
				console.log("wx.getFriendCloudStorage success", res);
				this.gameDatas = dataSorter(res.data, this.curDataType);
				let dataLen = this.gameDatas.length;
				this.offsetY = 0;
				this.maxOffsetY = dataLen * ITEM_HEIGHT;
				this.getNextFriend();
			},
			fail: res => {
				console.log("wx.getFriendCloudStorage fail", res);
			},
		});
	};

	//获取下一个超越好友
	getNextFriend() {
		let isMax = true;
		let tmpItem = null;
		for (let i = 0; i < this.gameDatas.length; ++i) {
			let item = this.gameDatas[i];
			let kvData = item.KVDataList[0];
			let score = kvData ? kvData.value : 0;
			score = parseInt(score);
			if (this.checkSelf(item)) continue;
			if (score > this.curScore) {
				isMax = false;
				if (!tmpItem) {
					tmpItem = item;
				} else {
					let tmpkvData = tmpItem.KVDataList[0];
					let tmpScore = tmpkvData ? tmpkvData.value : 0;
					tmpScore = parseInt(tmpScore);
					if (score < tmpScore) {
						tmpItem = item;
					}
				}
			}
		};

		if (isMax) {
			this.nextFriend = null;
		} else {
			this.nextFriend = tmpItem;
		}
		this.drawOverStepCanvas();
	}

	drawOverStepCanvas() {
		let sharedWidth = this.sharedCanvas.width;
		let sharedHeight = this.sharedCanvas.height;
		this.sharedCtx.clearRect(0, 0, sharedWidth, sharedHeight);
		if (this.clearFlag) {
			this.clearFlag = false;
			this.overStepCanvas = null;
		}

		if (!this.overStepCanvas) {
			this.overStepCanvas = wx.createCanvas();
			this.overStepCanvas.width = this.sharedCanvas.width;
			this.overStepCanvas.height = this.sharedCanvas.height;
			let ctx = this.overStepCanvas.getContext('2d');
			this.drawOverStepItem(ctx, this.nextFriend);
		}

		this.sharedCtx.drawImage(this.overStepCanvas, 0, 0, sharedWidth, sharedHeight, 0, 0, sharedWidth, sharedHeight);
	}


	drawOverStepItem(ctx, data) {
		let nick = null;
		let kvData = null;
		let grade = null;

		if (!data) {
			data = this.selfUserInfo;
			nick = data.nickName.length <= 5 ? data.nickName : data.nickName.substr(0, 4) + "...";
		} else {
			nick = data.nickname.length <= 5 ? data.nickname : data.nickname.substr(0, 4) + "...";
			kvData = data.KVDataList[0];
			grade = kvData ? kvData.value : 0;
			this.overstepScore = grade;
		}

		let avatarW = 70;
		let avatarH = 70;
		let avatarX = avatarW / 2 - 5;
		let avatarY = 9;

		DrawUtil.drawImage(ctx, {
			url: data.avatarUrl,
			x: avatarX,
			y: avatarY,
			w: avatarW,
			h: avatarH
		}, () => {
			this.drawOverStepCanvas();
		});

		let str1 = null;
		let str2 = null;
		if (grade) {
			grade = parseInt(grade);
			str1 = grade + "分";
			str2 = "超越" + nick;
		} else {
			str1 = "恭喜您";
			str2 = "吃瓜王者";
		}

		DrawUtil.drawText(ctx, {
			content: str1 + "",
			x: this.sharedCanvas.width / 2 + 50,
			y: 40,
			align: "center",
			color: "#000000",
			fontSize: 18,
		});

		DrawUtil.drawText(ctx, {
			content: str2 + "",
			x: this.sharedCanvas.width / 2 + 50,
			y: 60,
			align: "center",
			color: "#000000",
			fontSize: 18,
		});
	};

	//是否是自己
	checkSelf(item) {
		if (item.openid && this.selfOpenId && (item.openid === this.selfOpenId)) {
			return true;
		} else {
			if (item.nickname == this.selfUserInfo.nickName) {
				return true;
			}
		}

		return false;
	};

}


class DrawUtil {
	static drawAvatar(ctx, avatarUrl, x, y, w, h, cb) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(x - 5, y - 5, w + 10, h + 10);

		let avatarImg = wx.createImage();
		avatarImg.src = avatarUrl;
		avatarImg.onload = () => {
			cb(avatarImg);
		};
	}

	/**
	 * @description 绘制文本
	 * @param data {
	 * 					content: string,	//字体内容
	 * 					x: number,			//x坐标
	 * 					y: number,			//y坐标
	 * 					fontSize: number,	//字体大小	
	 * 					color: string,		//字体颜色
	 * 					align: string,		//字体对齐方式
	 * 			   }
	 */
	static drawText(ctx, data) {
		ctx.fillStyle = data.color;
		ctx.textAlign = data.align;
		ctx.textBaseline = data.baseLine || "middle";
		ctx.font = data.fontSize + "px Helvetica";
		ctx.fillText(data.content, data.x, data.y);
	}

	/**
	 * @description 绘制图片
	 * @param data {
	 * 					url: string，	//图片地址
	 * 					x: number,		//x坐标
	 * 					y: number,		//y坐标
	 * 					w: number,		//宽度
	 * 					h: number,		//高度
	 * 			   }
	 */
	static drawImage(ctx, data, cb) {
		let img = wx.createImage();
		img.src = data.url;

		img.onload = () => {
			ctx.drawImage(img, data.x, data.y, data.w, data.h);
			cb();
		}
	}
}

const rankList = new RankListRenderer();
rankList.listen();
