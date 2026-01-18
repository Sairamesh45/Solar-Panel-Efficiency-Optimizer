
const info = (message) => {
  console.log(`[INFO]: ${message}`);
};

const error = (message) => {
  console.error(`[ERROR]: ${message}`);
};

const log = (message) => {
  console.log(`[LOG]: ${message}`);
};

module.exports = { info, error, log };
