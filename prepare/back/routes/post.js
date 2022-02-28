const express = require('express');
const router = express.Router();

// app >> router 변경
router.post('/', (req, res) => { // 실제로 POST /post
  res.json({ id: 1, content: 'hello' });
})

router.delete('/', (req, res) => { // 실제로 DELETE /post
  res.json({ id: 1 })
})

// 중복을 막음

module.exports = router;