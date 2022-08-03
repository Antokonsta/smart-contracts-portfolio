// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./MyERC20Token.sol";

/// @title DAO protocol for voting
/// @author Anton Konstantinov
contract MyDaoContract {
    address public chairman;
    uint256 private minimumVotes;
    uint256 private duration;
    uint256 private proposalCounter;
    MyERC20Token private voteToken;

    struct Proposal {
        uint256 finishTime;
        uint256 votesFor;
        uint256 votesAgainst;
        address recipient;
        bytes callData;
        string description;
    }

    struct Voter {
        uint256 deposit;
        uint256 withdrawTime;
        mapping(uint256 => uint256) votedAmount;
    }

    mapping(uint256 => Proposal) private _proposals;
    mapping(address => Voter) private _voters;

    constructor(
        address _chairman,
        address _voteToken,
        uint256 _minimumVotes,
        uint256 _duration
    ) {
        chairman = _chairman;
        voteToken = MyERC20Token(_voteToken);
        minimumVotes = _minimumVotes;
        duration = _duration;
    }


    modifier onlyChairman {
        require(msg.sender == chairman, "Chairman only");
        _;
    }


    /// @notice Function for adding new proposal
    /// @param _callData of the function that will be called in case votesFor will have more votes than votesAgains (should be encoded as bytes)
    /// @param _recipient address of the contract that will call the function
    function addProposal(bytes memory _callData, address _recipient, string memory _description) external onlyChairman returns(uint256) {
        Proposal storage newProposal = _proposals[proposalCounter];

        emit NewProposal(proposalCounter, _recipient, _description);

        proposalCounter++;

        newProposal.finishTime = block.timestamp + duration;
        newProposal.recipient = _recipient;
        newProposal.callData = _callData;
        newProposal.description = _description;

        return proposalCounter;
    }


    /// @notice To vote need to have tokens to be deposited
    function vote(uint256 proposalID, uint256 amount, bool isVoteFor) public {
        Proposal storage proposal = _proposals[proposalID];
        Voter storage voter = _voters[msg.sender];

        require(proposal.finishTime > 0, "Proposal is not active");
        require(voter.deposit - voter.votedAmount[proposalID] >= amount, "Not enough tokens");

        if (isVoteFor) {
            proposal.votesFor += amount;
            voter.votedAmount[proposalID] += amount;
        } else {
            proposal.votesAgainst += amount;
            voter.votedAmount[proposalID] += amount;
        }

        if (voter.withdrawTime < proposal.finishTime) {
            voter.withdrawTime = proposal.finishTime;
        }
    }


    /// @notice can be called by anyone to finish proposal
    function finishProposal(uint256 proposalID) public {
        Proposal storage proposal = _proposals[proposalID];
        require(proposal.finishTime > 0, "Proposal is not active");
        require(block.timestamp >= proposal.finishTime, "Proposal is not finished");
        require(proposal.votesFor + proposal.votesAgainst >= minimumVotes, "Not enough votes");

        bool isCalling = proposal.votesFor > proposal.votesAgainst;

        if (isCalling) {
            (bool success, ) = proposal.recipient.call{value: 0}(proposal.callData);
            require(success, "Operation failed");
        }

        emit FinishedProposal(proposalID, isCalling, proposal.votesFor, proposal.votesAgainst);

        proposal.finishTime = 0;
    }


    function deposit(uint256 amount) public {
        voteToken.transferFrom(msg.sender, address(this), amount);
        _voters[msg.sender].deposit += amount;
    }


    function withdraw(uint256 amount) public {
        Voter storage voter = _voters[msg.sender];

        require(block.timestamp >= voter.withdrawTime, "Can't withdraw yet");
        require(voter.deposit >= amount, "Not enough tokens");

        voteToken.transfer(msg.sender, amount);
        voter.deposit -= amount;
    }

    event NewProposal(uint256 indexed id, address recipient, string description);

    event FinishedProposal(uint256 indexed id, bool indexed called, uint256 forVotes, uint256 againstVotes);
}