const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// public 폴더 안의 HTML, CSS, JS 파일을 자동으로 사용자에게 전달해 주는 코드
app.use(express.static(path.join(__dirname, 'public')));

// 기본 주소(/)로 접속하면 index.html을 보여줌
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버가 성공적으로 실행되었습니다: http://localhost:${PORT}`);
});