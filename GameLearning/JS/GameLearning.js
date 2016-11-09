

generations = 0;
var currentNetwork;
var currentNetworkID = 0;
var currentGeneration = [];
var generationSize = 12;
var hiddenLayers = 4;

function startLearning(hl,gs) {
  if(hl != null) hiddenLayers = hl;
  if(gs != null) generationSize = gs;

  isLearning = true;

  if(gameState == "pregame") {
    gameState = "running";
    newGeneration(generationSize);
    currentNetwork = currentGeneration[0][1];
    game();
    learning();

    $('#learning-input').addClass('hidden');
    $('#display-input').css('height', '18.33%');
    $('#display-log').css({'height': '48.33%','top': '51.66%'});
    $('#importGoodNetwork').removeClass('hidden');
  } else {
    console.log("Gamestate must be Pregame");
  }
}

function learning () {
  if(gameState == "pregame") {
    currentGeneration[currentNetworkID][0] = score;
    console.log("Genome " + (currentNetworkID+1) + " finished, fitness: " + score);
    //updateData();
    nextNetwork();
    setupGame();
    gameState = "running";
    game();
  }

  var output = currentNetwork.activate([distance,obstacle.type,speed]);
  controlGameByOutput(output);
  networkOutput = output;
  learningState = [generations,currentNetworkID+1,generationSize];

  setTimeout(learning,gameSpeed);
}

function newGeneration() {
  currentNetworkID = 0;
  generations++;
  console.log("Building Generation " + generations + "...");

  if(currentGeneration.length == 0) {
    for (var i = 0; i<generationSize; i++) {
      var network = newNetwork();
      currentGeneration.push([0,network]);
    }
  } else {
    selectBest(parseInt(generationSize/5)+1);
    var best = _.clone(currentGeneration);
    while (currentGeneration.length < generationSize - 2) {
      var genome1 = _.sample(best)[1].toJSON();
      var genome2 = _.sample(best)[1].toJSON();
      var newGenome = crossOver(genome1,genome2);
      mutateGenome(newGenome);
      currentGeneration.push([0,Network.fromJSON(newGenome)]);
    }
    while (currentGeneration.length < generationSize) {
      var genome = _.sample(best)[1].toJSON();
      var newGenome = _.clone(genome);
      mutateGenome(newGenome);
      currentGeneration.push([0,Network.fromJSON(newGenome)]);
    }
  }
  drawNetwork(currentGeneration[0][1]);
  console.log("Starting tests for Generation " + generations + "...");
  console.log(" ");
}

function nextNetwork() {
  currentNetworkID++;
  if(currentNetworkID == generationSize) {
    currentGeneration.sort(sortNumber);
    console.log(" ");
    console.log("Generation " + generations + " finished, best fitness: " + currentGeneration[0][0]);
    if((currentGeneration[0][0] == 0)&&(highScore == 0)){
      console.log("Bad generation, randomizing next one.");
      currentGeneration = [];
    }
    console.log(" ");
    console.log("line");
    console.log(" ");
    newGeneration();
  } else {
    currentNetwork = currentGeneration[currentNetworkID][1];
    drawNetwork(currentNetwork);
  }
}
function selectBest(amount){
  while(currentGeneration.length > amount) {
    currentGeneration.pop();
  }
  var newGeneration = [];
  for(var key in currentGeneration){
    if(currentGeneration[key][0] != 0){
      newGeneration.push(currentGeneration[key]);
    }
  }
}
function controlGameByOutput(output) {
  if(output[0] > 0.5) {
    player.jump();
    player.ducking = false;
  }
  if(output[0] < 0.5){
    player.ducking = true;
  }
}
function newNetwork() {
  var inputLayer = new Layer(3);
  var hiddenLayer = new Layer(hiddenLayers);
  var hiddenLayer2 = new Layer(hiddenLayers);
  var outputLayer = new Layer(1);
  inputLayer.project(hiddenLayer);
  hiddenLayer.project(hiddenLayer2);
  hiddenLayer2.project(outputLayer);
  var network = new Network ({
    input: inputLayer,
    hidden: [hiddenLayer,hiddenLayer2],
    output: outputLayer
  });
  return network;
}

