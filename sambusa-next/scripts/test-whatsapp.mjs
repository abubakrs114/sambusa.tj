/**
 * UTF-8 emoji + URL (node scripts/test-whatsapp.mjs).
 */
const PHONE = "992987441234";

function utf8Emoji(...bytes) {
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}

const ICONS = {
  fire: utf8Emoji(0xf0, 0x9f, 0x94, 0xa5),
  user: utf8Emoji(0xf0, 0x9f, 0x91, 0xa4),
  phone: utf8Emoji(0xf0, 0x9f, 0x93, 0x9e),
  clock: utf8Emoji(0xe2, 0x8f, 0xb0),
  pin: utf8Emoji(0xf0, 0x9f, 0x93, 0x8d),
  box: utf8Emoji(0xf0, 0x9f, 0x93, 0xa6),
  money: utf8Emoji(0xf0, 0x9f, 0x92, 0xb0),
};

const RULE = utf8Emoji(0xe2, 0x94, 0x80).repeat(24);

function buildMessage() {
  return [
    `${ICONS.fire} *\u041d\u041e\u0412\u042b\u0419 \u041f\u0420\u0415\u0414\u0417\u0410\u041a\u0410\u0417 \u2014 SAMBUSA.TJ*`,
    RULE,
    `${ICONS.user} *\u0418\u043c\u044f:* Test`,
    `${ICONS.phone} *+992*`,
    `${ICONS.box} *\u0421\u043e\u0441\u0442\u0430\u0432:*`,
    `\u2022 Item \u00d7 1 \u0448\u0442.`,
    RULE,
    `${ICONS.money} *574 TJS*`,
  ].join("\n");
}

function buildUrl(message) {
  return `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(message)}`;
}

const message = buildMessage();
const url = buildUrl(message);
const decoded = new URL(url).searchParams.get("text") ?? "";

const checks = [
  [message.codePointAt(0) === 0x1f525, "fire code point at start"],
  [decoded.codePointAt(0) === 0x1f525, "fire survives URL round-trip"],
  [url.startsWith(`https://api.whatsapp.com/send?phone=${PHONE}&text=`), "URL prefix"],
  [!decoded.includes("\uFFFD"), "no replacement char in decoded text"],
];

let failed = false;
for (const [ok, label] of checks) {
  if (!ok) {
    console.error("FAIL:", label);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("OK — first char:", decoded.slice(0, 2), "URL length:", url.length);
