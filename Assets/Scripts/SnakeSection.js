#pragma strict

@System.NonSerialized
var controller:SnakeController;


@System.NonSerialized
var mode:String = "forward";

@System.NonSerialized
var stepCount: int = 0;

//@System.NonSerialized
var sectionId: int = 0;



@System.NonSerialized
var stepFrames:int = 20;



@System.NonSerialized
var turnAngle:float = 90;

@System.NonSerialized
var pivotPos:Vector3;

@System.NonSerialized
var direction: int = 0;

@System.NonSerialized
var nextDirection: int = 0;

@System.NonSerialized
var passOnDirection: int = 0;


@System.NonSerialized
var speed: float = 0;

//@System.NonSerialized
var Body: Transform;

//@System.NonSerialized
//var nextSection: SnakeSection;

var nextSectionId: int = -1;

@System.NonSerialized
var sectionLength: float = 1;
@System.NonSerialized
var sectionWidth: float = 1;
@System.NonSerialized
var sectionHeight: float = 1;

@System.NonSerialized
var moveTotal: float = 0;

@System.NonSerialized
 var newDirection:boolean = true;

private var rightWheel:Transform;
private var leftWheel:Transform;
private var wheelRadius:float = 0.272;
@System.NonSerialized
var conector:Transform;
private var join:Transform;
private var rayProjectionPoint:Transform;
private var leftRangeProjectionPoint:Transform;
private var rightRangeProjectionPoint:Transform;
private var conected:boolean = true;
private var selfDestructSet:boolean = false;

//@System.NonSerialized
var forceField:Transform;

//@System.NonSerialized
var forceFieldMaterial:Material;

@System.NonSerialized
var contact:boolean = true;

@System.NonSerialized
var contactMadeThisFrame:boolean = false;

var joinAttachmentPoint:Transform;

private var detectDist:float = 1.3;

@System.NonSerialized
var rangeDist:float = 15;

var explosion:GameObject;

@System.NonSerialized
var isEnabled:boolean = false;

private var addSectionOnUpdateNext:boolean = false;
//private var pickUpToDestroy:GameObject;

var range:float;

var leftRangeRayAdjustVec:Vector3= Vector3(-0.9,0,0);
var rightRangeRayAdjustVec:Vector3= Vector3(0.9,0,0);


//@System.NonSerialized
var sectionVisible:boolean = false;
var joinVisible:boolean = false;
var forceFieldVisible:boolean = false;
var passOnVisibilityOnUpdate:boolean = false;


function Start(){
	
	explosion = Resources.Load("Detonator/Prefab/Detonator-Simple");
	Body = transform.FindChild("Body").transform;
	joinAttachmentPoint = transform.FindChild("Body/JoinAttachmentPoint").transform;
	join = transform.FindChild("Body/JoinContainer").transform;
	conector = transform.FindChild("Body/JoinContainer/Conector").transform;
	Debug.Log("section " + sectionId + " conector: " + conector);
	conector.renderer.enabled = false;
	
	forceField = transform.FindChild("Body/ForceField").transform;
	forceFieldMaterial = forceField.gameObject.renderer.material;
	forceFieldMaterial.color = Color.red;
	forceField.renderer.enabled = false;
	rightWheel = transform.FindChild("Body/moonTrainSection1/rightWheelContainer").transform;
	leftWheel = transform.FindChild("Body/moonTrainSection1/leftWheelContainer").transform;
	var rightValue:float = Random.value * 360 ;
	var leftValue:float = Random.value * 360 ;
	rightWheel.Rotate(Vector3(rightValue,0,0),Space.Self);
	leftWheel.Rotate(Vector3(leftValue,0,0),Space.Self);
	if(sectionId == 0){
		rayProjectionPoint = transform.FindChild("Body/rayProjectionPoint").transform;
		leftRangeProjectionPoint = transform.FindChild("Body/leftRangeProjectionPoint").transform;
		rightRangeProjectionPoint = transform.FindChild("Body/rightRangeProjectionPoint").transform;
	}
	
}

function setSectionVisible(_visible:boolean,passOnVisibility){
		passOnVisibilityOnUpdate = passOnVisibility;
		sectionVisible = _visible;
		var renderers = Body.gameObject.GetComponentsInChildren(Renderer);
		for (var renderer : Renderer in renderers) {
			renderer.enabled = sectionVisible;
		}
		var lights = Body.gameObject.GetComponentsInChildren(Light);
		for (var lightComp : Light in lights) {
			lightComp.enabled = sectionVisible;
		}
		if(sectionVisible == true){
			forceField.renderer.enabled = forceFieldVisible;
			conector.renderer.enabled = joinVisible;
		}
}

