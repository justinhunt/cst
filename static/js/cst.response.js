cst.response = (function ($) {
	"use strict";

	// Private	
	var create = function(answerId, isCorrect){
		//hang on to this for efficiency:
		var td = cst.state.data();
		
		return {
			studentId: td.studentId,
			raterId: td.raterId,
			taskId: td.taskId,
			elapsedMillis: td.taskEnd - td.taskStart,
			answerId: answerId,
			sessionId: td.sessionId,
			latency: cst.timer.getLatency() + '/' + td.studentLatency,
			correct: isCorrect,
			consentGiven: td.consentGiven,
			cts: cst.timer.getTime()
		};
		
	}
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		create: create
	};
} (jQuery));


