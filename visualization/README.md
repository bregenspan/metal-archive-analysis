Visualization of most common words in heavy metal band names
=============================================================

This project visualizes the most common words in heavy metal band names, displaying
the list of bands for each word. Keyboard arrows can be used to navigate between bands
(vertical) and between words (horizontal)

It also plays an annoying "song" consisting of a single repeated metal riff interspersed
with [SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)-generated reading of band names.

The current metal riff sample used for the audio comes from [Regular Gonzales](http://freemusicarchive.org/music/Regular_Gonzales/War_Were_D%20eclared/Regular_Gonzales_-_04_-_Autoantagonist) - check them out!

## Usage

 * `npm install`
 * `npm run serve` to open in local development server

## TODOs

 * Add more UI cues re: keyboard navigation; arrows and mobile swipe handling to navigate via mouse/tap.
 * Don't auto-play audio; add button to begin audio playback
 * Fix overlapping audio playback when user uses keyboard navigation
 * Make easily embeddable within a blog post / allow instantiation within an arbitrary element
