cst.tasks = {};

cst.tasks.listen = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData,state){
		$question.empty();
		$('#jpUITemplate').clone().attr('id', 'jpUI').show().appendTo($question);
		$question.find('div.jp-jplayer').jPlayer({
			ready: function(event) {
				//disable jplayer controls
				$('#jpUI').find('.jp-pause, .jp-play, .jp-stop').css('opacity', '.2').unbind('click');
				$(this).jPlayer("setMedia", {
					mp3: qData.content
				});
			},
			cssSelector: {
				play: "#goButton",
			},
			ended: function(event){
				cst.ui.defaultAnswersEnableMessage();
				console.log(["play complete",event]);
			},
			supplied: "mp3"
		});

		//this places a go button click before showing question
		cst.ui.initGoButton(function(){
				$('#go').hide();
				$question.find('audio').get(0).play();
			}
		);
	};
	
	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
				break;
			}
		});
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.picture = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
		//this places a go button click before showing question
		cst.ui.initGoButton();
	};
	
	var initAnswers = function($answers, qData, state){
		$(qData.answers).each(function(i, x){
			//for some reason, clicking on an incorrect answer leads to jumping to the end of the quiz. why?
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
			//$answers.append('<a class="clickable" name="' +  x.id + '" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
			
		});
	};
	
	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
					break;
				//preferredn the answeritem method, but this works
				//propname is the answerid
				default:
					//cst.ui.doTakeAnswer(propname);
				break;
			}
		});
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.partnerconfirm = (function ($) {
	"use strict";
	var partnerHalfConfirmed = false;
	
	var getProfileHtml = function(){
		var me = '<div class="partnerconfirm_profile">';
		me += '<img id="partnerconfirm_me_image" class="partnerconfirm_image" src="' + cst.state.data().userPic + '"/>';
		me += '<div class="username">' + cst.state.data().userName + '</div>';
		me +='</div>';

		var partner = '<div class="partnerconfirm_profile">';
		partner = '<img id="partnerconfirm_partner_image" class="partnerconfirm_image" src="' + cst.state.data().partnerPic + '"/>';
		partner += '<div class="username">' + cst.state.data().partnerName + '</div>';
		partner +='</div>';
		var button = '<a class="clickable partnerconfirm_button" name="okbutton" href="javascript:;" data-value="ok">OK</a>';
		return '<div class="partnerconfirm_container">' + me + partner + button + '</div>';
	};
	
	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		$question.append(this.getProfileHtml());
		$question.show();
	};
	
	var initAnswers = function($answers, qData, state){
		$answers.empty();
		$answers.append(this.getProfileHtml());
	};
	
	var answerCallback = function(mdata){
		console.log('answercallback:');
		console.log(mdata);
		if(this.partnerHalfConfirmed){
			cst.ui.doNext();
			return;
		}else{
			this.partnerHalfConfirmed=true;
		}
		if(mdata.clickedAnswerItem == 'okbutton'){
				$('#answers').hide();
				cst.ui.showWaiting(true);
		}
	};
	
	var questionCallback = function(mdata){
		console.log('questioncallback:');
		console.log(mdata);
		if(mdata.clickedQuestionItem == 'okbutton'){
				$('#question').hide();
				cst.ui.showWaiting(true);
		}
	};
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		getProfileHtml: getProfileHtml,
		partnerHalfConfirmed: partnerHalfConfirmed,
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.choice = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		//$question.html('You are waiting' );
		//$question.show();
		cst.ui.showWaiting(true);
	};
	
	var initAnswers = function($answers, qData, state){
		$answers.append('<h2>' + qData.heading + '</h2>');
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="clickable" name="'+  qData.variable +'" href="javascript:;" data-value="' + x.text + '">' + x.text + '</a>');
		});

		
	};
	
	var answerCallback = function(mdata){
		console.log('answercallback:');
		//console.log(mdata);
		var idx = mdata.clickedAnswerItem.indexOf('action:');
		//do action
		if(idx===0){
			var action =  mdata.clickedAnswerItem.split(':')[1];
			cst.ui[action](mdata.clickedAnswerItemValue);
			if(action=='doSetSession'){
				//we return here rather than continue to "doNext" because
				//other side needs to be updated before we move ...or it will get weird
				//so we "doNext" over there in this case
				return;
			}
		//set property
		}else{
				var propdata = {};
				propdata[mdata.clickedAnswerItem] = mdata.clickedAnswerItemValue;
				cst.state.data('choiceupdate',propdata);
		}
		cst.ui.doNext();
	};
	var questionCallback = function(mdata){
		console.log('questioncallback:');
		console.log(mdata);
		if(mdata.clickedAnswerItem == 'action:doSetSeat'){
			var newseat = cst.config.otherSeat(mdata.clickedAnswerItemValue.toTitleCase());
			cst.ui.doSetSeat(newseat.toLowerCase());
		}
		if(mdata.clickedAnswerItem == 'action:doSetSession'){
			var newsession = mdata.clickedAnswerItemValue;
			cst.ui.doSetSession(newsession);
			cst.ui.doNext();
		}
	};

	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.translate = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData, state){
		$question.empty();
		var qhtml = '<div id="qTranslateSource" class="questionTranslateSource">' + qData.content.source + '</div>';
		qhtml += '<div id="qTranslateTarget" class="questionTranslateTarget">' + qData.content.target + '</div>';
		qhtml += '<a id="qTranslateHint" name="hintbutton" class="clickable" data-value="unused">Show Hint</a>'; 
		qhtml += '<div id="qTranslateDoneContainer" class="qTranslateDoneContainer">';
		qhtml +=  '<a id="qTranslateDoneCorrect" name="donebutton" class="clickable" data-value="0">Not Correct</a>';
		qhtml +=  '<a id="qTranslateDoneIncorrect" name="donebutton" class="clickable" data-value="1">Correct</a>';
		qhtml += '<div/>';
		$question.html(qhtml);
		cst.ui.initGoButton();
	};
	
	var initAnswers = function($answers, qData,state){
		$(qData.answers).each(function(i, x){
			//$answers.append('<a href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');	
			//var answerhtml='<div id="qTranslate" class="questionTranslate">' + x.text + '</div><br />';
			var answerhtml = '<div id="qTranslateSource" class="questionTranslateSource" style="display: none"><i>hint:</i><br />' + qData.content.source + '</div>';
			//answerhtml +=  '<br /><a id="qTranslateDone" name="donebutton" class="clickable" data-value="unused">Done</a>';
			//answerhtml += '<a class="answeritem" href="javascript:;" data-id="1">Done</a>';
			$answers.append(answerhtml);
		});
		
	};
	
	var answerCallback = function(mdata){
		
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'hintbutton':
							console.log('hintbutton clicked over there');
							$('#qTranslateSource').show();
						break;
					case 'donebutton':
							console.log('donebutton clicked there');
							//cst.ui.doTakeAnswer(1);
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}else if(propname=='answersEnabled'){
					cst.ui.answersEnabled(true);
			}
		});
	};
	
	var  questionCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'hintbutton':
						console.log('hintbutton clicked HERE');
						$('#qTranslateHint').addClass('disabled');
						break;
					case 'donebutton':
							console.log('donebutton over HERE');
							cst.ui.doTakeAnswer(mdata.clickedQuestionItemValue);
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}//end of propname
		});
	};
	
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.consent = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		var qhtml = '<div id="qConsent" class="questionConsent">';
		qhtml +=  qData.content;
		qhtml += '<a id="begin" class="clickable" name="consentbutton" href="javascript:;" data-value="unused">同意します。 / Agree</a>';
		qhtml += '</div>';
		$question.html(qhtml);
		$question.show();
	};
	
	var initAnswers = function($answers, qData){
		var ahtml = '<div id="qConsent" class="questionConsent">';
		ahtml +=  '<h2>waiting for partner</h2>'
		ahtml += '</div>';
		$answers.html(ahtml);
	};
	
	var answerCallback = function(state){};
	var  questionCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'consentbutton':
							cst.state.data('consentgiven',{consentGiven: true});
							cst.ui.doTakeAnswer(1);
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}//end of propname
		});
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));


