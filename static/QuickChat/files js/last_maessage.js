async function last_message() { //Shows recent messages in chat details with sender name and number of messages
    Cells_manager.name = document.getElementById('name').value
    for (let i = 1; i < 5; i++) {
        let url = `/api/chat${i}`
        let response = await fetch(url)
        response.ok || console.error('network problem');
        let data = await response.json()
        localStorage.setItem(`chat${i}`, JSON.stringify(data));
        let last_m = await data
        let a = last_m.length - 1
        let div = document.getElementById(`p-${i}`)
        div.innerHTML = " "
        let p_son = document.createElement('p')
        let div2 = document.getElementById(`user-name${i}`)
        div2.innerHTML = " "
        let h4_son = document.createElement('h4')
        let p_son_time = document.createElement('p')
        let p_son_b = document.createElement('b')
        let user_name = null
        const imgMap = {
            1: img_user1, 2: img_user2,
            3: img_user3, 4: img_user4,
        };

        if (last_m[a].user === Cells_manager.name) {
            user_name = "you"
            imgMap[i].src = Cells_manager.img_user;
        }
        else {
            user_name = last_m[a].user
            imgMap[i].src = "bot.png"
        }
        h4_son.innerHTML = user_name
        p_son_time.innerHTML = last_m[a].time
        div2.appendChild(h4_son)
        div2.appendChild(p_son_time)

        if (last_m[a].type === "text") {
            p_son.innerHTML = last_m[a].text
        }
        else {
            p_son.innerHTML = "link message!!"
        }
        p_son_b.innerHTML = a
        div.appendChild(p_son)
        div.appendChild(p_son_b)
    }
}