function setForceFieldVisible(_forceFieldVisible:boolean){
	forceFieldVisible = _forceFieldVisible;
	if(sectionVisible == true){
		forceField.renderer.enabled = forceFieldVisible;
	}
}

function getContact():boolean{
	if(sectionVisible == false){
		return true;
	}else{
		return contact;
	}
}

function Update () {
	if(isEnabled){
	contactMadeThisFrame = false;
		move();
		if(sectionId == 0){
			var rayDirection:Vector3;
			rayDirection = Body.forward;
			var hit : RaycastHit;
			Physics.Raycast(rayProjectionPoint.position,rayDirection, hit, detectDist);
			
		//	Debug.DrawRay(rayProjectionPoint.position,rayDirection * detectDist, Color.green);
		
			if(hit.collider != null){
				if(hit.collider.CompareTag("Terrain")){
					if(newDirection == true){
						nextDirection = 1;
					}
				}
			}
			var hit1 : RaycastHit;
			var range1:float = 1000000;
			//Debug.DrawRay(leftRangeProjectionPoint.position,rayDirection*rangeDist,Color.green);
			Physics.Raycast (leftRangeProjectionPoint.position,rayDirection, hit1, rangeDist);
			if((hit1.collider != null)&&(hit1.collider.CompareTag("AddSectionPickUp") == false) ){
					range1 = hit1.distance;
				}else{
					range1 = 1000000;
			}
				
				
			var hit2 : RaycastHit;
			var range2:float = 1000000;
		//	Debug.DrawRay(rightRangeProjectionPoint.position,rayDirection*rangeDist,Color.red);sectionVisible
			Physics.Raycast (rightRangeProjectionPoint.position,rayDirection, hit2, rangeDist);
				if((hit2.collider != null)&&(hit2.collider.CompareTag("AddSectionPickUp") == false) ){
					range2 = hit2.distance;
				}else{
					range2 = 1000000;
			}
			
			var hit3 : RaycastHit;
			var range3:float = 1000000;
			//Debug.DrawRay(rayProjectionPoint.position,rayDirection*rangeDist,Color.blue);
			Physics.Raycast (rayProjectionPoint.position,rayDirection, hit3, rangeDist);
				if((hit3.collider != null)&&(hit3.collider.CompareTag("AddSectionPickUp") == false) ){
					range3 = hit3.distance;
				}else{
					range3 = 1000000;
			}
			
			var testRange: float = Mathf.Min(range1,range2,range3);
			if(testRange < rangeDist){
				range = testRange;
				}else{
					range = -1;
			}
			
			
	  	}	
	}	
}

function OnTriggerEnter(other : Collider) {
	
	if(other.CompareTag("Terrain")){
		contact = true;
		contactMadeThisFrame = true;
	}	
	if(sectionVisible == true){
		if(other.CompareTag("Deadly")){
			if(selfDestructSet == false){
				controller.alive = false;
				collide();
			}
		}	
		if(sectionId ==controller.snakeLength-1){
			if(other.CompareTag("AddSectionPickUp")){
			var sectionPickUp:SectionPickUp = other.gameObject.GetComponent(SectionPickUp);
				if(sectionPickUp.deployed == false){
					addSectionOnUpdateNext = true;	
					sectionPickUp.deploySection();
					//controller.
					//pickUpToDestroy = other.gameObject;			
				}
			}
		}	
		if(sectionId == 0){
			if(other.CompareTag("AddSectionPickUp")){
				sectionPickUp = other.gameObject.GetComponent(SectionPickUp);
				if(sectionPickUp.isActive == false){
					sectionPickUp.activate();
					controller.incrementLengthDisplayNum();
					controller.setRespawnVars(sectionPickUp);
				}					
			}
		}	
		//Debug.Log("OnTriggerEnter");
	}
}

function callAddSection(){

	controller.addPickUpSection();	
}

function OnTriggerStay(other : Collider) {
	if(other.CompareTag("Terrain")){
		contact = true;
		contactMadeThisFrame = true;
	}	
//	Debug.Log("OnTriggerStay");
}

function OnTriggerExit(other : Collider) {
	if(other.CompareTag("Terrain")){
		if(contactMadeThisFrame == false){
			contact = false;
		}
	}	
	if(sectionId == 0){
			if(other.CompareTag("AddSectionPickUp")){
				//set direction for spawnpoint	
				var sectionPickUp:SectionPickUp = other.gameObject.GetComponent(SectionPickUp);
				if(sectionPickUp.deployed == false){
					var respawnRotation = sectionPickUp.checkSpawnRotation(transform.rotation);
					controller.setRespawnDirection(respawnRotation);
				}		
			}
			
			if(other.CompareTag("PowerSphere")){
				Destroy(other.gameObject);
			}
		}	
}



