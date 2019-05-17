var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var rect = canvas.getBoundingClientRect();

var jackImage = new Image();
jackImage.src = "../img/JackS.png";
var katieImage = new Image();
katieImage.src = "../img/KatieA.png";
var jackTheme = '../sounds/jack/theme.mp3';
var katieTheme = '../sounds/katie/theme.mp3';

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

const ricky_dead_audios = ['areyoublind.mp3','passedforklift.mp3','pathetic.mp3','whtudoing.mp3']
const ricky_select_audios = ['himegareth.mp3','laugh.mp3','ogi.mp3']
const jack_dead_audios = ['j-die-1.opus','j-die-2.opus','j-die-3.opus','j-die-4.opus']
const jack_eat_audios = ['j-eat-1.opus','j-eat-2.opus','j-eat-3.opus','j-eat-4.opus','j-eat-5.opus','j-eat-6.opus']
const jack_select_audios = ['j-select-1.opus','j-select-2.opus','j-select-3.opus','j-select-4.opus']
const katie_dead_audios = ['k-die-1.opus','k-die-2.opus','k-die-3.opus','k-die-4.opus']
const katie_eat_audios = ['k-eat-1.opus','k-eat-2.opus','k-eat-3.opus','k-eat-4.opus']
const katie_select_audios = ['k-select-1.opus','k-select-2.opus','k-select-3.opus']

function ricky_dead(){
	new Audio('../sounds/jack/'+choose(ricky_dead_audios)).play()
}
function ricky_select(){
	new Audio('../sounds/jack/'+choose(ricky_select_audios)).play()
}


