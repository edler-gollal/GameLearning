
var generations = 0;
var genLog = [];

function breedGenerations(amount, popSize) {
  var gen = buildGeneration(popSize);
  for(var i = 0; i<amount-1; i++) {
    var best = selectBest(gen,5);
    gen = buildGeneration(popSize,best);
  }
  genLog.sort();
  console.log("Best Generation was #" + genLog[0][1] + " with a Fitness of " + genLog[0][0]);
}

function buildGeneration(population, best) {
  generations++;
  console.log("Building Generation " + generations);
  var bestError = 1;
  var generation = [];
  if(best == null) {
    for (var i = 0; i<population; i++) {
      var network = createNewNetwork(3,6,1);
      var fitness = Math.abs(network.activate([1,0,1])-1);
      console.log(fitness);
      generation.push([fitness,network]);
    }
  } else {
    var bestWeights = [];
    for(var i = 0; i<best.length; i++) {
      var neurons = best[i].neurons();
      for(var n = 0; n<neurons.length; n++) {
        var neuron = neurons[n].neuron;
        var connections = neuron.connections.projected;
        for (var key in connections) {
          var connection = connections[key];
          bestWeights.push(connection.weight);
        }
      }
      var fitness = Math.abs(best[i].activate([1,0,1])-0.5);
      console.log(fitness);
      generation.push([fitness,best[i]]);
    }
    for (var i = 0; i<population-best.length; i++) {
      var network = createNewNetwork(3,6,1);
      var neurons = network.neurons();
      for(var n = 0; n<neurons.length; n++) {
        var neuron = neurons[n].neuron;
        var connections = neuron.connections.projected;
        for (var key in connections) {
          var connection = connections[key];
          var chance = parseInt(Math.random()*2);
          if(chance == 0) {
            connection.weight = Math.random() * .2 - .1;
          } else {
            var weightID = parseInt(Math.random()*bestWeights.length);
            connection.weight = bestWeights[weightID];
          }
        }
      }
      //network.optimized.reset();
      var fitness = Math.abs(network.activate([1,0,1])-1);
      generation.push([fitness,network]);
      console.log(fitness);
    }
  }
  generation.sort();
  console.log("Best Fitness out of Generation " + generations + ": " + generation[0][0]);
  genLog.push([generation[0][0],generations])
  return generation;
}

function selectBest(generation, amount){
  generation.sort();
  var best = [];
  for (var i = 0; i<amount; i++){
    best.push(generation[i][1]);
  }
  return best;
}

function createNewNetwork(l1,l2,l3) {
  var inputLayer = new Layer(l1);
  var hiddenLayer = new Layer(l2);
  var outputLayer = new Layer(l3);
  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);
  var network = new Network ({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
  });
  return network;
}
