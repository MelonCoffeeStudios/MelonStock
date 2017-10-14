$(function(){
	$('.profileSave').click(function(){
		$temp = $('[name=' + $(this).attr('fieldType') + ']');
		// console.log($temp)
		$temp.removeClass('slideSuccess slideFailure');

		$.post("/profileEdit", {
			field: $(this).attr('fieldType'),
			data : $temp.val()
		}).done(function(data){
			console.log(data + 'bant')
			$temp.addClass('slideSuccess');
		})
	})
})