//The following part was mainly written by Ivan Seidel and copied
//https://github.com/ivanseidel/IAMDinosaur

function crossOver(genome1,genome2) {
  if (Math.random() > 0.5) {
    var temp = genome1;
    genome1 = genome2;
    genome2 = temp;
  }
  genome1 = _.cloneDeep(genome1);
  genome2 = _.cloneDeep(genome2);

  neurons1 = genome1.neurons;
  neurons2 = genome2.neurons;

  var ran = Math.round(neurons1.length * Math.random());
  var tmp;
  for (var k = ran; k < neurons1.length; k++) {
    tmp = neurons1[k]['bias'];
    neurons1[k]['bias'] = neurons2[k]['bias'];
    neurons2[k]['bias'] = tmp;
  }
  return genome1;
}
function mutateGenome(genome) {
  var neurons = genome.neurons;
  for (var k = 0; k < neurons.length; k++) {
    if (Math.random() > 0.2) {
      continue;
    }
    neurons[k]['bias'] += neurons[k]['bias'] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
  }
  var connections = genome.connections;
  for (var k = 0; k < connections.length; k++) {
    if (Math.random() > 0.2) {
      continue;
    }
    connections[k]['weight'] += connections[k]['weight'] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
  }
}

//End of Ivan Seidel's code

