import {type Location} from "./get-location-from-pano";
import Pbfish from "@gmaps-tools/pbfish";
import SingleImageSearch from "./single-image-search.json";
import sleep from "./sleep";

const limit = 100;

/**
 * Gets the "unclickable" locations given a Streetview pano
 * @param	{Location[]}	locations	The locations which need to be checked for clickability.
 * @param	{number}		delay    How long should the delay be between locations?
 * @return	{Promise<Location[]>}	The unclikcable locations.
 */
export default async function getUnclickableLocations(locations: Location[], delay?: number): Promise<Location[]>{
	const pbfish = new Pbfish(SingleImageSearch);
	const baseUrl = "https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch";
	let unclickableLocations: Location[] = [];
	for(let i = 0; i <= locations.length / limit; i++){
		// Pause the program to avoid timeouts
		await sleep(delay);
		// Set up promises for chunking
		const promises = locations.slice(i * 100, (i+1) * 100).map(async (location: Location) => {
			const query = pbfish.create("SingleImageSearchRequest");
			// Set up search query
			query.value = {
				context: {
					productId: "apiv3"
				},
				location: {
					center:{
						lat: location.lat,
						lng: location.lng
					},
					radius: 5 // 5 metres is needed to ensure that coordinate jumps don't cause locations to be falsely included here
				},
				queryOptions: {
					clientCapabilities: {
						renderStrategy: [
							{
								frontend: "OFFICIAL",
								tiled: true,
								imageFormat: "OFFICIAL_FORMAT"
							}
						]
					},
					rankingOptions: {
						rankingStrategy: "CLOSEST"
					}
				},
				responseSpecification: {
					component: [
						"INCLUDE_DESCRIPTION",
						"INCLUDE_LINKED_PANORAMAS",
						"INCLUDE_COPYRIGHT"
					]
				}
			};
			// Returns a Promise that resolves to the location iff it is unclickable
			return fetch(baseUrl, {
				headers: {
					"Content-Type": "application/json+protobuf"
				},
				method: "POST",
				body: JSON.stringify(query.toArray())
			}).then(x => x.json()).then(x => {
				const response = pbfish.create("SingleImageSearchResponse");
				response.fromArray(x);
				// If there was no image found, the location is good to go
				if(response.status.code !== "OK") return Promise.resolve(location);
				// Pano ID based check, including linked locations
				const panoIds = [
					response.metadata.pano.id,
					...response.metadata.information[0].relations.map((x: {panoId: {id: string}}) => x.panoId.id)
				];
				if(!panoIds.includes(location.panoId)) return Promise.resolve(location);
				else return Promise.reject(undefined);
			});
		});
		// Get only the unclickable locations
		const returnedLocations: Location[] = (await Promise.allSettled(promises).then(results => results.map(res => {
			if(res.status !== "fulfilled") return undefined;
			else return res.value;
		}))).filter(x => x !== undefined);
		unclickableLocations = unclickableLocations.concat(returnedLocations);
		console.log(`Checked clickability for ${Math.min(i * limit, locations.length)} / ${locations.length} locations`);
	}
	return unclickableLocations;
}