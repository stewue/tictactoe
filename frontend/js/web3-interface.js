Web3InterfaceToServer = {
	web3 : null,
	url : null,
	ABI : null,
	contractAddress : null,
	contract : null,
	gas : 0,
	password : "",
	
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
		
		this.unlockAllAccounts( function(){
			Web3InterfaceToServer.contract.methods.create( 
					Frontend.players, 
					Web3InterfaceToServer.web3.utils.toWei( Frontend.deposit.toString(), 'Ether') 
				)
				.send({ 'from' : Frontend.players[0], 'value' : Web3InterfaceToServer.web3.utils.toWei( Frontend.deposit.toString(), 'Ether'), 'gas' : Web3InterfaceToServer.gas })
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
			});
	},
	
	// helper function for create game
	secondPlayerPay : function ( callback ){
		this.unlockAllAccounts( function(){
			Web3InterfaceToServer.contract.methods.deposit( Frontend.gameId )
				.send({ 'from' : Frontend.players[1], 'value' : Web3InterfaceToServer.web3.utils.toWei( Frontend.deposit.toString(), 'Ether'), 'gas' : Web3InterfaceToServer.gas })
				.then( function( result, error ){  
					console.log('----------');
					console.log('secondPlayerPay:');
					console.log(error);
					console.log(result);
					console.log('----------');

					Web3InterfaceToServer.checkIfPaid( callback );
				});
		});
	},
	
	// helper function for create game
	checkIfPaid : function ( callback ){
		this.unlockAllAccounts( function(){
			Web3InterfaceToServer.contract.methods.haveBothPaid( Frontend.gameId )
				.send({ 'from' : Frontend.game.getCurrentPlayerAddress(), 'gas' : Web3InterfaceToServer.gas })
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
		});
	},
	
	// make a turn
	makeTurn : function ( fieldId, callback ){
		Frontend.waiting.start();
		
		this.unlockAllAccounts( function(){
			Web3InterfaceToServer.contract.methods.play( Frontend.gameId, fieldId )
				.send({ 'from' : Frontend.game.getCurrentPlayerAddress(), 'gas' : Web3InterfaceToServer.gas })
				.then( function( result, error ){ 
					console.log('----------');
					console.log('makeTurn (fieldId->' + fieldId + '):');
					console.log(error);
					console.log(result);
					console.log('----------');

					Frontend.waiting.stop(); 
					callback(); 
				});
		});
	},
	
	// get the balance of an account
	getBalance : function( address, callback ){
		Web3InterfaceToServer.web3.eth.getBalance( address ).then(function( result, error ){
			console.log('----------');
			console.log('getBalance (address->' + address + '):');
			console.log(error);
			console.log(result);
			console.log('----------');
			
			callback( address, result );
		});
	},
	
	// get Game object
	getGameObject : function ( gameId, callback ){
		this.contract.methods.getGame( gameId ).call()
			.then( function( result, error ){  			
				console.log('----------');
				console.log('getGameObject (gameId->' + gameId + '):');
				console.log(error);
				console.log(result);
				console.log('----------');

				callback( result ); 
			});
	},
	
	unlockAllAccounts : function ( callback ){
		var total = 0;
		var counter = 0;
		this.web3.eth.getAccounts().then(function( result, error ){ 
			total = result.length;
			for( var i = 0; i < result.length; i++ ){
				Web3InterfaceToServer.web3.eth.personal.unlockAccount( result[i], Web3InterfaceToServer.password, 9999 ).then(function( result, error ){ 
					counter++;
					
					if( counter == total ){
						console.log( 'Unlock all accounts' );
						callback();
					}
				});
			}
		});
	}
};