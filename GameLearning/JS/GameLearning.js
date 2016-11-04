

generations = 0;
var currentNetwork;
var currentNetworkID = 0;
var currentGeneration = [];
var generationSize = 12;
var hiddenLayers = 4;

function startLearning(hl,gs) {
  if(hl != null) hiddenLayers = hl;
  if(gs != null) generationSize = gs;
  if(gameState == "pregame") {
    gameState = "running";
    currentGeneration = newGeneration(generationSize);
    currentNetwork = currentGeneration[0][1];
    game();
    learning();
  } else {
    console.log("Gamestate must be Pregame");
  }
}

function learning () {
  if(gameState == "over") {
    currentGeneration[currentNetworkID][0] = score;
    console.log("Genome finished, fitness was " + score);
    nextNetwork();
    setupGame();
    gameState = "running";
    game();
  }

  var output = currentNetwork.activate([distance,obstacle.type,speed]);
  controlGameByOutput(output);
  networkOutput = output;
  learningState = [generations,currentNetworkID+1,generationSize];

  setTimeout(function() {
    learning();
  },20);
}

function newGeneration(genSize,best) {
  currentNetworkID = 0;
  generations++;
  console.log("Building Generation " + generations);
  var generation = [];
  if(best == null) {
    for (var i = 0; i<genSize; i++) {
      var network = newNetwork();
      generation.push([0,network]);
    }
  } else {
    generation.push([0,best[i]]);

    for (var i = 0; i<genSize-best.length; i++) {
      var network = newNetwork();
      var neurons = network.neurons();
      for(var n = 0; n<neurons.length; n++) {
        var neuron = neurons[n].neuron;
        var connections = neuron.connections.projected;
        var number = -1;
        for (var key in connections) {
          number++;
          var connection = connections[key];
          var chance = parseInt(Math.random()*5);
          if(chance == 0) {
            connection.weight = Math.random() * .2 - .1;
          } else {
            var ran = parseInt(Math.random()*best.length);
            var bestNeurons = best[ran].neurons();
            var bestNeuronConnections = bestNeurons[n].neuron.connections.projected;
            var number2 = -1;
            for (var key2 in bestNeuronConnections){
              number2++;
              if(number == number2) {
                var weight = bestNeuronConnections[key2].weight;
              }
            }
            connection.weight = weight;
          }
        }
      }
    }
    //network.optimized.reset();
    generation.push([0,network]);
  }
  return generation;
}

function nextNetwork() {
  currentNetworkID++;
  if(currentNetworkID == generationSize) {
    currentGeneration.sort(sortNumber);
    console.log("Generation finished, best fitness was " + currentGeneration[0][0]);
    var best = selectBest(currentGeneration,parseInt(generationSize/3)+1);
    newGeneration(generationSize,best);
  } else {
    currentNetwork = currentGeneration[currentNetworkID][1];
    drawNetwork(currentNetwork);
  }
}

function selectBest(generation, amount){
  var best = [];
  for (var i = 0; i<amount; i++){
    best.push(generation[i][1]);
  }
  return best;
}

function controlGameByOutput(output) {
  if(output[0] > 0.5) {
    player.jump();
  }
  if(output[1] > 0.5) {
    player.ducking = true;
  } else {
    player.ducking = false;
  }
}

function newNetwork() {
  var inputLayer = new Layer(3);
  var hiddenLayer = new Layer(hiddenLayers);
  var hiddenLayer2 = new Layer(hiddenLayers);
  var outputLayer = new Layer(2);
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
