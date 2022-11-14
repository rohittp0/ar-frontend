import Transporter from "./utils/transporter";
import {Hands, NormalizedLandmarkListList} from "@mediapipe/hands";

const myVideo = <HTMLVideoElement>document.getElementById("myVideo");
const resultCtx = (<HTMLCanvasElement>document.getElementById("resultCanvas")).getContext("2d");
const overlayCtx = (<HTMLCanvasElement>document.getElementById("overlayCanvas")).getContext("2d");

const transporter = new Transporter(20, myVideo);

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.initialize().then();

transporter.setDoDetection(async (video) =>
{
    let result;

    while(!(result?.length > 0))
    {
        hands.send({image: video}).catch((e) => console.error(e));
        result = await new Promise<NormalizedLandmarkListList | undefined>((resolve) =>
            hands.onResults(({ multiHandLandmarks }) =>
                resolve(multiHandLandmarks)));
    }

    return JSON.stringify(result[0]);
});

transporter.setOnResult((image) =>
{
    if(!resultCtx || !overlayCtx) return;

    if(resultCtx && image)
    {
        resultCtx.clearRect(0, 0, resultCtx.canvas.width, resultCtx.canvas.height);
        resultCtx.drawImage(image, 0, 0, myVideo.width, myVideo.height);
    }

    overlayCtx.drawImage(myVideo, 0, 0, myVideo.width, myVideo.height);

    if(overlayCtx && image)
        overlayCtx.drawImage(image, 0, 0, myVideo.width, myVideo.height);
});

(<HTMLButtonElement>document.getElementById("stop")).addEventListener("click", transporter.stop);
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => myVideo.srcObject = stream);
