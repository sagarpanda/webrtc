app.views.onboardmsg = (function(){
	var el = ".onboard_msg_box";
	var render = function(data){
		
	};
	var add = function(msg){
		$(el).append('<div>'+msg+'</div>');
	};
	var remove = function(data){
		//$('#'+data.userid).remove();
	};
	return{
		render: render,
		add: add,
		remove: remove
	}
})();