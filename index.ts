import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import fs from "node:fs";
import "dotenv/config";
import getStreetview from "./get-streetview";
import getUnclickableLocations from "./get-unclickable-locations";

let apiKey = process.env.API_KEY;

console.warn = () => {}; // Hide pbfish warnings. Nasty, but works

async function streetviewInterface(): Promise<string>{
	// Create a readline interface to be used while retrieving input/output
	const rl = readline.createInterface({input, output});
	// Get api key if it's not set in .env
	if(!apiKey) apiKey = await rl.question("Please enter a Google Maps API key: ");
	// Get search term
	const query = (await rl.question("Please enter your search term (may be empty): ")).trim();
	// Do we only retrieve unclickable locations?
	const unclickableOnly = (await rl.question("Unclickable locations only? (y/n, default n): ")).trim().toLowerCase() === "y";
	// Search
	console.log("Getting all Streetview results -- please be patient, this may take a while");
	let streetview = await getStreetview(query, apiKey, 1000);
	// Get only the unclickable locations if we have specified so
	if(unclickableOnly) streetview = await getUnclickableLocations(streetview);
	// Write file
	const filename = (query === "") ? "_.json" : query.replaceAll(/\s/g, "_") + ".json";
	fs.writeFileSync(filename, JSON.stringify(streetview));
	return filename;
}

streetviewInterface().then(x => {
	console.log(`Output saved as ${x}`);
	process.exit();
});