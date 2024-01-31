async function check_online() { //A function that checks who logged in and who logged out
    Cells_manager.name_connected = document.getElementById("name").value
    let url = "/api/connected"
    let response = await fetch(url)
    let data = await response.json()
    localStorage.setItem("check-online", JSON.stringify(data));
    Cells_manager.online = JSON.parse(localStorage.getItem("check-online"));
    let td = document.getElementById(`online`)
    const td_son = document.createElement("div");
    td.innerHTML = " "
    td_son.innerHTML = " "
    let users = [];
    Cells_manager.connected = "not"
    for (let i = 0; i < Cells_manager.online.length; i++) {
        if (Cells_manager.online[i].user === Cells_manager.new_text) { //Checking if I"m connected
            Cells_manager.connected = "ok"
        }
        if (Cells_manager.online[i].user !== "") {
            for (const user of Cells_manager.online) {
                if (!users.includes(user.user)) {
                    users.push(user.user);
                    td_son.innerHTML += `<br/><b>${user.user}</b>`;
                    td.appendChild(td_son);
                }
            }
        }
    }
    delete_out_user()
}

function clock_repair() {  //Clock repair according to the requested format
    let time = time_new()
    time += `:${Cells_manager.time_date.getSeconds() < 10 ? `0${Cells_manager.time_date.getSeconds()}` : Cells_manager.time_date.getSeconds()}`;
    return time
}

function delete_out_user() { //A function that checks if 60 seconds have passed since logging in, and if so, removes the user
    let time = clock_repair()
    for (let i = 0; i < Cells_manager.online.length; i++) {
        if (Cells_manager.online[i].time !== undefined) {
            let id = Cells_manager.online[i].id
            //All the following fields for the "if" to work
            let a = Cells_manager.online[i].time
            const offline = time;
            const time1 = new Date(`2023-11-29T${a}`);
            const time2 = new Date(`2023-11-29T${offline}`);
            const difference = difference_in_seconds(time1, time2);

            if (difference > 30 || Cells_manager.time_date !== Cells_manager.online[i].date ) {
                if (Cells_manager.online[i].user === Cells_manager.name_connected) { //Checking if my user has been logged out
                    Cells_manager.connected = "not"
                }
                let url = `/api/connected/${id}`    
                fetch(url, {
                    method: "DELETE"
                }).then(response => {
                    if (!response.ok) {
                        // Handle error
                    }
                });

            }
        }
    }
    if (Cells_manager.connected !== "ok") {
        post_new_login(time)
    }
}

function post_new_login(time) { //Connection of a user that does not exist
const date = date_day_new()
    let url = "/api/connected"

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{
                        "user":"${Cells_manager.name_connected}",
                        "time":"${time}"
                        "date":"${date}"

                    }`}).then(response => {
            if (!response.ok) {
                console.error()
            }
        });
}



