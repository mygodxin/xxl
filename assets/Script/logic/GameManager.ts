import { GameDef, Grid, GridType } from "../define/GameDef";
import { Notifitions } from "../define/Notification";
import { StorageDef } from "../define/StorageDef";
import { Util } from "../util/Util";

export class GameManager {
    public static readonly inst = new GameManager();

    _gridMap: Grid[][];
    private _myScore;
    public get myScore() {
        return this._myScore;
    }

    comboCount = 0;
    isCreateNew;
    isElimEnd;
    tempScore;
    isEmActive;
    recordScore;
    curMap;

    public initGame() {
        this._myScore = 0;
        this.recordScore = k7.Engine.readLocal(StorageDef.RECORD, true);

        this.initMap();
    }

    public initMap() {
        // this._gridMap = new Grid[GameDef.GRID_WIDTH][GameDef.GRID_HEIGHT];
        this._gridMap = [];
        for (let i = 0; i < GameDef.GRID_WIDTH; i++) {
            this._gridMap[i] = [];
        }

        for (let i = 0; i < GameDef.GRID_HEIGHT; i++) {
            for (let j = 0; j < GameDef.GRID_WIDTH; j++) {
                // 中间不生成
                var index = j + i * GameDef.GRID_WIDTH;
                let p = this.indexToPoint(index);
                this.createGrid(p.x, p.y);
            }
        }
    }

    public getMap() {
        return this._gridMap;
    }

    public getGridByPoint(p) {
        if (this._gridMap == null) return null;
        if (!this.isOnMap(p)) return null;
        return this._gridMap[p.y, p.x];
    }
    public getGridByIndex(index) {
        let p = new cc.Vec2(index % GameDef.GRID_WIDTH, index / GameDef.GRID_WIDTH);
        return this.getGridByPoint(p);
    }
    createGrid(x, y, color = -1, type = GridType.Normal) {
        let grid = new Grid();
        grid.color = color == -1 ? this.getColorWithPos(x, y) : color;
        grid.x = x;
        grid.y = y;
        grid.type = type;
        if (type == GridType.Normal || type == GridType.BaoShi) {
            grid.elimTimes = 1;
        }
        else if (type == GridType.IceCube) {
            grid.elimTimes = 2;
        }
        else if (type == GridType.Pollution) {
            grid.elimTimes = 2;
        }
        this._gridMap[x][y] = grid;
        mvc.send(Notifitions.CreateNewGrid, new cc.Vec2(x, y));
    }

    getColorWithPos(x, y) {
        let all = [0, 1, 2, 3];
        let random = Util.getRandom(0, all.length);
        if (x == 0 && y == 0) {
            return all[random];
        }

        //根据上左下右获取不同色的球
        let roundPoint = this.getRoundGrid(x, y);
        let round = [];
        for (let i = 0; i < roundPoint.length; i++) {
            let point = roundPoint[i];
            if (this.isOnMap(point) && this._gridMap[point.x][point.y] != null) {
                let color = this._gridMap[point.x][point.y].color;
                round.push(color);
            }
        }
        //去除相同的颜色
        let tar = [];
        for (let i = 0; i < all.length; i++) {
            let color = all[i];
            if (round.indexOf(color) < 0) {
                tar.push(color);
            }
        }

        //剩余颜色中随机一个
        random = Util.getRandom(0, tar.length);
        // console.log('最终颜色', x + y * GameDef.GRID_WIDTH, round, tar[random])
        return tar[random];
    }

