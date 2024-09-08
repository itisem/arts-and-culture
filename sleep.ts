const defaultDelay = 500;

/**
 * Halts the program for a specified amount of time to avoid timeouts.
 * @param	{number}	delay	The time for which the program is halted.
 */
export default async function sleep(delay?: number){
	delay = delay ?? defaultDelay;
	if(delay) await new Promise(r => setTimeout(r, delay));
}