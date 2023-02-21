import axios from "axios";
import ProgressBar from 'progress';
import fs from 'fs';
import chalk from 'chalk';
import Recording from "../recording/recording";
import {TrackData} from "../types";
import {Promise as NodeID3Promise} from "node-id3";

export default class DownloadService {


    async downloadTrack(track:TrackData, path: string, currTrack: number,totalTracks: number) {
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
            renderThrottle: 1,
            total: parseInt(totalLength)
        });

        const writer = fs.createWriteStream(path,{flags:'wx+'});

        // writer.on('error', (err) => {
        //     //assume type 2 jam, and therefore duplicate is actually just a continuation of the song...
        //     if(err.code === 'EEXIST') {
        //         path = this.getType2(path);
        //         return this.downloadTrack(url,path,title,currTrack,totalTracks);
        //     } else {
        //         throw err;
        //     }
        // })
        data.on('data', (chunk: string | any[]) => {
            progress.tick(chunk.length)
        })

        writer.on('close',() => {
            if(track.metadata) {
                NodeID3Promise.write(track.metadata,path)
                    .catch((err) => {
                        console.log(chalk.red(err));
                    });
            }
        });

        if(currTrack === totalTracks) {
            writer.on('finish', () => {
                console.log(chalk.green(`Finished!`));
            })
        }
        data.pipe(writer)
    }

    prepareAlbumDirName(artist: string, album: string): string {
        album = album.replace(/[/\\?%*:|"<>]/g, '_').trim();
        return `${artist}/${album}`
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

    removeAlbumImage(imagePath:string):boolean {
        fs.rm(imagePath,(err) => {
            console.log(chalk.red(err));
            return false;
        });
        return true;
    }
}