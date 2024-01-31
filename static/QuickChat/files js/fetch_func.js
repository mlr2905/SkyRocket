intervalId = setInterval(push_update, 500)

function push_update(ok) { //Updates the messages displayed in the chat only if there are changes
  
    if (Cells_manager.chat_n !== " " || ok === "ok") {
        let url = `/api/chat${Cells_manager.chat_n}`
        fetch(url)
            .then(res => res.json())
            .then(data => {
                localStorage.setItem("check", JSON.stringify(data));
                Cells_manager.Push = JSON.parse(localStorage.getItem("check"));
                if (Cells_manager.user !== '') {
                    if (Cells_manager.Push.length !== Cells_manager.size_array.length || ok === "ok") {
                        Cells_manager.Push = 0;
                        get();
                    }
                }
            });
    }
}

// I use get execute function last_message

function get() {
    Cells_manager.size_array = JSON.parse(localStorage.getItem(`chat${Cells_manager.chat_n}`))
    Cells_manager.message_list = document.getElementById('box-body')
    Cells_manager.message_list.innerHTML = ""
    const data_day = date_day_new()
    const div = document.getElementById('box-body')
    const son = document.createElement('div')
    son.innerHTML = `<div class="date_day">${data_day}</div>`
    div.appendChild(son)
    message_sorting() //Printing_messages.js
}

function post_img() {//Only the sender sees the picture
    Cells_manager.new_time = time_new()
    const img = image1.src = URL.createObjectURL(event.target.files[0]);
    const url = `/api/chat${Cells_manager.chat_n}`
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:  `{
                    "user": "${Cells_manager.name}",
                    "text": "${img}",
                    "time": "${Cells_manager.new_time}:00",
                    "type": "img"

                }`})
}



  
function post_data() {//Sending a text message, a link to YouTube, Tiktok, Facebook, or a photo link or a regular link
    if (document.getElementById("text").value !== "") {
        Cells_manager.new_time = time_new()
        Cells_manager.new_text = document.getElementById('text').value
        Cells_manager.string_name = "text"
        Cells_manager.json_id += 1
        link_type()  //Printing_messages.js
        const input = document.getElementById('text')
        input.value = '';
        let url = `/api/chat${Cells_manager.chat_n}`
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: `{
                    "user": "${Cells_manager.name}",
                    "text": "${Cells_manager.new_text}",
                    "time": "${Cells_manager.new_time}",
                    "type": "${Cells_manager.string_name}"
                }`})
    }
}

async function put(number, value) { //Editing of a message of any type to any type
    Cells_manager.new_text = value
    Cells_manager.string_name = "text"
    link_type()
    Cells_manager.new_time = time_new()
    let url = `/api/chat${Cells_manager.chat_n}/${number}`
    let response = await fetch(`${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: `{
            "user": "${Cells_manager.name}",
            "text": "${Cells_manager.new_text}",
            "time": "${Cells_manager.new_time}",
            "type": "${Cells_manager.string_name}"
                }`})
    let data = await response.json()
    if (data) {
        clearInterval(intervalId);
        const ok = "ok"
        push_update(ok)
        push_update(ok)
        intervalId = setInterval(push_update, 500)
    }
}

function delete_(number) {//Deletes a message
    let url =`/api/chat${Cells_manager.chat_n}/${number}`
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
function id_message(i) {
    let url = `/api/chat${i}`
    fetch(url)
        .then(res => res.json())
        .then(data => {
            localStorage.setItem(`id${i}`, JSON.stringify(data));
        })
    let date = JSON.parse(localStorage.getItem(`id${i}`))
    let id_n = date
    const id = id_n.filter((item) => item.id === Math.max(...id_n.map((item) => item.id)));
    return id[0].id;
}
