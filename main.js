(async () => {
    const dev_logger_src = chrome.runtime.getURL('library/dev_logger.js');
    const dev_logger = await import(dev_logger_src);
    dev_logger.debug("starting script");

    const utils_src = chrome.runtime.getURL('library/utils.js');
    const utils = await import(utils_src);

    const openai_src = chrome.runtime.getURL('library/openai.js');
    const openai_lib = await import(openai_src);

    const view_src = chrome.runtime.getURL('library/view.js');
    view = await import(view_src);

    const openai = await openai_lib.construct_OpenAI();

    const translate_and_view_debounced = utils.debounce(async (selected_text) => {
        const text_length = selected_text.trim().length;
        if(text_length > 250) {
            const overflow_amount = text_length - 250;
            const length_msg = "Highlighted text is too long for translation. It is " + overflow_amount.toString() + 
            " characters more than the maximum of 250 characters.";
            dev_logger.log(length_msg);
            view.display_text(length_msg);
            return;
        }

        view.display_text("Loading translation...");
        dev_logger.clear();
        const translation_info = await openai.translate_if_spanish(selected_text);
        // Don't display translation info if it doesn't exist or the modal has been removed since sending requests
        if (translation_info !== null && document.getElementById("SpanishTranslateOnHighlight_outer_translation_div")) {
            dev_logger.info("displaying translation info");
            view.display_translation_info(translation_info, openai);
        } else {
            dev_logger.debug("Highlighted text is not recognized as Spanish: " + selected_text);
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
                translate_and_view_debounced(selected_text);
            } else {
                dev_logger.debug("removing modal becuase selected text is blank");
                view.remove_modal();
            }
        } catch(e) {
            dev_logger.error("An error occurred: ", {e});
            view.remove_modal();
        }
    });
    document.addEventListener("keydown", (e) => {
        const modal_div = document.getElementById('SpanishTranslateOnHighlight_outer_translation_div');
        dev_logger.debug("keydown registered: ", e.key);
        if(modal_div) {
            if(e.key == 'Escape') {
                dev_logger.debug("Removing modal becauase of Escape keydown");
                view.remove_modal();
            } else if(e.key == 'Tab') {
                const spanish_div = document.getElementById("SpanishTranslateOnHighlight_spanish_translation_info");
                const english_div = document.getElementById("SpanishTranslateOnHighlight_english_translation_info");
                const english_selector = document.getElementById("SpanishTranslateOnHighlight_english_selector_div");
                const spanish_selector = document.getElementById("SpanishTranslateOnHighlight_spanish_selector_div");
                if(spanish_selector && english_selector && english_div && spanish_div) {
                    if(spanish_selector.classList.contains("SpanishTranslateOnHighlight_selected_language")) {
                        dev_logger.info("Switching tab from Spanish to English based on Tab keydown");
                        english_selector.classList.add("SpanishTranslateOnHighlight_selected_language");
                        english_div.style.display = "flex";
                        spanish_selector.classList.remove("SpanishTranslateOnHighlight_selected_language");
                        spanish_div.style.display = "none";
                        e.preventDefault();
                    } else if(english_selector.classList.contains("SpanishTranslateOnHighlight_selected_language")) {
                        dev_logger.info("Switching tab from English to Spanish based on Tab keydown");
                        english_selector.classList.remove("SpanishTranslateOnHighlight_selected_language");
                        english_div.style.display = "none";
                        spanish_selector.classList.add("SpanishTranslateOnHighlight_selected_language");
                        spanish_div.style.display = "flex";
                        e.preventDefault();
                    }
                }
            }
        }
    });
})()

