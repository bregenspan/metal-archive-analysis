/* global BandList, BadSongComposer */

let currentBandList;
let currentComposer;
const appContainer = document.getElementById('appContainer');

function showBandList (word, bands, index) {
  let previousBandList = currentBandList;

  if (previousBandList) {
    currentBandList = createBandList(word, bands);
    currentBandList._index = index;
    transition(previousBandList.el, currentBandList.el, previousBandList._index < currentBandList._index)
      .then(() => previousBandList.destroy());
  } else {
    currentBandList = createBandList(word, bands);
    currentBandList._index = index;
    appContainer.appendChild(currentBandList.el);
  }
  currentBandList.onMounted();
}

function transition (oldEl, newEl, direction) {
  return new Promise((resolve, reject) => {
    window.requestAnimationFrame(() => {
      appContainer.appendChild(newEl);
      newEl.classList.add(direction ? 'out-to-right' : 'out-to-left');
      window.requestAnimationFrame(() => {
        oldEl.classList.add(direction ? 'out-to-left' : 'out-to-right');
        newEl.classList.remove(direction ? 'out-to-right' : 'out-to-left');
        const handler = () => {
          resolve();
          oldEl.removeEventListener('transitionend', handler);
        };
        oldEl.addEventListener('transitionend', handler);
      });
    });
  });
}

function createBandList (word, bands) {
  const bandList = new BandList(bands, word);

  let bandIndex = 0;

  const options = {

    vocals: {
      lang: 'en-', // prefix for matching Speech Synthesis voice languages
      pitch: 2, // highest possible pitch
      rate: 1,

      // Function that returns next lyric
      lyrics: (function () {
        let index = -1;
        return function () {
          const words = bands.map((band) => band.name);
          index += 1;
          return words[index];
        };
      }())
    },

    sample: {
      // Audio clip to repeat in between vocals. (We're making a very bad song here;
      //  vocals only occur during breaks in between all other music)
      src: 'audio/antagonist.mp3',

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
    bandList.setIndex(bandIndex);
  });

  composer.on('vocalComplete', () => {
    bandList.clearHighlight();
    bandIndex++;
  });

  composer.play();

  return bandList;
}

window.fetch('ngrams.json')
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
            showBandList(data[wordIndex].word, data[wordIndex].bands, wordIndex);
          }
          break;
        case 'ArrowLeft':
          if (wordIndex > 0) {
            wordIndex -= 1;
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
