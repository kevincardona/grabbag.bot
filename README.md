# grabbag.bot

a discord bot for highlighting a random channel message 👾

## what is it?

grabbag takes all of the messages in a channel that have a react and randomly picks one. thats all.

NOTE: the more reacts that a message has the better chance it will be picked

## getting started

<a href="https://discord.com/oauth2/authorize?client_id=829538683127463937&permissions=8&scope=bot">- add to discord -</a>

### environment variables
these can only be changed if you host your own bot...

BOT_TOKEN - discord token
SELECTION_CHANNEL - channel to select messages from
THINKING_MESSAGE - message to be sent just before selecting message
SELECTION_MESSAGE - message to send as selection happens
ANNOUNCEMENT_CHANNEL - channel to make selection announcement (leave blank for no announcement)
ANNOUNCEMENT_MESSAGE - process.env.ANNOUNCEMENT_MESSAGE || "@everyone we're listening to this"
PICKED_SOUND - if ~ nil grabbag will join the channel and play this sound after it picks a message

### commands

to vote: \<react to a message\>

to randomly pick a message: `!grabbag pick`
