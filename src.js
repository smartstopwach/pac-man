const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const template=[
'#####################',
'#o........#........o#',
'#.###.###.#.###.###.#',
'#.###.###.#.###.###.#',
'#...................#',
'#.###.#.#####.#.###.#',
'#.....#...#...#.....#',
'#####.### # ###.#####',
'    #.#       #.#    ',
'#####.# ## ## #.#####',
'     .  #   #  .     ',
'#####.# ##### #.#####',
'    #.#       #.#    ',
'#####.# ##### #.#####',
'#.........#.........#',
'#.###.###.#.###.###.#',
'#o..#..... .....#..o#',
'###.#.#.#####.#.#.###',
'#.....#...#...#.....#',
'#.#######.#.#######.#',
'#...................#',
'#####################',
'                     '];
const T=24,dirs={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
let board,player,ghosts,score=0,level=1,lives=3,state='ready',power=0,tick=0,last=0,acc=0,sound=false,audio,best=0;
try{best=Number(localStorage.getItem('mazeclub-best'))||0}catch{}
const $=s=>document.querySelector(s);
function hud(){$('#score').textContent=String(score).padStart(5,'0');$('#best').textContent=String(best).padStart(5,'0');$('#level').textContent=String(level).padStart(2,'0');$('#lives').textContent='● '.repeat(lives);$('#pause').innerHTML=state==='paused'?'▶ <span>RESUME</span>':'Ⅱ <span>PAUSE</span>'}
function positions(){player={x:10,y:16,dir:'left',next:'left'};ghosts=[{x:9,y:10,color:'#f1849c',dir:'up'},{x:10,y:10,color:'#8edbd8',dir:'left'},{x:11,y:10,color:'#edac73',dir:'right'},{x:10,y:8,color:'#b0a0eb',dir:'left'}];power=0}
function reset(){score=0;level=1;lives=3;board=template.map(r=>r.split(''));positions();tick=0;hud();draw()}
function overlay(title,copy,label,button){$('#overlay-title').textContent=title;$('#overlay-copy').textContent=copy;$('#overlay-label').textContent=label;$('#start').innerHTML=button+' <span>↗</span>';$('#overlay').classList.remove('hidden')}
function start(){if(state==='over')reset();state='playing';$('#overlay').classList.add('hidden');acc=0;hud()}
function pause(){if(state==='playing'){state='paused';overlay('Take a breather.','The maze will be right here.','GAME PAUSED','KEEP GOING')}else if(state==='paused')start();hud()}
function valid(x,y){return y>=0&&y<22&&(x<0||x>=21||board[y]?.[x]!=='#')}
function move(obj,dir){let d=dirs[dir],x=obj.x+d.x,y=obj.y+d.y;if(!valid(x,y))return false;obj.x=(x+21)%21;obj.y=y;obj.dir=dir;return true}
function beep(freq=520){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.075);o.start();o.stop(audio.currentTime+.08)}catch{}}
function points(n){score+=n;if(score>best){best=score;try{localStorage.setItem('mazeclub-best',best)}catch{}}hud()}
function collision(){for(const g of ghosts){if(g.x===player.x&&g.y===player.y){if(power>0){points(200);g.x=10;g.y=10;beep(850)}else{lives--;beep(100);if(lives===0){state='over';overlay('One more round?','Final score: '+score.toLocaleString()+'. There’s a new best waiting.','THAT WAS A GOOD RUN','PLAY AGAIN')}else{positions();state='paused';overlay('Still in the game.','You have '+lives+' lives left. Make them count.','CAUGHT YOU!','LET’S GO')}hud();return true}}}return false}
function update(){tick++;if(power>0)power--;if(!move(player,player.next))move(player,player.dir);let cell=board[player.y][player.x];if(cell==='.'||cell==='o'){board[player.y][player.x]=' ';points(cell==='o'?50:10);if(cell==='o')power=65;beep(cell==='o'?750:tick%2?420:500)}if(collision())return;
if(tick% (power?3:2)===0){ghosts.forEach((g,i)=>{const reverse={up:'down',down:'up',left:'right',right:'left'};let options=Object.keys(dirs).filter(k=>valid(g.x+dirs[k].x,g.y+dirs[k].y));if(options.length>1)options=options.filter(k=>k!==reverse[g.dir]);let target=i===1?{x:player.x+dirs[player.dir].x*3,y:player.y+dirs[player.dir].y*3}:player;options.sort((a,b)=>{const dist=d=>Math.abs(g.x+dirs[d].x-target.x)+Math.abs(g.y+dirs[d].y-target.y);return power?dist(b)-dist(a):dist(a)-dist(b)});if(options.length)move(g,Math.random()<.22?options[Math.floor(Math.random()*options.length)]:options[0])});collision()}
if(state==='playing'&&!board.some(r=>r.some(c=>c==='.'||c==='o'))){level++;board=template.map(r=>r.split(''));positions();state='paused';overlay('A clean sweep.','Next up: level '+level+'. The chase gets faster.','MAZE COMPLETE','NEXT LEVEL');hud()}}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function draw(){ctx.fillStyle='#0a0b12';ctx.fillRect(0,0,504,552);for(let y=0;y<22;y++)for(let x=0;x<21;x++){let c=board[y][x],px=x*T,py=y*T;if(c==='#'){ctx.fillStyle='#14203d';rounded(px+2,py+2,20,20,5);ctx.strokeStyle='#304e8b';ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(px+3,py+3,18,18,4);ctx.stroke();if(board[y]?.[x+1]==='#'){ctx.fillStyle='#14203d';ctx.fillRect(px+17,py+4,11,16)}if(board[y+1]?.[x]==='#'){ctx.fillStyle='#14203d';ctx.fillRect(px+4,py+17,16,11)}}else if(c==='.'||c==='o'){ctx.fillStyle=c==='o'?'#f9d979':'#c6b68b';ctx.beginPath();ctx.arc(px+12,py+12,c==='o'?5+Math.sin(performance.now()/180)*.8:2,0,Math.PI*2);ctx.fill()}}
const angle={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[player.dir],mouth=.16+Math.abs(Math.sin(performance.now()/95))*.5;ctx.fillStyle='#f8d65a';ctx.beginPath();ctx.moveTo(player.x*T+12,player.y*T+12);ctx.arc(player.x*T+12,player.y*T+12,10,angle+mouth,angle+Math.PI*2-mouth);ctx.closePath();ctx.fill();ghosts.forEach(g=>{const x=g.x*T+3,y=g.y*T+3;ctx.fillStyle=power?(power<15&&tick%2?'#eee':'#516bdb'):g.color;ctx.beginPath();ctx.arc(x+9,y+9,9,Math.PI,0);ctx.lineTo(x+18,y+19);for(let i=18;i>=0;i-=3)ctx.lineTo(x+i,y+((i%6===0)?16:20));ctx.closePath();ctx.fill();ctx.fillStyle='#f8f9ff';ctx.beginPath();ctx.ellipse(x+5,y+8,3.2,4,0,0,7);ctx.ellipse(x+13,y+8,3.2,4,0,0,7);ctx.fill();ctx.fillStyle='#202d54';const d=dirs[g.dir];ctx.beginPath();ctx.arc(x+5+d.x,y+8+d.y,1.7,0,7);ctx.arc(x+13+d.x,y+8+d.y,1.7,0,7);ctx.fill()})}
function frame(time){const dt=Math.min(time-last,100);last=time;if(state==='playing'){acc+=dt;const speed=Math.max(85,145-(level-1)*10);if(acc>=speed){update();acc-=speed}}draw();requestAnimationFrame(frame)}
$('#start').onclick=start;$('#pause').onclick=pause;$('#sound').onclick=()=>{sound=!sound;$('#sound').innerHTML='♪ <span>SOUND '+(sound?'ON':'OFF')+'</span>';if(sound)beep()};
function direction(d){player.next=d;if(state==='ready')start()}
window.addEventListener('keydown',e=>{const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};const d=map[e.key]||map[e.key.toLowerCase()];if(d){e.preventDefault();direction(d)}if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(state==='ready'||state==='over')start();else pause()}if(e.key.toLowerCase()==='r'){reset();start()}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();direction(b.dataset.dir)}));let touch;canvas.addEventListener('touchstart',e=>{touch=e.touches[0];},{passive:true});canvas.addEventListener('touchmove',e=>{if(!touch)return;e.preventDefault();let dx=e.touches[0].clientX-touch.clientX,dy=e.touches[0].clientY-touch.clientY;if(Math.max(Math.abs(dx),Math.abs(dy))>15){direction(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');touch=e.touches[0]}},{passive:false});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});reset();requestAnimationFrame(frame);
