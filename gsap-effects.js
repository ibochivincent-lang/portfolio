(function(){
if(!window.gsap)return;
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, Physics2DPlugin, Observer);
var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- 1. Wavy divider (ambient, ScrollWaves-style) ---- */
(function(){
var lines=document.querySelectorAll('.wave-divider polyline');
if(!lines.length||reduceMotion)return;
var width=1000,freq=3,amp=8,t=0;
function setPoints(phase,amplitude){
var pts=[];
for(var x=0;x<=width;x+=20){
var y=30+Math.sin((x/width)*Math.PI*freq+phase)*amplitude;
pts.push(x+','+y.toFixed(1));
}
return pts.join(' ');
}
gsap.ticker.add(function(){
t+=0.02;
lines[0].setAttribute('points',setPoints(t,amp));
lines[1].setAttribute('points',setPoints(t+1.4,amp*0.7));
lines[2].setAttribute('points',setPoints(t+2.6,amp*0.4));
});
})();

/* ---- 2. Hero orbit loop dot (MotionPathPlugin, Loop-style) ---- */
(function(){
var dot=document.getElementById('orbitDot');
if(!dot||reduceMotion)return;
gsap.to(dot,{
duration:14,repeat:-1,ease:'none',
motionPath:{path:'#orbitPath',align:'#orbitPath',autoRotate:false,alignOrigin:[0.5,0.5]}
});
})();

/* ---- 3. Journey path draw-in + traveling icon (merges CodePenScrollMap, AnimatePath, RunningTractor) ---- */
(function(){
var timeline=document.getElementById('journeyTimeline');
var path=document.getElementById('journeyPath');
var traveler=document.getElementById('journeyTraveler');
if(!timeline||!path||!traveler)return;
gsap.set(path,{drawSVG:'0%'});
var tl=gsap.timeline({
scrollTrigger:{trigger:timeline,start:'top 70%',end:'bottom 60%',scrub:0.6}
});
tl.to(path,{drawSVG:'100%',ease:'none'},0)
.to(traveler,{top:'100%',ease:'none'},0);

var dots=timeline.querySelectorAll('.t-dot');
dots.forEach(function(d){
ScrollTrigger.create({
trigger:d,start:'top 65%',
onEnter:function(){gsap.fromTo(d,{scale:1},{scale:1.25,duration:0.25,yoyo:true,repeat:1,ease:'power2.out'})},
onEnterBack:function(){gsap.fromTo(d,{scale:1},{scale:1.25,duration:0.25,yoyo:true,repeat:1,ease:'power2.out'})}
});
});
})();

/* ---- 4. Nav underline draw-on-hover (random variant, DrawSVGPlugin) ---- */
(function(){
var variants=[
'M2,6 Q15,1 30,6 T58,5',
'M2,4 Q20,9 30,4 T58,7',
'M2,7 L15,3 L30,8 L45,2 L58,6'
];
document.querySelectorAll('.nav-link').forEach(function(link){
var svg=link.querySelector('.underline-draw');
var path=svg&&svg.querySelector('path');
if(!path)return;
link.addEventListener('mouseenter',function(){
var d=variants[Math.floor(Math.random()*variants.length)];
path.setAttribute('d',d);
gsap.killTweensOf(path);
gsap.fromTo(path,{drawSVG:'0%'},{drawSVG:'100%',duration:0.45,ease:'power2.out'});
});
link.addEventListener('mouseleave',function(){
gsap.killTweensOf(path);
gsap.to(path,{drawSVG:'100% 100%',duration:0.3,ease:'power2.in'});
});
});
})();

/* ---- 5. Cursor preview following pointer on nav hover (ImageHoverEffect-style, text-based) ---- */
(function(){
var preview=document.getElementById('cursorPreview');
if(!preview||window.matchMedia('(pointer: coarse)').matches)return;
var label=preview.querySelector('span');
var setX=gsap.quickTo(preview,'x',{duration:0.35,ease:'expo.out'});
var setY=gsap.quickTo(preview,'y',{duration:0.35,ease:'expo.out'});
document.addEventListener('mousemove',function(e){setX(e.clientX);setY(e.clientY)});
document.querySelectorAll('.nav-link[data-preview]').forEach(function(link){
link.addEventListener('mouseenter',function(){
label.textContent=link.dataset.preview;
preview.classList.add('visible');
});
link.addEventListener('mouseleave',function(){preview.classList.remove('visible')});
});
})();

/* ---- 6. Design Work title draw-in, pinned briefly (ScrollTrigger Clamp + SVG Draw) ---- */
(function(){
var draw=document.getElementById('designTitleDraw');
var header=draw&&draw.closest('.section-header');
if(!draw||!header)return;
gsap.set(draw,{drawSVG:'0%'});
gsap.to(draw,{
drawSVG:'100%',ease:'expo.out',
scrollTrigger:{trigger:header,start:'clamp(top 65%)',end:'+=250',pin:false,scrub:0.5}
});
})();

/* ---- 7. Before/after comparison slider (Image Comparison) ---- */
(function(){
var slider=document.getElementById('compareSlider');
if(!slider)return;
var dragging=false;
function setPos(clientX){
var rect=slider.getBoundingClientRect();
var pct=Math.min(100,Math.max(0,((clientX-rect.left)/rect.width)*100));
slider.style.setProperty('--compare-pos',pct+'%');
}
slider.addEventListener('pointerdown',function(e){dragging=true;setPos(e.clientX)});
window.addEventListener('pointermove',function(e){if(dragging)setPos(e.clientX)});
window.addEventListener('pointerup',function(){dragging=false});
ScrollTrigger.create({
trigger:slider,start:'top 75%',once:true,
onEnter:function(){
gsap.fromTo(slider,{'--compare-pos':'0%'},{'--compare-pos':'100%',duration:1.4,ease:'power2.inOut',
onComplete:function(){gsap.to(slider,{'--compare-pos':'50%',duration:0.8,ease:'power2.inOut'})}
});
}
});
})();

/* ---- 8. Design cards zoom-in reveal (Scroll Zoom Gallery) ---- */
(function(){
var cards=document.querySelectorAll('#workGrid .design-card');
var anchor=document.querySelector('.work-toolbar');
if(!cards.length||!anchor)return;
/* Trigger off .work-toolbar (stable, normal-flow) rather than #workGrid itself,
   since switching to carousel/drag view changes the grid's document height. */
gsap.from(cards,{
scale:0.6,opacity:0,duration:0.6,stagger:0.08,ease:'back.out(1.6)',
scrollTrigger:{trigger:anchor,start:'top 85%'}
});
})();

/* ---- 9. Design Work Carousel + Drag view modes (3D Carousel, Infinite Draggable Gallery) ---- */
(function(){
var grid=document.getElementById('workGrid');
if(!grid)return;
var carouselRotation=0,carouselRAF=null;
var dragX=0,dragging=false,startX=0,startDragX=0;

function teardown(){
grid.querySelectorAll('.design-card').forEach(function(c){c.style.transform=''});
if(carouselRAF){cancelAnimationFrame(carouselRAF);carouselRAF=null}
grid.onwheel=null;
grid.onpointerdown=null;
}

function setupCarousel(){
var cards=grid.querySelectorAll('.design-card');
var n=cards.length,radius=260;
function layout(){
cards.forEach(function(card,i){
var angle=(360/n)*i+carouselRotation;
card.style.transform='translate(-50%,-50%) rotateY('+angle+'deg) translateZ('+radius+'px)';
});
}
layout();
grid.onwheel=function(e){
e.preventDefault();
carouselRotation-=e.deltaY*0.15;
layout();
};
var pdX=0,active=false;
grid.onpointerdown=function(e){active=true;pdX=e.clientX};
window.addEventListener('pointermove',function(e){
if(!active||!grid.classList.contains('carousel-view'))return;
carouselRotation+=(e.clientX-pdX)*0.4;
pdX=e.clientX;layout();
});
window.addEventListener('pointerup',function(){active=false});
}

function setupDrag(){
var cards=grid.querySelectorAll('.design-card');
var setX=gsap.quickTo(grid,'x',{duration:0.4,ease:'power3.out'});
grid.onpointerdown=function(e){dragging=true;startX=e.clientX;startDragX=dragX};
window.addEventListener('pointermove',function(e){
if(!dragging||!grid.classList.contains('drag-view'))return;
dragX=startDragX+(e.clientX-startX);
setX(dragX);
});
window.addEventListener('pointerup',function(){dragging=false});
}

grid.addEventListener('viewchange',function(e){
teardown();
gsap.set(grid,{x:0});
dragX=0;
if(e.detail.view==='carousel')setupCarousel();
else if(e.detail.view==='drag')setupDrag();
requestAnimationFrame(function(){ScrollTrigger.refresh()});
});
})();

/* ---- 10. Confetti burst on contact form submit (Physics2DPlugin) ---- */
(function(){
var form=document.getElementById('contactForm');
if(!form)return;
var colors=['#441A03','#B5651D','#E8B84B','#ffffff'];
form.addEventListener('submit',function(){
var btn=form.querySelector('.btn');
var rect=btn.getBoundingClientRect();
var originX=rect.left+rect.width/2,originY=rect.top+rect.height/2;
var count=gsap.utils.random(18,28,1);
for(var i=0;i<count;i++){
var dot=document.createElement('div');
dot.className='confetti-dot';
dot.style.background=colors[Math.floor(Math.random()*colors.length)];
dot.style.left=originX+'px';
dot.style.top=originY+'px';
document.body.appendChild(dot);
(function(dot){
gsap.timeline({onComplete:function(){dot.remove()}})
.fromTo(dot,{scale:0},{scale:gsap.utils.random(0.5,1.4),duration:0.2})
.to(dot,{
physics2D:{velocity:gsap.utils.random(200,420),angle:gsap.utils.random(-120,-60),gravity:800},
duration:1.4,autoAlpha:0,ease:'none'
},'<');
})(dot);
}
});
})();

/* ---- 11. Paper plane scroll flourish (Airplanes substitute) ---- */
(function(){
var plane=document.getElementById('paperPlane');
var trail=document.getElementById('planeTrailPath');
var header=plane&&plane.closest('.section-header');
if(!plane||!trail||!header)return;
gsap.set(trail,{drawSVG:'0%'});
var tl=gsap.timeline({
scrollTrigger:{trigger:header,start:'top 75%',end:'top 25%',scrub:0.6}
});
tl.to(trail,{drawSVG:'100%',ease:'none'},0)
.to(plane,{motionPath:{path:'#planeTrailPath',align:'#planeTrailPath',autoRotate:true,alignOrigin:[0.5,0.5]},ease:'none'},0);
})();

/* ---- 12. Hero background parallax (Simple Parallax Sections) ---- */
(function(){
var layer=document.querySelector('.hero-bg-layer');
if(!layer||reduceMotion)return;
gsap.to(layer,{
yPercent:25,ease:'none',
scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
});
})();

/* Re-measure all ScrollTriggers once fonts/images settle final layout */
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});
window.addEventListener('load',function(){ScrollTrigger.refresh()});
})();
