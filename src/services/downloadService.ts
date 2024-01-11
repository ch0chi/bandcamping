import axios from "axios";
import ProgressBar from 'progress';
import fs, {WriteStream} from 'fs';
import chalk from 'chalk';
import Recording from "../recording/recording";
import {TrackData,NodeSystemError} from "../types";
import {Promise as NodeID3Promise} from "node-id3";
import RecordingPath from "../recording/recordingPath";

export default class DownloadService {

    async downloadTrack(recordingPath: RecordingPath,track: TrackData, currTrack: number,totalTracks: number){
        const { data, headers } = await axios({
            url:track.streamUrl,
            method: 'GET',
            responseType: 'stream'
        });
        const totalLength = headers['content-length'];
        const progress = new ProgressBar(`-> downloading ${track.title} (${currTrack}/${totalTracks}) [:bar] :percent :etas`, {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 16,
            total: parseInt(totalLength)
        });

        data.on('data', (chunk: string | any[]) => {
            progress.tick(chunk.length)
        });

        try{
            await fs.promises.writeFile(recordingPath.getTrackPath(track),data,{flag:'wx+'});
        }
        catch(error){
            const err = error as NodeSystemError;
            //assume type 2 jam, and therefore duplicate is actually just a continuation of the song...
            if(err.code === 'EEXIST') {
                track.title = this.getType2(track);
                await this.downloadTrack(recordingPath,track,currTrack,totalTracks);
            }
            else {
                console.trace();
                throw err;
            }
        }

        if(track.metadata) {
            NodeID3Promise.write(track.metadata,recordingPath.getTrackPath(track))
                .catch((err) => {
                    console.trace();
                    console.log(chalk.red(err));
                });
        }

        if(currTrack === totalTracks) {
            console.log(chalk.green(`Finished!`));
            console.log(chalk.cyan("Cleaning up..."));
            await this.removeAlbumImage(recordingPath.getAlbumImagePath());
        }

    }

    /**
     *If song is a type 2 jam, there will be multiple song titles with the same name.
     *We handle type 2 jams by appending a [n] to the end of the song title. Where n represents the
     * number of times that song occurs. (i.e. Lawn Boy, Crosseyed and Painless, Lawn Boy [2])
     * This function will check for the last occurrence of [n], update the occurrence so that [n] is [n + 1].
     * If no [n] match found, returns [2].
     *
     *///todo refactor this a bit
    getType2(track:TrackData) {
        const rawSong = track.title;
        const reg = /\[+[^\]]*]*(?!.*\[)/; //checks for last occurrence of []
        let matched = rawSong.match(reg);
        if(matched) {
            matched = matched[0].match(/\d+/);
            if(matched) {
                const occurrence = parseInt(matched[0]);
                const rawName = rawSong.split(`[${occurrence}]`)[0];
                const updatedOccurrence = occurrence + 1;
                return `${rawName}[${updatedOccurrence}].mp3`;
            }
            //looks like there was a string in the match... return original song string
            return track.title;
        }
        return `${rawSong} [2]`;
    }

    async createFolder(dir: string): Promise<boolean> {
        if (!fs.existsSync((dir))) {
            try {
                await fs.promises.mkdir(dir);
                console.log(chalk.green(`Created new directory in ${chalk.underline(dir)}`));
                return true;
            } catch (e) {
                throw new Error(`Error creating ${dir}`);
            }
        } else {
            console.log(chalk.yellow(`Did not create ${chalk.underline(dir)}. The directory already exists!`));
        }
        return false;
    }

    async saveAlbumImage(imageUrl:string,imagePath:string):Promise<void> {
        const {data} = await axios({
            url:imageUrl,
            method:'GET',
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(imagePath,{flags:'wx+'});
        data.pipe(writer);
    }

    async removeAlbumImage(imagePath:string):Promise<void> {
        await fs.promises.rm(imagePath);
    }
}