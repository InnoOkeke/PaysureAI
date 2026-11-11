// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockTUSD8
 * @dev Mock tUSD8 stablecoin for unit testing (6 decimals)
 */
contract MockTUSD8 is ERC20 {
    constructor() ERC20("Test USD8", "tUSD8") {
        _mint(msg.sender, 1000000 * 10**6); // Mint 1,000,000 tUSD8
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

