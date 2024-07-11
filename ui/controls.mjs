let aStar = null;

const ranges = [
  {id: 'gScoreZFactor', exponent: 1.5, timer: null, setter: (value) => aStar.gScoreZFactor = value},
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

const pathInfoDiv = document.querySelector('#pathInfo');
const showAStarPathInfo = (info) => {
  pathInfoDiv.innerText = info;
};

const initControls = (aStarRef) => {
  aStar = aStarRef;

  for (const rangesItem of ranges) {
    const range = document.getElementById(rangesItem.id);
    range.addEventListener("input", (evt) => {
      let val = range.value;
      if (val >= 10)
        val = 1000;
      else if (typeof rangesItem.exponent === 'number')
        val = val ** rangesItem.exponent;
      evt.target.nextSibling.innerText = val.toFixed(3);
      val = parseFloat(val);
      clearTimeout(rangesItem.timer);
      rangesItem.timer = setTimeout(() => {
        rangesItem.timer = null;
        rangesItem.setter(val);
      }, 500);
    });
  }
};

export {initControls, showAStarPathInfo}