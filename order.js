/* The order form on the landing page.
   Every figure here is for the customer's benefit only: api/order.js recomputes
   the whole order from its own price table and ignores anything money-shaped
   that arrives from the browser. */
(function(){
  var form = document.getElementById('order');
  if(!form) return;

  var PRODUCT = { id:'jerusalem-syndrome', name:'Jerusalem Syndrome', style:'Hazy IPA, 5.6%' };
  var PRICE = 18, MAX = 24;
  var D = window.TWB.delivery, P = window.TWB.pickup;

  var qty      = document.getElementById('qty');
  var address  = document.getElementById('address');
  var err      = document.getElementById('err');
  var send     = document.getElementById('send');
  var dPanel   = document.getElementById('delivery-panel');
  var pPanel   = document.getElementById('pickup-panel');
  var totals   = form.querySelector('[data-totals]');

  function money(n){ return '₪' + n; }
  function bottles(){ return Math.min(MAX, Math.max(1, parseInt(qty.value, 10) || 1)); }
  function method(){ return form.querySelector('input[name="method"]:checked').value; }
  function fee(){ return method() === 'delivery' ? window.TWB.deliveryFee(bottles()) : 0; }
  function sentence(s){ return s ? (/[.!?]$/.test(s) ? s : s + '.') : ''; }

  /* ---------- the standing copy, built from whatever delivery.js holds ---------- */

  function feeLine(){
    return 'Free on ' + D.freeFrom + ' bottles or more. Below that, ' + money(D.fee) + '.';
  }

  function paintNotes(){
    var pickupNote = P.address
      ? 'Pick up at ' + sentence(P.address) + (P.hours ? ' ' + sentence(P.hours) : '')
      : 'We will call you with the pickup address and a time that suits you.';
    pPanel.querySelector('[data-pickup-note]').textContent = pickupNote;

    var where = 'We deliver in ' + D.area + (D.areas ? ' — ' + D.areas : '') + '.';
    var when  = D.when ? ' Deliveries go out ' + sentence(D.when) : '';
    var min   = D.minimum > 0 ? ' Delivery orders start at ' + D.minimum + ' bottles.' : '';
    dPanel.querySelector('[data-delivery-note]').textContent = where + when + min + ' ' + feeLine();

    form.querySelector('[data-delivery-d]').textContent =
      money(D.fee) + ', free from ' + D.freeFrom;
    form.querySelector('[data-pickup-d]').textContent = 'Free';
  }

  /* ---------- totals ---------- */

  function lines(){
    var n = bottles(), out = [];
    out.push({ k: n + ' × ' + PRODUCT.name, v: money(n * PRICE) });
    if(method() === 'delivery'){
      var f = fee();
      out.push({ k: 'Delivery', v: f ? money(f) : 'Free' });
    }
    return out;
  }

  function total(){ return bottles() * PRICE + fee(); }

  function paintTotals(box){
    var html = lines().map(function(l){
      return '<div class="t-line"><span class="k">' + l.k + '</span><span class="v">' + l.v + '</span></div>';
    }).join('');
    html += '<div class="t-total"><span class="k">Total</span><span class="v">' + money(total()) + '</span></div>';
    box.innerHTML = html;
  }

  function paint(){
    var n = bottles();
    qty.value = n;
    form.querySelector('[data-bottles]').textContent = n + (n === 1 ? ' bottle' : ' bottles');
    var deliver = method() === 'delivery';
    dPanel.hidden = !deliver;
    pPanel.hidden = deliver;
    paintTotals(totals);
  }

  /* ---------- wiring ---------- */

  Array.prototype.forEach.call(form.querySelectorAll('.qty-btn'), function(b){
    b.addEventListener('click', function(){
      qty.value = bottles() + parseInt(b.getAttribute('data-step'), 10);
      paint();
    });
  });
  qty.addEventListener('input', paint);
  qty.addEventListener('change', paint);
  Array.prototype.forEach.call(form.querySelectorAll('input[name="method"]'), function(r){
    r.addEventListener('change', function(){
      paint();
      if(method() === 'delivery') address.focus();
    });
  });

  /* ---------- sending ---------- */

  function plain(){
    var out = ['The Wandering Brew - order', ''];
    lines().forEach(function(l){ out.push(l.k + '  ' + l.v); });
    out.push('Total  ' + money(total()), '');
    out.push('Name: '  + form.name.value.trim());
    out.push('Phone: ' + form.phone.value.trim());
    if(form.email.value.trim()) out.push('Email: ' + form.email.value.trim());
    out.push('', method() === 'delivery'
      ? 'Deliver to: ' + address.value.trim()
      : 'For pickup');
    if(form.notes.value.trim()) out.push('', 'Notes: ' + form.notes.value.trim());
    return out.join('\n');
  }

  function fail(msg){
    err.textContent = msg;
    err.hidden = false;
  }

  function fallback(){
    var box = document.getElementById('fallback');
    document.getElementById('fallback-text').textContent = plain();
    form.hidden = true;
    box.hidden = false;
    box.scrollIntoView({ block:'start' });
    location.href = 'mailto:info@thewanderingbrew.co.il'
      + '?subject=' + encodeURIComponent('Order - ' + form.name.value.trim())
      + '&body=' + encodeURIComponent(plain());
  }

  document.getElementById('copy').addEventListener('click', function(){
    var b = this;
    try{
      navigator.clipboard.writeText(plain());
      b.textContent = 'Copied';
      setTimeout(function(){ b.textContent = 'Copy it'; }, 1800);
    }catch(e){}
  });

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    err.hidden = true;

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var deliver = method() === 'delivery';
    var addr = address.value.trim();

    if(!name)                                 return fail('We need a name for the order.');
    if(phone.replace(/\D/g,'').length < 6)    return fail('We need a phone number we can reach you on.');
    if(deliver && addr.length < 6)            return fail('We need an address to deliver to.');
    if(deliver && D.minimum > 0 && bottles() < D.minimum){
      return fail('Delivery orders start at ' + D.minimum + ' bottles. Add a few more, or switch to pickup.');
    }

    send.disabled = true;
    send.textContent = 'Sending…';

    var items = {};
    items[PRODUCT.id] = bottles();

    var done = false;
    var timer = setTimeout(function(){ if(!done){ done = true; fallback(); } }, 12000);

    fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items,
        method: deliver ? 'delivery' : 'pickup',
        address: deliver ? addr : '',
        name: name, phone: phone,
        email: form.email.value.trim(),
        notes: form.notes.value.trim(),
        company: form.company.value
      })
    }).then(function(r){
      return r.json().then(function(j){ return { ok: r.ok && j && j.ok, status: r.status, reason: j && j.reason }; },
                           function(){ return { ok:false, status:r.status, reason:'bad-json' }; });
    }).then(function(res){
      if(done) return;
      done = true; clearTimeout(timer);
      console.log('[order] /api/order answered', res.status, res.reason || '');
      if(!res.ok) return fallback();

      var box = document.getElementById('done');
      box.querySelector('[data-done-phone]').textContent = phone;
      paintTotals(box.querySelector('[data-done-totals]'));
      form.hidden = true;
      box.hidden = false;
      box.scrollIntoView({ block:'start' });
      try{ localStorage.removeItem('twb-cart'); }catch(e){}
    }).catch(function(e){
      if(done) return;
      done = true; clearTimeout(timer);
      console.log('[order] /api/order failed', e && e.message);
      fallback();
    });
  });

  paintNotes();
  paint();
})();
