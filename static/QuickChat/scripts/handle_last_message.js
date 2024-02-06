async function last_message() { //Shows recent messages in chat details with sender name and number of messages
    mainPage.name = document.getElementById('name').value
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
        let emsp = document.createElement('p')
        let div2 = document.getElementById(`user-name${i}`)
        div2.innerHTML = " "
        let p_son_time = document.createElement('p')
        let p_son_b = document.createElement('b')
        let user_name = null
        const imgMap = {
            1: img_user1, 2: img_user2,
            3: img_user3, 4: img_user4,
        };

        if (last_m[a].user === mainPage.name) {
            user_name = "you"
            imgMap[i].src = mainPage.img_user === " " ? "man.png" : mainPage.img_user;
        }
        else {
            user_name = last_m[a].user
            imgMap[i].src = "bot.png"
        }

        p_son_time.innerHTML = last_m[a].time

        if (last_m[a].type === "text") {

            p_son.innerHTML = last_m[a].text.length > 25 ? `<b>${user_name}</b>: Long message!!`: `<b>${user_name}</b>: ${last_m[a].text}`

        }
        if (last_m[a].type === "img") {
            p_son.innerHTML = `<b>${user_name}</b>: photo message!!`

        }
        if(last_m[a].type !== "img" && last_m[a].type !== "text") {
            p_son.innerHTML = `<b>${user_name}</b>:link message!!`
        } 
        
        div2.appendChild(p_son)
        div2.appendChild(p_son_time)

        p_son_b.innerHTML = a
        emsp.innerHTML =  `.&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;.`
        div.appendChild(emsp)
        div.appendChild(p_son_b)
    }
}