    getCanEliminatePoint(x, y) {
        //查找上方可移动消除的点
        //4
        //3 2 1 0 4 3 2 1
        let m = 0;
        let shield = [];
        for (let i = y - 1; i >= 0; i--) {
            let p = new cc.Vec2(x, i);
            if (!this.isOnMap(p)) break;
            if (this._gridMap[p.y, p.x] == null) {
                if ((y - 1 - m) != p.y) {
                    break;
                }
                m++;
                continue;
            }
            shield.push(p);
            let can = this.canEliminate(x, i + 1 + m, p, shield);
            if (can) {
                return p;
            }
        }
        //查找下方可移动消除的点
        // 3
        //4 5 6  3 4 5
        m = 0;
        shield.length = 0;
        for (let i = y + 1; i < GameDef.GRID_HEIGHT; i++) {
            let p = new cc.Vec2(x, i);
            if (!this.isOnMap(p)) break;
            if (this._gridMap[p.y, p.x] == null) {
                if ((y + 1 + m) != p.y) {
                    break;
                }
                m++;
                continue;
            }
            //从上1遍历到0 尝试移动
            shield.push(p);
            let can = this.canEliminate(x, i - 1 - m, p, shield);
            if (can) {
                return p;
            }
        }
        //查找左方可移动消除的点
        //3
        //2 1 0 1 2 3
        m = 0;
        shield = [];
        for (let i = x - 1; i >= 0; i--) {
            let p = new cc.Vec2(i, y);
            if (!this.isOnMap(p)) break;
            if (this._gridMap[p.y, p.x] == null) {
                if ((x - 1 - m) != p.x) {
                    break;
                }
                m++;
                continue;
            }
            shield.push(p);
            let can = this.canEliminate(i + 1 + m, y, p, shield);
            if (can) {
                return p;
            }
        }
        //查找下方可移动消除的点
        // 3
        //4 5 6  3 4 5
        m = 0;
        shield.length = 0;
        for (let i = x + 1; i < GameDef.GRID_HEIGHT; i++) {
            let p = new cc.Vec2(i, y);
            if (!this.isOnMap(p)) break;
            if (this._gridMap[p.y, p.x] == null) {
                if ((x + 1 + m) != p.x) {
                    break;
                }
                m++;
                continue;
            }
            //从上1遍历到0 尝试移动
            shield.push(p);
            let can = this.canEliminate(i - 1 - m, y, p, shield);
            if (can) {
                return p;
            }
        }
        return null;
    }
    canEliminate(x, y, existPoint, shiled = null) {
        let existGrid = this._gridMap[existPoint.x][existPoint.y];
        let color = existGrid.color;
        let pointArr = this.getRoundGrid(x, y);
        for (let i = 0; i < pointArr.length; i++) {
            let p = pointArr[i];
            if (p.x == existPoint.x && p.y == existPoint.y) continue;
            if (shiled != null) {
                let c = false;
                for (let f in shiled) {
                    let s = shiled[f];
                    if (s.x == p.x && s.y == p.y) {
                        c = true;
                        break;
                    }
                }
                if (c) {
                    continue;
                }
            }
            if (this.isOnMap(p)) {
                let grid = this._gridMap[p.x][p.y];

                if (grid != null && grid.color == color && grid.type == GridType.Normal) {
                    return true;
                }
            }
        }
        return false;
    }
    getTop(p) {
        let x = p.x;
        let y = p.y - 1;
        if (this.isOnMapByXY(x, y)) {
            return new cc.Vec2(x, y);
        }
        return null;
    }
    getBottom(p) {
        let x = p.x;
        let y = p.y + 1;
        if (this.isOnMapByXY(x, y)) {
            return new cc.Vec2(x, y);
        }
        return null;
    }
    getLeft(p) {
        let x = p.x - 1;
        let y = p.y;
        if (this.isOnMapByXY(x, y)) {
            return new cc.Vec2(x, y);
        }
        return null;
    }
    getRight(p) {
        let x = p.x + 1;
        let y = p.y;
        if (this.isOnMapByXY(x, y)) {
            return new cc.Vec2(x, y);
        }
        return null;
    }
    isOnMapByXY(x, y) {
        return x >= 0
            && y >= 0
            && x < GameDef.GRID_WIDTH
            && y < GameDef.GRID_HEIGHT;
    }
    isOnMap(point) {
        return point.x >= 0
            && point.y >= 0
            && point.x < GameDef.GRID_WIDTH
            && point.y < GameDef.GRID_HEIGHT && this.isMap(point);
    }
    isOnMapByIndex(index) {
        var point = this.indexToPoint(index);
        return this.isOnMap(point);
    }

    getRoundMove(x, y) {
        let pointArr = [];

        //根据上左下右获取不同色的球
        let roundPoint = this.getRoundGrid(x, y);

        let movePointArr = [];
        for (let i = 0; i < roundPoint.length; i++) {
            let point = roundPoint[i];
            if (this.isOnMap(point) && this._gridMap[point.y, point.x] == null) {
                //  color = this._gridMap[point.y, point.x].color;
                movePointArr.push(point);
            }
        }

        return movePointArr;
    }

