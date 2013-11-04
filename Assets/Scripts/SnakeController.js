#pragma strict


//initialisation vars
var initialSnakeLength: float = 10;
var initialSpeed:float = 2;
var minSpeed: float = 1;
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
private var forceFieldSound:AudioSource;
private var engineMain:AudioSource;
private var engineTurn:AudioSource;
private var ping:AudioSource;
private var proximity:AudioSource;
private var engineVolume:float = 0.5;

private var lives:int;

private var respawnDirection:Quaternion;
private var activeSectionPickUps:Array;





var gameManager:GameManager;


function Start(){
	var gameManagerObject:GameObject = GameObject.Find("GameManagerObject");
	gameManager = gameManagerObject.GetComponentInChildren(GameManager);
	cameraSphere = GameObject.Find("CameraSphere").transform;
	lengthDisplayText = GameObject.Find("UnitCountDisplay").GetComponent(GUIText);
	lives = gameManager.getLives();
	snakeTargetLength = initialSnakeLength;
	
	var levelStartPoint:GameObject = GameObject.Find("levelStartPoint");
	Debug.Log("levelStartPoint: " + levelStartPoint);
	activeSectionPickUps = new Array();
	var sectionPickUp:SectionPickUp = levelStartPoint.GetComponentInChildren(SectionPickUp);
	setRespawnVars(sectionPickUp); 
	var respawnRotation:Quaternion = sectionPickUp.defaultSpawnRotation;
	setRespawnDirection(respawnRotation);
	
	initialiseSnake();
}

function initialiseSnake(){
	Debug.Log("--------------------------SnakeController initialiseSnake()----------------------------");
	stopActiveSecionPickUps();
	snakeParts = new Hashtable();
	snakeLength = 0;
	destroyedSectionCount = 0;
	nextDirection = 0;
	for(var i:int =0; i < snakeTargetLength;i++){
		var snakeSection:SnakeSection = addSection(i);
		snakeSection.gameObject.transform.rotation = respawnDirection;
		snakeSection.gameObject.transform.position =spawnPoint.position;
		snakeSection.gameObject.transform.Translate((-i * snakeSection.sectionLength) * Vector3.forward,Space.Self);
		snakeSection.gameObject.transform.Translate((-0.5) * transform.up,Space.Self);
		snakeSection.speed = speed;
		snakeSection.direction=currentDirection;
	
		if(i == 0){
			snakeHead = snakeSection;
			Debug.Log("snakeHead: " + snakeHead);
		}
		
		if(i == 0){
			Camera.main.GetComponent(SmoothLookAt).target = snakeSection.transform.FindChild("Body").transform;
			cameraSphere.GetComponent(AntiClippingCamera).setTarget(snakeSection.transform.FindChild("Body").transform);
		
		}
	}

	

	alive = true;
	for(var entry:DictionaryEntry in snakeParts){
		snakeSection = entry.Value;
		snakeSection.isEnabled = true;
	}
	callInit = true;
	Debug.Log("--------------------------SnakeController initialiseSnake() END----------------------------");
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
		if(audioSource.clip.name == "forceField"){
			forceFieldSound = audioSource;
		}
		
 	}
 }

function init(){
Debug.Log("Snake Controller init()");
 	callInit = false;
 	
 	speed = initialSpeed;
 	setCameraHeight();
 	setUpAudio();
 	setSpeed();
 	setCameraToHeight();
 	makeJoins();
 //	setLengthText();
 	setDisplayLength();
 	rangeFinder();
}

function setCameraHeight(){
	cameraHeight = 0;//speed-minSpeed;
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
	//Debug.Log("---------------------makeJoins-----------------------------");
	for(var i:int =0; i < snakeTargetLength;i++){
		var snakeSection:SnakeSection = snakeParts[i.ToString()];
	Debug.Log("makeJoins snakeSection: " + snakeSection +", id: " + i);
		if(snakeSection.nextSectionId != -1){
			snakeSection.joinVisible = true;
		}
		snakeSection.setSpawnFieldVisible(false);
		snakeSection.setSectionVisible(false,false);
	
	}

	snakeHead.setSectionVisible(true,true);
	//Debug.Log("---------------------makeJoins End-----------------------------");
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
		//Debug.Log("link to previous section, sectionId: " + id +", PreviousSectionId: " + lastSection.sectionId);
	}
	
	if(id == snakeLength -1){
		snakeSection.nextSectionId = -1;
	}
		snakeSection.controller = this;
		snakeParts.Add(id.ToString(),snakeSection);
	//	snakeParts[id.ToString] = snakeSection;
		//Debug.Log("addSection snakeSection id: " + id);
		var testSnakeSection:SnakeSection = snakeParts[id.ToString()];
		//Debug.Log("addSection snakeSection array check: " + testSnakeSection);
		return snakeSection;
}