var Game = {
	
	//Games variables
	Paused: true, //True whe game is paused
	New: false, //True when restarting game
	Direction: 1, //Directions: 1 : 'right', 2 : 'up', 3 : 'left', 4 : 'down'
	PreviousDirection: 1, //Game previous direction (for preventing errors)
	PreviousArrowDirection: 1, //Previous selection (for preventint errors)
	NextDirection: null, //Next set direction (default null)
	Score: 0, //Score
	Snake: [], //Snake array
	Food: {}, //Food struct
	Bonus: {}, //Game bonuses
	Loop: 0, //Main game loop
	SpeedLoop: 0,
	ClockLoop: 0,
	Fruits: [], //Game bonus fruits (loaded in loader.js)
	PreviousScoreTime: new Date().getTime(), //Last score time, not used
	LocalStorage: false, //Check if browser has localstorage enabled
	BorderActive: false, //Set border active or not
	Character: "k",
	SnakeHead: katieImage,
	AudioTheme: katieTheme,
	AudioThemePlayer: null,
	Speed: 1,
	FPS: Settings.FPS,
	SecondsElapsed: 0,
	IncreaseSpeedInterval: 30,

	//Games methods
	Init: function(){
		Game.Direction = 1;
		Game.PreviousDirection = 1;
		Game.PreviousArrowDirection = 1;
		Game.Score = 0;
		Game.Speed = 1;
		Game.FPS = Settings.FPS;
		Game.SecondsElapsed = 0
		Game.CreateFood();
		Game.CreateSnake();
		Game.Bonus = {};
		$('#speed-num').text(Game.Speed.toString()+"x");
		$('#score-num').text(Game.Score.toString());
		$('#clock-text').text(Game.Score.toString()+" Sec");

	},
	
	Tick: function(){
		Game.Update();
		Game.Draw();
	},
	
	Draw: function(){
		Game.MoveSnake();
		Game.DrawSnake();
		Game.DrawFood();
		Game.DrawFruit();
	},
	
	Update: function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},
	
	Play: function(){
		if(Game.New){
			Game.Init();
		}
		$('#canvas-overlay').fadeOut('fast');
		$('#save').hide();
		Game.Loop = setInterval(Game.Tick, 1000/Game.FPS);
		Game.ClockLoop = setInterval(Game.UpdateClock, 1000);
		Game.SpeedLoop = setTimeout(Game.IncreaseSpeed, 1000 * (Game.IncreaseSpeedInterval - (Game.SecondsElapsed % Game.IncreaseSpeedInterval)));	
		Game.Paused = false;
		Game.New = false;
		$("#speed-fader").prop('disabled', true);
		$("#jk-selector").prop('disabled', true);
		if(Game.AudioThemePlayer == null){
			Game.AudioThemePlayer = new Audio(Game.AudioTheme)
		}
		Game.AudioThemePlayer.play()
	},
	IncreaseSpeed: function(){
		Game.ChangeSpeed(Game.Speed + 0.2)
		Game.SpeedLoop = setTimeout(Game.IncreaseSpeed, 1000 * Game.IncreaseSpeedInterval);	
	},
	ChangeSpeed: function(speed){
		Game.Speed = Math.ceil(speed * 10)/10;
		$('#speed-num').text(Game.Speed.toString()+"x");
		Game.FPS = Settings.FPS * Game.Speed;
		clearInterval(Game.Loop);
		Game.Loop = setInterval(Game.Tick, 1000/Game.FPS);
	},
	UpdateClock: function(){
		Game.SecondsElapsed++;
		$('#clock-text').text(Game.SecondsElapsed.toString()+" Sec");
	},
	Pause: function(){
		clearInterval(Game.Loop);
		clearInterval(Game.SpeedLoop);
		clearInterval(Game.ClockLoop);
		$('#canvas-overlay').fadeIn('fast');
		$('#overlay-text').text('Paused');
		Game.Paused = true;
		Game.AudioThemePlayer.pause()
	},
	
	CreateSnake: function(){
		Game.Snake = [];
		for(var i = Settings.SnakeLength - 1; i >= 0; i--) {
			Game.Snake.push({x: i + Settings.InitialPosition.x, y: Settings.InitialPosition.y});
		}
		Game.DrawSnake();
	},
	
	DrawSnake: function(){
		for(var i = 0; i < Game.Snake.length; i++){
			var c = Game.Snake[i];
			if(i == 0){
				Game.DrawHead(c.x, c.y);
			}else{
				Game.DrawPoint(c.x, c.y);
			}
			
		}
	},
	
	DrawFood: function(){
		Game.DrawCircle(Game.Food.x, Game.Food.y);	
	},
	
	CreateFood: function(){
		var cw = Settings.BlockSize;
		var correct = false;
				
		while(!correct){
			Game.Food = {
				x: Math.round(Math.random()*(width - cw)/cw), 
				y: Math.round(Math.random()*(height - cw)/cw), 
			};
			correct = true;
			for(var i = 0; i < Game.Snake.length; i++){
				var c = Game.Snake[i];
				if(c.x == Game.Food.x && c.y == Game.Food.y){
					correct = false;
				}
			}
		}
		
		Game.DrawCircle(Game.Food.x, Game.Food.y);
	},
	
	MoveSnake: function(){
		var cw = Settings.BlockSize;
		var headx = Game.Snake[0].x;
		var heady = Game.Snake[0].y;
		
		//Check if directionality change is too fast
		var useNextDirection = false;
		if((Game.PreviousDirection == 1 && Game.Direction == 3)
			|| (Game.PreviousDirection == 3 && Game.Direction == 1)
			|| (Game.PreviousDirection == 2 && Game.Direction == 4)
			|| (Game.PreviousDirection == 4 && Game.Direction == 2)){
			Game.NextDirection = Game.Direction;
			Game.Direction = Game.PreviousArrowDirection;
			useNextDirection = false;
		} else {
			useNextDirection = true;
		}
		
		//If NextDirection is stored, use it
		if(Game.NextDirection != null && useNextDirection){
			Game.Direction = Game.NextDirection;
			Game.NextDirection = null;	
		}
		
		var d = Game.Direction;
		Game.PreviousDirection = d;
		
		//Directions: 1 : 'right', 2 : 'up', 3 : 'left', 4 : 'down'
		if(d == 1) headx++;
		else if(d == 3) headx--;
		else if(d == 2) heady--;
		else if(d == 4) heady++;
		
		
		if(Game.CheckSelfCollision(headx, heady)){
			Game.Lose();
			return;
		}
		
		if(Game.BorderActive){
			//If border is active move snake on the other side
			if(headx == -1){
				headx = width/cw;
			} else if(headx >= width/cw){
				headx = 0;
			} else if(heady == -1){
				heady = height/cw;
			} else if(heady >= height/cw){
				heady = 0;
			}
		} else {
			//Borders not active
			if(Game.CheckBorderCollision(headx, heady)){
				Game.Lose();
				return;
			}
		}
		
		//Create tail and put it on first position of Snake
		if(headx == Game.Food.x && heady == Game.Food.y){
			var tail = {x: headx, y: heady};
			var value = Settings.ScoreValue;
			
			if(Game.BorderActive){
				value = Settings.ScoreValueBorder;
			}
			
			// if(Game.FPS < 10){
			// 	value += Math.floor(Game.FPS * 0.1);
			// } else if(Game.FPS >= 10 && Game.FPS < 15){
			// 	value += Math.floor(Game.FPS * 0.3);
			// } else if(Game.FPS >= 15 && Game.FPS < 20){
			// 	value += Math.floor(Game.FPS * 0.5);
			// } else if(Game.FPS == 20){
			// 	value += Math.floor(Game.FPS * 0.7);
			// }
			value = Math.ceil(value * Game.Speed)

			Game.AddScore(value);
			//Create new food
			Game.CreateFood();
			Game.AddBonus();
		} else if(headx == Game.Bonus.x && heady == Game.Bonus.y){
			Game.AddScore(Game.Bonus.value);
			Game.Bonus = {};
			var tail = Game.Snake.pop();
			tail.x = headx; 
			tail.y = heady;
		} else {
			var tail = Game.Snake.pop();
			tail.x = headx; 
			tail.y = heady;
		}
		
		//Puts back the tail as the first cell
		Game.Snake.unshift(tail); 

	},
	
	//Check collision on border
	CheckBorderCollision: function (x, y) {
		var cw = Settings.BlockSize;
		if(x == -1 || x >= width/cw 
			|| y == -1 || y >= height/cw){
			//Checks Snake's collisions on border
			return true;
		}
		return false;
	},
	
	//Check collision on snake itself
	CheckSelfCollision: function (x, y) {
		for(var i = 0; i < Game.Snake.length; i++){
			if(Game.Snake[i].x == x && Game.Snake[i].y == y)
			 return true;
		}
		return false;
	},
	
	DrawHead: function(x, y) {
		var cw = Settings.BlockSize;
		// ctx.fillStyle = Settings.BlockColor;

		// ctx.shadowBlur = 5;
		// ctx.shadowOffsetX = 3;  
		// ctx.shadowOffsetY = 3;  
		// ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
		// ctx.roundRect(x * cw, y * cw, cw - 1, cw - 1, 3).fill();
		ctx.zindex = 1000;
		ctx.drawImage(Game.SnakeHead,x * cw - (1 * cw), y * cw - (1 * cw), cw * 3, cw * 3);  
	},

	DrawPoint: function(x, y) {
		var cw = Settings.BlockSize;
		ctx.fillStyle = Settings.BlockColor;
		ctx.globalCompositeOperation='destination-over';

		ctx.shadowBlur = 5;
		ctx.shadowOffsetX = 3;  
		ctx.shadowOffsetY = 3;  
		ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
		ctx.roundRect(x * cw, y * cw, cw - 1, cw - 1, 5).fill();
		// ctx.drawImage(jackImage,x * cw, y * cw, cw - 1, cw - 1);  
	},
	
	DrawCircle: function(x, y){
		var cw = Settings.BlockSize;
		ctx.fillStyle = Settings.FoodColor;
		ctx.beginPath();
		ctx.arc(x * cw + Settings.BlockSize/2, y * cw + Settings.BlockSize/2, Settings.BlockSize/2, 0, 2 * Math.PI);
		ctx.fill();
	},
	
	AddScore: function(value){
		Game.AudioEat()
		Game.Score += value;
		$('#score-num').text(Game.Score.toString());	
		var msg = $('<div></div>')
			.addClass('bonus-text')
			.text('+' + value)
			.show();
		$('#game-container').append(msg);
		setTimeout(function() {
			msg.addClass('big').fadeOut(500, function(){
				$(this).removeClass('big');
			});
		}, 100);
		
	},
	Lose: function(){
		clearInterval(Game.Loop);
		clearInterval(Game.SpeedLoop);
		clearInterval(Game.ClockLoop);
		$('#canvas-overlay').fadeIn('fast');
		$('#overlay-text').html('Try Again!<br><span class="small">Press ENTER to restart</span>');
		Game.Paused = true;
		Game.New = true;
		$("#speed-fader").prop('disabled', false);
		$("#jk-selector").prop('disabled', false);
		$('#save').show();
		Game.AudioThemePlayer.pause();
		Game.AudioThemePlayer.currentTime = 0;
		Game.AudioDead()
	},
	
	AddBonus: function(){
		var percent = Math.random();
		if(percent > Settings.FruitPercentage && !Game.Bonus.active){
			//Adding bonus		
			var cw = Settings.BlockSize;
			var correct = false;
					
			while(!correct){
				Game.Bonus = {
					x: Math.round(Math.random()*(width - cw)/cw), 
					y: Math.round(Math.random()*(height - cw)/cw),
					active: true 
				};
				correct = true;
				for(var i = 0; i < Game.Snake.length; i++){
					var c = Game.Snake[i];
					if(c.x == Game.Bonus.x && c.y == Game.Bonus.y){
						correct = false;
					}
				}
			}
			
			var fruit = Game.Fruits[Math.floor(Math.random()*Game.Fruits.length)];
			Game.Bonus.img = fruit.img;
			Game.Bonus.value = fruit.value;
			Game.DrawFruit();
			setTimeout(function() { 
				//Remove fruit
				Game.Bonus = {};
			}, Settings.FruitDuration * 1000);
		}
		
	},
	SelectCharacter: function(character) {
		Game.Character = character
		switch(character) {
		  case 'k':
		    Game.SnakeHead = katieImage
			Game.AudioTheme = katieTheme
			Game.AudioThemePlayer = null
		    break;
		  case 'j':
		    Game.SnakeHead = jackImage
			Game.AudioTheme = jackTheme
			Game.AudioThemePlayer = null
		    break;
		}
		Game.AudioPlayerSelect()
	},
	AudioDead: function(){
		switch(Game.Character) {
		  case 'k':
		    new Audio('../sounds/katie/'+choose(katie_dead_audios)).play()
		    break;
		  case 'j':
		    new Audio('../sounds/jack/'+choose(jack_dead_audios)).play()
		    break;
		}
	},
	AudioPlayerSelect: function(){
		switch(Game.Character) {
		  case 'k':
		    new Audio('../sounds/katie/'+choose(katie_select_audios)).play()
		    break;
		  case 'j':
		    new Audio('../sounds/jack/'+choose(jack_select_audios)).play()
		    break;
		}
	},
	AudioEat: function(){
		switch(Game.Character) {
		  case 'k':
		    new Audio('../sounds/katie/'+choose(katie_eat_audios)).play()
		    break;
		  case 'j':
		    new Audio('../sounds/jack/'+choose(jack_eat_audios)).play()
		    break;
		}
	},
	DrawFruit: function(){
		if(Game.Bonus.active){
			var cw = Settings.BlockSize;
			ctx.drawImage(Game.Bonus.img, Game.Bonus.x * cw - 5, Game.Bonus.y * cw - 5, 
				Settings.BlockSize + 10, Settings.BlockSize + 10);
		}
	},

	UpdateDimensions: function(w, h, dpi){
		width = w;
		height = h;
		canvas.width = w;
		canvas.height = h;
		setCanvasDPI(canvas, dpi);
	}
};