function OnCollisionEnter(collision : Collision) {
	if(sectionVisible == true){
		if(selfDestructSet == false){
			controller.alive = false;
			collide();
		}
	}
}


function fall(){
	isEnabled = false;
	rigidbody.isKinematic = false;
	rigidbody.useGravity = true;
	conected = false;
}

function collide(){	
	if(explosion){
		
			var rot : Quaternion = transform.rotation;
			var pos : Vector3 = transform.position;
			Instantiate(explosion, pos, rot);	
			conected = false;
			yield WaitForSeconds(0.25);
			killSection(0.75);
			destroyNextSection();
	
	}
}
function killSection(delay:float){
	yield WaitForSeconds(delay);
	controller.deleteSection(sectionId);
	Destroy(gameObject);
}
function triggerExplosion(chainReation:boolean){
	if(isEnabled){
		if(sectionVisible == true){
			isEnabled = false;
			explode();
			if(chainReation == true){
				if(sectionId < 10){
					yield WaitForSeconds(0.25);
				}
			destroyNextSection();
			}
			
		}else{
			killSection(0);
			if(chainReation == true){
				destroyNextSection();
			}
		}
		
	}
}

function selfDestruct(){
	if(isEnabled){
		isEnabled = false;
		selfDestructSet = true;
		if(sectionVisible == true){
			yield WaitForSeconds(Random.Range(2.5,4));
			explode();
		}else{
			killSection(0);
		}
	}
}

function explode(){
	if(explosion){
		var rot : Quaternion = transform.rotation;
		var pos : Vector3 = transform.position;
		Instantiate(explosion, pos, rot);
		conected = false;
		killSection(1);
	}
}
	

function destroyNextSection(){
	if(nextSectionId != -1){
		var nextSection = controller.getSection(nextSectionId);
		if(nextSection != null){
	 		nextSection.triggerExplosion(true);
	 	}
	}
}
	
function SetMovement(_nextDirection:int) {
	nextDirection = _nextDirection;
}


function setMode(newMode:String):void{

	mode = newMode;
	pivotPos = Vector3.zero;
 		
	if(mode == "turnUp"){
		pivotPos.y = 0.5 * sectionHeight;
 		pivotPos.z = -0.5 * sectionLength;
 	}
 	if(mode == "turnDown"){
		pivotPos.y = -0.5 * sectionHeight;
 		pivotPos.z = -0.5 * sectionLength;
 	}
 	
 	if(mode == "turnRight"){
		pivotPos.x = 0.5 * sectionWidth;
 		pivotPos.z = -0.5 * sectionLength;
 	}
 	
 	if(mode == "turnLeft"){
		pivotPos.x = -0.5* sectionWidth;
 		pivotPos.z = -0.5 * sectionLength;
 	}
}

function UpdateNextInChain () {
	if(nextSectionId != -1){
		var nextSection = controller.getSection(nextSectionId);
		
		if(nextSection != null){
			nextSection.SetMovement(passOnDirection);
			if(passOnVisibilityOnUpdate == true){
				passOnVisibilityOnUpdate = false;
				yield;
				nextSection.setSectionVisible(sectionVisible,true);
			}
		}else{
			Debug.Log("UpdateNextInChain nextSection == null  section: " + sectionId + ", nextSectionId: " + nextSectionId);
		}
	}
}


function moveForwards():boolean{
	var callUpdateNext:boolean = false;
	var moveDist:float = (speed*Time.deltaTime);
	if(moveTotal + moveDist > sectionLength){ 
		moveDist = sectionLength - moveTotal;
		callUpdateNext = true;
	}
	moveTotal += moveDist;
	transform.Translate(moveDist * transform.forward,Space.World);
	
	if(callUpdateNext){
		moveTotal = 0;
	}
	
	var wheelRotation:float = (moveDist/(2*Mathf.PI * wheelRadius)) * 360;
	rightWheel.Rotate(Vector3(wheelRotation,0,0),Space.Self);
	leftWheel.Rotate(Vector3(wheelRotation,0,0),Space.Self);
	
	
	
	return callUpdateNext;
}

