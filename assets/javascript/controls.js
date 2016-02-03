/*Controls for loader and disclaimer*/
$(document).ready(function(){
  setTimeout(function(){
    $('#back-cover').css("background", "rgba(191, 191, 191, .4)");
    $('#cog-icon').fadeOut("slow", function(){
      $('#click-thru').fadeIn("slow");
    });
  }, 1500);
});

$('#user-accepted').click(function(){
  $('#back-cover').fadeOut(2000);
});

/*Search controls*/
$('#muni-search').on('focus blur', toggleFocus);

function toggleFocus(e){
    if( e.type == 'focus' )
        $('#search-icon').removeClass("fa-search").addClass("fa-spinner fa-pulse");

    else
        $('#search-icon').removeClass("fa-spinner fa-pulse").addClass("fa-search");
}

/* Prevent hitting enter from refreshing the page */
$("#muni-search").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

