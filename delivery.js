/* Pickup and delivery settings, shared by index.html and checkout.html.
   api/order.js holds its own copy of the two numbers, because the server must
   never trust a price the browser sends. Change a number here, change it there.

   The text fields below start empty on purpose. The page reads whatever is
   filled in and says nothing about what is not, so an empty field costs you a
   helpful line but never puts a claim on the site that is not true yet. */
window.TWB = window.TWB || {};

window.TWB.delivery = {
  fee: 20,        // shekels, charged on orders below freeFrom
  freeFrom: 6,    // bottles at or above which delivery costs nothing
  minimum: 0,     // smallest delivery order, in bottles. 0 means no minimum
  area: 'central Jerusalem',
  // the neighbourhoods, as one phrase. Ends open so a street just off the list
  // does not read as a refusal.
  areas: 'Nachlaot, Shaarei Chesed, Rechavia, Talbiya, Mahane Yehuda, '
       + 'the city centre and nearby',
  // a whole sentence, printed as written. Swap it for fixed days and times
  // ('Deliveries go out Thursdays and Fridays, 4-8pm') if that ever changes.
  when: 'We will settle a delivery time with you on the phone'
};

window.TWB.pickup = {
  address: 'Nissim Bachar, Nachlaot, Jerusalem',
  hours: ''       // fixed hours, if there ever are any, e.g. 'Sunday to Thursday, 5-8pm'
};

/* What delivery costs for an order of n bottles. */
window.TWB.deliveryFee = function(n){
  var d = window.TWB.delivery;
  return n >= d.freeFrom ? 0 : d.fee;
};
