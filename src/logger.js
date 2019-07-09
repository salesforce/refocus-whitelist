/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const KafkaProducer = require('no-kafka');
const config = require('../src/config').getConfig();

let producer;
const initProducer = (errorCallBack) => {
  try {
    producer = new KafkaProducer.Producer({
      connectionString: config.connectionString,
      ssl: {
        cert: config.sslCert,
        key: config.sslKey,
      },
    });
    producer.init();
  } catch (err) {
    errorCallBack();
  }
};

const logFunc = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

const writeLocalLog = (logMessage) => {
  logFunc[logMessage.message.key](logMessage.message.value);
};

const logType = {
  ERR: 'error',
  INFO: 'info',
  WARN: 'warn',
};

const writeLog = (value, key = logType.INFO, topic = 'refocus-whitelist') => {
  const logMessage = {
    topic,
    partition: 0,
    message: {
      key,
      value: JSON.stringify(value),
    },
  };
  if (process.env.KAFKA_LOGGING) {
    producer.send(logMessage).catch(() => {
      console.error('Sending the log message to Kafka cluster failed, ' +
        `writing locally, error: ${err}`);
      writeLocalLog(logMessage);
    });
  } else {
    writeLocalLog(logMessage);
  }
};

module.exports = {
  initProducer,
  writeLog,
  logType,
  testExports: {
    writeLocalLog,
  },
};
