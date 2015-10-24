cst.ui = (function ($) {
	"use strict";

	// Private
	var 
		config = {
			header: '#header',
			timer: '#timer',
			users: '#users',
			setup: '#setup',
			init: '#init',
			working: '#working',
			waiting: '#waiting',
			go: '#go',
			goButton: '#goButton',
			instructions: '#instructions',
			question: '#question',
			answers: '#answers',
			error: '#error',
			thanks: '#thanks',
			cancel: '#cancel',
			quit: '#quit',
			restart: '#restart',
			initButton: '#initButton',
			raterId: '#raterId',
			sessionId: '#sessionId',
			agree: '#agree',
			consent: '#consent',
			begin: '#begin',
			questiontimer: '#questiontimer',
			generalInstructions: '#generalInstructions'
		};
	
	var init = function(){
		console.log('cst.ui init...');
		cst.state.callbacks.add(testInit);
		cst.state.callbacks.add(question);
		cst.state.callbacks.add(answers);
		cst.state.callbacks.add(status);
		cst.state.callbacks.add(initQuestionTimerDiv);
		cst.event.pusherCallbacks.add(workingChange);
		cst.event.presenceChanges.add(presenceChange);
		cst.timer.tickCallbacks.add(timerTick);
		
		document.title = cst.state.data().mySeat.toUpperCase().substring(0,1) + ':' + cst.state.data().channel.toUpperCase();
		/*
		if (cst.state.data().mySeat == 'teacher'){
			$(config.quit).click(function(e){
				e.preventDefault();
			
				if (confirm('Save the data and end the test?')){
					cst.state.sendResults();
				}
			});
		}
		*/
		
		$(config.cancel).click(function(e){
			e.preventDefault();
			
				if (confirm('This will discard any test data collected and return to the beginning.\n\nProceed?')){
					var profiletask = -5;
					var $go = $(config.go);
					$go.hide();
					var profiletask = -5;
					cst.state.doJump(profiletask);
					/*
					if(cst.state.data().partnermode=='manual'){
						var search = window.location.search;
						search = search.replace("&seat=teacher", "");
						search = search.replace("&seat=student", "");
						document.location = './' + window.location.search;
					}else{
						cst.state.clearOutput();
						cst.test.initTestState(); 
					}
					*/
				}
			
		});
		
		$(config.restart).click(function(e){
			e.preventDefault();
			cst.state.data('newtask',{sharedStat: "taskStart", taskStart: 0});
		});
		
		if(cst.state.data().partnermode=='auto'){
			$(config.waiting).show();
		}
		
	};
	
	var updateUserBar = function(){
		var $users = $(config.users),
				usersOn = cst.event.usersOn(),
				uclass = '',
				userpic = '',
				username='';

		$users.show().empty();
		
		//I don't think we need to show a channel  .... do we?
		//$users.append('<span class="">' + cst.state.data().channel + ': </span>');

		
		if (usersOn.length > 0){
			$.each(usersOn, function(i,v){
				var therole=v;
				var showRole='';

				if(v == cst.state.data().mySeat){
					uclass = 'profile profileme';
					username=cst.state.data().userName;
					userpic=cst.state.data().userPic;
					showRole='ME';
				}else{
					uclass='profile profilepartner';
					username=cst.state.data().partnerName;
					userpic=cst.state.data().partnerPic;
					showRole='PARTNER';
				}
				
				if(cst.state.data().roleConfirmed || cst.state.data().mode=='teacherstudent'){
					showRole = therole.toTitleCase();
					showRole = showRole.charAt(0) + ':';
				}
				//we don't use userpic any more, but we could. Will need to change css #users width to 250
				$users.append('<div class="' + uclass + '">' + showRole + renderUser(username,userpic) + '</div>');
			});
		}
	};
	
	
	var presenceChange = function(member){
		var $initButton = $(config.initButton);
		
		updateUserBar();
		
		if (cst.state.status() == 'sessionInit' && cst.event.everybodyOn()){
			$initButton.show();
			$(config.waiting).hide();
		}else{
			$initButton.hide();
		}
	}
	
	//just a filler for now
	var renderUser = function(username,userpic){
		//return '<img src="' + userpic + '" class="userpic"/><div class="username">' + username + '</div>';
		return '(' + username + ')';
	}
	
	
	var workingChange = function(states){
		var $wkDiv = $(config.working);
		if (states.current == 'connected'){
			$wkDiv.hide();
		}else{
			$wkDiv.show();
		}
		
		$wkDiv.html("Pusher: " + states.current);
	};
	
	var working = function(){
		var $wkDiv = $(config.working);
		return {
			div: function(){
				return $wkDiv;
			},
			show: function(){
				return $wkDiv.show();
			},
			hide: function(){
				return $wkDiv.hide();
			}
		}
	};
	
	var status = function(state){
		var $thanks = $(config.thanks),
			loutput = [],
			diagnostics = typeof cst.url().diag !== 'undefined';
		
		//console.log('ui Status:');
		//console.log(cst.state.data());
		
		//check for seatchange
		if(state.data().dataEvent=='sendsuccess' || state.data().dataEvent=='sendfail'){
			console.log(state.data().dataEvent);
		}
		
		
		//This returns us to the beginning???
		if ((state.status() == 'systemInit' || state.status() == 'sessionInit') && state.theirStatus() == 'sendSuccess'){
			document.location = './' + document.location.search;
		}
		
		if (state.status() == 'done'){

			//later do this better
			$(config.instructions).hide();
			$(config.question).hide();
			$(config.answers).hide();
		
			$thanks.find('.status, #reset').hide();
			$thanks.show();
			$thanks.find('#failDetail').html('');
			$thanks.find('#successDetail').html('');
			$thanks.find('.sessionResults').html('');
			$thanks.find('.sessionResults').html(prepareResultsForDisplay(cst.state.data().finalResults));
			
			
			if (state.myStatus() == 'sending'){
				$thanks.find('#sending').show();
			}
			if (state.myStatus() == 'sendSuccess'){
				$thanks.find('#sendSuccess').show();
				if (diagnostics){
					$thanks.find('#successDetail').html(
						JSON.stringify(
							cst.state.data().sendResponse, 
							undefined, 
							4
						)
					).show();
				}
			}
			if (state.myStatus() == 'sendFail'){
				$thanks.find('#sendFail').show();
				$thanks.find('.sessionResults').html(prepareResultsForDisplay(cst.state.data().finalResults));
				$thanks.find('#failDetail').html(cst.state.data().sendResponse).show();
			}
			
			if (state.myStatus() == 'sendSuccess' || state.theirStatus() == 'sendSuccess' ||  state.theirStatus() == 'sendFail'){
				$('#reset').show().one('click', function(){
					//cst.event.reset();
					//document.location = './' + document.location.search;
					var profiletask = -5;
					cst.state.doJump(profiletask);
				});
			}
			if (state.myStatus() == 'sendFail'){
				$('#reset').show().one('click', function(){
					if (confirm('Your data doesn\'t appear to have been saved to the server.  If you reset now it will be lost.  Is that ok?')){
						//document.location = './' + document.location.search;
						var profiletask = -5;
						cst.state.doJump(profiletask);
					}
				});
			}
						
			loutput = cst.state.getOutput();
			if (loutput.length > 0 && diagnostics){
				$thanks.find('#diagnostic').html(JSON.stringify(loutput, undefined, 4));
			}
		}else{
			$thanks.hide();
		}
	};
	
	var prepareResultsForDisplay = function(output){
		var returnhtml = '';
		var totaltime = 0;
		var totalq=0;
		var totalcorrect=0;
		$.each(output,function(i,answer){
				if(answer.slidepairid > 0){
					totaltime += answer.duration;
					totalq++;
					if(answer.correct){totalcorrect++;}
				}
			}
		);
		debugger;
		returnhtml +='Total Time: ' + cst.timer.fetchSecondsDisplay(totaltime/1000) + '<br/>';
		returnhtml +='Total Correct: ' + totalcorrect + '/' + totalq; 
		return returnhtml;
	
	};
	
	var timerSet = function(timer){
		var $timer = $(config.timer);
		console.log('timerset called');
		$timer.show();
	};
	
	var timerTick = function(d){
	
		var $timer = $(config.timer);
		var $questiontimer = $(config.questiontimer);
		$timer.html(formatTime(d.date) + ' - ' + d.offset + ' - ' + d.latency);
		
		var props = cst.config.testProperties();
		if(props.timetarget!='ignore'){
			var td = cst.state.data();
			if(td.taskStart>0){
				var timedifference = (d.date.getTime() - td.taskStart) / 1000;
				var currentTask = cst.test.getTaskById(td.taskId);
				var timecount = currentTask.timetarget - timedifference;
				if(timecount<0){timecount =0;}
				var showcount = cst.timer.fetchSecondsDisplay(timecount);
				$questiontimer.html(showcount);
				if(timecount ==0 && props.timetarget=='force' && cst.state.data().mySeat=='teacher' ){
					//doNext(); //this will not save a score
					doTakeAnswer(0); //this will save score of zero. Oh no.
				}else if(timecount < 16){
					timecount = Math.floor(timecount);
					$questiontimer.removeClass('timeleft' + timecount+1);
					$questiontimer.addClass('timeleft' + timecount);
				}
			}
		}
	};
	
	
	var formatTime = function(dt){
		return pad(dt.getHours(), 2) + ":" + pad(dt.getMinutes(),2) + ":" + pad(dt.getSeconds(),2) + ":" + pad(dt.getMilliseconds(),3)

		function pad(number, length) {
		    var str = '' + number;
		    while (str.length < length) {
		        str = '0' + str;
		    }
		    return str;
		};
	};
	
	
	//changed all refs of cst.state here to state.data J 20150430
	var startInstructions = function(taskId, seat){
		initInstructions(taskId);
		$(config.instructions).show();
		$(config.cancel).show();
		$(config.restart).show();
		if (seat == 'teacher'){
			//$(config.quit).show();
			$(config.swapRoles).show();
		}
		if(taskId > 0){
			$(config.waiting).hide();
		}
	}
	
	//changed all refs of cst.state here to state.data J 20150430
	var stopInstructions = function(taskId, seat){
		$(config.instructions).hide();
		$(config.cancel).hide();
		$(config.restart).hide();
		if (seat == 'teacher'){
			//$(config.quit).hide();
		}
		if(taskId > 0){
			$(config.waiting).hide();
		}
	}

	
	//changed all refs of cst.state here to state.data J 20150430
	var instructions = function(state){
		if (state.isStatus(['taskStart', 'speakerGo']) && state.data().taskId != 0){
			initInstructions(state.data().taskId);
			$(config.instructions).show();
			$(config.cancel).show();
			$(config.restart).show();
			if (state.data().mySeat == 'teacher'){
			//	$(config.quit).show();
			}
		}else{
			$(config.instructions).hide();
			$(config.cancel).hide();
			$(config.restart).hide();
			if (state.data().mySeat == 'teacher'){
				//$(config.quit).hide();
			}
		}
		if(state.data().taskId > 0){
			$(config.waiting).hide();
		}
	};
	
	
		//changed all refs of cst.state here to state.data J 20150430
	var testInit = function(state){
	/*
		if(state.status()=='systemInit'){
				console.log("doing setup");
				$(config.waiting).hide();
				$(config.setup).show();
			return;
		}
		*/
		switch(state.data().partnermode){
			case 'manual':
			
			
				break;
			case 'auto':
			
				break;
		
		}
		
		
		switch(state.data().mode){
			case 'studentstudent':
				if (state.status() == 'sessionInit' && state.data().mySeat == 'teacher'){
					//this adds the handler and shows the button
					//$(config.initButton).click(cst.initHandler);
					//$(config.init).show();
					presenceChange();
					cst.initHandler(false);
				}else if (state.status() == 'sessionInit' && state.data().mySeat == 'student'){
					//$(config.initButton).click(cst.initHandler);
					//$(config.init).show();
					 presenceChange();
					 cst.initHandler(false);
				}else{
					$(config.init).hide();
				}
				break;
				
			case 'teacherstudent':
			default:
				if (state.status() == 'sessionInit' && state.data().mySeat == 'teacher'){
					
					//we do not need these in the new Moodle era
					/*
					if ($.cookie('cstRaterId') != null){
						$(config.raterId).val($.cookie('cstRaterId'));
					}
					if ($.cookie('cstSessionId') != null){
						$(config.sessionId).val(getNextSessionId());
					}
					*/
					
					/*
					$(config.initButton).click(cst.initHandler);
					//call this as a last ditch for the init button, just in case we missed pusher's update.
					$(config.waiting).show();
					presenceChange();
					$(config.init).show();
					*/
					presenceChange();
					cst.initHandler(false);
					 
				}else if (state.status() == 'sessionInit' && state.data().mySeat == 'student' && !state.data().consentGiven){
					/*
					$(config.init).hide();
					$(config.waiting).hide();
					$(config.consent).show();
					//in the end called this jsut to update user pic and name. 
					presenceChange();
					*/
					presenceChange();
					cst.initHandler(false);
				}else{
					$(config.init).hide();
				}
				break;
		}
	};

	
	//Tries to increment the session Id cookie, if it fails, returns the old value as it was.
	var getNextSessionId = function(){
		if ($.cookie('cstSessionId') != null){
			var myInt = parseInt($.cookie('cstSessionId'));
			if (isFinite(myInt)){
				myInt = myInt +1;
				return myInt;
			}else{
				return $.cookie('cstSessionId');
			}
		}else{
			return undefined;
		}
	};	
	
	
	//generally run based on a callback from state changes.
	var question = function(state){
		
		//if not initing task, return without doing anything
		if(!(state.data().dataEvent =='initteststate' || state.data().dataEvent =='newtask')){
			return;
		}
		console.log('questioning from event:' + state.data().dataEvent );
		
		//the adding of callbacks was very problematic here.
		//got in loops a number of times. Here clear callbacks 
		//this wil clear function answer callbacks too.
		state.messageCallbacks.empty();
	
		//remove old callbacks, if we have them
		/*
		if(state.data().previousTaskId!=0){
			var previousTask = cst.test.getTaskById(state.data().previousTaskId);
			state.messageCallbacks.remove(cst.tasks[previousTask.subType].questionCallback);
			
		}
		*/

		
		//add new ones if we have them
		if(state.data().taskId){
			var thetask = cst.test.getTaskById(state.data().taskId);
			//if(state.data().mySeat === 'student' || state.myHat() === 'Speaker'){
			if(state.myHat() === 'Speaker'){
				state.messageCallbacks.add(cst.tasks[thetask.subType].questionCallback);
			}
		}
		
		$(config.question).hide();
		if (state.status() == 'taskStart' && state.myHat() == "Speaker"){
				initQuestion(state.data().taskId);
		}
	
	};
	
	
	
	var answers = function(state){
		
		//if not initing task, return without doing anything
		if(!(state.data().dataEvent =='initteststate' || state.data().dataEvent =='newtask')){
			return;
		}
		
		
		//adding and removing callbacks was tricky.
		//now call empty in function question to make this work
		//remove old callbacks, if we have them
		/*
		if(state.data().previousTaskId!=0){
			console.log('removing callback');
			var previousTask = cst.test.getTaskById(state.data().previousTaskId);
			state.messageCallbacks.remove(cst.tasks[previousTask.subType].answerCallback);
		}
		*/
		//add new ones if we have them
		if(state.data().taskId ){
			var thetask = cst.test.getTaskById(state.data().taskId);
		//	if(state.data().mySeat === 'teacher' || state.myHat() === 'Respondent'){
			if(state.myHat() === 'Respondent'){
				console.log('adding callback task');
				state.messageCallbacks.add(cst.tasks[thetask.subType].answerCallback);
			}
		}
		
		//if we are showing answers
		if (state.myHat() == "Respondent"){
			initAnswers(state.data().taskId);
			$(config.answers).show();
			//sub 1 taskids are system ones
			if(cst.state.data().taskId>0){
				answersEnabled(false);
			}else{
				answersEnabled(true);
			}
			//stopInstructions(state.data().taskId,state.data().mySeat);
		}else{
			$(config.answers).hide();
		}

	};


	var defaultAnswersEnableMessage =function(){
		cst.state.data('speakergo',{
			sharedStat: 'speakerGo', 
			taskStart: cst.timer.getTime(),
			studentLatency: cst.timer.getLatency()
		});
		cst.state.sendMessage({
			answersEnabled: 'true'
		});
	};
	
	var initQuestionTimerDiv = function(state){
		//if not initing task, return without doing anything
		if(!(state.data().dataEvent =='initteststate' || state.data().dataEvent =='taskend')){
			debugger;
			console.log('exiting on ' +  state.data().dataEvent );
			return;
		}else{
			debugger;
			console.log('entering on ' +  state.data().dataEvent );
		}
		var $questiontimer = $(config.questiontimer);
		$questiontimer.removeClass();
		$questiontimer.empty();
	};

	var initGoButton = function(doThisToo){
		var $go = $(config.go),
			$goButton = $(config.goButton),
			$question = $(config.question);
			
		$go.show();
		$goButton.one('click', function(e){
			e.preventDefault();
			$question.show();
			var goStart = cst.timer.getTime();
			if(typeof doThisToo !== 'undefined'){
				doThisToo();
			}else{
				$go.fadeOut('slow',defaultAnswersEnableMessage);
			}
		});
	};
	
	var initInstructions = function(taskId){
		var $instructions = $(config.instructions),
			taskType,
			qData = cst.test.getTaskById(taskId);

		if (qData && qData.subType){
			taskType = cst.config.taskTypes()[qData.subType];
			if (taskType) {
				$instructions.empty().show();
				
				var descs = cst.config.taskTypes()[qData.subType].Descriptions[cst.state.myHat()];
				
				if (!descs){
					throw "init instructions: no descriptions found";
				}
				$(descs).each(function(k,v){
					$instructions.append('<p>' + v + '</p>');
				});
			}else{
				throw "init instructions: task type undefined";
			}
		}else{
			console.log('instruction init: no qData or no qData type');
		}
	};

	
	var initQuestion = function(taskId){
		var $question = $(config.question);
		var qData = cst.test.getTaskById(taskId);
		
		if (qData){
			showWaiting(false);
			var subType = qData.subType;
			$question.removeClass(cst.config.taskTypeNames()).addClass(subType);
			if (typeof cst.tasks[subType] !== 'undefined' && 
				typeof cst.tasks[subType].initQuestion !== 'undefined'){
				cst.tasks[subType].initQuestion($question, qData, cst.state);
			}else{
				$question.html(qData.content);
				//this places a go button click before showing question
				initGoButton();
			}
			startInstructions(taskId,cst.state.data().mySeat);
			$question.data('id', qData.id);
		}else{
			throw "initQuestion looked for a taskById and got nothin."
		}
		
		
		$(config.question + ' .clickable').on('click',function(){
					if (!$(this).hasClass('disabled')){
						cst.state.sendMessage({clickedQuestionItem: this.name, clickedQuestionItemValue: $(this).data('value')});
					}
				});
		
		//break out another js object for questions?  factor in tasktypes..
	};


	var initAnswers = function(taskId){
		var $answers = $(config.answers);
		
		$answers.empty().show();
		
		var qData = cst.test.getTaskById(taskId);
		
		if (qData){
			showWaiting(false);
			$answers.removeClass(cst.config.taskTypeNames()).addClass(qData.subType);

			var subType = qData.subType;
			if (typeof cst.tasks[subType] !== 'undefined' && 
				typeof cst.tasks[subType].initAnswers !== 'undefined'){
				cst.tasks[subType].initAnswers($answers, qData, cst.state);

			}else{
				$(qData.answers).each(function(i, x){
					$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '">' + x.text + '</a>');
				});
			}
			startInstructions(taskId,cst.state.data().mySeat);
			//problem here is that if disabled the 'one' will kill subsequen clicks
			//when enabled. Changed from one to on
			//$(config.answers + ' .answeritem').one('click',takeAnswer);
			$(config.answers + ' .answeritem').on('click',takeAnswer);
			$(config.answers + ' .clickable').on('click',function(e){
					if ($(this).hasClass('enabled')){
						e.preventDefault();
						var that=this;
						cst.state.sendMessage({clickedAnswerItem: that.name, clickedAnswerItemValue: $(that).data('value')});
					}
				});
		}else{
			throw "initAnswers looked for a taskById and got nothin."
		}
	};

	
	var answersEnabled = function(val){
		if (typeof val !== 'boolean'){ return; }
		
		$(config.answers).find('a').removeClass('enabled disabled')
		
		if (val){
			$(config.answers).find('a').addClass('enabled');
		}else{
			$(config.answers).find('a').addClass('disabled');
		}
	};
	
	var doTakeAnswer = function(answerid){
		cst.state.data('taskend',{taskEnd:cst.timer.getTime()});
		$(config.answers).fadeOut('slow', function(){
			cst.state.takeAnswer(answerid);
		});
	};
	
	var doJump=function(newtaskid){
		var $go = $(config.go);
		$go.hide();
		cst.state.clearOutput();
		cst.state.doJump(newtaskid);	
	}
	
	var doNext = function(){
			cst.state.data('taskend',{taskEnd:cst.timer.getTime()});
			$(config.answers).fadeOut('slow', function(){
				cst.state.doNext();
			});
	};
	
	var doSetSeat = function(newseat){
		cst.state.messageCallbacks.empty();
		cst.state.data('updateseat',{mySeat: newseat, roleConfirmed: true},true);
		updateUserBar();
		//console.log('updated seat:nowseat' + newseat + ':' + cst.state.data().mySeat);
	};
	
	var doSetSession = function(newsessionid){
		cst.state.messageCallbacks.empty();
		var newsession = cst.config.sessions()[newsessionid];
		cst.test.session(newsession);
		cst.state.data('updatesession',{sessionId: newsessionid},true);
	};
	
	var takeAnswer = function(e){
		e.preventDefault();
		if ($(this).hasClass('enabled')){
			var that = this;
			doTakeAnswer($(that).data('id'));
		}
	};
	
	var showWaiting = function(doShow){
		if(!doShow){
			$(config.waiting).hide();
		}else{
			$(config.waiting).show();
		}
	};
	
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		init: init,
		prepareResultsForDisplay: prepareResultsForDisplay,
		startInstructions: startInstructions,
		stopInstructions: stopInstructions,
		initInstructions: initInstructions,
		defaultAnswersEnableMessage: defaultAnswersEnableMessage,
		initGoButton: initGoButton,
		doTakeAnswer: doTakeAnswer,
		doNext: doNext,
		doJump: doJump,
		doSetSeat: doSetSeat,
		doSetSession: doSetSession,
		showWaiting: showWaiting,
		answersEnabled: answersEnabled,
		working: working
	};
} (jQuery))


