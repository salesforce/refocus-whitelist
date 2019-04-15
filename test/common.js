/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const expect = require('chai').expect;
const common = require('../src/common');

describe('test/common.js > ', () => {
  describe('isIpv4 > ', () => {
    const isIpv4 = common.isIpv4;

    const v4 = [
      '0.0.0.0',
      '8.8.8.8',
      '127.0.0.1',
      '100.100.100.100',
      '192.168.0.1',
      '18.101.25.153',
      '123.23.34.2',
      '172.26.168.134',
      '212.58.241.131',
      '128.0.0.0',
      '23.71.254.72',
      '223.255.255.255',
      '192.0.2.235',
      '99.198.122.146',
      '46.51.197.88',
      '173.194.34.134'
    ];

    const v4not = [
      '.100.100.100.100',
      '100..100.100.100.',
      '100.100.100.100.',
      '999.999.999.999',
      '256.256.256.256',
      '256.100.100.100.100',
      '123.123.123',
      'http://123.123.123',
      '1000.2.3.4',
      '999.2.3.4',
      '0000000192.168.0.200',
      '192.168.0.2000000000',
    ];

    it('ok', () => {
      v4.forEach((x) => expect(isIpv4(x)).to.be.true);
      v4not.forEach((x) => expect(isIpv4(x)).to.be.false);
    });
  });
});
