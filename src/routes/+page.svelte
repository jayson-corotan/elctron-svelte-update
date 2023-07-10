<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	// import { ipcRenderer } from 'electron';
	// const print = require('$lib/print/print')
	// import js from '$lib/print/print.cjs'

	let ipc;
	let data = {
		name: '',
		address: ''
	}
	onMount(() => {
		const { ipcRenderer } = require('electron');
		ipc = ipcRenderer
		const rows = [
			{
				name: 'electron',
				description: 'Build cross platform desktop apps with JavaScript, HTML, and CSS'
			},
			{
				name: 'jsreport',
				description:
					'Innovative and unlimited reporting based on javascript templating engines and web technologies'
			}
		];
		
		const generateBtn = document.getElementById('generateReport');
		const detailsEl = document.getElementById('details');

		generateBtn.addEventListener('click', () => {
			detailsEl.innerText = '';

			generateBtn.disabled = true;
			generateBtn.innerText = 'Rendering..';
			console.log(rows, data)
			ipcRenderer.send('render-start', {rows, data});
		});

		ipcRenderer.on('render-finish', (ev, data) => {
			generateBtn.disabled = false;
			generateBtn.innerText = 'Generate Report';

			if (data && data.errorText) {
				detailsEl.innerText = data.errorText;
			}
		});
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Svelte App</h1>
	<input type="text" name="name" id="" bind:value={data.name} placeholder="name">
	<input type="text" name="address" id="" bind:value={data.address} placeholder="address">

	<button id="generateReport">Generate Report</button>
	<p id="details" />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
