import {TrackData} from "../types";

export default class Recording {

    private _artistName= "";
    private _albumName = "";
    private _albumImage = "";
    private _releaseDate = "";
    private _tracks: TrackData[] = [];

    get artistName(): string {
        return this._artistName;
    }

    set artistName(value: string) {
        this._artistName = value;
    }

    get albumName(): string {
        return this._albumName;
    }

    set albumName(value: string) {
        //Remove ', By {artist name}
        let lastCommaIdx = value.lastIndexOf(',');
        this._albumName = value.slice(0, lastCommaIdx);
    }

    get albumImage(): string {
        return this._albumImage;
    }

    set albumImage(value: string) {
        this._albumImage = value;
    }

    set releaseDate(value: string) {
        this._releaseDate = value;
    }

    get releaseDate():string {
        return this._releaseDate;
    }

    get tracks(): TrackData[] {
        return this._tracks;
    }

    set tracks(value: TrackData[]) {
        this._tracks = value;
    }
}