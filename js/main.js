(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  // reveal on view
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(el=>{el.style.transitionDelay=(el.dataset.d||0)+'s';io.observe(el)});
  // split hero text into letters
  $$('[data-split]').forEach(el=>{const t=el.textContent;el.textContent='';let d=0;const n=t.replace(/\s/g,'').length;
    t.split('\n').forEach(line=>{const l=document.createElement('span');l.className='ln';
      [...line.trim()].forEach(ch=>{if(ch===' '){l.appendChild(document.createTextNode(' '));return}const s=document.createElement('span');s.className='ch';s.textContent=ch;s.style.animationDelay=(.15+d*.045)+'s';s.style.backgroundPosition=(d++/n*100)+'% 0';l.appendChild(s)});el.appendChild(l)});
    el.setAttribute('aria-label',t.replace(/\n/g,' '))});
  // scroll-linked effects: one cheap update, only when the scroll position changed
  const bar=$('.progress'),tl=$('.tl'),fill=$('.tl .fill'),mqs=$$('.mq');
  let per=[],lastY=-1,vel=0;
  const measure=()=>{per=mqs.map(m=>m.scrollWidth/2||1)};
  function update(){
    const y=window.scrollY;if(y===lastY)return;vel=y-lastY;lastY=y;
    const dh=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform='scaleX('+(dh>0?y/dh:0)+')';
    if(window.SCENE)SCENE.update(dh>0?Math.min(1,Math.max(0,y/dh)):0);
    hud(y,dh);
    if(fill&&tl){const r=tl.getBoundingClientRect();fill.style.height=Math.min(r.height,Math.max(0,innerHeight*.6-r.top))+'px'}
    for(let i=0;i<mqs.length;i++){const o=(y*.35+i*120)%per[i];mqs[i].style.transform='translate3d('+(i%2?-per[i]+o:-o)+'px,0,0)'}
  }
  // altitude HUD (home only): marker follows scroll, label names the current stage
  const stages=[['top','Trailhead'],['about','Base camp'],['projects','Treeline'],['skills','Ridge'],['experience','High camp'],['contact','Summit']];
  let hudEl=null,dot,lab,tops=[];
  if(document.body.dataset.theme==='home'){hudEl=document.createElement('div');hudEl.className='hud';hudEl.setAttribute('aria-hidden','true');
    hudEl.innerHTML='<i></i><b>Trailhead</b>'+stages.map((s,i)=>'<u style="top:'+(i/(stages.length-1)*100)+'%"></u>').join('');document.body.appendChild(hudEl);dot=hudEl.querySelector('i');lab=hudEl.querySelector('b')}
  const measureTops=()=>{tops=stages.map(s=>{const el=document.getElementById(s[0]);return el?el.getBoundingClientRect().top+scrollY:0})};
  let curStage=-1;
  function hud(y,dh){if(!hudEl)return;const p=dh>0?y/dh:0;dot.style.top=(p*100)+'%';lab.style.top=(p*100)+'%';
    let k=0;const mid=y+innerHeight*.45;for(let i=0;i<tops.length;i++)if(mid>=tops[i])k=i;if(y>=dh-4)k=stages.length-1;
    if(k!==curStage){curStage=k;lab.textContent=stages[k][1]}}
  addEventListener('resize',()=>{measure();measureTops();lastY=-1;update()});
  addEventListener('load',()=>{measure();measureTops();lastY=-1;update()});
  measure();measureTops();
  if(!reduce){(function loop(){requestAnimationFrame(loop);update()})()}else{update();addEventListener('scroll',update,{passive:true})}
  // Smooth inertia for mouse wheels: eases toward the target for about a second after the wheel stops.
  // Touch screens, trackpad pinch-zoom and reduced-motion keep native scrolling.
  if(!reduce&&fine){
    const maxY=()=>document.documentElement.scrollHeight-innerHeight;
    let cur=scrollY,target=scrollY,anim=false;
    const clamp=v=>Math.max(0,Math.min(maxY(),v));
    function step(){
      const d=target-cur;
      if(Math.abs(d)<.4){cur=target;window.scrollTo(0,cur);anim=false;return}
      cur+=d*.07;window.scrollTo(0,cur);requestAnimationFrame(step);
    }
    function go(){if(!anim){anim=true;cur=scrollY;requestAnimationFrame(step)}}
    addEventListener('wheel',e=>{
      if(e.ctrlKey||e.defaultPrevented)return;
      if(e.target.closest&&e.target.closest('.demo')&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      e.preventDefault();
      const dy=e.deltaY*(e.deltaMode===1?32:e.deltaMode===2?innerHeight:1);
      if(!anim)target=scrollY;
      target=clamp(target+dy);go();
    },{passive:false});
    // keep in sync when something else moves the page (scrollbar drag, keyboard, find, anchors)
    addEventListener('scroll',()=>{if(!anim){cur=target=scrollY}},{passive:true});
    document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
      const id=a.getAttribute('href').slice(1),el=id?document.getElementById(id):document.body;if(!el)return;
      e.preventDefault();target=clamp(id?el.getBoundingClientRect().top+scrollY:0);go()});
    addEventListener('resize',()=>{target=clamp(target)});
  }
  // magnetic buttons
  if(!reduce&&fine)$$('.btn,.mail').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.18+'px,'+(e.clientY-r.top-r.height/2)*.25+'px)'});b.addEventListener('pointerleave',()=>b.style.transform='')});
  const cp=$('#copy');cp&&cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('contact.prjtchaturvedi@gmail.com');cp.textContent='Copied';setTimeout(()=>cp.textContent='Copy email',1600)}catch(e){}});
  const yr=$('#yr');yr&&(yr.textContent=new Date().getFullYear());
})();
