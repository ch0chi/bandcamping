import {BandCamp} from "./bandcamp";
import * as dotenv from 'dotenv'
dotenv.config()
const bandCamp = new BandCamp();

(async() => {
   await bandCamp.downloadTracks();
})();