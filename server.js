const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

app.use(express.json({ limit: '25mb' })); // 급여명세서 템플릿(base64)이 커질 수 있어 넣네하게 설정

// public 폴더 안의 HTML, CSS, JS 파일을 자동으로 사용자에게 전달해 주는 코드
app.use(express.static(path.join(__dirname, 'public')));

// 기본 주소(/)로 접속하면 index.html을 보여줌
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== 데이터 저장 API (Supabase 연동) =====
app.get('/api/data', async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 설정되지 않았습니다.' });
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/app_data?id=eq.1&select=data`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    if (!r.ok) throw new Error(`Supabase 조회 실패 (${r.status}): ${await r.text()}`);
    const rows = await r.json();
    res.json(rows[0]?.data ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data', async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 설정되지 않았습니다.' });
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/app_data?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id: 1, data: req.body, updated_at: new Date().toISOString() })
    });
    if (!r.ok) throw new Error(`Supabase 저장 실패 (${r.status}): ${await r.text()}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 성공적으로 실행되었습니다: http://localhost:${PORT}`);
});
