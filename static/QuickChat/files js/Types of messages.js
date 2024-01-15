//*Printing a message according to the type of message

function text_message(i, id) {
    Cells_manager.son.innerHTML = `
    <div class="direct-chat-msg ${Cells_manager.type_class}">
    <div class="direct-chat-info clearfix">
        <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
        <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
        <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
            <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
        </span>
    </div>
    <img class="direct-chat-img" src="${Cells_manager.img}" alt="message user image">
    <div class="direct-chat-text">
        ${Cells_manager.size_array[i].text}
    </div>
</div>
`
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
}

function image_Message(i, id) {
    Cells_manager.son.innerHTML = `
            <div class="direct-chat-msg ${Cells_manager.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
                <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${Cells_manager.img}"  alt="message user image">
            <div class="direct-chat-text">
            <img src="${Cells_manager.size_array[i].text}"  id="img-${id}" />
            </div>
        </div>
        `
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
    addCellClick2(`img-${id}`, id)     
}

function link_message(i, id) {
    Cells_manager.son.innerHTML = ` 
        <div class="direct-chat-msg ${Cells_manager.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
                <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${Cells_manager.img}"  alt="message user image">
            <div class="direct-chat-text">
            <a href="${Cells_manager.size_array[i].text}">${Cells_manager.size_array[i].text}</a>
            </div>
        </div>
        `
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
}

function youtube_message(i, id) {
    const url = Cells_manager.size_array[i].text
    const parts = url.split("/");
    const videoId = parts[parts.length - 1];
    const id_link = videoId.split("?");
    const firstPart = id_link[0];
    Cells_manager.son.innerHTML = `
        <div class="direct-chat-msg ${Cells_manager.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
                <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${Cells_manager.img}"  alt="message user image">
            <div class="direct-chat-text">
                <iframe width="300" height="200"
                src="https://www.youtube.com/embed/${firstPart}?si=cFQc8PdAdX4dZwNQ""
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
                encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
        </div>
        `
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
}

function facebook_message(i, id) {
    Cells_manager.son.innerHTML = `
        <div class="direct-chat-msg ${Cells_manager.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
                <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${Cells_manager.img}" alt="message user image">
            <div class="direct-chat-text">
                <iframe width="300" height="200"
                    src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FSirtonimInt%2Fvideos%2F${Cells_manager.size_array[i].text}%2F&show_text=false&width=560&t=0"
                    title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
            encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
                </iframe>
            </div>
        </div>
            `
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
}

function tiktok_message(i, id) {
    const url = Cells_manager.size_array[i].text
    const parts = url.split("/");
    const videoId = parts[parts.length - 1];
    const id_link = videoId.split("?");
    const firstPart = id_link[0];
    Cells_manager.son.innerHTML = `
        <div class="direct-chat-msg ${Cells_manager.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${Cells_manager.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${Cells_manager.size_array[i].time}</span>
                <span class="${Cells_manager.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${Cells_manager.img}" alt="message user image">
            <div class="direct-chat-text">
                <blockquote class="tiktok-embed" cite="${Cells_manager.size_array[i].text}"data-video-id="${firstPart}"> 
                    <section></section>
                </blockquote> 
            </div>
        </div>
    `
    Cells_manager.message_list.appendChild(Cells_manager.son)
    addCellClick(`message-${id}`, id)
}

function addCellClick(divId, number) {
    const div = document.getElementById(divId);
    div.addEventListener("click", function () {
        edit_or_delete(number);
    });
}

function addCellClick2(divId) {
    const div = document.getElementById(divId);
    div.addEventListener("click", function () {
        downloadImage(divId);
    });
}

function downloadImage(a) {
    const image = document.getElementById(a);
    const link = document.createElement("a");
    link.href = image.src;
    link.download = " תמונה מהצאט";
    link.click();
  }
  