

function countTheHandTurns() {
   startTime = null; 
   var lastPositon = null;
    currentTest = 2;
    instructions = "Multiple Movement Modality Assessment";
    time = 0;
   
    updateUI();

   positionEnum =  {
       FIST: "fist with the knuckles facing up",
       HAND: "open hand facing down",
       PALM: "open hand facing up"
   };

    var expectedPosition = positionEnum.FIST;

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
                //If the start time is not set, start it
                if (startTime == null) {
                    startTime = frame.timestamp;
                    instructions = "Get Ready...";
                    countdown();
                }
                // Once 15 seconds have passed, return the counts and the intervals
                if (frame.timestamp - startTime >= 15000000) {
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
                console.log(expectedPosition);
                // When waiting for the fist, look for normal vector facing down and closed fist
                if (expectedPosition == positionEnum.FIST) {
                    if (hand.palmNormal[1] < -0.85 && hand.grabStrength == 1) {
                        expectedPosition = positionEnum.HAND
                        console.log("Fist seen");
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
                //When waitng for plam up, look for normal up, and fist open
                } else if (expectedPosition == positionEnum.PALM) {
                    if (hand.palmNormal[1] > 0.85 && hand.grabStrength == 0) {
                        console.log("Palm seen");
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