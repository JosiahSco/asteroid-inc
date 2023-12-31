import * as Tone from 'tone'


let synth;
let bassline;
let melodySynth;
let melody;

export function playMusic() {
    if (Tone.Transport.state !== 'started') {
        
    synth = new Tone.Synth({
        oscillator: {
            type: 'sine', // Adjust the oscillator type for the desired bass tone
        },
        envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.2,
        },
        }).toDestination();
        
        synth.volume.value = -18;
    
        const basslineSequence = ['A2', 'A2', 'A2', 'A2', 'C2', 'C2', 'E2', 'E2']
        
        bassline = new Tone.Sequence(
        (time, note) => {
            synth.triggerAttackRelease(note, '4n', time);
        },
        basslineSequence,
        '4n'
        );
    
        const melodySynth = new Tone.Synth({
        oscillator: {
            type: 'triangle', 
        },
        envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.2,
        },
        }).toDestination();
        
        melodySynth.volume.value = -28; 
        
        const melodySequence = ['A3', 'A3', 'G3', 'A3', 'D3', 'A3', 'G3', 'A3'];
        
        melody = new Tone.Sequence(
        (time, note) => {
            melodySynth.triggerAttackRelease(note, '8n', time);
        },
        melodySequence,
        '8n'
        );

      Tone.Transport.loop = true;
      Tone.Transport.loopEnd = '2m'; // Adjust as needed
      
      // Start the transport and the bassline sequence
      Tone.Transport.start();
      bassline.start(0);
      melody.start(0);
    }
}

export function stopMusic() {

    if (synth) {
        synth.dispose();
    }
    if (bassline) {
        bassline.dispose();
    }
    if (melodySynth) {
        melodySynth.dispose();
    }
    if (melody) {
        melody.dispose();
    }

    Tone.Transport.stop();

    synth = null;
    bassline = null;
    melodySynth = null;
    melody = null;
}

