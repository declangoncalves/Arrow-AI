# ArrowAI

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

##What is ArrowAI?
ArrowAI is a medical diagnostic assistance tool that currently helps with the diagnosis of Huntington’s disease, but can be expanded to assist with a variety of other movement disorders. 

##What is Huntington’s Disease?
Huntington’s is a progressive neurodegenerative disorder that often present later in life with no earlier indications. It is a dibilitating disease for which there is no cure. However, early detection allows for management that helps releive some of the morbidity associated with the disease. 

##What does this tool do?
ArrowAI uses the LeapMotion sensor to capture motion of the hand and note abnormalities in hand motions to assess the onset and severity of the disease in those at risk. In addition to using motion capture, rather than relying on hard cutoffs, ArrowAI uses a cloud based learning model to learn from the test results or normal and control subjects to increase diagnostic accuracy over inflexible guidelines. 

##How do I use this?
1.	Plug in your LeapMotion sensor 
2.	Click the start test button below
3.	Follow the instructions for each test

###Note: This test is not definitvely diagnostic, but rather is to help people catch their symptoms early so that they can seek help when it will be most beneficial. This is not a substitute for assessment by a health care professional. 

#Finger Taps Test
Tap your finger over the sensor at the height marked by the frame around it. Make sure your finger dips below the height of the frame when going down, and goes above it when coming back up. Do this as fast as you can in 15 second. Place your hand over the sensor when you are ready to begin.

#Fist- Hand- Palm Sequence
Make a fist over the sensor, and then open the hand, and then turn it over. Repeat this sequence as many times as you can over 15 seconds. Place your hand over the sensor when you are ready to begin. 

#Technologies Used
LeapMotion sensor gathers raw data and tap detection.

For Finger Taps Test, when the index finger is pressed under a threshold relative to the leap sensor, a tap is registered. The time between each registered tap is tracked for single tap interval and standard deviation calculation. 

For Fist Hand Palm test, the orientation of palm and clench threshold is used to calculate one 
cycle. Number of cycles, cycle intervals and standard deviants are calculated.

Sensor data is taken from LeapMotion and processed by Azure Web Apps. By using Azure ML we can detect the progression of the early symptoms to high accuracy and Azure Power BI analyzes data and graphs are shown to the user.

The end result is a high accuracy tracking device for patients with Huntington’s disease. 



