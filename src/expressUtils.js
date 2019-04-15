/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
const debug = require('debug')('refocus-whitelist:expressUtils');
const express = require('express');
const whitelistUtils = require('./whitelistUtils');
const common = require('./common');
const verifyAddressRoute = '/v1/verify/:address';
let whitelist;

const preprocess = (req, res, next) => {
  res.locals.start = Date.now();
  res.locals.address = req.params.address;

  if (!common.isIpv4(res.locals.address)) { // allow = false
    return next({
      message: `Invalid IPv4 address: "${res.locals.address}"`,
      status: 400,
    });
  }

  next();
}; // preprocess

const process = (req, res, next) => {

  if (!whitelist) {
    res.locals.allow = true;
    return next();
  }

  if (whitelist.length === 0) {
    res.locals.allow = false;
    return next();
  }

  res.locals.allow =
    whitelistUtils.isWhitelisted(res.locals.address, whitelist);
  next();
}; // process

const finish = (req, res, next) => {
  const j = { address: res.locals.address, allow: res.locals.allow };
  debug('Verify %s ==> %s (%dms)', j.address, j.allow,
    Date.now() - res.locals.start);
  res.json(j);
}; // finish

const errorHandler = (err, req, res, next) => {
  debug('Verify %s ==> %o (%dms)', res.locals.address, err,
    Date.now() - res.locals.start);
  res.set('content-type', 'text/plain');
  res.status(err.status).send(err.message);
}; // errorHandler

/**
 * Set up the route and handlers. Start the server.
 */
function init(w) {
  whitelist = w;
  const app = express();
  app.get(verifyAddressRoute, preprocess, process, finish, errorHandler);
  return app;
} // init

module.exports = {
  init,
};
