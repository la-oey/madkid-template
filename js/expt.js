var expt = { //add conditions here
    saveURL: 'submit.simple.php',
    totalTrials: 2, //adjust to how many trials you have
    initFullscreen: window.fullscreen,
    debug: true //set to false when ready to run
};

var trial = {
    number: 1, //which trial is this? //1-indexed
    startTime: 0,
    endTime: 0,
    totalTime: 0
}
var client = parseClient();
var trialData = []; //store all data in json format



function pageLoad(){
    document.getElementById('consent').style.display = 'block';
    $('#continueConsent').attr('disabled',true);
    $('input:radio[name="consent"]').change(
        function(){
            if($(this).is(':checked') && $(this).val()=="yes"){
                $('#continueConsent').attr('disabled',false);
            }
        });
}

function clickContConsent(){
    document.getElementById('consent').style.display = 'none';
    document.getElementById('window').style.display = 'block';
    checkWindowDimensionsDynamic();
}

function clickFullscreen(){
    if($('#fullscreenButton').attr('value') == 'off'){
        var winFull = document.documentElement; // Make the browser window full screen.
        openFullscreen(winFull);
        $('#fullscreenButton').html('Exit<br>full screen mode');
        $('#fullscreenButton').attr('value', 'on');
        $('#fullscreenButton').css({'border-color':'red', 'background-color':'red'});
        $('#fullscreenButton').hover(function(){
            $(this).css('background-color','red');
        }, function(){
            $(this).css('background-color', 'white');
        })
    } else{
        closeFullscreen();
        $('#fullscreenButton').html('Enter<br>full screen mode');
        $('#fullscreenButton').attr('value', 'off');
        $('#fullscreenButton').css({'border-color':'#4CAF50', 'background-color':'#4CAF50',});
        $('#fullscreenButton').hover(function(){
            $(this).css('background-color','#4CAF50');
        }, function(){
            $(this).css('background-color', 'white');
        })
    }
}

function clickContWindow(){
    document.getElementById('window').style.display = 'none';
    document.getElementById('camera').style.display = 'block';
}


function clickContCamera(){
    document.getElementById('camera').style.display = 'none';
    document.getElementById('video').style.display = 'block';
}

function clickContVideo(){
    document.getElementById('video').style.display = 'none';
    document.getElementById('microphone').style.display = 'block';
}


function clickContMicrophone(){
    document.getElementById('microphone').style.display = 'none';
    trialStart();
}

function trialStart(){
    document.getElementById('trial').style.display = 'block';
    //$('#next').attr('disabled',true);
    $('#round').html('Round ' + trial.number + " of " + expt.totalTrials);
    trial.startTime = new Date().getTime(); //reset start of trial time
}

function trialDone(){
    document.getElementById('trial').style.display = 'none';
    trial.endTime = new Date().getTime();
    trial.totalTime = trial.endTime - trial.startTime;

    recordData();
    // these lines write to server
    data = {client: client, expt: expt, trials: trialData};
    if(!expt.debug){
        writeServer(data);
    }

    
    // if we are done with all trials, then go to completed page
    if(trial.number == expt.totalTrials){
        document.getElementById('trial').style.display = 'none';
        document.getElementById('completed').style.display = 'block';
    }
    else {
        // increase trial number
        ++trial.number;
        trialStart();
    }
}

function recordData(){
    // record what the subject did in json format
    trialData.push({
        trialNumber:    trial.number,
        trialTime:      trial.totalTime,
        startTime:      trial.startTime,
        endTime:        trial.endTime
    });
}

function experimentDone(){
    submitExternal(client);
    if(!expt.initFullscreen){
        closeFullscreen();
    }
}



// Miscellaneous helper functions //

// (function() {
//   window.onresize = displayWindowSize;
//   //window.onload = displayWindowSize;

//   function displayWindowSize() {
//     let myWidth = window.innerWidth;
//     let myHeight = window.innerHeight;
//     // your size calculation code here
//     console.log(myWidth + " x " + myHeight)
//   };


