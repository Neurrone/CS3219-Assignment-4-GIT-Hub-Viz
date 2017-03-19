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
    var total = d3.sum(data, function(row) { return row.commits; });
    data.forEach(function(row) {
      row.percentage = row.commits / total;
    });
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
      date: d3.timeParse('%m')(+ row.monthIndex + 1),
      additions: + row.additions,
      deletions: + row.deletions,
      total: (+ row.additions) + (+ row.deletions)
    };
  }

  function onSuccess(data) {
    data.sort(function(a, b) { return a.date - b.date; });
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

function makePieChart(containerSelector, dataset) {
  var margin = 25;
  var width = 680;
  var height = 480;
  var radius = Math.min(width, height) / 2 - margin;
  var colour = d3.scaleOrdinal(d3.schemeCategory20);

  var svg = d3.select(containerSelector)
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
                .innerRadius(radius + margin + 10)
                .outerRadius(radius + margin + 10);

  var percentage = d3.arc()
                     .innerRadius(radius * 3/4)
                     .outerRadius(radius * 3/4);

  var arc = svg.selectAll('.arc')
               .data(pie(dataset))
               .enter()
               .append('g')
               .attr('class', 'arc');

  var arc2 = svg.selectAll('.arc2')
                .data(pie(dataset))
                .enter()
                .append('g')
                .attr('class', 'arc2');

  arc.append('path')
     .attr('d', path)
     .attr('fill', function(d) { return colour(d.data.author); })
     .style('opacity', .7);

  arc2.append('text')
      .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
      .text(function(d) { return d.data.author; })
      .style('font-size', '0.9em')
      .attr("text-anchor", "middle");

  arc2.append('text')
      .attr('transform', function(d) { return 'translate(' + percentage.centroid(d) + ')'; })
      .text(function(d) { return d3.format('.0%')(d.data.percentage); })
      .style('font-weight', 'bold')
      // .attr("vector-effect", "non-scaling-stroke")
      .attr("text-anchor", "middle");
}

function makeBarChart(containerSelector, dataset) {
  var margin = {top: 20, right: 50, bottom: 30, left: 20};
  var width = 680 - margin.left - margin.right;
  var height = 480 - margin.top - margin.bottom;

  var svg = d3.select(containerSelector)
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.3).align(0.3);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  var colour = ['#2cbe4e', '#cb2431'];

  x.domain(dataset.map(function(d) { return d.date; }));
  y.domain([0, d3.max(dataset, function(d) { return d.total; })]).nice();

  var stack = d3.stack();

  var cats = dataset.columns.slice(1);

  svg.selectAll(".serie")
     .data(stack.keys(cats)(dataset))
     .enter().append('g')
       .attr('class', 'serie')
       .style('fill', function(d, i) { return colour[i]; })
       .selectAll('rect')
       .data(function(d) { return d; })
     .enter().append("rect")
       .attr("x", function(d) { return x(d.data.date); })
       .attr("y", function(d) { return y(d[1]); })
       .attr("height", function(d) { return y(d[0]) - y(d[1]); })
       .attr("width", x.bandwidth());

  var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%b'));
  var yAxis = d3.axisRight(y).ticks(10, "s");

  svg.append('g')
       .attr("class", "axis axis--x")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

  svg.append('g')
       .attr("class", "axis axis--y")
       .attr("transform", "translate(" + width + ",0)")
       .call(yAxis)
     .append("text")
       .attr("dx", "-1em")
       .attr("dy", "-1em")
       .attr("text-anchor", "start")
       .attr("fill", "#000")
       .text("Lines of code");

  var legend = svg.selectAll(".legend")
                  .data(cats.slice().reverse())
                  .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
          .attr("x", width - 90)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", function(d) { return colour[cats.indexOf(d)] });

  legend.append("text")
          .attr("x", width - 68)
          .attr("y", 9)
          .attr("dy", ".35em")
          .attr("text-anchor", "start")
          .text(function(d) { return d; })
          .style('font-size', '0.7em');
}

// this function is called when all CSVs have been loaded successfully
function onDataLoadingComplete(q1, q2, q3) {
  // main logic here
  // this is the format of the question objects: an array of objects, one per row
  console.log(q1);
  console.log(q2);
  console.log(q3);

  makePieChart('#chart1', q1);
  makeBarChart('#chart2', q2);
}

function main() {
  loadQ1Data(); /// starts data loading; on success, this function continues to load other CSVs
}

main();