const Cells_manager = new Default_cells(" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",)


function Hide_div() {
    const div1 = document.getElementById("onlines"); // Logged in users window
    div1.style.display = "block"
    const div2 = document.getElementById("page-content"); // View of the chat
    div2.style.display = "block"

}


function Hide_div2() {
    const div1 = document.getElementById("from"); //Login 
    div1.style.display = div1.style.display === "block" ? "none" : "none";
    const div2 = document.getElementById("chats"); // Chats menu
    div2.style.display = div2.style.display === "none" ? "block" : "none";
    intervalId = setInterval(last_message, 1500)

    if (Cells_manager.One_time !== 0) { //A one-time operation
        check_online()
        setInterval(check_online, 5000)
        emoji_keyboard()
        Cells_manager.One_time = 0
    }
}

function Hide_div3() {
    const div1 = document.getElementById("page-content"); // View of the chat
    div1.style.display = "none"
    const div2 = document.getElementById("chats");  // Chats menu
    div2.style.display = div2.style.display === "none" ? "block" : "none";
    // Every time you go to chat profiles, a reset is performed
    Cells_manager.size_array = []
    Cells_manager.message_list = document.getElementById('box-body')
    Cells_manager.message_list.innerHTML = ""
}

function main_screen(){
    const div1 = document.getElementById("from");
    div1.style.display = "block"
    const div2 = document.getElementById("chats");
    div2.style.display =  "none"
    const div3 = document.getElementById("onlines"); // Logged in users window
    div3.style.display = "none"
}

function edit_or_delete(number) { //Edit or delete a message
    const element = document.getElementById(`message-${number}`);
    const classes = element.className;

    if (classes === "user") {//Only the owner of the message can delete or edit
        Swal.fire({
            title: 'Edit or delete the message?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'edit',
            denyButtonText: `delete`,
        }).then((result) => {
            !result.isDismissed && (result.isConfirmed ? text_editing(number) : Swal.fire('The message has been deleted', '', 'info') && delete_(number));

                      })
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You are trying to edit a message that is not yours!',
        })
    }
}

function text_editing(number) {
    (async () => {
        const { value: text } = await Swal.fire({
            input: 'text',
            inputLabel: 'Message',
            inputPlaceholder: 'Type your message here...',
            inputAttributes: {
                'aria-label': 'Type your message here'
            }, showCancelButton: true
        })
        if (text) {
            [Swal.fire(text)]
            put(number, text)
        }
    })()
}

function activation(n) { //The function is responsible for displaying storage of the selected chat
    if (Cells_manager.name !== '') {
        document.querySelector("#text").addEventListener("keydown", handleEnter);
        Hide_div2()
        Hide_div()
        Hide_div()
        post_data() // test
        //Defining components for future use
        Cells_manager.chat_n = n // Used by fetch functions
        Cells_manager.json_id = id_message(n) //Used by the post_data function
        Cells_manager.size_array = []
    }
    else {
        Swal.fire('Must enter a name!! Without a name you can see recent messages', '', 'success')
    }
}


function add_img() {  //A function saves the user's image
    frame.src = URL.createObjectURL(event.target.files[0]);
    Cells_manager.img_user = frame.src
}

function handleEnter(enter) { //Makes the enter button work like a send button
    const text = document.getElementById("text").value;
    if (enter.keyCode === 13 && text !== "") {
        enter.preventDefault();
        post_data(text);
    }
}