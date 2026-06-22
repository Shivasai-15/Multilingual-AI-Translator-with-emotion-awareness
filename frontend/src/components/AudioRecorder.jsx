import { useState, useRef } from 'react';

const AudioRecorder = ({ onAudioReady }) => {
    
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);

    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    
    const startRecording = async () => {
        try {
            setError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = []; // Clear old recordings

            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

           
            mediaRecorder.onstop = () => {
                
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                
                if (onAudioReady) {
                    onAudioReady(audioBlob);
                }

                
                stream.getTracks().forEach(track => track.stop());
            };

            
            mediaRecorder.start();
            setIsRecording(true);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check your permissions.");
        }
    };

    
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3>🎤 Voice Input</h3>
            
            {error && <p style={styles.errorText}>{error}</p>}

            <div style={styles.buttonGroup}>
                {!isRecording ? (
                    <button onClick={startRecording} style={styles.recordButton}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} style={styles.stopButton}>
                        ⏹ Stop Recording...
                    </button>
                )}
            </div>

            {}
            {audioUrl && (
                <div style={styles.playbackContainer}>
                    <p>Playback:</p>
                    <audio src={audioUrl} controls />
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: '20px auto',
        textAlign: 'center',
        fontFamily: 'sans-serif'
    },
    buttonGroup: {
        margin: '15px 0',
    },
    recordButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    stopButton: {
        backgroundColor: '#f44336',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        animation: 'pulse 1.5s infinite' 
    },
    playbackContainer: {
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
    },
    errorText: {
        color: 'red',
        fontSize: '14px'
    }
};

export default AudioRecorder;