    public canMove(curIndex, tarIndex) {
        let x = curIndex % GameDef.GRID_WIDTH;
        let y = curIndex / GameDef.GRID_HEIGHT;

        let tarX = tarIndex % GameDef.GRID_WIDTH;
        let tarY = tarIndex / GameDef.GRID_HEIGHT;
        //选中点与目标点在一条直线上,并且目标点为空即可移动
        let curX = curIndex % GameDef.GRID_WIDTH;
        let curY = curIndex / GameDef.GRID_HEIGHT;

        // if (curX != tarX && curY != tarY) return;

        let startPoints;
        let endPoints = [];
        if (curX == tarX) {//x轴方向
            if (tarY < curY) {//上
                //查找障碍
                let grid;
                let line = [];
                let obstacleIndex = tarY;
                //获取需要移动的点
                for (let i = curY; i >= tarY; i--) {
                    grid = this._gridMap[curX][i];
                    var p = new cc.Vec2(curX, i);
                    if (this.isBarrier(grid) || !this.isMap(p)) {
                        line.length = 0;
                        break;
                    }
                    if (grid != null) {
                        line.push(new cc.Vec2(curX, i));
                    }
                    else {
                        obstacleIndex = i;
                        break;
                    }
                }
                startPoints = line;
            }
            else {//下
                //查找障碍
                let grid;
                let line = [];
                let obstacleIndex = tarY;
                //获取需要移动的点
                for (let i = curY; i <= tarY; i++) {
                    grid = this._gridMap[curX][i];
                    var p = new cc.Vec2(curX, i);
                    if (this.isBarrier(grid) || !this.isMap(p)) {
                        line.length = 0;
                        break;
                    }
                    if (grid != null) {
                        line.push(new cc.Vec2(curX, i));
                    }
                    else {
                        obstacleIndex = i;
                        break;
                    }
                }
                startPoints = line;
            }
        }
        else {//y轴方向
            if (tarX < curX) {//左
                //查找障碍
                let grid;
                let line = [];
                let obstacleIndex = tarX;
                //获取需要移动的点
                for (let i = curX; i >= tarX; i--) {
                    grid = this._gridMap[i][curY];
                    var p = new cc.Vec2(i, curY);
                    if (this.isBarrier(grid) || !this.isMap(p)) {
                        line.length = 0;
                        break;
                    }
                    if (grid != null) {
                        line.push(new cc.Vec2(i, curY));
                    }
                    else {
                        obstacleIndex = i;
                        break;
                    }
                }
                startPoints = line;
            }
            else {//右
                //查找障碍
                let grid;
                let line = [];
                let obstacleIndex = tarX;
                //获取需要移动的点
                for (let i = curX; i <= tarX; i++) {
                    grid = this._gridMap[i][curY];
                    var p = new cc.Vec2(i, curY);
                    if (this.isBarrier(grid) || !this.isMap(p)) {
                        line.length = 0;
                        break;
                    }
                    if (grid != null) {
                        line.push(new cc.Vec2(i, curY));
                    }
                    else {
                        obstacleIndex = i;
                        break;
                    }
                }
                startPoints = line;
            }
        }
        // if (x == tarX || y == tarY)
        //     return true;
        if (startPoints.length > 0) return true;
        return false;
    }

    private checkObstacleGrid(curIndex, tarIndex) {

    }

    private getRoundGrid(x, y) {
        let top = new cc.Vec2(x, y - 1);
        let left = new cc.Vec2(x - 1, y);
        let down = new cc.Vec2(x, y + 1);
        let right = new cc.Vec2(x + 1, y);
        let roundPoint = [top, left, down, right];
        return roundPoint;
    }

    public canClick(lastSel, curSel) {

        const x = curSel % GameDef.GRID_WIDTH;
        const y = parseInt(curSel / GameDef.GRID_WIDTH + '');
        const tarX = lastSel % GameDef.GRID_WIDTH;
        const tarY = parseInt(lastSel / GameDef.GRID_WIDTH + '');
        let roundPoint = this.getRoundGrid(x, y);
        for (let i = 0; i < roundPoint.length; i++) {
            let point = roundPoint[i];
            if (point.x == tarX && point.y == tarY) {
                return true;
            }
        }
        return false;
    }

    public checkAndRemove() {
        let totalScore = 0;
        //消除x轴和y轴颜色一致的球
        let tempBoomList = [];
        let tempGridList: Grid[] = [];
        for (let j = 0; j < GameDef.GRID_TOTAL_COUNT; j++) {
            let score = 0;
            let x = j % GameDef.GRID_WIDTH;
            let y = parseInt(j / GameDef.GRID_WIDTH + '');
            let grid = this._gridMap[x][y];
            let current = new cc.Vec2(x, y);
            var sameList = [];
            if (grid != null && grid.type == GridType.Normal) {
                this.FillSameItemsList(sameList, current);
                // var boomList = this.FillBoomList(sameList, current);
                var boomList = sameList;
                //消除并加分
                if (boomList.length >= GameDef.CAN_ELIMINATE) {
                    //检测数组里是否有横向或者纵向超过4个的
                    if (this.checkDirNum(boomList)) {
                        tempGridList.push(...this.removeBoomList(boomList));
                        score += (boomList.length - 1);
                        tempBoomList.push(boomList);
                    }
                }
            }
            if (score > 0) {
                totalScore += score;
            }
        }
        if (totalScore > 0) {
            //计算连击
            let combo = this.getCombo(tempGridList);
            totalScore = totalScore * combo * 8;
            // if (this.gameMode == GameMode.PERSON)
            this.tempScore += totalScore;
            // else
            //     this.pushScore(totalScore);
        }
        // if (!this.isCreateNew)
        //     this.pushScore(this.tempScore);
        cc.log("触发消除检查=========", tempBoomList);
        mvc.send(Notifitions.CheckAndMoveEnd, tempBoomList);
    }

