cst.timer = (function ($) {
	"use strict";

	// Private
	var 
		active = false,
		startTime = 0, 	//in millis
		duration = 0,
		timeoutObj,
		tickerObj,
		changeCallbacks = $.Callbacks('unique'),
		tickCallbacks = $.Callbacks('unique'),
		offset,
		latency;
	
	var init = function(){
		syncTime();
		$('#timer').show().click(syncTime);
		window.setInterval(function(){
			var dt = new Date((new Date()).getTime() - offset);
			tickCallbacks.fire({ "date" : dt, "offset": offset, "latency": latency});
		}, 200);

		
	};
	
	var getLatency = function(){
		return latency;
	};
	
	var getTime = function(){
		return Math.ceil((new Date()).getTime() - offset);
	};
	
	var syncTime = function(e) {
		if (e)
			e.preventDefault();
		// Set up our time object, synced by the HTTP DATE header
		// Fetch the page over JS to get just the headers
		var r = new XMLHttpRequest();
		var start = (new Date).getTime();

		r.open('HEAD', 'time', false);
		r.onreadystatechange = function()
		{
			var
				serverTime,
				myTime;
			
			if (r.readyState != 4)
			{
				return;
			}
			myTime = (new Date).getTime();
			latency = myTime - start;
			serverTime = parseInt(r.getResponseHeader("CSTServerTime"));
			offset = myTime - (serverTime + (latency / 2));
		};
		
		if (cst.state.data().mySeat == 'Student'){
			cst.state.data({ studentLatency: latency });
		}
		r.send(null);
	};
	
	
	
	var start = function (durationMillis){
		var self = this;
		self.active = true;
		startTime = new Date().getTime();
		duration = durationMillis;
		
		timeoutObj = window.setTimeout(t_timeUp, durationMillis, [self]);
		
		changeCallbacks.fire(self);
		
		tickerObj = window.setInterval(i_tick, 1000, [self]);
	};
	
	//START: OLD STUFF
	var stop = function (){
		var self = this;
		self.active = false;
		changeCallbacks.fire(self);
		window.clearTimeout(timeoutObj);
		window.clearInterval(tickerObj);
	}
	
	var elapsed = function(){
		return (new Date()).getTime() - startTime;
	};
	
	var remaining = function(){
		return (startTime + duration) - (new Date()).getTime();
	};
	
	var t_timeUp = function(that){
		if ($.isArray(that)) that = that[0];
		that.stop();
		changeCallbacks.fire(self);
		console.log('time\'s up!');
	};
	
	var i_tick = function(that){
		if ($.isArray(that)) that = that[0];
		
		console.log(that.active);
		that.tickCallbacks.fire(that);
	};
	//END: OLD STUFF
	
	
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		init: init,
		start: start,
		stop: stop,
		startTime: startTime,
		elapsed: elapsed,
		remaining: remaining,
		active: active,
		changeCallbacks: changeCallbacks,
		tickCallbacks: tickCallbacks,
		getLatency: getLatency,
		offset: offset,
		getTime: getTime
	};
} (jQuery));


