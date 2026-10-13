/* Animated canvas backgrounds. One theme per page via <body data-theme>. */
(function(){
  const cv=document.getElementById('bg'); if(!cv) return;
  const ctx=cv.getContext('2d',{alpha:false});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=innerWidth<820;
  const DPR=Math.min(devicePixelRatio||1,mobile?1.25:1.5);
  const S=window.SCROLL={y:0,prog:0,vel:0,mx:.5,my:.5};
  let W=0,H=0,last=0,theme=null,running=true;
  const themeName=document.body.dataset.theme||'home';
  const PAL={
    home:['#c8f542','#f3efdc','#6ee7a8'],ragkit:['#c8f542','#f3efdc','#7dd3c0'],
    kalesh:['#ff8a3d','#ffc247','#c8f542'],triage:['#5eead4','#c8f542','#ffb347'],
    pulse:['#ffc247','#c8f542','#f3efdc'],pca:['#5eead4','#c8f542','#ffc247']};
  const pal=PAL[themeName]||PAL.home;
  const root=document.documentElement.style;
  root.setProperty('--accent',pal[0]);root.setProperty('--accent2',pal[1]);root.setProperty('--c',pal[2]);
  function resize(){W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0a1f16';ctx.fillRect(0,0,W,H);theme&&theme.init&&theme.init();}
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`};
  const T={};
  /* HOME: flow field with trails; field twists with scroll */
  T.home=(function(){let P=[];
    return {init(){const n=mobile?220:520;P=Array.from({length:n},()=>({x:rnd(0,W),y:rnd(0,H),c:Math.random()*3|0}))},
    frame(t,dt){ctx.fillStyle='rgba(10,31,22,.085)';ctx.fillRect(0,0,W,H);
      const tw=S.prog*Math.PI*6, k=.0017;
      ctx.lineWidth=1.2;
      for(const p of P){
        const a=Math.sin(p.x*k+t*.00012+tw)*2+Math.cos(p.y*k*1.3-t*.0001-tw*.7)*2;
        const sp=1+Math.min(Math.abs(S.vel)*.08,5);
        const nx=p.x+Math.cos(a)*sp*1.6, ny=p.y+Math.sin(a)*sp*1.6+S.vel*.15;
        ctx.strokeStyle=hexA(pal[p.c],.42);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(nx,ny);ctx.stroke();
        p.x=nx;p.y=ny;
        if(p.x<-5||p.x>W+5||p.y<-5||p.y>H+5||Math.random()<.002){p.x=rnd(0,W);p.y=rnd(0,H)}
      }}}})();
  /* RAGKIT: words/chunks drift, retrieval links light up near a query point that scroll moves */
  T.ragkit=(function(){let P=[];const words=['chunk','BM25','TF-IDF','RRF','query','rank','index','cite','top-k','token','score','hybrid','retrieve','source'];
    return {init(){P=Array.from({length:mobile?34:70},()=>({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.25,.25),vy:rnd(-.25,.25),w:words[Math.random()*words.length|0],c:Math.random()*3|0,s:rnd(10,17)}))},
    frame(t){ctx.fillStyle='rgba(10,31,22,.22)';ctx.fillRect(0,0,W,H);
      const qx=W*(.2+.6*((S.prog*1.7)%1)),qy=H*(.3+.4*Math.sin(S.prog*9+t*.0003));
      for(const p of P){p.x+=p.vx+S.vel*.01;p.y+=p.vy-S.vel*.12*(p.s/14);
        if(p.x<-60)p.x=W+40;if(p.x>W+60)p.x=-40;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;}
      ctx.font='12px ui-monospace,Menlo,monospace';
      const ranked=P.map(p=>[Math.hypot(p.x-qx,p.y-qy),p]).sort((a,b)=>a[0]-b[0]);
      ranked.forEach(([d,p],i)=>{
        const top=i<6;
        if(top){ctx.strokeStyle=hexA(pal[1],.5-i*.05);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(p.x,p.y);ctx.stroke();}
        ctx.fillStyle=top?hexA(pal[1],.95):hexA(pal[p.c],.38);ctx.font=(top?'bold ':'')+p.s+'px ui-monospace,Menlo,monospace';ctx.fillText(p.w,p.x,p.y);
        if(top){ctx.fillStyle=hexA(pal[1],.8);ctx.font='10px ui-monospace,monospace';ctx.fillText('#'+(i+1),p.x,p.y-p.s)}});
      ctx.strokeStyle=hexA(pal[0],.8);ctx.lineWidth=2;ctx.beginPath();ctx.arc(qx,qy,10+4*Math.sin(t*.005),0,7);ctx.stroke();
      ctx.fillStyle=hexA(pal[0],.9);ctx.font='bold 12px ui-monospace,monospace';ctx.fillText('query',qx+16,qy+4);}}})();
  /* KALESH: embers rising, bubbles, glitch bars */
  T.kalesh=(function(){let E=[],B=[];
    return {init(){E=Array.from({length:mobile?70:160},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(1,3.2),v:rnd(.3,1.4),c:Math.random()*3|0,ph:rnd(0,6)}));
      B=Array.from({length:mobile?5:9},()=>({x:rnd(0,W),y:rnd(0,H),w:rnd(90,200),h:rnd(36,60),v:rnd(.15,.5),c:Math.random()*2|0}))},
    frame(t){ctx.fillStyle='rgba(10,31,22,.28)';ctx.fillRect(0,0,W,H);
      for(const e of E){e.y-=e.v+Math.max(0,-S.vel)*.06+Math.abs(S.vel)*.04;e.x+=Math.sin(t*.001+e.ph)*.5;if(e.y<-5){e.y=H+5;e.x=rnd(0,W)}
        ctx.fillStyle=hexA(pal[e.c],.8);ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();}
      ctx.lineWidth=1.5;for(const b of B){b.y-=b.v+Math.abs(S.vel)*.05;if(b.y<-80){b.y=H+80;b.x=rnd(0,W)}
        ctx.strokeStyle=hexA(pal[b.c],.3);ctx.beginPath();ctx.roundRect?ctx.roundRect(b.x,b.y,b.w,b.h,16):ctx.rect(b.x,b.y,b.w,b.h);ctx.stroke();
        ctx.fillStyle=hexA(pal[b.c],.22);for(let i=0;i<2;i++)ctx.fillRect(b.x+14,b.y+14+i*12,(b.w-28)*(i?.6:1),4);}
      if(Math.abs(S.vel)>14||Math.random()<.02){ctx.fillStyle=hexA(pal[2],.12);ctx.fillRect(0,rnd(0,H),W,rnd(2,14));}}}})();
  /* TRIAGE: radar sweep with severity blips */
  T.triage=(function(){let bl=[];const sev=['#34d399','#fbbf24','#fb923c','#fb7185'];
    return {init(){bl=[]},
    frame(t){ctx.fillStyle='rgba(10,31,22,.2)';ctx.fillRect(0,0,W,H);
      const cx=W*.5,cy=H*.52,R=Math.hypot(W,H)*.55,ang=(t*.0007+S.prog*Math.PI*8)%(Math.PI*2);
      ctx.strokeStyle=hexA(pal[0],.14);ctx.lineWidth=1;for(let i=1;i<=6;i++){ctx.beginPath();ctx.arc(cx,cy,R*i/6*.8,0,7);ctx.stroke()}
      ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
      const g=ctx.createConicGradient?ctx.createConicGradient(ang-1.1,cx,cy):null;
      if(g){g.addColorStop(0,hexA(pal[0],0));g.addColorStop(.17,hexA(pal[0],.3));g.addColorStop(.175,hexA(pal[0],0));g.addColorStop(1,hexA(pal[0],0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();}
      ctx.strokeStyle=hexA(pal[0],.8);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);ctx.stroke();
      if(Math.random()<.06+Math.abs(S.vel)*.004&&bl.length<40){const a=rnd(0,6.28),r=rnd(.1,.75)*R*.8;bl.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,life:1,c:Math.random()*4|0,s:rnd(3,7)})}
      bl=bl.filter(b=>(b.life-=.006)>0);for(const b of bl){ctx.fillStyle=hexA(sev[b.c],b.life*.9);ctx.beginPath();ctx.arc(b.x,b.y,b.s*(1+(1-b.life)*2),0,7);ctx.fill();}}}})();
  /* PULSE: ECG line + expanding pulse rings + drifting feed cards */
  T.pulse=(function(){let rings=[],cards=[],trace=[];
    return {init(){rings=[];trace=[];cards=Array.from({length:mobile?6:12},()=>({x:rnd(0,W),y:rnd(0,H),w:rnd(110,200),h:rnd(60,120),v:rnd(.2,.6),c:Math.random()*3|0}))},
    frame(t){ctx.fillStyle='rgba(10,31,22,.25)';ctx.fillRect(0,0,W,H);
      for(const c of cards){c.y-=c.v+Math.abs(S.vel)*.05;if(c.y<-150){c.y=H+100;c.x=rnd(0,W)}ctx.strokeStyle=hexA(pal[c.c],.28);ctx.lineWidth=1.3;ctx.strokeRect(c.x,c.y,c.w,c.h);ctx.fillStyle=hexA(pal[c.c],.12);ctx.fillRect(c.x,c.y,c.w,c.h*.45);}
      if(Math.random()<.025+Math.abs(S.vel)*.002)rings.push({x:rnd(0,W),y:rnd(0,H),r:0,c:Math.random()*3|0});
      rings=rings.filter(r=>(r.r+=2.2)<320);for(const r of rings){ctx.strokeStyle=hexA(pal[r.c],(1-r.r/320)*.6);ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.stroke()}
      const beat=(t*.0013)%1;trace.push(beat<.1?Math.sin(beat*60)*(H*.09)*(beat<.05?1:-.6):Math.sin(t*.01)*2);if(trace.length>W/3)trace.shift();
      ctx.strokeStyle=hexA(pal[1],.9);ctx.lineWidth=2;ctx.beginPath();trace.forEach((v,i)=>{const x=i*3,y=H*.5-v+Math.sin(S.prog*12)*H*.15;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();}}})();
  /* PCA: conversation bubbles drifting up + seven metric bars that rise and fall */
  T.pca=(function(){let B=[];const names=['sentiment','empathy','clarity','relevance','accuracy','complete','resp. time'];
    return {init(){B=Array.from({length:mobile?9:16},()=>({x:rnd(0,W),y:rnd(0,H),w:rnd(90,190),h:rnd(26,44),v:rnd(.25,.7),user:Math.random()<.5}))},
    frame(t){ctx.fillStyle='rgba(10,31,22,.24)';ctx.fillRect(0,0,W,H);
      for(const b of B){b.y-=b.v+Math.abs(S.vel)*.05;if(b.y<-60){b.y=H+50;b.x=rnd(0,W);b.user=Math.random()<.5}
        const c=b.user?pal[1]:pal[0];ctx.strokeStyle=hexA(c,.32);ctx.lineWidth=1.3;ctx.beginPath();ctx.roundRect?ctx.roundRect(b.x,b.y,b.w,b.h,12):ctx.rect(b.x,b.y,b.w,b.h);ctx.stroke();
        ctx.fillStyle=hexA(c,.2);ctx.fillRect(b.x+10,b.y+10,b.w*.6,3);ctx.fillRect(b.x+10,b.y+18,b.w*.4,3);}
      const bw=mobile?14:26,gap=mobile?10:22,tot=7*(bw+gap),x0=W-tot-(mobile?8:60),base=H-(mobile?60:90);
      ctx.font='10px ui-monospace,monospace';
      for(let i=0;i<7;i++){const v=.25+.75*(.5+.5*Math.sin(t*.0011+i*1.3+S.prog*10)),h=v*H*.28,x=x0+i*(bw+gap);
        ctx.fillStyle=hexA(pal[i%3],.35);ctx.fillRect(x,base-h,bw,h);ctx.fillStyle=hexA(pal[i%3],.9);ctx.fillRect(x,base-h,bw,2);
        if(!mobile){ctx.save();ctx.translate(x+bw/2+3,base+8);ctx.rotate(.9);ctx.fillStyle=hexA(pal[i%3],.55);ctx.fillText(names[i],0,0);ctx.restore();}}}}})();
  theme=T[themeName]||T.home;
  resize();addEventListener('resize',()=>{clearTimeout(resize._t);resize._t=setTimeout(resize,150)});
  document.addEventListener('visibilitychange',()=>{running=!document.hidden;if(running){last=0;requestAnimationFrame(loop)}});
  addEventListener('pointermove',e=>{S.mx=e.clientX/innerWidth;S.my=e.clientY/innerHeight},{passive:true});
  let lastY=scrollY;
  function loop(t){if(!running)return;requestAnimationFrame(loop);
    if(t-last<(mobile?33:16)) return; last=t;
    const y=scrollY,dh=document.documentElement.scrollHeight-innerHeight;
    S.vel+=((y-lastY)-S.vel)*.2;lastY=y;S.y=y;S.prog=dh>0?y/dh:0;
    theme.frame(t);}
  if(reduce){theme.frame(1000);theme.frame(2000)}else requestAnimationFrame(loop);
})();
