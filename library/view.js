import * as dev_logger from "./dev_logger.js";


function display_content(html_elements) {
    remove_modal();

    const outer_div = document.createElement("div");
    outer_div.id = "SpanishTranslateOnHighlight_outer_translation_div";

    const content_div = document.createElement('div');
    content_div.id = "SpanishTranslateOnHighlight_outer_content_div";

    html_elements.forEach((elem) => {
        content_div.appendChild(elem);
    });

    const controls_div = document.createElement('div');
    controls_div.id = "SpanishTranslateOnHighlight_controls_div";
    const exit_btn = document.createElement('input');
    exit_btn.id = "SpanishTranslateOnHighlight_exit_btn";
    exit_btn.value = 'Close';
    exit_btn.onclick = () => document.getElementById('SpanishTranslateOnHighlight_outer_translation_div').remove();
    controls_div.appendChild(exit_btn);

    outer_div.appendChild(content_div);
    outer_div.appendChild(controls_div);

    document.body.appendChild(outer_div);
}

export function remove_modal() {
    const modal_div = document.getElementById('SpanishTranslateOnHighlight_outer_translation_div');
    if(modal_div !== null) modal_div.remove();
}

export function display_translation_info(translation_info, openai) {
    dev_logger.debug("view.py translation_info: ", translation_info);
    const spanish_text = translation_info['spanish_text'];
    const spanish_phrases = translation_info['phrases'];
    const english_translation = translation_info['translation'];

    const lang_selector_div = document.createElement('div');
    lang_selector_div.id = "SpanishTranslateOnHighlight_lang_selector_div";

    const english_selector = document.createElement('div');
    english_selector.classList.add("SpanishTranslateOnHighlight_language_selector");
    english_selector.classList.add('SpanishTranslateOnHighlight_selected_language');
    english_selector.id = "SpanishTranslateOnHighlight_english_selector_div";
    english_selector.appendChild( document.createTextNode('English') );
    const spanish_selector = document.createElement('div');
    spanish_selector.id = "SpanishTranslateOnHighlight_spanish_selector_div";
    spanish_selector.classList.add("SpanishTranslateOnHighlight_language_selector");
    spanish_selector.appendChild( document.createTextNode('Spanish') );
    english_selector.onclick = () => {
        dev_logger.info("Showing English tab based on English selector click");
        if(english_selector) {
            english_selector.classList.add('SpanishTranslateOnHighlight_selected_language');
        }
        if(spanish_selector) {
            spanish_selector.classList.remove('SpanishTranslateOnHighlight_selected_language');
        }
        document.getElementById("SpanishTranslateOnHighlight_english_translation_info").style.display = "flex";
        document.getElementById("SpanishTranslateOnHighlight_spanish_translation_info").style.display = "none";
    };
    spanish_selector.onclick = () => { 
        dev_logger.info("Showing Spanish tab based on Spanish selector click");
        if(spanish_selector) {
            spanish_selector.classList.add('SpanishTranslateOnHighlight_selected_language');
        }
        if(english_selector) {
            english_selector.classList.remove('SpanishTranslateOnHighlight_selected_language');
        }
        document.getElementById("SpanishTranslateOnHighlight_english_translation_info").style.display = "none";
        document.getElementById("SpanishTranslateOnHighlight_spanish_translation_info").style.display = "flex";
    };

    lang_selector_div.appendChild(english_selector);
    lang_selector_div.appendChild(spanish_selector);

    const english_div = document.createElement('div');
    english_div.classList.add("SpanishTranslateOnHighlight_lang_content");
    english_div.id = "SpanishTranslateOnHighlight_english_translation_info";
    english_div.style.display = "flex";
    english_div.appendChild(document.createTextNode(english_translation));

    const spanish_div = document.createElement("div");
    spanish_div.classList.add("SpanishTranslateOnHighlight_lang_content");
    spanish_div.id = "SpanishTranslateOnHighlight_spanish_translation_info";
    spanish_div.style.display = "none";
    const spanish_text_span = document.createElement("span");
    spanish_phrases.forEach((phrase, i) => {
        phrase = phrase.trim();

        const phrase_span = document.createElement("span");
        phrase_span.classList.add("SpanishTranslateOnHighlight_phrase_span");
        phrase_span.innerText = phrase;
        phrase_span.setAttribute('spanish_text', phrase);
        phrase_span.setAttribute('displayed_lang', 'spanish');
        phrase_span.addEventListener('click', () => {
            phrase_span.style.pointerEvents = "none";
            if(phrase_span.getAttribute('displayed_lang') == 'spanish') {
                phrase_span.setAttribute('displayed_lang', 'english');
                phrase_span.style.textDecoration = "underline red 0.175rem";
                phrase_span.innerText = "...";
                if(!phrase_span.hasAttribute("english_text")) {
                    // await translation
                    openai.translate_phrase_in_context(phrase, spanish_text).then((english_text) => {
                        phrase_span.innerText = english_text;
                        phrase_span.setAttribute('english_text', english_text);
                        phrase_span.style.pointerEvents = "";
                    });
                } else {
                    phrase_span.innerText = phrase_span.getAttribute("english_text");
                    phrase_span.style.pointerEvents = "";
                }
            } else {
                phrase_span.setAttribute('displayed_lang', 'spanish');
                phrase_span.style.textDecoration = "underline blue 0.175rem";
                phrase_span.innerText = phrase_span.getAttribute("spanish_text");
                phrase_span.style.pointerEvents = "";
            }
        });
        spanish_text_span.appendChild(phrase_span);
        const space_span = document.createElement("span");
        space_span.appendChild(document.createTextNode(" "));
        spanish_text_span.appendChild(space_span);
    });
    spanish_div.appendChild(spanish_text_span);

    display_content([lang_selector_div, english_div, spanish_div]);
}

export function display_text(text) {
    const text_div = document.createElement('div');
    text_div.classList.add("SpanishTranslateOnHighlight_text_div");
    text_div.appendChild(document.createTextNode(text));
    display_content([text_div]);
}