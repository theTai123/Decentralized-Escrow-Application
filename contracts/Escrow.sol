// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Escrow {
	address public arbiter1;
	address public arbiter2;
	address public beneficiary;
	address public depositor;
	mapping(address => bool) isApprove;

	bool public isApproved;

	constructor(address _arbiter1, address _arbiter2, address _beneficiary) payable {
		arbiter1 = _arbiter1;
		arbiter2 = _arbiter2;
		beneficiary = _beneficiary;
		depositor = msg.sender;
	}

	event Approved(uint);
 
	uint public approveCount = 0;
	function approve() external {
		require(msg.sender == arbiter1 || msg.sender == arbiter2,"Wrong arbiter!");
		require(!isApprove[msg.sender],"Aribiter has apporved!");
		if(approveCount <= 1) {
			approveCount++;
			isApprove[msg.sender] = true;
		}

		if(approveCount == 2) {
			uint balance = address(this).balance;
			(bool sent, ) = payable(beneficiary).call{value: balance}("");
			require(sent, "Failed to send Ether");
			emit Approved(balance);
			isApproved = true;
		}
	}
}
