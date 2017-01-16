//DECLARATION

var pets = { 
	'id': 'pets',
	'text': 'Do you have any pets?',
	'answer': {
		'type': 'radio',
		'responses': [
			{
				'text': 'Yes',
				'associate': 'types'
			},
			{
				'text': 'No',
				'associate': 'everHad'
			}
		]
	}
}


var everHad = { 
	'id': 'everHad',
	'text': 'Have ever had a pet before?',
	'answer': {
		'type': 'radio',
		'responses': [
			{
				'text': 'Yes',
				'associate': 'types'
			},
			{
				'text': 'No',
				'associate': 'whyNot'
			}
		]
	}
}

var types = { 
	'id': 'types',
	'text': 'What kind of pet(s)?',
	'answer': {
		'type': 'checkbox',
		'responses': [
			{
				'text': 'Dog',
				'associate': 'howMany',	
			},
			{
				'text': 'Cat',
				'associate': 'howMany',
			},
			{
				'text': 'Other',
				'associate': 'otherPets',
			}
		]
	}
}

var otherPets = { 
	'id': 'otherPets',
	'text': 'What other kind of pet(s)?',
	'answer': {
		'type': 'list',
	}
}


var whyNot = { 
	'id': 'whyNot',
	'text': 'Why not?',
	'answer': {
		'type': 'text',
	}
}


var questions = [ pets, types, whyNot, otherPets, everHad];
var toAsk = [ pets ];
var questionResponses = {};
var questionHistory = [];
var record = { 
		'question': '',
		'type': '',
		'added': []
	}
var progress = {
		'answered': 0,
		'minRemaining': 0,
		'maxRemaining': 0,
}
var minRunning = 0;
var maxRunning = 0;
//LOGIC

//goes to next question in queue
function nextQuestion(questionID){
	
	//clear object for recording changes.
	record = { 
		'question': '',
		'added': []
	};

	//update progress
	updateProgress();

	if (toAsk.length > 0){
		//if questions remain in queue.

		//get first item in queue
		var question = toAsk[0];
		record.question = question;
		
		var questionHtml = question.text
		
		//formulate answer html
		var answerHtml = '';

		//handle types of answers
		switch (question.answer.type){
			case 'text':
				//output a textarea and next button
				answerHtml += '<textarea class="textarea" name="'+question.id+'"></textarea>';
				answerHtml += '<br><br><button class="next" type="button">Next</button>'
				
				//create handlers to move forward on next button
				initHandlers = function(){
					$('.next').on('click', function(){
						//save response
						response = $('textarea').val();
						questionResponses[record.question.id] = response;
						//remove answered question from the queue.
						removeLastAnswered();
						//go to next
						nextQuestion();
					})
				};
			break;
			case 'list':
				//output a textarea and next button
				answerHtml += '<input class="list" type="text" name="'+question.id+'_1"/>';
				answerHtml += '<br><button class="add" type="button">Add Another</button>';
				answerHtml += '<br><button class="next" type="button" >Next</button>'
				
				//create handlers to move forward on next button
				initHandlers = function(){
					$('.next').on('click', function(){
						var responses = [];
						$('.list').each(function(){
							//save responses
							responses.push($(this).val());
						})
						questionResponses[record.question.id] = responses;
						//remove answered question from the queue.
						removeLastAnswered();
						//go to next
						nextQuestion();
					})
					$('.add').on('click', function(){
						index = $('.list').length + 1;
						$('.add').before('<input class="list" type="text" name="'+question.id+'_'+index+'"/><br>'); 
					})
				};
			break;
			case 'radio':
				//output a radio and label for each option
				question.answer.responses.forEach(function(response){
					
					answerHtml += '<input class="radio active" type="radio" name="'+question.id+'" value="'+response.text+'" data-associate="'+response.associate+'"/>';
					answerHtml += '<label for="'+question.id+'">'+response.text+'</label>';

				});

				//create handlers to move forward on selection
				initHandlers = function(){
					$('.radio').on('change', function(){
						//save response
						var response = $(this).val();
						questionResponses[record.question.id] = response;
						//get id of assicated question and add to queue
						var associate = $(this).data('associate');
						addToQueue(associate);
						//record and questions added to the queue
						record.added.push(associate);
						//remove answered question from the queue.
						removeLastAnswered();
						//go to next
						nextQuestion();
					})
				}
			break;
			case 'checkbox':
				//output a checkbox and label for each option and a next button
				question.answer.responses.forEach(function(response){
					answerHtml += '<input class="checkbox" type="checkbox" name="'+question.id+'" value="'+response.text+'" data-associate="'+response.associate+'"/>';
					answerHtml += '<label for="'+question.id+'">'+response.text+'</label>';
				});
				answerHtml += '<br><br><button class="next" type="button">Next</button>'
				
				//create handlers to move forward on next button
				initHandlers = function(){
					$('.next').on('click', function(){
						
						var responses = [];
						$('.checkbox').each(function(){
							if($(this).is(':checked')){

								//save responses
								responses.push($(this).val());
								//get associated question and add to queue
								var associate = $(this).data('associate');
								addToQueue(associate);
								//record and questions added to the queue
								record.added.push(associate);
							}
						})
						questionResponses[record.question.id] = responses;
						//remove answered question from the queue.
						removeLastAnswered();
						//go to next
						nextQuestion();
					})
				};
			break;
			default:
				//set no handlers as default
				initHandlers = function(){};
			break;
		} 
		
		//output to dom
		$('.question').html(questionHtml);
		$('.answer').html(answerHtml);
		initHandlers();

	} else {
		//if queue is empty
		outputResults();
	}

	//fill in response if it exists in memory
	fillInResponse();

	

	
}

