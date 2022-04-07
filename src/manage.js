const { ipcRenderer } = require('electron');
const fs = require("fs");
const os = require("os");
const child_process = require('child_process');

// 加载设置
function load_settings(local_storage_key, element_id) {
    if (localStorage.getItem(local_storage_key) == "true") {
        document.getElementById(element_id).setAttribute("checked", "checked");
    } else {
        document.getElementById(element_id).removeAttribute("checked");
    }
}

var settings = [
    ["table_enable_random_name", "enable_random_name"],
    ["table_enable_date_showing", "enable_date_showing"],
    ["table_enable_time_showing", "enable_time_showing"],
]

for (var i=0; i < settings.length; i++) {
    load_settings(settings[i][0], settings[i][1]);
}

// 读取学生列表
students_name = fs.readFileSync(os.homedir() + "/students.txt").toString().split("\n");
for (var i=0; i<students_name.length; i++) {
    document.getElementById("student_list").innerHTML += "<option value=\"" + students_name[i] + "\">" + students_name[i] + "</option>";
}

// 读取学生分值
var score = []
fs.stat(os.homedir() + "/score.txt", function(err, stats) {
    if (err) {
        fs.writeFile(os.homedir() + "/score.txt", "0\n0\n0", (err) => {});
        score = [0, 0, 0]
        for (var i=0; i<score.length; i++) {
            document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
        }
    } else {
        fs.readFile(os.homedir() + "/score.txt", "utf8", (err, data) => {
            score = data.split("\n");
            for (var i=0; i<score.length; i++) {
                document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
            }
        })
    }
})
for (var i=0; i<score.length; i++) {
    document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
}

function remove_student() {
    if (document.getElementById("student_list").selectedIndex >= 0) {
        score.splice(document.getElementById("student_list").selectedIndex, 1);
        document.getElementById("student_list").remove(document.getElementById("student_list").selectedIndex);
        students_name = [];
        for (var i=0; i < document.getElementById("student_list").children.length; i++) {
            students_name.push(document.getElementById("student_list").children[i].value);
        }
        fs.writeFile(os.homedir() + "/students.txt", students_name.join("\n"), (err) => {});
        fs.writeFile(os.homedir() + "/score.txt", score.join("\n"), (err) => {});
        document.getElementById("score_list").innerHTML = "";
        for (var i=0; i<score.length; i++) {
            document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
        }
    }
}
function add_student() {
    if (document.getElementById("add_student_input").value != "") {
        document.getElementById("student_list").innerHTML += "<option value=\"" + document.getElementById("add_student_input").value + "\">" + document.getElementById("add_student_input").value + "</option>";
        students_name = [];
        for (var i=0; i < document.getElementById("student_list").children.length; i++) {
            students_name.push(document.getElementById("student_list").children[i].value);
        }
        score.push("0");
        fs.writeFile(os.homedir() + "/students.txt", students_name.join("\n"), (err) => {});
        fs.writeFile(os.homedir() + "/score.txt", score.join("\n"), (err) => {});
        document.getElementById("score_list").innerHTML = "";
        for (var i=0; i<score.length; i++) {
            document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
        }
        document.getElementById("add_student_input").value = "";
    }
}
function increase_score() {
    score[document.getElementById("student_list").selectedIndex] = parseInt(score[document.getElementById("student_list").selectedIndex]) + 1;
    document.getElementById("score_list").innerHTML = ""
    for (var i=0; i<score.length; i++) {
        document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
    }
    fs.writeFile(os.homedir() + "/score.txt", score.join("\n"), (err) => {});
}
function decrease_score() {
    score[document.getElementById("student_list").selectedIndex] = parseInt(score[document.getElementById("student_list").selectedIndex]) - 1;
    document.getElementById("score_list").innerHTML = ""
    for (var i=0; i<score.length; i++) {
        document.getElementById("score_list").innerHTML += "<option value=\"" + score[i] + "\">" + score[i] + "</option>";
    }
    fs.writeFile(os.homedir() + "/score.txt", score.join("\n"), (err) => {});
}

function edit_with_notepad() {
    document.getElementById("edit_with_notepad").innerHTML = "正在编辑";
    document.getElementById("edit_with_notepad").setAttribute("disabled", "disabled");
    child_process.exec("C:\\Windows\\System32\\notepad.exe \"" + os.homedir() + "\\students.txt\"");
    child_process.exec("C:\\Windows\\System32\\notepad.exe \"" + os.homedir() + "\\score.txt\"", function(error, stdout, stderr) {
        if (error) {
            document.getElementById("edit_with_notepad").innerHTML = "未能正常打开：" + error;
            setTimeout('document.getElementById("edit_with_notepad").innerHTML = "使用 Windows 记事本编辑";', 5000);
            document.getElementById("edit_with_notepad").removeAttribute("disabled");
        } else {
            document.getElementById("edit_with_notepad").innerHTML = "使用 Windows 记事本编辑";
            document.getElementById("edit_with_notepad").removeAttribute("disabled");
        }
    });
}

// 使用 localStorage 保存设置
function save_settings(local_storage_key) {
    if (localStorage.getItem(local_storage_key) == "true") {
        localStorage.setItem(local_storage_key, "false");
    } else {
        localStorage.setItem(local_storage_key, "true");
    }
}

function open_dialog(d_options) {
    ipcRenderer.send('open_dialog', d_options);
}

// 重置密码
function reset_password() {
    var password = localStorage.getItem("table_password");
    var original_password = document.getElementById("original_password").value;
    var new_password = document.getElementById("new_password").value;
    var confirm_password = document.getElementById("confirm_password").value;

    if (original_password == password) {
        if (new_password == confirm_password) {
            localStorage.setItem("table_password", new_password);
            open_dialog({
                type: "info",
                message: "密码已重置",
                detail: "密码已重置。点击“确定”按钮关闭管理窗口。",
                title: "提示",
                buttons: ["确定"],
                noLink: true,
            });
            window.close();
        } else {
            document.getElementById("confirm_password").value = "";
            open_dialog({
                type: "error",
                message: "密码不一致",
                detail: "两次输入的密码不一致。点击“确定”按钮重新输入。",
                title: "提示",
                buttons: ["确定"],
                noLink: true,
            });
        }
    } else {
        document.getElementById("original_password").value = "";
        open_dialog({
            type: "error",
            message: "原密码不正确",
            detail: "输入的原密码不正确。点击“确定”按钮重新输入。",
            title: "提示",
            buttons: ["确定"],
            noLink: true,
        });
    }
}