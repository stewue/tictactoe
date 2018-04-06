Balance = {
	addresses : [],
	balance : {},
	
	init : function(){
		// Get addresses 
		Web3InterfaceToServer.getAddresses( function( addresses ){ 
			Balance.responseAddresses( addresses ); 
		});
	},
	
	responseAddresses : function( addresses ){
		this.addresses = addresses;
		
		// Get balance
		for( var i = 0; i < this.addresses.length; i++ ){
			Web3InterfaceToServer.getBalance( this.addresses[i], function( address, balance ){
				Balance.addBalance( address, balance );
				
				// check if all balances loaded
				if( Balance.addresses.length == Object.keys(Balance.balance).length ){
					Balance.display();
				}
			});
		}
	},
	
	addBalance : function( address, balance ){
		this.balance[ address ] = this.weiToEther( balance );
	},
	
	display : function(){
		var table = $('<table>').appendTo('body');
		
		for( var i = 0; i < this.addresses.length; i++ ){
			var tr = $('<tr>').appendTo( table );
			var tdAddress = $('<td>').text( this.addresses[i] ).appendTo( tr );
			var tdBalance = $('<td>').text( this.balance[ this.addresses[i] ] ).appendTo( tr );
		}
	},
	
	weiToEther : function ( wei ){
		return wei / 1000000000000000000;
	}
};