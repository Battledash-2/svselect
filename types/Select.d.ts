import { SvelteComponentTyped } from 'svelte';

interface Param {
	label: string;
	key: string | number;
	custom?: boolean;
}

interface SelectParams {
	options?: Param[];
	multiple?: boolean;
	allowcreate?: boolean;
	hideselected?: boolean;
	onChange?: (
		newValue: Param[] | Param,
		oldValue: Param[] | Param
	) => boolean;
	selected?: Param[] | Param;
	placeholder?: string;
}

export class Select extends SvelteComponentTyped<
	SelectParams & HTMLDivElement
> {}
