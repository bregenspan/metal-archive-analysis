/**
 * Band list component
 */

const FIXTURE = ['Steel Prophet', 'False Prophet', 'Prophets of Doom', 'Messiah Prophet', 'Prophetic Age', 'Black Prophets', 'Pontius Prophet', 'Prophet of Disasters', 'Prophet', 'Satanic Prophets', 'High Prophet', 'Inverted Prophet', 'Sturmprophet', 'Prophet', "Prophet's Eye", 'Weeping Prophet', 'False Prophet', 'Prophet', 'Sleeping Prophet', 'Concrete Prophet', 'Neurosplit Prophet', 'Dark Prophet', 'Prophetic', 'Dark Prophets', 'Prophet', 'Prophets on Vacation', 'Prophet Fulfilled', 'Blood of the Prophets', 'Prophets of War', 'Prophetic Disclosure', 'The Prophet', 'Aeternus Prophet', 'Disaster Prophet', 'Blasphemia Prophetica', 'Black Tar Prophet', 'Slaughter the Prophets', 'Doomsday Prophet', 'Pale Prophet', 'Prophets of the Rising Dead', 'Prophets of Saturn', "The Prophet's Whisper", 'Prophetic Scourge', 'Prophet of the Void', 'The Fallen Prophets', 'Prophetess', 'Silent Prophet', 'Feast for a Prophet'];

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

document.body.appendChild(BandList(FIXTURE));
