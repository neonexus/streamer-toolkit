# Streamer Toolkit

This [Node.js](https://nodejs.org/) server is built using the [Sails.js](https://sailsjs.com/) framework. It's intended to augment Twitch chat, using [Botisimo](https://botisimo.com/) to bridge 
the live chat and this API. You can find useful links at the bottom of this README file for more info.

## Current Commands

This is a list of the current commands as I have them in Botisimo, and what they do / what API route they call in this repo. If the command "requires special permission", that means you need to 
contact StreamLabs after your [application is registered](https://streamlabs.com/dashboard/#/apps/register). Details are on their site.

| Chat Command  | Command's Purpose | Moderator Only? | Requires Special Permission? |
| ------------- | ----------------- | :-------------: | :--------------------------: |
| !aurl         | Get the link to start the required authorization flow to connect this server and StreamLabs (`sails.config.streamLabs.token` in `config/local.js`). Your redirect URI **MUST** point to this server's `/streaming/streamlabsCode` endpoint for this to work correctly. This will only work if `isMe` is set in the database. | ✔ | 
| !credits      | Tell StreamLabs to start running the credits for your stream. | ✔ | 
| !dice         | A gambling feature, designed to use the loyalty points system from StreamLabs. `!dice rules` will explain what a win or loss is. |  | ✔
| !dupeMe       | This is a command that was inspired by [Ayka](https://www.twitch.tv/aykatv). It is mainly used while streaming [Oxygen Not Included](https://www.klei.com/games/oxygen-not-included), to allow a viewer to add their name (any name really) to a queue, used to name the "duplicants" (aka 3D-printed people). |  | 
| !emptyJar     | Tell StreamLabs to empty the tip jar. | ✔ | 
| !give         | Allows a viewer to give tokens (loyalty points) from their total to another viewer's total. If setup correctly (the `isMe` flag is set in the database), and you run the command, it will bypass the need to have tokens. |  | ✔
| !joke         | Gets a random joke from [ChuckNorris.io](https://chucknorris.io/), minus "explicit", "political" and "religious" categories. |  | 
| !nextDupe     | This will display the name of the next duplicant, and remove it from the queue. | ✔ | 
| !spin         | Tell StreamLabs to spin that funky wheel of awesome! | ✔ | 
| !startDupes   | Enables the `!dupeMe` command. Moderator only. | ✔ |  
| !stopDupes    | You guessed it! Disables the `!dupeMe` command. Moderator only. | ✔ | 
| !take         | This will remove the specified tokens from the specified viewer. | ✔ | ✔
| !tokens       | This will retrieve the current loyalty points of the user running the command, and attempt to retrieve the length of time they have been following the channel. |  | ✔
| !undupeMe     | Allows the viewer to remove their name from the duplicant naming pool. |  | 

## Getting Started

This documentation assumes one is familiar with [Git](https://git-scm.com/), Node / JavaScript, [Redis](https://redis.io/) (or some memory store) and MySQL / [MariaDB](https://mariadb.org/) 
(preferably, but you can use other databases). This project is intended for those comfortable or familiar with the command line / terminal, and preferably familiar with [Ngrok](https://ngrok.com/) 
or serving APIs (and the security concerns involved). Additionally, while MySQL / MariaDB is **NOT** required to use this repo, it is what is included in the package requirements, which can be 
changed on a fork of this repo. Because this project is built using Sails, there is a variety of database plugin options, making data storage a breeze. 
See [their documentation](https://sailsjs.com/documentation/concepts/models-and-orm) to read more on your options.

### First thing's first

**Keep in-mind** that this project is a Sails.js project, so it might be a good idea to understand the framework's basic concepts before diving into this repo. The 
[Anatomy of a Sails App](https://sailsjs.com/documentation/anatomy) is a good place to start, if you want to learn more about how the files in this repo do their magic.

Make sure you have the repo cloned to your machine, you've run `npm install`, you have [Redis installed](https://redis.io/topics/quickstart), you have a database setup and said database credentials 
on-hand; don't worry about tables, the framework will generate / alter them on non-production. Next, we need to make sure you have 2 configuration files in-place: `config/local.js` and 
`config/session.js`. There are 2 sample files with the same names, just ending with `.sample`.

1. Copy `config/local.js.sample` -> `config/local.js`, then modify all of the appropriate fields.
    * You will need to setup an application with [Twitch](https://dev.twitch.tv/docs/authentication/#registration) and [StreamLabs](https://streamlabs.com/dashboard/#/apps/register). 
    * If you are wanting to use commands like `!dice` or `!tokens`, you will need to send an email to the developers of StreamLabs after application registration. The details are on their site,
     linked above. 
    * Don't worry about the StreamLabs token (just the client ID, secret and redirectUri); I built a special feature to help easily retrieve your StreamLabs OAuth token (which does not expire).
    * If you are running the server on your local computer, you'll likely want to use [Ngrok](https://ngrok.com/) to make it available to the outside world. 
        * I've personally also setup a special redirect in [CloudFlare](https://cloudflare.com/) `https://bot.mydoamin.com` which does a 302 redirect, using Page Rules, to my Ngrok address 
        `https://123abc000.ngrok.io`. This is optional, and requires you have your own domain, but it will speed things up tremendously when it comes to the Botisimo side of things (especially if 
        you aren't paying for Ngrok, and you have to restart). This is what the page rule should look like:
![CloudFlare Page Rule Example](https://raw.githubusercontent.com/neonexus/streamer-toolkit/master/assets/docs/CloudFlare%20page%20rule.png)

        * Just make sure you update the page rule when your Ngrok address changes (hence the temporary redirect).

1. Next, copy `config/session.js.sample` -> `config/session.js`, and set the secret in the file to something unique and random (a hashed string of the current time + "I'm a little teapot" would work).

**REMEMBER:** NEVER store sensitive data in repositories! Any sensitive bits of data, like API keys, that you add to the project should be stored in the `config/local.js` file.

### Now, are we running?

While in the root directory of the project (say `~/sites/streaming`, or wherever you cloned the repo) and run:

`npm run dev`

You should see a basic debug banner. If not, it is possible the config files are not in the correct place, database credentials are incorrect, a firewall is preventing connection, or the provided 
credentials do not have high enough permissions to create tables. If you are trying to run this server on a PROD level sever, and don't want to elevate the user's permissions (or don't want the 
framework to modify your data store), then run the app like this:

`npm run prod`

## Don't forget to setup Botisimo

In order for any of the chat commands to work, we need to setup Botisimo so it talks to the API when a command is run. Every command is designed to use the data from Botisimo, like the user's ID on 
the current platform, the user's name, and the platform being used to run the command. These 3 basic things are used almost like a password, to help control the use of moderation-only commands.

Below is the list of commands and the syntax used to make them work. When making a new command, the "name" is the command, and the "response" is where the command syntax goes. Also, make sure to
update the "MYDOMAIN" to your actual domain, be it Ngrok, or the CloudFlare trick mentioned earlier.

| Chat Command  | Botisimo Syntax | API Route | Notes |
| ------------- | --------------- | --------- | ----- |
| !aurl         | `$(fetch https://MYDOMAIN/streaming/authUrl?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/authUrl |
| !credits      | `$(fetch https://MYDOMAIN/streaming/credits?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/credits | Uses: `!dice`, `!dice rules`, `!dice 10`
| !dice         | `$[cooldown 3] $(fetch https://MYDOMAIN/streaming/dice?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&bet=$(query))` | /streaming/dice | This has a 3 second cool down at the beginning of the command, which you can remove / adjust as you see fit.
| !dupeMe       | `$(fetch https://MYDOMAIN/streaming/dupeMe?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&options=$(urlencode $(query)))` | /streaming/dupeMe | Intended use: `!dupeMe NeoNexus` or `!dupeMe NeoNexus I want to be Meep please!`
| !emptyJar     | `$(fetch https://MYDOMAIN/streaming/emptyJar?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/emptyJar |
| !give         | `$(fetch https://MYDOMAIN/streaming/give?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&recipient=$(urlencode $(1))&tokens=$(urlencode $(2)))` | /streaming/give | Intended to be used like this: `!give @NeoNexus_DeMortis 100`.
| !joke         | `$(fetch https://MYDOMAIN/streaming/joke?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&category=$(urlencode $(query)))` | /streaming/joke | Gotta love those Chuck Norris jokes. Uses: `!joke`, `!joke categories`, `!joke travel`
| !nextDupe     | `$(fetch https://MYDOMAIN/streaming/nextDupe?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/nextDupe | 
| !spin         | `$(fetch https://MYDOMAIN/streaming/spinWheel?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/spinWheel | 
| !startDupes   | `$(fetch https://MYDOMAIN/streaming/startDupes?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/startDupes | 
| !stopDupes    | `$(fetch https://MYDOMAIN/streaming/stopDupes?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/stopDupes |
| !take         | `$(fetch https://MYDOMAIN/streaming/take?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&recipient=$(urlencode $(1))&tokens=$(urlencode $(2)))` | /streaming/take | Intended use: `!take @NeoNexus_DeMortis 100`
| !tokens       | `$(fetch https://MYDOMAIN/streaming/tokens?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/tokens |
| !undupeMe     | `$(fetch https://MYDOMAIN/streaming/undupeMe?user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&type=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))&confirmed=$(urlencode $(query))` | /streaming/undupeMe | 
 

## Useful Links

+ [StreamLabs Application Registration](https://streamlabs.com/dashboard/#/apps/register)
+ [Twitch Application Registration](https://dev.twitch.tv/docs/authentication/#registration)
+ [Getting started with Sails](https://sailsjs.com/get-started)
+ [Sails framework documentation](https://sailsjs.com/documentation)
+ [Sails Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Sails Community support options](https://sailsjs.com/support)


#### Version info

This app was originally generated on Sat Jun 02 2018 10:04:01 GMT-0500 (CDT) using Sails v1.0.2.

<!-- Internally, Sails used [`sails-generate@1.15.27`](https://github.com/balderdashy/sails-generate/tree/v1.15.27/lib/core-generators/new). -->

<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a 
project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may 
differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading 
the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