function deleteSection(sectionId:int){
	//Debug.Log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SnakeController deleteSection() sectionId: " + sectionId);	
	if( snakeParts[sectionId.ToString()] != null){
		 snakeParts[sectionId.ToString()] = null;
		/* destroyedSectionCount++;
		 if(destroyedSectionCount == snakeLength){
		 	snakeDestroyed();
		 }
		 */
		var snakeDestructionComplete:boolean = true;
		for(var i:int =0; i < snakeLength;i++){
			var snakeSection:SnakeSection = snakeParts[i.ToString()];
			if(snakeSection){
				snakeDestructionComplete = false;
			}
		}
		if(snakeDestructionComplete){
			snakeDestroyed();
		}
			
	 }else{
	 	Debug.Log("Already Deleted!!!!!!!!!!!!!!!!!!!!SnakeController deleteSection() sectionId: " + sectionId);	
	 }
}

function snakeDestroyed(){
	Debug.Log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SnakeController snakeDestroyed()!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
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
	Debug.Log("SnakeController respawn(), Time: " + Time.realtimeSinceStartup);
	//yield WaitForSeconds(5);
	Debug.Log("respawn");
	initialiseSnake();
}

function setRespawnVars(sectionPickUp:SectionPickUp){
 	spawnPoint.position = sectionPickUp.transform.position;
 	spawnPoint.rotation = sectionPickUp.transform.rotation;
 	activeSectionPickUps.push(sectionPickUp);
}

function setRespawnDirection(respawnRotation:Quaternion){
	//if(alive){
		respawnDirection = respawnRotation;
		Debug.Log("respawnDirection: " + respawnDirection);
	//}
}

function addPickUpSection(){
	var lastSection:SnakeSection = getSection(snakeLength-1);
	if(lastSection != null){
	Debug.Log("addPickUpSection lastSection.updateNext: " + lastSection.updateNext);
		if(lastSection.updateNext){
			//yield;
		}
		var snakeSection:SnakeSection = addSection(snakeLength);
		snakeSection.gameObject.transform.position = lastSection.gameObject.transform.position;
		snakeSection.gameObject.transform.rotation = lastSection.gameObject.transform.rotation;
		var body:Transform = snakeSection.gameObject.transform.FindChild("Body").transform;
		body.position = lastSection.Body.position;
		body.rotation = lastSection.Body.rotation;
		snakeSection.gameObject.transform.Translate(-snakeSection.sectionLength * lastSection.gameObject.transform.forward,Space.World);
		snakeSection.stepCount = lastSection.stepCount;
		snakeSection.direction =0;// lastSection.direction;
		snakeSection.nextDirection = 0;//lastSection.nextDirection;
		snakeSection.moveTotal = lastSection.moveTotal;
		snakeSection.newDirection = lastSection.newDirection;
		snakeSection.mode = lastSection.mode;
		lastSection.conector.renderer.enabled = true;

	snakeSection.speed = speed;
	snakeSection.isEnabled = true;
	snakeSection.setSpawnFieldVisible(true);
	incrementLengthDisplayNum();
	}
	//Time.timeScale = 0;
	
	//snakeSection.isEnabled = false;
	//lastSection.isEnabled = false;
}



function getSection(id:int):SnakeSection{
	var section:SnakeSection;
	if(id < snakeLength){
		section =  snakeParts[id.ToString()];
	}
	
	if(section == null){
		Debug.Log("*********************************************getSection returns null for: " + id);
	}
	return section;
}

function getNextSection(id:int):SnakeSection{
	var sectionNum: int = id +1;
	var section:SnakeSection;
		if(sectionNum < snakeLength){
			section =  snakeParts[sectionNum.ToString()];
		}
	if(section == null){
		Debug.Log("*********************************************getNextSection returns null for: " + id);
	}
		
	return section;
}

