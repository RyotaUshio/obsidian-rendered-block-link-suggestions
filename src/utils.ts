export function extractFirstNLines(text: string, n: number) {
	const lines = text.split('\n');
	return lines.slice(0, n).join('\n');
}

export function render(el: HTMLElement, cb: (containerEl: HTMLElement) => void) {
	const titleEl = el.querySelector<HTMLElement>('.suggestion-title');
	if (titleEl) {
		const containerEl = createDiv({cls: ['markdown-preview-view', 'markdown-rendered']});
		titleEl.replaceChildren(containerEl);
		cb(containerEl);
	};
}
