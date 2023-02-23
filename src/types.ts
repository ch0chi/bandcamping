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

//Typescript doesn't have Node's system error types. This is a partial definition list to overcome that.
//See https://gist.github.com/reporter123/7c10e565fb849635787321766b7f8ad8
interface NodeSystemError extends Error{
    address?: string; //If present, the address to which a network connection failed
    code:string;// The string error code
    dest:string;// If present, the file path destination when reporting a file system error
    errno:number;// The system-provided error number
    info?:Object;// If present, extra details about the error condition
    message:string;// A system-provided human-readable description of the error
    path?:string;// If present, the file path when reporting a file system error
    port?:number;// If present, the network connection port that is not available
    syscall:string;// The name of the system call that triggered the error
}
export type {NodeSystemError}