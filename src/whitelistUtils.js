/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const debug = require('debug')('refocus-whitelist:whitelistUtils');
const trace = require('debug')('refocus-whitelist-trace:whitelistUtils');
const utils = require('./common');

const rangeError = {
  notIpv4: (addr) =>
    `Invalid Whitelist: "${addr}" is not a valid IPv4 IP address.`,
  tooManyDashes: (str) =>
    `Invalid Whitelist: "${str}" must only contain one "-" delimiter.`,
  minMaxMixup: (min, max) =>
    `Invalid Whitelist: "${max}" must be greater than or equal to "${min}".`,
};

/**
 * Return true if the number is between the minimum and maximum (inclusive).
 *
 * @param {number} n - a number. This will only be called with a number.
 * @param {number} min - the minimum number. This will only be called with a
 *  number.
 * @param {number} max - the maximum number. This will only be called with a
 *  number greater than or equal to min.
 * @returns {boolean} if the number is between the minimum and maximum
 *  (inclusive).
 */
const betweenInclusive = (n, min, max) => {
  const retval = n >= min && n <= max;
  trace('betweenInclusive(n=%d, min=%d, max=%d) ==> %s', n, min, max, retval);
  return retval;
}; // betweenInclusive

/**
 * Returns numeric representation of the IP address.
 *
 * To convert an IP address to integer notation, each section of the IP address
 * (separated by ".") is multiplied by 256x. In this case, x represents the
 * position of the section from right to left, starting with 0. Here is an
 * example using this formula:
 *  192.168.1.1 = (192 * 256^3) + (168 * 256^2) + (1 * 256^1) + (1 * 256^0)
 *
 * @param {string} addr - the ip address. This is guaranteed to look like a
 *  valid ipv4 string because that is enforced by the express routing
 *  parameter regular expression.
 * @returns {number} numeric representation of the IP address.
 */
const ipToLong = (addr) => {
  const retval = addr.split('.')
    .reduce((i, octet) => (i << 8) + parseInt(octet, 10), 0) >>> 0;
  trace('ipToLong(addr="%s") ==> %d', addr, retval);
  return retval;
}; // ipToLong

/**
 * Assumes a and b are both arrays of two positive numbers.
 *
 * @param {Array<number>} a - an array of two positive numbers
 * @param b - an array of two positive numbers
 * @returns {number}
 */
const numericRangeSorter = (a, b) => {
  const aa = `${a[0]}|${a[1]}`;
  const bb = `${b[0]}|${b[1]}`;
  if (aa < bb) return -1;
  if (aa > bb) return 1;
  return 0;
}; // numericRangeSorter

/**
 *
 * @param str
 * @returns {number[]}
 */
const toNumericRange = (str) => {
  const arr = str.split('-').map((s) => s.trim());

  // Treat a single value (i.e. no "-" delimiter) as shorthand for "x-x"
  if (arr.length === 1) {
    if (!utils.isIpv4(arr[0])) {
      throw new Error(rangeError.notIpv4(arr[0]));
    };

    const val = ipToLong(arr[0]);
    const retval = [val, val];
    trace('toNumericRange(str="%s") ==> %o', str, retval);
    return retval;
  }

  if (arr.length !== 2) {
    throw new Error(rangeError.tooManyDashes(str));
  }

  if (!utils.isIpv4(arr[0])) {
    throw new Error(rangeError.notIpv4(arr[0]));
  };

  if (!utils.isIpv4(arr[1])) {
    throw new Error(rangeError.notIpv4(arr[1]));
  };

  const min = ipToLong(arr[0]);
  const max = ipToLong(arr[1]);
  if (max < min) {
    throw new Error(rangeError.minMaxMixup(arr[0], arr[1]));
  }

  const retval = [min, max];
  trace('toNumericRange(str="%s") ==> %o', str, retval);
  return retval;
}; // toNumericRange

_helpers = {
  betweenInclusive,
  ipToLong,
  numericRangeSorter,
  toNumericRange,
  rangeError,
};

/**
 * Convert the string to an array of numeric ranges. Each numeric range
 * is a two-element array using the numeric representations of the two ip
 * addresses. Returns array sorted in ascending order.
 *
 * If env var not defined, return false, which means there is no whitelist
 * defined, i.e. allow every ip address.
 *
 * @throws Error if invalid ipv4 address or invalid range (e.g. too many dashes
 *  or max<min)
 */
function loadWhitelist() {
  if (!process.env.hasOwnProperty('IP_WHITELIST') ||
    !process.env.IP_WHITELIST || !process.env.IP_WHITELIST.trim()) {
    debug('[process.env.IP_WHITELIST=%s] init() ==> %o',
      process.env.IP_WHITELIST, false);
    return false; // allow every ip address
  }

  retval = process.env.IP_WHITELIST.split(',')
    .map((s) => s.trim()) // ignore spaces between elements
    .filter((s) => s) // ignore empty elements
    .map(_helpers.toNumericRange) // generate numeric range for each element
    .sort(_helpers.numericRangeSorter);

  debug('loadWhitelist(str="%s") ==> %o', process.env.IP_WHITELIST, retval);
  return retval;
} // loadWhitelist

/**
 * Returns true if the addressToTest is in at least one of the ranges in the
 * whitelist.
 *
 * @param {string} addressToTest - the ip address to test. This is guaranteed
 *  to look like a valid ipv4 string because that is enforced by the express
 *  routing parameter regular expression.
 * @param {Array<Array<number, number>>} whitelist - an array of whitelisted
 *  ip address ranges, where each range is an array of two numbers.
 * @returns {boolean} true if the addressToTest is in at least one of the
 *  ranges in the whitelist.
 */
function isWhitelisted(addressToTest, whitelist) {
  const n = _helpers.ipToLong(addressToTest);
  retval = whitelist.some((range) =>
    _helpers.betweenInclusive(n, range[0], range[1]));
  trace('isWhitelisted(addressToTest="%s", whitelist=%o) ==> %s',
    addressToTest, whitelist, retval);
  return retval;
} // isWhitelisted

module.exports = {
  _helpers,
  isWhitelisted,
  loadWhitelist,
};
