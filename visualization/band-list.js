/**
 * Band list component
 */
const BandList = function (bandList) {
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
  return list;
}