function getPreviousSection(id:int):SnakeSection{
	var sectionNum: int = id -1;
	var section:SnakeSection;
	if(sectionNum >= 0){
		section =  snakeParts[sectionNum.ToString()];
	}
	if(section == null){
		Debug.Log("*********************************************getPreviousSection returns null for: " + id);
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
		
		var input:boolean = handleInput();
		if((acceptInput == true) && (input == true)){
			if(nextDirection!= 0){
				snakeHead.SetMovement(nextDirection);
		
			}
		}
		if(input == true){
			acceptInput = false;
		}else{
			acceptInput = true;
		}
		
	checkSectionContact();
	setCameraToHeight();
	updateAudio();
		
	}
}

function resetDirection(){
	//acceptInput = _acceptInput;
	nextDirection = 0;
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
				section.setForceFieldVisible(true);
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
				section.setForceFieldVisible(false);
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
	if(alive == true){
	 	contactCount = 0;
	 	stableNum = Mathf.Floor(snakeLength/2);
	 	 //Debug.Log("stableNum: " + stableNum);
		for(var i:int = 0; i < snakeLength; i++){
			var section:SnakeSection = snakeParts[i.ToString()] as SnakeSection;
			if(section != null){
				if(section.getContact() == true){
					contactCount++;
					section.setForceFieldVisible(false);
				}else{
					section.setForceFieldVisible(true);
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
		kill();
		}
		
		if(contactCount < snakeLength){
			if(forceFieldSound.isPlaying== false){
				forceFieldSound.Play();
			}
			forceFieldSound.volume = (1-((contactCount-stableNum)/(snakeLength-stableNum)))*2;
		}else{
			forceFieldSound.Stop();
		}
		
		if(statusBar){
			statusBar.displayValue = 1-(contactCount-stableNum)/(snakeLength-stableNum);
		}
	}
}

function kill(){
	// Debug.Log("KILL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
 	alive = false;
	setForceFieldOff();
	if(proximity){
		proximity.Stop();
	}
	stopSnake();
}

function stopSnake(){
	for(var j:int = 0; j < snakeLength; j++){
		var section:SnakeSection  = snakeParts[j.ToString()];
		if(section != null){
			section.setMode("stop");	
		}
	}
}
function stopActiveSecionPickUps(){
	for(var i:int = 0; i < activeSectionPickUps.length; i++){
		var activeSectionPickUp:SectionPickUp = activeSectionPickUps[i];
		activeSectionPickUp.deploySection();
	}
	activeSectionPickUps = [];
}

function adjustSpeed(dir:int){
	var increment:float = speedIncrement * dir;
	speed+=increment;
	speed = Mathf.Clamp(speed,minSpeed,maxSpeed);
	setSpeed();
	setCameraHeight();
}

function setCameraToHeight(){
	Camera.main.transform.localPosition.y = Mathf.Lerp (Camera.main.transform.localPosition.y, cameraHeight, heightDamping * Time.deltaTime);;
}

function handleInput():boolean{
	var horizontal:float = Input.GetAxis("Horizontal");
	var vertical:float =Input.GetAxis("Vertical");
	var input:boolean = false;
		//Debug.Log("----------------------------------------");
	
	 	if (vertical > 0) {
	  		nextDirection = 1;
	  	//	Debug.Log("vertical input = true: " + vertical);
	  		input = true;
	  		//UP
	 	}
		if (horizontal > 0) {
			nextDirection = 2;
		//	Debug.Log("horizontal input = true: " + horizontal);
	  		input = true;
			//RIGHT
	 	}
		if (vertical < 0) {
			if(snakeHead.getContact() == false){
		  		nextDirection = 3;
		  	//	Debug.Log("vertical input = true: " + vertical);
	  		input = true;
		  		//DOWN
		 	}
	 	}
	 	if (horizontal < 0) {
	  		nextDirection = 4;
	  	//	Debug.Log("horizontal input = true: " + horizontal);
	  		input = true;
	 		//LEFT
		}
	
	
	//	Debug.Log("vertical: " + vertical + ", horizontal: " + horizontal);
		//Debug.Log("input: " + input+", acceptInput: " + acceptInput + ", nextDirection: " + nextDirection);
	//
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
	return input;
}

