# 🔍 `svselect`

Easy to use `Select` inputs.

### Exports the `Select` component:

```ts
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
	id?: string;
	style?: string;
	getSelected?: () => Param[] | Param;
}
```

To use the `getSelected` function, use the `bind:this` derivative.

```html
<script>
	// ... imports
	let selectBox; // call `selectBox.getSelected()`
</script>

<select bind:this="{selectBox}" allowcreate {options} />
```

OR

```html
<script>
	// ... imports
	let getUserSelected; // call this whenever you want
</script>

<select bind:getSelected="{getUserSelected}" allowcreate {options} />
```

###

Made to fit in with Bootstrap. You should be able to integrate this seemlessly
without a styling hassle.
