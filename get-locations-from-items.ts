import {type StreetviewItem} from "./get-streetview-page";
import getLocationFromPano, {type Location} from "./get-location-from-pano"; 

export default async function getLocationsFromItems(items: StreetviewItem[], apiKey: string, addTags?: boolean): Promise<Location[]>{
	const promises = items.map(item => {
		// The item preview is required for getting the pano ID, reject if not present
		if(!item.preview) return Promise.reject(undefined);
		// Get the pano id, reject if not present
		const params = new URLSearchParams(item.preview);
		const panoId = params.get("pano");
		if(!panoId) return Promise.reject(undefined);
		// Add the location name as a tag if necessary
		const tags = addTags ? [item.name] : [];
		// Run the query
		return getLocationFromPano(panoId, apiKey, tags);
	});
	const locations = await Promise.allSettled(promises).then(results => results.map(res => {
		if(res.status !== "fulfilled") return undefined; // Errors are (almost) always the result of Google messing something up, safe to ignore
		else return res.value;
	}));
	return locations.filter(x => x !== undefined);
}