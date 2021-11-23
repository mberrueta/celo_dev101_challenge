// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CUSDMock {
    string public name = "Mock CUSD Token";
    string public symbol = "mCUSD";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens
    uint8 public decimals = 18;
    mapping(address => uint256) private _balances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        // all the money for the sender
        _balances[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(_balances[msg.sender] >= _value);
        _balances[msg.sender] -= _value;
        _balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // TODO: move to something common
    event LogInt(uint256 _value);
    event LogString(string _value);
    event LogAddress(address _value);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // emit LogString("sender");
        // emit LogAddress(msg.sender);
        // emit LogInt(allowance[_from][msg.sender]);

        // emit LogString("from");
        // emit LogAddress(_from);
        // emit LogInt(_value);
        // emit LogInt(_balances[_from]);

        // emit LogString("to");
        // emit LogAddress(_to);
        // emit LogInt(_value);
        // emit LogInt(_balances[_to]);

        require(_value <= _balances[_from]);
        require(_value <= allowance[_from][msg.sender]);
        _balances[_from] -= _value;
        _balances[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }
}