    checkDirNum(boomList: cc.Vec2[]) {
        let xList = [];
        for (let k in boomList) {
            let p = boomList[k];
            xList[p.x]++;
        }
        for (let i = 0; i < xList.length; i++) {
            if (xList[i] >= GameDef.CAN_ELIMINATE) {
                return true;
            }
        }
        let yList = [];
        for (let k in boomList) {
            let p = boomList[k];
            yList[p.y]++;
        }
        for (let i = 0; i < yList.length; i++) {
            if (yList[i] >= GameDef.CAN_ELIMINATE) {
                return true;
            }
        }
        return false;
    }
    getCombo(boomArr: Grid[]) {
        let combo = 0;
        let colorArr = [0, 0, 0, 0, 0, 0];
        for (let m = 0; m < boomArr.length; m++) {
            let grid: Grid = boomArr[m];
            if (grid == null)
                continue;
            let color = grid.color;
            colorArr[color]++;
        }
        for (let n = 0; n < colorArr.length; n++) {
            if (colorArr[n] > 0) {
                combo++;
            }
        }
        return combo;
    }

    addScore(score) {
        // switch (this.curPlayer) {
        //     case GameDef.SELF:

        //         let doubleTimes = DataManager.inst.getDoubleScoreTimes();
        //         if (doubleTimes > 0) {
        //             score *= 10;
        //             DataManager.inst.pushDoubleScoreTimes(-1);
        //         }

        //         this._myScore += score;
        //         break;
        //     case GameDef.OTHER:
        //         this._otherScore += score;
        //         break;
        // }
        this.tempScore = 0;
        mvc.send(Notifitions.ScoreUpdate, score);
        if (this.recordScore != 0 && this.myScore > this.recordScore) {
            k7.Engine.saveLocal(StorageDef.RECORD, this.myScore);
            mvc.send(Notifitions.NewRecord);
        }
    }

    public FillSameItemsList(sameList, current) {
        //如果已存在，跳过
        for (var f in sameList) {
            let p = sameList[f];
            if (p.x == current.x && p.y == current.y)
                return;
        }
        //添加到列表
        sameList.push(current);
        //上下左右的Item
        let tempItemList = [
            this.getTop(current), this.getBottom(current),
            this.getLeft(current), this.getRight(current)
        ];

        let curGrid: Grid = this._gridMap[current.x][current.y];
        for (let i = 0; i < tempItemList.length; i++) {
            let p = tempItemList[i];
            //如果Item不合法，跳过
            if (p == null)
                continue;
            let tempGird: Grid = this._gridMap[p.x][p.y];
            if (tempGird == null || tempGird.type != GridType.Normal)
                continue;
            if (curGrid.color == tempGird.color) {
                this.FillSameItemsList(sameList, tempItemList[i]);
            }
        }
    }

    // 填充待消除列表
    public FillBoomList(sameList, current) {
        //计数器
        let rowCount = 0;
        let columnCount = 0;
        //临时列表
        let rowTempList: cc.Vec2[] = [];
        let columnTempList: cc.Vec2[] = [];
        //横向纵向检测
        for (var f in sameList) {
            let p = sameList[f];
            //如果在同一行
            if (p.y == current.y) {
                //判断该点与Curren中间有无间隙
                let rowCanBoom = this.CheckItemsInterval(true, current, p);
                if (rowCanBoom) {
                    //计数
                    rowCount++;
                    //添加到行临时列表
                    rowTempList.push(p);
                }
            }
            //如果在同一列
            if (p.x == current.x) {
                //判断该点与Curren中间有无间隙
                let columnCanBoom = this.CheckItemsInterval(false, current, p);
                if (columnCanBoom) {
                    //计数
                    columnCount++;
                    //添加到列临时列表
                    columnTempList.push(p);
                }
            }
        }

        //横向消除
        let boomList = [];
        let horizontalBoom = false;
        //如果横向三个以上
        if (rowCount > 1) {
            //将临时列表中的Item全部放入BoomList
            boomList.push(rowTempList);
            //横向消除
            horizontalBoom = true;
        }
        //如果纵向三个以上
        if (columnCount > 1) {
            if (horizontalBoom) {
                //剔除自己
                boomList.splice(boomList.indexOf(current));
            }
            //将临时列表中的Item全部放入BoomList
            boomList.push(columnTempList);
        }
        //如果没有消除对象，返回
        if (boomList.length == 0) {
            return null;
        }
        //创建临时的BoomList
        let tempBoomList = [];
        //转移到临时列表
        tempBoomList.push(boomList);
        //开启处理BoomList的协程
        // StartCoroutine(ManipulateBoomList(tempBoomList));
        return tempBoomList;
    }
    private removeBoomList(boomList): Grid[] {
        let gridList: Grid[] = [];
        if (boomList == null || boomList.Count == 0) return gridList;

        for (var f in boomList) {
            let p: cc.Vec2 = boomList[f];
            //周围有冰块或者液体进行消除
            let roundPoint = this.getRoundGrid(p.x, p.y);
            let round = [];
            for (let i = 0; i < roundPoint.length; i++) {
                let point = roundPoint[i];
                if (this.isOnMap(point) && this._gridMap[point.x][point.y] != null) {
                    var grid = this._gridMap[point.x][point.y];
                    if (grid.type == GridType.IceCube || grid.type == GridType.Pollution || grid.type == GridType.BaoShi) {
                        // cc.log("待消除次数=" + grid.elimTimes + ",x=" + point.x + ",y=" + point.y);
                        // if (grid.elimTimes > 1)
                        //     grid.elimTimes--;
                        // else
                        // this._gridMap[point.y, point.x] = null;
                        // if (grid.type == GridType.IceCube)
                        // mvc.send(Notifitions.ElimIceCube, point);
                        // else if (grid.type == GridType.BaoShi) {
                        // DataManager.inst.pushGem();
                        // mvc.send(Notifitions.ElimBaoShi, point);
                        // }
                        // else
                        // mvc.send(Notifitions.ElimPollution, point);
                    }
                }
            }
            gridList.push(this._gridMap[p.x][p.y]);
            this._gridMap[p.y, p.x] = null;
        }
        return gridList;
        // mvc.send(Notifitions.Eliminate, boomList);
    }
    private CheckItemsInterval(isHorizontal, begin, end) {
        let beginGrid = this._gridMap[begin.x][begin.y];
        let endGrid = this._gridMap[end.x][end.y];
        let gridMap = [].concat(this._gridMap);
        //获取图案
        let color = beginGrid.color; //如果是横向
        if (isHorizontal) {
            //起点终点列号
            let beginIndex = begin.x;
            let endIndex = end.x;
            //如果起点在右，交换起点终点列号
            if (beginIndex > endIndex) {
                beginIndex = end.x;
                endIndex = begin.x;
            }
            //遍历中间的Item
            for (let i = beginIndex + 1; i < endIndex; i++) {
                //异常处理(中间未生成，标识为不合法)
                if (gridMap[begin.y, i] == null) {
                    return false;
                }
                //如果中间有间隙(有图案不一致的)
                if (gridMap[begin.y, i].color != color) {
                    return false;
                }
            }
            return true;
        }
        else {
            //起点终点行号
            let beginIndex = begin.y;
            let endIndex = end.y;
            //如果起点在上，交换起点终点列号
            if (beginIndex > endIndex) {
                beginIndex = end.y;
                endIndex = begin.y;
            }
            //遍历中间的Item
            for (let i = beginIndex + 1; i < endIndex; i++) {
                //如果中间有间隙(有图案不一致的)
                if (gridMap[begin.x][i].color != color) {
                    return false;
                }
            }
            return true;
        }
    }

