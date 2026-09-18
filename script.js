// =========================================================
// WARDOGS Mortar Distance Calculator (auto-calculating)
// =========================================================

// ---------------------------------------------------------
// CONFIG: change this value if the in-game scale ever changes
// 1 coordinate unit = 100 meters
// ---------------------------------------------------------
const METERS_PER_UNIT = 100;

// Elements
const mortarInput = document.getElementById('mortarInput');
const targetInput = document.getElementById('targetInput');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const resultValue = document.getElementById('resultValue');
const deltaXLabel = document.getElementById('deltaX');
const deltaYLabel = document.getElementById('deltaY');
const statusMsg = document.getElementById('statusMsg');

// ---------------------------------------------------------
// COORDINATE PARSER
// Accepts things like:
//   "98.10, 109.81"
//   "98.10 109.81"
//   "X98.10, Y109.81"
//   "x: 98.10 y: 109.81"
// It pulls out every number-looking chunk in the text
// (ignoring letters like X/Y) and uses the first two as [x, y].
// ---------------------------------------------------------
function parseCoordinatePair(rawText) {
  if (!rawText || rawText.trim() === '') {
    return null;
  }

  const numberPattern = /-?\d+(\.\d+)?/g;
  const matches = rawText.match(numberPattern);

  if (!matches || matches.length < 2) {
    return null;
  }

  const x = parseFloat(matches[0]);
  const y = parseFloat(matches[1]);

  if (isNaN(x) || isNaN(y)) {
    return null;
  }

  return { x, y };
}

// Shows the "not ready yet" state (empty / invalid input)
function showEmptyState(message) {
  resultValue.textContent = '—';
  resultValue.classList.add('invalid');
  deltaXLabel.textContent = 'ΔX: —';
  deltaYLabel.textContent = 'ΔY: —';
  statusMsg.textContent = message;
  statusMsg.classList.toggle('error', message !== 'Enter both coordinates');
}

// Runs automatically on every keystroke in either field
function updateCalculation() {
  const mortarRaw = mortarInput.value.trim();
  const targetRaw = targetInput.value.trim();

  // Nothing typed yet in one or both fields -> neutral message
  if (mortarRaw === '' || targetRaw === '') {
    showEmptyState('Enter both coordinates');
    return;
  }

  const mortar = parseCoordinatePair(mortarRaw);
  const target = parseCoordinatePair(targetRaw);

  // Something typed, but it doesn't look like valid coordinates yet
  if (!mortar || !target) {
    showEmptyState('Invalid coordinates — use format: X, Y');
    return;
  }

  // ---------------------------------------------------------
  // CORE FORMULA (Pythagorean theorem)
  // ---------------------------------------------------------
  const deltaX = target.x - mortar.x;
  const deltaY = target.y - mortar.y;

  const distanceInUnits = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
  const distanceInMeters = distanceInUnits * METERS_PER_UNIT;
  // ---------------------------------------------------------

  const roundedMeters = Math.round(distanceInMeters);

  resultValue.textContent = roundedMeters + ' m';
  resultValue.classList.remove('invalid');
  deltaXLabel.textContent = 'ΔX: ' + deltaX.toFixed(2);
  deltaYLabel.textContent = 'ΔY: ' + deltaY.toFixed(2);
  statusMsg.textContent = '';
  statusMsg.classList.remove('error');
}

function clearAll() {
  mortarInput.value = '';
  targetInput.value = '';
  showEmptyState('Enter both coordinates');
  mortarInput.focus();
}

function copyResult() {
  const text = resultValue.textContent;
  if (resultValue.classList.contains('invalid')) {
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const originalLabel = copyBtn.textContent;
    copyBtn.textContent = 'COPIED!';
    setTimeout(() => {
      copyBtn.textContent = originalLabel;
    }, 1000);
  }).catch(() => {
    statusMsg.textContent = 'Could not copy to clipboard.';
    statusMsg.classList.add('error');
  });
}

// Recalculate live as the user types or pastes into either field
mortarInput.addEventListener('input', updateCalculation);
targetInput.addEventListener('input', updateCalculation);

clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResult);

// Initial state on page load
showEmptyState('Enter both coordinates');
