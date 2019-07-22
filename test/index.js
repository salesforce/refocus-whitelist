/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const { startWithKafkaLogging } = require('../src/index');
const sinon = require('sinon');
const logger = require('../src/logger');
const expect = require('chai').expect;

describe.only('test/unit/kafkaConfig.js getConfig', () => {
  it('Exits when error is called', () => {
    sinon.stub(process, 'exit');
    sinon.stub(logger, 'initKafkaLoggingProducer').returns(Promise.reject());
    startWithKafkaLogging().then(() => {
      sinon.assert.calledOnce(process.exit);
    });
  });
});
