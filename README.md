## ircbot-node

Simple IRC bot for one channel (though you could easily use it for more, too) written in nodejs.

```
npm install
node bot.js
```

### Functionality
- logging with NoSQL very lean [locallydb](https://github.com/btwael/locallydb) database
- Allowing weather queries via [weather-js](https://www.npmjs.com/package/weather-js)
- Telling when user was last seen and fetching a random message for user 
- rating based on +1 given in the channel to user x
   - The bot collects all +1 and can give status reports for each user using ^rand 


### Commands
- ^help
- ^rand {user}
- ^last {user}
- ^weather {location}
- ^rating
