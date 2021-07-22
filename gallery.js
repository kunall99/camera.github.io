let db;
let dbOpenRequest = indexedDB.open("Gallery", 1);

dbOpenRequest.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("Media", { keyPath: "mid" }); // table will only be create when db is create first time
};

dbOpenRequest.onsuccess = function (e) {
  db = e.target.result;
  fetchMedia();
};

dbOpenRequest.onerror = function (e) {
  alert("Inside on error !!");
};

function fetchMedia(){
  let txnObject = db.transaction("Media", "readonly");
  let mediaTable = txnObject.objectStore("Media");
  let cursorObject = mediaTable.openCursor(); // to iterate on all the rows / tuples
  cursorObject.onsuccess = function (e) {
    let cursor = cursorObject.result;
    if (cursor) {
      let mediaObj = cursor.value;
      if (mediaObj.type == "photo") {
        appendPhoto(mediaObj);
      } else {
        appendVideo(mediaObj);
      }
      cursor.continue();
    }
  };
}

function appendPhoto(mediaObj){
    let mediaDiv = document.createElement("div");
    mediaDiv.classList.add("media-div");
    mediaDiv.innerHTML = `<img class="media-img" src="${mediaObj.url}" alt="">
    <div class="media-buttons">
        <div class="download-media">download</div>
        <div class="delete-media">delete</div>
    </div>`;
    mediaDiv.querySelector(".download-media").addEventListener("click", function(){
      downloadMedia(mediaObj);
    });
    mediaDiv.querySelector(".delete-media").addEventListener("click", function(){
      deleteMedia(mediaObj, mediaDiv);
    });
    document.querySelector(".gallery").append(mediaDiv);
}

function appendVideo(mediaObj){
  let mediaDiv = document.createElement("div");
  mediaDiv.classList.add("media-div");
  mediaDiv.innerHTML = `<video class="media-video" controls autoplay loop></video>
  <div class="media-buttons">
      <div class="download-media">download</div>
      <div class="delete-media">delete</div>
  </div>`;
  mediaDiv.querySelector("video").src = URL.createObjectURL(mediaObj.url);
  mediaDiv.querySelector(".download-media").addEventListener("click", function(){
    downloadMedia(mediaObj);
  });
  mediaDiv.querySelector(".delete-media").addEventListener("click", function(){
    deleteMedia(mediaObj, mediaDiv);
  });
  document.querySelector(".gallery").append(mediaDiv);
}

function downloadMedia(mediaObj){
  let aTag = document.createElement("a");
  if(mediaObj.type == "photo"){
    aTag.download = `${mediaObj.mid}.jpg`;          //save file with this name
    aTag.href = mediaObj.url;
  }else{
    aTag.download = `${mediaObj.mid}.mp4`;
    aTag.href = URL.createObjectURL(mediaObj.url);
  }
  aTag.click();
}

function deleteMedia(mediaObj, mediaDiv){
  let mid = mediaObj.mid;
  let txnObject = db.transaction("Media", "readwrite");
  let mediaTable = txnObject.objectStore("Media");
  mediaTable.delete(mid);

  mediaDiv.remove();      //remove from UI
}