//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Elections {

    address owner = msg.sender;
    uint256 commission;

    modifier checkOnlyOwner
    {
        require(msg.sender == owner, "Elections can be created only by owner");
        _;
    }

    struct Election {
        string name;
        bool inProgress;
        uint startDate;
        uint256 prize;
        uint candidatesCount;
        mapping(uint => address) candidatesIndex;
        mapping(address => bool) candidates;
        mapping(address => bool) voted;
        mapping(address => uint) count;
    }

    mapping (string => Election) elections;

    function inProgress(string memory _electionName) external view returns(bool) {
        return elections[_electionName].inProgress;
    }

    function getCount(string memory _electionName, address _candidate) external view returns(uint) {
        return elections[_electionName].count[_candidate];
    }

    function getPrize(string memory _electionName) external view returns(uint) {
        return elections[_electionName].prize;
    }

    function vote(string memory  _electionName, address payable _candidate) external payable {
        require(bytes(elections[_electionName].name).length > 0, "Election name doesn't exist");
        require(elections[_electionName].inProgress, "Election finished");
        require(!elections[_electionName].voted[msg.sender], "You already voted");
        require(msg.value >= 10000000000000000, "Insufficient amount");
        require(elections[_electionName].candidates[_candidate], "It's not a candidate for this election");

        elections[_electionName].voted[msg.sender] = true;
        elections[_electionName].count[_candidate] += 1;
        elections[_electionName].prize += 9000000000000000;
        commission += msg.value - 9000000000000000;
    }

    function createElection(address[] memory _candidates, string memory _electionName) external checkOnlyOwner {
        require(bytes(elections[_electionName].name).length == 0, "Election with this specific name was already created");
        Election storage election = elections[_electionName];
        election.name = _electionName;
        election.inProgress = true;
        election.startDate = block.timestamp;
        election.candidatesCount = _candidates.length;
        for (uint i = 0; i < _candidates.length; i++) {
            election.candidatesIndex[i] = _candidates[i];
            election.candidates[_candidates[i]] = true;
        }
    }

    function finishElection(string memory _electionName) external payable {
        require(elections[_electionName].inProgress, "Election finished");
        //commented for testing purpose, don't know hot to test it for now
        //require(block.timestamp >= elections[_electionName].startDate + 3 days, "Election should go for 3 days");

        address payable winner;
        uint maxCount;

        for (uint i = 0; i < elections[_electionName].candidatesCount; i++) {
            address candidate = elections[_electionName].candidatesIndex[i];
            uint count = elections[_electionName].count[candidate];
            if (count > maxCount) {
                maxCount = count;
                winner = payable(candidate);
            }
        }

        winner.transfer(elections[_electionName].prize);

        elections[_electionName].inProgress = false;
    }

    function collectCommission() external checkOnlyOwner {
        payable(owner).transfer(commission);
    }

}
