function countLeftRightTaps() {
    startTime = null;
    currentTest = 3;
    sceneTitle="Side-to-Side Finger Tap";
    displayInstructionFrame = true;
    instructions = "Test3";
    time = 0;
    requested = false;
    updateUI();

    var controller = Leap.loop(controllerOptions, function(frame) {


        if ( startTime != null && time > 0) {
            time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
        }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            messages = "No hands are visible. Please make sure your right hands is over the sensor";
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            messages = "You have placed both your hands over the sensor, please remove your left hand"; 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") { 
                 if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    messages = "Your hand is not flat. Please make sure your hand is parallel to the floor"
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                        time = 0;
                        instructions = "Get Ready...";
                        countdown();
                    }
                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 15000000) {
                        controller.disconnect();
                        var sum = 0;
                        for (var i = 0; i < LRIntervals.length; i++) {
                                sum += LRIntervals[i];
                        }
                        var avg = sum/LRIntervals.length/1000;
                        var stdev = 0
                        for (var i = 0; i < LRIntervals.length; i++) {
                            stdev += Math.pow((LRIntervals[i] - avg),2);
                        }
                        stdev = Math.sqrt(stdev / LRIntervals.length)/1000;

                         var data =  {
                            "Inputs": {
                                "input1": { 
                                    "ColumnNames": ["TAPS, STINT, STSTDEV, CYCLES", "FHPINT", "FHPSTDEV", "LRCOUNT", "LRINT", "LRSTDEV", "HAS?"],
                                    "Values": [[singleTapCount, STINT, STSTDEV, FHPCycleCount, FHPINT, FHPSTDEV, LRTapCount, parseInt(avg), parseInt(stdev), "FALSE"]]
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

                    //If they are supposed to be in the right side, then monitor for taps
                    if (expectedDirection == 1 && rightZone && rightExited == false ) {
                        if (fingerPosition[1]  < 100) {
                            fingerDown = true;
                        } else if (fingerPosition[1]  > 100 && fingerDown == true) {
                            LRTapCount += 1;
                            fingerDown = false;
                            expectedDirection *= -1; 
                            if (LRTapCount > 1) {
                                var intervalC = frame.timestamp - lastTap;
                                LRIntervals.push(intervalC);
                                lastTap = frame.timestamp;
                            } else {
                                lastTap = frame.timestamp;
                            }
                        }
                    //If they are supposed to be on the left side, then monitor for taps
                    } else if (expectedDirection == -1 && leftZone && leftExited == false) {
                        if (fingerPosition[1]  < 105) {
                            fingerDown = true;
                        } else if (fingerPosition[1]  > 105 && fingerDown == true) {
                            LRTapCount += 1;
                            fingerDown = false;
                            expectedDirection *= -1; 
                            if (LRTapCount > 1) {
                                var intervalC = frame.timestamp - lastTap;
                                LRIntervals.push(intervalC);
                                lastTap = frame.timestamp;
                            } else {
                                lastTap = frame.timestamp;
                            }
                        }
                    //If they enter the right side after they left the right side, warn them
                    } else if (expectedDirection == -1 && rightZone && rightExited == true) {
                        messages = "Taps need to alternate sides. Please tap on the left side"
                    //If they enter the left side after they left the left side, warn them
                    } else if (expectedDirection == 1 && leftZone && leftExited == true) {
                        messages = "Taps need to alterante sides. Please tap on the right side"
                    //When they leave from the right side, make sure to note they left the right
                    } else if (rightZone == false && leftZone == false && expectedDirection == -1) {
                        rightExited = true;
                        leftExited = false; 
                    //When they leave the left side, make sure to note that they left the left side
                    } else if (rightZone == false && leftZone == false && expectedDirection == 1) {
                        rightExited = false;
                        leftExited = true; 
                    }
                }
            }
        }
    });
}