cst.ui = (function ($) {
	"use strict";

	// Private
	var 
		config = {
			header: '#header',
			timer: '#timer',
			users: '#users',
			init: '#init',
			working: '#working',
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
			generalInstructions: '#generalInstructions'
		};
	
	var init = function(){
		console.log('cst.ui init...');
		cst.state.callbacks.add(testInit);
		cst.state.callbacks.add(instructions);
		cst.state.callbacks.add(question);
		cst.state.callbacks.add(answers);
		cst.state.callbacks.add(status);
		cst.event.pusherCallbacks.add(workingChange);
		cst.event.presenceChanges.add(presenceChange);
		cst.timer.tickCallbacks.add(timerTick);
		
		document.title = cst.state.data().mySeat.toUpperCase().substring(0,1) + ':' + cst.state.data().channel.toUpperCase();
		
		if (cst.state.data().mySeat == 'teacher'){
			$(config.quit).click(function(e){
				e.preventDefault();
			
				if (confirm('Save the data and end the test?')){
					cst.state.sendResults();
				}
			});
		}
		$(config.cancel).click(function(e){
			e.preventDefault();
		
			if (confirm('This will discard any test data collected and return to the beginning.\n\nProceed?')){
				document.location = './' + window.location.search;
			}
		});
		
		$(config.restart).click(function(e){
			e.preventDefault();
			
			cst.state.data({sharedStat: "taskStart", taskStart: 0});
		});
		
		$(config.agree).click(function(e){
			e.preventDefault();
			cst.state.data({ consentGiven: true });
			$(config.consent).hide();
			$(config.generalInstructions).show();
		});
		
		$(config.begin).click(function(e){
			e.preventDefault();
			cst.state.data({ beginClicked: true });
			$(config.generalInstructions).hide();
		});
		
	};
	
	
	var presenceChange = function(member){
		var $initButton = $(config.initButton),
			$users = $(config.users),
			usersOn = cst.event.usersOn(),
			uclass = '';

		$users.show().empty();
		$users.append('<span class="">' + cst.state.data().channel + ': </span>');

		
		if (usersOn.length > 0){
			$.each(usersOn, function(i,v){
				uclass = (v == cst.state.data().mySeat) ? 'me' : '';
				$users.append('<span class="' + uclass + '">' + v.toTitleCase() + '</span>');
			});
		}
		
		
		
		if (cst.state.status() == 'sessionInit' && cst.event.everybodyOn() && cst.state.data()['consentGiven'] && cst.state.data()['beginClicked']){
			$initButton.show();
		}else{
			$initButton.hide();
		}
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
		
		console.log('ui Status:');
		console.log(cst.state.data());
		if ((state.status() == 'systemInit' || state.status() == 'sessionInit') && state.theirStatus() == 'sendSuccess'){
			document.location = './' + document.location.search;
		}
	
		
		if (state.status() == 'done'){
			$thanks.find('.status, #reset').hide();
			$thanks.show();
			$thanks.find('#failDetail').html('');
			$thanks.find('#successDetail').html('');
			
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
				$thanks.find('#failDetail').html(cst.state.data().sendResponse).show();
			}
			
			if (state.myStatus() == 'sendSuccess' || state.theirStatus() == 'sendSuccess' ||  state.theirStatus() == 'sendFail'){
				$('#reset').show().one('click', function(){
					cst.event.reset();
					document.location = './' + document.location.search;
				});
			}
			if (state.myStatus() == 'sendFail'){
				$('#reset').show().one('click', function(){
					if (confirm('Your data doesn\'t appear to have been saved to the server.  If you reset now it will be lost.  Is that ok?')){
						document.location = './' + document.location.search;
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
	
	var timerSet = function(timer){
		var $timer = $(config.timer);
		console.log('timerset called');
		$timer.show();
	};
	
	var timerTick = function(d){
		var $timer = $(config.timer);
		$timer.html(formatTime(d.date) + ' - ' + d.offset + ' - ' + d.latency);
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
	
	
	var instructions = function(state){
		if (state.isStatus(['taskStart', 'speakerGo']) && cst.state.data().taskId != 0){
			initInstructions(cst.state.data().taskId);
			$(config.instructions).show();
			
			$(config.cancel).show();
			$(config.restart).show();
			if (cst.state.data().mySeat == 'teacher'){
				$(config.quit).show();
			}
		}else{
			$(config.instructions).hide();
			$(config.cancel).hide();
			$(config.restart).hide();
			if (cst.state.data().mySeat == 'teacher'){
				$(config.quit).hide();
			}
		}
	};
	
	var testInit = function(state){
		if (cst.state.status() == 'sessionInit' && cst.state.data().mySeat == 'teacher'){
			if ($.cookie('cstRaterId') != null){
				$(config.raterId).val($.cookie('cstRaterId'));
			}
			if ($.cookie('cstSessionId') != null){
				$(config.sessionId).val(getNextSessionId());
			}
			
			$(config.initButton).click(cst.initHandler);
			//call this as a last ditch for the init button, just in case we missed pusher's update.
			presenceChange();
			$(config.init).show();
		}else if (cst.state.status() == 'sessionInit' && cst.state.data().mySeat == 'student' && !cst.state.data().consentGiven){
			$(config.init).hide();
			$(config.consent).show();
		}else{
			$(config.init).hide();
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
		if (state.isStatus(['taskStart','speakerGo']) && state.myHat() == "Speaker"){
			if (state.status() == 'taskStart')
			{
				$(config.question).hide();
			}
			initQuestion(state.data().taskId);
			if (state.status() == 'speakerGo'){
				$(config.go).hide();
			}else{
				initGoButton();
				//is this enough? do i need to verify that images and stuff came in?
				if (state.myStatus() != 'ready') state.myStatus('ready');
			}
		}else{
			$(config.go).hide();
			$(config.question).hide();
		}
	};
	
	var answers = function(state){
		if (state.status() == 'taskStart' && state.myHat() == "Respondent"){
			initAnswers(state.data().taskId);
			$(config.answers).show();
			answersEnabled(false);
		}else if (state.status() == 'speakerGo' && state.myHat() == "Respondent"){
			answersEnabled(true);
		}else{
			$(config.answers).hide();
		}
	};
	
	var initGoButton = function(){
		var 	$go = $(config.go),
			$goButton = $(config.goButton),
			$question = $(config.question);
			
		$go.show();
		$goButton.one('click', function(e){
			e.preventDefault();
			$question.show();
			var goStart = cst.timer.getTime();
			if ($question.find('.jp-jplayer').length){
				$question.find('audio').get(0).play();
			}
			$go.fadeOut('slow', function(){
				if ($question.find('.jp-jplayer').length){
				  //Can't put play here, cuz apple won't allow it so far from a user gesture.  :/
				}else{
					cst.state.data({
						sharedStat: 'speakerGo', 
						taskStart: cst.timer.getTime(),
						studentLatency: cst.timer.getLatency()
					});
				}
			});
		});
	};
	
	var initInstructions = function(qId){
		var 
			$instructions = $(config.instructions),
			taskType,
			qData = cst.test.getTaskById(qId);

		if (qData && qData.subType){
			taskType = cst.config.taskTypes()[qData.subType];
			if (taskType) {
				$instructions.empty().show();
				
				var descs = cst.config.taskTypes()[qData.subType.toTitleCase()].Descriptions[cst.state.myHat()];
				
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
	}
	
	
	
	var initQuestion = function(qId){
		var $question = $(config.question);
		
		var qData = cst.test.getTaskById(qId);
		
		if (qData){
			$question.removeClass(cst.config.taskTypeNames()).addClass(qData.subType);
			if (typeof cst.tasks[qData.subType.toLowerCase()] !== 'undefined' && 
				typeof cst.tasks[qData.subType.toLowerCase()].initQuestion !== 'undefined'){
				cst.tasks[qData.subType.toLowerCase()].initQuestion($question, qData);
			}else{
				$question.html(qData.content);
			}
			$question.data('id', qData.id);
		}else{
			throw "initQuestion looked for a taskById and got nothin."
		}
		
		//break out another js object for questions?  factor in tasktypes..
	};
	
	var initAnswers = function(qId){
		var 	$answers = $(config.answers);
		
		$answers.empty().show();
		
		var qData = cst.test.getTaskById(qId);
		
		if (qData){
			$answers.removeClass(cst.config.taskTypeNames()).addClass(qData.subType);
		
			if (typeof cst.tasks[qData.subType.toLowerCase()] !== 'undefined' && 
				typeof cst.tasks[qData.subType.toLowerCase()].initAnswers !== 'undefined'){
				cst.tasks[qData.subType.toLowerCase()].initAnswers($answers, qData);
			}else{
				$(qData.answers).each(function(i, x){
					$answers.append('<a href="javascript:;" data-id="' + x.id + '">' + x.text + '</a>');
				});
			}
		
			$(config.answers + ' a').one('click',takeAnswer);
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
	
	var takeAnswer = function(e){
		e.preventDefault();
		if ($(this).hasClass('enabled')){
			var that = this;
			cst.state.data({ taskEnd:cst.timer.getTime()});
			$(config.answers).fadeOut('slow', function(){
				cst.state.takeAnswer($(that).data('id'));
			});
		}
	};
	
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		init: init,
		working: working
	};
} (jQuery));