function setFitness(id,fitness) {
  currentGeneration[id-1][0] = fitness;
}
function importGoodNetwork(id) {
  if(id < currentNetworkID){
    console.log("Network " + id + " was already tested, wait for next Generation and try again");
    return;
  } else if (hiddenLayers != 10) {
    console.log("The good network can only be imported for Tests running with 10 hidden-layer Neurons");
    return;
  }
  var goodNetwork = Network.fromJSON($.parseJSON('{"neurons":[{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":6.039999999999997,"bias":0,"layer":"input","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":1,"bias":0,"layer":"input","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":25,"bias":0,"layer":"input","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-59.81419839082937,"old":-59.7074116016907,"activation":1.0544444357244023e-26,"bias":-0.03478402142418319,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":157.91637218987827,"old":156.99833865766485,"activation":1,"bias":0.07953216429744409,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":7.676029112550983,"old":8.647377739737804,"activation":0.9995364020266325,"bias":-3.528019097539093,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":1.795051726936903,"old":3.7426346907296564,"activation":0.8575455169262378,"bias":-0.8047612800332327,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-17.60247661886154,"old":-15.511000542829372,"activation":2.2664259116554473e-8,"bias":0.3007693531828559,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":70.91113572905189,"old":67.44423370612301,"activation":1,"bias":0.5809251093367548,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":22.254419414340894,"old":11.866183539306293,"activation":0.9999999997837139,"bias":16.350945273334574,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":479.0660464958145,"old":491.5878417568232,"activation":1,"bias":4.465145517245029,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-9.381249277408937,"old":-9.136427608697314,"activation":0.00008428273116598635,"bias":0.9401638778601524,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":13.06981163917733,"old":13.822233443521085,"activation":0.9999978920902624,"bias":-0.07764427860195183,"layer":"0","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-61.29914494065002,"old":-61.238896073738296,"activation":2.3884689887326044e-27,"bias":-12.78607361405221,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":10.229506208552928,"old":9.944253196154685,"activation":0.9999639117163338,"bias":0.2691692561873405,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":1.7761681544771706,"old":1.7800715018763924,"activation":0.8552230654235117,"bias":1.1870248140921955,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-14.86755025536609,"old":-14.884265967709453,"activation":3.492245874754387e-7,"bias":-8.523979708727929,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-5.040885080903841,"old":-5.14222736446981,"activation":0.006426454618366173,"bias":-0.7068071520476603,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-43.05793496324807,"old":-47.628078891865655,"activation":1.9960731063348268e-19,"bias":-9.507755016547286,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-5.876990074601773,"old":-5.871560247735988,"activation":0.0027953740222868644,"bias":-0.32694501525283204,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-9.513777652903363,"old":-9.828661618407882,"activation":0.00007382216905281547,"bias":0.14967649178786097,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-366.74174014091716,"old":-366.7753173426334,"activation":5.322136061727545e-160,"bias":-0.09447346149385094,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-4.046039952926671,"old":-4.089382977273477,"activation":0.017190811686276525,"bias":-0.11522218496708606,"layer":"1","squash":"LOGISTIC"},{"trace":{"elegibility":{},"extended":{}},"state":-3.2954089481510316,"old":-3.2959231210021147,"activation":0.03572902560941287,"bias":-0.1903809565424579,"layer":"output","squash":"LOGISTIC"}],"connections":[{"from":"0","to":"3","weight":0.021357357827733514,"gater":null},{"from":"0","to":"4","weight":-0.18360670644268667,"gater":null},{"from":"0","to":"5","weight":0.19426972543736415,"gater":null},{"from":"0","to":"6","weight":0.3895165927585507,"gater":null},{"from":"0","to":"7","weight":0.41829521520643353,"gater":null},{"from":"0","to":"8","weight":-0.6933804045857769,"gater":null},{"from":"0","to":"9","weight":-2.0776471750069203,"gater":null},{"from":"0","to":"10","weight":2.504359052201744,"gater":null},{"from":"0","to":"11","weight":0.0489643337423242,"gater":null},{"from":"0","to":"12","weight":0.15048436086875117,"gater":null},{"from":"1","to":"3","weight":1.2371074706746694,"gater":null},{"from":"1","to":"4","weight":-1.0354204369825528,"gater":null},{"from":"1","to":"5","weight":1.0243547232237202,"gater":null},{"from":"1","to":"6","weight":-0.5479502658449276,"gater":null},{"from":"1","to":"7","weight":0.3108405816182817,"gater":null},{"from":"1","to":"8","weight":-48.873467837670105,"gater":null},{"from":"1","to":"9","weight":6.071844527480099,"gater":null},{"from":"1","to":"10","weight":422.9406005661642,"gater":null},{"from":"1","to":"11","weight":0.88079159029345,"gater":null},{"from":"1","to":"12","weight":1.4660130211821498,"gater":null},{"from":"2","to":"3","weight":-2.4458208112543747,"gater":null},{"from":"2","to":"4","weight":6.399249798779088,"gater":null},{"from":"2","to":"5","weight":0.3602521738089871,"gater":null},{"from":"2","to":"6","weight":0.03180332210213672,"gater":null},{"from":"2","to":"7","weight":-0.8296235861403813,"gater":null},{"from":"2","to":"8","weight":4.9356678440433335,"gater":null},{"from":"2","to":"9","weight":0.4952247420227206,"gater":null},{"from":"2","to":"10","weight":1.4613588694842674,"gater":null},{"from":"2","to":"11","weight":-0.4599179728546471,"gater":null},{"from":"2","to":"12","weight":0.430900694277995,"gater":null},{"from":"3","to":"13","weight":14.964799765247948,"gater":null},{"from":"3","to":"14","weight":-0.4106167844217762,"gater":null},{"from":"3","to":"15","weight":-135.86761988751715,"gater":null},{"from":"3","to":"16","weight":0.33459143760299576,"gater":null},{"from":"3","to":"17","weight":0.4269721295333591,"gater":null},{"from":"3","to":"18","weight":0.0950057561778418,"gater":null},{"from":"3","to":"19","weight":0.19873968759113836,"gater":null},{"from":"3","to":"20","weight":-0.9673928596773271,"gater":null},{"from":"3","to":"21","weight":18.40420166069395,"gater":null},{"from":"3","to":"22","weight":0.37623798925294966,"gater":null},{"from":"4","to":"13","weight":16.955354709007985,"gater":null},{"from":"4","to":"14","weight":-0.9286883015037528,"gater":null},{"from":"4","to":"15","weight":-2.7750485845349124,"gater":null},{"from":"4","to":"16","weight":-0.6924511702657573,"gater":null},{"from":"4","to":"17","weight":-1.484309952330685,"gater":null},{"from":"4","to":"18","weight":0.936714955939307,"gater":null},{"from":"4","to":"19","weight":-0.25949868098715023,"gater":null},{"from":"4","to":"20","weight":2.006417361110368,"gater":null},{"from":"4","to":"21","weight":-0.042438735041988,"gater":null},{"from":"4","to":"22","weight":-0.23565314950627186,"gater":null},{"from":"5","to":"13","weight":0.12570005528183287,"gater":null},{"from":"5","to":"14","weight":-0.005684837087016337,"gater":null},{"from":"5","to":"15","weight":0.963604558872377,"gater":null},{"from":"5","to":"16","weight":0.6250925093350648,"gater":null},{"from":"5","to":"17","weight":-2.6659737739593936,"gater":null},{"from":"5","to":"18","weight":-1.2726663437296892,"gater":null},{"from":"5","to":"19","weight":-1.8807043386009124,"gater":null},{"from":"5","to":"20","weight":-24.515979973644647,"gater":null},{"from":"5","to":"21","weight":0.09453890735962489,"gater":null},{"from":"5","to":"22","weight":-0.5127273259865701,"gater":null},{"from":"6","to":"13","weight":0.504866741394817,"gater":null},{"from":"6","to":"14","weight":-2.3908875345424656,"gater":null},{"from":"6","to":"15","weight":0.02980426445129669,"gater":null},{"from":"6","to":"16","weight":-0.14815408024633936,"gater":null},{"from":"6","to":"17","weight":-0.8426852626625028,"gater":null},{"from":"6","to":"18","weight":-38.30121387243183,"gater":null},{"from":"6","to":"19","weight":0.04994442553199363,"gater":null},{"from":"6","to":"20","weight":-2.5800555933399476,"gater":null},{"from":"6","to":"21","weight":-0.3027813403129116,"gater":null},{"from":"6","to":"22","weight":-0.3623730887915402,"gater":null},{"from":"7","to":"13","weight":-1.2050090189955522,"gater":null},{"from":"7","to":"14","weight":2.9975055498722343,"gater":null},{"from":"7","to":"15","weight":-1.175128481300165,"gater":null},{"from":"7","to":"16","weight":4837.159933261026,"gater":null},{"from":"7","to":"17","weight":-97.16643078828614,"gater":null},{"from":"7","to":"18","weight":-1.1778563611068895,"gater":null},{"from":"7","to":"19","weight":-17.75114469886813,"gater":null},{"from":"7","to":"20","weight":-0.381912894763757,"gater":null},{"from":"7","to":"21","weight":-0.7085497286875932,"gater":null},{"from":"7","to":"22","weight":1.7175878246152216,"gater":null},{"from":"8","to":"13","weight":-67.2966009747585,"gater":null},{"from":"8","to":"14","weight":0.702990042785145,"gater":null},{"from":"8","to":"15","weight":-0.40505250959139893,"gater":null},{"from":"8","to":"16","weight":-0.6965622068687518,"gater":null},{"from":"8","to":"17","weight":0.7760490145852179,"gater":null},{"from":"8","to":"18","weight":-2.268216274618967,"gater":null},{"from":"8","to":"19","weight":-1.0769505345842965,"gater":null},{"from":"8","to":"20","weight":16.319885467342218,"gater":null},{"from":"8","to":"21","weight":-0.49265693850324177,"gater":null},{"from":"8","to":"22","weight":0.7244538591810521,"gater":null},{"from":"9","to":"13","weight":1.1099925238320325,"gater":null},{"from":"9","to":"14","weight":-0.5097292919240344,"gater":null},{"from":"9","to":"15","weight":2.998092417448174,"gater":null},{"from":"9","to":"16","weight":0.30453022026837934,"gater":null},{"from":"9","to":"17","weight":0.3999316748262485,"gater":null},{"from":"9","to":"18","weight":0.2595868296073611,"gater":null},{"from":"9","to":"19","weight":1.1825959696044457,"gater":null},{"from":"9","to":"20","weight":0.07781961832186203,"gater":null},{"from":"9","to":"21","weight":-365.69628827654367,"gater":null},{"from":"9","to":"22","weight":-5.970130768415895,"gater":null},{"from":"10","to":"13","weight":0.5285058502401961,"gater":null},{"from":"10","to":"14","weight":0.08267748141236986,"gater":null},{"from":"10","to":"15","weight":-0.6160391071011752,"gater":null},{"from":"10","to":"16","weight":-5.766550403064539,"gater":null},{"from":"10","to":"17","weight":0.1196744631266129,"gater":null},{"from":"10","to":"18","weight":1.7364943397194064,"gater":null},{"from":"10","to":"19","weight":-0.08773978560430146,"gater":null},{"from":"10","to":"20","weight":-3.012415756844941,"gater":null},{"from":"10","to":"21","weight":-0.12453070875737676,"gater":null},{"from":"10","to":"22","weight":0.3260102799603294,"gater":null},{"from":"11","to":"13","weight":-0.6496788932853698,"gater":null},{"from":"11","to":"14","weight":-0.4250179732212439,"gater":null},{"from":"11","to":"15","weight":3.876017876653159,"gater":null},{"from":"11","to":"16","weight":0.20399123228578978,"gater":null},{"from":"11","to":"17","weight":-0.5694378255248873,"gater":null},{"from":"11","to":"18","weight":-0.5153187999807018,"gater":null},{"from":"11","to":"19","weight":1.1828392178942444,"gater":null},{"from":"11","to":"20","weight":0.25293106886288064,"gater":null},{"from":"11","to":"21","weight":-2.0326347927915713,"gater":null},{"from":"11","to":"22","weight":-0.1996012233273743,"gater":null},{"from":"12","to":"13","weight":-0.36885741989467347,"gater":null},{"from":"12","to":"14","weight":12.669126568929991,"gater":null},{"from":"12","to":"15","weight":0.39814896221828233,"gater":null},{"from":"12","to":"16","weight":0.009582359587823358,"gater":null},{"from":"12","to":"17","weight":-0.7579957276865485,"gater":null},{"from":"12","to":"18","weight":-0.09760595653626947,"gater":null},{"from":"12","to":"19","weight":-3.471555806180803,"gater":null},{"from":"12","to":"20","weight":1.6619508820759221,"gater":null},{"from":"12","to":"21","weight":-0.12602733157525864,"gater":null},{"from":"12","to":"22","weight":2.047764154425587,"gater":null},{"from":"13","to":"23","weight":-430.4332476119763,"gater":null},{"from":"14","to":"23","weight":-0.6558479974547144,"gater":null},{"from":"15","to":"23","weight":-2.852829319156966,"gater":null},{"from":"16","to":"23","weight":13.991987235732797,"gater":null},{"from":"17","to":"23","weight":-1.0414172138825117,"gater":null},{"from":"18","to":"23","weight":-0.2916252243913482,"gater":null},{"from":"19","to":"23","weight":0.8319318278348468,"gater":null},{"from":"20","to":"23","weight":0.5355509947402413,"gater":null},{"from":"21","to":"23","weight":1.4310003941526648,"gater":null},{"from":"22","to":"23","weight":-0.2952501169608925,"gater":null}]}'))
  goodNetwork.optimize();
  currentGeneration[id][1] = goodNetwork;
  console.log("A well trained network was imported for genome " + (id+1));
}
