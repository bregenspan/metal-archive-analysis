import BandList from './band-list.js';
import BadSongComposer from './audio/bad-song-composer.js';

/**
 * Wrapper component that manages display of BandList components, handling transitioning
 * between them, as well as instantiation of optional accompanying audio.
 */
export default class InteractiveBandList {
  constructor (containerEl) {
    this.containerEl = containerEl;
    this.state = {
      bandIndex: 0
    };
  }

  /**
   * Displays the specified band list (list of bands for specific word),
   * transitioning to it from any previously active band list if needed.
   * @param {string} word - the common word substring in the list of bands
   * @param {Array<Object>} bands - list of bands, with objects matching the format found in ngrams.json
   * @param {Number} index
   */
  show (word, bands, index) {
    let previousBandList = this.currentBandList;

    this.state.bandIndex = 0;

    if (!this.currentLabel) {
      const currentLabel = this.currentLabel = document.createElement('div');
      this.currentLabel.className = 'active-label hide';

      this.containerEl.appendChild(currentLabel);
      currentLabel.innerHTML = `
        <span class="word"></span>
        <span class="count"></span>
      `;
    }

    const updateLabel = () => {
      const currentLabel = this.currentLabel;
      currentLabel.querySelector('.word').innerHTML = word;
      currentLabel.querySelector('.count').innerHTML = `${bands.length} bands`;
      currentLabel.classList.remove('hide');
    };

    if (previousBandList) {
      const currentBandList = this.currentBandList = this._createBandList(word, bands);
      currentBandList._index = index;
      this.currentLabel.classList.add('hide');
      this._transition(previousBandList.el, currentBandList.el, previousBandList._index < currentBandList._index)
        .then(() => {
          previousBandList.destroy();
          updateLabel();
          currentBandList.onMounted();
        });
    } else {
      const currentBandList = this.currentBandList = this._createBandList(word, bands);
      currentBandList._index = index;
      this.containerEl.appendChild(currentBandList.el);
      currentBandList.onMounted();
      updateLabel();
    }
  }

  nextBand () {
    this._destroyComposer();
    this.currentBandList && this.currentBandList.next();
  }

  previousBand () {
    this._destroyComposer();
    this.currentBandList && this.currentBandList.previous();
  }

  _destroyComposer () {
    if (this.currentComposer) {
      this.currentComposer.destroy();
    }
  }

  /**
   * Transitions between active band lists
   * @param {DOMElement} oldEl - element to transition from
   * @param {DOMElement} newEl - element to transition to
   * @param {boolean} direction - if true, direction is forwards (right); otherwise, backwards (left)
   * @returns {Promise} promise that is resolved once transition ends
   */
  _transition (oldEl, newEl, direction) {
    return new Promise((resolve, reject) => {
      window.requestAnimationFrame(() => {
        this.containerEl.appendChild(newEl);
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
  _createBandList (word, bands) {
    const bandList = new BandList(this.state, bands, [word]);

    const options = {

      vocals: {
        lang: 'en-', // prefix for matching Speech Synthesis voice languages
        pitch: 2, // highest possible pitch
        rate: 1,

        // Function that returns next lyric
        lyrics: () => bands[this.state.bandIndex].name
      },

      sample: {
        // Audio clip to repeat in between vocals. (We're making a very bad song here;
        //  vocals only occur during breaks in between all other music)
        src: require('./static/riff.mp3'),
        // Duration to play audio clip for, in ms
        duration: 3400
      }
    };

    if (this.currentComposer) {
      this.currentComposer.destroy();
    }

    const composer = new BadSongComposer(options);

    this.currentComposer = composer;

    composer.on('vocalStart', () => {
      bandList.setIndex(this.state.bandIndex);
    });

    composer.on('vocalComplete', () => {
      bandList.clearHighlight();
      this.state.bandIndex++;
    });

    // Disabled for now until if/when it can be made less annoying!
    // composer.play();

    return bandList;
  }
}
