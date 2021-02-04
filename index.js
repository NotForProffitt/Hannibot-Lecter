const Discord = require("discord.js");
var config = require('./config.js');

const bot = new Discord.Client();
const fs = require('fs')

bot.on('ready', () => {
    console.log('bot is ready')
})

//bot.login(token)
bot.login(require('./config'))

var daysSince = 0

//reads in the value stored in the daysSince file to the var
fs.readFile('daysSince.txt', 'utf8', (err, data) => {
    if(err) {
        console.error(err)
        return
    }
    console.log(data)
    daysSince = Number(data)
    console.log('read daysSince file successfully')
})

var cannibalismCounter = 0

const prefix = '!'

//string array for !lecter command
var quotes = [
	"",
   	"When the fox hears the rabbit scream, he comes a-runnin', but not to help!",
    	"I never feel guilty eating anything.",
    	"Discourtesy is unspeakably ugly to me.",
    	"Without death, we'd be at a loss. It's the prospect of death that drives us to greatness.",
    	"I do wish we could chat longer, but I'm having an old friend for dinner."
]

var keywords = [
	"cannibalism",
        "cannibal",
        "eat people",
	"eating people",
	"eat him",
	"eat her",
	"eat them",
	"eat you",
	"eat flesh",
	"eat me",
        "soylent green",
        "yummy flesh",
        "eat the rich",
        "vore",
	"namira",
	"canibalismo"
]

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

bot.on('message', async (msg) => {
    for(i = 0; i < keywords.length; i++) {
	
	//if msg contains reference, reset daysSince and increment cannibalismCounter
        if(msg.content.toLowerCase().includes(keywords[i]) && !msg.author.bot && !(msg.guild === null)) {
            cannibalismCounter++
	    daysSince = 0

            fs.writeFile('cannibalismCounter.txt', cannibalismCounter, err => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('incremented cannibalismCounter count successfully')
            })

            fs.writeFile('daysSince.txt', daysSince, err => {
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

    //this is here because I want it be, no other reason
    if(!msg.content.startsWith(prefix)) {
        console.log('no prefix')
        return
    }

    //because every good bot has one
    if(msg.content.toLowerCase().startsWith("!help")) {
        msg.reply("\`\`\`!help: shows this menu.\n!counter: see how long it has been since cannibalism was mentioned in this server.\n!wordcount: see how many times cannibalism has been mentioned in this server.\n!lecter: get a quote from everybody's favorite cannibal!\n\ncontribute at: https://github.com/NotForProffitt/Hannibot-Lecter\n\nContact ProbablyNotAFurry#6782 for issues, questions, or comments.\`\`\`")
    }

    //responds with the amount of days since cannibalism was last mentioned
    if(msg.content.toLowerCase().startsWith("!counter")) {
        console.log('counter call')
        msg.reply(daysSince + " days since cannibalism was last mentioned in this server.")

    }

    //replies with the amount of times the word cannibalism has been said in the server
    if(msg.content.toLowerCase().startsWith("!wordcount")) {
        console.log('word count')
        fs.readFile('cannibalismCounter.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            console.log(data)
            cannibalismCounter = Number(data)

	    //a whole if/else block because bendy is a grammer stickler >:(
	    //if (cannibalismCounter == 1) msg.reply("Cannibalism has been mentioned 1 time in this server. Delicious!")
	    //else msg.reply("Cannibalism has been mentioned " + cannibalismCounter + " times in this server. Delicious!")

	    cannibalismCounter == 1 ? msg.reply("Cannibalism has been mentioned 1 time in this server. Delicious!") : msg.reply("Cannibalism has been mentioned " + cannibalismCounter + " times in this server. Delicious!");

            console.log('read cannibalismCounter file successfully')
        })
    
    }

    //replies with a quote from Hannibal Lector chosen at random from an array of responses
    if (msg.content.toLowerCase().startsWith("!lecter")) {
        console.log('lecter quote')
        msg.reply(quotes[Math.floor(Math.random() * 4) + 1])
    }

}
)