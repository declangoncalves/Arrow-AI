var dataArray = [];

var instructions = "Please move your hand over the leap motion sensor...";
var time = 15;

 var requested =  false; 

var singleTapCount = 0;
var STINT = 0;
var STSTDEV = 0;
var messages = "";
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

function countSingleTaps() {
    startTime = null; 
    requested= false; 
    var controller = Leap.loop(controllerOptions, function(frame) {

        if ( startTime != null && time > 0) {
            time = 18 - Math.floor((frame.timestamp - startTime)/1000000);
        }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            messages = "No hands are visible. Please make sure your right hands is over the sensor";
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            messages = "You have placed both your hands over the sensor, please remove your left hands"; 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") {  
                //Make sure that the hand is flat
                if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    messages = "Your hand is not flat. Please make sure your hand it parallel to the floor"
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                        instructions = "Get Ready...";
                        countdown();
                    }
                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 18000000) {
                        var sum = 0;
                        for (var i = 0; i < intervals.length; i++) {
                                sum += intervals[i];
                        }
                        var avg = sum/intervals.length/1000;
                        var stdev = 0
                        for (var i = 0; i < intervals.length; i++) {
                            stdev += Math.pow((intervals[i] - avg),2);
                        }
                        stdev = Math.sqrt(stdev / intervals.length)/1000;
                        
                        STINT = parseInt(avg);
                        STSTDEV = parseInt(stdev);

                        updateUI();
                    }

                    //Get the instance of the hand then the index finger
                    var indexFinger = hand.indexFinger;
                    var fingerPosition = indexFinger.tipPosition;

                    //When the finger goes down, mark it as down and then when it comes back up, increase the tap count
                    //and then note the interval to the last tap if there has been more than one tap
                    if (fingerPosition[1]  < 100) {
                        fingerDown = true;
                    } else if (fingerPosition[1]  > 100 && fingerDown == true) {
                        singleTapCount += 1;
                        fingerDown = false;
                        if (singleTapCount > 1) {
                            var intervalC = frame.timestamp - lastTap;
                            intervals.push(intervalC);
                            lastTap = frame.timestamp;
                        } else {
                            lastTap = frame.timestamp;
                        }
                    }
                }
            } else {
                messages = "This test needs to be done with the right hand. Please remove your left hand and use your right hand."
            } 
        }
        // Update the UI
        updateUI();
    });
}

function updateUI() {
    document.querySelector('.instructions').innerHTML = instructions;
    document.querySelector('.results').innerHTML = singleTapCount;
    document.querySelector('.messages').innerHTML = messages;
    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('.time').innerHTML = time;
}

function countdown(){
    var counter = 3;     
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
            document.getElementById("test1").style.display="block";
            document.getElementById("countdown").style.display="none";
            return;
        }
    }, 1000);
}

function countLeftRightTaps() {
    startTime = null; 
    Leap.loop(controllerOptions, function(frame) {


        if ( startTime != null && time > 0) {
            time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
        }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            messages = "No hands are visible. Please make sure your right hands is over the sensor";
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            messages = "You have placed both your hands over the sensor, please remove your left hands"; 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") { 
                 if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    messages = "Your hand is not flat. Please make sure your hand it parallel to the floor"
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                        instructions = "Get Ready...";
                    }
                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 15000000) {
                        //Code to send the data to the server
                    }

                    //Get the instance of the hand then the index finger
                    var indexFinger = hand.indexFinger;
                    var fingerPosition = indexFinger.tipPosition;

                    if (fingerPosition[0] > 45) {
                        rightZone = true;
                    } else if (fingerPosition[0] < -45) {
                        leftZone = true;
                    } else {
                        rightZone = false;
                        leftZone = false;
                    }

                    if (expectedDirection == 1 && rightZone && rightExited == false ) {
                        if (fingerPosition[1]  < 100) {
                            fingerDown = true;
                        } else if (fingerPosition[1]  > 100 && fingerDown == true) {
                            LRTapCount += 1;
                            fingerDown = false;
                            expectedDirection *= -1; 
                            if (LRTapCount > 1) {
                                var intervalC = frame.timestamp - lastTap;
                                intervals.push(intervalC);
                                lastTap = frame.timestamp;
                            } else {
                                lastTap = frame.timestamp;
                            }
                        }
                    }
                }
            }
        }
    });
}

