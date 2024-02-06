
function hide_emojis() {  //Hides the emoji that are clicked on the chat screen or on input text
    const div1 = document.getElementById("all-emoji");
    div1.style.display = "none";
}

function copy_To_Clipboard(a) {//Copy the desired emoji to input text
    const input = document.getElementById('text')
    input.value += a;
}

function emoji_keyboard() {//Emoji keyboard creator
    // async await

    const url = "https://emojis-e61p.onrender.com/emojis"
    fetch(url)
        .then(res => res.json())
        .then(data => {
            localStorage.setItem("emojis", JSON.stringify(data));
        })
    const emojis = JSON.parse(localStorage.getItem("emojis"))
    const father_div = document.getElementById('all-emoji')
    const son = document.createElement('div')
    son.classList.add("row");
    father_div.appendChild(son)
    let id_emojis = 3
    const max_for = 133
    for (let i = 0; i < max_for; i++) {
        for (let j = 0; j < 12; j++) {
            if (id_emojis === 19) {
                id_emojis++
            }
            const son_row = document.createElement('div')
            son_row.innerHTML = `<div>${emojis[id_emojis].character}</div>`
            son_row.classList.add("emojis");
            son_row.id = `emoji-${id_emojis}`
            const div = document.getElementById(`emoji-${id_emojis}`);
            let img = emojis[id_emojis].character
            son.appendChild(son_row)
            add_Cell_Click_emoji(`${son_row.id}`, img)
            id_emojis++
        }
    }
}

function add_Cell_Click_emoji(divId, number) { //Adds onclick to every emoji
    const div = document.getElementById(divId);
    div.addEventListener("click", function () {
        copy_To_Clipboard(number);
    });
}