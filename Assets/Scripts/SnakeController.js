#pragma strict


//initialisation vars
var initialSnakeLength: float = 10;
var initialSpeed:float = 2;
var minSpeed: float = 0.2;
var maxSpeed: float = 10;
var speedIncrement: float = 0.2;
var heightDamping:float = 0.5;
var cameraHeight:float = 0;
var spawnPoint:Transform;


@System.NonSerialized
var nextDirection: int = 0;

@System.NonSerialized
var currentDirection: int = 0;

@System.NonSerialized
var snakeLength: float = 0;

@System.NonSerialized
var snakeTargetLength: float = 0;


@System.NonSerialized
var speed: float = 3;

var snakeUnit:GameObject;
var snakeCab:GameObject;

var snakeParts:Hashtable;

var snakeHead:SnakeSection;

private var acceptInput:boolean = true;

@System.NonSerialized
var alive:boolean = false;


private var forceFieldOn:boolean = false;
private var contactCount:int = 0;
var stableNum:float = 0;

var statusBar:StatusBar;

var cameraSphere:Transform;
var cameraOffset:Transform;

private var callInit:boolean = true;

private var lengthDisplayText:GUIText;
private var lengthDisplayNum:int;
private var destroyedSectionCount:int;



//AudioSources
private var engineMain:AudioSource;
private var engineTurn:AudioSource;
private var ping:AudioSource;
private var proximity:AudioSource;
private var engineVolume:float = 0.5;

private var lives:int;

private var respawnDirection:Quaternion;



var gameManager:GameManager;


function Start(){
	var gameManagerObject:GameObject = GameObject.Find("GameManagerObject");
	gameManager = gameManagerObject.GetComponentInChildren(GameManager);
	cameraSphere = GameObject.Find("CameraSphere").transform;
	lengthDisplayText = GameObject.Find("UnitCountDisplay").GetComponent(GUIText);
	lives = gameManager.getLives();
	snakeTargetLength = initialSnakeLength;
	initialiseSnake();
}

function initialiseSnake(){
	snakeParts = new Hashtable();
	snakeLength = 0;
	destroyedSectionCount = 0;
	nextDirection = 0;
	for(var i:int =0; i < snakeTargetLength;i++){
		var snakeSection:SnakeSection = addSection(i);
		//if(i == 0){
				snakeSection.gameObject.transform.rotation = respawnDirection;
				//snakeSection.gameObject.transform.position =Vector3 (spawnPoint.position.x, 0.5, spawnPoint.position.z -(i * snakeSection.sectionLength));
				snakeSection.gameObject.transform.position =spawnPoint.position;
				snakeSection.gameObject.transform.Translate((-i * snakeSection.sectionLength) * transform.forward,Space.Self);
				snakeSection.speed = speed;
				snakeSection.direction=currentDirection;
	/*	}else{
				snakeSection.gameObject.transform.rotation = respawnDirection;
				snakeSection.gameObject.transform.position =Vector3 (spawnPoint.position.x, 0.5, spawnPoint.position.z -(i * snakeSection.sectionLength));
				snakeSection.speed = speed;
				snakeSection.direction=currentDirection;
		}*/
		if(i == 0){
			snakeHead = snakeSection;
		}
		
		if(i == 0){
			Camera.main.GetComponent(SmoothLookAt).target = snakeSection.transform.FindChild("Body").transform;
			cameraSphere.GetComponent(AntiClippingCamera).target = snakeSection.transform.FindChild("Body").transform;
		
		}
	}
	
	

	alive = true;
	for(var entry:DictionaryEntry in snakeParts){
		snakeSection = entry.Value;
		snakeSection.isEnabled = true;
	}
	callInit = true;
	
}

function setUpAudio(){
	var audio:Array = snakeHead.GetComponentsInChildren(AudioSource);
	
	for(var i:int =0;i<audio.length;i++){
		var audioSource:AudioSource = audio[i] as AudioSource;
		if(audioSource.clip.name == "engineMain"){
			engineMain = audioSource;
			engineMain.volume = engineVolume;
			engineMain.Play();
		}
		
		if(audioSource.clip.name == "engineTurn"){
			engineTurn = audioSource;
			engineTurn.volume = 0.35 * engineVolume;
		}
		
		if(audioSource.clip.name == "ping"){
			ping = audioSource;
		}
		if(audioSource.clip.name == "proximityLoop"){
			proximity = audioSource;
		}
		
 	}
 }

function init(){
 	callInit = false;
 	
 	speed = initialSpeed;
 	setUpAudio();
 	setSpeed();
 	setCameraHeight();
 	makeJoins();
 //	setLengthText();
 	setDisplayLength();
 	rangeFinder();
}

function setDisplayLength(){
	lengthDisplayNum = snakeLength;
	setLengthText();
}

function incrementLengthDisplayNum(){
	lengthDisplayNum++;
		setLengthText();
}
 

