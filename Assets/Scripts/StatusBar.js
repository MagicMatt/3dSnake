#pragma strict
 
// JavaScript
 
var backgroundTexture : Texture;
var foregroundTexture : Texture;
var frameTexture : Texture;
 
var barWidth: int = 199;
var barHeight: int = 30;
 
var barMarginLeft: int = 41;
var barMarginTop: int = 38;
 
var frameWidth : int = 266;
var frameHeight: int = 65;
 
var frameMarginLeft : int = 10;
var frameMarginTop: int = 10;
 
function OnGUI () {
 
    GUI.DrawTexture( Rect(frameMarginLeft,frameMarginTop, frameMarginLeft + frameWidth, frameMarginTop + frameHeight), backgroundTexture, ScaleMode.ScaleToFit, true, 0 );
 
    GUI.DrawTexture( Rect(barMarginLeft,barMarginTop,barWidth + barMarginLeft, barHeight), foregroundTexture, ScaleMode.ScaleAndCrop, true, 0 );
 
    GUI.DrawTexture( Rect(frameMarginLeft,frameMarginTop, frameMarginLeft + frameWidth,frameMarginTop + frameHeight), frameTexture, ScaleMode.ScaleToFit, true, 0 );
 
}