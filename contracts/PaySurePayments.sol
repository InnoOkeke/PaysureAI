// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaySurePayments
 * @dev Secure stablecoin payment settlement contract on QDay Aevum Testnet.
 * Designed specifically for tUSD8 (6 decimals) with verifiable invoice references.
 */
contract PaySurePayments is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Supported stablecoin token (tUSD8 on QDay Aevum Testnet)
    IERC20 public immutable paymentToken;

    struct PaymentRecord {
        bytes32 paymentId;
        address sender;
        address recipient;
        uint256 amount;
        string invoiceReference;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Total volume processed in tUSD8
    uint256 public totalVolumeSettled;
    uint256 public totalPaymentsCount;

    // Mapping from internal paymentId to PaymentRecord
    mapping(bytes32 => PaymentRecord) private _payments;

    // Mapping from invoiceReference to paymentId
    mapping(string => bytes32) private _invoiceToPaymentId;

    // Events
    event PaymentExecuted(
        bytes32 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string invoiceReference,
        uint256 timestamp
    );

    error InvalidAddress();
    error InvalidAmount();
    error InvoiceAlreadySettled();
    error PaymentNotFound();

    /**
     * @param _token Address of official tUSD8 contract (0x456569838f1d43009A91ebA4263147Afd7233483)
     */
    constructor(address _token) Ownable(msg.sender) {
        if (_token == address(0)) revert InvalidAddress();
        paymentToken = IERC20(_token);
    }

    /**
     * @notice Execute a verified stablecoin payment
     * @param recipient Target payee wallet address
     * @param amount Token amount in tUSD8 (6 decimals)
     * @param invoiceReference Unique invoice number or reference hash
     */
    function makePayment(
        address recipient,
        uint256 amount,
        string calldata invoiceReference
    ) external nonReentrant returns (bytes32) {
        if (recipient == address(0) || recipient == msg.sender) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        // Prevent double payment for the same invoice reference if provided
        if (bytes(invoiceReference).length > 0) {
            if (_invoiceToPaymentId[invoiceReference] != bytes32(0)) {
                revert InvoiceAlreadySettled();
            }
        }

        // Unique deterministic payment identifier
        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                amount,
                invoiceReference,
                block.timestamp,
                totalPaymentsCount
            )
        );

        // Execute safe transfer from sender to recipient
        paymentToken.safeTransferFrom(msg.sender, recipient, amount);

        // Record payment metadata
        _payments[paymentId] = PaymentRecord({
            paymentId: paymentId,
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            invoiceReference: invoiceReference,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        if (bytes(invoiceReference).length > 0) {
            _invoiceToPaymentId[invoiceReference] = paymentId;
        }

        totalVolumeSettled += amount;
        totalPaymentsCount += 1;

        emit PaymentExecuted(
            paymentId,
            msg.sender,
            recipient,
            amount,
            invoiceReference,
            block.timestamp
        );

        return paymentId;
    }

    /**
     * @notice Retrieve payment record by paymentId
     */
    function getPayment(bytes32 paymentId) external view returns (PaymentRecord memory) {
        PaymentRecord memory p = _payments[paymentId];
        if (p.sender == address(0)) revert PaymentNotFound();
        return p;
    }

    /**
     * @notice Retrieve payment record by invoiceReference
     */
    function getPaymentByReference(string calldata invoiceReference)
        external
        view
        returns (PaymentRecord memory)
    {
        bytes32 paymentId = _invoiceToPaymentId[invoiceReference];
        if (paymentId == bytes32(0)) revert PaymentNotFound();
        return _payments[paymentId];
    }
}

