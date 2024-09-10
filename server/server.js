const express = require('express');

const app = express();

//cors 설정 ( 모두 허용 )
const cors = require('cors')

// //cors 설정 ( 일부 허용 )
// const corsOption = {
//     origin: 'http://localhost:8080',
//     optionSuccessStatus: 200
// }


// 미들웨어 추가
app.use(express.json());  // JSON 형식의 본문 데이터를 파싱
app.use(express.urlencoded({ extended: true }));  // URL-encoded 형식 데이터를 파싱


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
    console.log('page start')
    res.send('Hello world')
})



/*───────────────────────────────────────────────────────────────────────────────────────────*/


/*회원가입*/
app.post('/join',(req, res) => {
    console.log(req.body);
    let id = req.body.id;
    let paw = req.body.paw;
    let ema = req.body.ema;
    let name = req.body.name;
    let phone = req.body.phone;
    let regDate = new Date();  // 회원가입 날짜 현재 시간으로 설정
    let profilePic = req.file ? req.file.filename : 'default.png';  // 이미지가 없으면 기본 이미지 설정

    console.log(id, paw, ema, name, phone, profilePic);

    connection.query('SELECT * FROM User WHERE username = ? OR email = ?', [id, ema], (err, rows) => {
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
                [id, paw, ema, name, phone, regDate, profilePic],
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


/* 아이디 찾기 기능 */
app.post('/findId', (req, res) => {
    const { name, contact } = req.body;  // req.body에서 이름과 연락처를 받음

    // 이메일 또는 전화번호로 검색
    connection.query('SELECT username FROM User WHERE name = ? AND (email = ? OR phone = ?)', [name, contact, contact], (err, rows) => {
        if (err) {
            console.log('DB Error: ', err);
            return res.status(500).json({ status: 500, message: 'DB Error' });
        }
        if (rows.length > 0) {
            let responseData = {
                status: 200,
                id: rows[0].username  // 유저의 아이디를 응답
            };
            res.json(responseData);
        } else {
            let responseData = {
                status: 404,  // 해당 사용자가 없는 경우
                message: 'User not found'
            };
            res.json(responseData);
        }
    });
});
/*───────────────────────────────────────────────────────────────────────────────────────────*/



/* 비밀번호 찾기 기능 */
app.post('/findPw', (req, res) => {
    const { id, contact } = req.body;  

    connection.query('SELECT pwd FROM User WHERE username = ? AND (email = ? OR phone = ?)', [id, contact, contact], (err, rows) => {
        if (err) {
            console.log('DB Error: ', err);
            return res.status(500).json({ status: 500, message: 'DB Error' });
        }
        if (rows.length > 0) {
            let responseData = {
                status: 200,
                pw: rows[0].pwd 
            };
            res.json(responseData);
        } else {
            let responseData = {
                status: 404, 
                message: 'User not found'
            };
            res.json(responseData);
        }
    });
});
/*───────────────────────────────────────────────────────────────────────────────────────────*/