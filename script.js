// Геодезический калькулятор: углы в формате градусы-минуты-секунды

const $ = (id) => document.getElementById(id);

// Читает число из поля; пустое поле = 0
function val(id) {
  const raw = $(id).value.trim().replace(',', '.');
  if (raw === '') return 0;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? NaN : n;
}

// Считывает угол (градусы, минуты, секунды) и переводит в десятичные градусы
function readAngle(n) {
  const rawDeg = $('deg' + n).value.trim();
  const deg = val('deg' + n);
  const min = val('min' + n);
  const sec = val('sec' + n);

  if ([deg, min, sec].some(Number.isNaN)) {
    throw new Error('Введите числа в поля угла ' + n + '.');
  }
  if (min < 0 || min >= 60) {
    throw new Error('Минуты в угле ' + n + ' должны быть от 0 до 59.');
  }
  if (sec < 0 || sec >= 60) {
    throw new Error('Секунды в угле ' + n + ' должны быть от 0 до 59.999.');
  }

  const negative = deg < 0 || rawDeg.startsWith('-');
  const abs = Math.abs(deg) + min / 60 + sec / 3600;
  return negative ? -abs : abs;
}

// Десятичные градусы -> {neg, deg, min, sec}
function toDMS(decimal) {
  const neg = decimal < 0;
  // Округляем до тысячных долей секунды, чтобы не было 59.9999 и переноса
  const totalSec = Math.round(Math.abs(decimal) * 3600 * 1000) / 1000;
  const deg = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec - deg * 3600) / 60);
  const sec = Math.round((totalSec - deg * 3600 - min * 60) * 1000) / 1000;
  return { neg, deg, min, sec };
}

function showResult(decimal) {
  const d = toDMS(decimal);
  $('resultDeg').textContent = (d.neg && (d.deg !== 0 || d.min !== 0 || d.sec !== 0) ? '-' : '') + d.deg;
  $('resultMin').textContent = d.min;
  $('resultSec').textContent = d.sec.toFixed(3);
  $('resultDecimal').textContent = decimal.toFixed(6);
}

function fail(e) {
  alert(e.message || 'Ошибка ввода.');
}

function calculate(op) {
  try {
    const a = readAngle(1);
    let result;

    if (op === 'add' || op === 'subtract') {
      const b = readAngle(2);
      result = op === 'add' ? a + b : a - b;
    } else {
      const raw = $('number').value.trim().replace(',', '.');
      if (raw === '') throw new Error('Введите число в поле «Или число для умножения/деления».');
      const k = parseFloat(raw);
      if (Number.isNaN(k)) throw new Error('Введите корректное число.');
      if (op === 'divide' && k === 0) throw new Error('Делить на ноль нельзя.');
      result = op === 'multiply' ? a * k : a / k;
    }

    showResult(result);
  } catch (e) {
    fail(e);
  }
}

function convertToDMS() {
  const raw = $('decimalInput').value.trim().replace(',', '.');
  const x = parseFloat(raw);
  if (raw === '' || Number.isNaN(x)) {
    alert('Введите десятичные градусы, например 45.5');
    return;
  }
  showResult(x);
}

// Приводит угол 1 к диапазону 0–360° и записывает обратно в поля
// Имя не «normalize»: в inline-обработчиках onclick оно перекрывается document.normalize()
function normalizeAngle() {
  try {
    let a = readAngle(1);
    a = ((a % 360) + 360) % 360;
    const d = toDMS(a);
    $('deg1').value = d.deg;
    $('min1').value = d.min;
    $('sec1').value = d.sec;
    showResult(a);
  } catch (e) {
    fail(e);
  }
}

function clearAll() {
  document.querySelectorAll('input').forEach((el) => { el.value = ''; });
  $('resultDeg').textContent = '0';
  $('resultMin').textContent = '0';
  $('resultSec').textContent = '0.000';
  $('resultDecimal').textContent = '0.000000';
}

// Все кнопки подключаются здесь через data-action (без inline onclick)
document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const a = btn.dataset.action;
    if (a === 'normalize') normalizeAngle();
    else if (a === 'convert') convertToDMS();
    else if (a === 'clear') clearAll();
    else calculate(a);
  });
});

// Запасной вариант для старого index.html с onclick="normalize()"
document.querySelectorAll('[onclick="normalize()"]').forEach((btn) => {
  btn.removeAttribute('onclick');
  btn.addEventListener('click', normalizeAngle);
});

console.log('Геодезический калькулятор: script.js v3 загружен');

// Enter в поле конвертера = нажать «→ DMS»
$('decimalInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') convertToDMS();
});
