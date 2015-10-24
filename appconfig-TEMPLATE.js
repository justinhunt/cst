//This file configures the settings app.js needs to run.
//Copy it to 'appconfig.js' next to app.js, and modify it with your values.
//The mysql server is no longer used, though in the future it might be
module.exports = {
	webServerPort: 8082,
	socketServerPort: 8081,
	mysqlConnectionOptions: {
		host: 		'',
		user: 		'',
		password: 	'',
		database: 	''
	},
	timezoneEnvironment: 'Asia/Tokyo',
	moodleUrl: 'http://my.moodleserver.com'
};