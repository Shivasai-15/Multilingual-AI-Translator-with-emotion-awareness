# Multilingual Emotion AI Platform

A full-stack, multi-modal AI application that combines Speech-to-Text translation, Natural Language Processing, and Advanced Audio Emotion Recognition. Users can communicate via text or voice, track emotional intent across speech timelines, translate communications into multiple global languages dynamically, and receive natural voice synthesis output.

---

## 🚀 System Architecture Overview

The platform uses a decoupled client-server architecture built to process audio and textual streams seamlessly across four core interaction modes:
* **Speech-to-Speech (S2S):** Audio Input ➔ Transcription & Emotion Analysis ➔ Translation ➔ Audio Synthesis Output.
* **Speech-to-Text (S2T):** Audio Input ➔ Transcription & Emotion Analysis ➔ Translated Text Output.
* **Text-to-Speech (T2S):** Typed Input ➔ Translation ➔ Audio Synthesis Output.
* **Text-to-Text (T2T):** Typed Input ➔ Translated Text Output.
---

## 🧠 AI Pipeline & Core Technologies

### Frontend UI (React & Vite)
* **React.js (Functional Components + Hooks):** Manages multi-modal states, structural UI rendering, and asynchronous network dispatches.
* **Web Audio API:** Captures high-fidelity local microphone input and isolates the data stream as raw binary large objects (`Blobs`).
* **Axios:** Transmits multi-part form data containing audio buffers across local ports to the server.

### Backend Infrastructure (FastAPI & Uvicorn)
* **FastAPI:** High-performance ASGI web framework running structured request routers, payload processing, and static audio distribution hooks.
* **Whisper AI (OpenAI):** Robust sequence-to-sequence neural network handling heavy computational transcription tasks.

### Hybrid Audio Analytics (CNN-BiLSTM)
* **Librosa Feature Extraction:** Digitizes incoming waveforms into 40 Mel-Frequency Cepstral Coefficients (MFCCs) to model the audio spectrum over 100 explicit timeframes.
* **1D Convolutional Neural Network (CNN):** Processes spatial frequencies to identify emotional vocal textures (pitch variations, structural dynamics).
* **Bidirectional LSTM (Long Short-Term Memory):** Evaluates sequential time context across forwards and backwards data loops to analyze emotional cadence and vocal delivery over time.
### Language Processing & Vocal Synthesis
* **Deep Translator Engine:** Free-tier programmatic abstraction routing translated structures across target languages (`EN`, `ES`, `FR`, `DE`, `HI`).
* **Edge-TTS (Microsoft Azure Neural Voices):** Generates hyper-realistic synthesized voices mapped perfectly to regional dialects.

---

## 🛠️ Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js v18+
* FFmpeg installed and mapped to your system's environment variables (required for audio rendering).

### 1. Backend Configuration
Navigate to the server directory, isolate your dependencies inside a virtual environment, and initiate your setups:

```bash
cd backend
python -m venv myvenv

# Activate Virtual Environment (Windows PowerShell)
.\myvenv\Scripts\Activate

# Install Dependencies
pip install -r requirements.txt

# Start the FastAPI Server
python main.py