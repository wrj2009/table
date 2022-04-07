const fs = require('fs');
const os = require('os');

// 冒泡排序
function bubble_sort(arr1, arr2) {
    let i = arr1.length, j;
    let t1, t2;
    while (i>0) {
        for (j=0; j<i-1; j++) {
            if (arr1[j]<arr1[j+1]) {
                t1 = arr1[j];
                t2 = arr2[j];
                arr1[j] = arr1[j + 1];
                arr2[j] = arr2[j + 1];
                arr1[j + 1] = t1;
                arr2[j + 1] = t2;
            }
        }
        i--;
    }
    return arr1;
}

// 读取学生分值
var score_list = [0, 0, 0]
fs.stat(os.homedir() + "/score.txt", function(err, stats) {
    if (err) {
        fs.writeFile(os.homedir() + "/score.txt", "0\n0\n0", (err) => {});
    } else {
        fs.readFile(os.homedir() + "/score.txt", "utf8", (err, data) => {
            score_list = data.split("\n");
            for (var i=0; i<score_list.length; i++) {
                score_list[i] = parseInt(score_list[i]);
            }
            // 读取学生列表
            var student_list = fs.readFileSync(os.homedir() + "/students.txt").toString().split("\n");
            bubble_sort(score_list, student_list);

            // 插入表格
            let new_tr;
            for (var i=0; i<student_list.length; i++) {
                new_tr = document.createElement("tr");
                new_tr.innerHTML = `<td>${i + 1}</td><td>${student_list[i]}</td><td>${score_list[i]}</td>`;
                document.getElementsByTagName("tbody")[0].appendChild(new_tr);
            }
        })
    }
})
