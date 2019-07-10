/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const expect = require('chai').expect;
const { initProducer, writeLog, logType } = require('../src/logger');
const KafkaProducer = require('no-kafka');
const sinon = require('sinon');
const config = require('../src/config');

describe('test/logger.js > ', () => {
  let producerMock;
  it('Happy path:call producer with the right args, call the init function and send', () => {
    config.kafkaLogging = 'true';
    const sendMock = sinon.stub().returns((new Promise(() => { })));
    const initMock = sinon.fake();
    producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: () => sendMock(),
    });
    initProducer();
    sinon.assert.calledWith(producerMock, {
      connectionString: 'test-url',
      ssl: {
        cert: 'test-cert',
        key: 'test-key',
      },
    });
    sinon.assert.calledOnce(initMock);
    writeLog('test-value', logType.INFO, 'test-topic');
    sinon.assert.calledOnce(sendMock);
  });

  it('Calls the write local log if process.env.KAFKA_LOGGING KAFKA_LOGGING not defined', () => {
    config.kafkaLogging = null;
    console.warn(config.kafkaLogging);
    const initMock = sinon.fake();
    producerMock.restore();
    sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: () => {},
    });
    writeLog('test-value', logType.INFO, 'test-topic');
  });
});
