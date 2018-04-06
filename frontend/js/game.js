Game = {
	gameId : null,
	
	init : function(){
		this.helper.init();
		
		this.gameId = $.urlParam('id');
		
		if( this.gameId == null ){
			alert('Use game.html?id={GAME_ID}');
		}
		else{
			Web3InterfaceToServer.getGameObject( this.gameId, function( result ){
				Game.display( result );
			});
		}
	},
	
	display : function ( result ){
		var players = result[1];
		var moveCounter = result[2];
		var board = result[3];
		var deposit = result[4] / 1000000000000000000;
		var depositPayed = result[5];
		var finished = result[6];
		
		var player1_paid = depositPayed[0];
		var player2_paid = depositPayed[1];
		
		var isRunning =  player1_paid && player2_paid;

		$('#gameId').text( this.gameId );
		$('#deposit').text( deposit );
		$('#player1').text( players[0] + ' (' + (player1_paid == true ? 'paid' : 'NOT paid') + ')' );
		$('#player2').text( players[1] + ' (' + (player2_paid == true ? 'paid' : 'NOT paid') + ')' );
		$('#currentPlayer').text( moveCounter % 2 == 0 ? 'Player1' : 'Player2' );
		$('#started').text( isRunning );
		$('#finished').text( finished );
		
		for( var i=0; i<9; i++ ){
			var text = '';
			
			if( board[i] == players[0] && deposit > 0 )
				text = '1';
			if( board[i] == players[1] && deposit > 0 )
				text = '2';
			
			$('#field' + i).text( text );
		}
	},
	
	helper : {
		init : function (){
			$.urlParam = function(name){
				var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
				if (results==null){
				   return null;
				}
				else{
				   return decodeURI(results[1]) || 0;
				}
			}
		}
	}
};