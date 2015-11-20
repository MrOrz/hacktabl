require('babel/register')(require('../package.json').config.babel);

// Chai setup
//
var chai = require('chai');
chai.use(require('chai-as-promised'));

// Unhandled rejection handling
//
/* istanbul ignore next */
process.on('unhandledRejection', function(reason) {
  console.log('Unhandled Rejection, reason:', reason);
  if (reason.stack) {
    console.err(reason.stack);
  }
});
