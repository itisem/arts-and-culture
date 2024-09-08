import getStreetviewPage, {type GetStreetviewPageResult} from "./get-streetview-page";
import {type Location} from "./get-location-from-pano";
import getLocationsFromItems from "./get-locations-from-items";

const limit = 100;
const defaultDelay = 1000;

/**
 * Returns an object representing Streetview locations in the format of a Geoguessr-importable JSON
 * @param	{string}	query	The query string to search for
 * @param	{string}	apiKey	The Google Maps API key being used to resolve pano IDs
 * @param	{number}	delay	The delay between each page
 * @param	{boolean}	addTags	Should there be a tag added representing the location's name?
 * @return	{Promise<Location[]>}	A list of locations that can easily be converted into a Geoguessr-importable JSON
 */
export default async function getStreetview(query: string, apiKey: string, delay?: number, addTags?: boolean): Promise<Location[]>{
	if(!apiKey) throw new Error("Please set an api key in the .env file before running this program");
	// Get the first page and its locations
	let {count, cursor, items}: GetStreetviewPageResult = await getStreetviewPage(query, limit);
	let locations: Location[] = await getLocationsFromItems(items, apiKey, addTags);
	if(count === 0) return [];
	delay = delay ?? defaultDelay;
	let pageCount = 1;
	while(cursor){
		console.log(`${pageCount * limit} / ${count} locations completed`);
		if(delay) await new Promise(r => setTimeout(r, delay)); // Sleep in order to ensure that no timeout occurs
		// As long as there is a cursor, we can move onto the next page safely
		const res = await getStreetviewPage(query, limit, cursor);
		cursor = res.cursor;
		locations = locations.concat(await getLocationsFromItems(res.items, apiKey, addTags));
		pageCount += 1;
	}
	console.log(`${count} / ${count} locations completed`);
	return locations;
}