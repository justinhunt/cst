Communicative Speaking Test
===

This is an Html5 / Node.js / WebSockets driven pair communication system developed for Kyushu Sangyo University in Japan. It is based on the [original CST system](https://github.com/aaronpropst/cst) developed by Aaron Propst.  It is intended to present questions/prompts and accept responses from two clients connected with real time communication over the web.  It is designed to work with the [MoodleCST plugin for Moodle](https://github.com/justinhunt/moodle-mod_moodlecst).

It is not particularly secure yet, though it will be hardened in the near future.

## How To Get/Install
The application and source code are all available at the [github repository for MoodleCST.](https://github.com/justinhunt/moodlecst)
If you know how to install by cloning a github repository, that is the recommended method. Otherwise a zip file is available from there.
You can expand it and upload it to a suitable location on your server. The recommended location is within a folder called "cst" in the MoodleCST Moodle plugin. 
So the final location would be: 
...
[PATH TO MOODLE]/mod/moodlecst/cst/
...

## Setting Up MoodleCST
MoodleCST requires [Node.js](https://nodejs.org/) . Make sure you get and install that before going any further.  
You need to tell the Node.js app the URL for your Moodle server. This is done in two places:

...
[PATH TO MOODLE]/mod/moodlecst/cst/config/config.js
[PATH TO MOODLE]/mod/moodlecst/cst/appconfig.js
...

These files don't exist until you creat them. However a template for each is included with the distribution.
So copy and rename config-TEMPLATE.js to config.js, and appconfig-TEMPLATE.js to appconfig.js.
Look for lines with "http://my.moodleserver.com" in them, and replace them with your own Moodle Server URL.

By default the MoodleCST app listens in ports 8081 (socket server) and 8082 (web server). If these are not good for you change these values in the above two config files. If you do so, you will also need to change the web server port in the Moodle plugin settings. 


## How To Run

If you don't have it installed already, install [Node.js](https://nodejs.org/) .
From the Moodle MoodleCST activity, as a teacher there is a "Node Server" tab. You can start/stop the Node.js server from there.
If you prefer to start/stop it manually, from the MoodleCST app's root folder isue the following command:
```
node app.js
```
You can stop the app with:
CTRL + C


To take an activity you will however need to launch the app from the appropriate Moodle page.

Justin Hunt
@poodllguy
