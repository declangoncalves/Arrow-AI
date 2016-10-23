var dataArray = [];

var sceneTitle = "";
var instructions = "";
var time = 15;
var currentTest = 0;
var currentMovement = 0;
var displayCounter = true;
var displayInstructionFrame = true;
var messages = "";
var expectedPosition;
var lastPositon = null;

 var requested =  false; 

var singleTapCount = 0;
var STINT = 0;
var STSTDEV = 0;
var controllerOptions = {enableGestures: false};
var startTime;
var intervals = [];

var fingerDown = false;
var lastTap = 0; 

var LRTapCount = 0;
var LRIntervals = [];
var rightZone = false; //To detect which region we are in
var rightExited = false; //Once the tap is completed, we don't wanna throw error until they leave the region'
var rightTapped = false; //To prevent taps from being done in the same region more than once
var leftZone = false;
var leftExited = false;
var leftTapped = false;
var expectedDirection = 1; //1 is right and -1 is right, it will be inverted with every tap

var FHPCycleCount = 0;
var FHPIntervals = [];

function updateUI() {
    document.querySelector('.sceneTitle').innerHTML = sceneTitle;
    document.querySelector('.instructions').innerHTML = instructions;
    document.querySelector('.singleTC').innerHTML = singleTapCount;
    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('.time').innerHTML = time;
    document.querySelector('.handCC').innerHTML = FHPCycleCount;
    document.querySelector('.lrTC').innerHTML = LRTapCount;
    document.querySelector('.ED').innerHTML = expectedDirection;
    document.querySelector('.ME').innerHTML = messages;

    if (currentTest == 0) {
        document.getElementById("intro").style.display="block";
        document.getElementById("instructionFrame1").style.display="none";
        document.getElementById("instructionFrame2").style.display="none";
        document.getElementById("instructionFrame3").style.display="none";
        document.getElementById("test1").style.display="none";
        document.getElementById("test2").style.display="none";
        document.getElementById("test3").style.display="none";
    }

    else
        document.getElementById("intro").style.display="none";

    // Display current test elements
    if (currentTest == 1 && !displayCounter) {
        document.getElementById("test1").style.display="block";
        document.getElementById("test2").style.display="none";
        document.getElementById("test3").style.display="none";
    }
    if (currentTest == 2 && !displayCounter) {
        document.getElementById("test1").style.display="none";
        document.getElementById("test2").style.display="block";
        document.getElementById("test3").style.display="none";
    }
    if (currentTest == 3 && !displayCounter) {
        document.getElementById("test1").style.display="none";
        document.getElementById("test2").style.display="none";
        document.getElementById("test3").style.display="block";
    }

    //Display frame gifs
    
    if (displayInstructionFrame && currentTest == 1) {
        document.getElementById("instructionFrame1").style.display="block";
        document.getElementById("instructionFrame2").style.display="none";
        document.getElementById("instructionFrame3").style.display="none";
    }
    if (displayInstructionFrame && currentTest == 2){
        document.getElementById("instructionFrame1").style.display="none";
        document.getElementById("instructionFrame2").style.display="block";
        document.getElementById("instructionFrame3").style.display="none";
    }
    if (displayInstructionFrame && currentTest == 3) {
        document.getElementById("instructionFrame1").style.display="none";
        document.getElementById("instructionFrame2").style.display="none";
        document.getElementById("instructionFrame3").style.display="block";
    }

    // Display current movement elements
    if (currentMovement == 1) {
        document.getElementById("movementOne").style.display="block";
        document.getElementById("movementTwo").style.display="none";
        document.getElementById("movementThree").style.display="none";
    }
    if (currentMovement == 2) {
        document.getElementById("movementOne").style.display="none";
        document.getElementById("movementTwo").style.display="block";
        document.getElementById("movementThree").style.display="none";
    }
    if (currentMovement == 3) {
        document.getElementById("movementOne").style.display="none";
        document.getElementById("movementTwo").style.display="none";
        document.getElementById("movementThree").style.display="block";
    }
}

function countdown(){
    var counter = 3;
    displayInstructionFrame = false;
    displayCounter = true;
    document.getElementById("countdown").style.display="block";

    document.querySelector('#countdown').innerHTML = counter;
    var interval = setInterval(function() {
        counter--;
        document.querySelector('#countdown').innerHTML = counter;
        console.log(counter);
        // Display 'counter' wherever you want to display it.
        if (counter == 0) {
            // Display a login box     
            document.querySelector('#countdown').innerHTML = counter;
            clearInterval(interval);
            document.getElementById("countdown").style.display="none";
            displayCounter = false;
            updateUI();
            return true;
        }
    }, 1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}