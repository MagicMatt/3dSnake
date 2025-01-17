#pragma strict
var target : Transform;
var damping: float = 6.0;
var smooth: boolean = true;
 
//@script AddComponentMenu("Camera-Control/Smooth Look At")
 
function LateUpdate () {
	if (target) {
		if (smooth){
			// Look at and dampen the rotation
			var rotation:Quaternion = Quaternion.LookRotation(target.position - transform.position);
			transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * damping);
		}else{
			// Just lookat
			transform.LookAt(target);
		}
	}
}
 
function Start () {
// Make the rigid body not change rotation
	if (rigidbody){
		rigidbody.freezeRotation = true;
	}
}