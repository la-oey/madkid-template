var expt = { //add conditions here
    saveURL: 'submit.simple.php',
    saveVideoURL: 'submit.video.php',
    saveImgURL: 'save.image.php'
    totalTrials: 2, //adjust to how many trials you have
    initFullscreen: window.fullscreen,
    debug: false //set to false when ready to run
};

var trial = {
    number: 1, //which trial is this? //1-indexed
    startTime: 0,
    endTime: 0,
    totalTime: 0
}
var client = parseClient();
var trialData = []; //store all data in json format
var vidData = [];


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



function clickContWindow(){
    document.getElementById('window').style.display = 'none';
    document.getElementById('camera').style.display = 'block';
}


function clickContCamera(){
    document.getElementById('camera').style.display = 'none';
    document.getElementById('video').style.display = 'block';
    $('#replay')[0].play();
}

function clickContVideo(){
    document.getElementById('video').style.display = 'none';
    //document.getElementById('microphone').style.display = 'block';
    trialStart();
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
    //function here of experiment
    
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
        trialNumber: trial.number,
        trialTime: trial.totalTime,
        startTime: trial.startTime,
        endTime: trial.endTime
    });
}

function experimentDone(){
    submitExternal(client);
    if(!expt.initFullscreen){
        closeFullscreen();
    }
}











    ////////////////////////////
   //////// Microphone ////////
  ////////////////////////////

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audiotRecorder = null;

function turnOnMicrophone(){
    var constraints = {audio:true};
    var preview = document.querySelector('.videostream');
    var recording = document.querySelector('#recording');
    navigator.mediaDevices.getUserMedia(constraints).
    then(stream => {
        //put something here
    })
}

function turnOffMicrophone(){

}

// function saveAudio(){
//     audioRecorder.exportWAV(doneEncoding);

//     function doneEncoding( blob ) {
//         Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
//         recIndex++;
//     }

// }


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
