import { MinimalCommandHost } from "derobst/interfaces";
import { Settings } from "./Settings";

export interface SoundInfo {
	genre_players_play_url: string;
	genre_players_stop_url: string;
	id: string;
	name: string;
	soundset: string;
	status: string;
	subcategory: string;
	type: string; 
}


/**
 * Functionality that this Obsidian plugin provides to its commands, views, and other components.
 */
export interface PluginServices extends MinimalCommandHost<PluginServices> {
    /**
     * Access to current settings, valid since only shared after onLoad();
     */
    settings: Settings;

    fetchSoundInfo(playUri: string): SoundInfo | null;
}
