import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import apiClient from './services/api';

function App() {
  
  const [mode, setMode] = useState('s2t'); 
  const [targetLang, setTargetLang] = useState('es'); 
  const [textInput, setTextInput] = useState('');
  
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  
  const handleAudioReady = async (audioBlob) => {
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("target_lang", targetLang);
    formData.append("file", audioBlob, "recording.webm");
    
    sendToBackend(formData);
  };

  
  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("target_lang", targetLang);
    formData.append("text_input", textInput);
    
    sendToBackend(formData);
  };

  
  const sendToBackend = async (formData) => {
    setIsProcessing(true);
    setResult(null);

    try {
      
      const response = await apiClient.post('/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Backend Error:", error);
      setResult({ status: "error", message: "Failed to connect to AI server." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <h1 style={styles.title}>Multilingual Translator</h1>
      
      {}
      <div style={styles.controlPanel}>
        <div style={styles.inputGroup}>
          <label><b>Interaction Mode:</b></label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={styles.select}>
            <option value="s2t">🗣️ Speech to Text</option>
            <option value="s2s">🗣️ Speech to Speech</option>
            <option value="t2t">⌨️ Text to Text</option>
            <option value="t2s">⌨️ Text to Speech</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label><b>Target Language:</b></label>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={styles.select}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      {}
      <div style={styles.inputArea}>
        {mode.startsWith('s') ? (
          <AudioRecorder onAudioReady={handleAudioReady} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <textarea 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your English text here..."
              style={styles.textArea}
            />
            <button onClick={handleTextSubmit} style={styles.submitButton}>
              Translate Text
            </button>
          </div>
        )}
      </div>

      {}
      {isProcessing && <p style={styles.loadingText}>⏳ AI is processing your request...</p>}

      {}
      {result && (
        <div style={styles.resultCard}>
          {result.status === 'success' ? (
            <>
              {}
              {mode.startsWith('s') && result.emotion !== "N/A" && (
                <div style={styles.emotionBadge}>
                  🧠 Detected Emotion: {result.emotion} ({result.confidence}%)
                </div>
              )}

              {}
              <div style={styles.textResults}>
                <p><b>Original ({mode.startsWith('s') ? 'Transcribed' : 'Typed'}):</b></p>
                <p style={styles.originalText}>"{result.original_text}"</p>
                
                <p><b>Translation ({targetLang}):</b></p>
                <p style={styles.translatedText}>{result.translated_text}</p>
              </div>

              {}
              {result.audio_url && (
                <div style={styles.audioPlayerContainer}>
                  <p><b>AI Voice Output:</b></p>
                  <audio src={result.audio_url} controls autoPlay style={{ width: '100%' }} />
                </div>
              )}
            </>
          ) : (
             <p style={{ color: 'red' }}><b>Error:</b> {result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    maxWidth: '800px', margin: '0 auto', padding: '40px 20px', 
    fontFamily: 'system-ui, sans-serif', textAlign: 'center'
  },
  title: { color: '#2c3e50', marginBottom: '30px' },
  controlPanel: {
    display: 'flex', justifyContent: 'center', gap: '20px', 
    marginBottom: '30px', backgroundColor: '#f8f9fa', 
    padding: '20px', borderRadius: '10px'
  },
  inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '8px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' },
  inputArea: { marginBottom: '30px' },
  textArea: {
    width: '100%', maxWidth: '500px', height: '100px', padding: '15px',
    borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px',
    fontSize: '16px', resize: 'vertical'
  },
  submitButton: {
    padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white',
    border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer'
  },
  loadingText: { color: '#3498db', fontWeight: 'bold', fontSize: '18px' },
  resultCard: {
    backgroundColor: '#ffffff', border: '1px solid #e0e0e0',
    borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'left', maxWidth: '600px', margin: '0 auto'
  },
  emotionBadge: {
    backgroundColor: '#6c5ce7', color: 'white', padding: '10px 20px',
    borderRadius: '30px', display: 'inline-block', fontWeight: 'bold', marginBottom: '20px'
  },
  textResults: { backgroundColor: '#f1f2f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
  originalText: { fontStyle: 'italic', color: '#555', marginBottom: '15px' },
  translatedText: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', margin: 0 },
  audioPlayerContainer: { marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '8px' }
};

export default App;