/* Shared by index.html and about.html: the age gate, the sticky-bar offset,
   and the cart link (hidden unless something is actually in the cart). */
(function(){

  var gate = document.getElementById('agegate');
  if(gate){
    var root = document.documentElement;
    document.getElementById('age-yes').addEventListener('click', function(){
      try{ localStorage.setItem('twb-age-ok','1'); }catch(e){}
      root.className = root.className.replace(/\s*needs-age-check/,'');
    });
    document.getElementById('age-no').addEventListener('click', function(){
      gate.className = 'agegate is-denied';
    });
    if(root.className.indexOf('needs-age-check') !== -1){
      document.getElementById('age-yes').focus();
    }
  }

  /* The cart only exists for people who added something before the order form
     moved onto the landing page. Show the link when it holds something. */
  var cart = {};
  try{ cart = JSON.parse(localStorage.getItem('twb-cart')) || {}; }catch(e){}
  var n = 0, k;
  for(k in cart){ n += cart[k]; }
  if(n > 0){
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function(el){
      el.textContent = n;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-link]'), function(el){
      el.hidden = false;
    });
  }

  /* The top bar wraps to two rows on narrow screens, so measure it rather
     than guessing a single offset for scroll-margin-top. */
  var bar = document.querySelector('.topbar');
  if(bar){
    var measure = function(){
      document.documentElement.style.setProperty('--bar', (bar.offsetHeight + 8) + 'px');
    };
    measure();
    window.addEventListener('resize', measure);
  }
})();
