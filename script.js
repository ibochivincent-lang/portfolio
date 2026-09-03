(function(){
var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
var saved=localStorage.getItem('portfolio-theme');
if(saved==='light')document.documentElement.setAttribute('data-theme','light');
else if(saved==='dark')document.documentElement.setAttribute('data-theme','dark');
else if(prefersDark)document.documentElement.setAttribute('data-theme','dark');

var toggle=document.getElementById('theme-toggle');
if(toggle)toggle.addEventListener('click',function(){
var c=document.documentElement.getAttribute('data-theme');
if(c==='light'){document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('portfolio-theme','dark')}
else{document.documentElement.setAttribute('data-theme','light');localStorage.setItem('portfolio-theme','light')}
});

var menuToggle=document.getElementById('menuToggle');
var navLinks=document.querySelector('.nav-links');
if(menuToggle&&navLinks){
menuToggle.addEventListener('click',function(){
navLinks.classList.toggle('open');
var s=menuToggle.querySelectorAll('span');
if(navLinks.classList.contains('open')){
s[0].style.transform='rotate(45deg) translate(4px,4px)';s[1].style.opacity='0';s[2].style.transform='rotate(-45deg) translate(4px,-4px)';
}else{
s[0].style.transform='none';s[1].style.opacity='1';s[2].style.transform='none';
}
});
document.querySelectorAll('.nav-link').forEach(function(l){l.addEventListener('click',function(){
navLinks.classList.remove('open');
var s=menuToggle.querySelectorAll('span');
s[0].style.transform='none';s[1].style.opacity='1';s[2].style.transform='none';
})});
}

var navbar=document.getElementById('navbar');
window.addEventListener('scroll',function(){
if(navbar)navbar.classList.toggle('scrolled',window.scrollY>50);
var bar=document.querySelector('.scroll-progress-bar');
var pct=document.getElementById('scrollPercentValue');
if(bar||pct){
var h=document.documentElement.scrollHeight-window.innerHeight;
var p=h>0?(window.scrollY/h*100):0;
if(bar)bar.style.width=p+'%';
if(pct)pct.textContent=Math.round(p)+'%';
}
});

var observer=new IntersectionObserver(function(entries){
entries.forEach(function(e){if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)'}});
},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});

document.querySelectorAll('.t-content,.skill-group,.exp-card,.edu-card,.project-card,.goal-tag').forEach(function(el){
el.style.opacity='0';el.style.transform='translateY(30px)';el.style.transition='opacity 0.6s ease, transform 0.6s ease';
observer.observe(el);
});

document.getElementById('contactForm').addEventListener('submit',function(e){
e.preventDefault();
var btn=this.querySelector('.btn');
btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...';btn.disabled=true;
setTimeout(function(){
btn.innerHTML='<span class="btn-text">Message Sent!</span> <i class="fas fa-check"></i>';btn.style.background='#00e5a0';
this.reset();
setTimeout(function(){
btn.innerHTML='<span class="btn-text">Send Message</span> <i class="fas fa-paper-plane"></i>';btn.style.background='';btn.disabled=false;
},3000);
}.bind(this),1500);
});

var cursor=document.querySelector('.cursor');
var glow=document.querySelector('.cursor-glow');
var mx=0,my=0,fx=0,fy=0;
document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});
function animCursor(){fx+=(mx-fx)*0.12;fy+=(my-fy)*0.12;
if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px'}
if(glow){glow.style.left=fx+'px';glow.style.top=fy+'px'}
requestAnimationFrame(animCursor);
}
if(!window.matchMedia('(pointer: coarse)').matches){
cursor.style.display='block';glow.style.display='block';animCursor();
document.addEventListener('mouseout',function(){cursor.style.opacity='0';glow.style.opacity='0'});
document.addEventListener('mouseover',function(){cursor.style.opacity='1';glow.style.opacity='1'});
}

