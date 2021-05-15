const Discord = require("discord.js");
var config = require('./config.js');
const bot = new Discord.Client();
const fs = require('fs')
const DBpass = require('./DBpass.js');

bot.on('ready', () => {
    console.log('bot is ready')
})

bot.login(require('./config'))

//used to denote commands
const prefix = '!'

//usage data
var daysSince = 0
var cannibalismCounter = 0
var lastReference = "Huh, it's never been brought up!"
var mysql = require('mysql');

const { createConnection } = require('mysql');

const database = createConnection({
  host: 'localhost',
  user: 'hannibot',
  password: DBpass,
  database: 'hannibotDB',
});

database.connect();

//TODO something better than just string arrs for this
//string array for !lecter command
var quotes = [
	"",
   	"When the fox hears the rabbit scream, he comes a-runnin', but not to help!",
    	"I never feel guilty eating anything.",
    	"Discourtesy is unspeakably ugly to me.",
    	"Without death, we'd be at a loss. It's the prospect of death that drives us to greatness.",
        "I do wish we could chat longer, but I'm having an old friend for dinner.",
        "Well, whaddya know? A human sandwich. (Looks inside) Wouldn't you know, it needs some mustard.",
]

// console.log("user pattern: " + Discord.MessageMentions.USERS_PATTERN);

//TODO as above, so below
var keywords = [
	/cannibal(ismo?)?/i,
        /eat(ing)? (people|him|her|them|you|flesh|me|the rich)/i,
        /soylent green/i,
        /yummy flesh/i,
        /vore/i,
	/namira/i,
    /(friends|people|humans) are food/i,
    /eat <@!?(\d{17,19})>/ig // <@!?(\d{17,19})> is the regex for a user mention; idk how to elegantly combine regex literals, so I did console.log(Discord.MessageMentions.USERS_PATTERN) and copy-pasted it here
]

//reads in the value stored in the daysSince and cannibalismCounter file to the var
fs.readFile('daysSince.txt', 'utf8', (err, data) => {
    if(err) {
        console.error(err)
        return
    }
    console.log('days since: '+data)
    daysSince = Number(data)
    console.log('read daysSince file successfully')
})

fs.readFile('cannibalismCounter.txt', 'utf8', (err, data) => {
	if(err) {
		console.error(err)
		return
	}
	console.log('cannibalism Counter: '+data)
	cannibalismCounter = Number(data)
	console.log('read cannibalismCounter file successfully')
})

//counter for incrementing daysSince var every 24 hours
var interval = setInterval(increment, 86400000)
function increment() {
    daysSince++
    fs.writeFile('daysSince.txt', daysSince, err => {
        if(err) {
            console.error(err)
            return
        }
        console.log('incremented DaysSince count successfully')
    })
}

//on message, perform various checks
bot.on('message', async (msg) => {
	
    //this is here because I want it be, no other reason
    if(!msg.content.startsWith(prefix)) {
	    for(i = 0; i < keywords.length; i++) {

		//if msg contains reference, reset daysSince and increment cannibalismCounter
		    if(keywords[i].test(msg.content) && !msg.author.bot && !(msg.guild === null)) {
		        cannibalismCounter++
		        daysSince = 0
		        lastReference = msg.content
                msg.react('🍴')

                fs.writeFile('lastTime.txt', lastReference.toString(), err => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('lastTime logged successfully')
                })

		        fs.writeFile('cannibalismCounter.txt', cannibalismCounter.toString(), err => {
			    if (err) {
			        console.error(err)
			        return
			    }
			    console.log('incremented cannibalismCounter count successfully')
		        })

		        fs.writeFile('daysSince.txt', daysSince.toString(), err => {
			    if (err) {
			        console.error(err)
			        return
			    }
			    console.log('reset DaySince count successfully')
		        })
		        lastMentionedDate = Date()
		        console.log(cannibalismCounter)
		        return
		    }
	    }
	    return
    }

    //because every good bot has one
    if(msg.content.toLowerCase().startsWith("!help")) {
        msg.channel.send("\`\`\`!help: shows this menu.\n!counter: see how long it has been since cannibalism was mentioned in this server.\n!wordcount: see how many times cannibalism has been mentioned in this server.\n!lecter: get a quote from everybody's favorite cannibal!\n!history: relays the tale of how Hannibot-Lecter came to be.\n!lasttime: shows the last message the contained reference to cannibalism.\n\ncontribute at: https://github.com/NotForProffitt/Hannibot-Lecter\n\nContact ProbablyNotAFurry#6782 for issues, questions, or comments.\`\`\`")
    	return
    }

    //responds with the amount of days since cannibalism was last mentioned
    if(msg.content.toLowerCase().startsWith("!counter")) {
        console.log('counter call')
        //nasty ternary operation  because bendy is a grammer stickler >:(
        daysSince != 1 ? msg.channel.send(daysSince + " days since cannibalism was last mentioned in this server.") : msg.channel.send(daysSince + " day since cannibalism was last mentioned in this server.")
	    return
    }

    //sends the amount of times the word cannibalism has been said in the server
    if(msg.content.toLowerCase().startsWith("!wordcount")) {
        console.log('word count')
        fs.readFile('cannibalismCounter.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('cannibalismCounter: '+data)
            cannibalismCounter = Number(data)

	    //nasty ternary operation  because bendy is a grammer stickler >:(
	    cannibalismCounter == 1 ? msg.channel.send("Cannibalism has been mentioned 1 time in this server. Delicious!") : msg.channel.send("Cannibalism has been mentioned " + cannibalismCounter + " times in this server. Delicious!");
            console.log('read cannibalismCounter file successfully')
        })
    	return
    }

    //sends a quote from Hannibal Lector chosen at random from an array of responses
    if (msg.content.toLowerCase().startsWith("!lecter")) {
        console.log('lecter quote')
        msg.channel.send(quotes[Math.floor(Math.random() * 4) + 1])
	return
    }

    //regales us with the grand tale of how Hannibot lecter came to be
    if (msg.content.toLowerCase().startsWith("!history")) {
        console.log("history")
        msg.channel.send("\n> History of Hannibot-Lecter:\n> 12/4/20: the first mention (conceptually)\n\`\`\`Charleston Boole: I will eat the server\`\`\`\n> 1/21/20: the first counter\n\`\`\`Adrienne: Days since cannibalism: 0\`\`\`\n> 1/27/21: bot suggested\n\`\`\`Jesus: someone make a cannibalism counter bot\`\`\`\n> 1/30/21: bot created\n\`\`\`Server notification: Glad you're here, Hannibot Lecter.\`\`\`")
    	return
    }
    
    //added persistent storage for lastTime, but there's probably some vudu going on here with local variables that I'm too tired to fix 
    if(msg.content.toLowerCase().startsWith("!lasttime")) {
        fs.readFile("lastTime.txt", (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            lastReference = data.toString()
            msg.channel.send("\"" + lastReference + "\"")
        })

	return
    }
	
}
)
