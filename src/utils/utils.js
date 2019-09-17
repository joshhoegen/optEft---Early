function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEquation() {
  // Do we always need to generate equations with positiove numbers?
  // let operators = ['+', '-'];
  // let operator = operators[Math.floor(Math.random()*operators.length)];
  return `${getRandomInt(0, 10)} + ${getRandomInt(0, 10)}`;
}

function getTimeNow() {
  return Math.floor(Date.now());
}

function getTimeTotal(start, end) {
  return end - start;
}

module.exports = {
  getRandomInt,
  getEquation,
  getTimeNow,
  getTimeTotal
};
