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
				'associate': 'whyNot'
			}
		]
	}
}

var types = { 
	'id': 'types',
	'text': 'What kind of pet(s) do you have?',
	'answer': {
		'type': 'radio',
		'responses': [
			{
				'text': 'Dog',
				'associate': 'howMany',
				'substitutions': {
					'animal': 'dogs'
				}
			},
			{
				'text': 'Cat',
				'associate': 'howMany',
				'substitutions': {
					'animal': 'cats'
				}
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
	'text': 'What other pets do you have?',
	'answer': {
		'type': 'text',
	}
}

var whyNot = { 
	'id': 'whyNot',
	'text': 'Why not?',
	'answer': {
		'type': 'text',
	}
}


var questions = [ pets, types, whyNot];
var toAsk = [ pets ];
var questionResponses = {};
var questionHistory = [];
var record = { 
		'question': '',
		'added': []
	};

//LOGIC

//goes to next question in queue
function nextQuestion(questionID){
	
	//clear object for recording changes.
	record = { 
		'question': '',
		'added': []
	};

	if (toAsk.length > 0){
		//if questions remain in queue.

		//get first item in queue
		var question = toAsk[0];
		record.question = question.id;
		
		var questionHtml = question.text
		
		//formulate answer html
		var answerHtml = '';

		//handle types of answers
		switch (question.answer.type){
			case 'text':
				console.log('text');
				initHandlers = function(){};
			break;
			case 'radio':
				//handle each option
				question.answer.responses.forEach(function(response){
					
					//output a radio and label
					answerHtml += '<input class="radio active" type="radio" name="'+question.id+'" value="'+response.text+'" data-associate="'+response.associate+'"/>';
					answerHtml += '<label for="'+question.id+'">'+response.text+'</label>';

				});

				//create handlers to move forward on selection
				initHandlers = function(){
					$('.radio.active').on('change', function(){
						//save response
						var question = $(this).attr('name');
						var response = $(this).val();
						questionResponses[question] = response;
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
				console.log('checkbox');
				initHandlers = function(){};
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

		//get form responses
		console.log(questionResponses);
		
		//clear questions
		$('.question').html('All done');
		$('.answer').html('');

	}

	console.log(questionResponses);

	
}

function removeLastAnswered(){
	removeFromQueue(record.question);
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
		addToQueue(record.question);
		//remove element from history
		questionHistory.shift(0,1);
		//go to next
		nextQuestion();
	}
	
}


function initialize(){
	$('#back').on('click', goBack);
	nextQuestion();
}


$(document).ready(initialize);

