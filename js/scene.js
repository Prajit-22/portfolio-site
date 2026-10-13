/* Mountain backdrop: a tall SVG mountain that the page "climbs". Scroll moves the camera up the mountain.
   Only CSS transforms and opacity change while scrolling. No canvas, no blur. */
(function(){
  const host=document.getElementById('scene');if(!host)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const theme=document.body.dataset.theme||'home';
  const MOODS={
    home:{c:[0,1],sky:[['#f7e7d0','#f3ecdc'],['#eef1e2','#e4ecd9'],['#e4eeee','#eff3ea'],['#fbefd2','#fff8e6']],lit:'#e0e8d4',shade:'#c6d4bd',snow:'#fbf8ef',snowSh:'#dfe7e4',tree:'#adc6a6',tree2:'#98b592',far:'#dbe5d5',far2:'#ccdac9',mist:'rgba(255,255,255,.7)',orb:'#e8b04a',route:'#a6791f',line:'rgba(19,39,28,.16)',stars:0,seed:7},
    ragkit:{c:[.14,.46],sky:[['#e6ece8','#dde7e0'],['#ebf0ea','#e2ebe4']],lit:'#dbe3da',shade:'#c3cfc4',snow:'#f5f7f2',snowSh:'#dbe3e0',tree:'#b0c3b0',tree2:'#9cb19e',far:'#d3dfd7',far2:'#c6d4cb',mist:'rgba(255,255,255,.92)',orb:'#f4f4ec',route:'#4f7a68',line:'rgba(19,39,28,.14)',stars:0,seed:11,mistBoost:1},
    kalesh:{c:[.3,.62],sky:[['#f5d9bd','#f3e4cd'],['#f7d0b0','#f4e2cc']],lit:'#ecdcc4',shade:'#d8c3a6',snow:'#fff3e4',snowSh:'#ecd2c3',tree:'#c5c79c',tree2:'#adb484',far:'#e8d5be',far2:'#ddc5ab',mist:'rgba(255,240,225,.7)',orb:'#d9552b',route:'#a4401c',line:'rgba(80,40,20,.16)',stars:0,seed:23,bigOrb:1},
    triage:{c:[.55,.88],sky:[['#0b2017','#16372a'],['#0e281d','#1b4130']],lit:'#2f5c48',shade:'#183c2c',snow:'#cfe0d6',snowSh:'#86a899',tree:'#22503b',tree2:'#16402e',far:'#1e4837',far2:'#275544',mist:'rgba(160,210,180,.14)',orb:'#eee8c8',route:'#8fe0a8',line:'rgba(220,240,228,.14)',stars:1,seed:31},
    pulse:{c:[.74,1],sky:[['#f8d9c6','#f4e9d8'],['#fbe4c4','#fff4dc']],lit:'#e4ead9',shade:'#c9d9cc',snow:'#fffaf0',snowSh:'#e3e9e7',tree:'#aec6b6',tree2:'#9ab5a5',far:'#dde7dc',far2:'#cfddd4',mist:'rgba(255,255,255,.75)',orb:'#f0a14e',route:'#b0702a',line:'rgba(19,39,28,.15)',stars:0,seed:41},
    pca:{c:[0,.3],sky:[['#e3eee9','#ecf2e6'],['#e8f0e6','#f0f3e7']],lit:'#dfe9d6',shade:'#c8d8c3',snow:'#fbf9f1',snowSh:'#dfe7e4',tree:'#afc8a8',tree2:'#9ab795',far:'#d9e5d6',far2:'#cbdbca',mist:'rgba(255,255,255,.8)',orb:'#fff7e0',route:'#4d7f2a',line:'rgba(19,39,28,.15)',stars:0,seed:53}
  };
  const m=MOODS[theme]||MOODS.home;
  let s=m.seed;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const f=n=>Math.round(n);
  /* ---------- mountain geometry (viewBox 1440 x 3200) ---------- */
  const TIPX=720,TIPY=380,BASE=3200;
  const left=[],right=[];
  for(let y=TIPY;y<=BASE;y+=40){const t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);
    left.push([f(TIPX-half-(rnd()-.5)*34-Math.sin(y*.011)*18*t),y]);
    right.push([f(TIPX+half*.94+(rnd()-.5)*34+Math.sin(y*.009+2)*18*t),y]);}
  const cx=y=>TIPX+30*Math.sin(y*.0035)+70*(y-TIPY)/(BASE-TIPY);
  const P=a=>a.map(p=>p[0]+','+p[1]).join(' ');
  const sil=[[TIPX,TIPY],...right,...left.slice().reverse()];
  const center=[];for(let y=TIPY;y<=BASE;y+=40)center.push([f(cx(y)),y]);
  const litPoly=[[TIPX,TIPY],...center.slice(1),...left.slice().reverse()];
  /* snow cap */
  const snowY=1120,zig=[];
  const edgeAt=(arr,y)=>{for(let i=1;i<arr.length;i++)if(arr[i][1]>=y)return arr[i][0];return arr[arr.length-1][0]};
  const xr=edgeAt(right,snowY),xl=edgeAt(left,snowY);
  for(let x=xr;x>=xl;x-=34)zig.push([f(x),f(snowY+(rnd()*110)-(Math.abs(x-TIPX)<120?60:0))]);
  const snow=[[TIPX,TIPY],...right.filter(p=>p[1]<=snowY),...zig,...left.filter(p=>p[1]<=snowY).reverse()];
  const zigR=zig.filter(p=>p[0]>=cx(snowY));
  const snowSh=[[TIPX,TIPY],...right.filter(p=>p[1]<=snowY),...zigR,[f(cx(snowY)),snowY+40],...center.filter(p=>p[1]<=snowY).reverse().slice(0,-1)];
  /* tree bands (clipped to silhouette) */
  const band=(top,amp,step)=>{const pts=[];for(let x=-40,i=0;x<=1480;x+=step,i++)pts.push([x,f(top+(i%2?-amp:amp*.4)+(rnd()-.5)*amp)]);return [[-40,BASE+40],...pts,[1480,BASE+40]]};
  const trees1=band(1950,34,26),trees2=band(2560,46,32);
  /* facets and ridge lines */
  let facets='';
  for(let i=0;i<16;i++){const y=520+rnd()*2100,side=rnd()<.5?-1:1,t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82),x=TIPX+side*half*(.2+rnd()*.55),w=40+rnd()*110,h=120+rnd()*260;
    facets+=`<polygon points="${f(x)},${f(y)} ${f(x+side*w)},${f(y+h)} ${f(x-side*w*.3)},${f(y+h*.8)}" fill="${rnd()<.5?'rgba(19,39,28,.07)':'rgba(255,255,255,.2)'}"/>`}
  let ridges='';
  for(let k=0;k<6;k++){let x=TIPX,y=TIPY,pts=[[x,y]];const dir=(k-2.5)*.28;
    while(y<2700){y+=90+rnd()*60;x+=dir*(100)+(rnd()-.5)*50;pts.push([f(x),f(y)])}
    ridges+=`<polyline points="${P(pts)}" fill="none" stroke="${m.line}" stroke-width="3" stroke-linejoin="round"/>`}
  /* route + camps */
  const route=[];const N=14;
  for(let k=0;k<=N;k++){const y=3080-k*(2600/N),t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);route.push([f(cx(y)-half*.3+(k%2?half*.45:-half*.12)),f(y)])}
  const tent=(x,y,c)=>`<polygon points="${x-22},${y} ${x},${y-34} ${x+22},${y}" fill="${c}"/><line x1="${x}" y1="${y-34}" x2="${x}" y2="${y}" stroke="rgba(0,0,0,.18)" stroke-width="2"/>`;
  const camps=[[2950],[2350],[1800],[1300]].map(([y])=>{const t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);return tent(f(cx(y)-half*.2),y,m.route)}).join('');
  const flag=`<g class="flag"><line x1="${TIPX}" y1="${TIPY-4}" x2="${TIPX}" y2="${TIPY-92}" stroke="${m.route}" stroke-width="5"/><polygon points="${TIPX},${TIPY-92} ${TIPX+64},${TIPY-70} ${TIPX},${TIPY-48}" fill="${m.route}"/></g>`;
  const hills=`<path d="M-40,3240 L-40,2800 L120,2760 L260,2840 L420,2780 L620,3000 L720,3240Z" fill="${m.tree2}"/><path d="M1480,3240 L1480,2820 L1300,2770 L1160,2850 L1000,2790 L820,3010 L720,3240Z" fill="${m.tree2}"/>`;
  const mountain=`<svg viewBox="0 0 1440 3200" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="sc"><polygon points="${P(sil)}"/></clipPath></defs>
  <polygon points="${P(sil)}" fill="${m.shade}"/>
  <polygon points="${P(litPoly)}" fill="${m.lit}"/>${facets}${ridges}
  <g clip-path="url(#sc)"><polygon points="${P(trees1)}" fill="${m.tree}"/><polygon points="${P(trees2)}" fill="${m.tree2}"/></g>
  <polygon points="${P(snow)}" fill="${m.snow}"/><polygon points="${P(snowSh)}" fill="${m.snowSh}"/>
  ${hills}<polyline points="${P(route)}" fill="none" stroke="${m.route}" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" opacity=".4"/><g opacity=".6">${camps}</g>${flag}</svg>`;
  /* distant ranges (separate, slower layer) */
  let far='';
  const peak=(x,top,w,h,c)=>{let d=`M${f(x-w)},${top+h} `;const n=5;for(let i=0;i<=n;i++){const px=x-w+(2*w)*i/n,py=i===Math.round(n/2)?top:top+h*(.35+rnd()*.35);d+=`L${f(px)},${f(py)} `}return `<path d="${d}L${f(x+w)},${top+h}Z" fill="${c}"/>`};
  [[160,150,240,520],[320,620,200,430],[1260,300,260,560],[1130,820,200,420],[220,1050,230,470],[1300,1230,250,460]].forEach(([x,t,w,h],i)=>{far+=peak(x,t,w,h,i%2?m.far2:m.far)});
  const farSvg=`<svg viewBox="0 0 1440 1500" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">${far}</svg>`;
  /* foreground pines + tents at the start (they fall away as you climb) */
  let pines='';for(let x=-20,i=0;x<1480;x+=34+rnd()*20,i++){const h=70+rnd()*80,w=24+rnd()*12;pines+=`<polygon points="${f(x)},240 ${f(x+w/2)},${f(240-h)} ${f(x+w)},240" fill="${i%3?m.tree2:m.tree}"/>`}
  const fgSvg=`<svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><polygon points="-20,240 -20,200 1460,190 1460,240" fill="${m.tree2}"/>${pines}</svg>`;
  let stars='';if(m.stars){for(let i=0;i<60;i++)stars+=`<circle cx="${f(rnd()*1000)}" cy="${f(rnd()*600)}" r="${(.8+rnd()*1.6).toFixed(1)}" ${i%4===0?'class="tw"':''}/>`}
  const mistN=m.mistBoost?5:3,mists=[2380,1760,1250,820,560].slice(0,mistN).map((y,i)=>`<div class="mist" style="top:${(y/3200*100).toFixed(1)}%;animation-duration:${60+i*17}s;animation-delay:-${i*13}s;background:radial-gradient(ellipse 22% 50% at 25% 50%,${m.mist},transparent),radial-gradient(ellipse 26% 50% at 68% 55%,${m.mist},transparent)"></div>`).join('');
  host.innerHTML=
    m.sky.map((c,i)=>`<div class="sky" style="background:linear-gradient(180deg,${c[0]},${c[1]})"></div>`).join('')+
    (m.stars?`<svg class="stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMin slice" fill="#f3f0dc">${stars}</svg>`:'')+
    `<div class="orb${m.bigOrb?' big':''}" style="background:${m.orb}"></div>`+
    `<div class="far">${farSvg}</div><div class="world"><div class="mt">${mountain}</div>${mists}</div><div class="fg">${fgSvg}</div>`;
  const skyEls=[...host.querySelectorAll('.sky')],orb=host.querySelector('.orb'),flg=host.querySelector('.flag'),far_=host.querySelector('.far'),world=host.querySelector('.world'),fg=host.querySelector('.fg');
  let vh=innerHeight,vw=innerWidth,last=0;
  function apply(p){
    last=p;const c=m.c[0]+(m.c[1]-m.c[0])*p,n=skyEls.length,fpos=c*(n-1);
    world.style.transform='translate3d(0,'+(-(3.2*vh-vh)*(1-c)+c*c*c*vh*(vw<820?.8:.5)).toFixed(1)+'px,0)';
    far_.style.transform='translate3d(0,'+(-(1.5*vh-vh)*(1-c)).toFixed(1)+'px,0)';
    fg.style.transform='translate3d(0,'+(c*vh*1.3).toFixed(1)+'px,0)';
    for(let i=0;i<n;i++)skyEls[i].style.opacity=Math.max(0,1-Math.abs(fpos-i)).toFixed(3);
    if(flg)flg.style.opacity=Math.max(0,Math.min(1,(c-.9)*12)).toFixed(2);
    const ox=vw*(.76-.2*c),oy=vh*(.74-.58*c);
    orb.style.transform='translate3d('+ox.toFixed(0)+'px,'+oy.toFixed(0)+'px,0)';
  }
  window.SCENE={update:apply};
  addEventListener('resize',()=>{vh=innerHeight;vw=innerWidth;apply(last)});
  apply(reduce?.2:0);
})();
