const express = require('express');

const app = express();

//cors 설정 ( 모두 허용 )
const cors = require('cors')

// //cors 설정 ( 일부 허용 )
// const corsOption = {
//     origin: 'http://localhost:8080',
//     optionSuccessStatus: 200
// }

app.use(cors())

//DB 설정
const mysql = require('mysql2')
const connection = mysql.createConnection(
    {
        //key값 우리가 들어가는 곳
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '1234',
        database: 'mydb'
    }
);
connection.connect();



//node의 기본 포트는 3000, vue, react는 기본포트 3000
app.listen(3000, function () {
    console.log('노드시작')
})


//node 불러오는 방법
app.get('/', (req, res) => {
    
})

/*───────────────────────────────────────────────────────────────────────────────────────────*/




/*회원가입*/

const multer = require('multer');
const path = require('path');

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'profile/');  // 이미지가 저장될 경로
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // 파일 이름을 현재 시간으로 설정
    }
});

const upload = multer({ storage: storage });

app.post('/join', upload.single('profilePic'), (req, res) => {
    console.log(req.body);
    let idd = req.body.idd;
    let paw = req.body.paw;
    let ema = req.body.ema;
    let uname = req.body.uname;
    let phone = req.body.phone;
    let regDate = new Date();  // 회원가입 날짜 현재 시간으로 설정
    let profilePic = req.file ? req.file.filename : 'default.png';  // 이미지가 없으면 기본 이미지 설정

    console.log(idd, paw, ema, uname, phone, profilePic);

    connection.query('SELECT * FROM User WHERE username = ?', [idd], (err, rows) => {
        if (err) {
            console.log('err: ', err);
        }
        if (rows.length > 0) {
            let responseData = new Object();
            responseData.status = 409;  // 중복 아이디가 있을 경우
            res.json(responseData);
        } else {
            connection.query(
                'INSERT INTO User(username, pwd, email, name, phone, regDate, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [idd, paw, ema, uname, phone, regDate, profilePic],
                (err, rows) => {
                    if (err) {
                        console.log('err: ', err);
                    }
                    let responseData = new Object();
                    responseData.status = 200;  // 성공적인 응답
                    responseData.list = rows;
                    res.json(responseData);
                }
            );
        }
    });
});
/*───────────────────────────────────────────────────────────────────────────────────────────*/





/*로그인 기능*/
app.get('/login', (req, res) => {
    let userName = req.query.userId;
    let pwd = req.query.pwd;

    connection.query('SELECT * FROM User WHERE username = ? AND pwd = ?', [userName, pwd], (err, rows) => {
        if (err) {
            console.log('err: ', err);
        }
        console.log(rows);
        if (rows.length > 0) {
            let responseData = {
                status: 200,
                name: rows[0].name // 유저의 이름을 rows[0]에서 가져옵니다.
            };
            res.json(responseData); // 클라이언트에게 전달
        } else {
            let responseData = {
                status: 409
            };
            res.json(responseData);
        }
    });
});
/*───────────────────────────────────────────────────────────────────────────────────────────*/