function countHandTurns() {
   startTime = null; 
   var lastPositon = null;
   
   positionEnum =  {
       FIST: "fist with the knuckles facing up",
       HAND: "open hand facing down",
       PALM: "open hand facing up"
   };
   var expectedPosition = positionEnum.FIST;

    Leap.loop(controllerOptions, function(frame) {


        if ( startTime != null && time > 0) {
            time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
        }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            messages = "No hands are visible. Please make sure your right hands is over the sensor";
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            messages = "You have placed both your hands over the sensor, please remove your left hands"; 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") { 
                //If the start time is not set, start it
                if (startTime == null) {
                    startTime = frame.timestamp;
                }
                // Once 15 seconds have passed, return the counts and the intervals
                if (frame.timestamp - startTime >= 15000000) {
                     var sum = 0;
                        for (var i = 0; i < FHPIntervals.length; i++) {
                                sum += FHPIntervals[i];
                        }
                        var avg = sum/FHPIntervals.length/1000;
                        var stdev = 0
                        for (var i = 0; i < FHPIntervals.length; i++) {
                            stdev += Math.pow((FHPIntervals[i] - avg),2);
                        }
                        stdev = Math.sqrt(stdev / FHPIntervals.length)/1000;
                        var data =  {
                            "Inputs": {
                                "input1": { 
                                    "ColumnNames": ["TAPS, STINT, STSTDEV, CYCLES", "FHPINT", "FHPSTDEV", "HAS?"],
                                    "Values": [[singleTapCount, STINT, STSTDEV, FHPCycleCount, parseInt(avg), parseInt(stdev), "FALSE"]]
                                },        
                            },
                            "GlobalParameters": {}
                        }

                       

                        var jsonString = JSON.stringify(data);
                       console.log(jsonString);
                        var url = 'https://ussouthcentral.services.azureml.net/workspaces/17a78a4991f6486bb00235017a0ce7ce/services/eee5dc459eb241d49db7cb8248ad14e1/execute?api-version=2.0&details=true'
                        var api_key = '856o3Y+Yo+F8T8yhpLPHdN/uWPy6HfrqxBNNnIJjLQu5UB5Re8uQG2Rk6p8Hp7BrJjP8YDXr94c0KQ0a/F/HDQ==' 
                        var header1 = ['Content-Type', 'Authorization']
                        var header2 = ['application/json', ('Bearer '+ api_key)]

                        var http = new XMLHttpRequest();

                        http.onload = function () {
                            var status = http.status;
                            var data = http.responseText;
                           
                            console.log(data);
                            http.abort();
                            controller.disconnect();
                        }

                        http.open("POST", url, true);

                        //Send the proper header information along with the request
                        http.setRequestHeader("Content-Type", "application/json");
                        http.setRequestHeader("Authorization", 'Bearer ' + api_key);

                        if (requested == false) {
                            http.send(jsonString);
                            requested = true;
                        }
                        
                        
                        dataArray = [singleTapCount, avg, stdev];

                        // Update the UI
                        updateUI();
                }

                // When waiting for the fist, look for normal vector facing down and closed fist
                if (expectedPosition == positionEnum.FIST) {
                    if (hand.palmNormal[1] < -0.94 && hand.grabStrength == 1) {
                        expectedPosition == positionEnum.palmNormal;
                        if (lastPositon != null) {
                            var intervalC = frame.timestamp - lastTap;
                            FHPIntervals.push(intervalC);
                            lastPositon = frame.timestamp;
                        } else {
                            lastPositon = frame.timestamp;
                        }
                    } else {
                        messages = "Waiting for fist. Position: " + hand.palmNormal[1] + " Grip: " + hand.grabStrength;
                    }
                //When waiting for palm down, look for normal down and fist open
                } else if (expectedPosition == positionEnum.HAND) {
                    if (hand.palmNormal[1] < -0.95 && hand.grabStrength == 0) {
                        expectedPosition == positionEnum.PALM;
                        if (lastPositon != null) {
                            var intervalC = frame.timestamp - lastTap;
                            FHPIntervals.push(intervalC);
                            lastPositon = frame.timestamp;
                        } else {
                            lastPositon = frame.timestamp;
                        }
                    } else {
                        messages = "Waiting for open hand down. Position: " + hand.palmNormal[1] + " Grip: " + hand.grabStrength;
                    }
                //When waitng for plam up, look for normal up, and fist open
                } else if (expectedPosition == positionEnum.PALM) {
                    if (hand.palmNormal > 0.95 && hand.grabStrength == 0) {
                        expectedPosition = positionEnum.FIST;
                        FHPCycleCount += 1;
                        if (lastPositon != null) {
                            var intervalC = frame.timestamp - lastTap;
                            FHPIntervals.push(intervalC);
                            lastPositon = frame.timestamp;
                        } else {
                            lastPositon = frame.timestamp;
                        }
                    } else {
                        messages = "Waiting for palm up. Position: " + hand.palmNormal[1] + " Grip: " + hand.grabStrength;
                    }
                }
            }
        }
    }); 
}
