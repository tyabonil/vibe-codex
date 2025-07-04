/**
 * Review Bots - Main entry point
 */

const HaterBot = require('./bots/hater-bot');
const WhiteKnightBot = require('./bots/white-knight-bot');
const BalanceBot = require('./bots/balance-bot');
const BaseBot = require('./bots/base-bot');
const analysis = require('./utils/analysis');

module.exports = {
  HaterBot,
  WhiteKnightBot,
  BalanceBot,
  BaseBot,
  analysis
};