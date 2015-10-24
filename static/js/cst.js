String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};



cst = (function ($) {
	"use strict";

	
	var readParams = function (){
		return $.url().param();
	};
	
	var init = function(){
		//if (typeof cst.url().seat === 'undefined' || typeof cst.url().channel === 'undefined'){
		//if we have no channel, and we not setup for auto asign channel
		if (typeof cst.url().channel === 'undefined' && !(typeof cst.url().partnermode != 'undefined' &&  cst.url().partnermode === 'auto')){
			$('#setup').show();
			return;
		}


		console.log('cst.init...');
		//This inits config, session, and test data.  Then it calls back for doing the rest
		cst.config.init(function(){
			cst.event.init(function(){
				//set up state basics.. don't sync it yet.
				cst.state.data('localsysteminit',{
					channel: cst.url().channel,
					mySeat: cst.url().seat,
					sesskey: cst.url().sesskey,
					userId: cst.url().userid,
					activityId: cst.url().activityid,
					mode: cst.url().mode,
					partnermode: cst.url().partnermode
				}, 1);
				cst.ui.init();
				cst.timer.init();
				
				//now sync it.
				cst.state.data('systeminit',{
					sharedStat: 'systemInit'
				});
			});
			
			allParticipantsWaitLoop();
		});
	};
	
	var allParticipantsWaitLoop = function(){
		if (cst.event.everybodyOn()){
			cst.state.status('sessionInit');
		}else{
			setTimeout(cst.allParticipantsWaitLoop, 2000);
		}
	};
	
	
	//Runs only on the teacher side. Events and data should all propagate over state sync.
	var initHandler = function(e){
		if(e){e.preventDefault()};
		var 
			$studentId = $('#studentId'),
			$raterId = $('#raterId'),
			$sessionId = $('#sessionId'),	//TODO: RENAME THIS INTO THE UI?
			stateOut = {},
			thisSession = [];
		
		//that means this can't be here.  The student will need to run it as well.
		if ($sessionId.val() != ''){
			
			var thisSession = cst.config.sessions()[$sessionId.val().toUpperCase()];
			
			if (typeof thisSession === 'undefined'){
				alert("That session could not be found.  Please try another");
				return;
			}
		
			
			if (thisSession.length > 0){
				stateOut.sessionId = $sessionId.val().toLowerCase();
				$.cookie('cstSessionId', stateOut.sessionId, { expires: 365 });
				
				//If either user cancelled out and we're initing again, we should clear the previous answers.
				cst.state.clearOutput();
				cst.test.session(thisSession);
				switch(cst.state.data().mySeat){
					case 'teacher':
						stateOut.studentId = cst.state.data().partnerId;
						stateOut.raterId = cst.state.data().userId;
						break;
					case 'student':
					default:
						stateOut.raterId = cst.state.data().partnerId;
						stateOut.studentId = cst.state.data().userId;
						break;
				}
				$.cookie('cstRaterId', stateOut.raterId, { expires: 365 });

				stateOut.sharedStat = 'taskStart';
				//Hand off to the test object to find the task to load, etc.
				cst.test.initTestState(stateOut);
			}else{
				throw "invalid session passed..wasn't found"
			}
		}
		
	};
	
	var initTest = function(state){
		//If we're the student side, we don't have a session object but do have an id.
		//this should probably be centralized and combined with the teacher code.
		if (cst.state.data().sessionId != 0 && cst.test.session().length == 0){
			var thisSession = cst.test.session()[cst.state.data().sessionId];
			if (thisSession.length > 0){
				cst.test.session(thisSession);
			}
		}
		
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		url: readParams,
		init: init,
		initHandler: initHandler,
		allParticipantsWaitLoop: allParticipantsWaitLoop
	};

} (jQuery));
