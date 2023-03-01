import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { PluginServices } from "./PluginServices";

export interface Settings {
    exampleSetting: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    exampleSetting: true
};

export class SettingTab extends PluginSettingTab {
    constructor(app: App, plugin: Plugin, private services: PluginServices) {
		super(app, plugin);
	}

    display() {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Settings for derammo-soundsets-local Plugin' });

		new Setting(containerEl)
			.setName('Example Setting')
			.setDesc('An example boolean setting.  If true, then [describe what happens].')
			.addToggle(value => value
				.setValue(this.services.settings.exampleSetting)
				.onChange(async (value) => {
                    this.services.settings.exampleSetting = value;
                    await this.services.saveSettings();
				}));
    }
}