const  b = { qtdMostra:0, acertos:1, especiais:2, TempoMole :3 },
	maxIndice = 439,		vazio = "_",	
	sinais = 	[" + "," - "," x "," ÷ "],
	oper = 		[" + "," - "," * "," / "],
	txt = document.getElementById("conta"),
	fase = document.getElementById("levels"),
	btneg = document.getElementById( 'btneg' ),
	box = document.getElementById( 'texto1' ),
	bt1 = document.getElementById( 'bt1' ),
	auto = document.getElementById( 'auto' ),
interface = {};	
interface.acertou = ()=>{
	console.log("ACERTOU", A,sinal,B,"=",result, "| indice:", indice);
	fase.innerText += "ACERTOU";
}
interface.errou = ()=>{
	console.log(answer, "ERROU", result)	;
	fase.innerText += "ERROU";
}
interface.question = (quest)=>{
	txt.textContent = quest;
	box.value= "";
}
interface.xpUp =(xp)=>{

	fase.innerText = "Level = "+stats.level +"; XP = "+ stats.exp+";"

	console.log("ganhou ",xp,"de experiência!! \ntotal:", stats.exp,
				"tamanho da lista = ", listQuestions.length,	 "\n falta:", 
				(((stats.level+1)*44)+1+((stats.level+1)**4)) - stats.exp, "para o próximo level")
}
interface.levelUp =()=>{
	console.log("subiu para o Level:", stats.level)
}
limiar = 0.8

interface.teclas = (e)=>{ 
	if (document.activeElement != box && (!isNaN(e.key*0) || e.key == "-") ) {
		box.value+= e.key; box.oninput()
	} else if (e.key == "Enter" && !bt1.disabled ) {response(box.value)} 
	else if (e.key == " " ) {response(result ); } //debug
}

bt1.onclick = () => response(box.value)
btneg.onclick = ()=>{ box.value= box.value==''? box.value+'-' :((parseInt(box.value)*-1)+""); box.oninput () }
box.oninput = ()=>{
	btneg.disabled = box.value.length==0;
	if (box.value.length == (result+"").length){
		bt1.disabled = false;
		if (auto.checked){response(box.value)}
	}else{
		bt1.disabled = true;
	}
}


bt1.disabled = true;
onkeydown = interface.teclas;
auto.onchange = function () {
	if (!auto.checked) {
	  bt1.style.visibility = 'visible';
	} else {
	 bt1.style.visibility = 'hidden';
	}
};
var	A=0, B=1, C=1, x=0, result = 1, sinal= oper[x],	answer = "", indice = 0,
	t1 = (new Date()).valueOf(), t2 = (new Date()).valueOf(), deltaT = t2 - t1,
	listQuestions = [],		mediaAcertos =0,
