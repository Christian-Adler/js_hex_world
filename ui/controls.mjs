let aStar = null;

const ranges = [
  {id: 'gScoreZFactor', setter: (value) => aStar.gScoreZFactor = value},
];

const switchInputs = document.querySelector('#switchInputs');
switchInputs.addEventListener('click', (e) => {
  e.target.parentNode.classList.toggle('min');
  const isMin = e.target.parentNode.classList.contains('min');
  if (isMin)
    e.target.innerHTML = '&gt;';
  else
    e.target.innerText = 'X';
});

const initControls = (aStarRef) => {
  aStar = aStarRef;

  for (const rangesItem of ranges) {
    const range = document.getElementById(rangesItem.id);
    range.addEventListener("input", (evt) => {
      let val = range.value;
      evt.target.nextSibling.innerText = val;
      val = parseFloat(val);
      rangesItem.setter(val);
    });
  }
};

export {initControls}