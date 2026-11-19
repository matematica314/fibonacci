const $=id=>document.getElementById(id), world=$('world'), sky=$('sky'), layer=$('items');
const TAU=2*Math.PI, wrap=n=>((n%1)+1)%1, clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
let yaw=.5,pitch=.58,textureRoom=0,textureRevision=0,gl=location.protocol==='file:'?null:sky.getContext('webgl',{alpha:false}),program,texture;
function initializeSky(){
 if(!gl)return;
 function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 p;void main(){p=a;gl_Position=vec4(a,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision highp float;varying vec2 p;uniform sampler2D tex;uniform vec4 cam;void main(){vec3 r=normalize(vec3(p.x*cam.z,p.y*cam.w,1.));float c=cos(cam.y),s=sin(cam.y);float y=c*r.y+s*r.z;float z=c*r.z-s*r.y;vec2 uv=vec2(fract(cam.x+atan(r.x,z)/6.28318531),0.5-asin(clamp(y,-1.,1.))/3.14159265);gl_FragColor=texture2D(tex,uv);}'));
 gl.linkProgram(program);gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);let a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of ['TEXTURE_WRAP_S','TEXTURE_WRAP_T'])gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.CLAMP_TO_EDGE);for(const p of ['TEXTURE_MAG_FILTER','TEXTURE_MIN_FILTER'])gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.LINEAR);
}
try{initializeSky()}catch{gl=null}
function loadSky(room){textureRoom=room;let rev=++textureRevision;let img=new Image();img.onload=()=>{if(rev!==textureRevision)return;if(gl){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);sky.style.opacity=1}draw()};img.src='f'+room+'.jpg';world.style.backgroundImage='url('+img.src+')';sky.style.opacity=0}
let viewScale = 1;
function metrics(){let w=world.clientWidth,h=world.clientHeight,f=Math.max(w*.38,h*.59)*viewScale;return {w,h,f}}
const maxElevation=70;
const pitchMin=.5-maxElevation/180, pitchMax=.5+maxElevation/180;
function flatView(){
 const {w,h}=metrics();
 // Zoom towards the poles just enough to keep the entire viewport on the panorama.
 const k=Math.max(w*1.7*viewScale,h*2.6*viewScale,h/Math.min(pitch,1-pitch));
 return {k,center:pitch};
}
function screenAt(u,v){const {w,h,f}=metrics();if(!gl){let {k,center}=flatView();return {x:w/2+(wrap(u-yaw+.5)-.5)*k,y:h/2+(v-center)*k/2,scale:k,visible:true}}
 const a=(u-yaw)*TAU,b=(.5-v)*Math.PI,c=(.5-pitch)*Math.PI,x=Math.sin(a)*Math.cos(b),y=Math.sin(b),z=Math.cos(a)*Math.cos(b),depth=y*Math.sin(c)+z*Math.cos(c);
 return {x:w/2+f*x/depth,y:h/2-f*(y*Math.cos(c)-z*Math.sin(c))/depth,scale:f*TAU*Math.cos(b)/Math.max(.25,depth),visible:depth>.18}}
function pointAt(x,y){const {w,h,f}=metrics();if(!gl){let {k,center}=flatView();return [wrap(yaw+(x-w/2)/k),clamp(center+(y-h/2)*2/k,.03,.97)]}
 const c=(.5-pitch)*Math.PI,dx=(x-w/2)/f,dy=(h/2-y)/f,len=Math.hypot(1,dx,dy);return [wrap(yaw+Math.atan2(dx,Math.cos(c)-dy*Math.sin(c))/TAU),clamp(.5-Math.asin((dy*Math.cos(c)+Math.sin(c))/len)/Math.PI,.03,.97)]}
function draw(){const {w,h,f}=metrics();if(!w)return;
 if(gl){let d=Math.min(devicePixelRatio||1,1.5);if(sky.width!==Math.round(w*d)||sky.height!==Math.round(h*d)){sky.width=Math.round(w*d);sky.height=Math.round(h*d);gl.viewport(0,0,sky.width,sky.height)}gl.uniform4f(gl.getUniformLocation(program,'cam'),yaw,(.5-pitch)*Math.PI,w/(2*f),h/(2*f));gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
 else{let {k,center}=flatView();world.style.backgroundSize=k+'px '+k/2+'px';world.style.backgroundPosition=(w/2-yaw*k)+'px '+(h/2-center*k/2)+'px'}
 for(const el of layer.children){let p=screenAt(+el.dataset.u,+el.dataset.v);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.width=clamp(p.scale*(+el.dataset.size),el.classList.contains('prop')?28:36,w*.66)+'px';el.style.visibility=p.visible?'visible':'hidden'}
}
function look(u,v){yaw=wrap(u);pitch=clamp(v,pitchMin,pitchMax);draw()}
let gesture=null;
world.onpointerdown=e=>{if(e.button!==0||gesture)return;let el=e.target.closest('button');if(el&&!el.classList.contains('draggable'))return;e.preventDefault();world.setPointerCapture(e.pointerId);gesture={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch,el,start:el&&[+el.dataset.u,+el.dataset.v],offset:pointAt(e.clientX,e.clientY),moved:false}};
world.onpointermove=e=>{let g=gesture;if(!g||g.id!==e.pointerId)return;let dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.hypot(dx,dy)>5)g.moved=true;if(!g.moved)return;if(!g.el){look(g.yaw-dx/(metrics().f*TAU),g.pitch-dy/(metrics().f*Math.PI));return}let p=pointAt(e.clientX,e.clientY);g.el.dataset.u=wrap(g.start[0]+p[0]-g.offset[0]);g.el.dataset.v=clamp(g.start[1]+p[1]-g.offset[1],.03,.97);draw()};
function finishGesture(e){const g=gesture;if(!g||e.pointerId!==g.id)return;gesture=null;if(g.el){if(!g.moved&&e.type!=='pointercancel')tapMove(g.el);else commitMove(g.el)}}
world.onpointerup=world.onpointercancel=finishGesture;
$('left').onclick=()=>look(yaw-.09,pitch);$('right').onclick=()=>look(yaw+.09,pitch);
onresize=draw;
onkeydown=e=>{if($('game').hidden||$('modal').open||e.target.matches('input,select,textarea'))return;let v={ArrowLeft:[-.035,0],ArrowRight:[.035,0],ArrowUp:[0,-.03],ArrowDown:[0,.03]}[e.key];if(v){e.preventDefault();look(yaw+v[0],pitch+v[1])}};

// A single control switches between the original and slightly wider field of view.
const zoomControls = document.querySelector('#game .foot .controls');
if (zoomControls) {
  const zoomButton = document.createElement('button');
  zoomButton.type = 'button';
  zoomButton.textContent = '−';
  zoomButton.title = 'Allontana leggermente la vista';
  zoomButton.setAttribute('aria-label', zoomButton.title);
  zoomButton.style.minWidth = '2.3em';
  zoomButton.addEventListener('click', () => {
    const wider = viewScale === 1;
    viewScale = wider ? 0.88 : 1;
    zoomButton.textContent = wider ? '+' : '−';
    zoomButton.title = wider ? 'Ripristina la vista iniziale' : 'Allontana leggermente la vista';
    zoomButton.setAttribute('aria-label', zoomButton.title);
    draw();
  });
  zoomControls.append(zoomButton);
}
