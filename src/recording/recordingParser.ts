import {ChildNode, DomHandler} from 'domhandler';
import * as domutils from "domutils";
import Recording from "./recording";
import {ElementType} from "domelementtype";
import {Parser} from "htmlparser2";
import {DomTrackInfo, TrackData} from "../types";
import {hasAttrib, textContent, getAttributeValue} from "domutils";
import {Element} from "domhandler";

export class RecordingParser {

    dom: string;
    recording: Recording

    constructor(dom: string, recording: Recording) {
        this.dom = dom;
        this.recording = recording;
    }

    parsingHandler(): DomHandler {
        return new DomHandler((error, dom) => {
            if (error) {
                console.log(error);
            } else {
                const metaTags = domutils.getElementsByTagName('meta', dom);
                for (const metaTag of metaTags) {
                    let attrVal = domutils.getAttributeValue(metaTag, 'property');
                    if (attrVal === 'og:title') {
                        this.recording.albumName = metaTag.attribs.content;
                    }
                    if (attrVal === 'og:image') {
                        this.recording.albumImage = metaTag.attribs.content;
                    }
                    if (attrVal === 'og:site_name') {
                        this.recording.artistName = metaTag.attribs.content;
                    }
                }

                const items = domutils.getElementsByTagType(ElementType.Script, dom);
                for (const item of items) {

                    if ('attribs' in item && item.attribs && item.attribs['data-tralbum']) {

                        let albumInfo = JSON.parse(item.attribs['data-tralbum']);
                        let trackInfo = albumInfo['trackinfo'];
                        this.recording.tracks = this.parseTrackInfo(trackInfo);
                    }
                }

                //Get release date
                let trackInfoElement = domutils.getElementById('trackInfoInner', dom);
                let trackInfoChildren:ChildNode[] = [];
                if(trackInfoElement instanceof Element) {
                    trackInfoChildren = trackInfoElement.children;
                }
                for(const childElement of trackInfoChildren) {
                    let className:string|undefined = "";
                    if (childElement instanceof Element) {
                        className = getAttributeValue(childElement, 'class');
                    }
                    if(className && className.includes('tralbum-credits')){
                        let contents = textContent(childElement).trim().split(/\r?\n/);
                        if(contents[0]) {
                            this.recording.releaseDate = contents[0].trim().split('released')[1]
                        }
                    }
                }

            }

        });
    }

    parseTrackInfo(trackInfo:DomTrackInfo[]):TrackData[] {

        let tracks:TrackData[] = [];
        for(const track of trackInfo) {
            if(track['track_num'] !== undefined) {
                let trackTitle = track.title;
                let streamUrl = track.file['mp3-128'];
                let trackNum = track['track_num'];
                tracks.push({
                    title:trackTitle,
                    streamUrl:streamUrl,
                    trackNum:trackNum
                })
            }
        }
        return tracks;
    }

    parseDom(){
        const parser = new Parser(this.parsingHandler());
        parser.write(this.dom);
        parser.end();
    }
}