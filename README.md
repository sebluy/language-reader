# Language Reader

Language Reader is an application to assist learning a language by reading and listening to native content.

Language Reader allows you to:
- Translate a foreign language text (book, song, etc) into one's native language.
- Practice vocabulary from a text with word matching exercises.
- Practice listening with word unscramble exercises.

You can preview the application here: https://sebluy.github.io/language-reader/

Hotkeys:
- tab: move to the next word
- p: play the audio
- r: rewind the audio
- m: mark the audio

# Marking the Audio

Marking the audio is a process where one can divide the audio track of a text into sentences for use in the "unscramble" exercises. To mark the audio:
- Navigate to the reader.
- Set the audio track to the start of the text.
- Press "m". The audio will start playing, and you should see the current sentence highlighted.
- Press "m" again before the start of the next sentence.
- Continue until the text is complete.

# Technical Details

Language Reader uses IndexedDB to store the text, audio, words, and sentences. There is no backend server so if you want to move or backup your data, you need to export and import the database. 