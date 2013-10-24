#pragma strict
var randomStartX:boolean;
var randomStartY:boolean;
var randomStartZ:boolean;

var rotationAmountX:float = 0;
var rotationAmountY:float = 0;
var rotationAmountZ:float = 0;

function Start () {
	var startRotationX:float = 0;
 	if(randomStartX == true){
 		startRotationX = Random.Range(0,360);
	}
	var startRotationY:float = 0;
 	if(randomStartY == true){
 		startRotationY = Random.Range(0,360);
	}
	var startRotationZ:float = 0;
 	if(randomStartZ == true){
 		startRotationZ = Random.Range(0,360);
	}
	transform.Rotate(Vector3(startRotationX,startRotationY,startRotationZ));
}

function Update () {
	transform.Rotate(Vector3(rotationAmountX,rotationAmountY,rotationAmountZ));
}