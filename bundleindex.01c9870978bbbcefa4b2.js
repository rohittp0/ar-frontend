(()=>{"use strict";var e,t={733:(e,t,n)=>{function o(e,t){const n=e.getContext("webgl2",{preserveDrawingBuffer:!0});if(!n)throw"Unable to get WebGL context";n.viewport(0,0,n.drawingBufferWidth,n.drawingBufferHeight),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT);const o=n.createShader(n.VERTEX_SHADER),r=n.createShader(n.FRAGMENT_SHADER);if(!o||!r)throw"Unable to create shaders";n.shaderSource(o,"\nattribute vec2 position;\nvarying vec2 texCoords;\n\nvoid main() {\n  texCoords = (position + 1.0) / 2.0;\n  texCoords.y = 1.0 - texCoords.y;\n  gl_Position = vec4(position, 0, 1.0);\n}\n"),n.shaderSource(r,t),n.compileShader(o),n.compileShader(r);const i=n.createProgram();if(!i)throw"Unable to create program";n.attachShader(i,o),n.attachShader(i,r),n.linkProgram(i),n.useProgram(i);const a=new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,1,1,-1]),s=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,a,n.STATIC_DRAW);const c=n.getAttribLocation(i,"position");return n.vertexAttribPointer(c,2,n.FLOAT,!1,0,0),n.enableVertexAttribArray(c),n.uniform1i(n.getUniformLocation(i,"textureCurrent"),1),n.uniform1i(n.getUniformLocation(i,"texturePrevious"),0),n}function r(e,t,n){e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,e.createTexture()),e.texImage2D(e.TEXTURE_2D,0,e.RGB,e.RGB,e.UNSIGNED_BYTE,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.drawArrays(e.TRIANGLES,0,6)}var i=n(885);const a="localhost";var s=function(e,t,n,o){return new(n||(n=Promise))((function(r,i){function a(e){try{c(o.next(e))}catch(e){i(e)}}function s(e){try{c(o.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}c((o=o.apply(e,t||[])).next())}))};var c=n(523);const l=document.getElementById("myVideo"),u=document.getElementById("resultCanvas").getContext("2d"),h=document.getElementById("overlayCanvas").getContext("2d"),d=new c.Hands({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${e}`});d.setOptions({maxNumHands:1,minDetectionConfidence:.5,minTrackingConfidence:.5});const v=new class{constructor(e,t){this.subtractCtx=o(document.getElementById("recordCanvas"),"\nprecision highp float;\nvarying vec2 texCoords;\n\nuniform sampler2D textureCurrent;\nuniform sampler2D texturePrevious;\n\nfloat toGrey(vec3 color)\n{\n    return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;\n}\n\nfloat unclamp(float color1, float color2)\n{\n    if (color1<color2){\n        if (color2 - color1 > 0.0){\n            return 1.0 - color2 + color1;\n        } else {\n            return 0.0;\n        }\n    } else {\n        if (color1 - color2 > 0.0){\n            return color1 -  color2;\n        }\n        else {\n            return 0.0;\n        }\n    }\n}\n\nvoid main()\n{\n    vec4 colorPrev = texture2D(texturePrevious, texCoords);\n    vec4 colorCurrent = texture2D(textureCurrent, texCoords);\n\n    if(abs(toGrey(colorPrev.rgb) - toGrey(colorCurrent.rgb)) > 0.1)\n    {    \n        float red = unclamp(colorCurrent.r, colorPrev.r);\n        float green = unclamp(colorCurrent.g, colorPrev.g);\n        float blue = unclamp(colorCurrent.b, colorPrev.b);\n        gl_FragColor = vec4(red,green,blue,1.0);\n    }\n    else \n        gl_FragColor = vec4(0,0,0,1.0);\n}\n"),this.additionCtx=o(document.getElementById("remoteCanvas"),"\nprecision highp float;\nvarying vec2 texCoords;\n\n\nuniform sampler2D textureCurrent;\nuniform sampler2D texturePrevious;\n\nfloat unclamp(float color1, float color2)\n{\n    if (color1+color2>1.0){\n        return (color2 + color1)-1.0;\n    } else {\n        return color1 + color2;\n    }\n}\nvoid main(){\n    vec4 colorPrev = texture2D(texturePrevious, texCoords);\n    vec4 colorCurrent = texture2D(textureCurrent, texCoords);\n    float red = unclamp(colorCurrent.r, colorPrev.r);\n    float green = unclamp(colorCurrent.g, colorPrev.g);\n    float blue = unclamp(colorCurrent.b, colorPrev.b);\n\n    colorCurrent.rgb = vec3(red, green, blue);\n    gl_FragColor = colorCurrent;\n}\n"),this.normalCtx=document.getElementById("previousCanvas").getContext("2d"),this.local=!0,this.frames=0,this.checkpoint={maxGap:10,time:0,count:0},this.latencySpan=document.getElementById("latency"),this.BLACK=new Image,this.stop=()=>{var e;if(this.ws.close(),this.video.srcObject&&"getTracks"in this.video.srcObject)for(const t of null===(e=this.video.srcObject)||void 0===e?void 0:e.getTracks())t.stop()},this.threshold=e,this.video=t,this.ready=new Promise((e=>this.video.onplaying=()=>e()));const n=this;fetch(`http://${a}:8080/port`,{method:"POST"}).then((e=>e.json())).then((e=>`ws://${a}:${e.port}`)).then((e=>{n.ws=new WebSocket(e),n.ws.onopen=()=>n.start(),n.ws.onmessage=({data:e})=>n.onMessage(e)}))}start(){return s(this,void 0,void 0,(function*(){if(yield this.ready,this.doDetection)return this.ws.send(yield this.doDetection(this.video));this.ws.send((yield this.getFrame())||"")}))}onMessage(e){return s(this,void 0,void 0,(function*(){this.showLatency(),this.checkpoint.count++>this.checkpoint.maxGap&&(this.checkpoint.time=performance.now(),this.checkpoint.count=0);try{e=i.Hq(e)||e}catch(e){}let t;if(console.log(typeof e),this.onResult&&"string"!=typeof e?this.onResult(yield createImageBitmap(e)):this.onResult&&this.onResult(null),t=this.local&&this.doDetection?yield this.doDetection(this.video):yield this.getFrame(),!t)throw new Error("Invalid frame, can't send.");this.ws.send(t)}))}getFrame(){return s(this,void 0,void 0,(function*(){let e;++this.frames%90==0&&this.normalCtx?(this.normalCtx.drawImage(this.video,0,0,this.video.width,this.video.height),r(this.additionCtx,this.BLACK,0),e=this.normalCtx.canvas):(r(this.subtractCtx,this.additionCtx.canvas,0),r(this.subtractCtx,this.video,1),e=this.subtractCtx.canvas),r(this.additionCtx,this.additionCtx.canvas,0),r(this.additionCtx,e,1);const t=yield new Promise((t=>e.toBlob((e=>t(e)))));return new Blob([this.frames%90==0?"1":"0",t],{type:t.type})}))}showLatency(){if(this.checkpoint.count>0)return;if(!this.latencySpan)return;const e=performance.now()-this.checkpoint.time;return e>this.threshold&&(this.local=!this.local),this.latencySpan.innerText=e.toFixed()}setOnResult(e){this.onResult=e}setDoDetection(e){this.doDetection=e}}(30,l);v.setDoDetection((e=>{return t=void 0,n=void 0,r=function*(){let t;for(;!t;)d.send({image:e}).then(void 0),t=yield new Promise((e=>d.onResults((({multiHandLandmarks:t})=>e(t)))));return JSON.stringify(t[0])},new((o=void 0)||(o=Promise))((function(e,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(t){var n;t.done?e(t.value):(n=t.value,n instanceof o?n:new o((function(e){e(n)}))).then(a,s)}c((r=r.apply(t,n||[])).next())}));var t,n,o,r})),v.setOnResult((e=>{u&&h&&(u&&e&&(u.clearRect(0,0,u.canvas.width,u.canvas.height),u.drawImage(e,0,0,l.width,l.height)),h.drawImage(l,0,0,l.width,l.height),h&&e&&h.drawImage(e,0,0,l.width,l.height))})),document.getElementById("stop").addEventListener("click",v.stop),navigator.mediaDevices.getUserMedia({video:!0}).then((e=>l.srcObject=e))}},n={};function o(e){var r=n[e];if(void 0!==r)return r.exports;var i=n[e]={exports:{}};return t[e].call(i.exports,i,i.exports,o),i.exports}o.m=t,e=[],o.O=(t,n,r,i)=>{if(!n){var a=1/0;for(u=0;u<e.length;u++){for(var[n,r,i]=e[u],s=!0,c=0;c<n.length;c++)(!1&i||a>=i)&&Object.keys(o.O).every((e=>o.O[e](n[c])))?n.splice(c--,1):(s=!1,i<a&&(a=i));if(s){e.splice(u--,1);var l=r();void 0!==l&&(t=l)}}return t}i=i||0;for(var u=e.length;u>0&&e[u-1][2]>i;u--)e[u]=e[u-1];e[u]=[n,r,i]},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={826:0};o.O.j=t=>0===e[t];var t=(t,n)=>{var r,i,[a,s,c]=n,l=0;if(a.some((t=>0!==e[t]))){for(r in s)o.o(s,r)&&(o.m[r]=s[r]);if(c)var u=c(o)}for(t&&t(n);l<a.length;l++)i=a[l],o.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return o.O(u)},n=self.webpackChunktemplate=self.webpackChunktemplate||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})();var r=o.O(void 0,[499],(()=>o(733)));r=o.O(r)})();