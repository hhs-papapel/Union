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
    let id = req.body.id;
    let paw = req.body.paw;
    let ema = req.body.ema;
    let name = req.body.name;
    let phone = req.body.phone;
    let regDate = new Date();  // 회원가입 날짜 현재 시간으로 설정
    let profilePic = req.file ? req.file.filename : 'default.png';  // 이미지가 없으면 기본 이미지 설정


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
                userId: rows[0].userId,
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

// 이름 조회
app.get('/api/user/name', (req, res) => {
    const userId = req.query.userId;

    const query = `
        SELECT name FROM User WHERE userId = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('DB 조회 중 오류 발생:', err);
            return res.status(500).json({ message: 'DB 조회 중 오류 발생' });
        }

        if (results.length > 0) {
            res.json({ name: results[0].name });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
    });
});

/*───────────────────────────────────────────────────────────────────────────────────────────*/
    /*장바구니 항목 보기*/
app.get('/api/cart', (req, res) => {
    const userId = req.query.userId;


    const query = `
        SELECT c.cartId, g.gameName, g.price, g.imageUrl, g.gameId
        FROM Cart c 
        JOIN Game g ON c.gameId = g.gameId 
        WHERE c.userId = ?`;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.log('DB Error:', err);  // 에러 로그 추가
            return res.status(500).json({ error: 'DB Error' });
        }
        res.json(results);  // 결과를 JSON으로 반환
    });
});


/*───────────────────────────────────────────────────────────────────────────────────────────*/

// 장바구니 추가하기
app.post('/api/cart/add', (req, res) => {
    const { userId, gameId } = req.body;

    if (!userId || !gameId) {
        return res.status(400).json({ success: false, message: 'userId 또는 gameId가 필요합니다.' });
    }

    // 중복된 항목이 있는지 확인
    const checkQuery = `
        SELECT * FROM Cart WHERE userId = ? AND gameId = ?
    `;
    connection.query(checkQuery, [userId, gameId], (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ success: false, message: 'DB 에러 발생' });
        }

        // 이미 존재하면 추가하지 않음
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: '이미 장바구니에 존재하는 게임입니다.' });
        }

        // 장바구니에 추가
        const insertQuery = `
            INSERT INTO Cart (gameId, userId, addedDate)
            VALUES (?, ?, CURDATE())
        `;
        connection.query(insertQuery, [gameId, userId], (err, results) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ success: false, message: 'DB 에러 발생' });
            }

            res.json({ success: true, message: '장바구니에 추가되었습니다.' });
        });
    });
});


/*───────────────────────────────────────────────────────────────────────────────────────────*/

// 장바구니에서 항목을 삭제하는 것
app.post('/api/cart/delete', (req, res) => {
    const { cartId } = req.body;  // 클라이언트에서 전달된 cartId

    if (!cartId) {
        return res.status(400).json({ success: false, message: 'cartId가 필요합니다.' });
    }

    const query = `
        DELETE FROM Cart
        WHERE cartId = ?
    `;

    connection.query(query, [cartId], (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ success: false, message: 'DB 에러 발생' });
        }

        if (results.affectedRows > 0) {
            res.json({ success: true, message: '항목이 성공적으로 삭제되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '항목을 찾을 수 없습니다.' });
        }
    });
});
/*───────────────────────────────────────────────────────────────────────────────────────────*/
/* 구매하기 ( 결제 ) */
app.post('/api/payment', (req, res) => {
    const { userId, paymentItems } = req.body;

    
    const paymentDate = new Date();  // 결제 날짜

    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ success: false, message: '트랜잭션 시작 오류' });
        }

        const paymentQueries = paymentItems.map(item => {
            return new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO Payment (gameId, userId, amount, paymentDate)
                    VALUES (?, ?, ?, ?)
                `;

                connection.query(query, [item.gameId, userId, item.amount, paymentDate], (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });

        // 처리 완료 후 Cart에서 항목 삭제
        Promise.all(paymentQueries)
            .then(() => {
                const deleteQuery = `
                    DELETE FROM Cart WHERE userId = ?
                `;
                connection.query(deleteQuery, [userId], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ success: false, message: 'Cart 삭제 오류' });
                        });
                    }

                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ success: false, message: '트랜잭션 커밋 오류' });
                            });
                        }
                        res.json({ success: true, message: '결제가 성공적으로 처리되었습니다.' });
                    });
                });
            })
            .catch(err => {
                connection.rollback(() => {
                    console.error('Payment Error:', err);
                    res.status(500).json({ success: false, message: 'Payment 처리 오류' });
                });
            });
    });
});

