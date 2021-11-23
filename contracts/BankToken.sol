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
    mapping(address => uint256) public pendingCoins;

    // TODO: move to something common
    event LogInt(uint256 _value);
    event LogString(string _value);
    event LogAddress(address _value);

    // constructor

    // cUSD (Alfajores testnet) = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
    // cUSD (Celo mainnet) =      "0x765DE816845861e75A25fCA122bb6898B8B1282a"
    constructor(MattCoin _mattCoin, IERC20 _cUSD) {
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
            timestamp,
            flexible,
            period
        );

        if (flexible) {
            // give 1 per day
            pendingCoins[msg.sender] += 1;
        } else {
            // give 2 per day
            pendingCoins[msg.sender] += 2 * period;
        }
    }

    // 1 unstakes Tokens (withdraw)
    function unStakeTokens() public {
        require(ownerStaking(), "account isn't currently staking");

        Library.stake memory current = stakingBalance[msg.sender];
        // withdraw
        cUSD.transfer(msg.sender, current.amount);

        if (current.flexible) {
            // give 1 per day
            mattCoin.transfer(msg.sender, elapsedDays());
        } else {
            require(elapsedDays() > current.period, "not yet available");
            // give 2 per day
            mattCoin.transfer(msg.sender, elapsedDays() * 2);
        }
    }

    // internal
    function elapsedDays() internal view returns (uint256) {
        uint256 difference = block.timestamp -
            stakingBalance[msg.sender].timestamp;
        return difference / 1000 / 60 / 60 / 24;
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
