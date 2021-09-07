const Discord = require("discord.js");
var config = require('./config.js');
const fs = require('fs')
const DBpass = require('./DBpass.js');
var mysql = require('mysql')
const bot = new Discord.Client();

bot.login(require('./config'))

bot.on('ready', () => {
    console.log('bot is ready')
})

//used to denote commands
const prefix = '!'

//usage data
var daysSince = 0
var cannibalismCounter = 0
var lastReference = "nothing here!"

const {createConnection} = require('mysql')

const database = createConnection({
  host: 'localhost',
  user: 'hannibot',
  password: DBpass,
  database: 'HannibotDB',
});

database.connect(err => {
    //Console log if there is an error
    if (err) return console.log(err);
    //Otherwise
    console.log(`connected to hannibotDB`);
});

bot.on("guildCreate", (guild) => {
    // This event triggers when the bot joins a guild.    
    console.log(`Joined new guild: ${guild.name}`)
    //sanitized SQL input
    database.query("INSERT INTO guild (guildID, cannibalismCounter, daysSince, lastTime) VALUES (?,1,0,'?') ON DUPLICATE KEY UPDATE cannibalismCounter = cannibalismCounter + 1, daysSince = 0, lastTime = '?';",[
        database.escape(guild.id.toString()),
        database.escape(lastReference),
        database.escape(lastReference)
    ])
});

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

//TODO as above, so below
var keywords = [
	/cannibal(ismo?)?/i,
    / eat(ing)? (people|him|her|them|you|flesh|me|the rich)/i,
    /soylent green/i,
    /yummy flesh/i,
    /vore/i,
	/namira/i,
    /(friends|people|humans) are food/i,
    /eat <@!?(\d{17,19})>/ig // <@!?(\d{17,19})> is the regex for a user mention; idk how to elegantly combine regex literals, so I did console.log(Discord.MessageMentions.USERS_PATTERN) and copy-pasted it here
]

//counter for incrementing daysSince var every 24 hours
var interval = setInterval(increment, 86400000)
function increment() {
    daysSince++
    database.query("UPDATE guild SET daysSince = daysSince + 1;")
}

var intervalPing = setInterval(ping, 25200000)
function ping() {
    database.query("SELECT 1;")
}

//on message, perform various checks
bot.on('message', async (msg) => {
    //this is here because I want it be, no other reason
    //checking if the message is not a command, then checks for reference to cannibalism
    if(!msg.content.startsWith(prefix)) {
	    for(i = 0; i < keywords.length; i++) {
		//if msg contains reference, reset daysSince and increment cannibalismCounter
		    if(keywords[i].test(msg.content) && !msg.author.bot && !(msg.guild === null)) {
                msg.react('🍴')
                var server = msg.guild.id.toString()
		        daysSince = 0
		        lastReference = msg.content

                //sanitized SQL input
                database.query("UPDATE guild SET cannibalismCounter = cannibalismCounter + 1, daysSince = 0, lastTime = ''?'' WHERE guildID = ?;",[
                    database.escape(lastReference),
                    database.escape(server)
                ])
		       
		        lastMentionedDate = Date()
		        console.log('Counter update: ' + cannibalismCounter)
		        return
		    }
	    }
	    return
    }

    //because every good bot has one
    if(msg.content.toLowerCase() === "!help") {
        msg.channel.send("\`\`\`!help: shows this menu.\n!counter: see how long it has been since cannibalism was mentioned in this server.\n!wordcount: see how many times cannibalism has been mentioned in this server.\n!lecter: get a quote from everybody's favorite cannibal!\n!history: relays the tale of how Hannibot-Lecter came to be.\n!lasttime: shows the last message the contained reference to cannibalism.\n\ncontribute at: https://github.com/NotForProffitt/Hannibot-Lecter\n\nContact Bisclavret#6782 for issues, questions, or comments.\`\`\`")
    	console.log('!help call in guild \"' + msg.guild.name + '\"')
        return
    }

    //responds with the amount of days since cannibalism was last mentioned
    if(msg.content.toLowerCase() === "!counter") {
        database.query('SELECT daysSince FROM guild WHERE guildID = ' + msg.guild.id.toString(), function (error, results, fields) {
            const result = JSON.parse(JSON.stringify(results[0].daysSince));
            console.log('!counter call: \"' + result + '\" in guild \"' + msg.guild.name + '\"')
            //nasty ternary operation  because bendy is a grammer stickler >:(
            result != 1 ? msg.channel.send(result + " days since cannibalism was last mentioned in this server.") : msg.channel.send(result + " day since cannibalism was last mentioned in this server.")
        })
	    return
    }

    //sends the amount of times the word cannibalism has been said in the server
    if(msg.content.toLowerCase() === "!wordcount") {
            //sql fun 
            database.query('SELECT cannibalismCounter FROM guild WHERE guildID = ' + msg.guild.id.toString(), function (error, results, fields) {
                const result = JSON.parse(JSON.stringify(results[0].cannibalismCounter));
                console.log('!wordcount call: \"' + result + '\" in guild \"' + msg.guild.name+ '\"')
                //nasty ternary operation because bendy is a grammer stickler >:(
                result != 1 ? msg.channel.send("Cannibalism has been mentioned "+ result + " times in this server. Delicious!") : msg.channel.send("Cannibalism has been mentioned "+ result + " time in this server. Delicious!") 
            })  
    	return
    }

    //sends a quote from Hannibal Lector chosen at random from an array of responses
    if (msg.content.toLowerCase() === "!lecter") {
        console.log('!lecter call in guild \"' + msg.guild.name + '\"')
        msg.channel.send(quotes[Math.floor(Math.random() * 4) + 1])
	return
    }

    //regales us with the grand tale of how Hannibot Lecter came to be
    if (msg.content.toLowerCase() === "!history") {
        console.log('!history call in guild \"' + msg.guild.name + '\"')
        msg.channel.send("\n> History of Hannibot-Lecter:\n> 12/4/20: the first mention (conceptually)\n\`\`\`Charleston Boole: I will eat the server\`\`\`\n> 1/21/20: the first counter\n\`\`\`Adrienne: Days since cannibalism: 0\`\`\`\n> 1/27/21: bot suggested\n\`\`\`Jesus: someone make a cannibalism counter bot\`\`\`\n> 1/30/21: bot created\n\`\`\`Server notification: Glad you're here, Hannibot Lecter.\`\`\`")
    	return
    }
    
    //returns the last message that referenced cannibalism
    if(msg.content.toLowerCase() === "!lasttime") {
        //sql fun 
        database.query('SELECT lastTime FROM guild WHERE guildID = ' + msg.guild.id.toString(), function (error, results, fields) {
           const result = JSON.parse(JSON.stringify(results[0].lastTime));
           console.log('!lasttime call: \"' + result + '\" in guild \"' + msg.guild.name + '\"')
           msg.channel.send("\"" + result + "\"")
        })
	return
    }
}
)
