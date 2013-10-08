#pragma strict

@System.NonSerialized
var nextDirection: int = 0;

@System.NonSerialized
var currentDirection: int = 0;

//@System.NonSerialized
var initialSnakeLength: float = 2;

//@System.NonSerialized
var snakeLength: float = 0;

@System.NonSerialized
var speed: float = 10;

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




function Start (){
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
		
	}

	alive = true;
	for(var entry:DictionaryEntry in snakeParts){
		snakeSection = entry.Value;
		snakeSection.isEnabled = true;
	}
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
	
	if(id == 0){
		snakeHead = snakeSection;
	}
	
	if(id == Mathf.Round((snakeLength)/3)){
		Camera.main.GetComponent(SmoothFollow).target = snakeSection.transform.FindChild("Body").transform;
		Camera.main.GetComponent(SmoothFollow).height = snakeLength * 1.3;
			//Camera.main.transform.localRotation=Quaternion.identity;
			//Camera.main.transform.parent=transform;
			//Camera.main.transform.localPosition=Vector3(20,0,0);
			//Camera.main.transform.LookAt (snakeSection.transform);
	}
		
		
		
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
 	 Debug.Log("stableNum: " + stableNum);
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
	
	//if(contactCount < snakeLength -1){
	//	setForceFieldOn();
	//}else{
		//setForceFieldOff();
	//}
	
	//if(forceFieldOn){
		setForceFieldColor();
	//}
	
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

