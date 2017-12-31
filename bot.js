// Simple irc bot

var irc = require('irc');
var weather = require('weather-js');
var messageAction = require('./message_action');
var config = {
    channels: ["##yabbot-testing"],
    server: "irc.freenode.org",
    botName: "chalumeau2",
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

    // Add useraction to lastseen database
    messageAction.addToLastSeenDb(message, from);

    // Check if user has queued messages
    if(messageAction.checkIfHasMessage(from)) {
        //bot.say(to, "écoutez moi attentivement :>");
        //return user message(s)
        bot.say(to, from + ": " + messageAction.returnMessages(from));
    }

    if(message.toUpperCase().startsWith(config.botName.toUpperCase())){
        bot.say(to, messageAction.react(message));
    } else if (message.toUpperCase().startsWith('^rand'.toUpperCase())) { // ^rand
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, split_m[1] + ": " + messageAction.rand(split_m[1]));
    } else if (message.toUpperCase().startsWith('^last'.toUpperCase())) { // ^last
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, "vu la dernière fois " + split_m[1] + ": " + messageAction.last_seen(split_m[1]));
    } else if (message.toUpperCase().startsWith('^help'.toUpperCase())) { // ^help
        bot.say(to, from + ": " + messageAction.help());
    } else if (message.toUpperCase().startsWith('^weather'.toUpperCase())) { // ^weather
        //var split_m = message.split(' '); // weather = split_m[1]
        var location = message.substring(8);
        messageAction.meteo(location, function (res) {
            bot.say(to, from + ": " + res);
        });
        //console.log("meteo");
    } else if (message.toUpperCase().startsWith('+1'.toUpperCase())) { // ^collect +1
        var split_m = message.split(' '); // nick = split_m[1]
        if (split_m[1]){
            var rating = messageAction.collectPlus(split_m[1]);
            if (rating != '') {
                bot.say(to, rating); 
            }
        }
        //bot.say(to, from + ": " + messageAction.help());
    } else if (message.toUpperCase().startsWith('^rating'.toUpperCase())) { // ^rating
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, messageAction.rating(split_m[1]));
    } else if (message.toUpperCase().startsWith('-1'.toUpperCase())) { // ^BOOOO
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, messageAction.minus(split_m[1]));
    } else if (message.toUpperCase().startsWith('^save'.toUpperCase())) { // ^save 
        //var split_m = message.split(' '); // nick = split_m[1]
        var note_part = message.substring(6);
        bot.say(to, messageAction.saveNote(from, note_part));
    } else if (message.toUpperCase().startsWith('^notes'.toUpperCase())) { // ^notes (show)
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, from + ": " + messageAction.showNotes(from));
    } else if (message.toUpperCase().startsWith('^clear'.toUpperCase())) { // ^clear (remove user notes)
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, from + ": " + messageAction.clear(from));
    } else if (message.toUpperCase().startsWith('^tell'.toUpperCase())) { // ^tell tell other user
        var split_m = message.split(' '); // nick = split_m[1]
        bot.say(to, from + ": " + messageAction.tell(split_m[1], from, message.substring(7+split_m[1].length)));
    } else if (message.toUpperCase().startsWith('^jour'.toUpperCase())) { // ^jour
        bot.say(to, from + ": " + messageAction.cal_republicain());
    } 

    

});

// Handling private messages // Disabled until further implementation
/*
bot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
    bot.say(from, "I am a bot, I'm sorry but I can't talk to you in private yet.");
});
*/
// Handling error
bot.addListener('error', function(message) {
    console.log('error: ', message);
});
