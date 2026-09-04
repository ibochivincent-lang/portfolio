/* Journey + Experience — horizontal "route map" scroll, powered by GSAP.
   The section pins, the track travels left→right as you scroll, a dotted
   trail connects the stops, and a gold progress trail traces the route
   behind you. Falls back to a plain vertical stack under 900px. */
(function(){
if(!window.gsap||!window.ScrollTrigger)return;
gsap.registerPlugin(ScrollTrigger);
/* Mobile browsers fire resize when the URL bar hides; refreshing a pinned
   section mid-scroll there can corrupt its measurements. */
ScrollTrigger.config({ignoreMobileResize:true});

var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isNarrow=function(){return window.matchMedia('(max-width: 900px)').matches};

function buildTrail(trackId,progressId){
var track=document.getElementById(trackId);
if(!track)return;
var section=track.closest('section');
var scroller=track.parentElement;
var progress=document.getElementById(progressId);
var stops=track.querySelectorAll('.trail-stop');
if(!stops.length)return;

/* The gold trail is revealed left→right by growing its clip rect,
   which keeps the dotted pattern intact (a dash-offset reveal would
   just make the dots march along instead). */
var clipRect=null;
var svg=track.querySelector('.trail-svg');
var viewW=1;
if(progress&&svg){
var clipId=(progress.getAttribute('clip-path')||'').replace('url(#','').replace(')','');
if(clipId)clipRect=svg.querySelector('#'+clipId+' rect');
var vb=(svg.getAttribute('viewBox')||'0 0 1 1').split(/\s+/);
viewW=parseFloat(vb[2])||1;
}

var ctx=gsap.matchMedia();

ctx.add('(min-width: 901px)',function(){
if(reduceMotion)return;
var distance=function(){return Math.max(0,track.scrollWidth-scroller.clientWidth)};

var tween=gsap.to(track,{
x:function(){return -distance()},
ease:'none',
scrollTrigger:{
trigger:section,
start:'top top',
end:function(){return '+='+distance()},
pin:true,
scrub:0.8,
anticipatePin:1,
invalidateOnRefresh:true,
onUpdate:function(self){
/* Grow the clip rect so the gold trail fills in behind you */
if(clipRect)clipRect.setAttribute('width',(viewW*self.progress).toFixed(1));
}
}
});

/* Each stop pops in as it reaches the middle of the screen */
stops.forEach(function(stop){
var marker=stop.querySelector('.trail-marker');
var card=stop.querySelector('.trail-card');
gsap.from([marker,card],{
opacity:0,y:34,scale:0.9,duration:0.55,stagger:0.08,ease:'back.out(1.6)',
scrollTrigger:{
trigger:stop,
containerAnimation:tween,
start:'left 85%',
once:true
}
});
});

return function(){
gsap.set(track,{x:0});
if(clipRect)clipRect.setAttribute('width','0');
};
});

/* Narrow screens: no pinning, just reveal each stop on vertical scroll */
ctx.add('(max-width: 900px)',function(){
gsap.set(track,{x:0});
stops.forEach(function(stop){
gsap.from(stop,{
opacity:0,y:30,duration:0.6,ease:'power2.out',
scrollTrigger:{trigger:stop,start:'top 88%',once:true}
});
});
});
}

buildTrail('journeyTrack','journeyTrailProgress');
buildTrail('expTrack','expTrailProgress');

/* Re-measure only while near the top of the page. Refreshing a pinned
   trigger from inside its own pinned range throws its start/end negative. */
function safeRefresh(){
if(window.scrollY<200)ScrollTrigger.refresh();
}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(safeRefresh);
window.addEventListener('load',safeRefresh);
/* The intro locks scrolling and hides the hero, so positions measured before
   it finishes are wrong. Re-measure once the page is actually released. */
window.addEventListener('entrancecomplete',safeRefresh);
})();
