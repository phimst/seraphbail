Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;
var _index = require("../Defaults/index.js");
var _communities = require("./communities.js");
var _riskScore = require("../Utils/risk-score.js");
var _adaptiveThrottle = require("../Utils/adaptive-throttle.js");
var _sessionHealth = require("../Utils/session-health.js");
var _donateHandler = require("../Utils/donate-handler.js");
var _index4 = require("../WABinary/index.js");

const makeWASocket = a => {
  const config = {
    ..._index.DEFAULT_CONNECTION_CONFIG,
    ...a
  };
  const sock = (0, _communities.makeCommunitiesSocket)(config);

  // --- seraphbail: anti-ban instrumentation -------------------------------
  const riskScore = (0, _riskScore.createRiskScore)(config.riskScoreOptions);
  const throttle = (0, _adaptiveThrottle.createAdaptiveThrottle)(config.adaptiveThrottleOptions);
  const sessionHealth = (0, _sessionHealth.createSessionHealth)();

  const originalSendMessage = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    if (config.enableAdaptiveThrottle !== false) {
      const { level } = riskScore.getScore();
      await throttle.wait(level);
    }
    let isGroup = false;
    try {
      isGroup = (0, _index4.isJidGroup)(jid);
    } catch (_) {}
    try {
      const result = await originalSendMessage(jid, content, options);
      riskScore.recordSend({ isGroup, success: true });
      throttle.recordResult({ success: true });
      sessionHealth.recordSend(true);
      return result;
    } catch (err) {
      const statusCode = err?.output?.statusCode;
      riskScore.recordSend({ isGroup, success: false });
      throttle.recordResult({ success: false, statusCode });
      sessionHealth.recordSend(false, statusCode);
      throw err;
    }
  };

  sock.ev.on("connection.update", update => {
    if (update.connection === "close") {
      const statusCode = update.lastDisconnect?.error?.output?.statusCode;
      sessionHealth.recordReconnect(statusCode);
    }
  });

  sock.getRiskScore = () => riskScore.getScore();
  sock.getSessionHealth = () => sessionHealth.getHealth();
  sock.getAdaptiveDelay = riskLevel => throttle.getDelay(riskLevel ?? riskScore.getScore().level);

  // --- seraphbail: opt-in donate command ----------------------------------
  (0, _donateHandler.attachDonateCommand)(sock, config, sock.logger);

  return sock;
};
var _default = exports.default = makeWASocket;