function makeJoins(){
	Debug.Log("makeJoins");
	for(var entry:DictionaryEntry in snakeParts){
	var snakeSection:SnakeSection  = entry.Value;
		
		if(snakeSection.nextSectionId != -1){
			snakeSection.joinVisible = true;
			//snakeSection.conector.renderer.enabled = true;	
		}
	snakeSection.setSectionVisible(false,false);
	}
	snakeHead.setSectionVisible(true,true);
}
function setLengthText(){
	lengthDisplayText.text = lengthDisplayNum.ToString();
}

function addSection(id:int):SnakeSection{
	snakeLength++;
	if(id == 0){
			var cab:GameObject = Instantiate(snakeCab);
		
			var snakeSection:SnakeSection = cab.GetComponent(SnakeSection);
		
	}else{
			var section:GameObject = Instantiate(snakeUnit);
			snakeSection = section.GetComponent(SnakeSection);
			
	}
	snakeSection.sectionId = id;
	
	
		
		
		
	if(id > 0){
	
		var lastSection:SnakeSection = getPreviousSection(id);
		if(lastSection != null){
			lastSection.nextSectionId = snakeSection.sectionId;
			
		}
		Debug.Log("link to previous section, sectionId: " + id +", PreviousSectionId: " + lastSection.sectionId);
	}
	
	if(id == snakeLength -1){
		snakeSection.nextSectionId = -1;
	}
		snakeSection.controller = this;
		snakeParts.Add(id.ToString(),snakeSection);
		return snakeSection;
}

function deleteSection(sectionId:int){
	Debug.Log("Destoyed section: " + sectionId);
	if( snakeParts[sectionId.ToString()] != null){
		 snakeParts[sectionId.ToString()] = null;
		 destroyedSectionCount++;
		 if(destroyedSectionCount == snakeLength){
		 	snakeDestroyed();
		 }
	 }
}

function snakeDestroyed(){
	snakeTargetLength = lengthDisplayNum;
	if(lives >0){
		lives--;
		
		respawn();
	}else{
	respawn();
	// gameManager.gameOver();
	}
}

function respawn(){
	//yield WaitForSeconds(5);
	Debug.Log("respawn");
	initialiseSnake();
}

function setRespawnVars(sectionPickUp:SectionPickUp){
 	spawnPoint.position = sectionPickUp.transform.position;
}

function setRespawnDirection(){
	respawnDirection = snakeHead.transform.rotation;
	Debug.Log("respawnDirection: " + respawnDirection);
}

function addPickUpSection(){
	var snakeSection:SnakeSection = addSection(snakeLength);
	var lastSection:SnakeSection = getPreviousSection(snakeLength-1);
	if(lastSection != null){
		snakeSection.gameObject.transform.position = lastSection.gameObject.transform.position;
		snakeSection.gameObject.transform.rotation = lastSection.gameObject.transform.rotation;
		snakeSection.gameObject.transform.Translate(-snakeSection.sectionLength * transform.forward,Space.Self);
		snakeSection.stepCount = lastSection.stepCount;
		snakeSection.direction = lastSection.direction;
		snakeSection.nextDirection = lastSection.nextDirection;
		snakeSection.moveTotal = lastSection.moveTotal;
		snakeSection.newDirection = lastSection.newDirection;
		snakeSection.mode = lastSection.mode;
		lastSection.conector.renderer.enabled = true;
	}
	snakeSection.speed = speed;
	snakeSection.isEnabled = true;
	//Time.timeScale = 0;
}



function getSection(id:int):SnakeSection{
	var section:SnakeSection;
	if(id < snakeLength){
		section =  snakeParts[id.ToString()];
	}
	
	if(section == null){
		Debug.Log("getSection returns null for: " + id);
	}
	return section;
}

function getNextSection(id:int):SnakeSection{
	var sectionNum: int = id +1;
	var section:SnakeSection;
		if(sectionNum < snakeLength){
			section =  snakeParts[sectionNum.ToString()];
		}

		
	return section;
}

function getPreviousSection(id:int):SnakeSection{
	var sectionNum: int = id -1;
	var section:SnakeSection;
	if(sectionNum >= 0){
		section =  snakeParts[sectionNum.ToString()];
	}
	return section;
}

function setSpeed(){
	if(alive == true){
		for(var entry:DictionaryEntry in snakeParts){
			var snakeSection:SnakeSection  = entry.Value;
			if(snakeSection != null){
				snakeSection.speed = speed;
			}else{
				return;
			}
		}
	}
}


function Update () {
	if(callInit == true){
		init();
	}
	if(alive == true){
		handleInput();
		if(nextDirection != 0){
			if(acceptInput){
				snakeHead.SetMovement(nextDirection);
				acceptInput = false;
			}
		}else{
			acceptInput = true;
		}
		
		checkSectionContact();
		setCameraHeight();
		updateAudio();
		
	}
}

