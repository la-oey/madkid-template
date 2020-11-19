
function hasGetUserMedia() {
    return(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function recordUntilStop(stream) {
  let recorder = new MediaRecorder(stream);
  let vid_data=[];
 
  recorder.ondataavailable = event => vid_data.push(event.data);
  
  recorder.start();
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  
  return(Promise.all([
    stopped
  ])
  .then(() => vid_data));
}

function recordTimed(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let vid_data=[];
 
  recorder.ondataavailable = event => vid_data.push(event.data);
  
  recorder.start();
  //console.log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(() => {
    recorder.state == "recording" && recorder.stop();
  });
  
  return(Promise.all([
    stopped,
    recorded
  ])
  .then(() => vid_data));
}

function turnOnCamera(){
    if(!hasGetUserMedia()){
        alert('getUserMedia() is not supported by your browser.')
    } else{
        const recordingTimeMS = 5000 //max recording is 20 mins
        var constraints = {video:true, audio:true};
        var preview = document.querySelector('.videostream');
        navigator.mediaDevices.getUserMedia(constraints).
        then(stream => {
            preview.srcObject = stream;
            preview.captureStream = preview.captureStream || preview.mozCaptureStream;
            return new Promise(resolve => preview.onplaying = resolve);
        }).
        then(() => recordTimed(preview.captureStream(), recordingTimeMS)).
        then(recordedChunks => {
            var recordedBlob = new Blob(recordedChunks, {type: "video/webm"});
            vidData = URL.createObjectURL(recordedBlob);
            
            $('#replay').attr('src',vidData);
            $('#downloading').attr({
                'href':vidData,
                'download':client.sid+".webm"
            })
            
            //saves video file as form data
            if(!expt.debug){
                var formdata = new FormData();
                formdata.append('name', client.sid);
                formdata.append('file', recordedBlob);
                writeVidServer(formdata);
            }
        });
    }
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




   ////////////////////////////////////////////////////////////////////////////////////////////////
  //// Functions I need to incorporate into template -- saving still images //////////////////////
 // see https://github.com/la-oey/LyingKids/tree/master/Expt1_web for most updated version/use //
////////////////////////////////////////////////////////////////////////////////////////////////

function setupCam() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    })

    Webcam.attach('#thecamera')
}

function showCam(){
    $('#thecamera').css({
        'display':'block',
        'margin-left':'auto',
        'margin-right':'auto'
    })

    $('#clickclick').css({
        'display':'block',
        'margin-left':'auto',
        'margin-right':'auto'
    })
}

var camLoadWait = null;
function quickCam() {
    if(demographicClient.imageAllowed == "yes"){
        setupCam();
        camLoadWait = setInterval(function(){ //checks if camera is loaded every 500 ms, then takes picture
            if(Webcam.loaded){
                take_snapshot();
            }
        }, 1000);
    }
}

function take_snapshot() {
    Webcam.snap(function(data_uri){
        if(!client.tablet){
            Webcam.reset('#thecamera');
        }
        playerimage.push(data_uri);        
        $('#thecamera').html('<img src="'+data_uri+'"/>');
        if(!expt.debug){
            writeImgServer(data_uri);
        }
    })
    clearInterval(camLoadWait);
}


function writeImgServer(data){
    if(!expt.debug){
        $.ajax({
        type: "POST",
        url: saveInfo.imgURL,
        data: { img: data, 
            name: client.sid,
            experimenter: saveInfo.experimenter,
            experimentName: saveInfo.experimentName},
        }).done(function(o) {
           debugLog('saved'); 
       })
    }
}



