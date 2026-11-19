const key='tre-tessere-alunni-sessione-v1';
function read(k,fallback){try{return JSON.parse(sessionStorage.getItem(k))||fallback}catch{return fallback}}
function write(k,v){try{sessionStorage.setItem(k,JSON.stringify(v))}catch{notify('Salvataggio locale non disponibile in questo browser.')}}
const fresh=()=>({room:0,ready:false,visited:{},seen:{},help:{},won:{},moves:{},counts:{},answers:{},slots:[],step:false,complete:false});
let state=Object.assign(fresh(),read(key,{})),layout=publishedLayout,room=0,selectedTile=null;
const save=()=>write(key,state),group=r=>objects.filter(o=>o[0]===r),obj=id=>objects.find(o=>o[1]===id),clues=r=>group(r).filter(o=>o[6]),count=r=>clues(r).filter(o=>state.seen[o[1]]).length,all=r=>count(r)===clues(r).length;
const prize={2:'1,',3:'1',4:'6'},guide={2:'Il coniglietto',3:'L’ape',4:'Il giardiniere',5:'Matica'};
function cfg(o){return Object.assign({x:o[3],y:o[4],cx:o[3],cy:o[4],size:o[5]},layout[o[1]])}
// Older saves can prove a visit through an explored clue, a moved object or a collected tile.
for (const r of [2, 4]) {
  if (state.room === r || state.won[r] || group(r).some(o => state.seen[o[1]] || state.moves[o[1]])) {
    state.visited[r] = true;
  }
}
let timeout;function notify(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>$('toast').classList.remove('show'),2800)}
function dialog(title,html){if(title==='Il mio taccuino'&&$('modal').open){let overlay=document.createElement('dialog');overlay.innerHTML='<button class="bookClose" aria-label="Chiudi il taccuino">×</button><h2>Il mio taccuino</h2>'+html;document.body.append(overlay);overlay.querySelector('button').onclick=()=>overlay.close();overlay.onclose=()=>overlay.remove();overlay.showModal();return}$('body').innerHTML='<h2>'+title+'</h2>'+html;if(title!=='Il mio taccuino'&&title!=='Missione compiuta!'){let b=document.createElement('button');b.className='openBook';b.textContent='Apri il taccuino';b.onclick=notebook;$('body').append(b)}if(!$('modal').open)$('modal').showModal();$('modal').scrollTop=0}
function dismiss(){$('modal').close()}
$('close').onclick=dismiss;$('modal').onclick=e=>{if(e.target===$('modal'))dismiss()};
function progressIntro(){if(state.room){return;}if($('film').currentTime>=30&&!state.ready){state.ready=true;save()}$('start').disabled=!state.ready;$('start').classList.toggle('lit',state.ready);$('timer').textContent=state.ready?'Lo studio ti aspetta.':'La missione si apre tra '+Math.ceil(Math.max(0,30-$('film').currentTime))+' s di video.'}
$('film').ontimeupdate=progressIntro;$('start').onclick=()=>enter(1);$('back').onclick=()=>enter(1);
function enter(r){if($('modal').open)dismiss();$('film').pause();$('intro').hidden=true;$('game').hidden=false;room=r;state.room=r;state.visited[r]=true;save();yaw=({1:.5,2:.49,3:.49,4:.5,5:.32})[r];pitch=({1:.59,2:.67,3:.60,4:.66,5:.58})[r];loadSky(r);paint();world.animate([{opacity:.35,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],{duration:480})}
function buttonAt(id,cls,label,u,v,size,html){let b=document.createElement('button');b.className=cls;b.setAttribute('aria-label',label);b.title=label;Object.assign(b.dataset,{id,u,v,size});b.innerHTML=html;layer.append(b);return b}
function paint(){layer.replaceChildren();$('roomName').textContent=rooms[room];$('back').hidden=room===1;$('hint').hidden=room===1;
 for(const o of group(room)){let c=cfg(o),id=o[1],pos=state.moves[id]||[c.x,c.y],uncovered=Math.hypot((wrap(pos[0]-c.cx+.5)-.5)*2*Math.cos((.5-c.cy)*Math.PI),pos[1]-c.cy)>Math.min(.03,c.size*.48);
 if(o[6]&&uncovered&&(room!==1||id==='honey'||state.seen.honey)){let icon=o[8]===2?'<img src="rabbit.png" alt="">':o[8]===3?'<img src="bee.png" alt="">':o[8]===4?'❧':'▤';
 let b=buttonAt(id,'clue'+(state.seen[id]?' read':''),o[6],c.cx,c.cy,.018,icon);b.dataset.kind='clue';b.onclick=()=>{openClue(o)}}
 let b=buttonAt(id,'prop draggable',o[2],pos[0],pos[1],c.size,'<img draggable="false" src="'+id+'.png" alt="">');b.dataset.kind='object';b.onclick=e=>{if(e.detail===0)tapMove(b)};
 }
 if(room>1&&all(room)){const loc={2:[.5,.61],3:[.5,.56],4:[.5,.585],5:[.205,.447]}[room];let b=buttonAt('check','spark',room===4?'Esamina la piantina':'Apri la verifica',...loc,room===4?.053:.027,room===4?'<img src="plant-hidden.svg" alt="">':'✧');b.onclick=()=>quiz(room)}

 $('tiles').hidden=room!==1||!Object.keys(state.won).length;
 if(!$('tiles').hidden){let complete=[2,4,3].every(r=>state.won[r]);$('tiles').innerHTML='<button id="tilecode" '+(complete?'class="ready"':'disabled')+' aria-label="Tessere raccolte. '+(complete?'Entra nell’aula di Matica':'Completa il codice')+'">'+[2,4,3,8].map((r,i)=>'<b class="'+((r===8?complete:state.won[r])?'on':'')+'">'+((r===8?complete:state.won[r])?['1,','6','1','8'][i]:'·')+'</b>').join('')+(complete?'<span>Entra nell’aula di Matica</span>':'')+'</button>';$('tilecode').onclick=()=>enter(5)}
 $('status').textContent=room===1?(state.seen.honey?'Sposta gli oggetti e segui i tre simboli.':'Sposta il vasetto di miele e leggi il biglietto.'):count(room)+' / '+clues(room).length+' indizi · '+(all(room)?'Cerca il bagliore.':'Sposta gli oggetti.');
 draw()}
function tapMove(el){if(el.dataset.kind!=='object')return;let c=cfg(obj(el.dataset.id));el.dataset.u=wrap(c.x+(Math.abs(wrap(+el.dataset.u-c.x+.5)-.5)<.012?Math.max(.045,c.size*1.3):0));commitMove(el)}
function commitMove(el){let id=el.dataset.id,p=[+el.dataset.u,+el.dataset.v];state.moves[id]=p;save();paint()}
function openClue(o){state.seen[o[1]]=true;save();paint();let art=cardImages[o[1]];
 dialog(o[6],(art?'<img class="cardart" src="'+art+'" alt="'+o[6]+'">':'')+'<p>'+clueText(o)+'</p>'+(o[1]==='board'?calendar():'')+(o[1]==='paper'?'<div class="family">Fuco ♂ <span>↟</span> Madre ♀ <span>↟</span> Nonna ♀ e nonno ♂</div>':'')+(o[8]?'<button class="primary" id="follow">Esplora · '+rooms[o[8]]+'</button>':'<small>Raccolto nel taccuino</small>'));
 if(o[1]==='cone'){let link=document.createElement('a');link.href='credito-pigna.txt';link.textContent='Crediti fotografia';link.target='_blank';link.rel='noopener';$('body').append(link)}if(o[8])$('follow').onclick=()=>enter(o[8]);if(o[1]==='board')bindCalendar()}
function notebook(){let body='';for(let r=1;r<=5;r++){let lines=group(r).filter(o=>state.seen[o[1]]).map(o=>'<article><b>'+o[6]+'</b><p>'+clueText(o)+'</p>'+(cardImages[o[1]]?'<img class="miniart" src="'+cardImages[o[1]]+'" alt="'+o[6]+'">':'')+'</article>');(hints[r]||[]).forEach((h,i)=>{if(state.help[r+'-'+i])lines.push('<article><b>Aiuto '+(i+1)+'</b><p>'+h+'</p></article>')});if(r===2&&state.rabbitNotes?.trim()){const note=document.createElement('p');note.textContent=state.rabbitNotes;note.style.whiteSpace='pre-wrap';lines.push('<article><b>I miei appunti sui conigli</b>'+note.outerHTML+'</article>')}if(r===2&&all(2))lines.push('<blockquote>'+discovery+'</blockquote>');if(lines.length)body+='<section><h3>'+rooms[r]+'</h3>'+lines.join('')+'</section>'}dialog('Il mio taccuino',body||'<p>Le pagine aspettano il primo indizio. Comincia dal vasetto di miele.</p>')}
$('book').onclick=notebook;
$('hint').onclick=()=>{let n=count(room),unlocked=Math.min(3,n);dialog('Gli aiuti · '+guide[room],(room<=3?'<img class="mascot" src="'+(room===2?'rabbit':'bee')+'.png" alt="">':'')+'<p>'+unlocked+' di 3 aiuti sbloccati. '+(unlocked<3?'Esplora tre indizi per poterli consultare.':'Scegli un aiuto quando ti serve.')+'</p>'+hints[room].map((h,i)=>'<article><button data-help="'+i+'" '+(unlocked<3?'disabled':'')+'>Aiuto '+(i+1)+(i>=unlocked?' · bloccato':'')+'</button><p '+(state.help[room+'-'+i]?'':'hidden')+'>'+h+'</p></article>').join('')+(room===2&&all(2)?'<blockquote>'+discovery+'</blockquote>':''));document.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{state.help[room+'-'+b.dataset.help]=true;b.nextElementSibling.hidden=false;save()})};
const lastRabbitMonth = 10;
function rabbitMonth() {
  return Number.isInteger(state.rabbitMonth) ? clamp(state.rabbitMonth, 1, lastRabbitMonth) : 1;
}
function clueText(o) {
  return o[1] === 'board'
    ? 'Fai passare un mese alla volta. Segui ogni coppia lungo i rami e annota quello che scopri.'
    : o[7];
}
function calendar() {
  return '<div aria-live="polite" id="rabbitStatus"></div>' +
    '<p>Ogni simbolo mostra due conigli, cioè una coppia. Segui il ramo verde per ritrovare la stessa coppia nel mese successivo. Il ramo color miele porta alla coppia appena nata.</p>' +
    '<div id="rabbitTree" tabindex="0" aria-label="Albero delle coppie. Scorri per esplorarlo." style="overflow:auto;max-height:38vh;background:#fffdf6;border:1px solid #dbcda9;border-radius:8px"></div>' +
    '<p><button type="button" id="rabbitNext">Fai passare un mese</button> <button type="button" id="rabbitFirst">Rivedi dal primo mese</button></p>' +
    '<label for="rabbitNotes"><b>I miei appunti per il taccuino</b></label>' +
    '<textarea id="rabbitNotes" rows="3" placeholder="Al mese … ho contato … coppie. Ho notato che …" style="width:100%;padding:9px;font:inherit"></textarea>';
}
// The left child is the surviving pair; the right child, when present, is its newborn pair.
function buildRabbitTree(months) {
  const rows = Array.from({length:months}, () => []);
  let leaves = 0;
  function branch(month, age, newborn) {
    const node = {month, newborn, children:[]};
    rows[month-1].push(node);
    if (month === months) node.x = 64 + 48 * leaves++;
    else {
      node.children.push(branch(month+1, age+1, false));
      if (age >= 1) node.children.push(branch(month+1, 0, true));
      const children = node.children;
      node.x = (children[0].x + children[children.length-1].x)/2;
    }
    return node;
  }
  branch(1,0,true);
  return rows;
}
function drawRabbitTree() {
  const month = rabbitMonth(), rows = buildRabbitTree(month);
  const width = Math.max(170,64 + rows[month-1].length*48);
  const y = m => 26 + (m-1)*56;
  const defs = '<defs><g id="rabbitPair"><image href="rabbit.png" x="-17" y="-12" width="19" height="24"/><image href="rabbit.png" x="-1" y="-12" width="19" height="24"/></g></defs>';
  const lines = [], labels = [], pairs = [];
  for (const row of rows) {
    const m = row[0].month;
    labels.push('<text x="4" y="'+(y(m)+4)+'" font-size="11" fill="#23483e">Mese '+m+'</text>');
    for (const parent of row) {
      for (const child of parent.children) {
        lines.push('<line x1="'+parent.x+'" y1="'+(y(m)+12)+'" x2="'+child.x+'" y2="'+(y(m+1)-12)+'" stroke="'+(child.newborn?'#b77816':'#43776a')+'" stroke-width="2" '+(child.newborn?'stroke-dasharray="4 2"':'')+'/>');
      }
      pairs.push('<use href="#rabbitPair" x="'+parent.x+'" y="'+y(m)+'"/>');
    }
  }
  $('rabbitTree').innerHTML='<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Albero fino al mese '+month+'" width="'+width+'" height="'+(y(month)+20)+'" style="display:block;min-width:'+width+'px">'+defs+lines.join('')+labels.join('')+pairs.join('')+'</svg>';
  $('rabbitStatus').textContent='Mese '+month+' di '+lastRabbitMonth+' · '+rows[month-1].length+(rows[month-1].length===1?' coppia':' coppie');
  $('rabbitNext').disabled=month===lastRabbitMonth;
  $('rabbitFirst').disabled=month===1;
  $('rabbitTree').scrollTop=$('rabbitTree').scrollHeight;
}
function bindCalendar() {
  const notes=$('rabbitNotes');
  notes.value=state.rabbitNotes || '';
  notes.oninput=()=>{state.rabbitNotes=notes.value;save()};
  $('rabbitNext').onclick=()=>{state.rabbitMonth=Math.min(lastRabbitMonth,rabbitMonth()+1);save();drawRabbitTree()};
  $('rabbitFirst').onclick=()=>{state.rabbitMonth=1;save();drawRabbitTree()};
  drawRabbitTree();
}
function field(id,label){return '<label class="field">'+label+'<input type="text" inputmode="'+(id==='code'?'decimal':'numeric')+'" id="'+id+'" autocomplete="off"></label>'}
function verifyForm(r,fields,markup,check){dialog(rooms[r],'<form id="test">'+markup+'<p id="error" role="status"></p><button class="primary">Verifica</button></form>');fields.forEach(id=>{let input=$(id);input.value=state.answers[id]||'';input.oninput=()=>{state.answers[id]=input.value;save()}});$('test').onsubmit=e=>{e.preventDefault();if(!check())$('error').textContent='Riprova. Controlla i tuoi passaggi nel taccuino o consulta un aiuto.'}}
function nums(ids,values){return ids.every((id,i)=>/^\d+$/.test($(id).value.trim())&&+$(id).value===values[i])}
function reward(r){dialog('Hai trovato una tessera!','<p>'+({2:'Al mese 8 ci sono 21 coppie.',3:'Alla sesta generazione ci sono 13 antenati.',4:'Otto foglie completano il quinto livello.'})[r]+'</p>'+(r===4?'<img class="plant" src="plant-revealed.svg" alt="La piantina con tutte le otto foglie in cima">':'')+'<button id="claim" aria-label="Raccogli la tessera e torna nello studio"><b>'+prize[r]+'</b><span>Raccogli e torna nello studio</span></button>');$('claim').onclick=()=>{state.won[r]=true;save();enter(1)};return true}
function quiz(r){if(r===2){let ids=['m4','m5','m6','m7','m8'];verifyForm(r,ids,'<h3>Il calendario del recinto</h3><p>Nei primi tre mesi le coppie sono 1, 1, 2. Completa la tabella. Quante coppie ci sono al mese 8? Puoi fare i calcoli oppure consultare i tuoi appunti nel taccuino.</p><div class="fields">'+ids.map((id,i)=>field(id,'Mese '+(i+4))).join('')+'</div>',()=>nums(ids,[3,5,8,13,21])&&reward(2))}
 if(r===3){
   const ids=['g4','g5','g6'];
   const showComparison=Boolean(state.visited[2] && state.visited[4]);
   const comparison=showComparison ? '<label>Quale successione hai già incontrato?<select id="match"><option value="">Scegli…</option><option value="pari">I numeri pari</option><option value="conigli">I conigli del nonno</option><option value="quad">I numeri quadrati</option></select></label>' : '';
   const generations=ids.map((id,i)=>field(id,'Generazione '+(4+i))).join('');
   verifyForm(r,showComparison ? [...ids,'match'] : ids,
     '<h3>L’albero genealogico del fuco</h3><p>Le prime generazioni contano 1, 2 e 3 antenati. Estendi l’albero fino alla sesta.</p><div class="fields">'+generations+'</div>'+comparison,
     ()=>nums(ids,[5,8,13]) && (!showComparison || $('match').value==='conigli') && reward(3));
 }
 if(r===4)verifyForm(r,['leaves'],'<h3>Il quinto livello</h3><img class="plant" src="plant-hidden.svg" alt="Piantina con quattro livelli visibili e un cappello sul quinto"><p>Conta le foglie dal basso verso l’alto. Quante ne nasconde il cappello?</p>'+field('leaves','Foglie nascoste'),()=>nums(['leaves'],[8])&&reward(4));
 if(r===5){if(state.step)codePuzzle();else boardPuzzle()}}
