/* Takes an order from checkout.html and emails it to the brewery.
   Vercel turns any file in /api into a serverless function, so this is reachable
   at /api/order with no build step and no framework.

   One environment variable is required, set in the Vercel project:

     RESEND_API_KEY   an API key from resend.com

   Two are optional:

     ORDER_TO         where orders land   (default info@thewanderingbrew.co.il)
     ORDER_FROM       the From: address   (default onboarding@resend.dev)

   Without RESEND_API_KEY this answers 503 and the checkout page falls back to
   opening the visitor's own mail app, which is how it behaved before. Nothing
   breaks while the key is missing; orders just arrive the old way. */

var TO = process.env.ORDER_TO || 'info@thewanderingbrew.co.il';
var FROM = process.env.ORDER_FROM || 'The Wandering Brew <onboarding@resend.dev>';

/* The catalogue is here as well as in checkout.html deliberately. Prices that
   arrive from a browser are never trusted - every figure in the email below is
   worked out from this table, so a tampered page cannot change what an order
   says it costs. Keep the two in step. */
var PRODUCTS = {
  'jerusalem-syndrome': { name: 'Jerusalem Syndrome', style: 'Hazy IPA, 5.6%' }
};
var PRICE = 18;
var MAX_PER_LINE = 24;

function money(n){
  return '₪' + n.toFixed(2).replace(/\.00$/, '');
}

/* strip control characters so nothing can forge headers or lines in the email */
function clean(v, max){
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

function readBody(req){
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return null; }
  }
  return null;
}

module.exports = async function handler(req, res){
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, reason: 'method' });
  }

  var body = readBody(req);
  if (!body) return res.status(400).json({ ok: false, reason: 'body' });

  /* a field no person ever sees, so anything in it came from a bot */
  if (clean(body.company, 50)) return res.status(200).json({ ok: true });

  var name = clean(body.name, 120);
  var phone = clean(body.phone, 40);
  var email = clean(body.email, 160);
  var notes = clean(body.notes, 2000);

  if (!name) return res.status(400).json({ ok: false, reason: 'name' });
  if (phone.replace(/\D/g, '').length < 6) return res.status(400).json({ ok: false, reason: 'phone' });
  if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, reason: 'email' });
  }

  var items = body.items;
  if (!items || typeof items !== 'object') return res.status(400).json({ ok: false, reason: 'items' });

  var lines = [], bottles = 0, total = 0;
  Object.keys(items).forEach(function(id){
    var p = PRODUCTS[id];
    if (!p) return;
    var q = parseInt(items[id], 10);
    if (!(q > 0)) return;
    if (q > MAX_PER_LINE) q = MAX_PER_LINE;
    bottles += q;
    total += q * PRICE;
    lines.push(q + ' x ' + p.name + ' (' + p.style + ')  ' + money(q * PRICE));
  });
  if (!lines.length) return res.status(400).json({ ok: false, reason: 'items' });

  var key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, reason: 'not-configured' });

  var out = ['Order — The Wandering Brew', ''];
  out = out.concat(lines);
  out.push('', 'Total: ' + money(total) + '  (' + bottles + ' bottle' + (bottles === 1 ? '' : 's') + ')');
  out.push('', 'Name: ' + name, 'Phone: ' + phone);
  if (email) out.push('Email: ' + email);
  if (notes) out.push('', 'Notes: ' + notes);
  out.push('', 'For pickup');

  var payload = {
    from: FROM,
    to: [TO],
    subject: 'Order — ' + name + ' — ' + bottles + ' bottle' + (bottles === 1 ? '' : 's'),
    text: out.join('\n')
  };
  /* so hitting reply in the inbox answers the customer */
  if (email) payload.reply_to = email;

  try {
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      var detail = await r.text();
      console.error('resend ' + r.status + ': ' + detail);
      return res.status(502).json({ ok: false, reason: 'send' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('resend threw: ' + (err && err.message));
    return res.status(502).json({ ok: false, reason: 'send' });
  }
};
