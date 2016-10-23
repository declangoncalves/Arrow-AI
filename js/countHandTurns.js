    FHPINT = 0;
    FHPSTDEV = 0;

function countTheHandTurns() {
    startTime = null;
    displayInstructionFrame = true;
    lastPositon = null;
    time = 18;

   positionEnum =  {
       FIST: "fist with the knuckles facing up",
       HAND: "open hand facing down",
       PALM: "open hand facing up"
   };

    expectedPosition = positionEnum.FIST;

    var controller = Leap.loop(controllerOptions, function(frame) {

        if ( startTime != null && time > 0) {
            time = 18 - Math.floor((frame.timestamp - startTime)/1000000);
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
                //If the start time is not set, start it
                if (startTime == null) {
                    startTime = frame.timestamp;
                    beginPhaseTwo();
                }

                // Once 15 seconds have passed, return the counts and the intervals
                if (frame.timestamp - startTime >= 18000000) {
                    controller.disconnect();
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

                    FHPINT = parseInt(avg);
                    FHPSTDEV = parseInt(stdev);
                    beginPhaseFour();
                }

                // When waiting for the fist, look for normal vector facing down and closed fist
                if (expectedPosition == positionEnum.FIST) {
                    if (hand.palmNormal[1] < -0.85 && hand.grabStrength == 1) {
                        expectedPosition = positionEnum.HAND
                        console.log("Fist seen");
                        currentMovement = 1;
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
                    if (hand.palmNormal[1] < -0.85 && hand.grabStrength == 0) {
                        console.log("Hand seen");
                        currentMovement = 2;
                        expectedPosition = positionEnum.PALM;
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
                //When waiting for plam up, look for normal up, and fist open
                } else if (expectedPosition == positionEnum.PALM) {
                    if (hand.palmNormal[1] > 0.85 && hand.grabStrength == 0) {
                        console.log("Palm seen");
                        currentMovement = 3;
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