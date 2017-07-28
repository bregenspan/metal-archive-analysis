import BandList from './band-list.js';
import BadSongComposer from './audio/bad-song-composer.js';

let currentBandList;
let currentComposer;
let currentLabel;

const appContainer = document.getElementById('appContainer');

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

  function updateLabel() {
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
  const bandList = new BandList(state, bands, word);

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

window.fetch(require('./static/ngrams.json'))
  .then((data) => {
    return data.json();
  })
  .then((data) => {
    let wordIndex = 0;
    const word = data[wordIndex].word;
    const bands = data[wordIndex].bands;

    document.addEventListener('keyup', (e) => {
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
