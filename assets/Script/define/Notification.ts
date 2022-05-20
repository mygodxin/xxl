/**全局消息定义 */
export class Notifitions {
    private static index: number = 0x00000001;

    private static Next() {
        return 'N' + Notifitions.index++;
    }
    /*------------------------大厅事件---------------------------*/
    /**关闭 ActCenterWin事件发送 */
    public static readonly CreateNewGrid: string = Notifitions.Next();
    public static readonly ScoreUpdate: string = Notifitions.Next();
    public static readonly NewRecord: string = Notifitions.Next();
    public static readonly ShowCountdown: string = Notifitions.Next();
    public static readonly CheckAndMoveEnd: string = Notifitions.Next();
    public static readonly GameEnd: string = Notifitions.Next();
}