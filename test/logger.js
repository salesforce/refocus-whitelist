/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const { initKafkaLoggingProducer, writeLog } = require('../src/logger');
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
    initKafkaLoggingProducer(errorCallback);
    expect(errorCallback.calledOnce).to.be.true;
    KafkaProducer.Producer.restore();
  });

  it('Happy path:call producer with the right args, call the init function and send', () => {
    config.kafkaLogging = 'true';
    config.localLogging = 'true';
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns((new Promise(() => { })));
    const initMock = sinon.fake();
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: (message) => sendMock(),
    });
    initKafkaLoggingProducer();
    sinon.assert.calledWith(producerMock, {
      connectionString: 'test-url',
      ssl: {
        cert: 'test-cert',
        key: 'test-key',
      },
    });
    sinon.assert.calledOnce(initMock);
    writeLog('test-value', 'info', 'test-topic', localWriteCallback);
    sinon.assert.calledOnce(sendMock);
    expect(localWriteCallback.calledOnce).to.be.true;
    KafkaProducer.Producer.restore();
  });

  it('Happy path: local logging off', () => {
    config.kafkaLogging = 'true';
    config.localLogging = false;
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns((new Promise(() => { })));
    const initMock = sinon.fake();
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: (message) => sendMock(),
    });
    initKafkaLoggingProducer();
    sinon.assert.calledWith(producerMock, {
      connectionString: 'test-url',
      ssl: {
        cert: 'test-cert',
        key: 'test-key',
      },
    });
    sinon.assert.calledOnce(initMock);
    writeLog('test-value', 'info', 'test-topic', localWriteCallback);
    sinon.assert.calledOnce(sendMock);
    expect(localWriteCallback.calledOnce).to.be.false;
    KafkaProducer.Producer.restore();
  });

  it('Send throws an error',  () => {
    config.kafkaLogging = 'true';
    const initMock = sinon.fake();
    const sendPromise = new Promise(() => {
      throw new Error();
    });
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => initMock(),
      send: (message) => sendPromise,
    });
    initKafkaLoggingProducer();
    writeLog('test-value', 'info', 'test-topic');
    expect(sendPromise).to.be.eventually.rejected;
    KafkaProducer.Producer.restore();
  });
});
