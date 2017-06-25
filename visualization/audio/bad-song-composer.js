/**
 * Returns Promise for when the "playing" event occurs
 * for specified Audio element
 * @param {HTMLAudioElement} audio element
 * @returns Promise
 */
const promisifyAudioPlaying = (audio) =>
    new Promise((resolve, reject) => {
      audio.addEventListener('playing', resolve);
    });

/**
 * Plays HTMLAudioElement for specified time duration
 * @param {HTMLAudioElement} audio element
 * @param {Number} duration - time duration
 * @returns Promise
 */
function playAudioForDuration (audio, duration) {
  // Attempt to play audio programmatically -- this won't work on browsers that ban autoplay
  audio.play();

  return promisifyAudioPlaying(audio)
        .then(() => {
          return new Promise((resolve, reject) => {
            window.setTimeout(() => {
              audio.pause();
              audio.currentTime = 0;
              resolve();
            }, duration);
          });
        });
}

class BadSongComposer extends EventEmitter {
  constructor (options) {
    super();

    if (!options.vocals) {
      throw new Error('`vocals` configuration object should be defined');
    }
    if (!options.sample) {
      throw new Error('`sample` configuration object should be defined');
    }

    const pitch = options.vocals.pitch;
    if (pitch && (pitch < 0 || pitch > 2)) {
      throw new Error('`pitch` option should be between 0 and 2');
    }
    this.pitch = pitch || 1;

    const rate = options.vocals.rate;
    this.rate = rate || 1;

    this.duration = options.sample.duration || undefined;

    if (typeof options.vocals.lyrics !== 'function') {
      throw new Error('`vocals.lyrics` option must be specified, and be an Array or function');
    }
    this.lyrics = options.vocals.lyrics;

    this.lang = options.vocals.lang || 'en-';

    if (!options.sample.src) {
      throw new Error('`sample.src` option must be specified');
    }

    const audio = new Audio();
    audio.src = options.sample.src;
    audio.controls = true;
    audio.autoplay = false;
    document.body.appendChild(audio);
    this.audio = audio;

    // Unfortunately we need these browser detects to work around some cross-browser
    //  differences that can't be feature-detected.
    this._isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this._isChrome = window.chrome && !window.isOpera;
  }

  speak () {
    const composer = this;
    const utterance = this.getUtterance();
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.indexOf(this.lang) === 0);

    // FIXME: this should be configurable
    const goodVoices = voices.filter((v) => name === 'Google UK English Male');
    utterance.voice = goodVoices[0] || voices[0];

    utterance.pitch = this.scalePitchForBrowser(this.pitch);
    utterance.rate = this.rate;
    utterance.text = this.lyrics();

    return new Promise((resolve, reject) => {
      if (utterance._listener) {
        utterance.removeEventListener('end', utterance._listener);
        delete utterance._listener;
      }
      utterance._listener = () => {
        composer.emit('vocalComplete');
        resolve();
      };
      utterance.addEventListener('end', utterance._listener);

      this.emit('vocalStart');
      
      speechSynthesis.speak(utterance);
    });
  }

  playOnce () {
    return playAudioForDuration(this.audio, this.duration)
            .then(this.speak.bind(this));
  }

  play () {
    const playAndSpeakLoop = () =>
            this.playOnce().then(playAndSpeakLoop);
    playAndSpeakLoop();
  }

  /**
   * Scales a Speech Synthesis API pitch value such that its output
   *  sounds roughly equivalent between FF, Chrome, and Safari.
   */
  scalePitchForBrowser (pitch) {
    if (!this._isSafari) {
      // Exit early, we're normalizing to FF and Chrome's pitch scale and
      //  assuming that only Safari needs adjustment to match that scale.
      return pitch;
    }
    return ((pitch - 1) * // First, translate to easier scale to work with (-1 <> 1)
            0.7 + // Scale down to less extreme scale than Safari's
            1); // Translate back to 0 <> 2 scale
  }

  /**
   * Gets SpeechSynthesisUtterance() instance, creating one if necessary
   */
  getUtterance () {
    // Chrome (58.0.3029.110, 61.0.3127.0) and Safari seem to behave most reliably
    // (e.g. not suddenly halt speech synthesis or "end" event firing without emitting
    // any error), when re-using a single SpeechSynthesisUtterance instance.
    if (this._isChrome || this._isSafari) {
      if (!this._utterance) {
        this._utterance = new SpeechSynthesisUtterance();
      }
      return this._utterance;
    }

    // Use fresh utterance for all other browsers (including FF which seems to need one)
    return new SpeechSynthesisUtterance();
  }
}

window.BadSongComposer = BadSongComposer;
