import { Decoration, ParsedCommandWithParameters, SyntaxNodeRef } from "derobst/command";
import { ViewPluginContext } from "derobst/view";
import { PluginServices } from "main/PluginServices";
import { LocalPlayerWidget, FANTASY_REGEX } from "./LocalPlayerCommand";


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
		context.builder.add(commandNodeRef.from - 1, commandNodeRef.from - 1, Decoration.widget({ widget: new LocalPlayerWidget(context, this, configuredName, uri, `${this.parameters.cmd}`) }));
		context.builder.add(commandNodeRef.from, commandNodeRef.to, Decoration.mark({ attributes: { "class": "derammo-auto-hide" } }));
	}

	get regex(): RegExp {
		return FANTASY_REGEX;
	}

	static match(text: string): boolean {
		return text.match(FANTASY_REGEX) !== null;
	}
}