function move():void{
	 

	var DirectionSet:boolean = false;
	if(newDirection){
	newDirection = false;
		direction = nextDirection;
		nextDirection = 0;
		passOnDirection = direction;
 
 	
		if(direction == 0){
			setMode("forward");
			DirectionSet = true;
		}
		if(direction == 1){
			setMode("turnUp");
			DirectionSet = true;
		}
		if(direction == 2){
			setMode("turnRight");
			DirectionSet = true;
		}
		if(direction == 3){
			setMode("turnDown");
			DirectionSet = true;
		}
		if(direction == 4){
			setMode("turnLeft");
			DirectionSet = true;
		}
		if(DirectionSet == false){
			direction = 0;
			setMode("forward");
		}
		
	}
	
//Debug.Log("move updateNext: " + updateNext + ", sectionId: " + sectionId);
	if(moveTotal == 0){
		//if(sectionId == 0){
	 		if(direction != 0){
	 			controller.playTurnAudio();
	 		}
	 	//}
	}
	
	
	var turnStep:float = (turnAngle*speed) * Time.deltaTime;
	
	var updateNext:boolean = false;
	if(mode == "forward"){
		updateNext = moveForwards();
	}
	
	if(mode == "turnUp"){
 			updateNext = moveForwards();
 			Body.Translate(pivotPos, Space.Self);
 			Body.Rotate(-turnStep, 0, 0, Space.Self);
 			Body.Translate(-pivotPos, Space.Self);
		if(updateNext){
			transform.Rotate(-turnAngle, 0, 0, Space.Self);
			transform.Translate(sectionLength * transform.forward,Space.World);
			Body.localPosition = Vector3.zero;
			Body.localRotation = Quaternion.identity;
 			setMode("forward");
			direction = 0;
			updateNext = true;
		}
	}
	if(mode == "turnDown"){
 			updateNext = moveForwards();
 			Body.Translate(pivotPos, Space.Self);
 			Body.Rotate(turnStep, 0, 0, Space.Self);
 			Body.Translate(-pivotPos, Space.Self);
		if(updateNext){
			transform.Rotate(turnAngle, 0, 0, Space.Self);
			transform.Translate(sectionLength * transform.forward,Space.World);
			Body.localPosition = Vector3.zero;
			Body.localRotation = Quaternion.identity;
 			setMode("forward");
			direction = 0;
			updateNext = true;
		}
	}
	if(mode == "turnRight"){
 			updateNext = moveForwards();
 			Body.Translate(pivotPos, Space.Self);
 			Body.Rotate( 0, turnStep,0, Space.Self);
 			Body.Translate(-pivotPos, Space.Self);
		if(updateNext){
			transform.Rotate( 0, turnAngle, 0, Space.Self);
			transform.Translate(sectionLength * transform.forward,Space.World);
			Body.localPosition = Vector3.zero;
			Body.localRotation = Quaternion.identity;
 			setMode("forward");
			direction = 0;
			updateNext = true;
		}
	}
	if(mode == "turnLeft"){
 			updateNext = moveForwards();
 			Body.Translate(pivotPos, Space.Self);
 			Body.Rotate( 0, -turnStep,0, Space.Self);
 			Body.Translate(-pivotPos, Space.Self);
		if(updateNext){
			transform.Rotate( 0, -turnAngle, 0, Space.Self);
			transform.Translate(sectionLength * transform.forward,Space.World);
			Body.localPosition = Vector3.zero;
			Body.localRotation = Quaternion.identity;
 			setMode("forward");
			direction = 0;
			updateNext = true;
		}
	}
	
	
	
	if(nextSectionId != -1){
		var nextSection = controller.getSection(nextSectionId);
		if(nextSection != null){
			if(conected){
			if(nextSection.joinAttachmentPoint){
					join.LookAt(nextSection.joinAttachmentPoint);
					if(nextSection.joinAttachmentPoint ==null){
						Debug.Log("joinAttachmentPoint =null on section: " + nextSection.sectionId);
					}
					var joinLength:float =  Vector3.Distance(join.position,nextSection.joinAttachmentPoint.position);
					join.localScale.z = joinLength +0.2;
					var joinWidthMax :float = 1;
					var joinWidth =(0.8/joinLength)*0.75;
						if(joinWidth > joinWidthMax){
							joinWidth = joinWidthMax;
						}
					join.localScale.y = joinWidth;
					join.localScale.x = joinWidth;
				}
			}
		}
	}
	

	if(updateNext){
		if(addSectionOnUpdateNext){
			addSectionOnUpdateNext = false;
			callAddSection();
		}
		newDirection = true;
		UpdateNextInChain();	
	}
}

