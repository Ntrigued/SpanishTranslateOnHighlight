(async () => {
    console.log("starting script");
    const utils_src = chrome.extension.getURL('library/utils.js');
    const utils = await import(utils_src);

    const openai_src = chrome.extension.getURL('library/openai.js');
    const openai_lib = await import(openai_src);

    const view_src = chrome.extension.getURL('library/view.js');
    view = await import(view_src);

    const openai = await openai_lib.construct_OpenAI();

    const debounced_func = utils.debounce(async () => {
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
                view.display_text("Loading translation...");
                console.clear();
                const translation_info = await openai.translate_if_spanish(selected_text);
                if (translation_info !== null) {
                    view.display_translation_info(selected_text, translation_info['translations'][0]);
                } else {
                    console.log("Highlighted text is not recognized as Spanish: " + selected_text);
                }
            }
        }
    });

    let previous_selected_text = "";
    document.addEventListener("selectionchange", () => {
        // Chrome fires selectionchange when we add the translation divs,
        // so verify something has actually changed before updating anything
        const selected_text = document.getSelection().toString();
        if(selected_text === previous_selected_text) return;
        previous_selected_text = selected_text;

        const maybe_old_div = document.getElementById('SpanishTranslateOnHighlight_outer_translation_div');
        if(maybe_old_div !== null) {
            maybe_old_div.remove();
        }
    
        debounced_func();
    });
})()

