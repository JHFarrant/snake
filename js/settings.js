/** Game Settings **/

var Settings = {
	
	FPS: 15,
	SnakeLength: 5,
	InitialPosition: { x: 2, y: 2	},
	BlockSize: 20,
	BlockColor: '#822900',
	FoodColor: 'red',
	ScoreValue: 12,
	ScoreValueBorder: 8,
	ScoreBasedOnTime: false,
	FruitPercentage: 0.8,
	FruitDuration: 5, //Seconds,
	
	InsertScoreUrl: 'https://7d24h0kxw8.execute-api.eu-west-1.amazonaws.com/prod/highscore',
	GetRankingUrl: 'https://7d24h0kxw8.execute-api.eu-west-1.amazonaws.com/prod/highscore',
	AddGameCountUrl: 'http://fifteen.altervista.org/add-game.php',
	GetGameCountUrl: 'http://fifteen.altervista.org/get-game.php'
	
}