function rangeFinder(){
	if(alive){
		if(snakeHead.range != -1){
			makePing();
		}else{
			proximity.Stop();
			rangeFinderDelay();
		}
	}
}

function rangeFinderDelay(){
	yield WaitForSeconds (0.5);
	rangeFinder();
}
function makePing(){
	if(alive){
		if(snakeHead.range < 3.5){
			proximity.Play();
			rangeFinderDelay();
		}else{
			proximity.Stop();
			//var pingPitch:float = 1 +((1-(snakeHead.range/snakeHead.rangeDist)) *0.5);
		//	ping.pitch = pingPitch;
			ping.Play();
			var delay:float = (snakeHead.range*snakeHead.range)/((snakeHead.rangeDist*snakeHead.rangeDist));
			yield WaitForSeconds (delay);
			rangeFinder();
		}
	}
}

function updateAudio(){
 var pitch:float = ((speed/maxSpeed) * 1.2) + 0.3;
	engineMain.pitch= pitch;
	engineTurn.pitch= pitch*2.5;
}

function playTurnAudio(){
	if(alive == true){
		engineTurn.Play();
	}
}

function setForceFieldOn(){
	var section:SnakeSection;
	for(var i:int = 0; i < snakeLength; i++){
	section = snakeParts[i.ToString()];
		if(section != null){
			if(section.contact == false){
				section.forceField.renderer.enabled = true;
			}
		}
	}
}

function setForceFieldOff(){
	var section:SnakeSection;
	for(var i:int = 0; i < snakeLength; i++){
	section = snakeParts[i.ToString()];
		if(section != null){
			if(section.contact == true){
				section.forceField.renderer.enabled = false;
			}
		}
	}
}

function setForceFieldColor(){
	var newColor:Color = new Color();
	var newRed:float;
	var newGreen:float;
	newGreen = (contactCount-stableNum)/(snakeLength-stableNum);
	newRed = 1-newGreen;
	newColor.r = newRed;
	newColor.a =1;
	newColor.g = newGreen;
	var section:SnakeSection;
	for(var i:int = 0; i < snakeLength; i++){
		section = snakeParts[i.ToString()];
			if(section != null){
				section.forceFieldMaterial.color = newColor;
			}
		}
}

function checkSectionContact(){
 	contactCount = 0;
 	stableNum = Mathf.Floor(snakeLength/2);
 	 //Debug.Log("stableNum: " + stableNum);
	for(var i:int = 0; i < snakeLength; i++){
		var section:SnakeSection = snakeParts[i.ToString()] as SnakeSection;
		if(section != null){
			if(section.contact == true){
				contactCount++;
				section.forceField.renderer.enabled = false;
			}else{
				section.forceField.renderer.enabled = true;
			}
		}
	}
	

		setForceFieldColor();
	
//	Debug.Log("contactCount: " + contactCount);
	if(contactCount < stableNum){
	setForceFieldOff();
		for(var j:int = 0; j < snakeLength; j++){
			section = snakeParts[j.ToString()];
			if(section != null){
				if(section.contact == false){
					section.fall();
				}else{
					section.selfDestruct();
				}
			}
		}
	 Debug.Log("NOT ENOUGH CONTACT");
	 //snakeParts["0"].explode(false);
	 alive = false;
	 setForceFieldOff();
	}
	
	if(statusBar){
		statusBar.displayValue = 1-(contactCount-stableNum)/(snakeLength-stableNum);
	}
}

function adjustSpeed(dir:int){
	var increment:float = speedIncrement * dir;
	speed+=increment;
	speed = Mathf.Clamp(speed,minSpeed,maxSpeed);
	setSpeed();
	cameraHeight = speed-minSpeed;
	//setCameraHeight();
}

function setCameraHeight(){
	Camera.main.transform.localPosition.y = Mathf.Lerp (Camera.main.transform.localPosition.y, cameraHeight, heightDamping * Time.deltaTime);;
}

function handleInput():void{
	var horizontal:float = Input.GetAxis("Horizontal");
	var vertical:float =Input.GetAxis("Vertical");

		nextDirection = 0;
 	if (vertical > 0) {
  		nextDirection = 1;
  		//UP
 	}
	if (horizontal > 0) {
		nextDirection = 2;
		//RIGHT
 	}
	if (vertical < 0) {
  		nextDirection = 3;
  		//DOWN
 	}
 	if (horizontal < 0) {
  		nextDirection = 4;
 		//LEFT
	}
	
	var r_vertical:float =Input.GetAxis("R_Vertical");
	//Debug.Log("r_vertical: " + r_vertical);
	
	if (r_vertical ==1) {
		adjustSpeed(1);
	}
	
	if (r_vertical ==-1) {
		adjustSpeed(-1);
	}
	
	if (Input.GetKey(KeyCode.F)){
		adjustSpeed(1);
	}
	
	if (Input.GetKey(KeyCode.V)){
		adjustSpeed(-1);
	}
}

