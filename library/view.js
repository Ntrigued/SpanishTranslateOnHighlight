function display_content(html_elements) {
    const outer_div = document.createElement("div");
    outer_div.id = "SpanishTranslateOnHighlight_outer_translation_div";
    outer_div.style.zIndex = "999";
    outer_div.style.position = 'fixed';
    outer_div.style.display = "flex";
    outer_div.style.flexDirection = "column";
    outer_div.style.top = "5vh";
    outer_div.style.right = "25vw";
    outer_div.style.width = "50vw";
    outer_div.style.height = "33vh";
    outer_div.style.border = "thin solid";
    outer_div.style.backgroundColor = "white";
    outer_div.style.color = "black";

    const content_div = document.createElement('div');
    content_div.style.display = "flex";
    content_div.style.flexDirection = "column";
    content_div.style.alignItems = "center";
    content_div.style.height = "75%";
    content_div.style.fontSize = "1.25em";

    html_elements.forEach((elem) => {
        content_div.appendChild(elem);
    });

    const controls_div = document.createElement('div');
    controls_div.style.display = "flex";
    controls_div.style.justifyContent = "end";
    controls_div.style.height = "25%";
    const exit_btn = document.createElement('input');
    exit_btn.value = 'Close';
    exit_btn.style.fontSize = "1.25em";
    exit_btn.style.backgroundColor = "#ff595e";
    exit_btn.style.border = "0";
    exit_btn.style.borderRadius = "0";
    exit_btn.style.margin = "0";
    exit_btn.style.cursor = "pointer";
    exit_btn.style.textAlign = "center";
    exit_btn.style.width = "100%";
    exit_btn.onclick = () => document.getElementById('SpanishTranslateOnHighlight_outer_translation_div').remove();
    controls_div.appendChild(exit_btn);

    outer_div.appendChild(content_div);
    outer_div.appendChild(controls_div);

    document.body.appendChild(outer_div);

    document.addEventListener("keyup", (e) => {
        if(e.key == 'Escape') {
            document.getElementById('SpanishTranslateOnHighlight_outer_translation_div').remove();
        }
    });
}

export function display_translation_info(spanish_text, english_translation) {
    const lang_selector_div = document.createElement('div');
    lang_selector_div.style.display = "flex";
    lang_selector_div.style.width = "100%";


    const english_selector = document.createElement('div');
    english_selector.appendChild( document.createTextNode('English') );
    const spanish_selector = document.createElement('div');
    spanish_selector.appendChild( document.createTextNode('Spanish') );

    [english_selector, spanish_selector].forEach(elem => {
        elem.style.width = '100%';
        elem.style.textAlign = "center";
        elem.style.border = "solid";
        elem.style.paddingTop = "2.5%";
        elem.style.paddingBottom = "2.5%";
        elem.style.cursor = "pointer";
    });
    

    lang_selector_div.appendChild(english_selector);
    lang_selector_div.appendChild(spanish_selector);

    const english_div = document.createElement('div');
    const english_label = document.createElement("span");
    english_label.style.fontWeight = "bold";
    english_label.textContent = "English: ";
    english_div.appendChild(english_label);
    english_div.appendChild(document.createTextNode(english_translation));

    const spanish_div = document.createElement("div");
    const spanish_label = document.createElement("span");
    spanish_label.style.fontWeight = "bold";
    spanish_label.textContent = "Spanish: ";
    spanish_div.appendChild(spanish_label);
    spanish_div.appendChild(document.createTextNode(spanish_text));

    [english_div, spanish_div].forEach(elem => {
        elem.style.display = "flex";
        elem.style.flexDirection = "column";
        elem.style.justifyContent = "center";    
        elem.style.paddingBottom = "2.5%";
        elem.style.paddingTop = "2.5%";
        elem.style.height = "100%";
        elem.style.width = "100%";    
        elem.style.textAlign = "center";    
        elem.style.paddingLeft = "2.5%";
        elem.style.paddingRight = "2.5%";
        elem.style.overflowY = "scroll";
    });

    spanish_div.style.display = "none";

    display_content([lang_selector_div, english_div, spanish_div]);
}

export function display_text(text) {
    const text_div = document.createElement('div');
    text_div.style.display = "flex";
    text_div.style.flexDirection = "column";
    text_div.style.justifyContent = "center";
    text_div.style.height = "100%";
    text_div.style.width = "100%";
    text_div.style.textAlign = "center";

    text_div.appendChild(document.createTextNode(text));
    display_content([text_div]);
}