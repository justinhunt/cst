//This file configures the settings app.js needs to run.
//Copy it to 'appconfig.js' next to app.js, and modify it with your values.
module.exports = {
	webServerPort: 8082,
	socketServerPort: 8081,
	//https://github.com/felixge/node-mysql#connection-options
	mysqlConnectionOptions: {
		host: 		'',
		user: 		'',
		password: 	'',
		database: 	''
	},
	timezoneEnvironment: 'Asia/Tokyo'
};