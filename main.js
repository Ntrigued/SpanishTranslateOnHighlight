(async () => {
    console.log("starting script");
    const utils_src = chrome.runtime.getURL('library/utils.js');
    const utils = await import(utils_src);

    const openai_src = chrome.runtime.getURL('library/openai.js');
    const openai_lib = await import(openai_src);

    const view_src = chrome.runtime.getURL('library/view.js');
    view = await import(view_src);

    const openai = await openai_lib.construct_OpenAI();

    const translate_and_view_debounced = utils.debounce(async (selected_text) => {
        view.display_text("Loading translation...");
        console.clear();
        const translation_info = await openai.translate_if_spanish(selected_text);
        if (translation_info !== null && document.getElementById("SpanishTranslateOnHighlight_outer_translation_div")) {
            // Don't display translation info if it doesn't exist or the modal has been removed since sending requests
            view.display_translation_info(translation_info, openai);
        } else {
            console.debug("Highlighted text is not recognized as Spanish: " + selected_text);
            view.display_text("Highlighted text was not recognized as Spanish");
        }
    });

    let previous_selected_text = "";
    document.addEventListener("selectionchange", (e) => {
        // Chrome fires selectionchange when we add the translation divs,
        // so verify something has actually changed before updating anything
        const selected_text = document.getSelection().toString();
        if(selected_text === previous_selected_text) return;
        previous_selected_text = selected_text;

        try {
            const selected_text = document.getSelection().toString();
            if(selected_text.trim() !== "") {
                const text_length = selected_text.trim().length;
                if(text_length > 250) {
                    const overflow_amount = text_length - 250;
                    const length_msg = "Highlighted text is too long for translation. It is " + overflow_amount.toString() + 
                    " characters more than the maximum of 250 characters.";
                    console.log(length_msg);
                    view.display_text(length_msg);
                } else {
                    translate_and_view_debounced(selected_text);
                }
            } else {
                console.debug("removing modal becuase selected text is blank");
                view.remove_modal();
            }
        } catch(e) {
            console.error("An error occurred: ", {e});
            view.remove_modal();
        }
    });
    document.addEventListener("keydown", (e) => {
        const modal_div = document.getElementById('SpanishTranslateOnHighlight_outer_translation_div');
        console.log("modal: ", modal_div, e.key);
        if(modal_div) {
            if(e.key == 'Escape') {
                console.debug("Removing modal becauase of Escape keydown");
                view.remove_modal();
            } else if(e.key == 'Tab') {
                const spanish_div = document.getElementById("SpanishTranslateOnHighlight_spanish_translation_info");
                const english_div = document.getElementById("SpanishTranslateOnHighlight_english_translation_info");
                const english_selector = document.getElementById("SpanishTranslateOnHighlight_english_selector_div");
                const spanish_selector = document.getElementById("SpanishTranslateOnHighlight_spanish_selector_div");
                console.log("english div: ", english_div);
                console.log("spanish_div: ", spanish_div);
                if(spanish_div && spanish_div.style.display == "flex") {
                    english_selector.style.backgroundColor = "lightgray";
                    spanish_selector.style.backgroundColor = "white";
                    english_div.style.display = "flex";
                    spanish_div.style.display = "none";
                    e.preventDefault();
                } else if(english_div && english_div.style.display == "flex") {
                    english_selector.style.backgroundColor = "white";
                    spanish_selector.style.backgroundColor = "lightgray";
                    english_div.style.display = "none";
                    spanish_div.style.display = "flex";
                    e.preventDefault();
                }
            }
        }
    });
})()