    public isFinished() {
        let colorNumList = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this._gridMap.length; i++) {
            let y = i / GameDef.GRID_WIDTH;
            let x = i % GameDef.GRID_WIDTH;
            if (this._gridMap[x][y] == null)
                continue;
            let color = this._gridMap[x][y].color;
            colorNumList[color]++;
            if (colorNumList[color] >= 2) {
                return false;
            }
        }
        cc.log("比赛结束==========================");
        return true;
    }

    public pointToIndex(p) {
        return p.x + p.y * GameDef.GRID_WIDTH;
    }
    public indexToPoint(index) {
        return new cc.Vec2(index % GameDef.GRID_WIDTH, parseInt(index / GameDef.GRID_WIDTH + ''));
    }
    /// <summary>
    /// 消除随机同色球
    /// </summary>
    public elimRandomColorGrid() {
        let tarColor = -1;
        //获取场上有的颜色
        let colorList = [];
        for (let i = 0; i < this._gridMap.length; i++) {
            let p = this.indexToPoint(i);
            if (this._gridMap[p.x][p.y] == null)
                continue;
            let color = this._gridMap[p.x][p.y].color;
            if (colorList.indexOf(color) < 0) {
                colorList.push(color);
            }
        }

        let random = Util.getRandom(0, colorList.length - 1);
        tarColor = colorList[random];

        let tempBoomList = [];
        let score = 0;
        for (let i = 0; i < this._gridMap.length; i++) {
            let p = this.indexToPoint(i);
            if (this._gridMap[p.y, p.x] == null)
                continue;
            let color = this._gridMap[p.x][p.y].color;
            if (tarColor == color) {
                this._gridMap[p.y, p.x] = null;
                tempBoomList.push(p);
                score++;
            }
        }
        if (score > 0) {
            this.tempScore += score;
            mvc.send(Notifitions.CheckAndMoveEnd, tempBoomList);
        }
        this.isReset();
    }

    _minLightningElimCount = 3;
    _maxLightningElimCount = 5;
    /// <summary>
    /// 消除随机数量球
    /// </summary>
    public elimRandomCount() {
        let count = Util.getRandom(this._minLightningElimCount, this._maxLightningElimCount + 1);
        count = Math.min(count, this._gridMap.length);
        // List<> list = Util.getRandomWithoutRep(0, this._gridMap.length, count);
        this.elimCount(count, true);
        this.isReset();
    }

    public elimCount(count, isItem = false) {
        let list = [];
        while (list.length < count) {
            let random = Util.getRandom(0, this._gridMap.length);
            let p = this.indexToPoint(random);
            if (this._gridMap[p.x][p.y] != null && list.indexOf(random) < 0)
                list.push(random);
        }

        let score = 0;
        let tempBoomList = [];
        for (let i = 0; i < this._gridMap.length; i++) {
            if (list.indexOf(i) >= 0) {
                let p = this.indexToPoint(i);
                if (this._gridMap[p.x][p.y] == null)
                    continue;
                this._gridMap[p.x][p.y] = null;
                tempBoomList.push(p);
                score++;
            }
        }

        if (score > 0) {
            this.tempScore += score;
            mvc.send(Notifitions.CheckAndMoveEnd, tempBoomList);
        }
    }

    public hitGrid(index) {
        let p = this.indexToPoint(index);
        let grid: Grid = this._gridMap[p.x][p.y];
        if (grid == null) return false;
        if (grid.type == GridType.Pollution) {
            // this._gridMap[p.y, p.x] = null;
            // mvc.send(Notifitions.ElimPollution, p);
        }
        else if (grid.type == GridType.IceCube) {
            // this._gridMap[p.y, p.x] = null;
            // mvc.send(Notifitions.ElimIceCube, p);
        }
        else if (grid.type == GridType.BaoShi) {
            // this._gridMap[p.y, p.x] = null;
            // DataManager.inst.pushGem();
            // mvc.send(Notifitions.ElimBaoShi, p);
        }
        else {
            this._gridMap[p.x][p.y] = null;
            // mvc.send(Notifitions.ElimnateGrid, p);

            let tempBoomList = [];
            tempBoomList.push(p);
            this.tempScore += 1;
            mvc.send(Notifitions.CheckAndMoveEnd, tempBoomList);
        }
        return true;
    }

    public createNewGridInPerson() {
        // //生成新球
        // this.createNewGrid();

        // //生成污染物
        // if (this.curStep == this.YetiStep) {
        //     this.createYeTi();
        //     this.curStep = 0;
        // }
        // //生成冰块
        // if (this._myScore >= this.IceCubeCreateNeedScore) {
        //     this.createIceCube();
        // }
        // //生成宝石
        // if (this._myScore >= this.BaoShiCreateNeedScore) {
        //     this.createBaoShi();
        // }
        return true;
    }
    isMap(p) {
        // var val = this.curMap[this.pointToIndex(p)];
        // return val != 0;
        return true;
    }
    createNewGrid() {
        // //生成球
        // let createCount = this.getCreateCount();
        // //筛选空格子
        // let pList = [];
        // for (let i = 0; i < this._gridMap.length; i++) {
        //     p = this.indexToPoint(i);
        //     if (this._gridMap[p.y, p.x] == null && this.isMap(p)) {
        //         pList.push(p);
        //     }
        // }
        // if (pList.length > 1) {
        //     if (pList.length > createCount) {
        //         var list = Util.getRandomWithoutRep(0, pList.Count, createCount).ToArray();
        //         for (let i = 0; i < list.length; i++) {
        //             var p = pList[list[i]];
        //             if (let i == 0 && this._myScore >= this.IceCubeCreateNeedScore && this.isCreateIceCube()) {
        //                 this.createGrid(p.x, p.y, -1, GridType.IceCube);
        //             }
        //             else
        //                 this.createGrid(p.x, p.y, Util.getRandom(0, SkinManager.COLOR_COUNT));
        //         }
        //     }
        //     else {
        //         var pArr = pList.ToArray();
        //         for (i = 0; i < pArr.length; i++) {
        //             var p = pArr[i];
        //             if (i == 0 && this._myScore >= this.IceCubeCreateNeedScore && this.isCreateIceCube()) {
        //                 this.createGrid(p.x, p.y, -1, GridType.IceCube);
        //             }
        //             else
        //                 this.createGrid(p.x, p.y, Util.getRandom(0, SkinManager.COLOR_COUNT));
        //         }
        //     }
        // }
    }

    private isCreateIceCube() {
        let random = Util.getRandom(0, 5);
        return random > 3;
        // return false;
    }

    public createYeTi() {
        // //生成球
        // let createCount = this.getCreateCount();
        // //筛选空格子
        // let pList = [];
        // for (let i = 0; i < this._gridMap.length; i++) {
        //     p = this.indexToPoint(i);
        //     if (this._gridMap[p.y, p.x] != null && !this.isBarrier(this._gridMap[p.y, p.x]) && this.isMap(p)) {
        //         pList.push(p);
        //     }
        // }
        // if (pList.length > this.maxYeTi) {
        //     var list = Util.getRandomWithoutRep(0, pList.Count, this.maxYeTi).ToArray();
        //     for (i = 0; i < list.length; i++) {
        //         var p = pList[list[i]];
        //         this.createGrid(p.x, p.y, -1, GridType.Pollution);
        //     }
        // }
        // else {
        //     var pArr = pList.ToArray();
        //     for (i = 0; i < pArr.length; i++) {
        //         var p = pArr[i];
        //         this.createGrid(p.x, p.y, -1, GridType.Pollution);
        //     }
        // }
    }

    private createIceCube() {

    }

    private createBaoShi() {
        // //生成球
        // createCount = this.getCreateCount();
        // //筛选空格子
        // pList = [];
        // for (i = 0; i < this._gridMap.length; i++) {
        //     p = this.indexToPoint(i);
        //     if (this._gridMap[p.y, p.x] != null && !this.isBarrier(this._gridMap[p.y, p.x]) && this.isMap(p)) {
        //         pList.push(p);
        //     }
        // }
        // if (pList.Count > 0) {
        //     //判断概率
        //     var random = Util.getRandom(0, 10);
        //     if (random < 2) {
        //         var list = Util.getRandomWithoutRep(0, pList.Count, 1).ToArray();
        //         for (i = 0; i < list.length; i++) {
        //             var p = pList[list[i]];
        //             this.createGrid(p.x, p.y, -1, GridType.BaoShi);
        //         }
        //     }
        // }
    }

    public getCreateCount() {
        // let create = ConfigManager.inst.getGameConfig().create;
        // let score = this._myScore;
        // for (let i = create.length - 1; i >= 0; i--) {
        //     if (create[i] >= 0 && score >= create[i])
        //         return i;
        // }
        // return 0;
    }

    /// <summary>
    /// 是否是障碍
    /// </summary>
    /// <returns></returns>
    public isBarrier(grid: Grid) {
        if (grid != null
            && (grid.type == GridType.IceCube
                || grid.type == GridType.Pollution
                || grid.type == GridType.BaoShi
            ))
            return true;
        return false;
    }
    public checkCountdown() {
        let totalCount = 0;
        for (let i = 0; i < this._gridMap.length; i++) {
            let y = parseInt(i / GameDef.GRID_WIDTH + '');
            let x = i % GameDef.GRID_WIDTH;
            if (this._gridMap[x][y] == null)
                continue;
            totalCount++;
        }
        if (totalCount <= GameDef.countdownCount) {
            mvc.send(Notifitions.ShowCountdown);
        }
    }

    public checkFinish() {
        if (this.isFinished()) {
            if (this.recordScore == 0) {
                k7.Engine.readLocal(StorageDef.RECORD, this.myScore);
            }
            mvc.send(Notifitions.GameEnd);
            return;
        }
        this.checkCountdown();
    }

    private isReset() {

    }
    private resetMap() {
        //  count = 0;
        for (let i = 0; i < this._gridMap.length; i++) {
            var p = this.indexToPoint(i);
            if (this._gridMap[p.x][p.y] != null) {
                return false;
            }
        }
        // mvc.send(Notifitions.InitMap);
        return true;
    }

    move(curIndex, tarIndex) {
        let curX = curIndex % GameDef.GRID_WIDTH;
        let curY = parseInt(curIndex / GameDef.GRID_HEIGHT + '');

        let tarX = tarIndex % GameDef.GRID_WIDTH;
        let tarY = parseInt(tarIndex / GameDef.GRID_HEIGHT + '');

        let grid = this._gridMap[curX][curY];
        this._gridMap[curX][curY] = this._gridMap[tarX][tarY];
        this._gridMap[tarX][tarY] = grid;
        console.log('交换', curX, curY, tarX, tarY);
    }

    // public move(curIndex, tarIndex) {
    //     let curX = curIndex % GameDef.GRID_WIDTH;
    //     let curY = curIndex / GameDef.GRID_HEIGHT;

    //     let tarX = tarIndex % GameDef.GRID_WIDTH;
    //     let tarY = tarIndex / GameDef.GRID_HEIGHT;

    //     if (curX != tarX && curY != tarY) return;

    //     let startPoints;
    //     let endPoints = [];
    //     if (curX == tarX) {//x轴方向
    //         if (tarY < curY) {//上
    //             //查找障碍
    //             let grid;
    //             let line = [];
    //             let obstacleIndex = tarY;
    //             //获取需要移动的点
    //             for (let i = curY; i > tarY; i--) {
    //                 grid = this._gridMap[curX][i];
    //                 var point = new cc.Vec2(curX, i);
    //                 if (this.isBarrier(grid) || !this.isMap(point)) {
    //                     line.length = 0;
    //                     break;
    //                 }
    //                 if (grid != null) {
    //                     line.push(new cc.Vec2(curX, i));
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                     break;
    //                 }
    //             }
    //             //获取障碍点
    //             for (let i = obstacleIndex; i >= tarY; i--) {
    //                 grid = this._gridMap[curX][i];
    //                 var point = new cc.Vec2(curX, i);
    //                 if (grid != null || this.isBarrier(grid) || !this.isMap(point)) {
    //                     break;
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                 }
    //             }
    //             //开始移动点
    //             let p;
    //             let startPoints = line;
    //             for (let i = startPoints.length - 1; i >= 0; i--) {
    //                 p = startPoints[i];
    //                 endPoints.push(new cc.Vec2(p.x, obstacleIndex));
    //                 this._gridMap[p.x][obstacleIndex] = this._gridMap[p.x][p.y];
    //                 this._gridMap[p.y, p.x] = null;
    //                 obstacleIndex++;
    //             }
    //         }
    //         else {//下
    //             //查找障碍
    //             let grid;
    //             let line = [];
    //             let obstacleIndex = tarY;
    //             //获取需要移动的点
    //             for (let i = curY; i < tarY; i++) {
    //                 grid = this._gridMap[curX][i];
    //                 var point = new cc.Vec2(curX, i);
    //                 if (this.isBarrier(grid) || !this.isMap(point)) {
    //                     line.length = 0;
    //                     break;
    //                 }
    //                 if (grid != null) {
    //                     line.push(new cc.Vec2(curX, i));
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                     break;
    //                 }
    //             }
    //             //获取障碍点
    //             for (let i = obstacleIndex; i <= tarY; i++) {
    //                 grid = this._gridMap[curX][i];
    //                 var point = new cc.Vec2(curX, i);
    //                 if (grid != null || this.isBarrier(grid) || !this.isMap(point)) {
    //                     break;
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                 }
    //             }
    //             //开始移动点
    //             let p;
    //             let startPoints = line;
    //             for (let i = startPoints.length - 1; i >= 0; i--) {
    //                 p = startPoints[i];
    //                 endPoints.push(new cc.Vec2(p.x, obstacleIndex));
    //                 this._gridMap[p.x][obstacleIndex] = this._gridMap[p.x][p.y];
    //                 this._gridMap[p.y, p.x] = null;
    //                 obstacleIndex--;
    //             }
    //         }
    //     }
    //     else {//y轴方向
    //         if (tarX < curX) {//左
    //             //查找障碍
    //             let grid;
    //             let line = [];
    //             let obstacleIndex = tarX;
    //             //获取需要移动的点
    //             for (let i = curX; i > tarX; i--) {
    //                 grid = this._gridMap[i][curY];
    //                 var point = new cc.Vec2(i, curY);
    //                 if (this.isBarrier(grid) || !this.isMap(point)) {
    //                     line.length;
    //                     break;
    //                 }
    //                 if (grid != null) {
    //                     line.push(new cc.Vec2(i, curY));
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                     break;
    //                 }
    //             }
    //             //获取障碍点
    //             for (let i = obstacleIndex; i >= tarX; i--) {
    //                 grid = this._gridMap[i][curY];
    //                 var point = new cc.Vec2(i, curY);
    //                 if (grid != null || this.isBarrier(grid) || !this.isMap(point)) {
    //                     break;
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                 }
    //             }
    //             //开始移动点
    //             let p;
    //             let startPoints = line;
    //             for (let i = startPoints.length - 1; i >= 0; i--) {
    //                 p = startPoints[i];
    //                 endPoints.push(new cc.Vec2(obstacleIndex, p.y));
    //                 this._gridMap[p.y, obstacleIndex] = this._gridMap[p.y, p.x];
    //                 this._gridMap[p.y, p.x] = null;
    //                 obstacleIndex++;
    //             }
    //         }
    //         else {//右
    //             //查找障碍
    //             let grid;
    //             let line = [];
    //             let obstacleIndex = tarX;
    //             //获取需要移动的点
    //             for (let i = curX; i < tarX; i++) {
    //                 grid = this._gridMap[i][curY];
    //                 var point = new cc.Vec2(i, curY);
    //                 if (this.isBarrier(grid) || !this.isMap(point)) {
    //                     line.length = 0;
    //                     break;
    //                 }
    //                 if (grid != null) {
    //                     line.push(new cc.Vec2(i, curY));
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                     break;
    //                 }
    //             }
    //             //获取障碍点
    //             for (let i = obstacleIndex; i <= tarX; i++) {
    //                 grid = this._gridMap[i][curY];
    //                 var point = new cc.Vec2(i, curY);
    //                 if (grid != null || this.isBarrier(grid) || !this.isMap(point)) {
    //                     break;
    //                 }
    //                 else {
    //                     obstacleIndex = i;
    //                 }
    //             }
    //             //开始移动点
    //             let p;
    //             let startPoints = line;
    //             for (let i = startPoints.length - 1; i >= 0; i--) {
    //                 p = startPoints[i];
    //                 endPoints.push(new cc.Vec2(obstacleIndex, p.y));
    //                 this._gridMap[p.y, obstacleIndex] = this._gridMap[p.y, p.x];
    //                 this._gridMap[p.y, p.x] = null;
    //                 obstacleIndex--;
    //             }
    //         }
    //     }
    //     let moveList = [];
    //     var endArr = endPoints;
    //     // Array.Reverse(endArr);
    //     moveList.push("end", endArr);
    //     moveList.push("start", startPoints);
    //     this.isCreateNew = true;
    //     this.tempScore = 0;
    //     // mvc.send(Notifitions.MoveEnd, moveList);
    // }
}