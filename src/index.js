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
const listening = `Listening on port ${port}`;

let whitelist;

try {
  whitelist = whitelistUtils.loadWhitelist();
  if (!whitelist) { // allow everything
    console.log('Warning: No IP_WHITELIST or empty IP_WHITELIST.');
    console.log('Returning { allow: true } for all IP addresses until you ' +
      'configure your IP_WHITELIST environment variable.');
  }
} catch (err) {
  console.error('Error:', err.message);
  console.log('Returning { allow: false } for all IP addresses until you ' +
    'fix your IP_WHITELIST environment variable.');
  whitelist = []; // allow nothing
}

const app = expressUtils.init(whitelist);
app.listen(port, () => console.log(listening));
