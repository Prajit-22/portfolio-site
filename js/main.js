(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=(el.dataset.d||0)+'s';io.observe(el)});
  // split hero text
  $$('[data-split]').forEach(el=>{const t=el.textContent;el.textContent='';let d=0;const n=t.replace(/\s/g,'').length;
    t.split('\n').forEach(line=>{const l=document.createElement('span');l.className='ln';
      [...line.trim()].forEach(ch=>{if(ch===' '){l.appendChild(document.createTextNode(' '));return}const s=document.createElement('span');s.className='ch';s.textContent=ch;s.style.animationDelay=(.15+d*.045)+'s';s.style.backgroundPosition=(d++/n*100)+'% 0';l.appendChild(s)});el.appendChild(l)});el.setAttribute('aria-label',t.replace(/\n/g,' '))});
  const bar=$('.progress'),conic=$('.conic'),track=$('.htrack'),pin=$('.hpin'),fill=$('.tl .fill'),tl=$('.tl'),mqs=$$('.mq'),par=$$('[data-par]');
  let lastY=0,vel=0;
  function onScroll(){const y=scrollY,dh=document.documentElement.scrollHeight-innerHeight,p=dh>0?y/dh:0;
    bar&&(bar.style.transform=`scaleX(${p})`);
    conic&&(conic.style.transform=`rotate(${y*.06}deg)`);
    vel+=((y-lastY)-vel)*.15;lastY=y;
    if(track&&pin&&innerWidth>820){const r=pin.getBoundingClientRect(),tot=pin.offsetHeight-innerHeight,pr=Math.min(1,Math.max(0,-r.top/tot)),max=track.scrollWidth-innerWidth+80;track.style.transform=`translate3d(${-pr*max}px,0,0)`}
    if(fill&&tl){const r=tl.getBoundingClientRect(),h=Math.min(r.height,Math.max(0,innerHeight*.6-r.top));fill.style.height=h+'px'}
    mqs.forEach((m,i)=>{const per=m.scrollWidth/2||1,o=(y*.35+i*120)%per,x=i%2?-per+o:-o;m.style.transform=`translate3d(${x}px,0,0) skewX(${Math.max(-12,Math.min(12,vel*-.4))}deg)`});
    par.forEach(el=>{const r=el.getBoundingClientRect();el.style.transform=`translate3d(0,${(r.top-innerHeight/2)*(+el.dataset.par)}px,0)`});
  }
  if(!reduce){let tick=false;addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(()=>{onScroll();tick=false})}},{passive:true});
    (function decay(){requestAnimationFrame(decay);if(Math.abs(vel)>.3){vel*=.9;onScroll()}})()}
  addEventListener('resize',onScroll);onScroll();
  // magnetic buttons
  if(!reduce&&matchMedia('(pointer:fine)').matches)$$('.btn,.mail').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.25}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
  // copy email
  const cp=$('#copy');cp&&cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('contact.prjtchaturvedi@gmail.com');cp.textContent='Copied';setTimeout(()=>cp.textContent='Copy email',1600)}catch(e){}});
  const yr=$('#yr');yr&&(yr.textContent=new Date().getFullYear());
})();
