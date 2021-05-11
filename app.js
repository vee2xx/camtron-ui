'use strict';
const electron = require('electron');
const dialog = electron.remote.dialog;
const menu = electron.remote.Menu;
const fs = require('fs');
const websocket = require('websocket-stream')
const isMac = process.platform === 'darwin'
const bootstrap = require('bootstrap')

let photoData;
let video;
let recordButton;
let isRecording = false;
var ws = null;
var connected = false;

let mediaRecorder; 
const recordedChunks = [];

var cameras = [];
var videoContainer = 'webm'
var videoCodecs = 'vp9'
var currentCameraDeviceId;
var webcamSelect;


function initialize () {
  video = window.document.querySelector('video');
  recordButton = window.document.querySelector('#takePhoto')
  webcamSelect = window.document.querySelector('#webcams')

  navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      cameras = devices.filter(device => device.kind == 'videoinput')
      if (cameras.length > 0) {
        //Create and append the options
        for (var i = 0; i < cameras.length; i++) {
            var option = document.createElement("option");
            option.value = cameras[i].deviceId;
            option.text = cameras[i].label;
            webcamSelect.appendChild(option);
        }
      } else {
        alert("No webcam found. Check to make sure one is connected.")
      }
      addMenu();
    })
    .catch(function(err) {
      console.log(err.name +
         ": " + err.message);
    });
}

function addMenu() {

  var template = []

  var fileMenu = {label: 'File', submenu: [isMac ? { role: 'close' } : { role: 'quit' }]}

  template.push(fileMenu)

  var viewSubMenu = [{role: 'toggleDevTools'}]
  if (cameras.length > 0) {
    var camMenuItems = []
    cameras.forEach(function(cam) {
      camMenuItems.push({label: cam.label,
        click() {  
          currentCameraDeviceId = cam.deviceId;
          connectToCamera();
        } 
      })
    });
  }

  var viewMenu ={label: 'View', submenu: viewSubMenu}

  template.push(viewMenu)

  var camMenu = menu.buildFromTemplate(template); 
  menu.setApplicationMenu(camMenu); 
}

function connectToCamera() {
  let errorCallback = (error) => {
    alert("Error accessing camera. Check to see if it is connected and access permissions have been granted")
  };

  if (mediaRecorder != null && mediaRecorder.state == 'recording') {
    mediaRecorder.stop();
  }
  var deviceId = webcamSelect.value;
  window.document.querySelector('.card').style.display = "none";
  window.navigator.webkitGetUserMedia({video: true, deviceId: { exact: currentCameraDeviceId }}, (localMediaStream) => {
    log("INFO", "Connecting to webcam...")
    video.src = window.URL.createObjectURL(localMediaStream);
    var videoMimeType = `video/${videoContainer}; codecs=${videoCodecs}`
    console.log(videoMimeType)
    const options = { mimeType: videoMimeType };
    mediaRecorder = new MediaRecorder(localMediaStream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.onerror = handleError;

    initializeStream({"Container" : videoContainer, "Codec": videoCodecs})

    wsopen();
  }, errorCallback);
}

function shutdown() {
  mediaRecorder.stop()
  wsclose();
}

function wsopen() {
  ws = new WebSocket('ws://localhost:8080/streamVideo');
  ws.onmessage = onMessage;
  ws.onerror = onError;
  ws.onopen = onOpen;
  ws.onclose = onClose;
}

var onOpen = function(event) {
  connected = true;
  mediaRecorder.start(100);
}

var onClose = function(event) {
  connected = false;
}

var onMessage = function(event) {
  var data = event.data;
};

var onError = function(event) {
  log('ERROR', event.err )
};

function wsclose() {
  if (ws) {
      log('INFO', 'CLOSING ...');
      ws.close();
  }
  log('INFO', 'CLOSED: ');
  ws = null;
}

async function checkConnection(callback) {
  if (!connected) {
    wsopen();
    while (!connected) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  if (callback != null){
    callback();
  }  
}

function takePhotoAndSend() {
  let canvas = window.document.querySelector('canvas');
  canvas.getContext('2d').drawImage(video, 0, 0, 800, 600);
  photoData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
  fetch("http://localhost:8080/upload", {
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(photoData),
    "method": "POST"
  });
}

function handleDataAvailable(e) {
  checkConnection(function(){
    ws.send(e.data);
  });
}

function handleError(e) {
  log('ERROR', e.data)
}

async function handleStop(e) {
  fetch("http://localhost:8080/endStreaming");
}

async function log(logLevel, message) {
  try {
    let logMessage = {logLevel: logLevel, message: message}
    fetch("http://localhost:8080/log", {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(logMessage),
      "method": "POST"
    });
  }
  catch(err) {
    alert("Unable to connect to server. " + err)
  }
}

function initializeStream(videoMetadata) {
  console.log("Sending init")
  try {
    fetch("http://localhost:8080/initializeStream", {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(videoMetadata),
      "method": "POST"
    });
  }
  catch(err) {
  }
}

window.onload = initialize;
window.onclose = shutdown;
