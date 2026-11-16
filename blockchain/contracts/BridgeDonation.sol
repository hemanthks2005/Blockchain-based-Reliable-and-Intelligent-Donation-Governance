// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BridgeDonation {

    struct Donation {
        uint256 donationId;
        address donor;
        address beneficiary;
        uint256 requestId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    uint256 private donationCounter;
    address public owner;
    mapping(uint256 => uint256) public requestBalances;
    mapping(uint256 => bool) public requestReleased;

    mapping(uint256 => Donation) public donations;

    event DonationCreated(
        uint256 indexed donationId,
        address indexed donor,
        address indexed beneficiary,
        uint256 requestId,
        uint256 amount,
        uint256 timestamp
    );

    event FundsReleased(uint256 indexed requestId, address indexed beneficiary, uint256 amount, uint256 timestamp);

    constructor() { owner = msg.sender; }

    modifier onlyOwner() { require(msg.sender == owner, "Only contract owner"); _; }

    function donate(
        address beneficiary,
        uint256 requestId
    ) external payable {
        require(msg.value > 0, "Donation amount must be greater than zero");
        require(
            beneficiary != address(0),
            "Invalid beneficiary address"
        );

        donationCounter++;

        donations[donationCounter] = Donation({
            donationId: donationCounter,
            donor: msg.sender,
            beneficiary: beneficiary,
            requestId: requestId,
            amount: msg.value,
            timestamp: block.timestamp,
            exists: true
        });
        requestBalances[requestId] += msg.value;

        emit DonationCreated(
            donationCounter,
            msg.sender,
            beneficiary,
            requestId,
            msg.value,
            block.timestamp
        );
    }

    function releaseFunds(uint256 requestId, address payable beneficiary) external onlyOwner returns (uint256 amount) {
        require(beneficiary != address(0), "Invalid beneficiary address");
        require(!requestReleased[requestId], "Funds already released");
        amount = requestBalances[requestId];
        require(amount > 0, "No escrow funds for request");
        requestReleased[requestId] = true;
        requestBalances[requestId] = 0;
        (bool sent, ) = beneficiary.call{value: amount}("");
        require(sent, "Transfer failed");
        emit FundsReleased(requestId, beneficiary, amount, block.timestamp);
    }

    function getDonation(uint256 donationId)
        external
        view
        returns (
            address donor,
            address beneficiary,
            uint256 requestId,
            uint256 amount,
            uint256 timestamp
        )
    {
        Donation memory donation = donations[donationId];

        require(donation.exists, "Donation does not exist");

        return (
            donation.donor,
            donation.beneficiary,
            donation.requestId,
            donation.amount,
            donation.timestamp
        );
    }

    function getDonationCount()
        external
        view
        returns (uint256)
    {
        return donationCounter;
    }
}
