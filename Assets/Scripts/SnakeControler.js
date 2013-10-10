#pragma strict

@System.NonSerialized
var nextDirection: int = 0;

@System.NonSerialized
var currentDirection: int = 0;

//@System.NonSerialized
var initialSnakeLength: float = 10;

//@System.NonSerialized
var snakeLength: float = 0;

@System.NonSerialized
var speed: float = 3;

var snakeUnit:GameObject;
var snakeCab:GameObject;

var snakeParts:Hashtable = new Hashtable();

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

private var lengthDisplay:GUIText;


function Start (){
	//Physics.IgnoreLayerCollision(8,8);
	cameraSphere = GameObject.Find("CameraSphere").transform;
	lengthDisplay = GameObject.Find("UnitCountDisplay").GetComponent(GUIText);
	nextDirection = 0;
	for(var i:int =0; i < initialSnakeLength;i++){
		var snakeSection:SnakeSection = addSection(i);
		if(i == 0){
				snakeSection.gameObject.transform.position =Vector3 (0, 0.5, -i * snakeSection.sectionLength);
				snakeSection.speed = speed;
				snakeSection.direction=currentDirection;
		}else{
				snakeSection.gameObject.transform.position =Vector3 (0, 0.5, -i * snakeSection.sectionLength);
				snakeSection.speed = speed;
				snakeSection.direction=currentDirection;
		}
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
}

function init(){
 	callInit = false;
 	makeJoins();
 	setLengthText();
}
 

function makeJoins(){
	Debug.Log("makeJoins");
	for(var entry:DictionaryEntry in snakeParts){
	var snakeSection:SnakeSection  = entry.Value;
		
		if(snakeSection.nextSectionId != -1){
			snakeSection.conector.renderer.enabled = true;
		}
	}
}
function setLengthText(){
	lengthDisplay.text = snakeLength.ToString();
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
		snakeSection.controler = this;
		snakeParts.Add(id.ToString(),snakeSection);
		setLengthText();
		return snakeSection;
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



function Update () {
	if(callInit == true){
		init();
	}
	if(alive == true){
		handleInput();
		if(nextDirection != 0){
			if(acceptInput){
				snakeHead.SetMovement(nextDirection,speed);
				acceptInput = false;
			}
		}else{
			acceptInput = true;
		}
		
		checkSectionContact();
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
	newColor.a = 0.5;
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
 
}

