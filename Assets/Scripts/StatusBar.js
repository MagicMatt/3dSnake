#pragma strict
 
// JavaScript
 
var backgroundTexture: Texture;
var foregroundTexture: Texture;
var frameTexture: Texture;
var barWidth: int = 30;
var barHeight: int = 350;
var frameWidth: int = 30;
var frameHeight: int = 350;
var posX: int = 10;
var posY: int = 10;
var barPosX: int = 10;
var barPosY: int = 10;
var isVertical: boolean = false; 
var displayValue:float = 0;
var maxIncrement:float = 0.5;


function Start(){
	if(isVertical){
	 	barPosY = frameHeight + posY;
	 	barPosX = posX;
	 	barHeight = 0;
 	}
}
 
function OnGUI () {

if(displayValue > 1){
	displayValue = 1;
}
if(displayValue < 0){
	displayValue = 0;
}

 if(isVertical){
 	barPosX = posX;
 	barWidth = frameWidth;
 	var targetHeight:float = (displayValue * frameHeight);
 	//Debug.Log("targetHeight: " + targetHeight);
 	if(targetHeight > barHeight + maxIncrement){
 		targetHeight = barHeight + maxIncrement;
 	}else if(targetHeight < barHeight - maxIncrement){
 		targetHeight = barHeight - maxIncrement;
 	}
 	barHeight = targetHeight;
 	var targetY:float = frameHeight - barHeight + posY;
 	/*if(targetY - barPosY > maxIncrement){
 		targetY = barPosY + maxIncrement;
 	}else if(targetY - barPosY < -maxIncrement){
 		targetY = barPosY - maxIncrement;
 	}
 	if(targetY > frameHeight + posY){
 		targetY = frameHeight + posY;
 	}
 	*/
 	barPosY = targetY;
 }else{
 	barPosY = posY;
 	barHeight = frameHeight;
 	barWidth = (displayValue * frameWidth);	
 }
    GUI.DrawTexture( Rect(posX,posY,  frameWidth, frameHeight), backgroundTexture, ScaleMode.StretchToFill, true, 0 );
 
    GUI.DrawTexture( Rect(barPosX,barPosY,barWidth , barHeight), foregroundTexture, ScaleMode.StretchToFill, true, 0 );
 
    GUI.DrawTexture( Rect(posX,posY, frameWidth,frameHeight ), frameTexture, ScaleMode.StretchToFill, true, 0 );
 
}