if($(window).width() > 500){
	console.log('Desktop version');  
	Game.UpdateDimensions(500, 360, 300);
} else {
	console.log('Mobile version');
	Game.UpdateDimensions(window.innerWidth - 20, 300, 150);
	Settings.BlockSize = 20;
}

Game.Init();

//Click on play button
$(document).on('click', '#overlay-text', function(){
	Game.Play();
	// addGameCount()
});

$(document).on('touchstart', '#overlay-text', function(){
	Game.Play();
	// addGameCount()
});

$(document).on('click', '#save', function(){
	$('#save-score-box').fadeIn('fast');
});

$(document).on('touchstart', '#save', function(){
	$('#save-score-box').fadeIn('fast');
});

//Click on save button
$(document).on('click', '#save-button', function(){
	saveScore();
});

$(document).on('touchstart', '#save-button', function(){
	saveScore();
});

function saveScore(){
	var score = Game.Score || 0;
	var time =  Math.floor(Game.SecondsElapsed/ 60)+ "Min" + Game.SecondsElapsed % 60 + "Sec" || "Unknown";
	var datetime = new Date().toISOString()
	var character = Game.Character || "k";
	var name = $('#save-name').val();
	var phone = $('#save-phone').val() || " ";
	var same = 'false';
	
	if(name.length > 0 && name != '' && score > 0){
		//Name and score valid
	
		if(Game.LocalStorage){
			//Check if user has already played in localstorage
			if(localStorage.getItem("username") == name){
				//Same user
				same = 'true';
				console.log('Same user, overwriting result');
			} else {
				//new user	
				localStorage.setItem("username", name); 
				console.log('New user, insert score');
			}
		}
		var highscore = {"phone":phone,
					    "score":score,
					    "player": name,
					    "character": character,
					    "datetime": datetime,
					    "time": time
						};
		//ajax call
		$.ajax({
				url: Settings.InsertScoreUrl,
				type: 'POST',
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				data: JSON.stringify(highscore),
				crossDomain:true,
				success: function(data){
					console.log('Score submitted successfully!');
					alert("Score submitted successfully!");
					loadRanking();
				},
				error: function(data){
					console.log('Failed to submit score');
					alert("Failed to submit score :(");
					loadRanking();
				}
			});
			

	}
	$('#save-score-box').fadeOut('fast');
	$('#save').fadeOut('fast');
}

