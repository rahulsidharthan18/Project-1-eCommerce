function addToCart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        swal("Item added to cart!", "", "success");
        if(response.status){
            let count = $('#cart-count').html()
            count= parseInt(count)+1
            $("$cart-count").html(count)
        }
        alert(response)
        
      }
    })
  }
  