var archive = [];

module.exports = {
    react: function(msg) {
        //console.log("hello from ma, message was: ", msg);
        return "Je sers à rien d'autre qu'à répondre à ^rand";    
    },
    rand: function() {
        return archive[Math.floor(Math.random()*archive.length)]
    },
    addToArchive: function(msg, nick) {
        if (!msg.toUpperCase().startsWith('^rand'.toUpperCase())){
            archive.push(nick + ': ' + msg);
            if (archive.length % 10 == 0) {
                console.log("length of archive: ", archive.length);
            }
        }
        
    }

};