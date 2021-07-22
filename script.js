let videoElement = document.querySelector("video");
let recordButton = document.querySelector(".inner-record");
let capturePhoto = document.querySelector(".inner-capture");
let filters = document.querySelectorAll(".filter");
let filterSelected = "none";
let zoomIn = document.querySelector(".zoomIn");
let zoomOut = document.querySelector(".zoomOut");

let galleryBtn = document.querySelector(".gallery-btn");
galleryBtn.addEventListener("click", function(){
    window.location.assign("gallery.html");
});

let minZoom = 1;
let maxZoom = 3.1;
let currentZoom = 1;
let recordingState = false;
let mediaRecorder;

// navigator.mediaDevices.getUserMedia(constraint)       //promisified function
//     .then(function(videoStream){                   //returns videoStream 
//         // console.log(videoStream);
//         videoElement.srcObject = videoStream;
//     })
//     .catch(function(error){
//         console.log(error);
//     });

(async function(){
    let constraint = { video: true};
    let mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
    videoElement.srcObject = mediaStream;
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.onstart = function(){
        console.log("Inside on start");
    };
    mediaRecorder.ondataavailable = function(e){
        console.log("Inside on data available");
        console.log(e.data);
        let videoObject = new Blob([e.data], {type: "video/mp4"});
        console.log(videoObject);
        //videoObject / imageObject => URL
        //<a> tag for downloading using this URL
        // let videoURL = URL.createObjectURL(videoObject);
        // let aTag = document.createElement("a");
        // aTag.download = `Video${Date.now()}.mp4`; 
        // aTag.href = videoURL;
        // aTag.click();

        // add video object to db
        addMedia(videoObject , "video");

    };
    mediaRecorder.onstop = function(){
        console.log("Inside on stop");
    };

    recordButton.addEventListener("click", recordMediaFun);

    capturePhoto.addEventListener("click", capturePhotoFun);
})();

for(let i = 0 ; i < filters.length ; i++){
    filters[i].addEventListener("click", function(e){
        // console.log(e.target.style.backgroundColor);
        let currentFilterSelected = e.target.style.backgroundColor;
        if(currentFilterSelected == ""){
            if(document.querySelector(".filter-div")){
                document.querySelector(".filter-div").remove();
                filterSelected = "none";
                return;
            }
        }
        console.log(currentFilterSelected);
        if(filterSelected == currentFilterSelected)
            return;
        let filterDiv = document.createElement("div");
        filterDiv.classList.add("filter-div");
        filterDiv.style.backgroundColor = currentFilterSelected;

        if(filterSelected == "none"){
            document.body.append(filterDiv);
        }else{
            document.querySelector(".filter-div").remove();
            document.body.append(filterDiv);
        }
        filterSelected = currentFilterSelected;
    });
}

zoomIn.addEventListener("click", function(e){
    if(currentZoom + 0.1 > maxZoom)
        return;
    currentZoom += 0.1;
    videoElement.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", function(e){
    if(currentZoom - 0.1 < minZoom)
        return;
    currentZoom -= 0.1;
    videoElement.style.transform = `scale(${currentZoom})`;    //we can set style by this statement
});

function recordMediaFun(){
    if(recordingState){
        //already going on
        //stop the recording
        mediaRecorder.stop();
        // recordButton.innerHTML = "Record Button";
        recordButton.classList.remove("animate-record");
        recordingState = false;
    }else{
        //start recoding
        mediaRecorder.start();
        // recordButton.innerHTML = "Recording...";
        recordButton.classList.add("animate-record");
        recordingState = true;
    }
}

function capturePhotoFun(){
    capturePhoto.classList.add("animate-capture");

    setTimeout(function(){
        capturePhoto.classList.remove("animate-capture");  // execute this statement after 1 sec
    }, 1000);
    //canvas
    let canvas = document.createElement("canvas");
    canvas.height = videoElement.videoHeight;     // video height  (checked through dom by hovering mouse on UI)
    canvas.width = videoElement.videoWidth;      // video width
    let ctx = canvas.getContext("2d");
    if(currentZoom != 1){
        ctx.translate( canvas.width/2, canvas.height/2);
        ctx.scale(currentZoom, currentZoom);                 //follow file in facts folder
        ctx.translate( -canvas.width/2, -canvas.height/2);
    }
    ctx.drawImage(videoElement, 0, 0);
    //before downloading apply filter on it
    if(filterSelected != "none"){
        ctx.fillStyle = filterSelected;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    //download canvas as an image
    // let aTag = document.createElement("a");
    // aTag.download = `Image${Date.now()}.jpg`;
    // aTag.href = canvas.toDataURL("image/jpg");
    // aTag.click();

    // save image to DB
    let canvasURL = canvas.toDataURL("image.jpg");
    addMedia(canvasURL, "photo");
}

function addMedia(mediaURL, mediaType) {
    //   db me media add hojaega
    let txnObject = db.transaction("Media", "readwrite"); // start transaction on mediaTable
    let mediaTable = txnObject.objectStore("Media"); // this will get access to mediaTable
  
    mediaTable.add({ mid: Date.now(), type: mediaType, url: mediaURL }); // it will add this object in mediaTable or mediaStore
  
    txnObject.onerror = function (e) {
      console.log("txn failed");
      console.log(e);
    };
}