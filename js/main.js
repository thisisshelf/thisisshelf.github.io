jQuery(document).ready(function($){


	var contentSections = $('.section'),
		navigationItems = $('#vertical-nav a');

	updateNavigation();
	$(window).on('scroll', function(){
		updateNavigation();
	});

	//smooth scroll to the section
	navigationItems.on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });
    //smooth scroll to second section
    $('.scroll-down').on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    //open-close navigation on touch devices
    $('.touch .nav-trigger').on('click', function(){
    	$('.touch #vertical-nav').toggleClass('open');
  
    });
    //close navigation on touch devices when selectin an elemnt from the list
    $('.touch #vertical-nav a').on('click', function(){
    	$('.touch #vertical-nav').removeClass('open');
    });

	function updateNavigation() {
		contentSections.each(function(){
			$this = $(this);
			var activeSection = $('#vertical-nav a[href="#'+$this.attr('id')+'"]').data('number') - 1;
			if ( ( $this.offset().top - $(window).height()/2 < $(window).scrollTop() ) && ( $this.offset().top + $this.height() - $(window).height()/2 > $(window).scrollTop() ) ) {
				navigationItems.eq(activeSection).addClass('is-selected');
			}else {
				navigationItems.eq(activeSection).removeClass('is-selected');
			}
		});
	}

	function smoothScroll(target) {
        $('body,html').animate(
        	{'scrollTop':target.offset().top},
        	600
        );
	}
});

$(document).ready(function() {
	

	
	Parse.initialize("R4Kc0m1jkalwqwTQcCLxrJUOcKC8SDuObIbNj3UV", "4wIsEwMXTzWXK2cpMJWPUHLGSyGoj8EhjiFhK5xV");

	var FormSubmission = Parse.Object.extend("FormSubmission");
	
	$("#checkbox").click(function() {
	
		if($("#checkbox").is(':checked')){
			$("#affiliation-group").show();
			console.log("checked");
		}
		else{
			$("#affiliation-group").hide();
			console.log("checked not");
		}
});
	$("#betaSignUp").on("submit", function(e) {
		e.preventDefault();

		console.log("Handling the submit");
		//add error handling here
		//gather the form data




		var data = {};
		data.name = $("#name").val();
		data.email = $("#email").val();
		data.affiliation = $("#affiliation").val();
		


		var formSubmission = new FormSubmission();
		formSubmission.save(data, {
			success:function() {
				console.log("Success");

				$("#betaSignUp").hide();
				$("#thank-you").show();

			},
			error:function(e) {
				console.dir(e);
			}
		});
		
	});
	
});
