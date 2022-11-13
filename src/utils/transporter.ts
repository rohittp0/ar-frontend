import { setUpWebGl, fragShaderDiff, fragShaderAdd, updateTexture } from "./webgl";
import * as pako from "pako";
import {HOST, PORT, PROTOCOL, PROTOCOL_WS} from "./env";

class Transporter
{
    private readonly threshold: number;
    private ws! : WebSocket;
    private readonly ready: Promise<void>;

    private readonly video: HTMLVideoElement;
    private subtractCtx = setUpWebGl(document.getElementById("recordCanvas") as HTMLCanvasElement, fragShaderDiff);
    private additionCtx = setUpWebGl(document.getElementById("remoteCanvas") as HTMLCanvasElement, fragShaderAdd);
    private normalCtx = (<HTMLCanvasElement>document.getElementById("previousCanvas")).getContext("2d");


    private doDetection: ((video: HTMLVideoElement) => Promise<string>) | undefined;
    private onResult: ((image: CanvasImageSource | null) => void) | undefined;

    private local = true;
    private frames = 0;

    private checkpoint = { maxGap: 10, time: 0, count: 0 };
    private latencySpan = document.getElementById("latency");

    private BLACK = new Image();

    constructor(threshold: number, video: HTMLVideoElement)
    {
        this.threshold = threshold;
        this.video = video;

        this.ready = new Promise<void>((resolve) => this.video.onplaying = () => resolve());

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;

        fetch(`${PROTOCOL}://${HOST}:${PORT}/port`, {method: "POST"})
            .then(res => res.json())
            .then((json) => `${PROTOCOL_WS}://${HOST}:${json.port}`)
            .then((url) =>
            {
                that.ws = new WebSocket(url);
                that.ws.onopen = () => that.start();
                that.ws.onmessage = ({ data }) => that.onMessage(data);
            });

    }

    private async start()
    {
        await this.ready;

        if(this.doDetection)
            return this.ws.send(await this.doDetection(this.video));

        this.ws.send(await this.getFrame() || "");
    }

    private async onMessage(data: Blob | string)
    {
        this.showLatency();

        if (this.checkpoint.count++ > this.checkpoint.maxGap)
        {
            this.checkpoint.time = performance.now();
            this.checkpoint.count = 0;
        }

        try
        {
            data = pako.inflateRaw(data) as unknown as Blob || data;
        }
        catch(err)
        {}

        console.log(typeof data);

        if(this.onResult && typeof data !== "string")
            this.onResult(await createImageBitmap(data));
        else if(this.onResult)
            this.onResult(null);

        let toSend: string | Blob | null;

        if(this.local && this.doDetection)
            toSend = await this.doDetection(this.video);
        else
            toSend = await this.getFrame();

        if(!toSend) throw new Error("Invalid frame, can't send.");

        this.ws.send(toSend);
    }

    private async getFrame(): Promise<Blob | null>
    {
        let toSend: HTMLCanvasElement;

        if (++this.frames % 90 === 0 && this.normalCtx)
        {
            this.normalCtx.drawImage(this.video, 0, 0, this.video.width, this.video.height);
            updateTexture(this.additionCtx, this.BLACK, 0);
            toSend = this.normalCtx.canvas as HTMLCanvasElement;
        }
        else
        {
            updateTexture(this.subtractCtx, this.additionCtx.canvas, 0);
            updateTexture(this.subtractCtx, this.video, 1);

            toSend = this.subtractCtx.canvas  as HTMLCanvasElement;
        }

        updateTexture(this.additionCtx, this.additionCtx.canvas, 0);
        updateTexture(this.additionCtx, toSend, 1);

        const blob = <Blob>await new Promise<Blob | null>((resolve) => toSend.toBlob((blob) => resolve(blob)));


        return new Blob([(this.frames % 90 === 0 ? "1" : "0"), blob], { type: blob.type });
    }

    private showLatency()
    {
        if (this.checkpoint.count > 0) return;
        if (!this.latencySpan) return;

        const timeDiff = performance.now() - this.checkpoint.time;

        if(timeDiff > this.threshold)
            this.local = !this.local;

        return this.latencySpan.innerText = timeDiff.toFixed();
    }

    setOnResult(onResultHandler: ((image: CanvasImageSource | null) => void) | undefined)
    {
        this.onResult = onResultHandler;
    }

    setDoDetection(doDetection: ((video: HTMLVideoElement) => Promise<string>) | undefined)
    {
        this.doDetection = doDetection;
    }

    stop = () =>
    {
        this.ws.close();

        if(this.video.srcObject && "getTracks" in this.video.srcObject)
            for (const st of this.video.srcObject?.getTracks())
                st.stop();
    }

}

export default Transporter;
