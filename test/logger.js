/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const expect = require('chai').expect;
const { initKafkaLoggingProducer, writeLog } = require('../src/logger');
const KafkaProducer = require('no-kafka');
const sinon = require('sinon');
const config = require('../src/config');

describe('test/logger.js > ', () => {

  it('init producer fails, ', () => {
    config.kafkaLogging = 'true';
    const initMock = sinon.stub().returns(Promise.resolve());
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: Promise.resolve(initMock()),
    });
    const errorCallback = sinon.spy();
    initKafkaLoggingProducer(errorCallback).catch(() => {
      expect(errorCallback.calledOnce).to.be.true;
    });
    KafkaProducer.Producer.restore();
  });

  it('Happy path:call producer with the right args, call the init function and send', () => {
    config.kafkaLogging = 'true';
    config.localLogging = true;
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns(Promise.resolve());
    const initMock = sinon.stub().returns(Promise.resolve());
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => Promise.resolve(initMock()),
      send: (message) => Promise.resolve(sendMock(message)),
    });
    initKafkaLoggingProducer().then(() => {
      sinon.assert.calledWith(producerMock, {
        connectionString: 'test-url',
        ssl: {
          cert: 'test-cert',
          key: 'test-key',
        },
      });
      sinon.assert.calledOnce(initMock);
      writeLog('test-value', 'info', 'test-topic', localWriteCallback).then(() => {
        sinon.assert.calledOnce(sendMock);
        sinon.assert.calledOnce(localWriteCallback);
      });
      KafkaProducer.Producer.restore();
    });
  });

  it('Happy path: local logging off', () => {
    config.kafkaLogging = 'true';
    config.localLogging = false;
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns(Promise.resolve());
    const initMock = sinon.stub().returns(Promise.resolve());
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => Promise.resolve(initMock()),
      send: (message) => Promise.resolve(sendMock(message)),
    });
    initKafkaLoggingProducer().then(() => {
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
    });
    KafkaProducer.Producer.restore();
  });

  it('Send throws an error', () => {
    config.kafkaLogging = 'true';
    config.localLogging = false;
    const localWriteCallback = sinon.spy();
    const sendMock = sinon.stub().returns(Promise.reject());
    const initMock = sinon.stub().returns(Promise.resolve());
    const producerMock = sinon.stub(KafkaProducer, 'Producer').returns({
      init: () => Promise.resolve(initMock()),
      send: (message) => Promise.resolve(sendMock(message)),
    });
    initKafkaLoggingProducer().then(() => {
      sinon.assert.calledOnce(initMock);
      writeLog('test-value', 'info', 'test-topic', localWriteCallback).then(() => {
        sinon.assert.calledOnce(sendMock);
        expect(localWriteCallback.calledOnce).to.be.true;
      });
    });
    KafkaProducer.Producer.restore();
  });
});