function removeLastAnswered(){
	removeFromQueue(record.question.id);
	//add a record into the history
	if(record.question !== ''){
		questionHistory.unshift(record);
	}
}

function addToQueue(questionId){
	//find the question object
	var questionIndex = questions.findIndex(function(question){
		return question.id == questionId;
	})
	//if question exists add it to queue
	if (questionIndex >= 0){
		toAsk.unshift(questions[questionIndex]);
	}
}

function removeFromQueue(questionId){
	//find the question in the queue
	var askIndex = toAsk.findIndex(function(question){
		return question.id == questionId;
	})
	if(askIndex >= 0){
		//remove question from queue
		toAsk.splice(askIndex, 1);
	}
}

function goBack(){
	if (questionHistory.length > 0){
		//get record of last change
		var record = questionHistory[0];
		//remove all added questions
		record.added.forEach(function(question){
			removeFromQueue(question);
		})
		//add question to front of queue
		addToQueue(record.question.id);
		//remove element from history
		questionHistory.shift(0,1);
		//go to next
		nextQuestion();
	}
	
}

function fillInResponse(){
	var response = questionResponses[record.question.id];
	if (response != undefined){
		switch(record.question.answer.type){
			case 'text':
				$('.textarea').val(response);
			break;
			case 'checkbox':
				$('.checkbox').each(function(){
					if (response.indexOf($(this).val()) >= 0){
						$(this).attr('checked', true);
					}
				});
			break;
			case 'list':
				response.forEach(function(response, index){
					if (index == 0){
						$('.list').val(response);
					} else {
						$('.add').before('<input class="list" type="text" name="'+record.question.id+'_'+(index+1)+'" value="'+response+'"/><br>'); 	
					}
				});
			break;
		}
	}
}


function outputResults(){
		
		var confirmHtml = '<h4>All done! Please review your answers before continuing.</h4>';
		
		//loop thourgh the history from the back
		for (var r = (questionHistory.length-1); r >= 0; r-- ){
			//output an input prefilled with the value and a label, this way forms submit normally
			var question = questionHistory[r].question;
			var answer = questionResponses[question.id].toString()
			confirmHtml += '<p>'+question.text+'</p>';
			confirmHtml += '<input type="text" class="confirm" disabled name="'+question.id+'" value="'+answer+'">';
		}

		//output the html
		$('.question').html(confirmHtml);
		$('.answer').html('<input type="submit" value="Confirm"/>');

}

function updateProgress(){
	//set to basic values
	progress.answered = questionHistory.length;
	progress.minRemaining = 0;
	progress.maxRemaining = 0;

	//init running totals
	minRunning = 100000;
	maxRunning = 0;

	//snake through remaining queue to get max and min
	toAsk.forEach(function(question){
		//recursivley get min max for question
		dig(question.id, 0);
		//add to total and clear running
		progress.minRemaining +=  minRunning;
		progress.maxRemaining +=  maxRunning;
		minRunning = 100000;
		maxRunning = 0;

	})

	console.log(progress);
}

function dig(questionId, count){
	//check question exists
	var questionIndex = questions.findIndex(function(question){
		return question.id == questionId;
	})
	//if found
	if (questionIndex >= 0){
		//increase question count
		count++;
		var question = questions[questionIndex];
		//check has responses
		if (question.answer.responses){
			//run thruogh all responses
			question.answer.responses.forEach(function(response){
				//check has associated questions
				if(response.associate){
					//recursivley go through assocaited question
					dig(response.associate, count);
				} else {
					//close branch
					setRunningMinMax(count);
				}
			})
		} else {
			//close branch
			setRunningMinMax(count);
		}
	} else {
		//close branch
		setRunningMinMax(count)
	}
}

function setRunningMinMax(count){
	minRunning = Math.min(minRunning, count);
	maxRunning = Math.max(maxRunning, count);
}

function initialize(){

	//setup back functionality
	$('#back').on('click', goBack);
	$(document).on('keydown', function(e){
		if (e.keyCode == 27)
			goBack();
	})

	nextQuestion();
}


$(document).ready(initialize);

