// Simple irc bot

var irc = require('irc');
var messageAction = require('./message_action');
var config = {
    channels: ["##yabbot-testing"],
    server: "irc.freenode.org",
    botName: "yabbot-testing",
    autoRejoin: false,
    userName: 'yabbot',
    realName: 'le yabbot',
    autoConnect: true,
    floodProtection: true,
    floodProtectionDelay: 3000
};


var bot = new irc.Client(config.server, config.botName, { channels: config.channels, userName: config.userName, realName: config.realName });

console.log("connected to ", config.channels, " on ", config.server);

// Handling messages in room
bot.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    messageAction.addToArchive(message, from); // log
    if(message.toUpperCase().startsWith(config.botName.toUpperCase())){
        bot.say(to, messageAction.react(message));
    } else if (message.toUpperCase().startsWith('^rand'.toUpperCase())) { // ^rand
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, split_m[1] + ": " + messageAction.rand(split_m[1]));
    } else if (message.toUpperCase().startsWith('^last'.toUpperCase())) { // ^last
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, "vu la dernière fois " + split_m[1] + ": " + messageAction.last(split_m[1]));
    } else if (message.toUpperCase().startsWith('^help'.toUpperCase())) { // ^help
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, from + ": " + messageAction.help());
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