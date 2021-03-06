# Streamer Toolkit

This [Node.js](https://nodejs.org/) server is built using the [Sails.js](https://sailsjs.com/) framework. It's intended to augment Twitch chat, using [Botisimo](https://botisimo.com/) (any chatbot 
service or software can be used, provided it can make external requests, I just use Botisimo) to bridge the live chat and this API. It contains ways to control certain aspects of your StreamLabs 
integration (muting alert sounds during a raid, for example), a simple dice game to gamble with the streamer's loyalty points (aka currency), a quote system, a tap into random Chuck Norris factoids, 
and many others.

## Some Questions I'm Sure...

**StreamLabs has a chatbot, why not use that instead of Botisimo?**

Well, frankly I can't use their chatbot, I'm on a Mac; so, I've had to find other means. Botisimo works, is easy to configure, and is a chatbot service, instead of downloadable software, which 
could be useful, say if the power goes out (of course, that would require this server be running remotely as well).

**Why run this server, why not just use a chatbot to handle these commands?**

Because I'm a programmer, I was inspired to create, and because it allows me a greater flexibility in what is possible in live chat. `!testAlert` for example, instructs StreamLabs to send a test 
alert so you can adjust your overlays. Or `!joke` to get a random [Chuck Norris](https://chucknorris.io/) factoid. It has also allowed me to make use of the best parts of Botisimo, while using 
the loyalty system on StreamLabs for things like `!dice`, to gamble with the "tokens" viewers earn from watching. I also hope, that this could be a useful tool to some, be it something to learn 
with, or ideally inspire some new chat feature.

**Why Sails, and not X framework?**

I really like Sails. It's well structured, well defined, and open to configuration. Just [check out the controller](../../blob/master/api/controllers/general/joke.js) for the `!joke` command. It's 
clean, simple to understand, and has it's own documentation built into the JavaScript file itself, making custom documentation a breeze, while providing enforcement of input constraints, with simple 
instructions.


## Index

* [Current Commands](#current-commands)
* [Getting Started](#getting-started)
    * [First Thing's First](#first-things-first)
    * [Now, Are We Running?](#now-are-we-running)
    * [Don't Forget to Setup Botisimo](#dont-forget-to-setup-botisimo)
* [OK, Now What?](#ok-now-what)
    * [Admin and Mod Flags](#admin-and-mod-flags)
    * [Getting Your StreamLabs Token](#getting-your-streamlabs-token)
* [I Keep Getting "Error: Bad Response"](#i-keep-getting-error-bad-response)
* [Useful Links](#useful-links)
* [Version Info](#version-info)

## Current Commands

This is a list of the current commands as I have them in Botisimo, and what they do in this repo. If the command "requires special permission", that means you need to 
contact StreamLabs after your [application is registered](https://streamlabs.com/dashboard/#/apps/register). Details are on their site.

| Chat Command  | Command's Purpose | [Moderator Only?](#admin-and-mod-flags) | Requires Special Permission? |
| ------------- | ----------------- | :-------------: | :--------------------------: |
| !8ball        | Ask the magic 8 ball a question, maybe get an answer. | |
| !aurl         | Get the link to start the required authorization flow to connect this server and StreamLabs (`sails.config.streamLabs.token` in `config/local.js`). Your redirect URI **MUST** point to this server's `/streaming/streamlabsCode` endpoint for this to work correctly. This will only work if `isMe` is [set in the database](#admin-and-mod-flags). | ✔ | 
| !credits      | Tell StreamLabs to start running the credits for your stream. | ✔ | 
| !dice         | A gambling feature, designed to use the loyalty points system from StreamLabs. `!dice rules` will explain what a win or loss is. |  | ✔
| !dupeMe       | This is a command that was inspired by [Ayka](https://www.twitch.tv/aykatv). It is mainly used while streaming [Oxygen Not Included](https://www.klei.com/games/oxygen-not-included), to allow a viewer to add their name (any name really) to a queue, used to name the "duplicants" (aka 3D-printed people). |  | 
| !emptyJar     | Tell StreamLabs to empty the tip jar. | ✔ | 
| !give         | Allows a viewer to give tokens (loyalty points) from their total to another viewer's total. If setup correctly (the `isMe` flag is [set in the database](#admin-and-mod-flags)), and you run the command, it will bypass the need to have tokens. |  | ✔
| !giveAll      | Give everyone currently viewing some extra tokens. | ✔ | ✔
| !joke         | Gets a random joke from [ChuckNorris.io](https://chucknorris.io/), minus "explicit", "political" and "religious" categories. |  | 
| !mute         | Will silence all StreamLabs alerts. Useful during a raid perhaps. Don't forget to `!unmute`! | ✔ |
| !nextDupe     | This will display the name of the next duplicant, and remove it from the queue. | ✔ | 
| !quote        | This allows a viewer to save a quote from the streamer, or recall a previous one. `!quote 7` OR `!quote add Some eloquent quote taken out of context.` It also makes it possible for mods to remove a quote (viewers can remove their own quotes as well). `!quote delete 7` Or, one could just get the total count. `!quote count` | **?** |
| !spin         | Tell StreamLabs to spin that funky wheel of awesome! | ✔ | 
| !stardate     | This fun little toy will convert calendar dates to stardates, and vice versa for "today", "tng/ds9", and "og/original/tos" versions. The keyword `today` can also be used for the date/stardate. `!stardate 2018-07-05` is the same as `!stardate today 2018-07-05`. `!stardate tng 47779.2` is the reverse of `!stardate tng 2370-07-17 12:00`. | | 
| !startDupes   | Enables the `!dupeMe` command. | ✔ |  
| !stopDupes    | You guessed it! Disables the `!dupeMe` command. | ✔ | 
| !take         | This will remove the specified tokens from the specified viewer. | ✔ | ✔
| !testAlert    | Need to test various alerts for your overlay placement? Maybe you just want to see what they look like? This is the command you are looking for. `!testAlert types`, `!testAlert raid` | ✔ |
| !tokens       | This will retrieve the current loyalty points of the user running the command, and attempt to retrieve the length of time they have been following the channel. |  | ✔
| !undupeMe     | Allows the viewer to remove their name from the duplicant naming pool. |  | 
| !unmute       | The obvious reverse of `!mute`. Will re-enable StreamLabs' alert sounds. | ✔ |

## Getting Started

This documentation assumes one is familiar with [Git](https://git-scm.com/), Node / JavaScript, [Redis](https://redis.io/) (or some memory store) and MySQL / [MariaDB](https://mariadb.org/) 
(preferably, but you can use other databases). This project is intended for those comfortable or familiar with the command line / terminal, and preferably familiar with [Ngrok](https://ngrok.com/) 
or serving APIs (and the security concerns involved). Additionally, while MySQL / MariaDB is **NOT** required to use this repo, it is what is included in the package requirements, which can be 
changed on a fork of this repo. Because this project is built using Sails, there is a variety of database plugin options, making data storage a breeze. 
See [their documentation](https://sailsjs.com/documentation/concepts/models-and-orm) to read more on your options.

**WARNING:** As a general rule, during the setup phase of this server, you should **NOT** be streaming / broadcasting / sharing your screen. There are steps, and certain bits of information
you don't want the internet to have it's hands on, especially the domain you use. 

### First Thing's First

**Keep in-mind** that this project is a Sails.js project, so it might be a good idea to understand the framework's basic concepts before diving into this repo. The 
[Anatomy of a Sails App](https://sailsjs.com/documentation/anatomy) is a good place to start, if you want to learn more about how the files in this repo do their magic.

Make sure you have the repo cloned to your machine, you've run `npm install`, <!--you have [Redis installed](https://redis.io/topics/quickstart), -->you have a database setup and said database credentials 
on-hand; don't worry about tables, the framework will generate / alter them on non-production. Next, we need to make sure you have 3 configuration files in-place: `config/local.js`, 
`config/models.js`, and `config/session.js`. There are 3 sample files with the same names, just ending with `.sample`.

1. Copy `config/local.js.sample` -> `config/local.js`, then modify all of the appropriate fields.
    * You will need to setup an application with [Twitch](https://dev.twitch.tv/docs/authentication/#registration) and [StreamLabs](https://streamlabs.com/dashboard/#/apps/register). 
    * If you are wanting to use commands like `!dice` or `!tokens`, you will need to send an email to the developers of StreamLabs after application registration. The details are on their site,
        linked above. 
    * Don't worry about the StreamLabs token (just the client ID, secret and redirectUri); I built a [special feature](#getting-your-streamlabs-token) to help easily retrieve your StreamLabs OAuth 
        token (which does not expire).
    * If you are running the server on your local computer, you'll likely want to use [Ngrok](https://ngrok.com/) to make it available to the outside world. 
        * I've personally also setup a special redirect in [CloudFlare](https://cloudflare.com/) `https://bot.mydoamin.com` which does a 302 redirect, using Page Rules, to my Ngrok address 
        `https://123abc000.ngrok.io`. This is optional, and requires you have your own domain, but it will speed things up tremendously when it comes to the Botisimo side of things (especially if 
        you aren't paying for Ngrok, and you have to restart). This is what the page rule should look like:
![CloudFlare Page Rule Example](https://raw.githubusercontent.com/neonexus/streamer-toolkit/master/assets/docs/CloudFlare%20page%20rule.png)

        * Just make sure you update the page rule when your Ngrok address changes (hence the temporary redirect).

1. Next, copy `config/models.js.sample` -> `config/models.js`, and set the secret in the file to something unique and random (a hashed string of the current time + "I'm a little teapot" for example).
[Here is a handy script](https://jsfiddle.net/p02dye6L/) to generate SHA 256 hashes.

1. Now, copy `config/session.js.sample` -> `config/session.js`, and do as you did before with `config/models.js`, set the secret in the file to something unique and random. 

**REMEMBER:** NEVER store sensitive data in repositories! Any sensitive bits of data, like API keys, that you add to the project should be stored in the `config/local.js` file.

### Now, Are We Running?

While in the root directory of the project (say `~/sites/streaming`, or wherever you cloned the repo) and run:

`npm run dev`

You should see a basic debug banner. If not, it is possible the config files are not in the correct place, database credentials are incorrect, a firewall is preventing connection, or the provided 
credentials do not have high enough permissions to create tables. If you are trying to run this server on a PROD level sever, and don't want to elevate the user's permissions (or don't want the 
framework to modify your data store), then run the app like this:

`npm run prod`

### Don't forget to setup Botisimo

**NOTE:** Now, it's not required you use Botisimo, this is just what I personally use. I'm sure these features can be adapted to just about any chatbot that can make external requests.

In order for any of the chat commands to work, we need to setup Botisimo so it talks to the API when a command is run. Every command is designed to use the data from Botisimo, like the user's ID on 
the current platform, the user's name, and the platform being used to run the command. These 3 basic things are used almost like a password, to help control the use of moderation-only commands. 

Below is the list of commands and the syntax used to make them work. When adding a command, the "name" is the command, and the "response" is where the command syntax goes. Also, make sure to
update the "MYDOMAIN" to your actual domain, be it Ngrok, or the CloudFlare trick mentioned earlier, and "MYTOKEN" is replaced with your `sails.config.botisimo.customSecurityToken`, which is found
in `config/local.js`. This is a small security measure, to ensure the request is actually coming from your Botisimo setup; which means you should **NEVER SHARE** your full Botisimo command sytanx
with **ANYONE** (so, don't show them on stream!). 

| Chat Command  | Botisimo Syntax | API Route | Notes |
| ------------- | --------------- | --------- | ----- |
| !8ball        | `$(fetch https://MYDOMAIN/streaming/8ball?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/8ball | Doesn't actually take in a question, but can be used like this: `!8ball is it wise to have 1 more?`
| !aurl         | `$(fetch https://MYDOMAIN/streaming/authUrl?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/authUrl | [Read this](#getting-your-streamlabs-token)
| !credits      | `$(fetch https://MYDOMAIN/streaming/credits?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/credits | Uses: `!dice`, `!dice rules`, `!dice 10`
| !dice         | `$[cooldown 3] $(fetch https://MYDOMAIN/streaming/dice?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&bet=$(query))` | /streaming/dice | This has a 3 second cool down at the beginning of the command, which you can remove / adjust as you see fit.
| !dupeMe       | `$(fetch https://MYDOMAIN/streaming/dupeMe?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&options=$(urlencode $(query)))` | /streaming/dupeMe | Intended use: `!dupeMe NeoNexus` or `!dupeMe NeoNexus I want to be Meep please!`
| !emptyJar     | `$(fetch https://MYDOMAIN/streaming/emptyJar?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/emptyJar |
| !give         | `$(fetch https://MYDOMAIN/streaming/give?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&recipient=$(urlencode $(1))&tokens=$(urlencode $(2)))` | /streaming/give | Intended to be used like this: `!give @NeoNexus_DeMortis 100`.
| !giveAll      | `$(fetch https://MYDOMAIN/streaming/giveAll?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&tokens=$(urlencode $(1)))` | /streaming/giveAll | Reward current watchers with tokens: `!giveAll 10`.
| !joke         | `$(fetch https://MYDOMAIN/streaming/joke?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&category=$(urlencode $(query)))` | /streaming/joke | Gotta love those Chuck Norris jokes. Uses: `!joke`, `!joke categories`, `!joke travel`
| !mute         | `$(fetch https://MYDOMAIN/streaming/muteAlerts?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/muteAlerts | Will instruct StreamLabs to mute alert sounds. Don't forget to `!unmute`!
| !nextDupe     | `$(fetch https://MYDOMAIN/streaming/nextDupe?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/nextDupe | 
| !quote        | `$(fetch https://MYDOMAIN/streaming/quote?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&quote=$(urlencode $(query)))` | /streaming/quote | Will automatically deal with 'add Some quote' or 'remove 7'.
| !spin         | `$(fetch https://MYDOMAIN/streaming/spinWheel?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/spinWheel | 
| !stardate     | `$(fetch https://MYDOMAIN/streaming/stardate?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&stardate=$(query))` | /streaming/stardate |
| !startDupes   | `$(fetch https://MYDOMAIN/streaming/startDupes?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/startDupes | 
| !stopDupes    | `$(fetch https://MYDOMAIN/streaming/stopDupes?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/stopDupes |
| !take         | `$(fetch https://MYDOMAIN/streaming/take?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&recipient=$(urlencode $(1))&tokens=$(urlencode $(2)))` | /streaming/take | Intended use: `!take @NeoNexus_DeMortis 100`
| !testAlert    | `$(fetch https://MYDOMAIN/streaming/testAlert?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube)&alertType=$(urlencode $(1))&alertPlatform=$(urlencode $(2)))` | /streaming/testAlert | A streamer's best friend. `!testAlert types`
| !tokens       | `$(fetch https://MYDOMAIN/streaming/tokens?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/tokens |
| !undupeMe     | `$(fetch https://MYDOMAIN/streaming/undupeMe?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))&confirmed=$(urlencode $(query))` | /streaming/undupeMe | 
| !unmute       | `$(fetch https://MYDOMAIN/streaming/unmuteAlerts?securityToken=MYTOKEN&user=$(urlencode $(usernameplain))&userId=$(urlencode $(userid))&platform=$(discord discord)$(twitch twitch)$(mixer mixer)$(youtube youtube))` | /streaming/unmuteAlerts | Will instruct StreamLabs to re-enable alert sounds.
 
## OK, Now What?

Assuming all of the above went smoothly, and you have the server running, you should see something like this:

```
debug: -------------------------------------------------------
debug: :: Sat Jul 14 2018 17:36:50 GMT-0500 (CDT)
debug: Environment : development
debug: Port        : 1337
debug: -------------------------------------------------------
```

You should also be able to open the `/` route in your browser (example: `https://123abd456.ngrok.io/`), and see something like this: 
![Example of app running in browser](https://raw.githubusercontent.com/neonexus/streamer-toolkit/master/assets/docs/Sails%20screenshot.png)

If you have Botisimo setup to your channel correctly, and the server is running, you should now be able to setup your permissions, so you can get your StreamLabs token. 

### Admin and Mod Flags

The admin and mod flags, which are used to control access to "moderator only" commands, must be set manually inside of the database, in the `viewer` table.

1. You should get all of your entries entered into the `viewer` table through use of any command (which doesn't require StreamLabs token). Just run `!joke` on each service you intend to use the 
server with, be it Twitch, Discord, Mixer or YouTube. This will generate the appropriate rows for you.
2. Now, after getting some response from the server via Botisimo, you just need to find the rows, and change the `isMe` column on each to a `1` instead of a `0`. 
3. Follow the same procedure above for any moderators you have, that you want to have access to the mod only commands, instead using the `isMod` column.

### Getting Your StreamLabs Token

Your server is running, your Botisimo is all setup, you hopefully had a decent chuckle from `!joke`. Now there is just 1 last step to get the fullest potential of this server turned on: your
StreamLabs API OAuth token.

**MAKE ABSOLUTELY CERTAIN YOU ARE NOT STREAMING, OR BROADCASTING YOUR SCREEN DURING THIS PROCESS!**

1. Use `!aurl` in your Twitch chat (while you are offline!). The server will send you a private message, which will contain a link to start the process. Open this link, you should see a screen like
this: ![StreamLabs OAuth Screen](https://raw.githubusercontent.com/neonexus/streamer-toolkit/master/assets/docs/StreamLabs%20OAuth.png)
2. After clicking the approve button, if your redirect URI is setup correctly, you should be sent back to a page on this server. It will display your StreamLabs token to be used in `config/local.js`,
but it will only do it once. You'll have to start over with `!aurl` otherwise.
3. Now that the token is saved in your `config/local.js` file, test out `!tokens`. It should display how many loyalty points you have on your channel. Don't have any? Use `!give @MYUSER 100` to give 
your self some.
4. Roll those `!dice`!

After you have everything in working order, it might be a good idea to disable `!aurl`. You could do that a number of ways, but the easiest would be to simply delete the command from Botisimo. You
could also comment out the route registration in `config/routes.js`; just comment out the line with `/streaming/streamlabsCode`. `!aurl` would still "work", and is not dangerous in of it self, but 
the `/streaming/streamlabsCode` route is where the OAuth token is requested and revealed. Disabling the route would render this impossible, but also keep the code intact, should you need it later.

## I Keep Getting "Error: Bad Response"

This could happen for a myriad of reasons. Generally, if there was a serious error, it will be in your console / terminal, where you are running your server. But, the next best place to look, is in 
the `requestlog` table. There, every request, be it inbound or outbound, is logged. This includes responses that Botisimio doesn't like, either because the response this server gave to Botisimo
is something like a 403 (Forbidden) status (because the securityToken is not setup correctly), or a 400 (Bad Request) because the request parameters are not setup correctly (maybe syntax isn't quite 
right?). Your answer is likely in the `responseBody` column of the `requestlog` table.

## Useful Links

+ [StreamLabs Application Registration](https://streamlabs.com/dashboard/#/apps/register)
+ [Twitch Application Registration](https://dev.twitch.tv/docs/authentication/#registration)
+ [Getting started with Sails](https://sailsjs.com/get-started)
+ [Sails framework documentation](https://sailsjs.com/documentation)
+ [Sails Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Sails Community support options](https://sailsjs.com/support)


#### Version info

Current release version: 0.0.6 (2018-08-03 16:14:32-05:00)

This app was originally generated (started) on Sat Jun 02 2018 10:04:01 GMT-0500 (CDT) using Sails v1.0.2.

<!-- Internally, Sails used [`sails-generate@1.15.27`](https://github.com/balderdashy/sails-generate/tree/v1.15.27/lib/core-generators/new). -->

<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a 
project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may 
differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading 
the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

