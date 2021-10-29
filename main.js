
var audioCtx;
var oscSine;
var oscSquare;
var oscSaw;
var oscTriangle;
var sineGain;
var squareGain;
var sawGain;
var triangleGain; 
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    oscSine = audioCtx.createOscillator();
    oscSine.type = "sine";
    oscSquare = audioCtx.createOscillator();
    oscSquare.type = "square";
    oscSaw = audioCtx.createOscillator();
    oscSaw.type = "sawtooth";
    oscTriangle = audioCtx.createOscillator();
    oscTriangle.type = "triangle";


    sineGain = audioCtx.createGain();
    sineGain.gain.value = 0;
    squareGain = audioCtx.createGain();
    squareGain.gain.value = 0;
    sawGain = audioCtx.createGain();
    sawGain.gain.value = 0;
    triangleGain = audioCtx.createGain();
    triangleGain.gain.value = 0;


    timings = audioCtx.createGain();
    timings.gain.value = 0;

    oscSine.connect(sineGain).connect(timings).connect(audioCtx.destination);
    oscSquare.connect(squareGain).connect(timings).connect(audioCtx.destination);
    oscSaw.connect(sawGain).connect(timings).connect(audioCtx.destination);
    oscTriangle.connect(triangleGain).connect(timings).connect(audioCtx.destination);

    oscSine.start();
    oscSquare.start();
    oscSaw.start();
    oscTriangle.start();
    scheduleAudio()
}

function scheduleAudio() { 
    let timeElapsedSecs = 0;
    liveCodeState.forEach(noteData => {
        let osc;
        let oscGain; 
        let type = noteData["osc"]; //get osc type, turn on/off oscs as needed

        if (type == "sine") {
            osc = oscSine;
            oscGain = sineGain;
        }
        else if (type == "square") {
            osc = oscSquare;
            oscGain = squareGain;
        }
        else if (type == "sawtooth") {
            osc = oscSaw;
            oscGain = sawGain;
        }
        else if (type == "triangle") {

            osc = oscTriangle;
            oscGain = triangleGain; 
        }
        console.log(osc.type, noteData["pitch"]);
        oscGain.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01);
        timings.gain.setTargetAtTime(0.2, audioCtx.currentTime + timeElapsedSecs, 0.01);
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01);
        timeElapsedSecs += noteData["length"] / 10.0;
        oscGain.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01);
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01);
        timeElapsedSecs += 0.2; //rest between notes
    });
    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}


currOsc = "sine"; 

function parseCode(code) {
    //how could we allow for a repeat operation 
    //(e.g. "3@340 2[1@220 2@330]"" plays as "3@340 1@220 2@330 1@220 2@330")
    //how could we allow for two lines that play at the same time?
    //what if we want variables?
    //how does this parsing technique limit us?

    let notes = code.split(" ");

    //notice this will fail if the input is not correct
    //how could you handle this? allow some flexibility in the grammar? fail gracefully?
    //ideally (probably), the music does not stop


    notes = notes.map(note => {
        oscLength_Pitch = note.split("@"); //split into [osc+length, pitch]
        pitch = eval(oscLength_Pitch[1]); //get pitch
        osc_Length = oscLength_Pitch[0].split(">"); //split first element into [osc, length]
        console.log(osc_Length);
        if (osc_Length.length < 2) {//there is no oscType given
            length = eval(oscLength_Pitch[0]);
            oscType = currOsc;  //use prev osc type
        }
        else {
            oscType = osc_Length[0]; //set osc type
            length = eval(osc_Length[1]); //set length
            currOsc = oscType;  //set this to current osc type 
        }
        console.log(oscType, length, pitch);
        return {
            "osc": oscType,
            "length": length, //the 'eval' function allows us to write js code in our live coding language
            "pitch" : pitch};
                //what other things should be controlled? osc type? synthesis technique?
    });
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio();
    }

    reevaluate();


});
