const Discord = require("discord.js");

const bot = new Discord.Client();
const fs = require('fs')

//shhhhh
const token = 'ODA0NzU1MTQwNDkzOTY3NDIw.YBQ8oQ.hZBaWObLoXanhsG6mHNuj6lHRGw'

bot.on('ready', () => {
    console.log('bot is ready')
})

bot.login(token)

var daysSince = 0

fs.readFile('daysSince.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(data)
    daysSince = Number(data)
    console.log('read daysSince file successfully')
})

var cannibalismCounter = 0
//not technically used
let lastMentionedDate = new Date()
const prefix = '!'

//string array for !lecter command
var quotes = ["",
    "When the fox hears the rabbit scream, he comes a-runnin', but not to help!",
    "I never feel guilty eating anything.",
    "Discourtesy is unspeakably ugly to me.",
    "Without death, we'd be at a loss. It's the prospect of death that drives us to greatness.",
    "I do wish we could chat longer, but I'm having an old friend for dinner."]

var interval = setInterval(increment, 86400000)

function increment() {
    daysSince += 1
    fs.writeFile('daysSince.txt', daysSince, err => {
        if (err) {
            console.error(err)
            return
        }
        console.log('incremented DaySince count successfully')
    })
}

bot.on('message', async (msg) => {
    if (msg.content.toLowerCase().includes("cannibalism") && !msg.author.bot) {
        cannibalismCounter += 1
        fs.writeFile('cannibalismCounter.txt', cannibalismCounter, err => {
            if (err) {
                console.error(err)
                return
            }
            console.log('incremented cannibalismCounter count successfully')
        })

        daysSince = 0
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

    if (!msg.content.startsWith(prefix)) {
        console.log('no prefix')
        return
    }

    //responds with the amount of days since cannibalism was last mentioned
    if (msg.content.toLowerCase().startsWith("!counter")) {
        console.log('counter call')
        msg.reply(daysSince + " days since cannibalism was last mentioned in this server.")

    }

    //replies with the amount of times the word cannibalism has been said in the server
    if (msg.content.toLowerCase().startsWith("!wordcount")) {
        console.log('word count')
        fs.readFile('cannibalismCounter.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            console.log(data)
            cannibalismCounter = Number(data)
            console.log('read cannibalismCounter file successfully')
        })
        msg.reply("Cannibalism has been mentioned " + cannibalismCounter + " times in this server. Delicious!")
    }

    //replies with a quote from Hannibal Lector chosen at random from an array of responses
    if (msg.content.toLowerCase().startsWith("!lecter")) {
        console.log('lecter quote')
        msg.reply(quotes[Math.floor(Math.random() * 4) + 1])
    }

}
)
