import { SvelteComponentTyped } from 'svelte';
import { Writable } from 'svelte/store';

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
		oldValue: Param[] | Param,
		addOrDelete: boolean
	) => Param | boolean | void;
	selected?: Writable<Param[] | Param>;
	placeholder?: string;
	id?: string;
	style?: string;
	getSelected?: () => Writable<Param[] | Param>;
}

export class Select extends SvelteComponentTyped<SelectParams> {}
