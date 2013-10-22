#pragma strict

var customText : GUIStyle;
var margin:int = 30;
var bonus:int;
var score:int;
var totalScore:int;
var totalScoreDisplay :int;
private var ray : Ray;
private var hit : RaycastHit;
 
 
 var gameManager:GameManager;


function Start(){
	var gameManagerObject:GameObject = GameObject.Find("GameManager");
	gameManager = gameManagerObject.GetComponentInChildren(GameManager);
	
	bonus = ((gameManager.getLevelScore()/gameManager.getTime())*gameManager.getLevelScore())* gameManager.getLives();
	score= gameManager.getScore();
	totalScoreDisplay = score;
	totalScore = gameManager.getScore() + bonus;
	customText.alignment = TextAnchor.UpperCenter;
	gameManager.setScore(totalScore);
}

function Update () {

	if(Input.GetMouseButtonDown(0)){
		ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		if(Physics.Raycast(ray, hit)){
			if(hit.transform.name == "ScoreScreen"){
			nextLevel();
			}
			
		}
	}
	
	if(totalScoreDisplay < totalScore){
		totalScoreDisplay += Mathf.Round(bonus/100.0);
	}
	if(totalScoreDisplay > totalScore){
		totalScoreDisplay = totalScore;
	}

}

function nextLevel(){
	var sceneName:String = gameManager.getNextLevelName();
	Application.LoadLevel(sceneName);
}

function OnGUI () { 
	if(gameManager){
		var rect: Rect;
		showTimer();
		
		var w:float = 0.5;
		var h:float = 0.5; 
		rect.x = (Screen.width*(w))/2;
		rect.y = (Screen.height*(h))/2;
  		rect.width = Screen.width*w;
  		rect.height = Screen.height*h;
		var scoreText:String = "Score: " + score.ToString();
		GUI.Label (rect, scoreText,customText);
		
		w = 0.5; // proportional width (0..1)
 		h = 0.7; // proportional height (0..1)
		rect.x = (Screen.width*(w))/2;
		rect.y = (Screen.height*(h))/2;
  		rect.width = Screen.width*w;
  		rect.height = Screen.height*h;

		var bonusText:String = "Bonus: " + bonus.ToString();
		GUI.Label (rect, bonusText,customText);
		
		w = 0.5; // proportional width (0..1)
 		h = 0.9; // proportional height (0..1)
		rect.x = (Screen.width*(w))/2;
		rect.y = (Screen.height*(h))/2;
  		rect.width = Screen.width*w;
  		rect.height = Screen.height*h;

		var totalText:String = "Total: " + totalScoreDisplay.ToString();
		GUI.Label (rect, totalText,customText);
	}
}


function showTimer(){
	var totalHundredths:int = Mathf.Round(gameManager.getTime()*100);
	var hundredths:int = totalHundredths%100;
	var seconds:int = (totalHundredths/100)%60;
	var minutes:int = (totalHundredths/100)/60;
	
	var hundredthsString:String = "";
	if(hundredths< 10){
		hundredthsString = "0";
	}
	hundredthsString = hundredthsString + hundredths.ToString();
	
	var secondsString:String = "";
	if(seconds< 10){
		secondsString = "0";
	}
	secondsString = secondsString + seconds.ToString();
	var minutesString:String = "";
	if(minutes< 10){
		minutesString = "0";
	}
	minutesString = minutesString + minutes.ToString();
	
	
	
	var timerText:String = "Time taken: " + minutesString + ":" + secondsString + ":" + hundredthsString;
	
		var rect: Rect;
		var w = 0.5; // proportional width (0..1)
 		var h = 0.3; // proportional height (0..1) 
		rect.x = (Screen.width*(w))/2;
		rect.y = (Screen.height*(h))/2;
  		rect.width = Screen.width*w;
  		rect.height = Screen.height*h;
	
	
	GUI.Label (rect, timerText,customText);
	
}