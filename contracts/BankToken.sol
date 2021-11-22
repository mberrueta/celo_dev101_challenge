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
    address private owner;

    string public name = "stake Bank Token";
    MattCoin public mattCoin;
    IERC20 public cUSD;

    using Library for Library.stake;
    mapping(address => Library.stake) public stakingBalance;
    mapping(address => uint256) public pendingCoins;

    // constructor

    // cUSD (Alfajores testnet) = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
    // cUSD (Celo mainnet) =      "0x765DE816845861e75A25fCA122bb6898B8B1282a"
    constructor(MattCoin _mattCoin, IERC20 _cUSD) {
        owner = msg.sender;
        mattCoin = _mattCoin;
        cUSD = _cUSD;
    }

    // fallback function (if exists)

    // external

    // public

    // 1 stakes Tokens (get rewards)
    function stakeTokens(
        uint256 _amount,
        uint256 timestamp,
        bool flexible,
        uint256 period
    ) public {
        require(_amount > 0, "amount needs to be positive"); // raise ex if is false
        require(ownerStaking(), "only 1 stake per account is allowed");

        if (flexible) {
            require(
                period == 0,
                "flexible staking should not have fixed periods"
            );
        } else {
            require(period > 0, "locked staking should have positive periods");
        }

        // Trasnfer cUSD tokens to this contract for staking
        cUSD.transferFrom(owner, address(this), _amount);

        // update staking balance
        stakingBalance[owner] = Library.stake(
            _amount,
            timestamp,
            flexible,
            period
        );

        if (flexible) {
            // give 1 per day
            pendingCoins[owner] += 1;
        } else {
            // give 2 per day
            pendingCoins[owner] += 2 * period;
        }
    }

    function ownerFlexibleStaking() private view returns (bool) {
        if (stakingBalance[owner].flexible) {
            return true;
        }
        return false;
    }

    // internal
    // private

    function ownerStaking() private view returns (bool) {
        if (stakingBalance[owner].amount > 0) {
            return true;
        }
        return false;
    }
}
