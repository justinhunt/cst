cst.state = (function ($) {
	"use strict";

	/*
//events
STATE
fetchfail,
resetsession,
newtask,
answered (not sync)
statuschange

UI
speakergo
taskend
taskstart
consentgiven
beginclicked
updateseat
updatesession

EVENT
roomdetails

TIMER
studentlatency

TEST
initteststate

TASKS
consentgiven

CST.js
localsysteminit (notsync)
systeminit
	
	
	
	*/
	
	// Private
	var 
		data = {
			roleConfirmed: false,
			dataEvent: '',
			channel: '',
			sessionId: 0,		//sync
			raterId: 0,			//sync
			studentId: 0,		//sync
			testId: 0,
			previousTaskId: 0,	
			taskId: 0,			//sync	//questionpop
			taskStart: 0,			//sync
			taskEnd: 0,			//sync
			studentLatency: 0,
			mySeat: '',	//student or teacher, more permanent than 'hat' = respondent, speaker
			studentStat: '',
			teacherStat: '',
			sharedStat: '',
			testProperties: {},
			finalResults: {},
			consentGiven: false,
			beginClicked: false,
			sesskey: '',
			userId: 0,
			userName: '',
			userPic: '',
			partnerId: 0,
			partnerName: '',
			partnerPic: '',
			activityId: 0,
			mode: 'teacherstudent',
			partnermode: 'manual',
			clickedAnswerItem: '',
			clickedQuestionItem: ''
		},
		output = [],
		callbacks = $.Callbacks('unique'),
		messageCallbacks = $.Callbacks('unique');
	
	var syncData = function(){
		return {
			dataEvent: data.dataEvent,
			roleConfirmed: data.roleConfirmed,
			raterId: data.raterId,
			studentId: data.studentId,
			sessionId: data.sessionId,
			testId: data.testId,
			taskId: data.taskId,
			taskStart: data.taskStart,
			taskEnd: data.taskEnd,
			studentStat: data.studentStat,
			teacherStat: data.teacherStat,
			sharedStat: data.sharedStat,
			studentLatency: data.studentLatency,
			consentGiven: data.consentGiven,
			beginClicked: data.beginClicked,
			clickedAnswerItem: data.clickedAnswerItem,
			clickedQuestionItem: data.clickedQuestionItem,
			finalResults: data.finalResults
		};
	};
	
	var status = function(value){
		if (typeof value !== 'undefined'){
			cst.state.data('statuschange',{sharedStat: value });
		}
		return cst.state.data().sharedStat;
	};
	
	var isStatus = function(arrStats){
		return ($.inArray(status(), arrStats) != -1);
	};
		
	var myStatus = function(value){
		if (data.mySeat == ''){
			throw "Seat undefined, myStatus called, that's bad.";
		}
		
		//status
		if (typeof value !== 'undefined'){
			var obj = {};
			obj[data.mySeat.toLowerCase()+"Stat"] = value;
			cst.state.data('statuschange',obj);
		}
		return cst.state.data()[data.mySeat.toLowerCase()+"Stat"];
	};
	
	var theirStatus = function(){
		if (data.mySeat == ''){
			throw "Seat undefined, theirStatus called, that's bad.";
		}
		return cst.state.data()[cst.config.otherSeat(data.mySeat).toLowerCase()+"Stat"];
	};
	
	var myHat = function(taskType){
		if (! cst.config.seats()) throw "No seats, can't determine who you are";
		if (! data.mySeat.length > 0) throw "can't find your hat if we don't know your seat";	 
		if (! taskType || (taskType != "Productive" && taskType != "Receptive")){
			//try to find task type by state.
			var task = cst.test.getTaskById(data.taskId);
			if (! task){
				throw "Task type wasn't recognized and couldn't be found.  therefore your hat couldn't be found.";
			}else{
				taskType = task.type;
			}
		}
		
		return cst.config.seats()[data.mySeat.toTitleCase()][taskType];
	};
	
	
	var protectedData = function(dataEvent, newData, skipSync){
		if (newData){
			if (!skipSync){
				var toSync = {};
				//dataEvent is a unique flag for the data update, allows receiver to process like event
				newData.dataEvent = dataEvent;
				$.each(newData, function(k, v){
					if (typeof syncData()[k] !== "undefined" && data[k] != v){
						toSync[k] = v;
					}
				});
				if (!$.isEmptyObject(toSync)){
					cst.event.syncStatus(toSync);
				}
			}
			
			var oldSessionId = data.sessionId;
			$.extend(true, data, newData);
			callbacks.fire(this);
			//clear our label after firing
			//data.dataEvent='';
		}
		return data;
	};
	
	var sendMessage = function(message){
		if (message){
			if (!$.isEmptyObject(message)){
				cst.event.sendMessage(message);
			}
		}
	};
	
	var emergencySync = function(){
		cst.event.syncStatus(syncData());
		callbacks.fire(this);
	};
	
	var fireMessage = function(messagedata){
		console.log("firingmessage");
		messageCallbacks.fire(messagedata);
	};
	
	var doJump = function(newtaskid){
		var currentTask,
			taskAnswer,
			answer,
			answer,
			isCorrect,
			currentTaskId;

		currentTaskId=cst.state.data().taskId;
		
		//set answered, for callbacks
		if(currentTaskId !=0){
			cst.state.data('answered',{sharedStat: 'answered'}, true);
		}
		
		var task = cst.test.getTaskById(newtaskid);
		console.log('newtaskid:' + newtaskid);
		console.log('taskid:' + task.id);
		if (task){
			//push the state change
			cst.state.data('newtask',{
				previousTaskId: currentTaskId,
				taskId: task.id,
				sharedStat: 'taskStart',
				studentStat: '',
				teacherStat: '',
				taskStart: 0,
				taskEnd:0
			});
		}else{
			sendResults();
		}
	
	}
	
	var doNext = function(){
		var currentTask,
			taskAnswer,
			answer,
			answer,
			isCorrect,
			currentTaskId;

		currentTask  = cst.test.getTaskById(cst.state.data().taskId);	
			
		if (currentTask){
			currentTaskId = currentTask.id;
		}else{
			currentTaskId=0;
		}

		
		//set answered, for callbacks
		cst.state.data('answered',{sharedStat: 'answered'}, true);
		//move to next task
	
		var task = cst.test.nextTask();
		if (task){
			//push the state change
			cst.state.data('newtask',{
				previousTaskId: currentTaskId,
				taskId: task.id,
				sharedStat: 'taskStart',
				studentStat: '',
				teacherStat: '',
				taskStart: 0,
				taskEnd:0
			});
		}else{
			sendResults();
		}
	};
	
	var takeAnswer = function(answerId){
		var currentTask,
			taskAnswer,
			answer,
			isCorrect,
			currentTaskId;

		currentTask  = cst.test.getTaskById(cst.state.data().taskId);	
			
		if (currentTask){
			taskAnswer = $.grep(currentTask.answers, function(v, k){
				return (typeof v.correct !== 'undefined' && v.correct == true);
			})[0];
			currentTaskId = currentTask.id;
		}else{
			currentTaskId=0;
		}
		
		
		//this is a hack ... need to assign correct better for some tasks
		isCorrect=false;
		if (typeof taskAnswer != 'undefined'){
			isCorrect = (taskAnswer.id == answerId);
		}
		
		//prepare answer and store it
		if(currentTaskId > 0){
			var answer = cst.response.create(answerId, isCorrect);
			output.push(answer);
		}
		
		//set answered, for callbacks
		cst.state.data('answered',{sharedStat: 'answered'}, true);
		//move to next task
		var task = cst.test.nextTask();
		if (task){
			//push the state change
			cst.state.data('newtask',{
				previousTaskId: currentTaskId,
				taskId: task.id,
				sharedStat: 'taskStart',
				studentStat: '',
				teacherStat: '',
				taskStart: 0,
				taskEnd:0
			});
		}else{
			sendResults();
		}
	};
	//params eg = {type: 'partnerdetails', userId: '13'}
	//returned data = {type: 'partnerdetails', userName: 'Bob Jones', userPic: 'http://path.to.pic'}
	
	var fetchMoodleData = function(fetchparams){
		if(!fetchparams.hasOwnProperty('sesskey')){
			fetchparams.sesskey = data.sesskey;
		}
		if(!fetchparams.hasOwnProperty('id')){
			fetchparams.id = data.activityId;
		}
		
		//could use cst.url().moodleurl in manual partner select (cos was passed in by form)
		var moodleurl = $('#moodleurl').attr('value');
		$.ajax({
			type: 'POST',
			url: moodleurl + '/mod/moodlecst/jsonmoodledata.php',
			data: fetchparams,
			success: function(data, textStatus, jqXHR){
				switch(data.type){
					case 'partnerdetails':
						cst.state.data('partnerdetails',{partnerName: data.userName, partnerPic: data.userPic},true);
						break;
					case 'mydetails':
						cst.state.data('mydetails',{userName: data.userName, userPic: data.userPic},true);
						break;
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				cst.state.myStatus('fetchFail');
				cst.state.data('fetchfail', { sendResponse: jqXHR.status + ': ' + jqXHR.responseText });
			},
			dataType: 'json'
		});
	}
	
	var sendResults = function(){
	
		cst.state.data('resetsession',{
			taskId: 0,
			sharedStat: 'done',
			studentStat: '',
			teacherStat: '',
			taskStart: 0,
			taskEnd:0,
			finalResults: output
		});
		
		
		debugger;
		//url: cst.config.options().moodleUrl + '/mod/moodlecst/jsonresults.php',
		//could use cst.url().moodleurl in manual partner select (cos was passed in by form)
		var moodleurl = $('#moodleurl').attr('value');
		$.ajax({
			type: 'POST',
			url: moodleurl + '/mod/moodlecst/jsonresults.php',
			data: { 
				'results' : JSON.stringify(output),
				'sesskey': data.sesskey,
				'userid' : data.userId,
				'id' : data.activityId
			},
			beforeSend: function(){
				cst.state.myStatus('sending');
			},
			success: function(data, textStatus, jqXHR){ 
				cst.state.myStatus('sendSuccess');
				cst.state.data('sendsuccess',{sendResponse: data });
			},
			error: function(jqXHR, textStatus, errorThrown){
				cst.state.myStatus('sendFail');
				cst.state.data('sendfail',{sendResponse: jqXHR.status + ': ' + jqXHR.responseText });
			},
			dataType: 'json'
		});
		
	}
	
	
	var uniqueId = function(){
		return data.mySeat;
	}
	
	var clearOutput = function(){
		output = [];
	}
	
	var getOutput = function(){
		return output;
	}
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		data: protectedData,
		sendResults: sendResults,
		fetchMoodleData: fetchMoodleData,
		syncData: syncData,
		callbacks: callbacks,
		messageCallbacks: messageCallbacks,
		takeAnswer: takeAnswer,
		doNext: doNext,
		doJump: doJump,
		myHat: myHat,
		uniqueId: uniqueId,
		myStatus: myStatus,
		theirStatus: theirStatus,
		status: status,
		isStatus: isStatus,
		clearOutput: clearOutput,
		getOutput: getOutput,
		emergencySync: emergencySync,
		fireMessage: fireMessage,
		sendMessage: sendMessage
	};
} (jQuery));


