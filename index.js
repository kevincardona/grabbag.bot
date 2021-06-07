const Discord = require('discord.js');
const express = require('express');
const app = express();
const Helpers = require('./utils/helpers')
const port = process.env.PORT || 8080;
const BOT_TOKEN = process.env.BOT_TOKEN;
const SELECTION_CHANNEL = process.env.SELECTION_CHANNEL || '💿-music-requests'
const ANNOUNCEMENT_CHANNEL = process.env.ANNOUNCEMENT_CHANNEL || '👀-general'
const ANNOUNCEMENT_MESSAGE = process.env.ANNOUNCEMENT_MESSAGE || "@everyone we're listening to this"
const SELECTION_MESSAGE = process.env.SELECTION_MESSAGE || `I guess i'll pick this one...\n\n`
const THINKING_MESSAGE = process.env.THINKING_MESSAGE || `This is what I have to pick from?`
const PICKED_SOUND = process.env.PICKED_SOUND || ``

const bot = new Discord.Client({
  cacheGuilds: true,
  cacheChannels: false,
  cacheOverwrites: false,
  cacheRoles: false,
  cacheEmojis: false,
  cachePresences: false
});

bot.login(BOT_TOKEN);

app.get('/', function (req, res) {
  res.send("This is a health check + autowake endpoint for grabbag_bot")
});

app.listen(port, function () {
  console.log('grabbag bot api running on port ' + port);
});

const containsKeyword = (msg, keywords) => {
  for(i=0; i < keywords.length; i++) {
    if(msg.content.includes(keywords[i]))
      return true
  }
  return false
}

const broadcastSound = () => {
  if (PICKED_SOUND) {
    bot.channels.cache.forEach(element => {
      if (element.type == "voice") {
        element.join().then(connection => {
          const broadcast = bot.voice.createBroadcast()
          broadcast.play(PICKED_SOUND);
          connection.play(broadcast);
          setTimeout(() => {
            connection.disconnect()
          }, 2000)
        });
      }
    });
  }
}

const deleteBotMessages = (allMessages) => {
  allMessages.each(message => {
    if (message.author.bot && message !== allMessages[allMessages.length - 1]) {
      try {
        message.delete({timeout: 30000})
      } catch {
        
      }
    }
  })
}

const shuffleMessages = (msg) => {
  msg.channel.messages.fetch(Discord.ChannelLogsQueryOptions).then(messages => {
    let result = []
    messages.each(message => {
      voteCount = 0;
      if (!message.attachments.first()) 
       message.delete({ timeout: 30000 }).catch(console.error);
      else if (!message.author.bot) {
        message.reactions.cache.forEach(element => {
          voteCount += element.count
        });
        for (i=0; i<voteCount; i++) {
          result.push(message);
        }
      }
    })
    let selectedIndex = Math.floor(Math.random() * result.length)
    let selectedMessage = {}
    if (result.length > 0) {
      selectedMessage = result[selectedIndex]
    }

    if (selectedMessage?.attachments?.first()) {
      Helpers.sequencer([
        () => { msg.channel.send(THINKING_MESSAGE) },
        2000,
        () => { 
          deleteBotMessages(messages)
          broadcastSound()
          msg.channel.send(`${SELECTION_MESSAGE}${selectedMessage?.content}`, { files: [selectedMessage.attachments.first()] }).then((mes) => mes.pin())
          selectedMessage.delete({ timeout: 30000 }).catch(console.error);
          if (ANNOUNCEMENT_CHANNEL) {
            let announcementChannel = msg.guild.channels.cache.find(channel => channel.name === ANNOUNCEMENT_CHANNEL)
            announcementChannel.send(ANNOUNCEMENT_MESSAGE, { files: [selectedMessage.attachments.first()] }).then((mes) => mes.pin())
          }
          msg.delete({ timeout: 30000 }).catch(console.error);
        }
      ])
    } else {
      msg.channel.send(`You didn't vote on anything`)
    }

    result.forEach((message)=>{
      message.reactions.removeAll().catch(console.error)
    })
  })
  console.log(msg.channel.messages.fetch(Discord.ChannelLogsQueryOptions))
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity(null)
});

const handleCommand = (command) => {
  switch (command.content) {
    case '!grabbag': shuffleMessages(command); break;
    default: command.channel.send('im feeling a bit off today')
  }
}

const commands = ["!grabbag"]
bot.on('message', msg => {  
  if (msg.author.bot) return;
  try {
    if (msg.mentions.has(bot.user) && msg.channel.name == SELECTION_CHANNEL) {
      if(containsKeyword(msg, commands)) {
        handleCommand(msg)
      } else {
        msg.channel.send('what do you want?\ni dont have time for this...');
      }
    } else if (msg.mentions.has(bot.user) && msg.channel.name != SELECTION_CHANNEL) {
    }
  } catch {}
});