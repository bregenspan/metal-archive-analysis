function linkifyBand (name, id) {
  const urlSlug = escape(name.replace(/ /g, '_'));
  return `https://www.metal-archives.com/bands/${urlSlug}/${id}`;
}

/**
 * Displays a list of bands with optional highlighting of terms in band names
 */
export default class BandList {

  /**
   * @param {object} state - global app state object
   * @param {Array} bandList - list of bands
   * @param {Array<string>} highlightWords - one or more words to highlight in names
   */
  constructor (state, bandList, highlightWords) {
    this.state = state;

    const highlightRegex = new RegExp(`(${highlightWords.join('|')})`, 'gi');
    const list = document.createElement('ul');
    list.className = 'band-list';
    bandList.forEach((band, index) => {
      const bandName = band.name;
      const el = document.createElement('li');
      const highlightedBandName = bandName.replace(highlightRegex, '<em>$1</em>');
      const link = document.createElement('a');
      link.href = linkifyBand(band.name, band.id);
      link.dataset.index = index;
      link.innerHTML = highlightedBandName;
      link.target = '_blank';
      el.appendChild(link);
      list.appendChild(el);
    });

    list.addEventListener('focus', (e) => {
      if (!e.target || !e.target.dataset.index) {
        return;
      }

      this.clearHighlight();

      const index = parseInt(e.target.dataset.index, 10);

      this.centerOn(e.target, (index > this.state.bandIndex));
      e.target.classList.add('selected');
      this.state.bandIndex = index;
    }, true);

    this.el = list;
  }

  onMounted () {
    this.offset = (window.innerHeight / 2) + this.el.firstChild.offsetHeight;
    // this.el.style.transform = `translateY(${this.offset}px)`;
    // window.setTimeout(() => {
    //   this.el.classList.add('animate', 'visible');
    // });
    this.setIndex(0);
  }

  destroy () {
    this.el.parentNode.removeChild(this.el);
    this.el = null;
  }

  setIndex (index) {
    const newSelected = this.el.getElementsByTagName('li')[index];
    if (newSelected) {
      newSelected.querySelector('a').focus();
    }
  }

  centerOn (itemEl, forwards) {
    const style = window.getComputedStyle(itemEl);
    const height = parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) + itemEl.offsetHeight;
    this.offset += (forwards ? (height * -1) : height);
    // this.el.style.transform = `translateY(${this.offset}px)`;
  }

  next () {
    this.setIndex(this.state.bandIndex + 1);
  }

  previous () {
    if (this.state.bandIndex > 0) {
      this.setIndex(this.state.bandIndex - 1);
    }
  }

  clearHighlight () {
    const selected = this.el.querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
  }
}
