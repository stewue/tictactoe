Web3InterfaceToServer = {
	web3 : null,
	url : null,
	ABI : null,
	contractAddress : null,
	contract : null,
	gas : 0,
	
	init : function (){
		this.web3 = new Web3( new Web3.providers.HttpProvider( this.url ) );
		this.contract = new this.web3.eth.Contract( this.ABI, this.contractAddress );
	},
	
	// load all local addresses from the node
	getAddresses : function ( callback ){
		Frontend.waiting.start();
		
		this.web3.eth.getAccounts().then(function( result, error ){ 
			console.log('----------');
			console.log('getAddresses:');
			console.log(error);
			console.log(result);
			console.log('----------');
			
			Frontend.waiting.stop();
			callback( result );
		});
	},
	
	// create new game object in contract
	createGame : function ( callback ){
		Frontend.waiting.start();

		this.contract.methods.create( 
				Frontend.players, 
				this.web3.utils.toWei( Frontend.deposit.toString(), 'Ether') 
			)
			.send({ 'from' : Frontend.players[0], 'value' : this.web3.utils.toWei( Frontend.deposit.toString(), 'Ether'), 'gas' : this.gas })
			.then( function( result, error ){ 
				
			
				Frontend.gameId = result.events.GameObject.returnValues['gameId'];
			
				console.log('----------');
				console.log('createGame:');
				console.log(error);
				console.log(result);
				console.log('GameId is:' + Frontend.gameId );
				console.log('----------');

				Web3InterfaceToServer.secondPlayerPay( callback );	
			});
	},
	
	// helper function for create game
	secondPlayerPay : function ( callback ){
		this.contract.methods.deposit( Frontend.gameId )
			.send({ 'from' : Frontend.players[1], 'value' : this.web3.utils.toWei( Frontend.deposit.toString(), 'Ether'), 'gas' : this.gas })
			.then( function( result, error ){  
				console.log('----------');
				console.log('secondPlayerPay:');
				console.log(error);
				console.log(result);
				console.log('----------');
			
				Web3InterfaceToServer.checkIfPaid( callback );
			});
		
	},
	
	// helper function for create game
	checkIfPaid : function ( callback ){
		this.contract.methods.hasBothPaid( Frontend.gameId ).call()
			.then( function( result, error ){  
				Frontend.waiting.stop(); 
			
				console.log('----------');
				console.log('checkIfPaid:');
				console.log(error);
				console.log(result);
				console.log('----------');
			
				if( result ){
					callback(); 
				}
				else {
					alert('At least one player has not paid the deposit');
				}
			});
	},
	
	// make a turn
	makeTurn : function ( fieldId, callback ){
		Frontend.waiting.start();
		
		this.contract.methods.play( Frontend.gameId, fieldId )
			.send({ 'from' : Frontend.game.getCurrentPlayerAddress(), 'gas' : this.gas })
			.then( function( result, error ){ 
				console.log('----------');
				console.log('makeTurn (fieldId->' + fieldId + '):');
				console.log(error);
				console.log(result);
				console.log('----------');
			
				Frontend.waiting.stop(); 
				callback(); 
			});
	}
};