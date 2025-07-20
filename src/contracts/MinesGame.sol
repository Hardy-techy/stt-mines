// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MinesGame {
  address public owner;
  uint256 public houseBalance;
  uint256 public constant MAX_WAGER = 15 ether; // 15 STT
  uint256 public constant MIN_WAGER = 0.25 ether; // 0.25 STT
    
    // mapping(address => uint256) public lastPlayDate;  // Removed daily limit
    struct Game {
        address player;
        uint256 wager;
        uint256 mineCount;
        bytes32 seedHash;
        bool isActive;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Game) public games;
    // mapping(address => uint256) public dailyWagered;  // Removed daily limit
    // mapping(address => uint256) public lastPlayDate;  // Removed daily limit
    
    event GameStarted(bytes32 indexed gameId, address indexed player, uint256 wager, uint256 mineCount);
    event GameEnded(bytes32 indexed gameId, address indexed player, uint256 payout, bool won);
    event SeedRevealed(bytes32 indexed gameId, string seed);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function startGame(bytes32 gameId, bytes32 seedHash, uint256 mineCount) external payable {
        require(msg.value >= MIN_WAGER && msg.value <= MAX_WAGER, "Invalid wager amount");
        require(mineCount >= 3 && mineCount <= 10, "Invalid mine count");
        require(games[gameId].player == address(0), "Game ID already exists");

        // Daily limit check
        // if (block.timestamp / 86400 != lastPlayDate[msg.sender] / 86400) {
        //     dailyWagered[msg.sender] = 0;
        // }
        // require(dailyWagered[msg.sender] + msg.value <= 10 ether, "Daily limit exceeded");

        games[gameId] = Game({
            player: msg.sender,
            wager: msg.value,
            mineCount: mineCount,
            seedHash: seedHash,
            isActive: true,
            timestamp: block.timestamp
        });

        // dailyWagered[msg.sender] += msg.value;
        // lastPlayDate[msg.sender] = block.timestamp;
        houseBalance += msg.value;
        
        emit GameStarted(gameId, msg.sender, msg.value, mineCount);
    }
    
    function cashOut(bytes32 gameId, uint256 multiplier, string calldata seed) external {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(game.isActive, "Game not active");
        require(keccak256(abi.encodePacked(seed)) == game.seedHash, "Invalid seed");
        
        game.isActive = false;
        
        uint256 grossPayout = (game.wager * multiplier) / 1000;
        uint256 netPayout = grossPayout;
        
        require(houseBalance >= netPayout, "Insufficient house balance");
        houseBalance -= netPayout;
        
        payable(msg.sender).transfer(netPayout);
        
        emit GameEnded(gameId, msg.sender, netPayout, true);
        emit SeedRevealed(gameId, seed);
    }
    
    function gameOver(bytes32 gameId, string calldata seed) external {
        Game storage game = games[gameId];
        require(game.player == msg.sender, "Not your game");
        require(game.isActive, "Game not active");
        require(keccak256(abi.encodePacked(seed)) == game.seedHash, "Invalid seed");
        
        game.isActive = false;
        
        emit GameEnded(gameId, msg.sender, 0, false);
        emit SeedRevealed(gameId, seed);
    }
    
    function depositToHouse() external payable onlyOwner {
        houseBalance += msg.value;
    }
    
    function withdrawFromHouse(uint256 amount) external onlyOwner {
        require(houseBalance >= amount, "Insufficient balance");
        houseBalance -= amount;
        payable(owner).transfer(amount);
    }
    
    receive() external payable {
        houseBalance += msg.value;
    }
}