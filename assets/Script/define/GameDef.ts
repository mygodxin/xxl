
export class GameDef {
    public static readonly GRID_WIDTH = 6;//9;
    public static readonly GRID_HEIGHT = 9;//9;
    public static readonly GRID_TOTAL_COUNT = GameDef.GRID_WIDTH * GameDef.GRID_HEIGHT;
    public static readonly SCORE = 1;

    public static readonly SELF = 0;
    public static readonly OTHER = 1;
    public static readonly VideoDoubleScoreTimes = 5;
    public static readonly ScoreToMoney = 10;
    /** 游戏倒计时 */
    public static readonly countdownCount = 90;
    /** 最低触发消除数 */
    static readonly CAN_ELIMINATE = 3;
}

export class Grid {
    public x;
    public y;

    public color;

    public type;
    /// <summary>
    /// 需消除次数
    /// </summary>
    public elimTimes;
}

export enum GridType {
    /// <summary>
    /// 正常状态
    /// </summary>
    Normal = 0,
    /// <summary>
    /// 冰块
    /// </summary>
    IceCube = 1,
    /// <summary>
    /// 被消除一次污染
    /// </summary>
    Pollution = 2,
    BaoShi = 3,
}