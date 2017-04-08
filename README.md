# taco-bot-commands
Taco-bot-commands is a node.js-based bot for GroupMe that replies to user-posted chat commands. Taco-bot-commands works as one part of taco-bot along with taco-bot-news and taco-bot-web to provide a Destiny companion for social groups. This bot was made for the Destiny clan "DeltaCo 71".

### Taco-Bot is under-going a full rewrite using what I've learned in the past year. Updates to come.


# Taco-bot Layout
Taco Bot is actually made of several pieces:
  * Api for reading commands in chat and replying with response from a MongoDB (taco-bot-commands)
  * A monitor node.js server that pushes reddit (and soon Twitter) posts to chat (taco-bot-news)
  * A web server for displaying taco-bot commands and clan information and links (taco-bot-web)

Taco-Bot uses the  GroupMe Bot system. GroupMe bots are created using the [GroupMe Developers site](https://dev.groupme.com/) and provide the ability to read or post in a chat using the GroupMe API.

Taco-Bot-Commands uses the express.js module to provide an API service. From the GroupMe API, it receives an HTTP POST each time someone comments in the chat. Using this POST, the server can process for commands or perform other functions.

Taco-Bot-News queries the Reddit API for new posts by /u/DTG_Bot and relays their links to a specified GroupMe chat. It also updates to the commands in the server for weeklyreset, xur and trialsinfo. These commands provide weekly-changed links to the Reddit megathreads for those activities. A twitter API query function is planned for future implementation.

# Getting Taco-Bot-Commands Running
1. [Setup a GroupMe Bot](https://dev.groupme.com/tutorials/bots). Take the bot id and save it for later
2. Install Node.js on the computer where the app will run
3. Open a shell session at the directory where the app files are and run `npm install.` The necessary modules will be installed from the package.json file
4. Setup MongoDB. Adding new commands is currently in the works. Check back later for updates.
5. Create a config.json file next to the server.js file. Use this format:
```javascript
{
 "domain": "[domain or public IP address for the computer where your app is running]",
 "port": "[desired, unused port]",
 "mongoConnectionString": "[MongoDB connection string]",
 "bot": {
  "id": "[Your bot's id from step 1]",
  "name": "[Your bot's name]",
  "groupId": "[The group ID associated with your bot]",
  "":""
 }
}
```
6. Set the callback URL for the GroupMe bot (using the GroupMe developers site) using the format `http://[domain from appconfig]:[port from appconfig]/command`
7. In your router, forward the port from the callback URL to the IP address specified in the appconfig for domain
8. Run the command `node server.js`
9. Enter a command in the chat where your GroupMe bot lives and watch it happen!
