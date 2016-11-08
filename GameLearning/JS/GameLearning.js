

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
    $('#display-input').css('height', '13.33%');
    $('#display-log').css({'height': '53.33%','top': '46.66%'});
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
function setFitness(id,fitness) {
  currentGeneration[id-1][0] = fitness;
}
