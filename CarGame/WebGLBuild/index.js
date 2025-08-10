let audioContext;
let recognizerProcessor;
let isRecording = false;

window.VoiceResult = "";

async function init() {
    const resultsContainer = document.getElementById('recognition-result');
    const partialContainer = document.getElementById('partial');

    partialContainer.textContent = "Loading...";
    
    const channel = new MessageChannel();
    const model = await Vosk.createModel('vosk-model-small-tr-0.3.tar.gz');
    model.registerPort(channel.port1);

    const sampleRate = 48000;
    
    const recognizer = new model.KaldiRecognizer(sampleRate);
    recognizer.setWords(true);

    recognizer.on("result", (message) => {
        const result = message.result;
        // console.log(JSON.stringify(result, null, 2));
        console.log(`Result: ${message.result.text}`);

        VoiceResult = `${message.result.text}`;
        
        const newSpan = document.createElement('span');
        newSpan.textContent = `${result.text} `;
        resultsContainer.insertBefore(newSpan, partialContainer);
    });
    recognizer.on("partialresult", (message) => {
        const partial = message.result.partial;

        partialContainer.textContent = partial;

        console.log(`Partial result: ${message.result.partial}`);
    });
    
    partialContainer.textContent = "Ready";
    
    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate
        },
    });
    
    audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('recognizer-processor.js')
    recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 });
    recognizerProcessor.port.postMessage({action: 'init', recognizerId: recognizer.id}, [ channel.port2 ])
    recognizerProcessor.connect(audioContext.destination);
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(recognizerProcessor);
}

window.onload = () => {
    const trigger = document.getElementById('trigger');
    trigger.onmouseup = () => {
        // trigger.disabled = true;
        init();
    };

    init();
}


window.addEventListener('keydown', async (e) => {
    if (e.code === 'Space') {
        // Mikrofonu aç

        if (!isRecording)
        {
            audioContext.resume();
            // console.log('Mikrofon açıldı');
            
            // Worklet'e durumu bildir
            if (recognizerProcessor)
                recognizerProcessor.port.postMessage({ command: 'resume' });

                isRecording = true;
        }
    }
});
  
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        audioContext.suspend();
        console.log('Mikrofon kapatıldı');

      if (recognizerProcessor)
        recognizerProcessor.port.postMessage({ command: 'pause' });

        isRecording = false;

        VoiceResult = "";
    }
});