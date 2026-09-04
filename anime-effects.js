(function(){
if(!window.anime)return;
var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- 0. Page entrance: preloader count-in, then staggered hero reveal ---- */
(function(){
var pre=document.getElementById('preloader');
if(!pre)return;
var pct=document.getElementById('preloaderPct');
var bar=pre.querySelector('.preloader-bar span');
var heroEls=document.querySelectorAll('.hero-eyebrow-stack,.hero-label,.hero-title,.hero-tagline,.hero-quote,.hero-description,.hero-stats,.hero-cta');
var heroVisual=document.querySelector('.hero-visual');
var navEls=document.querySelectorAll('.nav-logo,.nav-wordmark,.nav-link,.theme-toggle');

function reveal(){
document.body.style.overflow='';
anime.animate(pre,{opacity:[1,0],duration:600,ease:'outQuad',
onComplete:function(){pre.style.display='none'}});
anime.animate(heroEls,{opacity:[0,1],translateY:[28,0],duration:750,delay:anime.stagger(90),ease:'outExpo'});
anime.animate(navEls,{opacity:[0,1],translateY:[-14,0],duration:600,delay:anime.stagger(45),ease:'outExpo'});
if(heroVisual)anime.animate(heroVisual,{opacity:[0,1],translateY:[40,0],scale:[0.94,1],duration:900,delay:250,ease:'outExpo'});
}

if(reduceMotion){pre.style.display='none';return}

/* Start at the top so the intro actually plays over the hero,
   instead of the browser restoring a mid-page scroll position */
if('scrollRestoration' in history)history.scrollRestoration='manual';
window.scrollTo(0,0);

/* Hidden state set from JS so a no-JS visitor still sees everything */
heroEls.forEach(function(el){el.style.opacity='0'});
navEls.forEach(function(el){el.style.opacity='0'});
if(heroVisual)heroVisual.style.opacity='0';
document.body.style.overflow='hidden';

var counter={v:0};
anime.animate(counter,{
v:100,duration:1500,ease:'inOutQuad',
onUpdate:function(){
var n=Math.round(counter.v);
if(pct)pct.textContent=n+'%';
if(bar)bar.style.width=n+'%';
},
onComplete:reveal
});
})();

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
function tick(){
t+=0.02;
lines[0].setAttribute('points',setPoints(t,amp));
lines[1].setAttribute('points',setPoints(t+1.4,amp*0.7));
lines[2].setAttribute('points',setPoints(t+2.6,amp*0.4));
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();

/* ---- 2. Hero orbit loop dot (svg.createMotionPath, Loop-style) ---- */
(function(){
var dot=document.getElementById('orbitDot');
if(!dot||reduceMotion)return;
var path=anime.createMotionPath('#orbitPath');
if(!path)return;
anime.animate(dot,{
translateX:path.translateX,translateY:path.translateY,
duration:14000,loop:true,ease:'linear'
});
})();

/* ---- 3. Journey path draw-in + traveling icon (merges CodePenScrollMap, AnimatePath, RunningTractor) ---- */
(function(){
var timelineEl=document.getElementById('journeyTimeline');
var pathEl=document.getElementById('journeyPath');
var traveler=document.getElementById('journeyTraveler');
if(!timelineEl||!pathEl||!traveler)return;
var drawable=anime.createDrawable(pathEl);
anime.animate(drawable,{
draw:['0 0','0 1'],ease:'linear',
autoplay:anime.onScroll({target:timelineEl,enter:'70% top',leave:'60% bottom',sync:true})
});
anime.animate(traveler,{
top:['0%','100%'],ease:'linear',
autoplay:anime.onScroll({target:timelineEl,enter:'70% top',leave:'60% bottom',sync:true})
});
timelineEl.querySelectorAll('.t-dot').forEach(function(d){
anime.onScroll({
target:d,enter:'65% top',
onEnter:function(){anime.animate(d,{scale:[1,1.25,1],duration:500,ease:'outQuad'})},
onEnterBack:function(){anime.animate(d,{scale:[1,1.25,1],duration:500,ease:'outQuad'})}
});
});
})();

/* ---- 4. Nav underline draw-on-hover (random variant, svg.createDrawable) ---- */
(function(){
var variants=[
'M2,6 Q15,1 30,6 T58,5',
'M2,4 Q20,9 30,4 T58,7',
'M2,7 L15,3 L30,8 L45,2 L58,6'
];
document.querySelectorAll('.nav-link').forEach(function(link){
var svg=link.querySelector('.underline-draw');
var pathEl=svg&&svg.querySelector('path');
if(!pathEl)return;
pathEl.setAttribute('d',variants[0]);
var drawable=anime.createDrawable(pathEl);
link.addEventListener('mouseenter',function(){
pathEl.setAttribute('d',variants[Math.floor(Math.random()*variants.length)]);
anime.animate(drawable,{draw:['0 0','0 1'],duration:450,ease:'outQuad'});
});
link.addEventListener('mouseleave',function(){
anime.animate(drawable,{draw:'0 0',duration:300,ease:'inQuad'});
});
});
})();

/* ---- 5. Cursor preview following pointer on nav hover (ImageHoverEffect-style, text-based) ---- */
(function(){
var preview=document.getElementById('cursorPreview');
if(!preview||window.matchMedia('(pointer: coarse)').matches)return;
var label=preview.querySelector('span');
var move=anime.createAnimatable(preview,{x:300,y:300,ease:'out(3)'});
document.addEventListener('mousemove',function(e){move.x(e.clientX);move.y(e.clientY)});
document.querySelectorAll('.nav-link[data-preview]').forEach(function(link){
link.addEventListener('mouseenter',function(){
label.textContent=link.dataset.preview;
preview.classList.add('visible');
});
link.addEventListener('mouseleave',function(){preview.classList.remove('visible')});
});
})();

/* ---- 6. Design Work title draw-in on scroll (ScrollTrigger Clamp + SVG Draw) ---- */
(function(){
var drawPath=document.getElementById('designTitleDraw');
var header=drawPath&&drawPath.closest('.section-header');
if(!drawPath||!header)return;
var drawable=anime.createDrawable(drawPath);
anime.animate(drawable,{
draw:['0 0','0 1'],ease:'linear',
autoplay:anime.onScroll({target:header,enter:'65% top',leave:'30% top',sync:true})
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
var played=false;
anime.onScroll({
target:slider,enter:'75% top',
onEnter:function(){
if(played)return;
played=true;
anime.animate(slider,{
'--compare-pos':['0%','100%'],duration:1400,ease:'inOutQuad',
onComplete:function(){anime.animate(slider,{'--compare-pos':'50%',duration:800,ease:'inOutQuad'})}
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
anime.animate(cards,{
scale:[0.6,1],opacity:[0,1],duration:600,delay:anime.stagger(80),ease:'outBack',
autoplay:anime.onScroll({target:anchor,enter:'85% top'})
});
})();

/* ---- 9. Design Work Carousel + Drag view modes (3D Carousel, Infinite Draggable Gallery) ---- */
(function(){
var grid=document.getElementById('workGrid');
if(!grid||!anime.createDraggable)return;
var carouselRotation=0,dragInstance=null;

function teardown(){
grid.querySelectorAll('.design-card').forEach(function(c){c.style.transform=''});
grid.onwheel=null;
grid.onpointerdown=null;
if(dragInstance){dragInstance.revert();dragInstance=null}
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
dragInstance=anime.createDraggable(grid,{
container:grid.parentElement,
y:false,
releaseStiffness:60,
releaseDamping:20
});
}

grid.addEventListener('viewchange',function(e){
teardown();
grid.style.transform='';
if(e.detail.view==='carousel')setupCarousel();
else if(e.detail.view==='drag')setupDrag();
requestAnimationFrame(function(){
document.querySelectorAll('.confetti-dot').length; /* no-op layout settle tick */
});
});
})();

/* ---- 10. Confetti burst on contact form submit (manual ballistic approximation) ---- */
(function(){
var form=document.getElementById('contactForm');
if(!form)return;
var colors=['#441A03','#B5651D','#E8B84B','#ffffff'];
form.addEventListener('submit',function(){
var btn=form.querySelector('.btn');
var rect=btn.getBoundingClientRect();
var originX=rect.left+rect.width/2,originY=rect.top+rect.height/2;
var count=Math.round(anime.utils.random(18,28));
for(var i=0;i<count;i++){
var dot=document.createElement('div');
dot.className='confetti-dot';
dot.style.background=colors[Math.floor(Math.random()*colors.length)];
dot.style.left=originX+'px';
dot.style.top=originY+'px';
document.body.appendChild(dot);
var angle=anime.utils.random(-120,-60)*Math.PI/180;
var dist=anime.utils.random(120,260);
var dx=Math.cos(angle)*dist;
var dy=Math.sin(angle)*dist+anime.utils.random(80,160);
(function(dot,dx,dy){
anime.animate(dot,{
translateX:{to:dx,ease:'outQuad'},
translateY:{to:dy,ease:'inQuad'},
scale:[0,anime.utils.random(0.5,1.4)],
opacity:[1,0],
duration:1200,
onComplete:function(){dot.remove()}
});
})(dot,dx,dy);
}
});
})();

/* ---- 11. Paper plane scroll flourish (Airplanes substitute) ---- */
(function(){
var plane=document.getElementById('paperPlane');
var trail=document.getElementById('planeTrailPath');
var header=plane&&plane.closest('.section-header');
if(!plane||!trail||!header)return;
var drawable=anime.createDrawable(trail);
var motion=anime.createMotionPath('#planeTrailPath');
if(!motion)return;
anime.animate(drawable,{
draw:['0 0','0 1'],ease:'linear',
autoplay:anime.onScroll({target:header,enter:'75% top',leave:'25% top',sync:true})
});
anime.animate(plane,{
translateX:motion.translateX,translateY:motion.translateY,rotate:motion.rotate,ease:'linear',
autoplay:anime.onScroll({target:header,enter:'75% top',leave:'25% top',sync:true})
});
})();

/* ---- 12. Hero background parallax (Simple Parallax Sections) ---- */
(function(){
var layer=document.querySelector('.hero-bg-layer');
if(!layer||reduceMotion)return;
anime.animate(layer,{
translateY:['0%','25%'],ease:'linear',
autoplay:anime.onScroll({target:'.hero',enter:'top top',leave:'top bottom'})
});
})();
})();
