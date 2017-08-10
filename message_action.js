var archive = [];
var locallydb = require('locallydb');
var dateFormat = require('dateformat');
var commands = ['^rand', '^last', '^help'];

var db = new locallydb('./mydb');
var collection = db.collection('logfile');

module.exports = {
    react: function(msg) {
        //console.log("hello from ma, message was: ", msg);
        return "Je sers à rien d'autre qu'à répondre à ^rand; ca a changé, essayez ^help";    
    },
    rand: function(nick) {
        //return archive[Math.floor(Math.random()*archive.length)]
        try {
            var query = collection.where({name: nick});
            var rand_item = query.items[Math.floor(Math.random()*query.items.length)];
            return rand_item.message;
        }
        catch(e) {
            console.log(e);
            return '';
        }
            
        
    },
    last: function(nick) {
        try {
            var query = collection.where({name: nick});
            var last_item = query.items[query.items.length-1];
            var d = new Date(last_item.$created);
            //var datestring = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + " vers " + d.getHours() + " heures. Il / Elle disait: " + last_item.message;
            var datestring = dateFormat(d, "dd.mm.yyyy HH:MM")
            return datestring;
        }
        catch(e) {
            console.log(e);
            return '';
        }

    },
    help: function() {
        var help_commands_string = commands.map(function(cmd) {
            return cmd;
        });
        return "I know the following commands: " + help_commands_string;
    },
    addToArchive: function(msg, nick) {
        if (!msg.toUpperCase().startsWith('^rand'.toUpperCase())){
            //archive.push(nick + ': ' + msg); LOG to Locallydb
            collection.insert([
                {name: nick, message: msg}
            ]);
            collection.save();
        }
        
    }

};