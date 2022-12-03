<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// static
	export let options = []; // { label: string, key: string | number }
	export let multiple = false;
	export let onChange = (...o) => false || null;
	export let allowcreate = false;
	export let hideselected = false;

	// html static
	export let placeholder = '';
	export let style = '';
	export let id = '';

	// dynamic
	export let selected = writable(
		multiple ? [] : { label: '', key: '', custom: false }
	);

	let _sel = null;
	selected.subscribe((v) => (_sel = v));

	// thingy
	export function getSelected() {
		return _sel;
	}

	// code
	/** @type {HTMLDivElement} */
	let mainElm;
	/** @type {HTMLDivElement} */
	let optionsElm;
	/** @type {HTMLInputElement }*/
	let searchElm;
	/** @type {HTMLDivElement} */
	let highlightedElm;
	let highlightedIdx;

	function blur() {
		setHighlighted(0);

		mainElm.classList.remove('focus');
		optionsElm.classList.remove('show');

		optionsElm.blur();
		mainElm.blur();
	}

	function setSearchElmWidth() {
		searchElm.style.width =
			Math.max(searchElm.value.length, searchElm.placeholder.length, 1) +
			1 +
			'ch';
	}

	onMount(() => {
		mainElm.addEventListener('click', (e) => {
			mainElm.classList.toggle('focus');
			optionsElm.classList.toggle('show');

			if (e.target !== searchElm) {
				searchElm.focus();
				// searchElm.selectionStart = searchElm.value.length;
				// @ts-ignore
				if (e.clientX > searchElm.getBoundingClientRect().right)
					searchElm.selectionStart = searchElm.value.length;
			}
		});

		function focusElm() {
			optionsElm.classList.add('show');
			searchElm.focus();
		}

		setSearchElmWidth();

		searchElm.addEventListener('blur', () => setTimeout(blur, 100));
		function handleKeydown(e) {
			const key = e.code.toLowerCase();
			switch (key) {
				case 'backspace':
					if (searchElm.value.length === 0) {
						selected.update(
							(prev) => Array.isArray(prev) && prev.pop() && prev
						);
					}
					break;
				case 'enter':
					if (!optionsElm.classList.contains('show')) {
						// optionsElm.classList.add('show');
						focusElm();
						break;
					}

					const _n =
						allowcreate && highlightedIdx === filteredOptions.length
							? {
									label: searchElm.value,
									key: searchElm.value.toLowerCase(),
									custom: true,
							  }
							: filteredOptions[highlightedIdx];

					if (highlightedIdx === filteredOptions.length) {
						options.push(_n);
						options = options;
					}

					if (hideselected) setHighlighted(highlightedIdx - 1);

					handleOptionClick(null, _n, false);

					e.preventDefault();
					break;
				case 'escape':
					blur();
					searchElm.blur();
					e.preventDefault();
					break;
				case 'arrowup':
				case 'arrowdown':
					if (!optionsElm.classList.contains('show')) {
						// optionsElm.classList.add('show');
						focusElm();
						break;
					}
					let newIdx = highlightedIdx + (key === 'arrowup' ? -1 : 1);
					if (
						newIdx <
							(allowcreate && searchElm?.value
								? filteredOptions.length + 1
								: filteredOptions.length) &&
						newIdx >= 0
					) {
						setHighlighted(newIdx);
					}
					e.preventDefault();
					break;
			}
			setSearchElmWidth();
		}
		// searchElm.addEventListener('keydown', handleKeydown);
		mainElm.addEventListener('keydown', handleKeydown);
		setHighlighted(0);
	});

	function deleteItem(item) {
		selected.update(
			(prev) =>
				Array.isArray(prev) &&
				prev.splice(prev.indexOf(item), 1) &&
				prev
		);
	}
	function handleOptionClick(
		event,
		option,
		_blur = true,
		shouldChange = true,
		shouldChangeObj = {}
	) {
		if (event) event.stopPropagation();

		let shouldDel = Array.isArray(_sel) ? _sel.includes(option) : false;
		shouldChange = shouldChange
			? onChange(_sel, option, !shouldDel)
			: shouldChangeObj;

		if (!shouldChange && shouldChange != null) return;

		if (multiple && Array.isArray(_sel)) {
			if (shouldChange != null) {
				if (typeof shouldChange === 'object') {
					// @ts-ignore
					option.label = shouldChange?.label;
					// @ts-ignore
					option.key = shouldChange?.key;
				} else {
					option.key = shouldChange;
				}
				selected.update(
					(prev) => Array.isArray(prev) && prev.push(option) && prev
				);
			} else if (shouldDel) {
				// selected.splice(selected.indexOf(option), 1);
				deleteItem(option);
			} else {
				selected.update(
					(prev) => Array.isArray(prev) && prev.push(option) && prev
				);
			}
		} else {
			selected.set(option);
		}

		if (_blur) blur();
		searchElm.value = '';
	}

	function setHighlighted(index) {
		if (index < 0) index = 0;
		if (optionsElm == null) return (highlightedIdx = index);
		[...optionsElm.children].forEach((child, idx) => {
			if (index === idx) {
				// @ts-ignore
				highlightedElm = child;
				highlightedIdx = idx;
				highlightedElm.scrollIntoView({ block: 'nearest' });
				child.classList.add('hovered');
			} else {
				child.classList.remove('hovered');
			}
		});
	}

	let filteredOptions = options;
	$: options,
		(filteredOptions = options.filter(
			(c) =>
				c?.label?.includes(searchElm?.value || '') &&
				(hideselected
					? Array.isArray(_sel)
						? !_sel.includes(c)
						: true
					: true)
		));
