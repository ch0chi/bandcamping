import Recording from "./recording/recording";
import {RecordingParser} from "./recording/recordingParser";
import * as fs from 'fs';
import DownloadService from "./services/downloadService";
import axios from "axios";
import chalk from 'chalk';
import {TrackData, DomTrackInfo} from "./types";
import RecordingPath from "./recording/recordingPath";


export class BandCamp{

    recording:Recording;

    downloadService:DownloadService;

    constructor() {
        this.recording = new Recording();
        this.downloadService = new DownloadService();
    }

    async main() {

        const args = process.argv;
        const albumUrl:string = args[2];


        const baseDir = process.env.BASE_DIR;
        await this.parseTracksFromHtml(albumUrl);

        const tracks = this.recording.tracks;
        const releaseDate = new Date(this.recording.releaseDate);

        console.log(chalk.cyan(
            `Download initiated for ${this.recording.artistName} - ${this.recording.albumName}...`)
        );

        if(typeof baseDir !== 'string') {
            console.log(chalk.red(`Error creating directories. No baseDir path specified.`));
            process.exit();
        }

        const recordingPath = new RecordingPath(baseDir,this.recording);

        try{
            await this.downloadService.createFolder(recordingPath.getArtistDirPath());
            await this.downloadService.createFolder(recordingPath.getAlbumDirPath());
            await this.downloadService.saveAlbumImage(this.recording.albumImage,recordingPath.getAlbumImagePath());
        } catch(e) {
            console.log(chalk.red(e));
            console.log(chalk.red("Exiting..."))
            process.exit();
        }

        let currTrack = 1;

        for(let track of tracks){
            track.metadata = {
                title:track.title,
                artist:this.recording.artistName,
                album:this.recording.albumName,
                image:recordingPath.getAlbumImagePath(),
                trackNumber:''+ track.trackNum,
                date:`${releaseDate.getDate()}${releaseDate.getMonth() + 1}`,
                year:''+releaseDate.getFullYear()
            }
            try{
                await this.downloadService.downloadTrack(
                    recordingPath,
                    track,
                    currTrack,
                    tracks.length
                );
                currTrack++;
            }
            catch(err) {
                console.log(chalk.red(`Error downloading track! ${err}`));
            }
        }
    }

    async parseTracksFromHtml(albumUrl:string) {
        let rawHtml = await axios.get(albumUrl);
        const parser = new RecordingParser(rawHtml.data,this.recording);
        parser.parseDom();
    }
}