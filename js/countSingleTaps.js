function countSingleTaps() {
    startTime = null;
    displayInstructionFrame = true;
    requested= false;

    sceneTitle = "Single Tap";
    instructions = "Tap your finger over the sensor at the height marked by the frame around it. Make sure your finger dips below the height of the frame when going down, and goes above it when coming back up. Do this as fast as you can in 15 second.<br /><br />Place your hand over the sensor when you are ready to begin.";
    startValue = 0.0;
    var controller = Leap.loop(controllerOptions, function(frame) {

    if ( startTime != null && time > 0) {
        time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
    }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            console.log("No hands are visible. Please make sure your right hands is over the sensor");
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            console.log("You have placed both your hands over the sensor, please remove your left hand"); 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") {  
                //Make sure that the hand is flat
                if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    console.log("Your hand is not flat. Please make sure your hand is parallel to the floor");
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                        beginPhaseTwo();
                        startValue = hand.indexFinger.tipPosition[1];
                    }

                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 15000000) {
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

                        beginPhaseFour();
                        controller.disconnect();
                    }

                    //Get the instance of the hand then the index finger
                    var indexFinger = hand.indexFinger;
                    var fingerPosition = indexFinger.tipVelocity;

                    //When the finger goes down, mark it as down and then when it comes back up, increase the tap count
                    //and then note the interval to the last tap if there has been more than one tap
                    if (fingerPosition[1]  < 0) {
                        fingerDown = true;
                    } else if (fingerPosition[1]  > (0) && fingerDown == true) {
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
    
    updateUI();
    
    });
}