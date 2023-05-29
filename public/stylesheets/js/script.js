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
        swal("Item added to cart!", "", "success");
        if (response.status) {
          let count = $('#cart-count').html();
          count = parseInt(count) + 1;
          $("#cart-count").html(count);
        }

      }
    }
  });
}
