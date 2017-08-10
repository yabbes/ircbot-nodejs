var archive = [];
var locallydb = require('locallydb');

var db = new locallydb('./mydb');
var collection = db.collection('logfile');

module.exports = {
    react: function(msg) {
        //console.log("hello from ma, message was: ", msg);
        return "Je sers à rien d'autre qu'à répondre à ^rand";    
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