$(document).on('click', '#cancel-button', function(){
	$('#save-score-box').fadeOut('fast');
});

$(document).on('touchstart', '#cancel-button', function(){
	$('#save-score-box').fadeOut('fast');
});


//Keydown events
$(document).on('keydown', function(e){
	var e = e || window.event;
	var c = e.keyCode;
	var d = Game.Direction;
	Game.PreviousArrowDirection = d;
	//Arrow keys
	//Directions: 1 : 'right', 2 : 'up', 3 : 'left', 4 : 'down'
	if((c == 37 || c == 100)&& d != 1) {
		//Left arrow	
		Game.Direction = 3; 
		if(Game.Paused && !Game.New){
			Game.Play();
		}
		return false;
	}
	else if((c == 38 || c == 104) && d != 4) { 
		//Up arrow
		Game.Direction = 2; 
		if(Game.Paused && !Game.New){
			Game.Play();
		}
		return false;
	}
	else if((c == 39 || c == 102) && d != 3) { 
		//Right arrow
		Game.Direction = 1; 
		if(Game.Paused && !Game.New){
			Game.Play();
		}
		return false;
	}
	else if((c == 40 || c == 101) && d != 2) { 
		//Down arrow
		Game.Direction = 4; 
		if(Game.Paused && !Game.New){
			Game.Play();
		}
		return false;
	}
	else if(c == 13) {
		//Press Enter
		if(Game.Paused){
			Game.Play();
		}
	} else if(c == 27 || c == 80){
		//Press Esc or 'p'
		if(!Game.Paused){
			Game.Pause();	
		}
	}
});

//Swipe events
$(document).ready(function(){
	$('#canvas-container').swipe( {       
        swipe:function(event, direction, distance, duration, fingerCount) {
			//Directions: 1 : 'right', 2 : 'up', 3 : 'left', 4 : 'down'
			var d = Game.Direction;
			if(direction == 'left' && d != 1) {
				//Left arrow	
				Game.Direction = 3; 
					return false;
				}
				else if(direction == 'up' && d != 4) { 
					//Up arrow
					Game.Direction = 2; 
					return false;
				}
				else if(direction == 'right' && d != 3) { 
					//Right arrow
					Game.Direction = 1; 
					return false;
				}
				else if(direction == 'down' && d != 2) { 
					//Down arrow
					Game.Direction = 4; 
					return false;
				}
        },
        threshold:20
      });
});