/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const whitelistUtils = require('./whitelistUtils');
const expressUtils = require('./expressUtils');
const port = process.env.PORT || 3000;
const logger = require('./logger');
require('./toggles');
const listening = `Listening on port ${port}`;
const API_CACHE_DURATION = process.env.API_CACHE_DURATION || false;

const startApp = () => {
  let whitelist;
  try {
    whitelist = whitelistUtils.loadWhitelist();
    if (!whitelist) { // allow everything
      logger.info('Warning: No IP_WHITELIST or empty IP_WHITELIST.');
      logger.info('Returning { allow: true } for all IP addresses until you ' +
        'configure your IP_WHITELIST environment variable.');
    }
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    logger.info('Returning { allow: false } for all IP addresses until you ' +
      'fix your IP_WHITELIST environment variable.');
    whitelist = []; // allow nothing
  }

  const app = expressUtils.init(whitelist, API_CACHE_DURATION);
  app.listen(port, () => logger.info(listening));
};

function startWithKafkaLogging() {
  return logger.initKafkaLoggingProducer().then(startApp).catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}

startWithKafkaLogging();

module.exports = {
  startWithKafkaLogging,
};
