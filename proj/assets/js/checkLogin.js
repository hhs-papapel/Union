document.addEventListener('DOMContentLoaded', function () {
    // 세션 스토리지 또는 로컬 스토리지에서 로그인된 유저 정보를 가져옴
    const userId = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');

    // 로그인된 유저가 있을 경우
    if (userId) {
        // 로그인 상태일 때 로그인 버튼을 로그아웃 버튼으로 변경
        const loginButton = document.querySelector('.nav-right a[href="/proj/html/login.html"]');
        if (loginButton) {
            loginButton.innerHTML = '<img src="../assets/images/로그인.png" alt="Logout">로그아웃';
            loginButton.href = '#';  // 로그아웃 링크 설정
            loginButton.addEventListener('click', function () {
                // 로그아웃 처리: sessionStorage 또는 localStorage에서 유저 정보 삭제
                sessionStorage.removeItem('loggedInUser');
                localStorage.removeItem('loggedInUser');
                
                // 페이지를 새로고침하여 상태를 초기화
                window.location.reload();
            });
        }
    } else {
        // 로그인되지 않은 경우, 콘솔 로그로 상태 확인
        console.log('로그인 상태가 아닙니다. 로그인 버튼 유지');
    }
});