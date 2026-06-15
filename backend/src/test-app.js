console.log('Starting test-app');
try {
  const express = require('express');
  console.log('express ok');
  const cors = require('cors');
  console.log('cors ok');
  const helmet = require('helmet');
  console.log('helmet ok');
  const rateLimit = require('express-rate-limit');
  console.log('rateLimit ok');

  // Try dotenv
  require('dotenv').config({ path: '../.env' });
  console.log('dotenv ok');

  require('../app.js');
  console.log('app.js loaded ok!');
} catch (e) {
  console.error(e);
}
