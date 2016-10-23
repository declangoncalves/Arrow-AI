var outcome = null;
var confidence = null;

function countLeftRightTaps() {
    startTime = null;
    time = 15;
    requested = false;
    updateUI();

    var movingRight = false;
    var movingLeft = false;

    var controller = Leap.loop(controllerOptions, function(frame) {


        if ( startTime != null && time > 0) {
            time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
        }

    updateUI();
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
                        if (countdown) {
                            startTime = frame.timestamp;
                            beginPhaseTwo();
                        }
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
                                    "ColumnNames": ["TAPS" , "STINT", "STSTDEV", "CYCLES", "FHPINT", "FHPSTDEV", "LRCOUNT", "LRINT", "LRSTDEV", "HAS?"],
                                    "Values": [[babyjesus, STINT, STSTDEV, FHPCycleCount, FHPINT, FHPSTDEV, LRTapCount, parseInt(avg), parseInt(stdev), "FALSE"]]
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
                           
                            var result = JSON.parse(data);
                            outcome = result.Results.output1.value.Values[0][10];
                            confidence = result.Results.output1.value.Values[0][11];
                            console.log(outcome)
                            console.log(confidence)
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

                        beginPhaseFour();

                    }

                    //Get the instance of the hand then the index finger
                    var indexFinger = hand.indexFinger;
                    var fingerVelocity = indexFinger.tipVelocity;

                    if (movingLeft == false && movingRight == false && fingerVelocity[0] > 0)  {
                        movingRight = true
                    } else if (movingLeft == false && movingRight == false && fingerVelocity[0] < 0)  {
                        movingleft = true
                    } else if (movingLeft && fingerVelocity[0] > 0) {
                        LRTapCount += 1
                        movingLeft = false
                        movingRight = true

                        if (LRTapCount > 1) {
                            var interval = frame.timestamp - lastTap
                            LRIntervals.push(interval)
                            lastTap = frame.timestamp
                        } else {
                            lastTap = frame.timestamp
                        }
                    } else if (movingRight && fingerVelocity[0] < 0) {
                        LRTapCount +=1 
                        movingLeft = true
                        movingRight = false

                        if (LRTapCount > 1) {
                            var interval = frame.timestamp - lastTap
                            LRIntervals.push(interval)
                            lastTap = frame.timestamp
                        } else {
                            lastTap = frame.timestamp
                        }
                    }
            }
        }
    });
}