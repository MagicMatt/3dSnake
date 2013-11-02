#pragma strict
var explosion:GameObject;

function explode () {
	var rot : Quaternion = transform.rotation;
	var pos : Vector3 = transform.position;
	var newExplosion:GameObject = Instantiate(explosion, pos,rot);
	newExplosion.transform.Rotate(90,0,0,Space.Self);
	Destroy(gameObject);
}