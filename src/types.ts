import {Tags as ID3Tags} from "node-id3";

export type DomTrackInfo = {
    title:string,
    track_num:number,
    file:{
        'mp3-128':string
    }
}

export type TrackData = {
    title:string,
    streamUrl:string,
    trackNum:number,
    metadata?:MetaDataTags
}

export interface MetaDataTags extends ID3Tags{
    title:string,
    artist:string,
    album:string,
    image:string,
    trackNumber:string,
    date:string,
    year:string,
}