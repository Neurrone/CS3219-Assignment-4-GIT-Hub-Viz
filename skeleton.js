'use strict';

let q1;
let q2;
let q3;

function csvLoadFailed() {
	console.warn("Failed to load CSV data");
}

function readCsv(d3, path, parseRowFunc, onSuccess) {
	d3.csv(path, parseRowFunc, function(error, data) {
		if (error) {
			csvLoadFailed();
		} else {
			onSuccess(data);
		}
	});
}

// these functions asynchronously loads data from the .csv files

function loadQ1Data(d3) {
	function parseRow(row) {
		return {
			author: row.author,
			commits: + row.commits
		};
	}
	
	function onSuccess(data) {
		q1 = data;
		console.log("Loaded q1 data");
		loadQ2Data(d3);
	}
	readCsv(d3, "data/q1.csv", parseRow, onSuccess);
}

function loadQ2Data(d3) {
	function parseRow(row) {
		return {
			monthIndex: + row.monthIndex,
			additions: + row.additions,
			deletions: + row.deletions
		};
	}
	
	function onSuccess(data) {
		q2 = data;
		console.log("Loaded q2 data");
		loadQ3Data(d3);
	}
	readCsv(d3, "data/q2.csv", parseRow, onSuccess);
}

function loadQ3Data(d3) {
	function parseRow(row) {
		return {
			dayIndex: + row.dayIndex,
			amCommits: + row['a_m commits'],
			nzCommits: + row['n_z commits']
		};
	}
	
	function onSuccess(data) {
		q3 = data;
		console.log("Loaded q3 data");
		onDataLoadingComplete(q1, q2, q3);
	}
	readCsv(d3, "data/q3.csv", parseRow, onSuccess);
}

// this function is called when all CSVs have been loaded successfully
function onDataLoadingComplete(q1, q2, q3) {
	// main logic here
	// this is the format of the question objects: an array of objects, one per row
	// e.g print out third row
	console.log(q1[2]);
	console.log(q2[2]);
	console.log(q3[2]);
}

function main(d3) {
	loadQ1Data(d3); /// starts data loading; on success, this function continues to load other CSVs
}

main(window.d3);