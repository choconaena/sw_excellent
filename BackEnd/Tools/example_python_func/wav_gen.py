import pyttsx3
import wave
import pyaudio
import tempfile

def text_to_speech_to_wav(text, output_filename):
    # Initialize the text-to-speech engine
    engine = pyttsx3.init()
    
    # Save the audio to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
        temp_filename = temp_audio_file.name
    
    engine.save_to_file(text, temp_filename)
    engine.runAndWait()

    # Read the temporary audio file and write it to the desired .wav file
    with wave.open(temp_filename, 'rb') as temp_wave_file:
        params = temp_wave_file.getparams()
        frames = temp_wave_file.readframes(params.nframes)

    with wave.open(output_filename, 'wb') as output_wave_file:
        output_wave_file.setparams(params)
        output_wave_file.writeframes(frames)

    print(f"Saved '{text}' to '{output_filename}'")

# Specify the text and the output file
text = "안녕 나는 어제 병원에 다녀왔는데 무릎이 너무 쑤셔 그래서 오늘은 좀 일찍 자야겠어"

output_file = "output.wav"

# Convert the text to speech and save as .wav
text_to_speech_to_wav(text, output_file)