#pragma strict

@System.NonSerialized
var controler:SnakeControler;


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

@System.NonSerialized
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
private var conected:boolean = true;
private var selfDestructSet:boolean = false;

//@System.NonSerialized
var forceField:Transform;

//@System.NonSerialized
var forceFieldMaterial:Material;

@System.NonSerialized
var contact:boolean = true;

var joinAttachmentPoint:Transform;

private var detectDist:float = 1.3;

var explosion:GameObject;

@System.NonSerialized
var isEnabled:boolean = false;

private var addSectionOnUpdateNext:boolean = false;
private var pickUpToDestroy:GameObject;



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
	}
	
}



function Update () {
	if(isEnabled){
		move();
		if(sectionId == 0){
			var rayDirection:Vector3;
			rayDirection = Body.forward;
			var hit : RaycastHit;
			var layerMaskNum:int = LayerMask.NameToLayer("Ignore Raycast");
			if (Physics.Raycast (rayProjectionPoint.position,rayDirection, hit, detectDist)) {
				var distanceToItem = hit.distance;
			}
		//	Debug.DrawRay(rayProjectionPoint.position,rayDirection * detectDist, Color.green);
		
			if(hit.collider != null){
				if(hit.collider.CompareTag("Terrain")){
					if(newDirection == true){
						nextDirection = 1;
					}
				}
			}
	  	}	
	}	
}

function OnTriggerEnter(other : Collider) {
	if(other.CompareTag("Terrain")){
		contact = true;
	}	
	if(other.CompareTag("Deadly")){
		if(selfDestructSet == false){
			controler.alive = false;
			collide();
		}
	}	
	if(sectionId ==controler.snakeLength-1){
		if(other.CompareTag("AddSectionPickUp")){
			addSectionOnUpdateNext = true;	
			pickUpToDestroy = other.gameObject;			
		}
	}	
	//Debug.Log("OnTriggerEnter");
}

function callAddSection(){
	controler.addPickUpSection();	
}

function OnTriggerStay(other : Collider) {
	if(other.CompareTag("Terrain")){
		contact = true;
	}	
//	Debug.Log("OnTriggerStay");
}

function OnTriggerExit(other : Collider) {
	if(other.CompareTag("Terrain")){
		contact = false;
	}	
	//Debug.Log("OnTriggerExit");
}



function OnCollisionEnter(collision : Collision) {
	if(selfDestructSet == false){
		controler.alive = false;
		collide();
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
		Destroy (gameObject,0.75);
		destroyNextSection();
	}
}

function triggerExplosion(chainReation:boolean){
	if(isEnabled){
		isEnabled = false;
		explode();
		if(chainReation == true){
			yield WaitForSeconds(0.25);
			destroyNextSection();
		}
	}
}

function selfDestruct(){
	if(isEnabled){
		isEnabled = false;
		selfDestructSet = true;
		yield WaitForSeconds(Random.Range(2.5,4));
	explode();
	}
}

function explode(){
	if(explosion){
		var rot : Quaternion = transform.rotation;
		var pos : Vector3 = transform.position;
		Instantiate(explosion, pos, rot);
		conected = false;
		Destroy (gameObject,1);
	}
}


function destroyNextSection(){
	if(nextSectionId != -1){
		var nextSection = controler.getSection(nextSectionId);
		if(nextSection != null){
	 		nextSection.triggerExplosion(true);
	 	}
	}
}
	
function SetMovement(_nextDirection:int,_speed:float) {
	speed = _speed;
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
		var nextSection = controler.getSection(nextSectionId);
		
		if(nextSection != null){
			nextSection.SetMovement(passOnDirection,speed);
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


	var DirectionSet:System.Boolean = false;
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
		var nextSection = controler.getSection(nextSectionId);
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
			Destroy(pickUpToDestroy);
		}
		newDirection = true;
		UpdateNextInChain();	
	}
}

