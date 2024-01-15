function message_sorting() {
    for (let i = 0; i < Cells_manager.size_array.length; i++) {//Sorting my messages from all messages
        Cells_manager.son = document.createElement('div')
        let id = Cells_manager.size_array[i].id

        Cells_manager.type_class = Cells_manager.size_array[i].user === Cells_manager.name ? "right" : "-";
        Cells_manager.img = Cells_manager.size_array[i].user === Cells_manager.name ? Cells_manager.img_user : "bot.png";
        Cells_manager.user_or_Another_user = Cells_manager.size_array[i].user === Cells_manager.name ? "user" : "Another-user";

    
        if (Cells_manager.size_array[i].type === "text") {
            text_message(i, id)
        }
        else {
            if (Cells_manager.size_array[i].type == "img") {
                image_Message(i, id)
            }
            if (Cells_manager.size_array[i].type === "link") {
                link_message(i, id)
            }
            if (Cells_manager.size_array[i].type === "tube") {
                youtube_message(i, id)
            }
            if (Cells_manager.size_array[i].type === "face") {
                runfacebookScript()
                facebook_message(i, id)
            }
            if (Cells_manager.size_array[i].type === "tiktok") {
                runTikTokScript()
                tiktok_message(i, id)
            }
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
    Cells_manager.new_time = time_new()
    let img_or_no = isLink_img(Cells_manager.new_text)
    let tube_or_no = Cells_manager.new_text.includes("youtu") || Cells_manager.new_text.includes("youtube")
    let tiktok_or_no = Cells_manager.new_text.includes("tiktok")
    let facebook_or_on = Cells_manager.new_text.includes("facebook")
    let link_or_no = Cells_manager.new_text.includes("http")
    Cells_manager.string_name = img_or_no ? "img" : tiktok_or_no ? "tiktok" : tube_or_no ? "tube" : "text";
    const all_or_no = !img_or_no && !tiktok_or_no && !tube_or_no && !facebook_or_on
    if (all_or_no) {
        if (link_or_no) {
            Cells_manager.string_name = "link"
        }
    }

    if (facebook_or_on) {
        Cells_manager.new_text = Cells_manager.new_text.split("=")[1];
        Cells_manager.string_name = "face";
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