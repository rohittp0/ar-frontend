(()=>{"use strict";var e,t={345:(e,t,o)=>{var n=o(885),r=o(252);function i(e,t){const o=e.getContext("webgl2",{preserveDrawingBuffer:!0});if(!o)throw"Unable to get WebGL context";o.viewport(0,0,o.drawingBufferWidth,o.drawingBufferHeight),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT);const n=o.createShader(o.VERTEX_SHADER),r=o.createShader(o.FRAGMENT_SHADER);if(!n||!r)throw"Unable to create shaders";o.shaderSource(n,"\nattribute vec2 position;\nvarying vec2 texCoords;\n\nvoid main() {\n  texCoords = (position + 1.0) / 2.0;\n  texCoords.y = 1.0 - texCoords.y;\n  gl_Position = vec4(position, 0, 1.0);\n}\n"),o.shaderSource(r,t),o.compileShader(n),o.compileShader(r),console.log("Vertex shader log: "+o.getShaderInfoLog(n)),console.log("Fragment shader log: "+o.getShaderInfoLog(r));const i=o.createProgram();if(!i)throw"Unable to create program";o.attachShader(i,n),o.attachShader(i,r),o.linkProgram(i),o.useProgram(i);const s=new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,1,1,-1]),a=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,a),o.bufferData(o.ARRAY_BUFFER,s,o.STATIC_DRAW);const c=o.getAttribLocation(i,"position");return o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0),o.enableVertexAttribArray(c),o.uniform1i(o.getUniformLocation(i,"textureCurrent"),1),o.uniform1i(o.getUniformLocation(i,"texturePrevious"),0),o}function s(e,t,o){e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,e.createTexture()),e.texImage2D(e.TEXTURE_2D,0,e.RGB,e.RGB,e.UNSIGNED_BYTE,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.drawArrays(e.TRIANGLES,0,6)}const a="localhost";var c=function(e,t,o,n){return new(o||(o=Promise))((function(r,i){function s(e){try{c(n.next(e))}catch(e){i(e)}}function a(e){try{c(n.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?r(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,a)}c((n=n.apply(e,t||[])).next())}))};var h=o(523);const l=document.getElementById("myVideo"),d=document.getElementById("resultCanvas").getContext("2d"),u=document.getElementById("overlayCanvas").getContext("2d"),v=new class{constructor(e,t){this.subtractCtx=i(document.getElementById("recordCanvas"),"\n#define KERNEL_SIZE 3\n#define KERNEL_SIZE_FLOAT 3.0\n#define FRAME_SIZE_INV 0.00390625\n\nprecision highp float;\nvarying vec2 texCoords;\n\nuniform sampler2D textureCurrent;\nuniform sampler2D texturePrevious;\n\nfloat diff(vec3 color1, vec3 color2)\n{\n    return abs(color1.r - color2.r) + abs(color1.g - color2.g) + abs(color1.b - color2.b);\n}\n\nfloat getNeighbourhoodAverage(const sampler2D texture1, const sampler2D texture2)\n{\n    float sum = 0.0;\n    \n    for (int i = -KERNEL_SIZE; i <= KERNEL_SIZE; i++)\n    {\n        for (int j = -KERNEL_SIZE; j <= KERNEL_SIZE; j++)\n        {\n            vec2 offset = vec2(i, j) * vec2(FRAME_SIZE_INV, FRAME_SIZE_INV);\n            \n            vec4 color1 = texture2D(texture1, texCoords + offset);\n            vec4 color2 = texture2D(texture2, texCoords + offset);\n            \n            sum += diff(color1.rgb, color2.rgb) * \n            ((6.0 - abs( float(i) ) + abs( float(j) ) ) / KERNEL_SIZE_FLOAT );\n        }\n    }\n    \n    return sum / (KERNEL_SIZE_FLOAT * KERNEL_SIZE_FLOAT) / 3.0;\n}  \n\nvoid main()\n{\n    vec4 colorPrev = texture2D(texturePrevious, texCoords);\n    vec4 colorCurrent = texture2D(textureCurrent, texCoords);\n\n    if(getNeighbourhoodAverage(texturePrevious, textureCurrent) > 0.2)\n        gl_FragColor = vec4(colorCurrent.r,colorCurrent.g,colorCurrent.b,1.0);\n    else \n        gl_FragColor = vec4(0,0,0,0.0);\n}\n"),this.additionCtx=i(document.getElementById("remoteCanvas"),"\nprecision highp float;\nvarying vec2 texCoords;\n\n\nuniform sampler2D textureCurrent;\nuniform sampler2D texturePrevious;\n\nfloat unclamp(float color1, float color2)\n{\n    if (color1+color2>1.0){\n        return (color2 + color1)-1.0;\n    } else {\n        return color1 + color2;\n    }\n}\nvoid main(){\n    vec4 colorPrev = texture2D(texturePrevious, texCoords);\n    vec4 colorCurrent = texture2D(textureCurrent, texCoords);\n    float red = unclamp(colorCurrent.r, colorPrev.r);\n    float green = unclamp(colorCurrent.g, colorPrev.g);\n    float blue = unclamp(colorCurrent.b, colorPrev.b);\n\n    colorCurrent.rgb = vec3(red, green, blue);\n    gl_FragColor = colorCurrent;\n}\n"),this.normalCtx=document.getElementById("previousCanvas").getContext("2d"),this.noiseCanvas=r.canvas(),this.local=!1,this.frames=0,this.checkpoint={maxGap:10,time:0,count:0},this.latencySpan=document.getElementById("latency"),this.BLACK=new Image,this.connect=e=>c(this,void 0,void 0,(function*(){this.ws=new WebSocket(e),this.ws.onopen=()=>this.start(),this.ws.onmessage=({data:e})=>this.onMessage(e),this.ws.onerror=e=>console.error(e),this.ws.onclose=this.stop})),this.sendFrames=()=>c(this,void 0,void 0,(function*(){let e;if(e=this.local&&this.doDetection?yield this.doDetection(this.video):yield this.getFrame(),!e)throw new Error("Invalid frame, can't send.");this.ws.send(e)})),this.stop=()=>{var e;if(!this.ws)return console.warn("No websocket to close.");if(this.ws.close(),this.video.srcObject&&"getTracks"in this.video.srcObject)for(const t of null===(e=this.video.srcObject)||void 0===e?void 0:e.getTracks())t.stop()},this.threshold=e,this.video=t,this.noiseTexture=this.noiseCanvas.texture(t),this.ready=new Promise((e=>this.video.onplaying=()=>e())),fetch(`http://${a}:8080/port`,{method:"POST"}).then((e=>e.json())).then((e=>`ws://${a}:${e.port}`)).then(this.connect)}start(){return c(this,void 0,void 0,(function*(){if(yield this.ready,this.doDetection)return this.ws.send(yield this.doDetection(this.video));this.ws.send((yield this.getFrame())||"")}))}onMessage(e){return c(this,void 0,void 0,(function*(){this.showLatency(),this.checkpoint.count++>this.checkpoint.maxGap&&(this.checkpoint.time=performance.now(),this.checkpoint.count=0);try{e=n.Hq(e)||e}catch(e){}this.onResult&&"string"!=typeof e?this.onResult(yield createImageBitmap(e)):this.onResult&&this.onResult(null),yield this.sendFrames()}))}deNoise(e){return this.noiseTexture.loadContentsOf(e),this.noiseCanvas.draw(this.noiseTexture).denoise(90).update(),this.noiseCanvas}getFrame(){return c(this,void 0,void 0,(function*(){let e;if(0==++this.frames)this.normalCtx.drawImage(this.video,0,0,this.video.width,this.video.height),this.normalCtx.drawImage(this.deNoise(this.normalCtx.canvas),0,0,this.video.width,this.video.height),s(this.additionCtx,this.BLACK,0),e=this.normalCtx.canvas;else{const t=this.deNoise(this.video);s(this.subtractCtx,this.normalCtx.canvas,0),s(this.subtractCtx,t,1),this.normalCtx.drawImage(t,0,0,this.video.width,this.video.height),e=this.subtractCtx.canvas}s(this.additionCtx,this.additionCtx.canvas,0),s(this.additionCtx,e,1);const t=yield new Promise((t=>e.toBlob((e=>t(e)))));return new Blob([0===this.frames?"1":"0",t],{type:t.type})}))}showLatency(){if(this.checkpoint.count>0)return;if(!this.latencySpan)return;const e=performance.now()-this.checkpoint.time;return this.latencySpan.innerText=e.toFixed()}setOnResult(e){this.onResult=e}setDoDetection(e){this.doDetection=e}}(20,l),f=new h.Hands({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${e}`});f.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.5,minTrackingConfidence:.5}),f.initialize().then(),v.setDoDetection((e=>{return t=void 0,o=void 0,r=function*(){let t;for(;!((null==t?void 0:t.length)>0);)f.send({image:e}).catch((e=>console.error(e))),t=yield new Promise((e=>f.onResults((({multiHandLandmarks:t})=>e(t)))));return JSON.stringify(t[0])},new((n=void 0)||(n=Promise))((function(e,i){function s(e){try{c(r.next(e))}catch(e){i(e)}}function a(e){try{c(r.throw(e))}catch(e){i(e)}}function c(t){var o;t.done?e(t.value):(o=t.value,o instanceof n?o:new n((function(e){e(o)}))).then(s,a)}c((r=r.apply(t,o||[])).next())}));var t,o,n,r})),v.setOnResult((e=>{d&&u&&(d&&e&&(d.clearRect(0,0,d.canvas.width,d.canvas.height),d.drawImage(e,0,0,l.width,l.height)),u.drawImage(l,0,0,l.width,l.height),u&&e&&u.drawImage(e,0,0,l.width,l.height))})),document.getElementById("stop").addEventListener("click",v.stop),navigator.mediaDevices.getUserMedia({video:!0}).then((e=>l.srcObject=e))}},o={};function n(e){var r=o[e];if(void 0!==r)return r.exports;var i=o[e]={exports:{}};return t[e].call(i.exports,i,i.exports,n),i.exports}n.m=t,e=[],n.O=(t,o,r,i)=>{if(!o){var s=1/0;for(l=0;l<e.length;l++){for(var[o,r,i]=e[l],a=!0,c=0;c<o.length;c++)(!1&i||s>=i)&&Object.keys(n.O).every((e=>n.O[e](o[c])))?o.splice(c--,1):(a=!1,i<s&&(s=i));if(a){e.splice(l--,1);var h=r();void 0!==h&&(t=h)}}return t}i=i||0;for(var l=e.length;l>0&&e[l-1][2]>i;l--)e[l]=e[l-1];e[l]=[o,r,i]},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={826:0};n.O.j=t=>0===e[t];var t=(t,o)=>{var r,i,[s,a,c]=o,h=0;if(s.some((t=>0!==e[t]))){for(r in a)n.o(a,r)&&(n.m[r]=a[r]);if(c)var l=c(n)}for(t&&t(o);h<s.length;h++)i=s[h],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(l)},o=self.webpackChunktemplate=self.webpackChunktemplate||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})();var r=n.O(void 0,[540],(()=>n(345)));r=n.O(r)})();