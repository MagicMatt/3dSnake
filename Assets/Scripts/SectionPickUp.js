#pragma strict

var isActive:boolean = false;
var deployed:boolean = false;

var spawnDir_1_Z_pos:boolean = true;
var spawnDir_2_Z_neg:boolean = true;
var spawnDir_3_X_pos:boolean = true;
var spawnDir_4_X_neg:boolean = true;
var defaultSpawnDir:int = 1;
var indicatorLight:Light;

var availableSpawnDirections:Hashtable;
var defaultSpawnRotation:Quaternion;


function Start(){
indicatorLight = transform.FindChild("IndicatorLight").light;
	indicatorLight.color = Color.green;
	
	
	setUpSpawnDirections();
}


function setUpSpawnDirections(){
	availableSpawnDirections = new Hashtable();
	var spawnRotation:Quaternion;
	if(spawnDir_1_Z_pos == true){
		spawnRotation = Quaternion.LookRotation(transform.forward);
		availableSpawnDirections["1"] = spawnRotation;
		if(defaultSpawnDir == 1){
			defaultSpawnRotation = spawnRotation;
		}
	}
	if(spawnDir_2_Z_neg == true){
		spawnRotation = Quaternion.LookRotation(-transform.forward);
		availableSpawnDirections["2"] = spawnRotation;
		if(defaultSpawnDir == 2){
			defaultSpawnRotation = spawnRotation;
		}
	}
	if(spawnDir_3_X_pos == true){
		spawnRotation = Quaternion.LookRotation(transform.right);
		availableSpawnDirections["3"] = spawnRotation;
		if(defaultSpawnDir == 3){
			defaultSpawnRotation = spawnRotation;
		}
	}
	if(spawnDir_4_X_neg == true){
		spawnRotation = Quaternion.LookRotation(-transform.right);
		availableSpawnDirections["4"] = spawnRotation;
		if(defaultSpawnDir == 4){
			defaultSpawnRotation = spawnRotation;
		}
	}
	if(defaultSpawnRotation == null){
		for(var entry:DictionaryEntry in availableSpawnDirections){
			spawnRotation  = entry.Value;
			if(spawnRotation != null){
				defaultSpawnRotation = spawnRotation;
				break;
			}
		}
	}
	Debug.Log("defaultSpawnRotation: " + defaultSpawnRotation);
	
}

function checkSpawnRotation(spawnRotation:Quaternion){
	for(var entry:DictionaryEntry in availableSpawnDirections){
		var testRotation:Quaternion  = entry.Value;
		Debug.Log("spawnRotation: " + spawnRotation + ", testRotation: " + testRotation);
		if(testRotation != null){
		var angle : float = Quaternion.Angle(spawnRotation, testRotation);
			if(angle < 0.1){
			Debug.Log("Matched spawnRotation at: " + entry.Key);
				return spawnRotation;
				
			}
		}
	}
	Debug.Log("No match found returned defaultSpawnRotation");
	return defaultSpawnRotation;
}

function activate(){

	isActive = true;
	indicatorLight.color = Color.red;
}

function deploySection(){
	deployed = true;
	
}