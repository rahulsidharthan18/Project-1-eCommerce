function addToCart(proId) {
  console.log("vannuuuuuuuuuuuuuuuuuuuu");
  $.ajax({
    url: '/add-to-cart/' + proId,
    method: 'get',
    success: (response) => {
      console.log(response, "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
      if (response.redirect) {
        // Redirect to the login page
        window.location.href = response.redirect;
      } else {
        
        if (response.status) {
          swal("Item added to cart!", "", "success");
          let count = $('#cart-count').html();
          count = parseInt(count) + 1;
          $("#cart-count").html(count);
        }else{
          swal("Stock limit exceeded!");
        }
      }
    }
  });
}
