app.views.userlist = (function(){
	var el = ".live_users";
	var render = function(data){
		for(var i in data){
			$(el).append(getHtmlStr(data[i]));
		}
	};
	var add = function(data){
		$(el).append(getHtmlStr(data));
	};
	var remove = function(data){
		$('#'+data.users).remove();
	};
	var getHtmlStr = function(data){
		return '<li id="'+data.users+'" onclick="app.rtcCall(\''+data.users+'\');">'+data.name+'</li>';
	};
	return{
		render: render,
		add: add,
		remove: remove
	}
})();