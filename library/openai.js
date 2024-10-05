async function get_valid_key() {
    let OPENAI_API_KEY = await new Promise((resolve, reject) => {
        chrome.storage.local.get("OPENAI_API_KEY", (result) => {
            console.log(result);
            if('OPENAI_API_KEY' in result) resolve(result['OPENAI_API_KEY']);
            else resolve(null);
        });
    });

    if(OPENAI_API_KEY === null) {
        OPENAI_API_KEY = prompt("Enter OPENAI API KEY to enable translation: ");
    }
    while(! await verify_key_works(OPENAI_API_KEY)) {
        OPENAI_API_KEY = prompt("Key failed to authenticate. Enter OPENAI API KEY to enable translation: ");            
    }
    
    await new Promise((resolve, reject) => {
        chrome.storage.local.set({"OPENAI_API_KEY": OPENAI_API_KEY}, () => resolve());
    });

    return OPENAI_API_KEY;
}

async function verify_key_works(key) {
    let resp = await fetch("https://api.openai.com/v1/models",
        {
            headers: {"Authorization": "Bearer " + key}
        }).then((response) => response.json());
    if("error" in resp) return false;
    return true;
}

export async function construct_OpenAI() {
    const key = await get_valid_key();
    return new OpenAI(key);
}

const PROMPTS = {
    IS_THIS_SPANISH: "Respond only \"Y\" or \"N\".\nIs the following written in Spanish?:\n\n",

    PARSE_INTO_PHRASES: "Respond with the parsing of this spanish content into phrases, such that the meaning of each phrase matches the original content. DO NOT PUT ANYTHING ELSE IN YOUR RESPONSE For example, if I send you \"me llamo a la casa roja despues de el partido\", you would responde [me llamo a; la casa roja; despues de; el partido]\n\n",

    EXTRACT_VERBS: "Respond with a list only of verbs in the following spanish content. If there are no verbs, simply respond with \"[]\". Do not have anything else in your response. Ex. ¿Pero ahora el astrobiólogo Milán Cirkovic y sus colegas afirman que han encontrado un error en este razonamiento.? -> [afirman; han; encontrado]\n\n",

    TRANSLATE_PHRASE: "Respond with just a list of translations and nothing else. Ex.: [this is the first translation; this is another translation; this also is a translation]\nWhat are the possible translations of the following Spanish content:\n\n",

    IS_THIS_SPANISH_AND_TRANSLATE_COMBINED: "Respond with just a list of translations and nothing else. Ex.: [this is the first translation; this is another translation; this also is a translation]\nIf the text is not in Spanish, just reply \"N\". Do not put anything besides the \"N\"\nWhat are the possible translations of the following Spanish content:\n\n"
};

export class OpenAI {

    constructor(key) {
        this.chat_url = "https://api.openai.com/v1/chat/completions";
        this.key = key;

        // this.get_translation_info("como se dice");
    }

    parse_message(msg_text) {
        if(msg_text.replace(' ', '') == "[]") return [];

        if(msg_text.length < 3 ||
            msg_text[0] != '[' || msg_text[msg_text.length - 1] != ']' ||
            msg_text.split(';').length == 0)
        {
            let msg_err = new Error();
            msg_err.data = {"error": "message is malformed", "message": msg_text};
            throw msg_err;
        }

        msg_text = msg_text.substr(1, msg_text.length - 2);
        const items = msg_text.split(';');
        for(const item of items) {
            if(item.length == 0) {
                let item_err = new Error();
                item_err.data = {"error": "message is malformed", "message": msg_text};
                throw item_err;
            }
        }

        return items;
    }

    async send_prompt(prompt) {
        const resp = await fetch(this.chat_url, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + this.key,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                    messages: [{
                        role: "user",
                        content: prompt
                    }]
                }),
            }).then((resp) => resp.json());

        if('choices' in resp && resp['choices'].length != 0) {
            if('message' in resp['choices'][0] && 'content' in resp['choices'][0]['message'] &&
                typeof resp['choices'][0]['message']['content'] == typeof "" &&
                 resp['choices'][0]['message']['content'].length > 0) {
                    return resp['choices'][0]['message']['content'];
            }
        }

        if('error' in resp) {
            console.error("There was an error communication with OpenAI: " + resp["error"]);
        } else {
            console.error("There was an error communication with OpenAI: ", resp);
        }
        let e = new Error();
        e.data = resp;
        throw e;
    }

    async is_spanish(text) {
        text = text.trim();
        const msg = await this.send_prompt(PROMPTS.IS_THIS_SPANISH + " " + text);
        if(msg.trim() === 'Y') return true;
        return false;
    }
 
    async get_translation_info(text) {
        const translation_info = {};

        text = text.trim();
        try {
            let phrases_promise = null;
            if(/\s/g.test(text)) {
                //phrases_promise = this.send_prompt(PROMPTS.PARSE_INTO_PHRASES + " " + text);
            } else {
                translation_info['phrases'] = [text];
            }
            let translation_promise = await this.send_prompt(PROMPTS.TRANSLATE_PHRASE + " " + text);
            //let verbs_promise = this.send_prompt(PROMPTS.EXTRACT_VERBS + " " + text);

            translation_info['translations'] = this.parse_message(await translation_promise);
            //if(phrases_promise !== null) translation_info['phrases'] = this.parse_message(await phrases_promise);
            //translation_info['verbs'] = this.parse_message(await verbs_promise);

            console.log("Highlighted phrase: " + text);
            console.log("Translation: " + translation_info['translations'][0]);
            console.log("All  Translations: " + translation_info['translations']);
            //console.log('phrases', translation_info['phrases']);
            //console.log('verbs: ', translation_info['verbs']); 

            return translation_info;
        } catch(e) {
            if(!('data' in e)) e.data = null;
            console.error(e, e.data);

            throw e;
        }
    }

    async translate_if_spanish(text) {
        try {
            text = text.trim();

            const msg = await this.send_prompt(PROMPTS.IS_THIS_SPANISH_AND_TRANSLATE_COMBINED + " " + text);
            if(msg.trim() === 'N') return null;
            const translation_info = {'translations':  this.parse_message(msg)};

            let phrases_promise = null;
            if(/\s/g.test(text)) {
                phrases_promise = this.send_prompt(PROMPTS.PARSE_INTO_PHRASES + " " + text);
            } else {
                translation_info['phrases'] = [text];
            }
            //let translation_promise = await this.send_prompt(PROMPTS.TRANSLATE_PHRASE + " " + text);
            let verbs_promise = this.send_prompt(PROMPTS.EXTRACT_VERBS + " " + text);

            //translation_info['translations'] = this.parse_message(await translation_promise);
            if(phrases_promise !== null) translation_info['phrases'] = this.parse_message(await phrases_promise);
            translation_info['verbs'] = this.parse_message(await verbs_promise);

            console.log("Highlighted phrase: " + text);
            console.log("Translation: " + translation_info['translations'][0]);
            console.log("All  Translations: " + translation_info['translations']);
            console.log('phrases', translation_info['phrases']);
            console.log('verbs: ', translation_info['verbs']); 

            return translation_info;
        } catch(e) {
            if(!('data' in e)) e.data = null;
            console.error(e, e.data);

            throw e;
        }
    }
}