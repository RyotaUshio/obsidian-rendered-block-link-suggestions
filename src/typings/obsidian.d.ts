import { UserEvent } from 'obsidian';

export interface Suggestions<T> {
    selectedItem: number;
    values: T[];
    setSelectedItem(index: number, event: UserEvent | null): void;
}

declare module "obsidian" {
    interface PopoverSuggest<T> {
        suggestions: Suggestions<T>;
    }

    interface SuggestModal<T> {
        chooser: Suggestions<T>;
    }
}