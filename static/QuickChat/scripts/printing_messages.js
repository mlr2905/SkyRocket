function message_sorting() {
    for (let i = 0; i < mainPage.size_array.length; i++) {//Sorting my messages from all messages
        mainPage.son = document.createElement('div')
        let id = mainPage.size_array[i].id

        mainPage.type_class = mainPage.size_array[i].user === mainPage.name ? "right" : "-";
        mainPage.img = mainPage.size_array[i].user === mainPage.name ? mainPage.img_user : "image/bot.png";
        mainPage.user_or_Another_user = mainPage.size_array[i].user === mainPage.name ? "user" : "Another-user";
        if (mainPage.img === " ") {
            mainPage.img = "image/man.png"
        }

        switch (mainPage.size_array[i].type) {
            case "text": text_message(i, id);
                break;
            case "img": image_Message(i, id);
                break;
            case "link": link_message(i, id);
                break;
            case "tube": youtube_message(i, id);
                break;
            case "face": runfacebookScript(), facebook_message(i, id);
                break;
            case "tiktok": runTikTokScript(), tiktok_message(i, id);
                break;
        }
    }
    let scroll_to_bottom = document.getElementById('box-body');
    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
}

function isLink_img(text) { //Tester with boosted in picture message
    return text.includes(".gif") || text.includes(".png") ||
        text.includes(".jpg") || text.includes(".svg") || text.includes(".jpeg");
}

function link_type() {//Checks if it is a link message and what type
    mainPage.new_time = time_new()
    let img_or_no = isLink_img(mainPage.new_text) || mainPage.new_text.includes("blob")
    let tube_or_no = mainPage.new_text.includes("youtu") || mainPage.new_text.includes("youtube")
    let tiktok_or_no = mainPage.new_text.includes("tiktok")
    let facebook_or_on = mainPage.new_text.includes("facebook")
    let link_or_no = mainPage.new_text.includes("http")
    mainPage.string_name = img_or_no ? "img" : tiktok_or_no ? "tiktok" : tube_or_no ? "tube" : "text";
    const all_or_no = !img_or_no && !tiktok_or_no && !tube_or_no && !facebook_or_on
    if (all_or_no) {
        if (link_or_no) {
            mainPage.string_name = "link"
        }
    }

    if (facebook_or_on) {
        mainPage.new_text = mainPage.new_text.split("=")[1];
        mainPage.string_name = "face";
    }
}

function runTikTokScript() {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = false;
    document.body.appendChild(script);
}

function runfacebookScript() {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2";
    script.async = false;
    document.body.appendChild(script);
}