import Resource from "../support/resource/Resource";

const { ccclass, property } = cc._decorator;

/**音频管理器 */
@ccclass
export class AudioManager {
    private audioFile = 'sound/';
    private musicMap: { [name: string]: cc.AudioClip } = {};
    private musicFileArr = ['bg', 'handle', 'outcard', 'cardtype', 'chat', 'useitem'];

    private static instance: AudioManager = null;
    public static getInstance() {
        if (AudioManager.instance == null) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    initAudio() {
        cc.audioEngine.setEffectsVolume(0.6);
        cc.audioEngine.setMusicVolume(0.4);
        let kg = this.getAudioSwitch(2);
        fgui.GRoot.inst.volumeScale = kg ? 1 : 0;

        this.preload();
    }

    /**加载音频 */
    loadMusic() {
        let time = Date.now();
        Resource.getInstance().loadResDir(this.audioFile, null, function (res) {
            for (let i = 0; i < res.length; i++) {
                let clip = res[i];
                if (clip as cc.AudioClip) {
                    this.musicMap[clip.name] = clip;
                }
            }

            //未播放音乐则直接播放
            this.resumeMusic();
        }.bind(this))
    }

    /**预加载音频 */
    preload() {
        let file = '';
        let idx = 0;
        let callback = (err, res) => {
            if (res) {
                for (let i = 0; i < res.length; i++) {
                    let clip = res[i];
                    if (clip as cc.AudioClip) {
                        this.musicMap[file + clip.name] = clip;
                    }
                }
            }

            idx++;
            // if (idx < this.musicFileArr.length) {
            if (idx < musicFile.length) {
                file = musicFile[idx];//this.musicFileArr[idx];
                // cc.loader.loadResDir(this.audioFile + file, callback);
                cc.loader.loadRes(this.audioFile + file, callback);
            }
        }
        file = musicFile[idx]//this.musicFileArr[idx];
        // cc.loader.loadResDir(this.audioFile + file, callback);
        cc.loader.loadRes(this.audioFile + file, callback);
    }

    isExist(name: string) {
        return !!this.musicMap[name];
    }

    /**播放背景音乐 */
    playMusic(name: string, loop: boolean = true) {
        // if(cc.audioEngine.isMusicPlaying()) {
        //     cc.audioEngine.stopMusic();
        // }
        // cc.audioEngine.stopMusic();

        var musicState = this.getAudioSwitch(1);
        if (!musicState) return;

        if (this.isExist(name)) {
            cc.audioEngine.playMusic(this.musicMap[name], loop);
        } else {
            cc.loader.loadRes(this.audioFile + name, cc.AudioClip, (err, res) => {
                if (err)
                    return;
                this.musicMap[name] = res;
                cc.audioEngine.playMusic(res, loop);
            })
        }
    }

    /**停止背景音乐 */
    stopMusic() {
        cc.audioEngine.stopMusic();
    }

    /**恢复背景音乐 */
    resumeMusic() {
        // if (!cc.audioEngine.isMusicPlaying()) {
        //     if (k7.AppScene.current instanceof PlazaScene)
        //         AudioManager.getInstance().playMusic('bg/bgm1');
        //     else if (k7.AppScene.current instanceof GameScene)
        //         AudioManager.getInstance().playMusic('bg/bgm');
        // }
    }

    /**播放音效*/
    playEffect(name: string, loop?: boolean) {
        var effectState = this.getAudioSwitch(2);
        if (!effectState) return;
        if (this.isExist(name)) {
            cc.audioEngine.playEffect(this.musicMap[name], loop);
        } else {
            cc.loader.loadRes(this.audioFile + name, cc.AudioClip, (err, res) => {
                if (err)
                    return;
                this.musicMap[name] = res;
                cc.audioEngine.playEffect(res, loop);
            })
        }
    }

    /**停止音效 */
    stopEffect() {
        fgui.GRoot.inst.volumeScale = 0;
        cc.audioEngine.stopAllEffects();
    }

    /**恢复音效 */
    resumeEffect() {
        fgui.GRoot.inst.volumeScale = 1;
    }

    /**
     * 保存音频开关
     * @param state 0关1开
     * @param type (1音乐 2音效 不填则为总开关)
     */
    saveAudioSetting(state: boolean, type?: number) {
        let storage = cc.sys.localStorage.getItem('audio');
        let data = storage ? JSON.parse(storage) : null;
        if (data == null)
            data = [null, true, true];
        if (type == undefined) {
            data[1] = data[2] = state;
        } else {
            if (data[type] != state) {
                data[type] = state;
            }
        }
        cc.sys.localStorage.setItem('audio', JSON.stringify(data));

        if (type == undefined) {
            if (state) {
                this.resumeMusic();
                this.resumeEffect();
            } else {
                this.stopMusic();
                this.stopEffect();
            }
        } else {
            if (state) {
                if (type == 1)
                    this.resumeMusic();
                this.resumeEffect();
            } else {
                if (type == 1)
                    this.stopMusic();
                else if (type == 2)
                    this.stopEffect();
            }
        }
    }

    /**获取音频设置(1音乐 2音效 不填则为总开关)*/
    getAudioSwitch(type?: number) {
        let storage = cc.sys.localStorage.getItem('audio');
        let data = storage ? JSON.parse(storage) : null;
        if (data == null)
            data = [null, true, true];
        if (type == undefined) {
            return data[1] || data[2];
        } else {
            return data[type];
        }
    }

    setVibrate(kg: boolean) {
        let storage = cc.sys.localStorage.getItem('vibrate');

        cc.sys.localStorage.setItem('vibrate', JSON.stringify(kg));
    }

    startVibrate() {
        if (this.getVibrate()) {
            // PlatformAdapter.getInstance().vibrateLong();

            let node = k7.AppScene.current.node;
            let x = node.x;
            let y = node.y;
            node.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(0.02, new cc.Vec2(x + 5, y + 7)),
                        cc.moveTo(0.02, new cc.Vec2(x - 6, y + 7)),
                        cc.moveTo(0.02, new cc.Vec2(x - 13, y + 3)),
                        cc.moveTo(0.02, new cc.Vec2(x + 3, y - 6)),
                        cc.moveTo(0.02, new cc.Vec2(x - 5, y + 5)),
                        cc.moveTo(0.02, new cc.Vec2(x - 2, y - 8)),
                        cc.moveTo(0.02, new cc.Vec2(x - 8, y - 10)),
                        cc.moveTo(0.02, new cc.Vec2(x + 3, y + 10)),
                        cc.moveTo(0.02, new cc.Vec2(x, y))
                    )
                )
            );
            setTimeout(() => {
                node.stopAllActions();
                node.setPosition(x, y);
            }, 1000);
        }
    }

    getVibrate(): boolean {
        let storage = cc.sys.localStorage.getItem('vibrate');
        let kg = storage ? JSON.parse(storage) : true;
        return kg;
    }
}
const musicFile = ["bg/bgm", "bg/bgm1", "cardtype/10_1", "cardtype/10_2", "cardtype/10_3", "cardtype/10_4", "cardtype/4", "cardtype/5", "cardtype/6", "chat/f/chat_10_f", "chat/f/chat_1_f", "chat/f/chat_2_f", "chat/f/chat_3_f", "chat/f/chat_4_f", "chat/f/chat_5_f", "chat/f/chat_6_f", "chat/f/chat_7_f", "chat/f/chat_8_f", "chat/f/chat_9_f", "chat/m/chat_10_m", "chat/m/chat_1_m", "chat/m/chat_2_m", "chat/m/chat_3_m", "chat/m/chat_4_m", "chat/m/chat_5_m", "chat/m/chat_6_m", "chat/m/chat_7_m", "chat/m/chat_8_m", "chat/m/chat_9_m", "handle/clickcard", "handle/come", "handle/lost", "handle/outcard", "handle/rankmark", "handle/ready", "handle/select", "handle/sendcards", "handle/suijilaizi", "handle/tip", "handle/win", "outcard/f/f_101", "outcard/f/f_102", "outcard/f/f_103", "outcard/f/f_104", "outcard/f/f_105", "outcard/f/f_106", "outcard/f/f_107", "outcard/f/f_108", "outcard/f/f_109", "outcard/f/f_110", "outcard/f/f_111", "outcard/f/f_112", "outcard/f/f_113", "outcard/f/f_114", "outcard/f/f_115", "outcard/f/f_201", "outcard/f/f_202", "outcard/f/f_203", "outcard/f/f_204", "outcard/f/f_205", "outcard/f/f_206", "outcard/f/f_207", "outcard/f/f_208", "outcard/f/f_209", "outcard/f/f_210", "outcard/f/f_211", "outcard/f/f_212", "outcard/f/f_213", "outcard/f/f_214", "outcard/f/f_215", "outcard/f/f_301", "outcard/f/f_302", "outcard/f/f_303", "outcard/f/f_304", "outcard/f/f_305", "outcard/f/f_306", "outcard/f/f_307", "outcard/f/f_308", "outcard/f/f_309", "outcard/f/f_310", "outcard/f/f_311", "outcard/f/f_312", "outcard/f/f_313", "outcard/f/f_buyao_1", "outcard/f/f_buyao_2", "outcard/f/f_buyao_3", "outcard/f/f_buyao_4", "outcard/f/f_guanshang_1", "outcard/f/f_guanshang_2", "outcard/f/f_guanshang_3", "outcard/f/f_liandui", "outcard/f/f_littlecard", "outcard/f/f_p1", "outcard/f/f_p2", "outcard/f/f_p3", "outcard/f/f_p4", "outcard/f/f_p5", "outcard/f/f_p6", "outcard/f/f_p7", "outcard/f/f_p8", "outcard/f/f_sanshun", "outcard/f/f_sanshun2", "outcard/f/f_shunzi", "outcard/f/f_tianwang_1", "outcard/f/f_tianwang_2", "outcard/f/f_zhadan_1", "outcard/f/f_zhadan_2", "outcard/f/f_zhadan_3", "outcard/m/m_101", "outcard/m/m_102", "outcard/m/m_103", "outcard/m/m_104", "outcard/m/m_105", "outcard/m/m_106", "outcard/m/m_107", "outcard/m/m_108", "outcard/m/m_109", "outcard/m/m_110", "outcard/m/m_111", "outcard/m/m_112", "outcard/m/m_113", "outcard/m/m_114", "outcard/m/m_115", "outcard/m/m_201", "outcard/m/m_202", "outcard/m/m_203", "outcard/m/m_204", "outcard/m/m_205", "outcard/m/m_206", "outcard/m/m_207", "outcard/m/m_208", "outcard/m/m_209", "outcard/m/m_210", "outcard/m/m_211", "outcard/m/m_212", "outcard/m/m_213", "outcard/m/m_214", "outcard/m/m_215", "outcard/m/m_301", "outcard/m/m_302", "outcard/m/m_303", "outcard/m/m_304", "outcard/m/m_305", "outcard/m/m_306", "outcard/m/m_307", "outcard/m/m_308", "outcard/m/m_309", "outcard/m/m_310", "outcard/m/m_311", "outcard/m/m_312", "outcard/m/m_313", "outcard/m/m_buyao_1", "outcard/m/m_buyao_2", "outcard/m/m_buyao_3", "outcard/m/m_buyao_4", "outcard/m/m_guanshang_1", "outcard/m/m_guanshang_2", "outcard/m/m_guanshang_3", "outcard/m/m_liandui", "outcard/m/m_littlecard", "outcard/m/m_p1", "outcard/m/m_p2", "outcard/m/m_p3", "outcard/m/m_p4", "outcard/m/m_p5", "outcard/m/m_p6", "outcard/m/m_p7", "outcard/m/m_p8", "outcard/m/m_sanshun", "outcard/m/m_sanshun2", "outcard/m/m_shunzi", "outcard/m/m_tianwang_1", "outcard/m/m_tianwang_2", "outcard/m/m_zhadan_1", "outcard/m/m_zhadan_2", "outcard/m/m_zhadan_3", "useitem/1011", "useitem/1012", "useitem/1013", "useitem/1014", "useitem/1015", "useitem/1016"]