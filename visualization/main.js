import './main.scss';

import * as d3 from 'd3';

import BandList from './band-list.js';
import BadSongComposer from './audio/bad-song-composer.js';

let currentBandList;
let currentComposer;
let currentLabel;

const appContainer = document.querySelector('.main-visualization');

const state = {
  bandIndex: 0
};

/**
 * Displays the specified band list (list of bands for specific word),
 * transitioning to it from any previously active band list if needed.
 * @param {string} word - the common word substring in the list of bands
 * @param {Array<Object>} bands - list of bands, with objects matching the format found in ngrams.json
 * @param {Number} index
 */
function showBandList (word, bands, index) {
  let previousBandList = currentBandList;

  if (!currentLabel) {
    currentLabel = document.createElement('div');
    currentLabel.className = 'active-label hide';
    appContainer.appendChild(currentLabel);
    currentLabel.innerHTML = `
      <span class="word"></span>
      <span class="count"></span>
    `;
  }

  function updateLabel () {
    currentLabel.querySelector('.word').innerHTML = word;
    currentLabel.querySelector('.count').innerHTML = `${bands.length} bands`;
    currentLabel.classList.remove('hide');
  }

  if (previousBandList) {
    currentBandList = createBandList(word, bands);
    currentBandList._index = index;
    currentLabel.classList.add('hide');
    transition(previousBandList.el, currentBandList.el, previousBandList._index < currentBandList._index)
      .then(() => {
        previousBandList.destroy();
        updateLabel();
        currentBandList.onMounted();
      });
  } else {
    currentBandList = createBandList(word, bands);
    currentBandList._index = index;
    appContainer.appendChild(currentBandList.el);
    currentBandList.onMounted();
    updateLabel();
  }
}

/**
 * Transitions between active band lists
 * @param {DOMElement} oldEl - element to transition from
 * @param {DOMElement} newEl - element to transition to
 * @param {boolean} direction - if true, direction is forwards (right); otherwise, backwards (left)
 * @returns {Promise} promise that is resolved once transition ends
 */
function transition (oldEl, newEl, direction) {
  return new Promise((resolve, reject) => {
    window.requestAnimationFrame(() => {
      appContainer.appendChild(newEl);
      newEl.classList.add(direction ? 'out-to-right' : 'out-to-left');
      window.requestAnimationFrame(() => {
        oldEl.classList.add(direction ? 'out-to-left' : 'out-to-right');
        newEl.classList.remove(direction ? 'out-to-right' : 'out-to-left');
        const handler = (e) => {
          if (!e.target.classList.contains('band-list')) {
            return true;
          }
          oldEl.removeEventListener('transitionend', handler);
          resolve();
        };
        oldEl.addEventListener('transitionend', handler);
      });
    });
  });
}

/**
 * Instantiates a BandList and BadSongComposer for a given list of bands
 * @param {string} word
 * @param {Array<Object>} bands
 */
function createBandList (word, bands) {
  const bandList = new BandList(state, bands, [word]);

  const options = {

    vocals: {
      lang: 'en-', // prefix for matching Speech Synthesis voice languages
      pitch: 2, // highest possible pitch
      rate: 1,

      // Function that returns next lyric
      lyrics: function () {
        return bands[state.bandIndex].name;
      }
    },

    sample: {
      // Audio clip to repeat in between vocals. (We're making a very bad song here;
      //  vocals only occur during breaks in between all other music)
      src: require('./static/riff.mp3'),
      // Duration to play audio clip for, in ms
      duration: 3400
    }
  };

  if (currentComposer) {
    currentComposer.destroy();
  }

  const composer = new BadSongComposer(options);

  currentComposer = composer;

  composer.on('vocalStart', () => {
    bandList.setIndex(state.bandIndex);
  });

  composer.on('vocalComplete', () => {
    bandList.clearHighlight();
    state.bandIndex++;
  });

  // Disabled for now until if/when it can be made less annoying!
  // composer.play();

  return bandList;
}


window.fetch(require('./static/names-with-multiple-words.json'))
  .then((data) => {
    return data.json();
  })
  .then((data) => {
    const bands = data.bands;
    const words = data.words;
    const overloadedBandList = new BandList(state, bands, words);
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

    document.addEventListener('keyup', (e) => {

      // TODO: only prevent default action when we know band list is active item on page
      e.preventDefault();

      switch (e.code) {
        case 'ArrowRight':
          if (wordIndex < data.length - 2) {
            wordIndex += 1;
            state.bandIndex = 0;
            showBandList(data[wordIndex].word, data[wordIndex].bands, wordIndex);
          }
          break;
        case 'ArrowLeft':
          if (wordIndex > 0) {
            wordIndex -= 1;
            state.bandIndex = 0;
            showBandList(data[wordIndex].word, data[wordIndex].bands, wordIndex);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          if (currentComposer) {
            currentComposer.destroy();
            currentComposer = null;
          }
          if (e.code === 'ArrowDown') {
            currentBandList.next();
          } else {
            currentBandList.previous();
          }
          break;
      }
    });

    showBandList(word, bands, wordIndex);
  });

function showBarChart (useLogScale) {
  const margin = { top: 10, right: 30, bottom: 60, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Set scale for each axis
  const xScale = d3.scaleBand()
          .range([0, width]);
  const yScale = useLogScale ? d3.scaleLog() : d3.scaleLinear();
  yScale.range([height, 0]);
  const yScaleLog = d3.scaleLog()
      .range([height, 0]);

  xScale.paddingInner(0.1);

  // Add an SVG object for the chart, with group inside
  const svg = d3.select('body')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.csv(require('./static/by-length.csv'), function (error, data) {
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
             .tickSizeOuter(0));

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
        .text('# of bands' + (useLogScale ? ' (logarithmic scale)' : ''));

    // text label for the x axis
    svg.append('text')
        .attr('y', height + 26)
        .attr('x', (width / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Length of name');

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

    let log = false;
    //window.setInterval(() => updateScale(log = !log), 1000);

  });
}

showBarChart(false);
showBarChart(true);
