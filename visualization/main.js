import './main.scss';

import * as d3 from 'd3';

import BandList from './band-list.js';
import InteractiveBandList from './band-list-interactive.js';

window.fetch(require('./static/names-with-multiple-words.json'))
  .then((data) => {
    return data.json();
  })
  .then((data) => {
    // Show topmost visualization: *very* metal band names
    const { bands, words } = data;
    const overloadedBandList = new BandList({}, bands, words);
    const overloadedBandsContainer = document.querySelector('[data-vis="overloaded"]');
    overloadedBandsContainer.appendChild(overloadedBandList.el);
    overloadedBandList.onMounted();

    // Randomly highlight bands
    window.setInterval(() => {
      overloadedBandList.setIndex(Math.floor(Math.random() * bands.length - 1));
    }, 1000);
  });

window.fetch(require('./static/ngrams.json'))
  .then((data) => {
    return data.json();
  })
  .then((data) => {
    let wordIndex = 0;
    const word = data[wordIndex].word;
    const bands = data[wordIndex].bands;

    const interactiveBandList = new InteractiveBandList(document.querySelector('[data-vis="band-browser"]'));

    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowRight':
          if (wordIndex < data.length - 2) {
            wordIndex += 1;
            interactiveBandList.show(data[wordIndex].word, data[wordIndex].bands, wordIndex);
          }
          break;
        case 'ArrowLeft':
          if (wordIndex > 0) {
            wordIndex -= 1;
            interactiveBandList.show(data[wordIndex].word, data[wordIndex].bands, wordIndex);
          }
          break;

        // up/down navigation only makes sense if bands are displayed in single-column layout...
        /* case 'ArrowUp':
        case 'ArrowDown':
          if (e.code === 'ArrowDown') {
            interactiveBandList.nextBand();
          } else {
            interactiveBandList.previousBand();
          }
          break;
          */
      }
    });

    interactiveBandList.show(word, bands, wordIndex);
  });


function showBarChart (placeholder, csvFile) {
  const margin = { top: 10, right: 30, bottom: 60, left: 40 };
  const width = placeholder.clientWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Set scale for each axis
  const xScale = d3.scaleBand()
                  .range([0, width]);
  const yScale = d3.scaleLinear()
                  .range([height, 0]);

  const yScaleLog = d3.scaleLog()
                  .range([height, 0]);

  xScale.paddingInner(0.1);

  // Add an SVG object for the chart, with group inside
  const svg = d3.select(placeholder)
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.csv(csvFile, function (error, data) {
    if (error) throw error;

    const maxLength = d3.max(data, (d) => parseInt(d.length, 0));
    const indexedByLength = data.reduce((acc, item) => {
      acc[item.length] = item;
      return acc;
    }, {});
    const allLengths = new Array(maxLength).fill().map((item, idx) => {
      if (indexedByLength[idx + 1]) {
        return indexedByLength[idx + 1];
      } else {
        return {
          length: idx + 1,
          count: 0
        };
      }
    });

    // format the data
    allLengths.forEach((d) => {
      d.count = parseInt(d.count, 10);
      d.length = parseInt(d.length, 10);
    });

    xScale.domain(allLengths.map((d) => d.length));
    yScale.domain([0.5, d3.max(allLengths, (d) => d.count)]);
    yScaleLog.domain([0.5, d3.max(allLengths, (d) => d.count)]);

    // append the bar rectangles to the svg element
    svg.selectAll('rect')
        .data(allLengths)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.length))
        .attr('width', xScale.bandwidth())
        .attr('y', (d) => yScale(d.count))
        .attr('height', (d) => Math.max(height - yScale(d.count), 0));

    // add the x Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale)
             .tickSizeOuter(0)
             .tickValues(allLengths.map((d) => d.length % 5 === 0 ? d.length : null)));

    const yAxis = d3.axisLeft(yScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickFormat(d3.format('.0s'));

    // add the y Axis
    svg.append('g')
      .attr('class', 'yAxis')
        .call(yAxis);

    // text label for the y axis
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('# of bands');

    // text label for the x axis
    svg.append('text')
        .attr('y', height + 26)
        .attr('x', (width / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Length of name (in characters)');

    function updateScale (toLog) {
      const scale = toLog ? yScaleLog : yScale;
      svg.selectAll('rect')
        .data(allLengths)
        .transition().duration(1000)
        .attr('y', (d) => scale(d.count))
        .attr('height', (d) => Math.max(height - scale(d.count), 0));

      svg.selectAll('.yAxis')
          .transition().duration(1000)
          .call(yAxis.scale(scale));
    }

    document.getElementById('useLogScale').addEventListener('change', function (e) {
      updateScale(this.checked);
    });
  });      
}

function showNameLengthBarChart () {
  showBarChart(document.querySelector('[data-vis="lengths"]'), require('./static/by-length.csv'));
}

showNameLengthBarChart();
