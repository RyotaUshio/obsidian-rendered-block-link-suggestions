import { MarkdownRenderer, Plugin } from 'obsidian';
import { around } from 'monkey-around';

import { DEFAULT_SETTINGS, EnhancedLinkSuggestionsSettings, EnhancedLinkSuggestionsSettingTab } from 'settings';
import { extractFirstNLines, render } from 'utils';
import { BuiltInSuggest, BuiltInSuggestItem } from 'typings/suggest';


export default class EnhancedLinkSuggestionsPlugin extends Plugin {
	settings: EnhancedLinkSuggestionsSettings;

	async onload() {
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new EnhancedLinkSuggestionsSettingTab(this));
		this.app.workspace.onLayoutReady(() => this.patchBuiltInSuggest());
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getBuiltInSuggest(): BuiltInSuggest {
		// @ts-ignore
		return this.app.workspace.editorSuggest.suggests[0];
	}

	patchBuiltInSuggest() {
		const suggest = this.getBuiltInSuggest();
		const plugin = this;
		const app = this.app;

		this.register(around(suggest.constructor.prototype, {
			renderSuggestion(old) {
				return function (item: BuiltInSuggestItem, el: HTMLElement) {
					old.call(this, item, el);

					if (plugin.settings.dev) console.log(item);

					el.setAttribute('data-item-type', item.type);

					if (item.type === "block") {
						el.setAttribute('data-item-node-type', item.node.type);

						if (plugin.settings[item.node.type] === false) return;

						let text = item.content.slice(item.node.position.start.offset, item.node.position.end.offset);
						let limit: number | undefined = (plugin.settings as any)[item.node.type + 'Lines'];
						if (limit) text = extractFirstNLines(text, limit);

						if (item.node.type === "comment") {
							render(el, (containerEl) => {
								containerEl.setText(text);
							});
							return;
						}

						render(el, async (containerEl) => {
							containerEl.setAttribute('data-line', item.node.position.start.line.toString());
							await MarkdownRenderer.render(app, text, containerEl, item.file.path, this.manager);
							containerEl.querySelectorAll('.copy-code-button').forEach((el) => el.remove());
						});
					}
				}
			},
			close(old) {
				return function () {
					if (plugin.settings.disableClose) return;
					old.call(this);
				}
			}
		}));
	}
}