function boardPuzzle(){let values=[21,8,13];dialog('La lavagna di Matica','<h3>1 · Ricostruisci la successione</h3><p>Trascina una tessera nel suo spazio, oppure selezionala e tocca lo spazio. Tocca una tessera inserita per riprenderla.</p><div class="blackboard">1, 1, 2, 3, 5, '+[0,1,2].map(i=>'<button class="slot" data-slot="'+i+'" aria-label="Spazio '+(i+1)+'">'+(state.slots[i]||'…')+'</button>').join(' , ')+', 34, 55</div><div class="tray">'+values.filter(v=>!state.slots.includes(v)).map(v=>'<button draggable="true" data-val="'+v+'" class="chip">'+v+'</button>').join('')+'</div><p id="error" role="status"></p><button class="primary" id="checkBoard">Verifica l’ordine</button>');function place(i,v){if(v&&!values.includes(v))return;if(v)state.slots=state.slots.map(n=>n===v?null:n);state.slots[i]=v;selectedTile=null;save();boardPuzzle()}document.querySelectorAll('[data-val]').forEach(b=>{b.ondragstart=e=>e.dataTransfer.setData('text/plain',b.dataset.val);b.onclick=()=>{selectedTile=+b.dataset.val;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c===b))}});document.querySelectorAll('.slot').forEach(b=>{b.onclick=()=>place(+b.dataset.slot,selectedTile);b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();place(+b.dataset.slot,+e.dataTransfer.getData('text/plain'))}});$('checkBoard').onclick=()=>{if([8,13,21].every((n,i)=>state.slots[i]===n)){state.step=true;save();codePuzzle()}else $('error').textContent='Controlla ogni tessera sommando i due numeri che la precedono.'}}
function codePuzzle(){verifyForm(5,['code'],'<h3>2 · Il codice finale</h3><p>Dividi 55 per 34 e arrotonda ai millesimi.</p>'+field('code','Il tuo risultato'),()=>{if(!/^1[,.]618$/.test($('code').value.trim()))return false;state.complete=true;save();ending();return true})}
function ending(){dialog('Missione compiuta!','<video src="finale.mp4" playsinline controls autoplay class="endfilm"></video><p>Hai ritrovato le tre tessere e aperto la lavagna di Matica.</p><button id="lastBook">Rileggi il taccuino</button> <button id="restart">Nuova missione</button>');$('lastBook').onclick=notebook;$('restart').onclick=resetGame}
function resetGame(){if(!confirm('Ricominciare la missione e svuotare il taccuino?'))return;state=fresh();save();location.reload()}
for (const button of document.querySelectorAll('[data-info]')) {
 button.onclick=()=>{
   const privacy=button.dataset.info==='privacy';
   $('infoTitle').textContent=privacy?'Privacy':'Leggimi';
   $('privacy').hidden=!privacy;
   $('guida').hidden=privacy;
   $('infoBox').showModal();
 };
}
$('infoClose').onclick=()=>$('infoBox').close();
$('playVideo').onclick=async()=>{let v=$('film');if(v.paused){try{await v.play()}catch{notify('Usa il comando di riproduzione nel video.')}}else v.pause()};$('film').onplay=()=>$('playVideo').textContent='Pausa';$('film').onpause=()=>$('playVideo').textContent='▶ Ascolta il messaggio';$('newMission').onclick=resetGame;
if(state.room){
  $('start').disabled=false;
  $('start').textContent='Nuova partita';
  $('start').onclick=resetGame;
  $('resume').hidden=false;
  $('resume').onclick=()=>{enter(state.room);if(state.complete)ending()};
  $('timer').textContent='Puoi riprendere dal punto in cui eri o ricominciare con un taccuino vuoto.';
}else progressIntro();
