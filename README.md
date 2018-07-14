# Streamer Toolkit

This [NodeJS](https://nodejs.org/) server is built using the [SailsJS](https://sailsjs.com/) framework. It's intended to augment Twitch chat, using [Botisimo](https://botisimo.com/) to bridge the live chat and this API. You can find useful links at the bottom of this README file for more info.

## Getting Started

This documentation assumes one is familiar with Git, Node / JavaScript, Redis (or some memory store) and MySQL (preferably, but you can use other databases). This project is intended for those comfortable or familiar with the command line / terminal, and preferably familiar with [Ngrok](https://ngrok.com/) or serving APIs (and the security concerns involved). Additionally, while MySQL is **NOT** required to use this repo, it is what is included in the package requirements, which can be changed on a fork of this repo. Because this project is built using Sails, there is a variety of database plugin options, making data storage a breeze. See [their documentation](https://sailsjs.com/documentation/concepts/models-and-orm) to read more on your options.

### First thing's first

Make sure you have the repo cloned to your machine, you've run `npm install`, you have a database setup and said database credentials on-hand; don't worry about tables, the framework will generate / alter them on non-production. Next, we need to make sure you have 2 configuration files in-place: `config/local.js` and `config/session.js`. There are 2 sample files with the same names, just ending with `.sample`.

1. Copy `config/local.js.sample` -> `config/local.js`, then modify all of the appropriate fields.
    * You will need to setup an application with [Twitch](https://dev.twitch.tv/docs/authentication/#registration) and [StreamLabs](https://streamlabs.com/dashboard/#/apps/register). 
    * If you are wanting to use commands like `!dice` or `!tokens`, you will need to send an email to the developers of StreamLabs after application registration. The details are on their site, linked above. 
    * Don't worry about the StreamLabs token (just the client ID, secret and redirectUri); I built a special feature to help easily retrieve your StreamLabs OAuth token (which does not expire).
    * If you are running the server on your local computer, you'll likely want to use [Ngrok](https://ngrok.com/) to make it available to the outside world. 
        * I've personally also setup a special redirect in [CloudFlare](https://cloudflare.com/) `https://bot.mydoamin.com` which does a 302 redirect, using Page Rules, to my Ngrok address `https://123abc000.ngrok.io`. This is optional, and requires you have your own domain, but it will speed things up tremendously when it comes to the Botisimo side of things (especially if you aren't paying for Ngrok, and you have to restart). This is what the page rule should look like:
![CloudFlare Page Rule Example](https://raw.githubusercontent.com/neonexus/streaming/master/assets/docs/CloudFlare%20page%20rule.png)

1. Next, copy `config/session.js.sample` -> `config/session.js`, and set the secret in the file to something unique and random (a hashed string of the current time + "I'm a little teapot" would work).

**REMEMBER:** NEVER store sensitive data in repositories! Any sensitive bits of data, like API keys, that you add to the project should be stored in the `config/local.js` file.

### Now, are we running?

While in the root directory of the project (say `~/sites/streaming`, or wherever you cloned the repo) and run:

`node app.js` or `sails lift` if you have Sails installed globally.

You should see a basic debug banner. If not, it is possible the config files are not in the correct place, database credentials are incorrect, a firewall is preventing connection, or the provided credentials do not have high enough permissions to create tables. If you are trying to run this server on a PROD level sever, and don't want to elevate the user's permissions (or don't want the framework to modify your data store), then run the app like this:

 

## Don't forget to setup Botisimo

In order for any of the chat commands to work, we need

#### Useful Links

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
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

