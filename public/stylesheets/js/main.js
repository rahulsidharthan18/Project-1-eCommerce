(function ($) {
"use strict";


// meanmenu
$('#mobile-menu').meanmenu({
	meanMenuContainer: '.mobile-menu',
	meanScreenWidth: "992"
});

$('.sidemenu').on('click', function () {
	$('.side-info').addClass('info-open');
	$('.offcanvas-overlay').addClass('overlay-open');
})

$('.side-info-close,.offcanvas-overlay').on('click', function () {
	$('.side-info').removeClass('info-open');
	$('.offcanvas-overlay').removeClass('overlay-open');
})
//Data-Background Js
	$("[data-background").each(function () {
	$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
});

//cart active
$('.gota_cart').click(function(){
	$('.cart__sidebar').addClass('open-cart');
	$('.cart-offcanvas-overlay').addClass('open-cart-overlay');
})
$('.cart-icon,.cart-offcanvas-overlay').click(function(){
  $('.cart__sidebar').removeClass('open-cart');
  $('.cart-offcanvas-overlay').removeClass('open-cart-overlay');
})


// WOW active
new WOW().init();


//login hide show
$('.login').click(function(){
	$('.sm_login_wrapper').fadeToggle();
})

  //sidbar
  $(".open").click(function(){
	$(".mega-sidebar").addClass("open-sidebar");
  });

  $(".close").click(function(){
	$(".mega-sidebar").removeClass("open-sidebar");
  });

//testimonial active
var swiper2 = new Swiper('.testimonial', {
	pagination: {
	  el: '.swiper-pagination',
	  dynamicBullets: true,
	},
  });

//swiper active
var swiper3 = new Swiper('.slider-active', {
	direction: 'vertical',
	slidesPerView: 1,
	spaceBetween: 0,
	loop: true,
	pagination: {
	  el: '.swiper-pagination',
	  clickable: true,
	  
	},
	
  });
  var swiper4 = new Swiper('.slider-active2', {
	direction: 'vertical',
	slidesPerView: 1,
	spaceBetween: 0,
	pagination: {
	  el: '.swiper-pagination',
	  clickable: true,
	  
	},
	
  });

  //price filter active
  	/* Price filter active */
	if ($("#slider-range").length) {
		$("#slider-range").slider({
			range: true,
			min: 0,
			max: 500,
			values: [75, 300],
			slide: function (event, ui) {
				$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
			}
		});
		$("#amount").val("$" + $("#slider-range").slider("values", 0) +
			" - $" + $("#slider-range").slider("values", 1));
		$('#filter-btn').on('click', function () {
			$('.filter-widget').slideToggle(1000);
		});

	}

	if ($("#slider-range-2").length) {
		$("#slider-range-2").slider({
			range: true,
			min: 0,
			max: 500,
			values: [75, 300],
			slide: function (event, ui) {
				$("#amount-2").val("$" + ui.values[0] + " - $" + ui.values[1]);
			}
		});
		$("#amount-2").val("$" + $("#slider-range-2").slider("values", 0) +
			" - $" + $("#slider-range-2").slider("values", 1));
		$('#filter-btn-2').on('click', function () {
			$('.filter-widget').slideToggle(1000);
		});

	}

	// filter widget toggle
	$('.filter-popup').hide();
	$('.filter-widget-toggle').on('click',function(){
		$('.filter-popup').slideToggle(500);
	})

  $(".search_form").click(function(){
	$(".search_area").slideToggle();
  });
  
  $(".search_close").click(function(){
	$(".search_area").slideUp(500);
  });



  if (jQuery(".product-active").length > 0) {
	let swiper8 = new Swiper('.product-active', {
		slidesPerView: 4,
		spaceBetween: 30,
		observer: true,
		observeParents: true,
		loop: false,


		// If we need pagination
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 20
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			  spaceBetween: 30
			},
			576: {
				slidesPerView: 2,
				spaceBetween: 30
			  },
			768: {
			slidesPerView: 2,
			spaceBetween: 30
			},
			// when window width is >= 640px
			640: {
			  slidesPerView: 2,
			  spaceBetween: 40
			},
			800: {
				slidesPerView: 2,
				spaceBetween: 40
			  },
			992: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			  1200: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			  1600: {
				slidesPerView: 4,
				spaceBetween: 40
			  },
		  }
	})
	
}


if (jQuery(".product-active2").length > 0) {
	let swiper9 = new Swiper('.product-active2', {
		slidesPerView: 4,
		spaceBetween: 30,
		loop: false,


		// If we need pagination
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 20
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			  spaceBetween: 30
			},
			576: {
				slidesPerView: 2,
				spaceBetween: 30
			  },
			768: {
			slidesPerView: 2,
			spaceBetween: 30
			},
			992: {
				slidesPerView: 2,
				spaceBetween: 40
			  },
			  1200: {
				slidesPerView: 2,
				spaceBetween: 40
			  },
			  1600: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
		  }
	})
	
}

if (jQuery(".testimonial-active").length > 0) {
	let swiper10 = new Swiper('.testimonial-active', {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: false,


		// If we need pagination
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 20
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			  spaceBetween: 30
			},
			576: {
				slidesPerView: 1,
				spaceBetween: 30
			  },
			768: {
			slidesPerView: 1,
			spaceBetween: 30
			},
			800: {
				slidesPerView: 1,
				spaceBetween: 40
			  },
			1040: {
				slidesPerView: 1,
				spaceBetween: 40
			  },
			  1200: {
				slidesPerView: 1,
				spaceBetween: 40
			  },
			  1600: {
				slidesPerView: 1,
				spaceBetween: 40
			  },
		  }
	})
	
}
if (jQuery(".brand-active").length > 0) {
	let swiper11 = new Swiper('.brand-active', {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: false,


		// If we need pagination
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 20
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			  spaceBetween: 30
			},
			576: {
				slidesPerView: 1,
				spaceBetween: 30
			  },
			768: {
			slidesPerView: 1,
			spaceBetween: 30
			},
			800: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			1040: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			  1200: {
				slidesPerView: 4,
				spaceBetween: 40
			  },
			  1600: {
				slidesPerView: 5,
				spaceBetween: 40
			  },
		  }
	})
	
}

if (jQuery(".h-2-product-active").length > 0) {
	let swiper12 = new Swiper('.h-2-product-active', {
		slidesPerView: 5,
		spaceBetween: 30,
		loop: false,


		// If we need pagination
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},

		// Navigation arrows
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 20
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			  spaceBetween: 30
			},
			700: {
				slidesPerView: 2,
				spaceBetween: 40
			  },
			1040: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			  1200: {
				slidesPerView: 3,
				spaceBetween: 40
			  },
			  1600: {
				slidesPerView: 5,
				spaceBetween: 40
			  },
		  }
	})
	
}
// product countdown
$(".countdown").countdown();

  /* magnificPopup img view */
  $(".popup-image").magnificPopup({
    type: "image",
    gallery: {
      enabled: true
    }
  });

  /* magnificPopup video view */
  $(".popup-video").magnificPopup({
    type: "iframe"
  });

  $(".gota_vertical_menu").click(function(){
	$(".vertical-dropdown").slideToggle(500);
  });

  //filter toggle
  $('.open-filter').click(function(){
	  $('.filter-content').slideToggle();
  })
//  product popup
$('.view').on('click',function() {
	$('.overlay,.product-popup').addClass('show-popup');
});

$('.overlay,.product-p-close').on('click',function() {
	$('.overlay,.product-popup').removeClass('show-popup');
});

$('.cart_close').click(function(){
	$('.add_cart_product').hide();
})





})(jQuery);