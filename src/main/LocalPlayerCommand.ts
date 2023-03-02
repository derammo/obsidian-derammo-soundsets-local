import { WidgetType } from "@codemirror/view";
import { CommandWidgetBase, EditorView, ParsedCommand } from "derobst/command";
import { WidgetContext } from "derobst/interfaces";
import { PluginServices } from "main/PluginServices";

import * as fs from "node:fs";
import * as tmp from "tmp";

export const FANTASY_REGEX = /^\s*!syrinscape-fantasy(?:\s(.*))?$/;

export class LocalPlayerWidget extends CommandWidgetBase<PluginServices> {
	constructor(context: WidgetContext<PluginServices>, command: ParsedCommand<PluginServices>, protected name: string | undefined, protected uri: string, protected resource: string) {
		super(context, command);
	}

	toDOM(_view: EditorView): HTMLElement {
		const container = document.createElement('span');
		container.classList.add('derammo-localplayer-container');
		const button = document.createElement('button');
		button.classList.add('derammo-button', 'derammo-localplayer-button');
		this.calculateLabel(button);
		this.host.registerDomEvent(button, 'click', this.onClick.bind(this));			
		this.host.registerDomContextMenuTarget(button, this.command);
		container.appendChild(button);
		return container;
	}

	private onClick() {
		// do this without waiting for completion
		this.locateCommandFolder()
			.then((folder: string | null) => {
				if (folder === null) {
					console.log('Could not locate command folder; sound command not sent.');
					return;
				}
				tmp.file({ keep: true, detachDescriptor: true }, (err: Error | null, path: string, fd: number, _cleanupCallback: () => void) => {
					if (err !== null) {
						throw err;
					}
					fs.write(fd, this.resource, (err: Error | null) => {
						if (err !== null) {
							throw err;
						}
						fs.close(fd, (err: Error | null) => {
							if (err !== null) {
								throw err;
							}
							fs.rename(path, `${folder}/derammo-soundsets-local`, (err: Error | null) => {
								if (err !== null) {
									throw err;
								}
							});
						});
					});
				});
			});
	}

	private calculateLabel(button: HTMLButtonElement) {
		if (this.name !== undefined) {
			button.innerText = this.name;
		} else {
			const info = this.host.fetchSoundInfo(this.uri);
			if (info !== null) {
				button.innerText = info.name;
			} else {
				// no sound info, just name it something default
				const parseName = this.resource.match(/(?:\/|^)([^/]+)\/$/);
				if (parseName !== null) {
					button.innerText = parseName[1].replace("-", " ");
				} else {
					button.innerText = 'play';
				}
			}
		}
	}

	locateCommandFolder(): Promise<string | null> {
		return this.checkPath(`${process.env.HOME}/Library/Application Support/com.syrinscape.SyrinscapeFantasyPlayer/URI`)
			.then((guess: string | null) => {
				if (guess !== null) {
					return guess;
				}
				return this.checkPath(`${process.env.LOCALAPPDATA}Low/Syrinscape/Syrinscape Fantasy Player/URI`);
			});
	}

	private checkPath(guess: string): Promise<string | null> {
		return fs.promises.stat(guess)
			.then((stats: fs.Stats) => {
				if (stats.isDirectory()) {
					return guess;
				}
				return null;
			})
			.catch((_err: Error) => {
				return null;
			});
	}

	eq(widget: WidgetType): boolean {
		if (!(widget instanceof LocalPlayerWidget)) {
			return false;
		}

		// XXX need to handle recreating everything if the index info changes by serial number
		return false;

		// return widget.uri == this.uri
	}
}

