/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const KafkaProducer = require('no-kafka');
const featureToggles = require('feature-toggles');
const config = require('./kafkaLoggingConfig').getConfig();

let producer;
const initKafkaLoggingProducer = () => {
  if (featureToggles.isFeatureEnabled('kafkaLogging')) {
    producer = new KafkaProducer.Producer({
      connectionString: config.connectionString,
      ssl: {
        cert: config.sslCert,
        key: config.sslKey,
      },
    });
    return producer.init().catch((err) => {
      throw new Error(`Failed to initialized Kafka producer for logging, error: ${err}`);
    });
  }

  return Promise.resolve();
};

const logFunc = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  trace: console.log,
  debug: console.log,
};

const writeLog = (message, key = 'info', topic = config.topic, callback = console.log) => {
  const value = JSON.stringify({
    messageTime: new Date(),
    message,
  });
  const logMessage = {
    topic,
    partition: 0,
    message: {
      key,
      value,
    },
  };
  let promise;
  if (featureToggles.isFeatureEnabled('kafkaLogging')) {
    promise = producer.send(logMessage).catch(err => {
      callback(`Sending the log message to Kafka cluster failed, retrying, error: ${err}`);
      producer.send(logMessage); // retry again if failed
    });
  }

  if (featureToggles.isFeatureEnabled('localLogging')) {
    callback('Local logging is turned on');
    logFunc[logMessage.message.key](message);
  }

  return promise ? promise : Promise.resolve();
};

module.exports = {
  initKafkaLoggingProducer,
  writeLog,
  error: (message) => writeLog(message, 'error'),
  warn: (message) => writeLog(message, 'warn'),
  info: (message) => writeLog(message, 'info'),
  debug: (message) => writeLog(message, 'debug'),
  verbose: (message) => writeLog(message, 'verbose'),
  silly: (message) => writeLog(message, 'silly'),
};
