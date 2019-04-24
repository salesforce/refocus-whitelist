/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const expect = require('chai').expect;
const whitelistUtils = require('../src/whitelistUtils');

describe('test/whitelistUtils.js > ', () => {
  describe('loadWhitelist > ', () => {
    const loadWhitelist = whitelistUtils.loadWhitelist;

    it('missing env var', () => {
      delete process.env.IP_WHITELIST;
      expect(loadWhitelist()).to.be.false;
    });

    it('empty string', () => {
      process.env.IP_WHITELIST = '';
      expect(loadWhitelist()).to.be.false;
    });

    it('string with only spaces in it', () => {
      process.env.IP_WHITELIST = ' ';
      expect(loadWhitelist()).to.be.false;
    });

    it('comma-separated, trim, ignore extra commas', () => {
      const expected = [[16843009, 16843009], [33686018, 33686018]];
      const testData = [
        '1.1.1.1,2.2.2.2',
        '1.1.1.1 ,2.2.2.2',
        '1.1.1.1 , 2.2.2.2',
        '1.1.1.1 , 2.2.2.2,',
        ',1.1.1.1 , 2.2.2.2,',
        ' ,1.1.1.1 , 2.2.2.2, ',
        '1.1.1.1,,2.2.2.2,',
        '1.1.1.1, ,2.2.2.2,',
      ];
      testData.forEach((x) => {
        process.env.IP_WHITELIST = x;
        expect(loadWhitelist()).to.deep.equal(expected);
      });
    });

    it('sorted', () => {
      process.env.IP_WHITELIST = '4.3.2.1,1.2.3.4, 2.2.2.2-2.2.2.255';
      const expected = [
        [16909060, 16909060],
        [33686018, 33686271],
        [67305985, 67305985],
      ];
      expect(loadWhitelist()).to.deep.equal(expected);
    })
  }); // loadWhitelist

  describe('isWhitelisted > ', () => {
    const isWhitelisted = whitelistUtils.isWhitelisted;

    // 255.0.0.0 - 255.255.255.255, 123.0.0.0 - 124.0.0.100
    const w = [ [ 2063597568, 2080374884 ], [ 4278190080, 4294967295 ] ];

    it('ok', () => {
      expect(isWhitelisted('123.0.0.100', w)).to.be.true;
      expect(isWhitelisted('124.0.0.99', w)).to.be.true;
      expect(isWhitelisted('124.0.10.99', w)).to.be.false;
      expect(isWhitelisted('127.1.2.3', w)).to.be.false;
      expect(isWhitelisted('255.0.0.0', w)).to.be.true;
      expect(isWhitelisted('255.0.0.255', w)).to.be.true;
      expect(isWhitelisted('255.255.255.255', w)).to.be.true;
      expect(isWhitelisted('127.0.0.1', [])).to.be.false;
    });
  }); // isWhitelisted

  describe('_helpers.js > ', () => {
    describe('betweenInclusive >', () => {
      const betweenInclusive = whitelistUtils._helpers.betweenInclusive;

      it('ok', () => {
        expect(betweenInclusive(2, 1, 3)).to.be.true;
        expect(betweenInclusive(0, 1, 50)).to.be.false;
        expect(betweenInclusive(-5, -10, 0)).to.be.true;
        expect(betweenInclusive(5, -10, 0)).to.be.false;
        expect(betweenInclusive(0, 0, 0)).to.be.true;
      });
    }); // betweenInclusive

    describe('ipToLong > ', () => {
      const ipToLong = whitelistUtils._helpers.ipToLong;

      it('ok', () => {
        const n = ipToLong('192.168.1.1');
        expect(n).to.be.a('number');
        expect(n).to.equal(3232235777);
        expect(ipToLong('0.0.0.0')).to.equal(0);
        expect(ipToLong('255.255.255.255')).to.equal(4294967295);
      });
    }); // ipToLong

    describe('numericRangeSorter > ', () => {
      const numericRangeSorter = whitelistUtils._helpers.numericRangeSorter;

      it('ok', () => {
        expect(numericRangeSorter([0, 1], [0, 2])).to.equal(-1);
        expect(numericRangeSorter([1, 1], [0, 1])).to.equal(1);
        expect(numericRangeSorter([1, 1], [1, 1])).to.equal(0);
      });
    }); // numericRangeSorter

    describe('toNumericRange > ', () => {
      const toNumericRange = whitelistUtils._helpers.toNumericRange;

      it('single value (no "-") returns as range', () => {
        expect(toNumericRange('0.0.0.0'))
          .to.deep.equal([0, 0]);
        expect(() => toNumericRange('a.a.a.a')).to.throw(Error);
      });

      it('more than one "-"', () => {
        expect(() => toNumericRange('0.0.0.0-0.0.0.1-'))
          .to.throw(Error)
          .to.have.property('message', 'Invalid Whitelist: "0.0.0.0-0.0.0.1-" ' +
          'must only contain one "-" delimiter.');
        expect(() => toNumericRange('0.0.0.0-0.0.0.1-0.0.0.2')).to.throw(Error);
      });

      it('missing ip address on either side of "-"', () => {
        expect(() => toNumericRange('-0.0.0.0')).to.throw(Error);
        expect(() => toNumericRange('0.0.0.0-')).to.throw(Error);
      });

      it('min must be greater than or equal to max', () => {
        expect(toNumericRange('1.2.3.4 - 1.2.3.4'))
          .to.deep.equal([16909060, 16909060]);
        expect(() => toNumericRange('0.0.0.2-0.0.0.1')).to.throw(Error)
          .to.have.property('message', 'Invalid Whitelist: ' +
          '"0.0.0.1" must be greater than or equal to "0.0.0.2".');
      });
    }); // toNumericRange
  }); // _helpers
});
