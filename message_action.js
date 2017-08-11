var locallydb = require('locallydb');
var dateFormat = require('dateformat');
var weather = require('weather-js');

var slogans = ['?', 'oui?', 'mhm?', '...', 'demande à debianero!', 'ouais?', 'non.', 'non!'];
var commands = ['^rand', '^last', '^help', '^weather'];


var db = new locallydb('./mydb');
var collection = db.collection('logfile');

module.exports = {
    react: function(msg) {
        // Pick a random slogan and return it
        return slogans[Math.floor(Math.random()*slogans.length)];    
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
            var datestring = dateFormat(d, "dd.mm.yyyy HH:MM") + " ça disait: " + last_item.message;
            return datestring;
        }
        catch(e) {
            console.log(e);
            return '';
        }

    },
    meteo: function(loc, cb){
        var loc_name, loc_temp, temp_string;
        weather.find({search: loc, degreeType: 'C'}, function(err, result) {
            if (err) {
                console.log(err);
            }
            loc_name = result[0].location.name;
            loc_temp = result[0].current.temperature;
            console.log(loc_name, loc_temp);
            temp_string = "La météo en ce moment à " +loc_name + " " + loc_temp + "°C";
            cb(temp_string);
        });
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