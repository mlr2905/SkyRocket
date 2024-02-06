intervalId = setInterval(push_update, 500)

function push_update(ok) { //Updates the messages displayed in the chat only if there are changes

    if (mainPage.chat_n !== " " || ok === "ok") {
        let url = `/api/chat${mainPage.chat_n}`
        fetch(url)
            .then(res => res.json())
            .then(data => {
                localStorage.setItem("check", JSON.stringify(data));
                mainPage.Push = JSON.parse(localStorage.getItem("check"));
                if (mainPage.user !== '') {
                    if (mainPage.Push.length !== mainPage.size_array.length || ok === "ok") {
                        mainPage.Push = 0;
                        get();
                    }
                }
            });
    }
}

// I use get execute function last_message

function get() {
    mainPage.size_array = JSON.parse(localStorage.getItem(`chat${mainPage.chat_n}`))
    mainPage.message_list = document.getElementById('box-body')
    mainPage.message_list.innerHTML = ""
    const data_day = date_day_new()
    const div = document.getElementById('box-body')
    const son = document.createElement('div')
    son.innerHTML = `<div class="date_day">${data_day}</div>`
    div.appendChild(son)
    message_sorting() //Printing_messages.js
}

function post_img() {//Only the sender sees the picture
    mainPage.new_time = time_new()
    const img = image1.src = URL.createObjectURL(event.target.files[0]);
    const url = `/api/chat${mainPage.chat_n}`
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: `{
                    "user": "${mainPage.name}",
                    "text": "${img}",
                    "time": "${mainPage.new_time}:00",
                    "type": "img"

                }`})
}

function post_data() {//Sending a text message, a link to YouTube, Tiktok, Facebook, or a photo link or a regular link
    if (document.getElementById("text").value !== "") {
        mainPage.new_time = time_new()
        mainPage.new_text = document.getElementById('text').value
        mainPage.string_name = "text"
        mainPage.json_id += 1
        link_type()  //Printing_messages.js
        const input = document.getElementById('text')
        input.value = '';
        let url = `/api/chat${mainPage.chat_n}`
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: `{
                    "user": "${mainPage.name}",
                    "text": "${mainPage.new_text}",
                    "time": "${mainPage.new_time}",
                    "type": "${mainPage.string_name}"
                }`})
    }
}

async function put(number, value) { //Editing of a message of any type to any type
    mainPage.new_text = value
    mainPage.string_name = "text"
    link_type()
    mainPage.new_time = time_new()
    let url = `/api/chat${mainPage.chat_n}/${number}`
    let response = await fetch(`${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: `{
            "user": "${mainPage.name}",
            "text": "${mainPage.new_text}",
            "time": "${mainPage.new_time}",
            "type": "${mainPage.string_name}"
                }`})
    let data = await response.json()
    if (data) {
        clearInterval(intervalId);
        const ok = "ok"
        push_update(ok)
        intervalId = setInterval(push_update, 500)
    }
}

function delete_(number) {//Deletes a message
    let url = `/api/chat${mainPage.chat_n}/${number}`
    fetch(url, {
        method: 'DELETE'
    }).then(response => {
        if (!response.ok) {
            console.error(response)
            alert('failure')
        } else {
        }
    })
}

async function id_message(i) {
    const url = `/api/chat${i}`;
    const response = await fetch(url);
    let data = await response.json();

    localStorage.setItem(`id${i}`, JSON.stringify(data));

    let date = JSON.parse(localStorage.getItem(`id${i}`));
    const id_n = date;
    const id = id_n.filter((item) => item.id === Math.max(...id_n.map((item) => item.id)));

    return id[0].id;

}
