"use strict";

//Implement Synaptic
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

//Create Network
var inputLayer = new Layer(2);
var hiddenLayer = new Layer(5);
var outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

var myNetwork = new Network ({
  input: inputLayer,
  hidden: [hiddenLayer],
  output: outputLayer
});

//create Trainer
var trainer = new Trainer (myNetwork);

//Register Buttons
$(document).ready( function() {

  activateWithInput()

  $('#activate').mousedown(function() {
    activateWithInput()
  });

  $('#trainingActivate').mousedown(function() {
    trainingActivate();
  });

});

//Network Functions
function activateWithInput () {
  var inputs = getInputs();
  setOutput(myNetwork.activate(inputs));
}

function trainingActivate () {
  var inputs = getTrainingInputs();
  for (var i=0; i<inputs[2]; i++) {
    //myNetwork.activate(inputs[0]);
    //myNetwork.propagate(inputs[3],[inputs[1]]);
    myNetwork.activate([0,1]);
    myNetwork.propagate(inputs[3], [1]);

    myNetwork.activate([1,1]);
    myNetwork.propagate(inputs[3], [0]);

    myNetwork.activate([1,0]);
    myNetwork.propagate(inputs[3], [1]);

    myNetwork.activate([0,0]);
    myNetwork.propagate(inputs[3], [0]);
  }
}


//Functions
function getInputs () {
  var input1 = document.getElementById('input1').value;
  var input2 = document.getElementById('input2').value;
  return [input1, input2];
}

function getTrainingInputs () {
  var input1 = document.getElementById('trainingInput1').value;
  var input2 = document.getElementById('trainingInput2').value;
  var output = document.getElementById('trainingOutput').value;
  var amount = document.getElementById('trainingAmount').value;
  var learningRate = document.getElementById('trainingLearningRate').value;
  return [[input1, input2],output,amount,learningRate];
}

function setOutput (output) {
  document.getElementById('output').innerHTML = output;
}

function sortNumber(a,b) {
  return b[0] - a[0];
}
