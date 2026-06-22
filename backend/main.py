from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import whisper
import os
import aiofiles
import tensorflow as tf
import librosa
import numpy as np
import edge_tts
from deep_translator import GoogleTranslator
from uuid import uuid4 
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


os.makedirs("audio_output", exist_ok=True)
app.mount("/audio_output", StaticFiles(directory="audio_output"), name="audio_output")


print("Loading Whisper Model...")
whisper_model = whisper.load_model("base")

print("Loading Emotion CNN-BiLSTM Model...")
try:
    emotion_model = tf.keras.models.load_model("weights/emotion_cnn_bilstm.keras")
    EMOTION_LABELS = ['Happy', 'Sad', 'Angry', 'Neutral']
    print("Models Loaded Successfully!")
except Exception as e:
    print(f"⚠️ Emotion model not found. Ensure it is in the 'weights' folder. Error: {e}")


def extract_mfcc(file_path):
    y, sr = librosa.load(file_path, sr=22050)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T
    if mfccs.shape[0] > 100: mfccs = mfccs[:100, :]
    else: mfccs = np.pad(mfccs, ((0, 100 - mfccs.shape[0]), (0, 0)), mode='constant')
    return np.expand_dims(mfccs, axis=0)


VOICE_MAP = {
    "en": "en-US-AriaNeural",      
    "es": "es-ES-AlvaroNeural",   
    "fr": "fr-FR-DeniseNeural",    
    "hi": "hi-IN-MadhurNeural",    
    "de": "de-DE-KillianNeural"   
}


@app.post("/api/process")
async def process_interaction(
    mode: str = Form(...),           
    target_lang: str = Form("en"),   
    text_input: str = Form(""),       
    file: UploadFile = File(None)    
):
    try:
        source_text = ""
        emotion = "N/A"
        confidence = 0.0

        if mode in ["s2t", "s2s"]:
           
            if not file: return {"status": "error", "message": "No audio file provided"}
            
            temp_in = f"temp_{file.filename}"
            async with aiofiles.open(temp_in, 'wb') as out_file:
                await out_file.write(await file.read())

 
            source_text = whisper_model.transcribe(temp_in)["text"].strip()
            
            try:
                preds = emotion_model.predict(extract_mfcc(temp_in))
                idx = np.argmax(preds[0])
                emotion = EMOTION_LABELS[idx]
                confidence = float(preds[0][idx]) * 100
            except:
                pass 
                
            os.remove(temp_in)
            
        elif mode in ["t2t", "t2s"]:
            source_text = text_input


        
        translated_text = source_text
        if target_lang != "en":
            print(f"Translating to {target_lang}...")
            translator = GoogleTranslator(source='auto', target=target_lang)
            translated_text = translator.translate(source_text)


    
        audio_url = None
        if mode in ["t2s", "s2s"]:
            print(f"Generating Voice Output for text: '{translated_text}'")
            
            if not translated_text.strip():
                print("⚠️ Warning: Text is empty, skipping voice generation.")
            else:
                voice = VOICE_MAP.get(target_lang, "en-US-AriaNeural")
                output_filename = f"{uuid4()}.mp3"
                output_filepath = os.path.join("audio_output", output_filename)
                
                try:
                   
                    command = f'edge-tts --voice "{voice}" --text """{translated_text}""" --write-media "{output_filepath}"'
                    subprocess.run(command, shell=True, check=True)
                    
                  
                    if os.path.getsize(output_filepath) > 0:
                        audio_url = f"http://localhost:8000/audio_output/{output_filename}"
                        print("✅ Audio generated successfully!")
                    else:
                        print("❌ Error: Audio file is 0KB.")
                        
                except Exception as e:
                    print(f"❌ Edge-TTS Error: {str(e)}")

     
        return {
            "status": "success",
            "mode": mode,
            "original_text": source_text,
            "translated_text": translated_text,
            "emotion": emotion,
            "confidence": round(confidence, 1),
            "audio_url": audio_url 
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)