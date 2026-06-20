import fs from 'fs';

const p =
  'C:/Users/Admin/.cursor/projects/e-show-me-italy/agent-transcripts/e4373200-c7b2-4fb2-b0cd-fc4832a1a882/e4373200-c7b2-4fb2-b0cd-fc4832a1a882.jsonl';
const line = fs.readFileSync(p, 'utf8').split('\n')[0];
const obj = JSON.parse(line);
const html = obj.message.content[0].text;

const markers = [
  'Applications Queue',
  'Tour Slot Assignment',
  'Payout Requests',
  'Payout Detail Review',
  'Payment Reports',
  'Notifications & Announcements',
  'System Settings',
];

let out = '';
for (const m of markers) {
  const idx = html.indexOf(m);
  if (idx === -1) {
    out += `\nNOT FOUND: ${m}\n`;
    continue;
  }
  out += `\n===== ${m} =====\n`;
  out += html.slice(Math.max(0, idx - 200), idx + 4000);
}

fs.writeFileSync('scripts/pages-extract.txt', out);
console.log('Written', out.length, 'chars');
