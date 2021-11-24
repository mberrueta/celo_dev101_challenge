// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./IERC20.sol";
import "./MattCoin.sol";

library Library {
    struct stake {
        uint256 amount;
        uint256 timestamp;
        bool flexible;
        uint256 period; // for locked staking
    }
}

contract BankToken {
    string public name = "stake Bank Token";
    MattCoin public mattCoin;
    IERC20 public cUSD;

    using Library for Library.stake;
    mapping(address => Library.stake) public stakingBalance;
    bool private testing;
    uint256 private testingTimestamp;

    // TODO: move to something common
    event LogInt(uint256 _value);
    event LogString(string _value);
    event LogAddress(address _value);

    // constructor

    // cUSD (Alfajores testnet) = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
    // cUSD (Celo mainnet) =      "0x765DE816845861e75A25fCA122bb6898B8B1282a"
    constructor(
        MattCoin _mattCoin,
        IERC20 _cUSD,
        bool _testing
    ) {
        mattCoin = _mattCoin;
        cUSD = _cUSD;
        testing = _testing;
        testingTimestamp = block.timestamp;
    }

    // fallback function (if exists)

    // external

    // public

    // 1 stakes Tokens (get rewards)
    function stakeTokens(
        uint256 _amount,
        bool flexible,
        uint256 period
    ) public {
        // emit LogInt(_amount);
        // emit LogInt(timestamp);
        // emit LogInt(period);
        // emit LogString("bank owner");
        // emit LogAddress(msg.sender);
        // emit LogAddress(address(this));

        require(_amount > 0, "amount needs to be positive"); // raise ex if is false
        require(!ownerStaking(), "only 1 stake per account is allowed");

        if (flexible) {
            require(
                period == 0,
                "flexible staking should not have fixed periods"
            );
        } else {
            require(period > 0, "locked staking should have positive periods");
        }

        // Trasnfer cUSD tokens to this contract for staking
        cUSD.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] = Library.stake(
            _amount,
            block.timestamp,
            flexible,
            period
        );
    }

    // 1 unstakes Tokens (withdraw)
    function unStakeTokens() public {
        require(ownerStaking(), "account isn't currently staking");

        Library.stake memory current = stakingBalance[msg.sender];
        if (!current.flexible) {
            require(elapsedMinutes() >= current.period, "not yet available");
        }
        // withdraw
        cUSD.transfer(msg.sender, current.amount);
        mattCoin.transfer(msg.sender, pendingReward());
    }

    function pendingReward() public view returns (uint256) {
        Library.stake memory current = stakingBalance[msg.sender];

        if (current.flexible) {
            // give 1 per minute
            return elapsedMinutes() * 1000000000000000000;
        } else {
            if (current.period < 30) {
                // 2 per min in half hour
                return elapsedMinutes() * 1000000000000000000 * 2;
            } else if (current.period < 120) {
                // 3 per min in 2 hours
                return elapsedMinutes() * 1000000000000000000 * 3;
            }
        }
        // 4 per min in 2+ hours
        return elapsedMinutes() * 1000000000000000000 * 4;
    }

    function increaseTimestampMinutes(uint256 value) public {
        if (testing) {
            testingTimestamp = block.timestamp + value * 60 * 1000;
        }
    }

    // internal
    function elapsedMinutes() internal view returns (uint256) {
        uint256 difference = 0;

        if (testing) {
            difference =
                testingTimestamp -
                stakingBalance[msg.sender].timestamp;
        } else {
            difference = block.timestamp - stakingBalance[msg.sender].timestamp;
        }
        return difference / 1000 / 60;
    }

    // private
    function ownerFlexibleStaking() private view returns (bool) {
        if (stakingBalance[msg.sender].flexible) {
            return true;
        }
        return false;
    }

    function ownerStaking() private view returns (bool) {
        if (stakingBalance[msg.sender].amount > 0) {
            return true;
        }
        return false;
    }
}
