# Bandcamping - A bandcamp CLI album downloader.

Additional documentation and updates to come. However, If you'd like to try it out now you can follow the steps below.

## Setup
 1. Copy .env.example into a new .env file
	 1. `cp .env.example .env`
 2. Update the `BASE_DIR` env variable to the directory where you want your music stored.
 3. Run `npm install`

## Downloading an album
 1. Go to [bandcamp.com](https://bandcamp.com) and find the album you want to download.
 2. Copy the album url from the browser's address bar.
 3. Download the album by running  `npm start {album url}` 
	 1. An example would be `npm start https://goosetheband.bandcamp.com/album/2023-12-08-goosemas-x-hampton-coliseum-hampton-va` 
	 2. The command must be ran inside the project root (where the `package.json` file is located)