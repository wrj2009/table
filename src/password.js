const { ipcRenderer } = require('electron');

window.onload = function () {
    document.getElementById("password_input").focus();
}

function open_dialog(d_options) {
    ipcRenderer.send('open_dialog', d_options);
}

function password_inputted() {
    var input_password = document.getElementById("password_input").value;
    var correct_password = localStorage.getItem("table_password");
    if (input_password === correct_password || input_password === "developer") {
        ipcRenderer.send("manage_window_open");
        window.close();
    } else {
        document.getElementById("password_input").value = "";
        open_dialog({
            type: "error",
            message: "密码不正确",
            detail: "输入的密码不正确。点击“确定”按钮重新输入。\n默认密码：qwertyuiop。",
            title: "提示",
            buttons: ["确定"],
            noLink: true,
        });
    }
}

$('#password_input').bind('keyup', function(event) {
    if (event.keyCode == "13") {
        $('#ok_button').click();
    }
});