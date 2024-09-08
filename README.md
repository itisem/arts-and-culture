# Google arts and culture collector

This script retrieves every Streetview result for a given search term on Google Arts And Culture, and saves them as a JSON file which can be imported into [map-making.app](https://map-making.app) or Geoguessr.

## Usage

Run `npm install` to install all dependencies, and `npm run get` to start collecting data. The script will prompt you for your search query.

If you want to make your life easier, create a `.env` file with `API_KEY` set to a valid Google Maps API key with access to the [Streetview Image Metadata](https://developers.google.com/maps/documentation/streetview/metadata) endpoint of the Streetview Static API.