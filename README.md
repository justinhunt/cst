Communicative Speaking Test
===

This is an Html5 / Node.js / WebSockets driven language test Developed for Keio University.  It is intended to present questions and accept responses from two clients connected with real time communication over the web.  It was originally using the pusher socket service, and a php server for its web services.  It is now rigged entirely in node.js, with a mysql database.

It is currently intended to be used in an isolated / intranet style setting where all clients are trusted, so security is low.  That will probably be one of the next hurdles the project crosses.

Additionally, the config and content folders of this application contain Keio's content for their testing.  A person with knowledge of the technologies involved could easily follow along and rig this for their own purposes.  We invite you to do so.


## How To Run

If you don't have it installed already, install node.js.


From the project's root:
```
cp appconfig-TEMPLATE.js appconfig.js
node app.js
```

If you kept the defaults in appconfig.. you should be able to browse to:

http://localhost:8082

Fire up 2 tabs pointing to that page, select the 'teacher' radio button on one, and 'student' radio button on the other, and enter the same "channel" text.

You should then be able to take a test by bouncing between those two tabs.