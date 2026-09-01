// Vercel Serverless Function: /api/submit
// 브라우저 대신 서버에서 Google Apps Script로 리드를 전달하고,
// 실제 클라이언트 IP 기준으로 5분 이내 중복 제출을 차단합니다.

const COOLDOWN_SECONDS = 5 * 60; // 5분

function getClientIp(req) {
  var forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function redisGet(key) {
  var url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
  var token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;
  var res = await fetch(url + '/get/' + encodeURIComponent(key), {
    headers: { Authorization: 'Bearer ' + token }
  });
  var data = await res.json();
  return data.result;
}

async function redisSetWithTtl(key, value, ttlSeconds) {
  var url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
  var token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;
  await fetch(url + '/set/' + encodeURIComponent(key) + '/' + encodeURIComponent(value) + '/EX/' + ttlSeconds, {
    headers: { Authorization: 'Bearer ' + token }
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  var scriptUrl = process.env.APPS_SCRIPT_URL;
  if (!scriptUrl) {
    res.status(500).json({ error: 'server_misconfigured', message: 'APPS_SCRIPT_URL 환경변수가 설정되지 않았습니다.' });
    return;
  }

  var ip = getClientIp(req);
  var hasRedis = !!(process.env.UPSTASH_REDIS_KV_REST_API_URL && process.env.UPSTASH_REDIS_KV_REST_API_TOKEN);
  var key = 'submit_ip:' + ip;

  try {
    if (hasRedis) {
      var last = await redisGet(key);
      if (last) {
        res.status(429).json({ error: '5분 이내 중복 신청은 제한됩니다. 잠시 후 다시 시도해주세요.' });
        return;
      }
    }

    var body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    var scriptRes = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!scriptRes.ok) {
      throw new Error('Apps Script error ' + scriptRes.status);
    }

    if (hasRedis) {
      await redisSetWithTtl(key, '1', COOLDOWN_SECONDS);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: 'submit_failed', message: err.message });
  }
};