var canvas=document.getElementById('heroCanvas');
if(canvas){
var ctx=canvas.getContext('2d');
var w,h,particles=[];
function resize(){w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight}
resize();window.addEventListener('resize',resize);

function Particle(){this.reset();}
Particle.prototype.reset=function(){
this.x=Math.random()*w;this.y=Math.random()*h;
this.vx=(Math.random()-0.5)*0.4;this.vy=(Math.random()-0.5)*0.4;
this.r=Math.random()*2+0.5;this.a=Math.random()*0.4+0.1;
};
Particle.prototype.update=function(){
this.x+=this.vx;this.y+=this.vy;
if(this.x<0||this.x>w)this.vx*=-1;
if(this.y<0||this.y>h)this.vy*=-1;
};
Particle.prototype.draw=function(){
ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
ctx.fillStyle='rgba(217,122,52,'+this.a+')';ctx.fill();
};
for(var i=0;i<60;i++)particles.push(new Particle());

function connectParticles(){
for(var i=0;i<particles.length;i++){
for(var j=i+1;j<particles.length;j++){
var dx=particles[i].x-particles[j].x;
var dy=particles[i].y-particles[j].y;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist<120){
ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);
ctx.lineTo(particles[j].x,particles[j].y);
ctx.strokeStyle='rgba(217,122,52,'+(0.06*(1-dist/120))+')';
ctx.lineWidth=0.5;ctx.stroke();
}
}
}
}

function drawLinesToMouse(){
var mx2=mx,my2=my;
for(var i=0;i<particles.length;i++){
var dx=particles[i].x-mx2;var dy=particles[i].y-my2;
var dist=Math.sqrt(dx*dx+dy*dy);
if(dist<150){
ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);
ctx.lineTo(mx2,my2);
ctx.strokeStyle='rgba(217,122,52,'+(0.08*(1-dist/150))+')';
ctx.lineWidth=0.5;ctx.stroke();
}
}
}

function animate(){
ctx.clearRect(0,0,w,h);
particles.forEach(function(p){p.update();p.draw()});
connectParticles();drawLinesToMouse();
requestAnimationFrame(animate);
}
animate();
}

function apply3DTilt(el,strength){
if(!el)return;
strength=strength||10;
el.style.transformStyle='preserve-3d';
el.addEventListener('mousemove',function(e){
var rect=el.getBoundingClientRect();
var x=(e.clientX-rect.left)/rect.width-0.5;
var y=(e.clientY-rect.top)/rect.height-0.5;
var rotateX=y*-strength;
var rotateY=x*strength;
el.style.transform='perspective(900px) rotateX('+rotateX+'deg) rotateY('+rotateY+'deg) translateZ(4px)';
});
el.addEventListener('mouseleave',function(){
el.style.transform='perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
});
}
apply3DTilt(document.querySelector('.tilt-card-inner'),12);
if(!window.matchMedia('(pointer: coarse)').matches){
document.querySelectorAll('.project-card,.exp-card,.edu-card,.design-card,.skill-group').forEach(function(el){
apply3DTilt(el,6);
});
}

var viewToggle=document.getElementById('viewToggle');
var workGrid=document.getElementById('workGrid');
if(viewToggle&&workGrid){
viewToggle.addEventListener('click',function(e){
var btn=e.target.closest('.view-btn');
if(!btn)return;
viewToggle.querySelectorAll('.view-btn').forEach(function(b){b.classList.remove('active')});
btn.classList.add('active');
workGrid.classList.toggle('list-view',btn.dataset.view==='list');
});
}

var typedEl=document.querySelector('.typing-text');
if(typedEl){
var phrases=['Open to opportunities','Building the future','Full-stack explorer','Looking for PPA'];
var idx=0,ci=0,current='';var typing=true;var wait=false;
function type(){
if(wait)return;
if(typing){
current=phrases[idx].substring(0,ci+1);typedEl.textContent=current;ci++;
if(ci===phrases[idx].length){typing=false;wait=true;setTimeout(function(){wait=false;idx=(idx+1)%phrases.length;typing=true},2000)}
}else{
current=phrases[idx].substring(0,ci-1);typedEl.textContent=current;ci--;
if(ci===0){typing=true;idx=(idx+1)%phrases.length}
}
}
setInterval(type,80);
}
})();