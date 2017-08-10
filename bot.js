// Simple irc bot

var irc = require('irc');
var messageAction = require('./message_action');
var config = {
    channels: ["##francophonie"],
    server: "irc.freenode.org",
    botName: "yabbot",
    autoRejoin: false,
    autoConnect: true,
    floodProtection: true,
    floodProtectionDelay: 3000
};


var bot = new irc.Client(config.server, config.botName, { channels: config.channels });

console.log("connected to ", config.channels, " on ", config.server);

// Handling messages in room
bot.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    messageAction.addToArchive(message, from);
    if(message.toUpperCase().startsWith(config.botName.toUpperCase())){
        bot.say(to, messageAction.react(message));
    } else if (message.toUpperCase().startsWith('^rand'.toUpperCase())) {
        bot.say(to, messageAction.rand());
    }
    

});

// Handling private messages
bot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
    bot.say(from, "I am a bot, I'm sorry but I can't talk to you in private yet.");
});

// Handling error
bot.addListener('error', function(message) {
    console.log('error: ', message);
});