</script>

<div bind:this={mainElm} {style} {id} tabindex="0" class="select">
	<span class="values" class:flex={multiple && Array.isArray(_sel)}>
		{#if multiple}
			{#each Array.isArray(_sel) && _sel as iSelected}
				<div
					on:click={(e) => {
						e.stopPropagation();
						let r = onChange(_sel, iSelected, false);
						if (r || r == null) deleteItem(iSelected);
						optionsElm.classList.remove('show');
					}}
					class="value"
				>
					{iSelected?.label} <span>&times;</span>
				</div>
			{/each}
		{:else}
			{typeof _sel === 'object' && !Array.isArray(_sel)
				? _sel?.label || ''
				: ''}
		{/if}
		<input
			{placeholder}
			on:input={setSearchElmWidth}
			bind:this={searchElm}
			class="search"
		/>
	</span>

	<div
		class="clear"
		on:click={(e) => {
			e.stopPropagation();
			if (multiple) {
				selected.update(
					(prev) =>
						Array.isArray(prev) &&
						prev.splice(0, prev.length) &&
						prev
				);
				// @ts-ignore
			} else selected.set({});
		}}
	>
		&times;
	</div>
	<div class="rule" />
	<div class="caret" />

	<div bind:this={optionsElm} class="options">
		{#each filteredOptions as option, index}
			<div
				on:click={(e) => {
					handleOptionClick(e, option);
				}}
				on:mouseenter={(e) => {
					setHighlighted(index);
				}}
				class="option"
				class:selected={Array.isArray(_sel)
					? _sel.includes(option)
					: option === _sel}
			>
				{option.label}
			</div>
		{:else}
			{#if !allowcreate || !searchElm?.value}
				<div class="option-note">Couldn't find matching option.</div>
			{/if}
		{/each}
		{#if searchElm?.value && !filteredOptions.some((c) => c.label === searchElm?.value) && allowcreate}
			<div
				class="option"
				class:hovered={filteredOptions.length < 1}
				on:click={(e) => {
					const label = searchElm.value;
					const key = label.toLowerCase();

					const option = {
						label,
						key,
						custom: true,
					};

					const r = onChange(_sel, option, true);
					if (!r && r != null) return;

					options.push(option);
					options = options;

					handleOptionClick(e, option, true, false, r);
					searchElm.value = '';
				}}
			>
				Create "{searchElm.value}"
			</div>
		{/if}
	</div>
</div>

{#if false}
	<!-- messy work around due to the way svelte works; refer to https://github.com/sveltejs/svelte/issues/5804#issuecomment-1237720578 -->
	<span class="options show option hovered selected select focus" />
{/if}

<style>
	.search {
		height: 100%;
		padding: 0;
		margin: 0;
		user-select: none;
		width: 1ch;
		outline: none;
		border: none;
		word-wrap: pre-wrap;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		margin-top: 0.15em;
	}

	.values.flex > .value {
		border: 1px solid #1a1a1a;
		border-radius: 0.375em;
		cursor: pointer;
		font-size: 0.8em;
		padding: 0.1em;
		padding-left: 0.2em;
		padding-right: 0.2em;
		margin: -0.1em;
		transition: background-color 100ms linear;
	}
	.values.flex > .value:hover {
		border: 1px solid #ed4e4e;
		background-color: #ec60609d;
	}
	.values.flex {
		display: flex;
		gap: 0.45em;
		flex-wrap: wrap;
	}
	.values {
		width: 100%;
	}

	.option-note {
		padding: 0.375rem 0.75rem;
	}

	.option {
		padding: 0.375rem 0.75rem;
		cursor: pointer;
	}
	.option.hovered {
		background-color: #939da7;
		color: white;
	}
	.option.selected {
		background-color: rgb(103, 110, 118);
		color: white;
	}

	.options.show {
		display: block;
	}
	.options {
		box-sizing: border-box;
		position: absolute;
		left: -1px;
		top: calc(100% + 0.3em);
		max-height: 15em;
		width: 100%;
		overflow-y: auto;
		border: 1px solid #ccc;
		/* padding: 0.375rem 0.75rem; */
		margin: 0;
		border-radius: 0.375em;
		box-shadow: 0.05em 0.05em 0.2em rgb(210, 210, 210);
		z-index: 100;
		display: none;
		background: #fff;
	}

	.caret {
		border-top: 0.6em solid rgb(100, 105, 110);
		border-left: 0.45em solid transparent;
		border-right: 0.45em solid transparent;
		width: 0;
		margin-left: 0.5em;
		align-self: center;
		cursor: pointer;
	}
	.rule {
		align-self: stretch;
		width: 2px;
		background: #ced4da;
		border-radius: 3em;
		color: #212529;
	}
	.clear {
		margin-left: auto;
		margin-right: 0.4em;
		position: relative;
		top: -0.1em;
		cursor: pointer;
		transition: color 100ms linear;
	}
	.clear:hover {
		color: rgb(255, 0, 0);
	}

	.select {
		display: flex;
		box-sizing: border-box;

		position: relative;
		align-items: center;
		width: 100%;
		border: 1px solid #ced4da;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375em;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		color: #212529;
		transition: border 100ms linear, box-shadow 100ms linear;
		outline: none;
		min-height: 1.5em;
		margin: 0;
		cursor: text;
	}
	.select:focus, .select.focus /*,
	.select:has(.search:focus) -- would use if supported mainstream */ {
		border: 1px solid #86b7fe;
		box-shadow: 0 0 0 0.25em #0d6efd40;
		background: #fff;
	}
</style>
