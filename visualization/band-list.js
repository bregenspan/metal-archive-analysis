/**
 * Band list component
 */
class BandList {
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

    this.el = list;
  }

  onMounted () {
    this.offset = (window.innerHeight / 2) + this.el.firstChild.offsetHeight;
    this.el.style.transform = `translateY(${this.offset}px)`;
    window.setTimeout(() => {
      this.el.classList.add('animate', 'visible');
    });
  }

  highlightIndex (index) {
    this.clearHighlight();
    const newSelected = this.el.getElementsByTagName('li')[index];
    if (newSelected) {
      newSelected.classList.add('selected');
      this.centerOn(newSelected);
    }
  }

  centerOn (itemEl) {
    const style = window.getComputedStyle(itemEl);
    const height = parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) + itemEl.offsetHeight;
    this.offset -= height;
    this.el.style.transform = `translateY(${this.offset}px)`;
  }

  clearHighlight () {
    const selected = this.el.querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
  }
}
