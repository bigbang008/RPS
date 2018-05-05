$(document).on("ready", function() {
	// Links to Firebase
	var database = new Firebase("https://addproject-787ce.firebaseio.com/");
	var presenceRef = new Firebase('https://addproject-787ce.firebaseio.com/.info/connected');
	var playersRef = new Firebase('https://addproject-787ce.firebaseio.com/playersRef');
	var turnRef = new Firebase('https://addproject-787ce.firebaseio.com/turn');
    var chatAppRef = new Firebase('https://addproject-787ce.firebaseio.com/chat');
    
    // Initialize variables
	var playerNumberOne;
    var playerNumberTwo;
	var name = {};
	var userRef;
	var wins1, wins2, losses1, losses2;
	var choices = ['rock','paper','scissors'];
	
	// Remove turn and chat when either player disconnects
	turnRef.onDisconnect().remove();
    chatAppRef.onDisconnect().remove();
});

	var setGame = {
		addListener: function() {
			// in case of the game is fulfiled with two people already
			database.on("value", function(snapshot) {
				var turnVal = snapshot.child('turn').val();
				if (turnVal !== null && playerNumberOne == undefined) {
                    var newDiv = $("<div>");
                    newDiv.addClass("alert alert-warning");
                    newDiv.attr("role", "alert");
					var text = $("<h1>").text("Please wait, other players are playing -OR- come back again later :)");
					newDiv.append(text);
                    $(".hidden-msg").append(newDiv);
                }
            });
            
            //on click submit name
			$(".name-add").on("click",function() {
				setGame.setPlayer();
				return false;
            });
            
			// Add player name
			playersRef.on("child_added", function(childSnapshot) {

				var key = childSnapshot.key();
				name[key] = childSnapshot.val().name;
                // Remove loading and add player name
                var removeWaiting = $(key + ".waiting");
                removeWaiting.empty();
				var nameTag = $("<span>").text(name[key]);
				$(".playername").append(nameTag);				
				// Get player wins and losses
				var wins = childSnapshot.val().wins;
				var losses = childSnapshot.val().losses;
				var countWin = $("<p>").text("<i class='fas fa-trophy'></i>"+ "Wins: " + wins);
				var countloss = $('<p>').text("<i class='fal fa-times-square'></i>"+ "Losses: " + losses);
				$('.score' + key).append(countWin).append(countloss);
            });
            

			// Remove player name from box on disconnect
			playersRef.on("child_removed", function(childSnapshot) {
				var key = childSnapshot.key();
				// Show 'player has disconnected' on chat
				chat.sendDisconnect(key);
				// Empty turn message
				$("h4").text('Waiting for another player to join.');
				// Display beginning message
                var waiting = $(key + ".waiting");
                waiting.empty();
                var waitingText = $("<h5>").text("Waiting for player " + key);
                waitingText.addClass("card-title");
                var loadingIcon = $("<p>")
                loadingIcon.addClass("card-text");
                var icon = $("<i>").addClass("fa fa-spinner fa-spin fa-one-large fa-fw");
                loadingIcon.append(icon);
                waiting.append(waitingText);
                waiting.append(loadingIcon);
				// clear score and choices
				$(".score" + key).text('');
				$(".player-one-choice").empty();
				$(".show-result").empty();
                $(".player-two-choice").empty();
                var gameIcon = $("<p>").text("<i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i>")
                $(".show-result").append(gameIcon);
                $(".show-result").append(gameIcon);
                $(".show-result").append(gameIcon);
            });
            
            
			// Turn function
			turnRef.on('value', function(snapshot) {
				var turnNum = snapshot.val();
				if (turnNum	== 1) {
					// Empty divs
					$(".player-one-choice").empty();
					$(".show-reult").empty();
                    $("..player-two-choice").empty();
                    var gameIcon = $("<p>").text("<i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i><i class='fas fa-gamepad'></i>")
                    $(".show-result").append(gameIcon);
                    $(".show-result").append(gameIcon);
                    $(".show-result").append(gameIcon);
					setGame.turn1();
				} else if (turnNum == 2) {
					setGame.turn2();
				} else if (turnNum == 3){
					setGame.turn3();
				}
            });
            
			// Listen for change in wins and losses for players 1
			playersRef.child(1).on("child_changed", function(childSnapshot) {
				if (childSnapshot.key() == 'wins') {
					wins1 = childSnapshot.val();
				} else if (childSnapshot.key() == "losses") {
					losses1 = childSnapshot.val();
				}
				// Update score display
				if (wins1 !== undefined) {
					$('.result-one .float-left').text('Wins: ' + wins1);
					$('.result-one .float-right').text('Losses: ' + losses1);
				}
			});
			// Listen for change in wins and losses for player 2
			playersRef.child(2).on("child_changed", function(childSnapshot) {
				if (childSnapshot.key() == "wins") {
					wins2 = childSnapshot.val();
				} else if (childSnapshot.key() == "losses") {
					losses2 = childSnapshot.val();
				}
				// Update score display
				$('.result-two .float-left').text('Wins: ' + wins2);
				$('.result-two .float-right').text('Losses: ' + losses2);
			});
        },
        
		setPlayer: function() {
			
			database.once("value", function(snapshot) {
				var playerObj = snapshot.child("playersRef");
				var num = playerObj.numChildren();
				// Add player 1
			  if (num == 0) {
					// Sets player to 1
			  	player = 1;
			  	setGame.addPlayer(player);
			  // Check if player 1 disconnected and re-add
			  } else if (num == 1 && playerObj.val()[2] !== undefined) {
					// Sets player to 1
			  	player = 1;
			  	setGame.addPlayer(player);
			  	// Start turn by setting turn to 1
			  	turnRef.set(1);
			  // Add player 2
			  } else if (num == 1) {
					// Sets player to 2
			  	player = 2;
			  	setGame.addPlayer(player);
			  	// Start turn by setting turn to 1
					turnRef.set(1);
			  }
			});
        },
        
        //grab name in the box
		addPlayer: function(count) {
			
			var playerName = $('#inlineFormInputName').val();
			// Remove form
			var nameBox = $('.name-box');
            nameBox.empty();
			// Show greeting
			var greetingSentence = $("<h3>").text("Hello, " + playerName + '! You are Player ' + player);
			nameBox.append(greetingSentence);
			// Create new child with player number
			userRef = playersRef.child(count);
			userRef.onDisconnect().remove();
			userRef.set({
				"name": playerName,
				"wins": 0,
				"losses": 0
			});
        },
        
		turnMessage: function(turn) {
            playerNumberTwo = player == 1 ? 2:1;
			if (turn == player) {
				// Show its your turn
				$("h4").text("It's Your Turn!");
            } else if (turn == playerNumberTwo) {
				// Show waiting message
                $("h4").text('Waiting for ' + name[playerNumberTwo] + ' to choose.');
			} else {
				// Empty message for turn 3
				$("h4").text('');
			}
        },
        
		showChoice: function() {
			for (i in choices) {
				var iconChoices = $('<i>');
				iconChoices.addClass('fa fa-hand-' + choices[i] + '-o fa-three-small');
				iconChoices.attr('data-choice', choices[i]);
				setGame.rotateChoice(player, iconChoices, choices[i]);
				$('.choices' + player).append(iconChoices);
			}
			// Listen for choice
			$(document).one('mousedown','i', setGame.setChoice);
        },
        

		setChoice: function() {
			// Send selection to database
			var selection = $(this).attr('data-choice');
			userRef.update({
				'choice': selection,
			});
			// Clear choices and add choice
			var iconChoices = $('<i>');
			iconChoices.addClass('fa fa-hand-' + selection + '-o fa-one-large');
			iconChoices.attr('data-choice', selection);
			iconChoices.addClass('position-absolute-choice' + player);
			setGame.rotateChoice(player, iconChoices, selection);
			$('.choices' + player).empty().append(iconChoices);
			// Listen for turnNum
			turnRef.once('value', function(snapshot) {
				var turnNum = snapshot.val();
				// Increment turn
				turnNum++;
				turnRef.set(turnNum);
			});
        },
        
		rotateChoice: function(person, element, choice) {
			// Rotate each choice properly depending on the player
			if (person == 1) {
				if (choice == 'rock' || choice == 'paper') {
					return element.addClass('fa-rotate-90');
				} else {
					return element.addClass('fa-flip-horizontal');
				}				
			} else if (person == 2) {
				if (choice == 'rock' || choice == 'paper') {
					return element.addClass('fa-rotate-270-flip-horizontal');
				}
			}
		},
		turn1: function() {
			$('.player1').css('border','4px solid yellow');
			// Show turn message
			setGame.turnMessage(1);
			// Show choices to player 1
			if (player == 1) {
				setGame.showChoice();
			}
		},
		turn2: function() {
			$('.player1').css('border','1px solid black');
			$('.player2').css('border','4px solid yellow');
			// Show turn message
			setGame.turnMessage(2);
			// Show choices to player 2
			if (player == 2) {
				setGame.showChoice();
			}
		},
		turn3: function() {
			$('.player2').css('border','1px solid black');
			// Remove turn message
			setGame.turnMessage(3);
			// Compute outcome
			setGame.outcome();
		},
		outcome: function() {
			// Get choices, wins, and losses from database
			playersRef.once('value', function(snapshot) {
				var snap1 = snapshot.val()[1];
				var snap2 = snapshot.val()[2];
				choice1 = snap1.choice;
				wins1 = snap1.wins;
				losses1 = snap1.losses;
				choice2 = snap2.choice;
				wins2 = snap2.wins;
				losses2 = snap2.losses;
				// Show other player's choice
                var textChoice = playerNumberTwo == 1 ? choice1:choice2;
				var iconChoices = $('<i>');
				iconChoices.addClass('fa fa-hand-' + textChoice + '-o fa-one-large');
                iconChoices.addClass('position-absolute-choice' + playerNumberTwo);
				iconChoices.attr('data-choice', textChoice);
                setGame.rotateChoice(playerNumberTwo, iconChoices, textChoice);
                $('.choices' + playerNumberTwo).append(iconChoices);

				setGame.choiceAnimation();
			});
        },
        
		logic: function() {
			// Logic for finding winner
			if (choice1 == choice2) {
				setGame.winner(0);
			} else if (choice1 == 'rock') {
				if (choice2 == 'paper') {
					setGame.winner(2);
				} else if (choice2 == 'scissors') {
					setGame.winner(1);
				}
			} else if (choice1 == 'paper') {
				if (choice2 == 'rock') {
					setGame.winner(1);
				} else if (choice2 == 'scissors') {
					setGame.winner(2);
				}
			} else if (choice1 == 'scissors') {
				if (choice2 == 'rock') {
					setGame.winner(2);
				} else if (choice2 == 'paper') {
					setGame.winner(1);
				}
            }
		},
		winner: function(playerNum) {
			var results;
			// Display tie
			if (playerNum == 0) {
				results = 'Tie!';
			} else {
				// Display winner
				results = name[playerNum] + ' Wins!';
				// Set wins and losses based on winner
				if (playerNum == 1) {
					wins = wins1;
					losses = losses2;
				} else {
					wins = wins2;
					losses = losses1;
				}
				// Incremement win and loss
				wins++;
				losses++;
				// Gray loser
                var playerNumberTwoNum = playerNum == 1 ? 2:1;
                $('.choices' + playerNumberTwoNum + ' > i').css('opacity','0.5');
				window.setTimeout(function() {
					// Set the wins and losses
					playersRef.child(playerNum).update({
						'wins': wins
					});
                    playersRef.child(playerNumberTwoNum).update({
						'losses': losses
					});
				}, 500);
			}
			// Display results
			window.setTimeout(function() {
				$('.show-result').text(results);
			}, 500);
			// Change turn back to 1 after 3 seconds
			window.setTimeout(function() {
				// Reset turn to 1
				turnRef.set(1);
				$('.show-result').text('');
			}, 2000);
        },
        
		choiceAnimation: function() {
		  var $choice1 = $('.choices1 > i');
		  var $choice2 = $('.choices2 > i');
		  // Choice 1 animation
		  $choice1.addClass('animation-choice1');
		  $choice1.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
		    $choice1.addClass('choice1-end');
		  });
			// Choice 2 animation
		  $choice2.addClass('animation-choice2');
		  $choice2.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
		    $choice2.addClass('choice2-end');
		    setGame.logic();
		  });
		}
	}
	// Start setGame
	setGame.addListener();

	// Chat object
	var chat = {
		message:'',
		addListener: function() {
			// Send button click
			$('#submit-chat').on('click',function(event) {
				chat.getMessage();
				return false;
			});
			// Show message when received
            chatAppRef
    .on('child_added', function(childSnapshot) {
				// Get name and message
				var playerName = childSnapshot.val().name;
				var message = childSnapshot.val().message;
				// Show message
				chat.showMessage(playerName, message);
			});
		},
		getMessage: function() {
			var input = $('#message-input');
			// Get message then clear it
			chat.message = input.val();
			input.val('');
			// Send data to database if player has name
			if (player !== undefined) {
				chat.sendMessage();
			}
		},
		sendMessage: function() {
			var obj = {};
			obj['name'] = name[player];
			obj['message'] = chat.message;
            chatAppRef
    .push(obj);
		},
		sendDisconnect: function(key) {
			var obj = {};
			obj['name'] = name[key];
			obj['message'] = ' has disconnected.';
            chatAppRef
    .push(obj);
		},
		showMessage: function(playerName, message) {
			// Auto scroll to bottom variables
			var messages = document.getElementById('messages');
			var isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
			// Create p with display string
			var $p = $('<p>');
			if (message == ' has disconnected.' && player !== undefined) {
				$p.text(playerName + message);
				$p.css('background','gray');
			} else if (player !== undefined) {
				$p.text(playerName + ': ' + message);
			}
			// If player 1 -> blue text
			if (name[1] == playerName) {
				$p.css('color','blue');
			// If player 2 -> red text
			} else if (name[2] == playerName) {
				$p.css('color','red');
			}
			// Append message
			if ($p.text() !== '') {
				$('#messages').append($p);
			}
			// Auto scroll to bottom
			if (isScrolledToBottom) {
				messages.scrollTop = messages.scrollHeight - messages.clientHeight;;
			}
		}
	}

	// Start chat
	chat.addListener();
});