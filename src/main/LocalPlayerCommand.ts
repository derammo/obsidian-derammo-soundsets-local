import { WidgetType } from "@codemirror/view";
import { CommandWidgetBase, Decoration, EditorView, ParsedCommand, ParsedCommandWithParameters, SyntaxNodeRef } from "derobst/command";
import { WidgetContext } from "derobst/interfaces";
import { ViewPluginContext } from "derobst/view";
import { PluginServices } from "main/PluginServices";

import * as fs from "node:fs";
import * as tmp from "tmp";

const FANTASY_REGEX = /^\s*!syrinscape-fantasy(?:\s(.*))?$/;

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
				const parseName = this.resource.match(/\/([^/]+)\/$/);
				if (parseName !== null) {
					button.innerText = parseName[1];
				} else {
					button.innerText = 'play';
				}
			}
		}
	}

	locateCommandFolder(): Promise<string | null> {
		const guess = `${process.env.HOME}/Library/Application Support/com.syrinscape.SyrinscapeFantasyPlayer/URI`;
		return fs.promises.stat(guess)
			.then((stats: fs.Stats) => {
				if (stats.isDirectory()) {
					return guess;
				}
				return null;
			})
		.catch((err: Error) => {
			console.debug(`Could not find local player folder at ${guess}: ${err.message}`);
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

export class FantasyCommand extends ParsedCommandWithParameters<PluginServices> {
	constructor() {
		super();
	}

	get protocol(): string {
		return "syrinscape-fantasy";
	}

	buildWidget(context: ViewPluginContext<PluginServices>, commandNodeRef: SyntaxNodeRef): void {
		// reconstitute the URI we represent, so we can look up sound info
		const uri = `${this.protocol}:${this.parameters.cmd}`;
		let configuredName: string | undefined;
		if (typeof this.parameters.name == "string") {
			configuredName = this.parameters.name;
		}
		context.builder.add(commandNodeRef.from-1, commandNodeRef.from-1, Decoration.widget({ widget: new LocalPlayerWidget(context, this, configuredName, uri, `${this.parameters.cmd}`) }));
		context.builder.add(commandNodeRef.from, commandNodeRef.to, Decoration.mark({ attributes: { "class": "derammo-auto-hide" } }));
	}

	get regex(): RegExp {
		return FANTASY_REGEX;
	}

	static match(text: string): boolean {
		return text.match(FANTASY_REGEX) !== null;
	}
}
