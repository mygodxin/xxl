export class ResManager {
    static readonly inst = new ResManager;

    private _loader: k7.SourcePreLoader;
    init(): void {
        this._loader = new k7.SourcePreLoader();
        this._loader.addSource(
            new k7.FairyLoader('common'),
            new k7.FairyLoader('start'),
            new k7.FairyLoader('game'),
            new k7.FairyLoader('rank'),
            new k7.FairyLoader('end')
        );
        this._loader.preload();
    }
}