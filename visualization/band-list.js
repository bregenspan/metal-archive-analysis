/**
 * Band list component
 */
export default class BandList {
  constructor (bandList, highlightWord) {
    const highlightRegex = new RegExp(`(${highlightWord})`, 'i');
    const list = document.createElement('ul');
    list.className = 'band-list';
    bandList.forEach((band) => {
      const bandName = band.name;
      const el = document.createElement('li');
      const highlightedBandName = bandName.replace(highlightRegex, '<em>$1</em>');
      const link = document.createElement('a');
      link.href = band.link;
      link.innerHTML = highlightedBandName;
      link.target = '_blank';
      el.appendChild(link);
      list.appendChild(el);
    });

    list.addEventListener('focus', (e) => {
      // TODO: Handle focus, e.g. via tab key, to skip forwards in list
    }, true);

    this.el = list;
    this.index = 0;
  }

  onMounted () {
    this.offset = (window.innerHeight / 2) + this.el.firstChild.offsetHeight;
    //this.el.style.transform = `translateY(${this.offset}px)`;
    window.setTimeout(() => {
      this.el.classList.add('animate', 'visible');
    });
  }

  destroy () {
    this.el.parentNode.removeChild(this.el);
    this.el = null;
  }

  setIndex (index) {
    this.clearHighlight();
    const newSelected = this.el.getElementsByTagName('li')[index];
    if (newSelected) {
      newSelected.classList.add('selected');
      newSelected.querySelector('a').focus();
      this.centerOn(newSelected, (index > this.index));
    }
    this.index = index;
  }

  centerOn (itemEl, forwards) {
    const style = window.getComputedStyle(itemEl);
    const height = parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) + itemEl.offsetHeight;
    this.offset += (forwards ? (height * -1) : height);
    //this.el.style.transform = `translateY(${this.offset}px)`;
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
