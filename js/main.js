var dataArray = [];

var singleTapCount = 0;
var messages = "";
var controllerOptions = {enableGestures: false};
var startTime;
var intervals = [];
var time = 15;

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


function countSingleTaps() {
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
                //Make sure that the hand is flat
                if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    messages = "Your hand is not flat. Please make sure your hand it parallel to the floor"
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                    }
                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 15000000) {
                        var sum = 0;
                        for (var i = 0; i < intervals.length; i++) {
                                sum += intervals[i];
                        }
                        var avg = sum/intervals.length;
                        var stdev = 0
                        for (var i = 0; i < intervals.length; i++) {
                            stdev += Math.pow((intervals[i] - avg),2);
                        }
                        stdev = Math.sqrt(stdev / intervals.length)
                        data =  {
                            "Inputs": {
                                "input1": { 
                                    "ColumnNames": ["taps", "int", "stdev", "has?"],
                                    "Values": [singleTapCount, avg, stdev, "FALSE"]
                                },        
                            },
                            "GlobalParameters": {}
                        }

                        var jsonString = JSON.stringify(data);
                        messages = jsonString;
                        var url = 'https://ussouthcentral.services.azureml.net/workspaces/17a78a4991f6486bb00235017a0ce7ce/services/eee5dc459eb241d49db7cb8248ad14e1/execute?api-version=2.0&details=true'
                        var api_key = '856o3Y+Yo+F8T8yhpLPHdN/uWPy6HfrqxBNNnIJjLQu5UB5Re8uQG2Rk6p8Hp7BrJjP8YDXr94c0KQ0a/F/HDQ==' 
                        var header1 = ['Content-Type', 'Authorization']
                        var header2 = ['application/json', ('Bearer '+ api_key)]

                        var http = new XMLHttpRequest();

                        http.onload = function () {
                            var status = request.status;
                            var data = request.responseTest;
                            alert("Status: " + status + ". Response: " + data);
                        }

                        http.open("POST", url, true);

                        //Send the proper header information along with the request
                        http.setRequestHeader(header1[0], header2[0]);
                        http.setRequestHeader(header1[1], header2[1]);

                        http.send(jsonString);
                        
                        dataArray = [singleTapCount, avg, stdev];

                        // Update the UI
                        updateUI();
                        return;
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
};

function updateUI() {
    document.querySelector('.results').innerHTML = singleTapCount;
    document.querySelector('.messages').innerHTML = messages;
    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('.time').innerHTML = time;
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
