<script>
	import { onMount } from 'svelte';

	// static
	export let options = []; // { label: string, key: string | number }
	export let multiple = false;
	export let onChange = (...o) => false || null;
	export let allowcreate = false;
	export let hideselected = false;

	// dynamic
	export let selected = multiple ? [] : {};

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

		searchElm.addEventListener('blur', () => setTimeout(blur, 100));
		function handleKeydown(e) {
			const key = e.code.toLowerCase();
			switch (key) {
				case 'enter':
					if (!optionsElm.classList.contains('show')) {
						optionsElm.classList.add('show');
						break;
					}

					const _n = (allowcreate && highlightedIdx === filteredOptions.length) ? {
						label: searchElm.value,
						key: searchElm.value.toLowerCase(),
						custom: true,
					} : filteredOptions[highlightedIdx];
					
					if (highlightedIdx === filteredOptions.length) {
						options.push(_n);
						options = options;
					}
					
					handleOptionClick(null, _n);

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
						optionsElm.classList.add('show');
						break;
					}
					let newIdx = highlightedIdx + (key === 'arrowup' ? -1 : 1);
					if (
						newIdx <
							(allowcreate && searchElm?.value
								? filteredOptions.length + 1
								: filteredOptions.length) &&
						newIdx >= 0
					)
						setHighlighted(newIdx);
					e.preventDefault();
					break;
			}
		}
		// searchElm.addEventListener('keydown', handleKeydown);
		mainElm.addEventListener('keydown', handleKeydown);
		if (!multiple) searchElm.addEventListener('focus', () => {});
		setHighlighted(0);
	});

	function deleteItem(item) {
		selected = selected.filter((c) => c !== item);
	}
	function handleOptionClick(event, option) {
		if (event) event.stopPropagation();
		let shouldChange = onChange(selected, option);
		if (shouldChange || shouldChange == null) {
			if (multiple && Array.isArray(selected)) {
				if (selected.includes(option)) {
					// selected.splice(selected.indexOf(option), 1);
					deleteItem(option);
				} else {
					selected.push(option);
					selected = selected; // tell svelte to rerender
				}
			} else {
				selected = option;
			}

			blur();
			searchElm.value = '';
		}
	}

	function setHighlighted(index) {
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
		(filteredOptions = options.filter((c) =>
			c?.label?.includes(searchElm?.value || '') && (hideselected ? !selected.includes(c) : true)
		));
</script>

<div bind:this={mainElm} tabindex="0" class="select">
	<span class="values" class:flex={multiple && Array.isArray(selected)}>
		{#if multiple}
			{#each Array.isArray(selected) && selected as iSelected}
				<div
					on:click={(e) => {
						e.stopPropagation();
						deleteItem(iSelected);
						optionsElm.classList.remove('show');
					}}
					class="value"
				>
					{iSelected?.label} <span>&times;</span>
				</div>
			{/each}
		{:else}
			{selected?.label || ''}
		{/if}
		<input
			on:input={(e) => {
				searchElm.style.width =
					Math.max(
						searchElm.value.length,
						searchElm.placeholder.length,
						1
					) +
					1 +
					'ch';
				setHighlighted(0);
			}}
			bind:this={searchElm}
			class="search"
		/>
	</span>

	<div
		class="clear"
		on:click={(e) => {
			e.stopPropagation();
			selected = multiple ? [] : {};
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
				class:selected={Array.isArray(selected)
					? selected.includes(option)
					: option === selected}
			>
				{option.label}
			</div>
		{/each}
		{#if searchElm?.value && allowcreate}
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

					options.push(option);
					options = options;

					handleOptionClick(e, option);
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
		padding: 0.2em;
		transition: background-color 100ms linear;
	}
	.values.flex > .value:hover {
		border: 1px solid #ed4e4e;
		background-color: #ec60609d;
	}
	.values.flex {
		display: flex;
		gap: 0.3em;
		flex-wrap: wrap;
	}
	.values {
		width: 100%;
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
	}
</style>
