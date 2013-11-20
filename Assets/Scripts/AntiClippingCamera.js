#pragma strict

   // using UnityEngine;
   // using System.Collections;
     
   

private var target:Transform;
var cameraTarget:GameObject;
var wantedCameraPosition:Transform;
var wpcIntitialX:float = 0;
var wpcIntitialY:float = 5;
var wpcIntitialZ:float = -10 ;
var cameraEnabled:boolean = false;






var  positionDamping:float = 0.5;
var  lookAtDamping:float = 3.0;





private var  currentDistance:float;
private var  desiredDistance:float;
private var  correctedDistance:float;
var myCamera:Transform;

//ensures the camera only initialises one the target has been assigned
private var ready:boolean = false;

function Start(){
	if(target){
		setTarget(target);
	}
}

function initialise(){
	//set the wantedCameraPosition to the correct initial position and rotation relative to the target;
   wantedCameraPosition.transform.rotation = Quaternion.identity;
   wantedCameraPosition.transform.position = Vector3.zero;
   wantedCameraPosition.transform.parent = target;
   wantedCameraPosition.transform.localPosition = Vector3(wpcIntitialX,wpcIntitialY,wpcIntitialZ);
   transform.position =  wantedCameraPosition.transform.position;
    // Make the rigid body not change rotation
   if (rigidbody){
        rigidbody.freezeRotation = true;
   }
}

function setTarget(_target:Transform){
	target = _target;
	if(wantedCameraPosition == null){
		var wantedCameraPosObject:GameObject = Instantiate(cameraTarget,Vector3(wpcIntitialX,wpcIntitialY,wpcIntitialZ), Quaternion.identity);
		wantedCameraPosition = wantedCameraPosObject.transform;
	}
	wantedCameraPosition.transform.rotation = Quaternion.identity;
   	wantedCameraPosition.transform.position = Vector3.zero;
  	wantedCameraPosition.transform.parent = target;
   	wantedCameraPosition.transform.localPosition = Vector3(wpcIntitialX,wpcIntitialY,wpcIntitialZ);
	transform.position =  wantedCameraPosition.transform.position;
	

//	transform.position =  wantedCameraPosition.transform.position;
}


function Update(){
    // return if wantedCameraPosition or target is not defined
    if ((target)&&(wantedCameraPosition)){
    	if(ready == false){
    		ready = true;
    		initialise();
    	}
    }else{
  //  Debug.Log("AntiClippingCamera target: " + target + ",wantedCameraPosition: " + wantedCameraPosition);
    	if(target){
    		setTarget(target);
    	}
    	ready = false;
        return;
    }
    if(!cameraEnabled){
    	return;
    }
    	
    var dcp:Vector3 =wantedCameraPosition.position;//
    
   
	transform.position = Vector3.Lerp(transform.position, dcp,positionDamping * Time.deltaTime);
    
    // check for collision using the true target's desired registration point as set by user using height
    var collisionHit:RaycastHit;
    var trueTargetPosition:Vector3 = new Vector3(target.position.x, target.position.y , target.position.z);
    

    // if there was a collision, correct the camera position and calculate the corrected distance
   	var isCorrected:boolean = false;
   	//Debug.DrawLine(trueTargetPosition,dcp, Color.green);
	var layermask : int = ~(1<< target.gameObject.layer);
	if (Physics.Linecast(trueTargetPosition, transform.position,collisionHit,layermask)){
 		transform.position = collisionHit.point;
		//Debug.Log("camera obstructed by: " + collisionHit.collider.gameObject);
	}
	var rotation:Quaternion = Quaternion.LookRotation(target.position - myCamera.position);
	myCamera.rotation = Quaternion.Slerp(myCamera.rotation, rotation, Time.deltaTime * lookAtDamping);
	myCamera.localPosition = myCamera.forward *2;
}
     