/*───────────────────────────────────────────────────────────────────────────────────────────*/


/* 찜목록 리스트 */
app.get('/api/wishlist', (req, res) => {
    const userId = req.query.userId;

    const query = `
        SELECT w.gameId, g.gameName, g.price, g.imageUrl, g.avgRating, GROUP_CONCAT(c.categoryName) AS genres
        FROM Wishlist w
        JOIN Game g ON w.gameId = g.gameId
        LEFT JOIN GameCategory gc ON g.gameId = gc.gameId
        LEFT JOIN Category c ON gc.categoryId = c.categoryId
        WHERE w.userId = ?
        GROUP BY g.gameId
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB Error' });
        }
        res.json(results);
    });
});


/*───────────────────────────────────────────────────────────────────────────────────────────*/

/* 찜목록 테이블에 추가 하기 */
app.post('/api/wishlist/add', (req, res) => {
    const { userId, gameId } = req.body;

    if (!userId || !gameId) {
        return res.status(400).json({ success: false, message: 'userId 또는 gameId가 필요합니다.' });
    }

    // 중복된 항목이 있는지 확인
    const checkQuery = `
        SELECT * FROM Wishlist WHERE userId = ? AND gameId = ?
    `;
    connection.query(checkQuery, [userId, gameId], (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ success: false, message: 'DB 에러 발생' });
        }

        // 이미 존재하면 추가하지 않음
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: '이미 찜 목록에 존재하는 게임입니다.' });
        }

        // 찜 목록에 추가
        const insertQuery = `
            INSERT INTO Wishlist (gameId, userId, addedDate)
            VALUES (?, ?, CURDATE())
        `;
        connection.query(insertQuery, [gameId, userId], (err, results) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ success: false, message: 'DB 에러 발생' });
            }

            res.json({ success: true, message: '찜 목록에 추가되었습니다.' });
        });
    });
});

/*───────────────────────────────────────────────────────────────────────────────────────────*/


/* 찜목록 삭제하기 */
app.delete('/api/wishlist/delete', (req, res) => {
    const { userId, gameId } = req.body;

    const query = `
        DELETE FROM Wishlist
        WHERE userId = ? AND gameId = ?
    `;

    connection.query(query, [userId, gameId], (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB Error' });
        }
        if (results.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: '항목을 찾을 수 없습니다.' });
        }
    });
});

/*───────────────────────────────────────────────────────────────────────────────────────────*/

/*찜 목록 검색*/
app.get('/api/wishlist/search', (req, res) => {
    const userId = req.query.userId;
    const searchTerm = req.query.q; // 클라이언트로부터 검색어를 받습니다.

    if (!searchTerm) {
        return res.status(400).json({ message: '검색어를 입력해주세요' });
    }

    const query = `
        SELECT g.gameId, g.gameName, g.avgRating, g.price, g.imageUrl, GROUP_CONCAT(c.categoryName) AS genres, GROUP_CONCAT(t.tagName) AS tags
        FROM Wishlist w
        JOIN Game g ON w.gameId = g.gameId
        LEFT JOIN GameCategory gc ON g.gameId = gc.gameId
        LEFT JOIN Category c ON gc.categoryId = c.categoryId
        LEFT JOIN GameTag gt ON g.gameId = gt.gameId
        LEFT JOIN Tag t ON gt.tagId = t.tagId
        WHERE w.userId = ? AND (g.gameName LIKE ? OR t.tagName LIKE ?)
        GROUP BY g.gameId
    `;
    const searchValue = `%${searchTerm}%`; // 부분 검색을 지원하는 쿼리

    connection.query(query, [userId, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error('DB 조회 중 오류 발생:', err);
            return res.status(500).json({ message: 'DB 조회 중 오류 발생' });
        }
        res.json(results); // 검색 결과를 클라이언트에 전달
    });
});

/*───────────────────────────────────────────────────────────────────────────────────────────*/