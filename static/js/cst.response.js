cst.response = (function ($) {
	"use strict";

	// Private	
	var create = function(answerId, isCorrect){
		//hang on to this for efficiency:
		var td = cst.state.data();
		
		return {
			userid: td.studentId,
			partnerid: td.raterId,
			slidepairid: td.taskId,
			duration: td.taskEnd - td.taskStart,
			answerid: answerId,
			sessionid: td.sessionId,
			latency: cst.timer.getLatency() + '/' + td.studentLatency,
			correct: isCorrect,
			consent: td.consentGiven,
			timecreated: cst.timer.getTime()
		};
		
	}
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		create: create
	};
} (jQuery));


