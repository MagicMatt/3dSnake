#pragma strict

   // using UnityEngine;
   // using System.Collections;
     
   

public var target:Transform;

public var  targetHeight:float = 1.7;
public var  distance:float = 5.0;

public var  maxDistance :float= 20;
public var  minDistance:float = .6;

public var  xSpeed:float = 250.0;
public var  ySpeed:float = 120.0;

public var  yMinLimit:int = -80;
public var yMaxLimit:int  = 80;

public var  zoomRate:int = 40;

public var  rotationDampening:float = 3.0;
public var  zoomDampening:float =5;

private var  x:float = 0.0;
private var  y:float = 0.0;
private var  currentDistance:float;
private var  desiredDistance:float;
private var  correctedDistance:float;




function Start(){
    var angles:Vector3  = transform.eulerAngles;
    x = angles.x;
    y = angles.y;

    currentDistance = distance;
    desiredDistance = distance;
    correctedDistance = distance;

    // Make the rigid body not change rotation
    if (rigidbody){
        rigidbody.freezeRotation = true;
    }
}

/**
 * Camera logic on LateUpdate to only update after all character movement logic has been handled.
 */
function Update(){
    // Don't do anything if target is not defined
    if (!target){
        return;
    }

/*    // If either mouse buttons are down, let the mouse govern camera position
    if (Input.GetMouseButton(0) || Input.GetMouseButton(1))
    {
        x += Input.GetAxis("Mouse X") * xSpeed * 0.02f;
        y -= Input.GetAxis("Mouse Y") * ySpeed * 0.02f;
    }
    // otherwise, ease behind the target if any of the directional keys are pressed
    else if (Input.GetAxis("Vertical") != 0 || Input.GetAxis("Horizontal") != 0)
    {
        float targetRotationAngle = target.eulerAngles.y;
        float currentRotationAngle = transform.eulerAngles.y;
        x = Mathf.LerpAngle(currentRotationAngle, targetRotationAngle, rotationDampening * Time.deltaTime);
    }
    */
    
	var targetRotationAngle:float = target.eulerAngles.y;
	var currentRotationAngle:float = transform.eulerAngles.y;
	x = Mathf.LerpAngle(currentRotationAngle, targetRotationAngle, rotationDampening * Time.deltaTime);

    y = ClampAngle(y, yMinLimit, yMaxLimit);

    // set camera rotation
     var rotation:Quaternion = Quaternion.Euler(y, x, 0);

  

    // calculate desired camera position
    var position:Vector3 =target.position - (rotation * Vector3.forward * desiredDistance + new Vector3(0, -targetHeight, 0));//
    // check for collision using the true target's desired registration point as set by user using height
    var collisionHit:RaycastHit;
    var trueTargetPosition:Vector3 = new Vector3(target.position.x, target.position.y , target.position.z);
    
    // calculate the desired distance
	if(Vector3.Distance(position,trueTargetPosition) < desiredDistance){
	//	desiredDistance += 0.9 * Time.deltaTime * zoomRate * Mathf.Abs(desiredDistance);
	}
  desiredDistance = Mathf.Clamp(desiredDistance, minDistance, maxDistance);
    correctedDistance = desiredDistance;

    // if there was a collision, correct the camera position and calculate the corrected distance
   var isCorrected:boolean = false;
   Debug.DrawLine(trueTargetPosition,position, Color.green);
       
    var layermask : int = ~(1<< target.gameObject.layer);
    // Debug.Log("layermask:" +  System.Convert.ToString (layermask, 2));
    if (Physics.Linecast(trueTargetPosition, position,collisionHit,layermask)){
     Debug.Log("Camera Obstructed" + collisionHit.collider.name);
        position = collisionHit.point;
        correctedDistance = Vector3.Distance(trueTargetPosition, position);
        isCorrected = true;
    }
   
    // For smoothing, lerp distance only if either distance wasn't corrected, or correctedDistance is more than currentDistance
    currentDistance = !isCorrected || correctedDistance > currentDistance ? Mathf.Lerp(currentDistance, correctedDistance, Time.deltaTime * zoomDampening) : correctedDistance;

    // recalculate position based on the new currentDistance
    position = target.position - (rotation * Vector3.forward * currentDistance + new Vector3(0, -targetHeight, 0));

    transform.rotation = rotation;
    transform.position = position;
}
     
function ClampAngle(angle:float , min: float ,max: float ):float{
	if (angle < -360){
		angle += 360;
	}
	if (angle > 360){
		angle -= 360;
	}
	return Mathf.Clamp(angle, min, max);
}
  