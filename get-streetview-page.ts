import Pbfish from "@gmaps-tools/pbfish";
import GetStreetviewPage from "./get-streetview-page.json";

export interface GetStreetviewPageResult{
	count?: number;
	cursor?: string;
	items: StreetviewItem[];
}

export interface StreetviewItem{
	name: string;
	preview: string;
	url: string;
	id: string;
}

/**
 * Returns a page for a Streetview query.
 * @param	{string}	query	The query string
 * @param	{number}	limit	The number of items per page
 * @param	{string}	cursor	The pagination cursor
 * @return	{Promise<GetStreetviewPageResult>}	The search results
 */
export default async function getStreetviewPage(query: string, limit?: number, cursor?: string): Promise<GetStreetviewPageResult>{
	// Construct the request
	const baseUrl = "https://artsandculture.google.com/api/assets/streetview";
	const queryData = {
		q: query,
		s: (limit ?? 100).toString(),
		hl: "en-GB",
		_reqid: Math.ceil(Math.random() * (10 ** 9)).toString().padStart(9, "0"),
		rt: "j", // Unsure what this does
		pt: cursor ?? ""
	};
	const res = await fetch(baseUrl + "?" + new URLSearchParams(queryData).toString()).then(r => r.text());
	// The response starts with some weird data, only get the JSON part
	const resParts = res.split("\n");
	// Parse everything
	const pbfish = new Pbfish(GetStreetviewPage);
	const result = pbfish.create("GetStreetviewPageResult");
	result.fromJSON(resParts[resParts.length - 1]);
	// Return only the relevant data
	return {
		count: result.page.result.totalItemCount,
		cursor: result.page.result.cursor,
		items: result.page.result.items.map((x: any) => ({
			name: x.name,
			preview: x.preview,
			url: x.urlEnding,
			id: x.museum?.id
		}))
	};
}