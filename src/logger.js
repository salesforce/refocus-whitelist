/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const KafkaProducer = require('no-kafka');
const configFunctions = require('../src/config');
const config = configFunctions.getConfig();

let producer;
let initSuccess;
const initKafkaLoggingProducer = (errorCallBack = console.error) => {
  try {
    producer = new KafkaProducer.Producer({
      connectionString: config.connectionString,
      ssl: {
        cert: config.sslCert,
        key: config.sslKey,
      },
    });
    return producer.init().then(() => {
      initSuccess = true;
    }).catch(() => {
      initSuccess = false;
      errorCallBack(`Failed to initialized Kafka producer for logging error: ${err}`);
    });
  } catch (err) {
    initSuccess = false;
    errorCallBack(`Failed to initialized Kafka producer for logging error: ${err}`);
    return Promise.resolve();
  }
};

const logFunc = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  trace: console.log,
  debug: console.log,
};

const writeLocalLog = (logMessage) => {
  logFunc[logMessage.message.key](logMessage.message.value);
};

const logger = {
  error: (value) => writeLog(value, 'error'),
  warn: (value) => writeLog(value, 'warn'),
  info: (value) => writeLog(value, 'info'),
  debug: (value) => writeLog(value, 'debug'),
  silly: (value) => writeLog(value, 'trace'),
};

const writeLog = (value, key = 'info', topic = config.topic,
                  localLoggingCallBack = console.log) => {
  const messageValue = {
    sendTimeStamp: new Date(),
    value,
  };
  const logMessage = {
    topic,
    partition: 0,
    message: {
      key,
      value: JSON.stringify(messageValue),
    },
  };
  let promise;
  if (configFunctions.kafkaLogging && initSuccess) {
    promise = producer.send(logMessage).catch(err => {
      localLoggingCallBack('Sending the log message to Kafka cluster failed, ' +
      `writing locally, error: ${err}`);
      writeLocalLog(logMessage);
    });
  }

  if (configFunctions.localLogging || !initSuccess) {
    localLoggingCallBack('Local logging is turned on');
    writeLocalLog(logMessage);
  }

  return promise ? promise : Promise.resolve();
};

module.exports = {
  initKafkaLoggingProducer,
  writeLog,
  logger,
};
