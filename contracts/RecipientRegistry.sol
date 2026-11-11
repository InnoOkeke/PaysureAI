// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RecipientRegistry
 * @dev Confirmation of Payee identity-to-address registry on QDay Aevum Testnet.
 * Adheres to PaySure AI verification standards and ERC-8004 identity concepts.
 */
contract RecipientRegistry is Ownable, ReentrancyGuard {
    struct RecipientProfile {
        address wallet;
        string paymentId;
        string displayName;
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
        uint256 updatedAt;
    }

    // Mapping from wallet address to RecipientProfile
    mapping(address => RecipientProfile) private _profiles;

    // Mapping from unique payment identifier to wallet address
    mapping(string => address) private _paymentIdToWallet;

    // Events
    event RecipientRegistered(
        address indexed wallet,
        string indexed paymentId,
        string displayName,
        uint256 timestamp
    );

    event RecipientUpdated(
        address indexed wallet,
        string displayName,
        uint256 timestamp
    );

    event RecipientRevoked(
        address indexed wallet,
        string indexed paymentId,
        uint256 timestamp
    );

    event VerificationStatusUpdated(
        address indexed wallet,
        bool isVerified,
        uint256 timestamp
    );

    error AlreadyRegistered();
    error NotRegistered();
    error PaymentIdTaken();
    error InvalidAddress();
    error InvalidInput();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new payee identity on-chain
     * @param paymentId Unique alias or business payment ID
     * @param displayName Legal or operating business name
     */
    function registerRecipient(
        string calldata paymentId,
        string calldata displayName
    ) external nonReentrant {
        if (msg.sender == address(0)) revert InvalidAddress();
        if (bytes(paymentId).length == 0 || bytes(displayName).length == 0) revert InvalidInput();
        if (_profiles[msg.sender].isActive) revert AlreadyRegistered();
        if (_paymentIdToWallet[paymentId] != address(0)) revert PaymentIdTaken();

        _profiles[msg.sender] = RecipientProfile({
            wallet: msg.sender,
            paymentId: paymentId,
            displayName: displayName,
            isVerified: false, // Default requires registry verification/attestation
            isActive: true,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _paymentIdToWallet[paymentId] = msg.sender;

        emit RecipientRegistered(msg.sender, paymentId, displayName, block.timestamp);
    }

    /**
     * @notice Update registered display name
     */
    function updateRecipient(string calldata displayName) external nonReentrant {
        if (!_profiles[msg.sender].isActive) revert NotRegistered();
        if (bytes(displayName).length == 0) revert InvalidInput();

        _profiles[msg.sender].displayName = displayName;
        _profiles[msg.sender].updatedAt = block.timestamp;

        emit RecipientUpdated(msg.sender, displayName, block.timestamp);
    }

    /**
     * @notice Revoke registration
     */
    function revokeRecipient() external nonReentrant {
        if (!_profiles[msg.sender].isActive) revert NotRegistered();

        string memory pId = _profiles[msg.sender].paymentId;
        delete _paymentIdToWallet[pId];
        delete _profiles[msg.sender];

        emit RecipientRevoked(msg.sender, pId, block.timestamp);
    }

    /**
     * @notice Attest verification status of a payee (Owner/Admin controlled)
     */
    function setVerificationStatus(address wallet, bool isVerified) external onlyOwner {
        if (!_profiles[wallet].isActive) revert NotRegistered();
        _profiles[wallet].isVerified = isVerified;
        _profiles[wallet].updatedAt = block.timestamp;

        emit VerificationStatusUpdated(wallet, isVerified, block.timestamp);
    }

    /**
     * @notice Look up recipient by wallet address
     */
    function getRecipient(address wallet) external view returns (RecipientProfile memory) {
        return _profiles[wallet];
    }

    /**
     * @notice Look up recipient by paymentId
     */
    function getRecipientByPaymentId(string calldata paymentId) external view returns (RecipientProfile memory) {
        address wallet = _paymentIdToWallet[paymentId];
        return _profiles[wallet];
    }
}

