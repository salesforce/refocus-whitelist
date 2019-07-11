/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

const herokuConfig = {
  topics: process.env.TOPICS ? process.env.TOPICS.split(',').map((string) => string.trim()) : [],
  sslCert: process.env.KAFKA_CLIENT_CERT || '.ssl/client.crt',
  sslKey: process.env.KAFKA_CLIENT_CERT_KEY || '.ssl/client.key',
  connectionString: process.env.KAFKA_URL ? process.env.KAFKA_URL.replace(/\+ssl/g, '') : '',
};

const testConfig = {
  topics: ['foo', 'bar'],
  sslCert: 'test-cert',
  sslKey: 'test-key',
  connectionString: 'test-url',
};

const config = {
  test: testConfig,
  integration: herokuConfig,
  production: herokuConfig,
  staging: herokuConfig,
};

module.exports = {
  getConfig: (environmentName) => {
    if (!environmentName) environmentName = process.env.NODE_ENV;
    return config[environmentName] ? config[environmentName] : config.test;
  },

  kafkaLogging: process.env.KAFKA_LOGGING,
  
  // This env variable, if set to true will write logs locally if kafkaLogging is on.
  localLogging: process.env.LOCAL_LOGGING,
  testExport: {
    herokuConfig,
    testConfig,
  },
};
