const path = require('path');

function getPassword() {
  // return `${path.basename(__dirname)}1234`;
  const password ='employees1234';
  return password;
};

module.exports = {getPassword}