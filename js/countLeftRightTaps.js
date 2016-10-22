function countLeftRightTaps() {
    startTime = null;
    currentTest = 3;
    instructions = "Test3";
    time = 0;
   
    updateUI();

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
                        time = 0;
                        instructions = "Get Ready...";
                        countdown();
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