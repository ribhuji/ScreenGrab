const { desktopCapturer, remote, ipcRenderer, shell } = require('electron');
const { writeFile } = require('fs');
const { dialog, Menu } = remote;

const videoElement = document.querySelector('video');
const canvas = document.querySelector('canvas');
const anchor = document.querySelector('a');
const footer = document.querySelector('footer');
const context = canvas.getContext('2d');

let widthOfImage;
let heightOfImage;

const screenshotBtn = document.getElementById('screenshotBtn');
screenshotBtn.disabled = true;

screenshotBtn.onclick = async e => {
  context.drawImage(videoElement, 0, 0, widthOfImage, heightOfImage);
  var data = canvas.toDataURL('image/png');
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save image',
    defaultPath: `img-${Date.now()}.png`
  });
  var save = data.replace(/^data:image\/\w+;base64,/, '');
  if (filePath) {
    writeFile(filePath, save, {encoding: 'base64'}, () => ipcRenderer.send('close-me'));
  }
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: stringShorten(source.name),
        click: () => selectSource(source)
      };
    })
  );
  videoOptionsMenu.popup();
}

function stringShorten(str){
  return str.length > 20 ? str.substring(0, 18) + '...' : str;
}


async function selectSource(source) {

  videoSelectBtn.innerText = stringShorten(source.name);
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // Create a Stream
  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  widthOfImage = stream.getVideoTracks()[0].getSettings().width;
  heightOfImage = stream.getVideoTracks()[0].getSettings().height;
  canvas.width = widthOfImage;
  canvas.height = heightOfImage;
  screenshotBtn.disabled = false;
}

anchor.onclick = async e => {
  let link = 'https://www.ribhuratnam.me'
  shell.openExternal(link);
};

footer.onclick = async e => {
  let link = 'https://www.ribhuratnam.me'
  shell.openExternal(link);
};