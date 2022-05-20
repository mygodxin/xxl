import Resource from "../support/resource/Resource";
// import { PlatformAdapter } from "../platform/PlatformAdapter";

/**配置 */
export class ConfigManager {
    /**配置总表*/
    private m_configList: any = null;
    private m_configUrl: string = 'config';
    public bLoad = false;
    config = null;
    private config_url = 'https://download.qipai007.com/app-res/shuangkou-wxgame/v1.0.0/cloud/config/config.json?' + Math.random();

    static readonly inst = new ConfigManager;
    constructor() {
        this.m_configList = [];
    }

    /**加载游戏配置*/
    public loadConfig(callback: Function): void {
        Resource.getInstance().loadResDir(this.m_configUrl, null, (err, res) => {
            if (err) {
                return;
            }
            if (res) {
                this.bLoad = true;

                for (let i = 0; i < res.length; i++) {
                    let data = res[i];
                    if (data) {
                        this.m_configList[data.name] = data.json;
                    }
                }

                callback && callback();
                this.loadConfigRC()
            }
        })
    }

    loadConfigRC() {
        Resource.getInstance().load(this.config_url, (res) => {
            if (res) {
                // PlatformAdapter.switch = res.switch;
            }
        })
    }

    public getDefaultConfig() {
        return this.m_configList && this.m_configList['config'];
    }

    /**根据名字获取游戏配置*/
    public getConfigByName(name: string): any {
        return this.m_configList && this.m_configList[name];
    }

    public getPlatformConfig() {
        return this.m_configList && this.m_configList['platform'];
    }

    public getShopConfig() {
        return this.m_configList && this.m_configList['shop'];
    }

    public getTaskConfig() {
        return this.m_configList && this.m_configList['task'];
    }

    public getLotteryConfig() {
        return this.m_configList && this.m_configList['lottery'];
    }
    public getMetamorphsConfig() {
        return this.m_configList && this.m_configList['metamorphs'];
    }
    public getStatisticalConfig() {
        return this.m_configList && this.m_configList['statistical'];
    }

    public getStatisticalValueWithKey(key: string) {
        if (this.m_configList && this.m_configList['statistical']) {
            return this.m_configList['statistical'][key];
        }
        return null;
    }
    /**获取分享配置*/
    public getShareConfig() {

    }

    public getLanguageWithName(name: string) {
        return this.m_configList && this.m_configList['language'] && this.m_configList['language'][name];
    }
}