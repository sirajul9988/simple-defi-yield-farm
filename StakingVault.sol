// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingVault is ReentrancyGuard {
    IERC20 public stakingToken;
    IERC20 public rewardToken;

    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public startTime;

    uint256 public rewardRate = 100; // Rewards per second (wei)

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        // Claim pending rewards before updating balance
        claimRewards();

        stakingBalance[msg.sender] += amount;
        startTime[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(stakingBalance[msg.sender] >= amount, "Insufficient balance");
        
        claimRewards();

        stakingBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() public {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            startTime[msg.sender] = block.timestamp; // Reset timer
            rewardToken.transfer(msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    function calculateReward(address user) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - startTime[user];
        return (stakingBalance[user] * rewardRate * timeElapsed) / 1e18;
    }
}
