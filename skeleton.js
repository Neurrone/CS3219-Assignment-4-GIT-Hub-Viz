'use strict';

let q1;
let q2;
let q3;

function csvLoadFailed() {
  console.warn("Failed to load CSV data");
}

function readCsv(path, parseRowFunc, onSuccess) {
  d3.csv(path, parseRowFunc, function(error, data) {
    if (error) {
      csvLoadFailed();
    } else {
      onSuccess(data);
    }
  });
}

// these functions asynchronously loads data from the .csv files

function loadQ1Data() {
  function parseRow(row) {
    return {
      author: row.author,
      commits: + row.commits
    };
  }

  function onSuccess(data) {
    q1 = data.filter(function(row) {
      return row.commits > 0;
    });

    console.log("Loaded q1 data");
    loadQ2Data();
  }
  readCsv("data/q1.csv", parseRow, onSuccess);
}

function loadQ2Data() {
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
    loadQ3Data();
  }
  readCsv("data/q2.csv", parseRow, onSuccess);
}

function loadQ3Data() {
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
  readCsv("data/q3.csv", parseRow, onSuccess);
}

function makePieChart(dataset) {
  var width = 480;
  var height = 480;
  var radius = Math.min(width, height) / 2;
  var colour = d3.scaleOrdinal(d3.schemeCategory20c);

  var svg = d3.select('#chart1')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g')
              .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

  var pie = d3.pie()
              .value(function(d) { return d.commits; })
              .sort(null);

  var path = d3.arc()
               .innerRadius(0)
               .outerRadius(radius);

  var label = d3.arc()
                .innerRadius(radius - 50)
                .outerRadius(radius - 50);

  var arc = svg.selectAll('.arc')
               .data(pie(dataset))
               .enter()
               .append('g')
               .attr('class', 'arc');

  arc.append('path')
     .attr('d', path)
     .attr('fill', function(d) { return colour(d.data.author); });

  arc.append('text')
     .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
     .text(function(d) { return d.data.author; })
     .style('font-size', '0.8em')
     .attr('dx', '-1em')
     .attr('dy', '2.5em');
}

// this function is called when all CSVs have been loaded successfully
function onDataLoadingComplete(q1, q2, q3) {
  // main logic here
  // this is the format of the question objects: an array of objects, one per row
  console.log(q1);
  console.log(q2);
  console.log(q3);

  makePieChart(q1);
}

function main() {
  loadQ1Data(); /// starts data loading; on success, this function continues to load other CSVs
}

main();