app.views.userlist = (function(){
	var el = ".main";
	var render = function(data){

	};
	var add = function(data){
		$(el).append('<div id="'+data.userid+'">'+data.name+'</div>');
	};
	var remove = function(data){
		$('#'+data.userid).remove();
	};
	return{
		render: render,
		add: add,
		remove: remove
	}
})();