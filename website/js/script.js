$(document).ready(function(e) {
    var height = $(window).height();
	$('body').css('height', height);
	$('#loader').css('height', height);

	$(window).resize(function(){
		var height = $(window).height();
		$('body').css('height', height);
		$('#loader').css('height', height);
	});
	
	// $('#speed-fader').change(function(){
	// 	Settings.FPS = $(this).val();
	// });
	
	$('#jk-selector').change(function(){
		if($(this).prop("checked") == true){
			$('body#main').removeClass("katie");
			$('body#main').addClass("jack");
			Game.SelectCharacter('j')
		}else{
			$('body#main').addClass("jack");
			$('body#main').addClass("katie");
			Game.SelectCharacter('k')
		}
		Game.Update()
		Game.CreateSnake()
	});
	
	loadRanking();
	// getGameCount()
	
});


function localStorageCheck(){ 
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
}

var populateRankings = function(data){
		console.log('Ranking retrieved!');
		$('#standings-loader').hide();
		$('#standing-list').empty();
		data["highscores"].sort((a, b) => (a.score < b.score) ? 1 : -1)
		for(var i in data["highscores"]){
			var li = $('<li></li>');
			var position = $('<span></span>')
				.addClass('position')
				.text((parseInt(i) + 1));
			var logo = $('<img></img>')
				.addClass('logo');
			if(data["highscores"][i].character == "k"){
					logo.attr("src","../img/KatieA2.png");
				}else if(data["highscores"][i].character == "j"){
					logo.attr("src","../img/JackS.png");
				}
			var name = $('<span></span>')
				.addClass('name')
				.text(data["highscores"][i].player);
			var time = $('<span></span>')
				.addClass('time')
				.text(data["highscores"][i].time);
			var score = $('<span></span>')
				.addClass('score')
				.text(data["highscores"][i].score);
			li.append(position).append(logo).append(name).append(time).append(score);
			$('#standing-list').append(li);	
		}
	} 

//Loads ranking list from server
function loadRanking(){	
	$('#standings-loader').show();
	$.ajax({
			url: Settings.GetRankingUrl,
			type: 'GET',
			dataType: 'json',
			crossDomain: true,
			success:populateRankings,
			error: console.log
		});	
}

function addGameCount(){
  $.ajax({
    url: Settings.AddGameCountUrl,
	type: 'GET',
    dataType: 'html',
	crossDomain:true,
	success: function(data){
	  console.log('Added one game count!');
	  getGameCount()
	  }
	});	
}

function getGameCount(){
  $.ajax({
    url: Settings.GetGameCountUrl,
	type: 'GET',
    dataType: 'html',
	crossDomain:true,
	success: function(data){
	  $('#play-counter').text('Played ' + data + ' times');
	  console.log('Game counter: ' + data);
	  }
	});	
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y,   x + w, y + h, r);
  this.arcTo(x + w, y + h, x,   y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x+w, y, r);
  this.closePath();
  return this;
}

function setCanvasDPI(canvas, dpi) {
    // Set up CSS size if it's not set up already
    if (!canvas.style.width)
        canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height)
        canvas.style.height = canvas.height + 'px';

    var scaleFactor = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
}
