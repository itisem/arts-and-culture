export interface Location{
	lat: number;
	lng: number;
	heading: number;
	pitch: number;
	zoom: number;
	panoId: string;
	countryCode: string|null;
	stateCode: string|null;
	extra?: {
		tags?: string[];
	};
}

export default async function getLocationFromPano(panoId: string, apiKey: string, tags?: string[]): Promise<Location>{
	// Construct request URL
	const baseUrl = "https://maps.googleapis.com/maps/api/streetview/metadata";
	const params = {
		key: apiKey,
		pano: panoId
	};
	tags = (tags ?? []); // Ensuring that tags are doable normally
	// Get required data, pre-fill everything that MMA needs but we don't have
	try{
		return fetch(baseUrl + "?" + new URLSearchParams(params).toString()).then(x => x.json()).then(r => ({
			lat: r.location.lat,
			lng: r.location.lng,
			panoId,
			heading: 0,
			pitch: 0,
			zoom: 0,
			countryCode: null,
			stateCode: null,
			extra: {
				tags: [...tags, r.date],
				panoDate: r.date
			}
		}));
	}
	catch(e){
		throw new Error(panoId + " ::: " + tags.toString() + "\n" + e);
	}
}