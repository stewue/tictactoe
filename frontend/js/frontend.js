Frontend = {
	// lobby
	addresses : [],
	balance : {},
	// game
	gameId : null,
	players : [],
	turnId : 0,
	board : [],
	deposit : null,
	init : function(){
		this.helpers.init();
		
		// init the slider
		$( "#slider" ).slider({
			change: function( event, ui ) {
				var etherValue = Frontend.lobby.slider.getEtherValue( ui.value );
				
				Frontend.deposit = etherValue;
				$( "#sliderValue" ).text( etherValue + " Ether" );
			}
		});
		
		this.lobby.show();
	},
	
	lobby : {
		// load addresses from this node and create lobby
		show : function (){
			// reset players
			Frontend.players = [];
			
			$('#grey').css('display', 'none');
			$('#grey #infobox').css('display', 'none');
			$('#game').css('display', 'none');
			$('#lobby').css('display', 'block');
			$('.showIfReady').css('display', 'none');
			
			this.slider.init();

			// load all local addresses from the node
			Web3InterfaceToServer.getAddresses( function ( addresses ){
				Frontend.addresses = addresses;
		
				// Get balance
				for( var i = 0; i < Frontend.addresses.length; i++ ){
					Web3InterfaceToServer.getBalance( Frontend.addresses[i], function( address, balance ){
						Frontend.balance[ address ] = Frontend.helpers.weiToEther( balance );
						
						// check if all balances loaded
						if( Frontend.addresses.length == Object.keys(Frontend.balance).length ){
							Frontend.lobby.displayPlayersList();
						}
					});
				}
			});
		},
		
		// load balance of each account
		displayPlayersList : function (){
			
			$('#lobby #addresses').empty();
			
			$.each( Frontend.addresses, function( key, value ){
				$('<div class="address" />').attr('id', value).html( value + "<br/>" + Frontend.balance[ value ] + " Ether" ).appendTo('#lobby #addresses');
			});

			$('.address').click( function(){
				var address = $(this).attr('id');
				var selected = $(this).hasClass('selected');
				Frontend.lobby.playerSelectOrDeselect( address, selected, $(this) );
			});
		},
		
		// select or deselect a player in the lobby
		playerSelectOrDeselect : function ( address, selected, element ){			
			if( selected ){
				// deselect player 
				Frontend.players.remove( address );
				$(element).removeClass('selected');
			}
			else{
				// select player, if there are less than two players
				if( Frontend.players.length < 2 ){
					Frontend.players.push( address );
					$(element).addClass('selected');
				}
			}
			
			// Show or hide start button
			if( Frontend.players.length == 2 ){
				$('.showIfReady').css('display', 'block');
			}
			else{
				$('.showIfReady').css('display', 'none');
			}
		},
		
		slider : {
			// calculate from slider value the ether value (transformation & e^x function)
			getEtherValue : function ( sliderValue ){
				var etherValue = sliderValue / 10;
				etherValue = etherValue - 5;
				etherValue = Math.round(etherValue);
				etherValue = Math.pow(10, etherValue);
				return etherValue;
			},
			// set init value to 1 ether
			init : function (){
				$( "#slider" ).slider( "value", 30 );
				$( "#sliderValue" ).text( "0.01 Ether" );
			}
		},
		
		startGame : function (){
			// create new game object in contract
			Web3InterfaceToServer.createGame( function ( players ){				
				Frontend.game.init();
			});			
		}
	},
	
	game : {
		// reset all values from the game and make it ready for a new one
		init : function (){
			$('#game').css('display', 'block');
			$('#lobby').css('display', 'none');
			
			// reset all
			Frontend.turnId = 0;
			Frontend.board = [ -1, -1, -1, -1, -1, -1, -1, -1, -1 ];
			Frontend.deposit = 0.01;
			this.resetBoard();
			
			$('#header #player_0 .name').text( Frontend.players[0] );
			$('#header #player_1 .name').text( Frontend.players[1] );
			
			this.highlightCurrentPlayer();
		},
		getCurrentPlayer : function (){
			return Frontend.turnId % 2;
		},
		getCurrentPlayerAddress : function (){
			return Frontend.players[ this.getCurrentPlayer() ];
		},
		nextTurn : function (){
			Frontend.turnId++;
			this.highlightCurrentPlayer();
		},
		// highlight the current player in the UI
		highlightCurrentPlayer : function (){
			$('.player').removeClass('yourTurn');
			
			$('#player_' + this.getCurrentPlayer() ).addClass('yourTurn');
		},
		// make a turn (update UI and send it to server)
		makeTurn : function ( fieldId ){			
			if( Frontend.board[fieldId] == -1 ){
				var player = this.getCurrentPlayer();
				Frontend.board[fieldId] = player;
				
				$('<img />').attr( 'src', this.getImg(player) ).appendTo( '#field_' + fieldId );
				
				// make a turn
				Web3InterfaceToServer.makeTurn( fieldId, function ( players ){				
					Frontend.game.isFinished();
					Frontend.game.nextTurn();
				});	
			}
		},
		// check if game is finished
		isFinished : function (){
			var row1 = Frontend.board[0] == Frontend.board[1] && Frontend.board[0] == Frontend.board[2] && Frontend.board[0] != -1;
			var row2 = Frontend.board[3] == Frontend.board[4] && Frontend.board[3] == Frontend.board[5] && Frontend.board[3] != -1;
			var row3 = Frontend.board[6] == Frontend.board[7] && Frontend.board[6] == Frontend.board[8] && Frontend.board[6] != -1;
			var col1 = Frontend.board[0] == Frontend.board[3] && Frontend.board[0] == Frontend.board[6] && Frontend.board[0] != -1;
			var col2 = Frontend.board[1] == Frontend.board[4] && Frontend.board[1] == Frontend.board[7] && Frontend.board[1] != -1;
			var col3 = Frontend.board[2] == Frontend.board[5] && Frontend.board[2] == Frontend.board[8] && Frontend.board[2] != -1;
			var dia1 = Frontend.board[0] == Frontend.board[4] && Frontend.board[0] == Frontend.board[8] && Frontend.board[0] != -1;
			var dia2 = Frontend.board[2] == Frontend.board[4] && Frontend.board[2] == Frontend.board[6] && Frontend.board[2] != -1;
			
			// 3 in row, column or diagonal
			if( row1 || row2 || row3 || col1 || col2 || col3 || dia1 || dia2 ){
				this.showWinner( false );
			}
			// no winner
			else if( Frontend.turnId >= 8 ){
				this.showWinner( true );
			}
		},
		// display winner message
		showWinner : function ( isDraw ){
			if( isDraw ){
				var msg = 'There is no winner and both get '+  Frontend.deposit +' Ether back!';
			}
			else{
				var msg = 'The address "' + this.getCurrentPlayerAddress() + '" wins ' + ( 2 * Frontend.deposit ) + ' Ether!';
			}
			
			$('#grey').css('display', 'block');
			$('#grey #infobox').css('display', 'block');
			$('#grey #infobox #msg').html( msg + '<div class="button" id="backLobby" onclick="Frontend.lobby.show()">Back to Lobby</div>');
		},
		getImg : function ( playerId ){
			return playerId == 0 ? 'img/nought.png' : 'img/cross.png';
		},
		resetBoard : function (){
			$('#board .field').empty();
		}
	},
	
	waiting : {
		start : function (){
			$('#grey').css('display', 'block');
			$('#grey #waiting').css('display', 'block');
		},
		stop : function (){
			$('#grey').css('display', 'none');
			$('#grey #waiting').css('display', 'none');
		}
	},
	
	helpers : {
		init : function (){
			// add a function to remove a value from an array
			Array.prototype.remove = function() {
				var what, a = arguments, L = a.length, ax;
				while (L && this.length) {
					what = a[--L];
					while ((ax = this.indexOf(what)) !== -1) {
						this.splice(ax, 1);
					}
				}
				return this;
			};
		},
		
		weiToEther : function ( wei ){
			return wei / 1000000000000000000;
		}
	}
	
};