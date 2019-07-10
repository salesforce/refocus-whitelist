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
const { logType, writeLog, initProducer } = require('./logger');
const listening = `Listening on port ${port}`;
const API_CACHE_DURATION = process.env.API_CACHE_DURATION || false;

let whitelist;
initProducer();
try {
  whitelist = whitelistUtils.loadWhitelist();
  if (!whitelist) { // allow everything
    writeLog('Warning: No IP_WHITELIST or empty IP_WHITELIST.', logType.INFO);
    writeLog('Returning { allow: true } for all IP addresses until you ' +
      'configure your IP_WHITELIST environment variable.', logType.INFO);
  }
} catch (err) {
  writeLog(`Error: ${err.message}`, logType.ERR);
  writeLog('Returning { allow: false } for all IP addresses until you ' +
    'fix your IP_WHITELIST environment variable.', logType.INFO);
  whitelist = []; // allow nothing
}

const app = expressUtils.init(whitelist, API_CACHE_DURATION);
app.listen(port, () => writeLog('log', listening));
