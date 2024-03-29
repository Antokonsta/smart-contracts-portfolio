// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/// @title Staking contract
/// @author Anton Konstantinov
contract Staking is Ownable, ReentrancyGuard {
    uint256 private rewardPercent;
    uint256 private lockTime;
    uint256 private rewardFrequency;
    mapping(address => Staker) private _stakers;

    ERC20 private lpToken;
    ERC20 private rewardToken;

    event Staked(uint256 amount);
    event Claimed(uint256 amount);
    event Unstaked(uint256 amount);



    struct Staker {
        uint256 claimed;
        uint256 amount;
        uint256 stakeTime;
    }


    /// @param _lpToken Address of Liquidity Pool Token contract in Uniswap
    /// @param _rewardToken Address of Reward Token contract
    constructor(address _lpToken, address _rewardToken) {
        rewardPercent = 20;
        rewardFrequency = 10 minutes;
        lockTime = 20 minutes;
        lpToken = ERC20(_lpToken);
        rewardToken = ERC20(_rewardToken);
    }


    /// @notice Stake function
    function stake(uint256 _amount) external nonReentrant returns (bool) {
        require(_amount > 0, "Staking amount should be more than 0");
        lpToken.transferFrom(msg.sender, address(this), _amount);

        Staker storage s = _stakers[msg.sender];
        s.amount += _amount;
        s.stakeTime = block.timestamp;
        s.claimed = 0;

        emit Staked(_amount);

        return true;
    }

    /// @notice Claims reward
    function claim() external nonReentrant returns (bool) {
        Staker storage s = _stakers[msg.sender];
        uint256 reward;
    unchecked {
        reward = (s.amount * rewardPercent / 100) * ((block.timestamp - s.stakeTime) / rewardFrequency) - s.claimed;
    }
        require(reward > 0, "You have no rewards");
        rewardToken.transfer(msg.sender, reward);
        s.claimed += reward;

        emit Claimed(reward);
        return true;
    }

    /// @notice Unstake all tokens + claim reward
    function unstake() external nonReentrant returns (bool) {
        Staker storage s = _stakers[msg.sender];
        uint256 amount = s.amount;
        require(amount > 0, "You have no deposit");
        require(s.stakeTime + lockTime < block.timestamp, "Lock time isn't finished");

        uint256 reward;
    unchecked {
        reward = (amount * rewardPercent / 100) * ((block.timestamp - s.stakeTime) / rewardFrequency) - s.claimed;
    }
        if (reward > 0) {
            rewardToken.transfer(msg.sender, reward);
        }
        lpToken.transfer(msg.sender, amount);
        s.amount = 0;
        s.claimed = 0;

        emit Unstaked(amount);
        return true;
    }

    //Admins functions
    function setRewardPercent(uint256 _percent) external onlyOwner returns (bool) {
        rewardPercent = _percent;
        return true;
    }

    function setRewardFrequency(uint256 _frequency) external onlyOwner returns (bool) {
        rewardFrequency = _frequency;
        return true;
    }

    function setLockTime(uint256 _time) external onlyOwner returns (bool) {
        lockTime = _time;
        return true;
    }

    function getLpTokenAddress() public view returns (address) {
        return address(lpToken);
    }

    function getRewardTokenAddress() public view returns (address) {
        return address(rewardToken);
    }
}