cst.config = (function($){
	var 
		tt = {},
		s = {},
		options = {},
		testProperties = {},
		ttn = '',
		sessions = [],
		loadFlags = {		//used to set up a bunch of latches that hold some operations until a series of asynchronous actions are complete
			config: false,
			sessions: false,
			testProperties: false,
			tasks: false
		};
	
	var init = function(fCallback){
		console.log('cst.config init...');
		//CONFIG INIT
		$.ajax({
			url: '/config/config.js',
			dataType: 'json',
			success: function (d){
				if (typeof d.taskTypes !== 'undefined'){
					tt = d.taskTypes;
				}
				if (typeof d.seats !== 'undefined'){
					s = d.seats;
				}
				if (typeof d.options !== 'undefined'){
					options = d.options;
					loadMoodleData(fCallback);
				}
				//load test properties
				var fetchprops = {type: 'testproperties', id:  cst.url().activityid, sesskey:  cst.url().sesskey};
				cst.state.fetchMoodleData(fetchprops);
				
				ttn = $.map(tt, function(val, i){
					return i
				}).join(" ");
				
				loadFlags.config = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
	};

	
	var getMoodleUrl = function(wantedData){
		
		var moodleurl = $('#moodleurl').attr('value');//could use cst.url().moodleurl in manual partner select (cos was passed in by form)
		var targetfile ='';
		var type ='ignore';
		switch(wantedData){
			case 'sessions': targetfile='jsonsessions.php';break;
			case 'tasks': targetfile='jsontasks.php';break;
			case 'testproperties': targetfile='jsonmoodledata.php';type='testproperties'; break;
		}
		
		return  moodleurl + '/mod/moodlecst/' + targetfile + '?id='  + cst.url().activityid + '&sesskey=' + cst.url().sesskey + '&type=' + type;
	};

	//this needs to be called after options are loaded, to get the moodle url
	var loadMoodleData = function(fCallback){
		var sessionPath = getMoodleUrl('sessions');
		$.ajax({
			url: sessionPath + '&t=' + (new Date()).getTime(),
			dataType: 'json',
			success: function(d){
				console.log('loadedsession');
				if (typeof d !== 'undefined'){
					sessions = d;
					loadFlags.sessions = true;
					isConfigFinished(fCallback);
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});

		//TASK INIT
		var taskPath = getMoodleUrl('tasks');
		$.ajax({
			url: taskPath + '&t=' + (new Date()).getTime(),
			dataType: 'json',
			success: function(d){
				console.log('loadedtasks');
				if (d.test){
					cst.test.data(d.test);
				}else{
					throw "No test payload received";
				}
				
				loadFlags.tasks = true;
				isConfigFinished(fCallback);
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
		
		//Test Props
		var propsPath = getMoodleUrl('testproperties');
		$.ajax({
			url: propsPath + '&t=' + (new Date()).getTime(),
			dataType: 'json',
			success: function(d){
				console.log('loaded test properties');
				if (typeof d !== 'undefined'){
					testProperties = d;
					loadFlags.testProperties = true;
					isConfigFinished(fCallback);
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				throw errorThrown;
			}
		});
	};
	
	//Harnesses all the ajax actions to not fire a 'finished' callback until they've all called back.
	var isConfigFinished = function(fCallback){
		var b = true;
		$.each(loadFlags, function(k, v){
			b = b && v;
		});
		if (b){
			fCallback();
		}
	};

	
	//Returns the name of the 'other' seat (first non matching seat from config)
	var otherSeat = function(mySeat){
		return $.map(seats(),function(v,k){ if (k != mySeat) return k })[0];
	};

	var sessions = function(){ return sessions; };
	
	var testProperties = function(){ return testProperties; };

	var taskTypes = function(){ return tt; };
	
	var taskTypeNames = function (){ return ttn; };
	
	var seats = function(){ return s; };
	
	var options = function(){ return options; };
	
	return {
		init: init,
		taskTypes: taskTypes,
		seats: seats,
		taskTypeNames: taskTypeNames,
		otherSeat: otherSeat,
		testProperties: testProperties,
		sessions: sessions,
		options: options
	};
}(jQuery));