cst.test = (function ($) {
	"use strict";

	// Private
	var 
		data = {},
		callbacks = $.Callbacks('unique'),
		session = [];
	
	var initTestState = function(otherStateData){
		var toState = {};
		if (typeof otherStateData != 'undefined'){
			$.extend(toState, otherStateData);
		}
		if (typeof data.id !== 'undefined'){
			toState.testId = data.id;
		}
		if (data.tasks.length > 0 && session.length > 0 ){
			toState.taskId = session[0];
		}
		cst.state.data(toState);
	};
	
		
	var getTaskById = function(qid){
		var qs = $.grep(data.tasks, function(q,i){
			return (q.id == qid);
		});
		
		if (qs.length > 0){
			return qs[0];
		}else{
			throw "getTaskById called with " + qid + " but no task was found";
		}
	};
	
	
	var nextTask = function(){
		var task = getTaskById(cst.state.data().taskId);
		
		var idx = $.inArray(task.id, session);
			
		if (idx != -1 && session.length > (idx + 1)){
			return getTaskById(session[idx + 1]);
		}else{
			return undefined;
		}
	};
	
	//REMEMBER, WRITES HERE OBLITERATE EXISTING DATA
	var protectedSession = function(ar){
		if (typeof ar !== 'undefined'){
			session = ar;
		}
		return session;
	}
	
	//REMEMBER, WRITES HERE OBLITERATE EXISTING DATA
	var protectedData = function(d){
		if (typeof d !== 'undefined'){
			data = d;
		}
		return data;
	};

	// Public
	return { // { must be on same line as return else semicolon gets inserted
		data: protectedData,
		session: protectedSession,
		getTaskById: getTaskById,
		nextTask: nextTask,
		initTestState: initTestState
	};
} (jQuery));


