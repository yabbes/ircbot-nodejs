// Simple irc bot

var irc = require('irc');
var config = {
    channels: ["##yabbot"],
    server: "irc.freenode.org",
    botName: "yabbot",
    autoRejoin: false,
    autoConnect: true,
    floodProtection: true,
    floodProtectionDelay: 3000
};

var bot = new irc.Client(config.server, config.botName, { channels: config.channels });

console.log("connected")