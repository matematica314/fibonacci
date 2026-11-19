const rooms=['','Lo studio','Il recinto dei conigli','La bottega del signor Aldo','Il giardino del nonno','L’aula di Matica'];
// Positions are fractions of the original equirectangular illustration.
const objects=[
[1,'honey','Vasetto di miele',.49,.626,.032,'Il biglietto','Tre tessere ti aspettano. Quando le avrai, cerca una lavagna. Sposta gli oggetti nella stanza e inizia da dove vuoi. Potrai sempre tornare qui dopo.'],
[1,'frame','Quadro',.145,.39,.069,'Il coniglietto','Segui il coniglietto nel recinto.',2],
[1,'notebook','Quaderno',.565,.652,.049,'L’ape','Segui l’ape nella bottega del signor Aldo.',3],
[1,'plant','Pianta',.405,.593,.042,'La foglia','Segui la foglia nel giardino del nonno.',4],
[1,'pen','Penna',.515,.676,.031],[1,'cup','Tazzina da tè',.61,.624,.026],[1,'chair','Sedia',.68,.762,.064],
[2,'bucket','Secchiello',.355,.772,.047,'Le regole','Una coppia di coniglietti diventa adulta a due mesi. Da quel momento, ogni mese, ogni coppia adulta fa nascere una nuova coppia. Nessun coniglio se ne va.'],
[2,'hay','Fieno',.423,.802,.081,'I primi mesi','Mese 1: 1 coppia. Mese 2: 1 coppia. Mese 3: 2 coppie.'],
[2,'board','Asse di legno',.62,.789,.14,'Il calendario','Ogni gettone rappresenta una coppia. Disponi i gettoni nel calendario per tenere traccia delle coppie.'],
[3,'darkjar','Vasetto scuro',.49,.649,.036,'Le api','L’ape regina depone uova fecondate (diventano femmine) e uova non fecondate (diventano maschi).'],
[3,'tag','Cartellino',.565,.68,.038,'La famiglia del fuco','Il fuco, cioè l’ape maschio, ha una mamma ma non ha un papà. Le femmine hanno mamma e papà.'],
[3,'paper','Carta da imballaggio',.381,.645,.096,'L’albero del fuco','Genitori: 1. Nonni: 2. Bisnonni: 3. Continua a contare gli antenati, una generazione alla volta.'],
[4,'cone','Pigna',.427,.736,.037,'Le spirali della pigna','Segui una fila di squame in ciascuno dei due sensi. I colori distinguono le due direzioni.'],
[4,'sunflower','Girasole',.487,.687,.055,'I semi del girasole','I semi disegnano due famiglie di spirali che girano in versi opposti. Spesso i loro numeri sono vicini nella successione.'],
[4,'shell','Conchiglia',.575,.757,.039,'La conchiglia','Anche le conchiglie crescono in spirale.'],
[4,'romanesco','Romanesco',.532,.645,.051,'Il romanesco','Cerca le spirali piccole dentro le spirali grandi.'],
[4,'mimosa','Ramo di mimosa',.465,.797,.066,'Le foglie','Le foglie crescono in posizioni sfalsate: una foglia direttamente sopra l’altra le farebbe ombra.'],
[5,'chalk','Gesso',.225,.55,.033,'Due numeri vicini','Prendi due numeri vicini della successione e dividi il secondo per il primo. Cosa ottieni? 8 ÷ 5 = 1,6; 13 ÷ 8 = 1,625; 21 ÷ 13 ≈ 1,615.'],
[5,'register','Registro',.365,.694,.065,'La carta fedeltà','Il lato lungo e il lato corto di una carta fedeltà sono 8 cm e 5 cm.'],
[5,'desk','Cattedra',.395,.599,.115,'La spirale di rettangoli','Accosta quadrati con lati successivi di 1, 1, 2, 3, 5 e 8 unità. I rettangoli crescono e gli archi tracciano una spirale.']];
const hints={2:['Quante coppie c’erano il mese prima? E due mesi prima?','Le coppie del mese prima ci sono ancora tutte. Quelle di due mesi prima sono diventate adulte.','Il numero di un mese è la somma dei due numeri precedenti: 1, 1, 2, 3, 5, 8, 13, 21.'],3:['Colora i maschi di blu e le femmine di rosa. Quanti genitori ha ciascuno?','Per ogni generazione conta: ogni femmina vale 2 genitori, ogni maschio 1.','Guarda i numeri 1, 2, 3, 5: somma due vicini per ottenere il successivo.'],4:['Conta le foglie di ogni livello e scrivi i numeri in fila: 1, 2, 3, 5.','Guarda i numeri dei conigli e delle api: li hai già incontrati.','Somma le foglie degli ultimi due livelli visibili: 3 + 5.'],5:['Guarda i numeri a destra e a sinistra di ogni buco.','Ogni numero è la somma dei due precedenti.','Per il codice usa la calcolatrice: 55 ÷ 34 = 1,617647… Arrotonda ai millesimi.']};
const discovery='Per costruire la successione non serve tutta la storia: bastano i due passi precedenti.';
const cardImages={cone:'pinecone-card.png',sunflower:'sunflower-card.svg',desk:'rectangle-spiral.svg',shell:'shell.png',romanesco:'romanesco.png',mimosa:'mimosa.png'};
