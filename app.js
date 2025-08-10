document.addEventListener('DOMContentLoaded', () => {
    // Check which page is currently loaded
    if (document.querySelector('#analyze-btn')) {
        initMainPage();
    } else if (document.querySelector('#result-content')) {
        initResultPage();
    }
});

let mediaRecorder;
let audioChunks = [];
let recordedAudio = null;
let uploadedAudio = null;

function initMainPage() {
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    const audioUpload = document.getElementById('audio-upload');
    const analyzeBtn = document.getElementById('analyze-btn');

    let isRecording = false;

    recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                isRecording = true;
                
                recordBtn.textContent = 'Stop Recording';
                recordBtn.style.backgroundColor = '#e76f51';
                recordingStatus.textContent = 'Recording...';
                audioChunks = [];
                analyzeBtn.disabled = true;
                audioUpload.disabled = true;

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    recordedAudio = audioBlob;
                    uploadedAudio = null; // Clear uploaded file
                    analyzeBtn.disabled = false;
                });
            } catch (err) {
                console.error('Error accessing microphone:', err);
                recordingStatus.textContent = 'Microphone access denied.';
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.textContent = 'Record Audio';
            recordBtn.style.backgroundColor = '#2a9d8f';
            recordingStatus.textContent = 'Recording finished.';
            audioUpload.disabled = false;
        }
    });

    audioUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            uploadedAudio = event.target.files[0];
            recordedAudio = null; // Clear recorded audio
            analyzeBtn.disabled = false;
            recordBtn.disabled = true;
        } else {
            uploadedAudio = null;
            analyzeBtn.disabled = true;
            recordBtn.disabled = false;
        }
    });

    analyzeBtn.addEventListener('click', () => {
        // Simulate analysis and store mock data
        const mockResult = {
            birdName: "European Robin",
            interpretability: "The model detected a high-pitched, warbling song with a frequency range of 2-4 kHz. The cadence and melodic structure strongly match the signature call of the European Robin, especially the rapid succession of notes in the middle of the recording.",
            information: "The European Robin (Erithacus rubecula) is a small insectivorous passerine bird. It is plump with bright orange-red breast and face, olive-brown upperparts, and a whitish belly. Robins are known for their beautiful and complex songs, often heard throughout the year.",
            audioFileName: uploadedAudio ? uploadedAudio.name : 'live_recording.wav'
        };

        localStorage.setItem('birdAnalysisResult', JSON.stringify(mockResult));
        
        // Redirect to the result page
        window.location.href = 'result.html';
    });
}

function initResultPage() {
    const resultContent = document.getElementById('result-content');
    const backBtn = document.getElementById('back-btn');
    
    const resultData = JSON.parse(localStorage.getItem('birdAnalysisResult'));

    if (resultData) {
        resultContent.innerHTML = `
            <h2>${resultData.birdName}</h2>
            <p><em>Based on analysis of: ${resultData.audioFileName}</em></p>
            
            <h3>Why this bird?</h3>
            <p>${resultData.interpretability}</p>
            
            <h3>About the ${resultData.birdName}</h3>
            <p>${resultData.information}</p>
        `;
    } else {
        resultContent.innerHTML = '<p>No analysis data found. Please go back and analyze a sound.</p>';
    }

    backBtn.addEventListener('click', () => {
        localStorage.removeItem('birdAnalysisResult');
        window.location.href = 'index.html';
    });
}
