import Recording from "./recording/recording";
import {RecordingParser} from "./recording/recordingParser";
import * as fs from 'fs';
import DownloadService from "./services/downloadService";
import axios from "axios";
import chalk from 'chalk';
import {TrackData, DomTrackInfo} from "./types";


export class BandCamp{

    recording:Recording;

    downloadService:DownloadService;

    albumUrl='https://billystrings.bandcamp.com/album/me-and-dad';

    constructor() {
        this.recording = new Recording();
        this.downloadService = new DownloadService();
    }

    async downloadTracks() {

        await this.parseTracksFromHtml();

        const tracks = this.recording.tracks;
        const album = this.recording.albumName;
        const artist = this.recording.artistName;
        const releaseDate = new Date(this.recording.releaseDate);

        console.log(chalk.cyan(`Download initiated for ${artist} - ${album}...`));

        const baseDir = process.env.BASE_DIR;

        const artistDirName = `${baseDir}${artist.trim()}`;
        const albumDirName = this.downloadService.prepareAlbumDirName(artistDirName,album);
        const albumImagePath = `${albumDirName}/albumArt.jpeg`;

        try{
            await this.downloadService.createFolder(artistDirName);
            await this.downloadService.createFolder(albumDirName);
            await this.downloadService.saveAlbumImage(this.recording.albumImage,albumImagePath);
        } catch(e) {
            console.log(chalk.red(e));
            console.log(chalk.red("Exiting..."))
            process.exit();
        }

        let currTrack = 1;
        for(let track of tracks){
            const fileName = `${albumDirName}/${track.title}.mp3`;
            track.metadata = {
                title:track.title,
                artist:artist,
                album:album,
                image:albumImagePath,
                trackNumber:''+ track.trackNum,
                date:`${releaseDate.getDate()}${releaseDate.getMonth() + 1}`,
                year:''+releaseDate.getFullYear()
            }
            try{
                await this.downloadService.downloadTrack(
                    track,
                    fileName,
                    currTrack,
                    tracks.length
                );
                currTrack++;
            }
            catch(err) {
                console.log(chalk.red(`Error downloading track! ${err}`));
            }

        }
        //todo remove album art after download finishes
    }


    async parseTracksFromHtml() {
        //const rawHtml = fs.readFileSync('./src/bandcamp.html','utf8');
        let rawHtml = await axios.get(this.albumUrl);
        const parser = new RecordingParser(rawHtml.data,this.recording);
        parser.parseDom();
    }
}