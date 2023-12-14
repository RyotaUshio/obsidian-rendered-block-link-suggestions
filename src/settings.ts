import { PluginSettingTab, Setting } from 'obsidian';
import EnhancedLinkSuggestionsPlugin from './main';


// Inspired by https://stackoverflow.com/a/50851710/13613783
export type KeysOfType<Obj, Type> = { [k in keyof Obj]: Obj[k] extends Type ? k : never }[keyof Obj];


export interface EnhancedLinkSuggestionsSettings {
	code: boolean;
	blockquote: boolean;
	heading: boolean;
	paragraph: boolean;
	callout: boolean;
	math: boolean;
	listItem: boolean;
	footnoteDefinition: boolean;
	element: boolean;
	table: boolean;
	comment: boolean;
	codeLines: number;
	blockquoteLines: number;
	paragraphLines: number;
	calloutLines: number;
	listItemLines: number;
	footnoteDefinitionLines: number;
	elementLines: number;
	tableLines: number;
	commentLines: number;
	dev: boolean;
	disableClose: boolean;
}

export const DEFAULT_SETTINGS: EnhancedLinkSuggestionsSettings = {
	code: true,
	blockquote: true,
	heading: true,
	paragraph: true,
	callout: true,
	math: true,
	listItem: true,
	footnoteDefinition: false,
	element: false,
	table: true,
	comment: true,
	codeLines: 0,
	blockquoteLines: 0,
	paragraphLines: 0,
	calloutLines: 0,
	listItemLines: 0,
	footnoteDefinitionLines: 0,
	elementLines: 0,
	tableLines: 0,
	commentLines: 0,
	dev: false,
	disableClose: false,
}

export class EnhancedLinkSuggestionsSettingTab extends PluginSettingTab {
	constructor(public plugin: EnhancedLinkSuggestionsPlugin) {
		super(plugin.app, plugin);
	}

	addToggleSetting(settingName: KeysOfType<EnhancedLinkSuggestionsSettings, boolean>, extraOnChange?: (value: boolean) => void) {
		return new Setting(this.containerEl)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings[settingName])
					.onChange(async (value) => {
						this.plugin.settings[settingName] = value;
						await this.plugin.saveSettings();
						extraOnChange?.(value);
					});
			});
	}

	addDropdowenSetting(settingName: KeysOfType<EnhancedLinkSuggestionsSettings, string>, options: string[], display?: (option: string) => string) {
		return new Setting(this.containerEl)
			.addDropdown((dropdown) => {
				const displayNames = new Set<string>();
				for (const option of options) {
					const displayName = display?.(option) ?? option;
					if (!displayNames.has(displayName)) {
						dropdown.addOption(option, displayName);
						displayNames.add(displayName);
					}
				};
				dropdown.setValue(this.plugin.settings[settingName])
					.onChange(async (value) => {
						// @ts-ignore
						this.plugin.settings[settingName] = value;
						await this.plugin.saveSettings();
					});
			});
	}

	addSliderSetting(settingName: KeysOfType<EnhancedLinkSuggestionsSettings, number>, min: number, max: number, step: number) {
		return new Setting(this.containerEl)
			.addSlider((slider) => {
				slider.setLimits(min, max, step)
					.setValue(this.plugin.settings[settingName])
					.setDynamicTooltip()
					.onChange(async (value) => {
						// @ts-ignore
						this.plugin.settings[settingName] = value;
						await this.plugin.saveSettings();
					});
			});
	}

	addHeading(heading: string) {
		return new Setting(this.containerEl).setName(heading).setHeading();
	}

	display(): void {
		this.containerEl.empty();

		this.addHeading('Paragraphs');
		this.addToggleSetting('paragraph').setName('Enable rendering');
		this.addSliderSetting('paragraphLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Headings');
		this.addToggleSetting('heading').setName('Enable rendering');

		this.addHeading('Callouts');
		this.addToggleSetting('callout').setName('Enable rendering');
		this.addSliderSetting('calloutLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines. You can render callout titles only by setting this to 1.');

		this.addHeading('Blockquotes');
		this.addToggleSetting('blockquote').setName('Enable rendering');
		this.addSliderSetting('blockquoteLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Code blocks');
		this.addToggleSetting('code').setName('Enable rendering');
		this.addSliderSetting('codeLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Math blocks');
		this.addToggleSetting('math').setName('Enable rendering');

		this.addHeading('List items');
		this.addToggleSetting('listItem').setName('Enable rendering');
		this.addSliderSetting('listItemLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Tables');
		this.addToggleSetting('table').setName('Enable rendering');
		this.addSliderSetting('tableLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Comments');
		this.addToggleSetting('comment').setName('Enable rendering');
		this.addSliderSetting('commentLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Footnote definitions');
		this.addToggleSetting('footnoteDefinition').setName('Enable rendering');
		this.addSliderSetting('footnoteDefinitionLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		this.addHeading('Elements');
		this.addToggleSetting('element').setName('Enable rendering');
		this.addSliderSetting('elementLines', 0, 10, 1)
			.setName('Maximum number of lines to render')
			.setDesc('Set to 0 to render all lines.');

		new Setting(this.containerEl).setName('Debug mode (advanced)').setHeading();

		this.addToggleSetting('dev')
			.setName('Log suggestion items to console')
			.setDesc('Show metadata about suggestion items in the dev console.');
		this.addToggleSetting('disableClose', (disable) => {
			const suggest = this.plugin.getBuiltInSuggest();
			if (!disable) suggest.close();
		}).setName('Prevent the suggestion box from closing')
			.setDesc('Useful for inspecting the suggestion box DOM.');
	}
}
