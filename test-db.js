const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function test() {
  const r = await fetch(url + '/rest/v1/profiles?id=eq.3595e063-9865-4f90-9203-513046127be9', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  console.log('Profile:', await r.text());

  const r2 = await fetch(url + '/rest/v1/courses?teacher_id=eq.3595e063-9865-4f90-9203-513046127be9', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
  console.log('Courses:', await r2.text());
}
test();
