const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logger');

const loginLimiter = rateLimit({
  windowsMs: 60 * 1000,
  max: 5,
  message: {
    message: `To many login attempt form this IP, please try again after 60 second`,
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errLog.log'
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
