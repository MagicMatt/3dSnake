#pragma strict

//Initialisation  variables
var score:int = 0;
var startLevel:int = 1;
var maxLevel:int = 2;
var startLives:int = 1;


//Stored variables
@System.NonSerialized
var lives:int;

@System.NonSerialized
var time:float;

@System.NonSerialized
var previousLevelScore:int = 0;

@System.NonSerialized
var level:int = 1;



function Start () {
	resetStats();
	loadLevel();
}

function resetStats(){
	level = startLevel;
	score = 0;
	level = startLevel;
	lives = startLives;
}

function Awake () {
//stops this script being destroyed when a new scene loads
	DontDestroyOnLoad (transform.gameObject);
}
 
public function getScore():int{
	return score;
}
 
public function setScore(score:int){
	previousLevelScore = this.score;
	this.score = score;
}

public function getLevel():int{
	return level;
}
 
public function incrementLevel(){
	this.level++;
}

public function getLives():int{
	return lives;
}
 
public function setLives(lives:int){
	this.lives = lives;
}

public function getTime():float{
	return time;
}
 
public function setTime(time:float){
	this.time = time;
}

public function getLevelScore():int{
	return score -previousLevelScore;
}

public function getNextLevelName():String{
	time = 0;
	var sceneName:String = "Level_" + level.ToString();
	Debug.Log("level: " + level.ToString());
	Debug.Log("sceneName: " + sceneName);
	if((level > maxLevel)||(lives <= 0)||(level ==0) ){
		sceneName = "Splash";
		resetStats();
	}
	
	return sceneName;
}

public function loadLevel(){
 	var sceneName:String = getNextLevelName();
	Application.LoadLevel(sceneName);
}

public function gameOver(){
	Debug.Log("Game Over");
}