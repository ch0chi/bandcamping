import Recording from "./recording";
import {TrackData} from "../types";
export default class RecordingPath {

    private readonly _baseDir:string;
    private _recording:Recording;

    public constructor(baseDir:string,recording:Recording) {
        this._baseDir = this.formatDirPath(baseDir);
        this._recording = recording;
    }

    public getArtistDirPath():string {
        return `${this._baseDir}${this._recording.artistName}`;
    }

    public getAlbumDirPath():string {
        let album = this.sanitize(this._recording.albumName).trim();
        return `${this._baseDir}${this._recording.artistName}/${album}`
    }

    public getAlbumImagePath():string {
        return `${this.getAlbumDirPath()}/albumArt.jpg`;
    }

    public getTrackPath(track:TrackData):string{
        return `${this.getAlbumDirPath()}/${this.sanitize(track.title)}.mp3`;
    }

    public formatDirPath(dirPath:string):string{
        const lastChar = dirPath.slice(-1);
        if(lastChar === '/'){
            return dirPath;
        }
        return `${dirPath}/`;
    }

    public sanitize(value:string):string {
        return value.replace(/[/\\?%*:|"<>]/g,'_');
    }
}