stats = JSON.parse(localStorage.getItem("stats"));
if(!stats) {
	var stats = {exp:0, level:0, boletim: [], 
		totalErros: 0, totalContas:0, tempMedio: 10000, 
		ultTempo:9000, acertoUltima: false, seguidas:0 }
	savedata ()
}
function savedata () {
	localStorage.setItem('stats', JSON.stringify(stats));
}
function response(answer=""){
	t2 = (new Date()).valueOf();	deltaT = t2 - t1;
	stats.tempMedio = 
		((stats.tempMedio*stats.totalContas)+deltaT) 
			/ (stats.totalContas + 1);
	stats.totalContas++

	if (parseInt(answer) == result){ interface.acertou()
		stats.boletim[indice][b.TempoMole] =
			stats.boletim[indice][b.TempoMole]==0 	? 	deltaT	:
			( stats.boletim[indice][b.TempoMole] + deltaT ) / 2 ;
		stats.ultTempo = deltaT;
				
		if(stats.acertoUltima){
			if(result == C){ stats.boletim[indice][b.especiais]++;}
			if(stats.ultTempo < stats.tempMedio*Math.SQRT2) {stats.seguidas++}
			else if(stats.ultTempo > 10000) 			  {stats.seguidas = 0}
			else {stats.seguidas = 	stats.seguidas > 0 ? stats.seguidas- 1: 0}
			stats.boletim[indice][b.acertos]++;
			addExp()
		}else{ stats.seguidas = 0; stats.acertoUltima = true; }	

	}else{ interface.errou()
		if(!stats.acertoUltima){stats.seguidas++}
		else{stats.seguidas=0; stats.acertoUltima = false;}			
		stats.totalErros++;	
	}
	interface.question(nextQuestion());
	savedata()
}
function addExp(){	
	
	let xpToGain = ( (indice*(
		(!isNaN(A*1)?A:1)+
		(!isNaN(B*1)?B:1)+
		(!isNaN(C*1)?C:1) )* (x+1)**2)
		/(stats.level+1)	)* stats.seguidas
	;
	if( deltaT < stats.boletim[indice][b.TempoMole]){
		xpToGain+= ((deltaT<10000? 10000 - deltaT: 1)
			/	stats.boletim[indice][b.qtdMostra])
			*	stats.boletim[indice][b.especiais]
	} else {xpToGain++}

	xpToGain=Math.floor(xpToGain)

	stats.exp+= xpToGain;	interface.xpUp(xpToGain);
	
	while (stats.exp >= (stats.level*44)+ 1 + (stats.level**4)){
		stats.level++; 		interface.levelUp();
	}
}
function getListQuestions(max){
	
	mediaAcertos= stats.totalContas/( (stats.totalContas - stats.totalErros) + 1 );
	let media = 0;

	for (let i = 0; i < max; i++) {

		if (stats.boletim[i][b.acertos] < 2) { listQuestions.push(i) }
		else {
			media = stats.boletim[i][b.qtdMostra] / stats.boletim[i][b.acertos]
			if (media < 0.5) { listQuestions.push(i);} 
			if (media < 0.9) { listQuestions.push(i);}
		}
		if (listQuestions.length<11){
			if (media < mediaAcertos){ listQuestions.push(i) } 
			else if (stats.boletim[i][b.TempoMole < stats.tempMedio]) {
				listQuestions.push(i)
			}
		}		
	}
}	
function nextQuestion(){	

	let rand = Math.random(),
	 max = stats.boletim.length, // transf. numa func de recuperação a cada 11, pra ver se precisa recuperar
	 nota = stats.level**(mediaAcertos*rand);

	if (stats.acertoUltima){
		if(max<maxIndice && max%44 !=0){ indice = max	}else{
			if (listQuestions.length < (max<maxIndice?nota:1)){	getListQuestions(max) }	
			var i = 0;
			var sem11 = true;
			for(; i < listQuestions; i++){ console.log(i,listQuestions[i])
				if(listQuestions[i]==(indice-11)){ console.log(listQuestions[i], "é simétrico a:", indice)
					indice = listQuestions.splice(i,1)[0]
					sem11 = false; 
					break
				}else if (listQuestions[i]==(indice+11)) { console.log(listQuestions[i], "é simétrico a:", indice)
					indice = listQuestions.splice(i,1)[0]
					sem11 = false
					break
				}
			}
			if (sem11){
				indice = listQuestions.splice(Math.floor(rand*listQuestions.length),1)[0]
			}
			if((listQuestions.length < nota) && max<maxIndice){  
				sem11 = true;
				for(i=(max-1);i>max-21;i--){
					if(stats.boletim[i][b.acertos]<2){
						sem11=false; 
						break 
					}
					//////// FAZER A RECUPERAÇÂO AQUI, diminuir o MAX e o indice, se tiver indo mto mal
				} if (sem11){indice = max} else{ console.log("não passou no teste, reprovado, vai repetir")}
			}
		}
	}
	A = indice % 11  
	x = Math.floor ( indice / 11 ) % 4		
	B = Math.floor ( indice / 44 ) +1; 
		if (x%2==1){ A = B * ( 10 - A )}else{ // '/ou-'  ELSE ordem dos fatores não altera o resultado  
			if (x==0) { A = A * B }
			if ( rand < 0.5 && stats.acertoUltima) { C = A; A = B; B = C } 
		}	// inverte A e B
	C = eval( A + oper[x] + B )	

	sinal = rand < 1 / ((indice+1) % 11 + 0.1 ) +0.3 ? sinais[x] : oper[x]

	let specialRatio = !stats.boletim[indice] ? 1 :
				(stats.boletim[indice][b.especiais]
				/(stats.boletim[indice][b.acertos] +1))%1,
		limiar = ((stats.ultTempo / 1000 ) / (1+ ( stats.seguidas + 0.1 )
								 * specialRatio) + (1-specialRatio ))%1; 

					
	if(	!stats.acertoUltima || stats.seguidas==0 ||
		( stats.boletim[indice]	&& rand > limiar )) {
		if(stats.totalContas%2 == 0 || A==0)
		{
			result = A;	A = vazio.repeat((A+"").length);
		}else{
			result = B;	B = vazio.repeat((B+"").length); 
		} 
	}else{  result = C; C = vazio.repeat((C+"").length); }

	if( !stats.boletim[indice] ){ stats.boletim.push( [1,0,0,0] )
	} else { stats.boletim[indice][b.qtdMostra]++ }
	
	t1 = (new Date()).valueOf();

	return  A + sinal + B + " = " + C

}interface.question( nextQuestion())
