#pragma strict

private var ray : Ray;
private var hit : RaycastHit;
var gameManager:GameManager;

function Start () {
	var statsManagerObject:GameObject = GameObject.Find("GameManager");
	gameManager = statsManagerObject.GetComponentInChildren(GameManager);
}

function Update () {

	if(Input.GetMouseButtonDown(0)){
		ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		if(Physics.Raycast(ray, hit)){
			if(hit.transform.name == "StartScreen"){
				gameManager.loadLevel();
			}
			
		}
	}

}
