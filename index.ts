import { Hono } from "hono";
import { cors } from 'hono/cors'
import axios from 'axios';
import { env } from 'hono/adapter'
import OpenAI from 'openai'
import { HfInference } from "@huggingface/inference";




type Environment = {
    OPENAI_API_KEY: string
    HUGGING_FACE_API_KEY: string
    ELEVENLABS_API_KEY: string
}


const app = new Hono()



app.use(cors())
const languages = [
    { name: "Arabic", val: "ar" },
    { name: "Bulgarian", val: "bg" },
    { name: "Catalan", val: "ca" },
    { name: "Chinese", val: "zh-CN" },
    { name: "Czech", val: "cs" },
    { name: "Danish", val: "da" },
    { name: "Dutch", val: "nl" },
    { name: "English", val: "en" },
    { name: "French", val: "fr" },
    { name: "German", val: "de" },
    { name: "Greek", val: "el" },
    { name: "Hebrew", val: "iw" },
    { name: "Hindi", val: "hi" },
    { name: "Hungarian", val: "hi" },
    { name: "Icelandic", val: "is" },
    { name: "Indonesian", val: "id" },
    { name: "Italian", val: "it" },
    { name: "Japanese", val: "ja" },
    { name: "Korean", val: "ko" },
    { name: "Kannada", val: "kn" },
    { name: "Latvian", val: "lv" },
    { name: "Marathi", val: "mr" },
    { name: "Norwegian", val: "no" },
    { name: "Polish", val: "pl" },
    { name: "Portuguese", val: "pt-PT" },
    { name: "Romanian", val: "ro" },
    { name: "Russian", val: "ru" },
    { name: "Slovak", val: "sk" },
    { name: "Swedish", val: "sv" },
    { name: "Swahili", val: "sw" },
    { name: "Spanish", val: "es" },
    { name: "Slovenian", val: "sl" },
    { name: "Turkish", val: "tr" },
    { name: "Ukrainian", val: "uk" },
    { name: "Vietnamese", val: "vi" },
    { name: "Tamil", val: "ta" },
    { name: "Telugu", val: "te" },
    { name: "Thai", val: "th" },
    { name: "Urdu", val: "ur" },
    { name: "Welsh", val: "cy" }
];




// Create a new HuggingFace Inference instance









app.get("/", async (c) => {
    return c.json({ message: "lol" })
})


app.post("/", async (c) => {
    if (c.req.header("Content-Type") !== "application/json") {
        return c.json({ error: "JSON body excepted" }, { status: 406 })
    }
    try {



        const { url ,lang} = await c.req.json() as { url: string, lang: string }
    

        const { HUGGING_FACE_API_KEY, OPENAI_API_KEY } = env<Environment>(c)


        const Hf = new HfInference(HUGGING_FACE_API_KEY);
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        })

        console.log(url, "lo")


        if (!url) {
            return c.json({ error: "Url argument is required." }, { status: 400 })
        }
        if (!lang) {
            return c.json({ error: "Language argument is required." }, { status: 400 })
        }
        let language = languages.filter(l => l.val === lang)[0].name
        if (!language) {
            return c.json({ error: "Please select another language" }, { status: 400 })
        }
        const response = await fetch(url);
        const blob = await response.blob();


        const aiResponse = await Hf.automaticSpeechRecognition({
            model: "openai/whisper-large-v3",
            data: blob
        })

        console.log(aiResponse.text)


        const translateResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            stream: false,
            messages: [
                {
                    "role": "system",
                    "content": `
                  You will be provided with a sentence. Your tasks are to:
                  - Translate the sentence into ${language}
                  Do not return anything other than the translated sentence.
                `
                },
                {
                    "role": "user",
                    "content": aiResponse.text
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
        });


        console.log(translateResponse.choices[0].message.content)

        const file = await openai.audio.speech.create({
            model: "tts-1",
            input: translateResponse.choices[0].message.content || "",
            voice: "alloy",
            response_format: "mp3",
            speed: 0.95,



        })

        const responseBlob = await file.blob()
        console.log(responseBlob)
        const formData = new FormData();
        const mp3File = new File([responseBlob], "audio.mp3", { type: "audio/mp3" });
        formData.append("file", mp3File, "audio.mp3");
        const responsetranslateaudio = await fetch("https://translatethechat.vercel.app/api/upload", {
            method: "POST",
            body: formData,
        });


        const audioUrl = await responsetranslateaudio.json();
        console.log(audioUrl)









        return c.json({ url: audioUrl, text: translateResponse.choices[0].message.content })







    } catch (error: any) {
        console.error(error.message)

        return c.json(
            { error: 'Something went wrong.', err: JSON.stringify(error.message) },
            { status: 500 }
        )

    }

})


export default app