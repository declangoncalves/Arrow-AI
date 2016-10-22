var dataArray = [];

var instructions = "Please move your hand over the leap motion sensor...";
var time = 15;
var currentTest = 1;
var displayCounter = true;
var messages = "";

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
    document.querySelector('.instructions').innerHTML = instructions;
    document.querySelector('.results').innerHTML = singleTapCount;
    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('.time').innerHTML = time;
    
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
}

function countdown(){
    var counter = 3;
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
            return;
        }
    }, 1000);
}