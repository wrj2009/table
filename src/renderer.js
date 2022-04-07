const app = require('electron');
const { ipcRenderer } = require('electron');
const fs = require("fs");
const os = require("os");

// 加载设置
function load_settings(local_storage_key, element_id) {
    if (localStorage.getItem(local_storage_key) == "true") {
        document.getElementById(element_id).style.display = "inline";
    } else if (localStorage.getItem(local_storage_key) == "false") {
        document.getElementById(element_id).style.display = "none";
    } else {
        localStorage.setItem(local_storage_key, "true");
        document.getElementById(element_id).style.display = "inline";
    }
}

var settings = [
    ["table_enable_random_name", "random_name"],
    ["table_enable_date_showing", "day_of_week"],
    ["table_enable_time_showing", "time"],
]

for (var i=0; i<settings.length; i++) {
    load_settings(settings[i][0], settings[i][1]);
}

if (localStorage.getItem("table_open_at_login") == "true") {
    ipcRenderer.send("set_open_at_login", true);
} else if (localStorage.getItem("table_open_at_login") == "false") {
    ipcRenderer.send("set_open_at_login", false);
} else {
    localStorage.setItem("table_open_at_login", "true");
    ipcRenderer.send("set_open_at_login", true);
}

if (localStorage.getItem("table_first_run") == undefined) {
    open_dialog({
        message: "欢迎使用",
        detail: "要正常使用，需要确保程序有权限读取和写入“" + os.homedir + "”目录及目录下的 students.txt 和 score.txt 文件（如果不存在，会自动创建），这两个文件会用于保存学生姓名及分数。\n管理页面默认密码：qwertyuiop。\n\n此对话框不会再次显示。",
        title: "欢迎",
        buttons: ["确定"],
        noLink: true,
    })
    localStorage.setItem("table_first_run", "true");
}

// 设置默认管理密码
if (localStorage.getItem("table_password") == null) {
    localStorage.setItem("table_password", "qwertyuiop");
}

// 获取学生列表
var students_name = [
    "张三",
    "李四",
    "王五",
];

fs.stat(os.homedir() + "/students.txt", function(err, stats) {
    if (err) {
        fs.writeFile(os.homedir() + "/students.txt", "张三\n李四\n王五", (err) => {});
    } else {
        fs.readFile(os.homedir() + "/students.txt", (err, data) => {
            students_name = data.toString().split("\n");

            document.getElementById("all-students-quantity").innerHTML = students_name.length;
            document.getElementById("students-quantity").innerHTML = students_name.length;
        })
    }
})



// 请假学生人数
var leave_students_quantity = 0;

// 关闭和最小化按钮点击事件
document.getElementById('close_button').addEventListener(
    "click",
    () => {
        ipcRenderer.send('close');
        app.BrowserWindow.getFocusedWindow().close();
    }
)
document.getElementById('minimize_button').addEventListener(
    "click",
    () => {
        ipcRenderer.send('minimize');
        app.BrowserWindow.getFocusedWindow().minimize();
    }
)

// 管理按钮点击事件
document.getElementById('manage_button').addEventListener(
    "click",
    () => {
        ipcRenderer.send('password_window_open');
    }
)

// 排行榜按钮点击事件
document.getElementById('ranking_button').addEventListener(
    "click",
    () => {
        ipcRenderer.send('open_new_window', [
            {
                icon: "./icon.ico", 
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                width: 250,
            }, 
            "./src/ranking.html"
        ]);
    }
)

// 默认窗口置顶
document.getElementById("top").checked = true;
ipcRenderer.send("set_top");

// 切换窗口置顶
function toggle_top() {
    var state = document.getElementById("top").checked;
    if (state) {
        ipcRenderer.send("set_top");
    } else {
        ipcRenderer.send("unset_top");
    }
}

// 填充表格中的日期
var date = new Date();
document.getElementById('year').innerText = date.getFullYear()
document.getElementById('month').innerText = date.getMonth() + 1;
document.getElementById('day').innerText = date.getDate();

// 星期显示
var day_names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
document.getElementById('day_of_week').innerText = day_names[date.getDay()];

// 更新时间
document.getElementById("time").innerText = date.toLocaleTimeString("zh-CN", {hour12: false});
function update_time() {
    var date = new Date();
    document.getElementById("time").innerText = date.toLocaleTimeString("zh-CN", {hour12: false});
}
setInterval(update_time, 500);

var leave_students = [];
// 添加请假学生函数
function add_student() {
    if (leave_students_quantity < students_name.length) {
        leave_students_quantity += 1;
        var new_select = document.createElement("select");
        new_select.setAttribute("onchange", "leave_students_refresh()");
        new_select.innerHTML = "<option>&nbsp;</option>";
        for (var i=0;i<students_name.length;i++) {
            if (leave_students.indexOf(students_name[i]) == -1) {
                new_select.innerHTML += "<option>" + students_name[i] + "</option>";
            }
        }
        document.getElementById('leave_students').appendChild(new_select);
        document.getElementById('students-quantity').innerText = document.getElementById('students-quantity').innerText - 1;
        leave_students_refresh();
    }
}

function remove_student() {
    var selects = $("#leave_students").children();
    if (selects.length > 3) {
        selects[selects.length - 1].remove();
        document.getElementById('students-quantity').innerText = Number(document.getElementById('students-quantity').innerText) + 1;
    }
    leave_students_quantity -= 1;
    leave_students_refresh();
}

function leave_students_refresh() {
    leave_students = []
    var selects = $("#leave_students").children();
    for (var i=3; i<selects.length; i++) {
        var selected_student = selects[i].options[selects[i].selectedIndex].text;
        if (selected_student != " ") {
            leave_students.push(selected_student);
        }
    }
}

function open_dialog(d_options) {
    ipcRenderer.send('open_dialog', d_options);
}

// 随机点名函数
function random_name() {
    var random_name_result = students_name[Math.floor(Math.random()*students_name.length)];
    while (leave_students.includes(random_name_result)) {
        random_name_result = students_name[Math.floor(Math.random()*students_name.length)];
        if (leave_students.length >= students_name.length) {
            break;
        }
    }
    open_dialog({
        message: "随机点名结果",
        detail: random_name_result,
        title: "随机点名结果",
        buttons: ["确定"],
        noLink: true,
    });
}

// 恢复密码
function restore_password() {
    localStorage.setItem("table_password", "qwertyuiop");
}