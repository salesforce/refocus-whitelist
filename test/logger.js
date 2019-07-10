/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const expect = require('chai').expect;
const { initProducer, writeLog } = require('../src/logger');
const KafkaProducer = require('no-kafka');
const sinon = require('sinon');
const config = require('../src/config');

describe('test/logger.js > ', () => {

  it('init producer fails, ', () => {
    config.kafkaLogging = 'true';
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => {
        throw new Error();
      },
    });
    const errorCallback = sinon.spy();
    initProducer(errorCallback);
    expect(errorCallback.calledOnce).to.be.true;
    KafkaProducer.Producer.restore();
  });

  it('Happy path:call producer with the right args, call the init function and send', () => {
    config.kafkaLogging = 'true';
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns((new Promise(() => { })));
    const initMock = sinon.fake();
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: (message) => sendMock(),
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
    writeLog('test-value', 'info', 'test-topic', localWriteCallback);
    sinon.assert.calledWith(sendMock);
    expect(localWriteCallback.calledOnce).to.be.false;
    KafkaProducer.Producer.restore();
  });

  it('Calls the write local log if process.env.KAFKA_LOGGING KAFKA_LOGGING not defined', () => {
    config.kafkaLogging = null;
    const initMock = sinon.fake();
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: () => { },
    });
    const localWriteCallback = sinon.spy();
    writeLog('test-value', 'info', 'test-topic', localWriteCallback);
    expect(localWriteCallback.calledOnce).to.be.true;
    KafkaProducer.Producer.restore();
  });

  it('Calls the write local log if sends throws error', () => {
    config.kafkaLogging = 'true';
    const initMock = sinon.fake();
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: () => (new Promise((resolve, reject) => {
        throw new Error();
      })),
    });
    const localWriteCallback = sinon.spy();
    writeLog('test-value', 'info', 'test-topic', localWriteCallback);
    expect(localWriteCallback.calledOnce).to.be.true;
    KafkaProducer.Producer.restore();
  });
});
