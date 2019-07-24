/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const { initApp } = require('../src/index');
const sinon = require('sinon');
const logger = require('../src/logger');
const expect = require('chai').expect;

describe('test/unit/kafkaConfig.js getConfig', () => {
  it('Exits when error is called', (done) => {
    sinon.stub(logger, 'initKafkaLoggingProducer').
    returns(Promise.reject(new Error('Error thrown')));
    sinon.spy(logger, 'error');
    initApp().then(() => {
      sinon.assert.calledOnce(logger.error);
    });
    done();
  });
});
