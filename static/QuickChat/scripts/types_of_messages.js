//*Printing a message according to the type of message

function text_message(i, id) {
    mainPage.son.innerHTML = `
    <div class="direct-chat-msg ${mainPage.type_class}">
    <div class="direct-chat-info clearfix">
        <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
        <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
        <span class="${mainPage.user_or_Another_user}" id="message-${id}">
            <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
        </span>
    </div>
    <img class="direct-chat-img" src="${mainPage.img}" alt="message user image">
    <div class="direct-chat-text">
        ${mainPage.size_array[i].text}
    </div>
</div>
`
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`message-${id}`, id)
}

function image_Message(i, id) {
    mainPage.son.innerHTML = `
            <div class="direct-chat-msg ${mainPage.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
                <span class="${mainPage.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${mainPage.img}"  alt="message user image">
            <div class="direct-chat-text">
            <img src="${mainPage.size_array[i].text}"  id="img-${id}" />
            </div>
        </div>
        `
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`img-${id}`, id)
    addCellClick2(`img-${id}`, id)     
}

function link_message(i, id) {
    mainPage.son.innerHTML = ` 
        <div class="direct-chat-msg ${mainPage.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
                <span class="${mainPage.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${mainPage.img}"  alt="message user image">
            <div class="direct-chat-text">
            <a href="${mainPage.size_array[i].text}">${mainPage.size_array[i].text}</a>
            </div>
        </div>
        `
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`message-${id}`, id)
}

function youtube_message(i, id) {
    const url = mainPage.size_array[i].text
    const parts = url.split("/");
    const videoId = parts[parts.length - 1];
    const id_link = videoId.split("?");
    let firstPart = id_link[0];
    if(id_link[0] === 'watch'){
        a =id_link[1]
        const b = a.split("=");
        firstPart = b[1]

    }
    mainPage.son.innerHTML = `
        <div class="direct-chat-msg ${mainPage.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
                <span class="${mainPage.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${mainPage.img}"  alt="message user image">
            <div class="direct-chat-text">
                <iframe width="300" height="200"
                src="https://www.youtube.com/embed/${firstPart}?si=cFQc8PdAdX4dZwNQ"
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
                encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
        </div>
        `
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`message-${id}`, id)
}

function facebook_message(i, id) {
    mainPage.son.innerHTML = `
        <div class="direct-chat-msg ${mainPage.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
                <span class="${mainPage.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${mainPage.img}" alt="message user image">
            <div class="direct-chat-text">
                <iframe width="300" height="200"
                    src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FSirtonimInt%2Fvideos%2F${mainPage.size_array[i].text}%2F&show_text=false&width=560&t=0"
                    title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
            encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
                </iframe>
            </div>
        </div>
            `
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`message-${id}`, id)
}

function tiktok_message(i, id) {
    const url = mainPage.size_array[i].text
    const parts = url.split("/");
    const videoId = parts[parts.length - 1];
    const id_link = videoId.split("?");
    const firstPart = id_link[0];
    mainPage.son.innerHTML = `
        <div class="direct-chat-msg ${mainPage.type_class}">
            <div class="direct-chat-info clearfix">
                <span class="direct-chat-name>${mainPage.size_array[i].user}</span>
                <span class=" direct-chat-timestamp>${mainPage.size_array[i].time}</span>
                <span class="${mainPage.user_or_Another_user}" id="message-${id}">
                    <iconify-icon icon="uim:ellipsis-v"></iconify-icon>
                </span>
            </div>
            <img class="direct-chat-img" src="${mainPage.img}" alt="message user image">
            <div class="direct-chat-text">
                <blockquote class="tiktok-embed" cite="${mainPage.size_array[i].text}"data-video-id="${firstPart}"> 
                    <section></section>
                </blockquote> 
            </div>
        </div>
    `
    mainPage.message_list.appendChild(mainPage.son)
    addCellClick(`message-${id}`, id)
}

function addCellClick(divId, number) {
    const div = document.getElementById(divId);
    div.addEventListener("click", function () {
        edit_or_delete_message(number);
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
  