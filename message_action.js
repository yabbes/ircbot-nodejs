var locallydb = require('locallydb');
var dateFormat = require('dateformat');
var weather = require('weather-js');


var slogans = ['?', 'oui?', 'mhm?', '...', 'demande à debianero!', 'ouais?', 'non.', 'non!'];
var commands = ['^rand', '^last', '^help', '^weather', '^rating', '^save', '^notes', '^jour', '^clear', '^tell'];


var db = new locallydb('./mydb');
var collection = db.collection('logfile');
var coll_rating = db.collection('rating');
var coll_notes = db.collection('notes');
var coll_tellmessages = db.collection('tellmessages');
var coll_lastseen = db.collection('lastseen');

module.exports = {
    react: function(msg) {
        // Pick a random slogan and return it
        return slogans[Math.floor(Math.random()*slogans.length)];    
    },
    rand: function(nick) {
        //return archive[Math.floor(Math.random()*archive.length)]
        try {
            var query = collection.where({name: nick});
            var num_items = query.items.length;
            console.log("query = " + query.items.length);
            if (num_items == 0) {
                return nick + " s'est jamais pointé dans ce chan."
            }
            var starting_nr = Math.floor(Math.random()*query.items.length);
            //var rand_item = query.items[Math.floor(Math.random()*query.items.length)];
            //console.log("first rand item: " + rand_item.message);
            
            //from random point upwards
            for (var i=starting_nr; i<num_items; i++){
                var rand_item = query.items[i];
                if(rand_item.message.length > 80) {
                    return rand_item.message;
                }
            }
            //from random point downwards
            for (var i=starting_nr; i>0; i--){
                var rand_item = query.items[i];
                if(rand_item.message.length > 80) {
                    return rand_item.message;
                }
            }
            
            return nick + " n'a encore rien dit de remarquable";
        }
        catch(e) {
            console.log(e);
            return nick + " n'as pas encore dit de choses intéressantes.";
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
    /* new last seen for db lastseen update in place 31/12/2017*/
    last_seen: function(nick) {
        try {
            var elem = coll_lastseen.where({name: nick});
            if (elem.items.length === 1) {
                var elem_cid = elem.items[0].cid;
                var d = new Date(elem.items[0].$updated);
                var datestring = dateFormat(d, "dd.mm.yyyy HH:MM") + " ça disait: " + elem.items[0].message;
                return datestring;
            } else {
                return 'Je suis confus.';
            }
            /*
            var query = coll_lastseen.where({name: nick});
            var last_item = query.items[query.items.length-1];
            */
            
            //var datestring = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + " vers " + d.getHours() + " heures. Il / Elle disait: " + last_item.message;
            
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
                return;
            }
            if(result[0]){
                loc_name = result[0].location.name;
                loc_temp = result[0].current.temperature;
                console.log(loc_name, loc_temp);
                temp_string = "La météo en ce moment à " +loc_name + " " + loc_temp + "°C";
                cb(temp_string);
            }
        });
    },
    collectPlus: function(nick) {
        // Check if user new
        //console.log(coll_rating.where({name: nick}));
        if(coll_rating.where({name: nick}).items.length === 0){
            coll_rating.insert([
                {name: nick, rating: 1}
            ]);
        } else { // User exists => update rating
            var elem = coll_rating.where({name: nick});
            var elem_cid = elem.items[0].cid;
            var elem_old_rating = elem.items[0].rating;
            var new_value = elem_old_rating + 1;
            coll_rating.update(elem_cid, {rating: new_value});
        }
        
        coll_rating.save();
        if (new_value % 10 == 0) {
            return 'Wow, ' + nick + ' a déjà encaissé ' + new_value + ' +1'; 
        }
        return '';

    },
    rating: function(nick) {
        // Check +1 rating for user
        var elem = coll_rating.where({name: nick});
        if(elem.items.length != 0){
            return '+1 attribué(s) à ' + nick + ': ' + elem.items[0].rating;
        } else {
            return '+1 attribué(s) à ' + nick + ': 0';
        }

    },
    saveNote: function(nick, note) {
        // save a user note
        var elem = coll_notes.where({name: nick});
        if(elem.items.length === 0) { // has no notes yet
            coll_notes.insert([
                {name: nick, notes: [note]}
            ]);
        } else if (elem.items.length === 1) {
            var elem_cid = elem.items[0].cid;
            var elem_notes = elem.items[0].notes;
            elem_notes.push(note);
            console.log(elem_notes);
            coll_notes.update(elem_cid, {notes: elem_notes});
        }
        coll_notes.save();
        return 'Dac';
    },
    showNotes: function(nick) {
        // Show user notes
        var elem = coll_notes.where({name: nick});
        if(elem.items.length === 0 ) {
            return "j'ai 0 notes là";
        } else if (elem.items.length === 1) {
            var elem_cid = elem.items[0].cid;
            var elem_notes = elem.items[0].notes;
            var notes = '';
            elem_notes.map(function(note, index) {
                notes += '[' +index + ']: ' + note + ' ';
            });
            console.log(notes);
            return notes;
        }
        return "j'ai 0 notes là";
    },
    clear: function(nick) {
        // clear user notes
        console.log(nick);
        var elem = coll_notes.where({name: nick});
        console.log(elem);
        if(elem.items.length === 0) {
            return "0 notes trouvées";
        } else if (elem.items.length === 1) {
            var elem_cid = elem.items[0].cid;
            
            coll_notes.update(elem_cid, {notes: []});
            coll_notes.save();
            return "tes notes ont été supprimées";
        }
    },
    cal_republicain: function() {
        var cal = require('calendrier-republicain');
        var someDay = new Date();
        var republicanString = "nous sommes " + cal.dayOfDecadeName(someDay) + ", le " + cal.dayOfMonth(someDay) + " " + cal.monthName(someDay) + " de l'an " + cal.year(someDay) + " de la Révolution. La journée est sous le signe de " + cal.dayOfYearName(someDay);
        return republicanString;

    },
    tell: function(recipient, sender, message) {
        coll_tellmessages.insert([
                {sender: sender, recipient: recipient, message: message}
            ]);
        coll_tellmessages.save();
        return "dac, je m'en charge";

    },
    checkIfHasMessage: function(nick) {
        try {
            var query = coll_tellmessages.where({recipient: nick});
            //console.log(query);
            if(query.items.length === 0) {
                return false;
            } else {
                return true;
            }
        }
        catch(e) {
            console.log(e);
            return false;
        }

    },
    returnMessages: function(nick) {
        var messages = coll_tellmessages.where({recipient: nick});
        //console.log(messages);
        if(messages.items.length != 0 ) {
            var messagesToReturn = "";
            var cidsToRemove = [];
            for (var i = 0; i<messages.items.length; i++) {
                messagesToReturn += messages.items[i].sender + ' te dit: ' + messages.items[i].message + "\n";
                cidsToRemove.push(messages.items[i].cid); 
            }
            cidsToRemove.map(function (val){
                coll_tellmessages.remove(val);
                }
            )
            coll_tellmessages.save();
            return messagesToReturn;

        }

    },
    minus: function(nick) {
        return nick + ': Boooooooooooooooooooohhhhhhhh !';
    },
    help: function() {
        var cmd_string = '';
        var help_commands_string = commands.join(', ');
        return "I know the following commands: " + help_commands_string;
    },
    addToArchive: function(msg, nick) {
        if (!msg.toUpperCase().startsWith('^'.toUpperCase()) && msg.length > 80){
            
            //only log long messages to archive
            collection.insert([
                {name: nick, message: msg}
            ]);
            collection.save();
        }
        
    },
    addToLastSeenDb: function(msg, nick) {
        //coll_lastseen
        var elem = coll_lastseen.where({name: nick});
        if(elem.items.length === 0) { // no entry yet
            coll_lastseen.insert([
                {name: nick, message: msg}
            ]);
            
        } else if (elem.items.length === 1) {
            var elem_cid = elem.items[0].cid;
            coll_lastseen.update(elem_cid, {message: msg});
        }
        coll_lastseen.save();
    }

};