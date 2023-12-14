import { Component, MarkdownRenderer, Plugin, UserEvent } from 'obsidian';
import { around } from 'monkey-around';

import { DEFAULT_SETTINGS, EnhancedLinkSuggestionsSettings, EnhancedLinkSuggestionsSettingTab } from 'settings';
import { extractFirstNLines, render } from 'utils';
import { BuiltInSuggest, BuiltInSuggestItem } from 'typings/suggest';
import { Suggestions } from 'typings/obsidian';


export default class EnhancedLinkSuggestionsPlugin extends Plugin {
	settings: EnhancedLinkSuggestionsSettings;

	async onload() {
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new EnhancedLinkSuggestionsSettingTab(this));
		this.app.workspace.onLayoutReady(() => {
			this.patchBuiltInSuggest();
			this.patchSetSelectedItem();
		});
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
							await MarkdownRenderer.render(app, text, containerEl, item.file.path, this.renderedBlockLinkSuggestionsComponent);
							containerEl.querySelectorAll('.copy-code-button').forEach((el) => el.remove());
						});
					}
				}
			},
			open(old) {
				return function () {
					if (!this.renderedBlockLinkSuggestionsComponent) this.renderedBlockLinkSuggestionsComponent = new Component();
					this.renderedBlockLinkSuggestionsComponent.load();
					old.call(this);
				}
			},
			close(old) {
				return function () {
					if (plugin.settings.disableClose) return;
					old.call(this);
					this.renderedBlockLinkSuggestionsComponent?.unload();
				}
			}
		}));
	}

	patchSetSelectedItem() {
		const plugin = this;

		const suggest = this.getBuiltInSuggest();
		this.register(around(suggest.suggestions.constructor.prototype, {
			setSelectedItem(old) {
				return function (index: number, event: UserEvent | null) {
					const self = this as Suggestions<BuiltInSuggestItem>;
					old.call(self, index, event);
					if (plugin.settings.dev) console.log(self.values[self.selectedItem]);
				}
			}
		}));
	}
}