// })();

function checkWindowDimensionsDynamic() {
    function displayWindowSize() {
        let dynWidth = $(window).width();
        let dynHeight = $(window).height();
        $("#windowText").html("Screen is " + dynWidth + " x " + dynHeight);
    };
    
    window.onresize = displayWindowSize;
    window.onload = displayWindowSize();
    
}


function checkWindowDimensions(minWidthPercent, minHeightPercent){ //dynamically check if dimensions are larger than specified percentages of max screen
    // minWidth: percent of width converted to magnitude
    // for my computer full screen is 83% of screen width
    minWidth = minWidthPercent * screen.width;

    // minHeight: percent of height converted to magnitude
    // for my computer full screen is 91% of screen height
    minHeight = minHeightPercent * screen.height;

    if($(window).width() >= minWidth && $(window).height() >= minHeight){
        return true;
    } else{
        warningMessage = ""; // if window size isn't large enough, warn client
        if($(window).width() < minWidth){
            warningMessage = warningMessage + "Please expand your screen width.\n"
        }
        if($(window).height() < minHeight){
            warningMessage = warningMessage + "Please expand your screen height.\n"
        }
        alert(warningMessage);
        return false;
    }
}

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

function hasGetUserMedia() {
    return(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

var data = [];
var chunks = [];
function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  console.log(recorder)
 
  recorder.ondataavailable = event => data.push(event.data);
  
  recorder.start();
  //log(recorder.state + " for " + (lengthInMS/60000) + " minutes...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );
 
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}


function turnOnCamera(){
    if(!hasGetUserMedia()){
        alert('getUserMedia() is not supported by your browser.')
    } else{
        const recordingTimeMS = 2000 //max recording is 1 hr
        var constraints = {video:true, audio:true};
        var preview = document.querySelector('.videostream');
        var recording = document.querySelector('#recording');
        //const downloadButton = document.querySelector('#downloading');
        navigator.mediaDevices.getUserMedia(constraints).
        then(stream => {
            console.log("part1");
            preview.srcObject = stream;
            $('#downloading').attr('href', stream);
            preview.captureStream = preview.captureStream || preview.mozCaptureStream;
            return new Promise(resolve => preview.onplaying = resolve);
        }).
        then(() => {
            startRecording(preview.captureStream(), recordingTimeMS);
            console.log("part2");
        }).
        then(recordedChunks => {
            console.log("part3");
            let recordedBlob = new Blob(recordedChunks, {type: "video/webm"});
            $('#downloading').attr('href', URL.createObjectURL(recordedBlob));
            $('#downloading').download = "RecordedVideo.webm";

            console.log("Successfully recorded " + recordedBlob.size + " bytes of " +
                recordedBlob.type + " media.");
        });
    }
}

function getCameraStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotCameraStream(stream) {
  window.stream = stream; // make stream available to console
  //videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}



function turnOffCamera(stream){
    var preview = document.querySelector('.videostream');
    preview.srcObject.getTracks().forEach(track => track.stop());
}

function clickCamera(){
    if($('#captureButton').attr('value') == 'off'){
        turnOnCamera();
        $('#captureButton').attr('value','on');
        $('#captureButton').html('Turn off camera');
    } else{
        turnOffCamera();
        $('#captureButton').attr('value','off');
        $('#captureButton').html('Turn on camera');
    }
}

function turnOnMicrophone(){

}

function turnOffMicrophone(){

}


function shuffle(array){ //shuffle list of objects
  var tornado = array.slice(0);
  var return_array = [];
  for(var i=0; i<array.length; i++){
    var randomIndex = Math.floor(Math.random()*tornado.length);
    return_array.push(tornado.splice(randomIndex, 1)[0]);
  }
  return return_array;   
}

function debugLog(message) {
    if(expt.debug){
        console.log(message);
    }
}