cst.tasks.instructions = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		var qhtml = '<div id="qInstructions" class="questionInstructions">';
		qhtml +=  qData.content;
		qhtml += '<a id="begin" class="clickable" name="startbutton" href="javascript:;" data-value="unused">Start</a>';
		qhtml += '</div>';
		$question.html(qhtml);
		$question.show();
	};
	
	var initAnswers = function($answers, qData){
		var ahtml = '<div id="qInstructions" class="questionInstructions">';
		ahtml +=  qData.answers;
		ahtml += '</div>';
		$answers.html(ahtml);
	};
	
	var answerCallback = function(state){};
	var  questionCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			if(propname=="clickedQuestionItem"){
				switch(propvalue){
					case 'startbutton':
							console.log('startbutton clicked HERE');
							cst.ui.doTakeAnswer(1);
						break;
					default:
						console.log('another clickable clicked: ' + propname);
				}//end of switch
			}//end of propname
		});
	};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));

cst.tasks.whowho = (function ($) {
	"use strict";

	// Private
	var initQuestion = function($question, qData){
		$question.empty();
		$question.html('<img id="q1Img" class="questionImage" src="' + qData.content + '"/>' );
	};
	
	var initAnswers = function($answers, qData){
		$(qData.answers).each(function(i, x){
			$answers.append('<a class="answeritem" href="javascript:;" data-id="' + x.id + '"><img id="q1Img" class="questionImage" src="' + x.img + '"/></a>');
		});
		
	};
	
	var answerCallback = function(state){};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		initQuestion: initQuestion,
		initAnswers: initAnswers,
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));



cst.tasks.taboo = (function ($) {
	"use strict";

	var answerCallback = function(mdata){
		$.each(mdata, function(propname, propvalue){
			switch(propname){
				case 'answersEnabled':
					cst.ui.answersEnabled(true);
				break;
			}
		});
	
	};
	var questionCallback = function(state){};
	
	// Public
	return { // { must be on same line as return else semicolon gets inserted
		answerCallback: answerCallback,
		questionCallback: questionCallback
	};
} (jQuery));
