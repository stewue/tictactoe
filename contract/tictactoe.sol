pragma solidity ^0.4.21;

contract TicTacToe {

	struct Game {
		uint incremental;
		address[2] players;
		uint moveCounter;
		address[9] board;
		uint deposit;
		bool[2] depositPayed;
		bool finished;
	}

	uint counter = 0;
	mapping (uint => Game) games;

	event GameObject( uint gameId, uint incremental, uint moveCounter );
	
	/*
		Create a new game with two players and a deposit
	*/
	function create( address[2] playerObj, uint depositObj ) public payable {
		// player cannot play against itself
		if(playerObj[0] != playerObj[1]){
			uint gameId = counter;
			games[gameId].incremental = 1;
			games[gameId].players = playerObj;
			games[gameId].deposit = depositObj;

			counter++;
			
			deposit( gameId );
		}
	}

	/*
		Player pays his deposit
	*/
	function deposit( uint gameId ) public payable {
		if ( msg.sender == games[gameId].players[0] && msg.value == games[gameId].deposit && !games[gameId].depositPayed[0] ) {
			games[gameId].depositPayed[0] = true;
			games[gameId].incremental++;
		} 
		else if ( msg.sender == games[gameId].players[1] && msg.value == games[gameId].deposit && !games[gameId].depositPayed[1] ){
			games[gameId].depositPayed[1] = true;
			games[gameId].incremental++;
		}
		
		GameObject( gameId, games[gameId].incremental, games[gameId].moveCounter );
	}

	/*
		Player make a turn
	*/
	function play ( uint gameId, uint fieldId ) public {
		// check if fieldId is a valid number
		require( fieldId >= 0 && fieldId <= 8 );
		// check if its your turn
		require( getCurrentPlayer( gameId ) == msg.sender );

		// only if game is running and field is empty, your turn is valid
		if( isRunning( gameId ) && isFieldEmpty( gameId, fieldId ) ){
			games[gameId].board[ fieldId ] = msg.sender;
			games[gameId].incremental++;
			
			hasWinner( gameId );
			
			games[gameId].moveCounter++;	
		}
	}
	
	/*
		Check if we have a winner
	*/
	function hasWinner ( uint gameId ) private {
		bool row1 = games[gameId].board[0] == games[gameId].board[1] && (games[gameId].board[0] == games[gameId].board[2]) && !isFieldEmpty( gameId, 0 );
		bool row2 = games[gameId].board[3] == games[gameId].board[4] && games[gameId].board[3] == games[gameId].board[5] && !isFieldEmpty( gameId, 3 );
		bool row3 = games[gameId].board[6] == games[gameId].board[7] && games[gameId].board[6] == games[gameId].board[8] && !isFieldEmpty( gameId, 6 );
		bool col1 = games[gameId].board[0] == games[gameId].board[3] && games[gameId].board[0] == games[gameId].board[6] && !isFieldEmpty( gameId, 0 );
		bool col2 = games[gameId].board[1] == games[gameId].board[4] && games[gameId].board[1] == games[gameId].board[7] && !isFieldEmpty( gameId, 1 );
		bool col3 = games[gameId].board[2] == games[gameId].board[5] && games[gameId].board[2] == games[gameId].board[8] && !isFieldEmpty( gameId, 2 );
		bool dia1 = games[gameId].board[0] == games[gameId].board[4] && games[gameId].board[0] == games[gameId].board[8] && !isFieldEmpty( gameId, 0 );
		bool dia2 = games[gameId].board[2] == games[gameId].board[4] && games[gameId].board[2] == games[gameId].board[6] && !isFieldEmpty( gameId, 2 );
			
		// 3 in row, column or diagonal
		if( row1 || row2 || row3 || col1 || col2 || col3 || dia1 || dia2 ){
			// he gets 2x the deposit
			address winnerAddress = getCurrentPlayer( gameId );
			winnerAddress.transfer( 2 * games[gameId].deposit );
			
			games[gameId].finished = true;
		}
		// no winner / draw
		else if( games[gameId].moveCounter >= 8 ){			
			// both get 1x the deposit
			games[gameId].players[0].transfer( games[gameId].deposit );
			games[gameId].players[1].transfer( games[gameId].deposit );
			
			games[gameId].finished = true;
		}
	}
	
	/*
		Check if game is running (not finished, but already started)
	*/
	function isRunning ( uint gameId ) public constant returns (bool) {
		return !games[gameId].finished && haveBothPaid( gameId );
	}
	
	/*
		Check if both players have paid the deposit
	*/
	function haveBothPaid ( uint gameId ) public constant returns (bool) {
		return games[gameId].depositPayed[0] && games[gameId].depositPayed[1];
	}
	
	/*
		Get the number of games in the contract
	*/
	function getCounter () public constant returns (uint) {
		return counter;
	}
	
	/*
		Get the address of the player, who can currently play
	*/
	function getCurrentPlayer( uint gameId ) public constant returns (address) {
		uint playerId = games[gameId].moveCounter % 2;
		return games[gameId].players[ playerId ];
	}
	
	/*
		Check if a field in a game is empty
	*/
	function isFieldEmpty ( uint gameId, uint fieldId  ) private constant returns (bool){
		return games[gameId].board[ fieldId ] == 0x0000000000000000000000000000000000000000;
	}

	/*
		Get the game object for debugging
	*/
	function getGame ( uint gameId ) public constant returns ( uint, address[2], uint, address[9], uint, bool[2], bool ) {
		return (games[gameId].incremental, games[gameId].players, games[gameId].moveCounter, games[gameId].board, games[gameId].deposit, games[gameId].depositPayed, games[gameId].finished );
	}
}