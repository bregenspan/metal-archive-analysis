/**
 * Band list component
 */
class BandList {
  constructor(bandList) {
    const searchTerm = 'Prophet';
    const highlightRegex = new RegExp(`(${searchTerm})`, 'i');
    const list = document.createElement('ul');
    list.className = 'band-list';
    const elements = bandList.map((bandName) => {
      const el = document.createElement('li');
      const highlightedBandName = bandName.replace(highlightRegex, '<em>$1</em>')
      el.innerHTML = highlightedBandName;
      list.appendChild(el);
    });
    this.el = list;
  }

  highlightIndex(index) {
    this.clearHighlight();
    const newSelected = this.el.getElementsByTagName('li')[index];
    if (newSelected) {
      newSelected.classList.add('selected');
    }
  }

  clearHighlight() {
    const selected = this.el.querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
  }
}
