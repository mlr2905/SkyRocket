async function online_users() { //A function that checks who logged in and who logged out
    mainPage.date = date_day_new()
    mainPage.name_connected = document.getElementById("name").value
    let url = "/api/connected"
    let response = await fetch(url)
    let data = await response.json()
    localStorage.setItem("check-online", JSON.stringify(data));
    mainPage.online = JSON.parse(localStorage.getItem("check-online"));
    let td = document.getElementById(`online`)
    const td_son = document.createElement("div");
    td.innerHTML = " "
    td_son.innerHTML = " "
    let users = [];
    mainPage.connected = "not"
    for (let i = 0; i < mainPage.online.length; i++) {
        if (mainPage.online[i].user === mainPage.new_text) { //Checking if I"m connected
            mainPage.connected = "ok"
        }
        if (mainPage.online[i].user !== "") {
            for (const user of mainPage.online) {
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

function adding_seconds() {  //Clock repair according to the requested format
    let time = time_new()
    time += `:${mainPage.time_date.getSeconds() < 10 ? `0${mainPage.time_date.getSeconds()}` : mainPage.time_date.getSeconds()}`;
    return time
}

function delete_out_user() { //A function that checks if 60 seconds have passed since logging in, and if so, removes the user
    let time = adding_seconds()
    for (let i = 0; i < mainPage.online.length; i++) {
        if (mainPage.online[i].time !== undefined) {
            let id = mainPage.online[i].id
            //All the following fields for the "if" to work
            let a = mainPage.online[i].time
            const offline = time;

            const time1 = new Date(`${mainPage.date}T${a}`);
            const time2 = new Date(`${mainPage.date}T${offline}`);
            const difference = difference_in_seconds(time1, time2);

            if (difference > 30 || mainPage.date !== mainPage.online[i].date) {
                if (mainPage.online[i].user === mainPage.name_connected) { //Checking if my user has been logged out
                    mainPage.connected = "not"
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

    if (mainPage.connected !== "ok") {
        post_new_login(time)
    }
}

function post_new_login(time) { //Connection of a user that does not exist
    let url = "/api/connected"

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{
                        "user":"${mainPage.name_connected}",
                        "time":"${time}",
                        "date":"${mainPage.date}"

                    }`}).then(response => {
            if (!response.ok) {
                console.error()
            }
        });
}