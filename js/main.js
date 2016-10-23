var dataArray = [];

var babyjesus = 0;

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

var phase = null;

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

    displayNoneAll();

    updateHeaders();

    updateDisplayVariables();

    updateTestContainers();

    updateFrames();

    updateMovementDisplays();
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
            displayCounter = false;
            updateUI();
            instructions = "";
            return true;
        }
    }, 1000);
}

function updateFrames(){

        // if (displayInstructionFrame && currentTest == 1 && phase != 3) {
        //     document.getElementById("frame1").style.display="block";
        // }
    

        // if (displayInstructionFrame && currentTest == 2 && phase != 3){
        //     document.getElementById('frame2').style.display="block";
        // }
    
    
        // if (displayInstructionFrame && currentTest == 3 && phase != 3) {
        //     document.getElementById('frame3').style.display="block";
        // }
    
}

function updateMovementDisplays() {
    if (currentMovement == 1 && currentTest === 2 && phase == 3) {
        document.getElementById("movementOne").style.display="block";
    }
    if (currentMovement == 2 && currentTest === 2 && phase == 3) {
        document.getElementById("movementTwo").style.display="block";
    }
    if (currentMovement == 3 && currentTest === 2 && phase == 3) {
        document.getElementById("movementThree").style.display="block";
    }
}

function updateTestContainers() {

    if (currentTest == 0) {
        document.getElementById("intro").style.display="block";
    }
    if (currentTest == 1 && (phase == 3 || phase == 4)) {
        document.getElementById("test1").style.display="block";
    }
    if (currentTest == 2 && (phase == 3 || phase == 4)) {
        document.getElementById("test2").style.display="block";
    }
    if (currentTest == 3 && (phase == 3 || phase == 4)) {
        document.getElementById("test3").style.display="block";
    }
    if (currentTest == -1 && phase == -1) {
        document.getElementById("analytics").style.display="block";
    }
}

function updateDisplayVariables(){
    document.querySelector('#sceneTitle').innerHTML = sceneTitle;
    document.querySelector('#instructions').innerHTML = instructions;

    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('#time').innerHTML = time;

    document.querySelector('.singleTC').innerHTML = singleTapCount;
    document.querySelector('.handCC').innerHTML = FHPCycleCount;
    document.querySelector('.lrTC').innerHTML = LRTapCount;
}

function displayNoneAll() {
    document.getElementById("intro").style.display="none";
    document.getElementById("test1").style.display="none";
    document.getElementById("test2").style.display="none";
    document.getElementById("test3").style.display="none";
    document.getElementById("movementOne").style.display="none";
    document.getElementById("movementTwo").style.display="none";
    document.getElementById("movementThree").style.display="none";
    document.getElementById("instructions").style.display="none";
    // document.getElementById("countdown").style.display="none";
    document.getElementById("time").style.display="none";
    document.getElementById("analytics").style.display="none";
    // document.getElementById("frame1").style.display="none";
    // document.getElementById("frame2").style.display="none";
    // document.getElementById("frame3").style.display="none";
}

function updateHeaders(){
    
    if (phase == 1) {
        document.getElementById("instructions").style.display="block";
    }
    // if (phase == 2) {
    //     document.getElementById("countdown").style.display="block";
    // }
    if (phase == 3) {
        document.getElementById("time").style.display="block";
    }
}

function beginFirstTest() {
    document.getElementById("frame1").style.display="block";
    document.getElementById("frame2").style.display="none";
    document.getElementById("frame3").style.display="none";
    phase = 1;
    currentTest = 1;
    sceneTitle = "Single Tap";
    instructions = "Tap your finger over the sensor at the height marked by the frame around it. Make sure your finger dips below the height of the frame when going down, and goes above it when coming back up. Do this as fast as you can in 15 second.<br /><br />Place your hand over the sensor when you are ready to begin.";
    updateUI();
    countSingleTaps();
}

function beginSecondTest() {
    document.getElementById("frame1").style.display="none";
    document.getElementById("frame2").style.display="block";
    document.getElementById("frame3").style.display="none";
    console.log(singleTapCount);
    babyjesus = singleTapCount;
    console.log(babyjesus);
    phase = 1;
    currentTest = 2;
    sceneTitle = "Fist-Hand-Palm Sequence";
    instructions = "Make a fist over the sensor, and then open the hand, and then turn it over. Repeat this sequence as many times as you can over 15 seconds.<br /><br />Place your hand over the sensor when you are ready to begin.";
    updateUI();
    countTheHandTurns();
}

function beginThirdTest() {
    document.getElementById("frame1").style.display="none";
    document.getElementById("frame2").style.display="none";
    document.getElementById("frame3").style.display="block";
    console.log(FHPCycleCount);
    phase = 1;
    currentTest = 3;
    sceneTitle="Left Right Finger Tap";
    instructions = "Move your fingers from side to side while keeping your hand steady. Do this over the sensor as many times as you can in 15 seconds.";
    updateUI();
    countLeftRightTaps();
}

function beginPhaseTwo() {
    console.log(LRTapCount);
    phase = 2;
    instructions = "Get Ready...";
    updateUI();
    updateUI();
    beginPhaseThree();
}

function beginPhaseThree() {
    phase = 3;
    updateUI();
}

function beginPhaseFour() {
    phase = 4;
    updateUI();
}

function displayAnalytics() {
    phase = -1;
    currentTest = -1;
    sceneTitle="Smart Analytics";
    instructions = "";
    updateUI();
}