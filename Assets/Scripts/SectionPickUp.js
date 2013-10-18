#pragma strict

var isActive:boolean = false;
var deployed:boolean = false;

var indicatorLight:Light;
var sparks:ParticleSystem;

function Start(){
	sparks = transform.FindChild("Sparks").particleSystem;
	indicatorLight = transform.FindChild("IndicatorLight").light;
	indicatorLight.color = Color.green;
	sparks.active = false;
}

function activate():boolean {
	sparks.active = true;
	isActive = true;
	indicatorLight.color = Color.red;
}

function deploySection(){
	deployed = true;
	sparks.active = false;
}