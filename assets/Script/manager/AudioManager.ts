import Resource from "../support/resource/Resource";

const { ccclass, property } = cc._decorator;
const musicFile = ["bg/bgm"];
/**音频管理器 */
@ccclass
export class AudioManager {
    private audioFile = 'sound/';
    private musicMap: { [name: string]: cc.AudioClip } = {};

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