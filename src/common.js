/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const trace = require('debug')('refocus-whitelist-trace:common');
const ipRegex = require('ip-regex');

function isIpv4(x) {
  const retval = ipRegex.v4({exact: true, includeBoundaries: true}).test(x);
  trace(`isIpv4(x="%s") ==> %s`, x, retval);
  return retval;
} // isIpv4

module.exports = {
  isIpv4,
};
