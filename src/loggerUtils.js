/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const logFunc = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

const writeLocalLog = (logMessage) => {
  console.warn('Reaching');
  logFunc[logMessage.message.key](logMessage.message.value);
};

module.exports = {
  writeLocalLog,
};
