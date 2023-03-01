import { CommandDispatcher, CommandViewPlugin } from "derobst/command";
import { ObsidianPluginBase } from "derobst/main";
import { PluginServices, SoundInfo } from "main/PluginServices";

import { Settings, DEFAULT_SETTINGS, SettingTab } from "main/Settings";
import { TFile } from "obsidian";
import { FantasyCommand } from "./src/main/LocalPlayerCommand";

import * as fs from "node:fs";
import { parse} from "csv-parse";

export default class ObsidianPlugin extends ObsidianPluginBase<Settings> implements PluginServices {
	commands: CommandDispatcher<PluginServices> = new CommandDispatcher<PluginServices>();
	index: Map<string, SoundInfo> = new Map<string, SoundInfo>();

	async onload() {
		await this.loadSettings(DEFAULT_SETTINGS);
		this.registerTextRangeTracker();
		this.commands.registerCommand(FantasyCommand);
		this.registerViewPlugin(createCommandsPlugin(this));
		this.addSettingTab(new SettingTab(this.app, this, this));
		this.app.vault.on("create", (file) => {
			if (!(file instanceof TFile)) {
				return;
			}
			if (file.extension !== "csv") {
				return;
			}
			if (!file.name.startsWith("syrinscape_remote_control_links_")) {
				return;
			}
			this.createIndex(file);
		});
	}

	// this async streams in a lot of records
	private createIndex(file: TFile) {
		// gross hack because we can't stream with Obsidian API
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const path = `${(this.app.vault.adapter as any).basePath}/${file.path}`;
		fs.createReadStream(path)
			.pipe(parse({ delimiter: ",", columns: true }))
			.on("data", (row) => {
				this.index.set(row.genre_players_play_url, row);
			})
			.on("end", () => {
				// invalidate all view decorations
				this.app.workspace.updateOptions();
			});
	}

	fetchSoundInfo(playUri: string): SoundInfo | null {
		return this.index.get(playUri) ?? null;
	}

	onunload() {
		// no code
	}    
}

function createCommandsPlugin(host: PluginServices) {
	return class extends CommandViewPlugin<PluginServices> {
		getPlugin(): PluginServices {
			return host;
		}
	}	
}