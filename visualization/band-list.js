/**
 * Band list component
 */
export default class BandList {
  constructor (bandList, highlightWord) {
    const highlightRegex = new RegExp(`(${highlightWord})`, 'i');
    const list = document.createElement('ul');
    list.className = 'band-list';
    bandList.forEach((band, index) => {
      const bandName = band.name;
      const el = document.createElement('li');
      const highlightedBandName = bandName.replace(highlightRegex, '<em>$1</em>');
      const link = document.createElement('a');
      link.href = band.link;
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

      this.centerOn(e.target, (index > this.index));
      e.target.classList.add('selected');
      this.index = index; // FIXME: bubble up index change / use shared state
    }, true);

    this.el = list;
    this.index = 0;
  }

  onMounted () {
    this.offset = (window.innerHeight / 2) + this.el.firstChild.offsetHeight;
    // this.el.style.transform = `translateY(${this.offset}px)`;
    window.setTimeout(() => {
      this.el.classList.add('animate', 'visible');
    });
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
    // TODO: check overflow
    this.setIndex(this.index + 1);
  }

  previous () {
    if (this.index > 0) {
      this.setIndex(this.index - 1);
    }
  }

  clearHighlight () {
    const selected = this.el.querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
  }
}
