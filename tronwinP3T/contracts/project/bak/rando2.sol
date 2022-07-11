pragma solidity^0.5.4;

contract rando2 {

    address public owner;

    mapping (address => bool) allowedContracts;
    uint16[] private randos;


    // settings
    uint256 private max_randos = 50000000;

    mapping (address => uint256) user_idx;
    


    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyAllowedContracts() {
        require(allowedContracts[msg.sender] == true);
        _;
    }
    

    constructor() public {

        owner = msg.sender;
        
    }

    function allowContract(address _contractAddr, bool _allow) public onlyOwner {
        allowedContracts[_contractAddr] = _allow;
    }
    //https://qrng.anu.edu.au/API/api-demo.php
    function pushRandos(uint16[] memory _newRandos) public onlyOwner {
        for(uint c=0; c< _newRandos.length; c++) {
            randos.push(_newRandos[c]);
            if(randos.length > max_randos) {
                delete randos[0];    
            }
        }
    }
    function setMaxRanods(uint256 _max_randos) public onlyOwner {
        max_randos = _max_randos;
    }


    function getRandoUInt(uint _max, address _sender) public onlyAllowedContracts returns(uint random_val) {
        random_val = getRando(_max, _sender);
    }

    // helpers...
    function getRandoUInts_50(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[50] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_100(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[100] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_500(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[500] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_1000(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[1000] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_2500(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[2500] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_5000(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[5000] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }
    function getRandoUInts_10000(uint _max, address _sender, uint _count) public onlyAllowedContracts returns(uint[10000] random_vals) {
        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }
    }


    function getRandoUInts(uint _max, address _sender, uint _count) external onlyAllowedContracts returns(uint[] random_vals) {
        uint[] _rand_vals;
        for(uint c=0; c< _count; c++) {
            _rand_vals.push(getRando(_max, _sender));
        }
        random_vals = _rand_vals;
    }


    function getRando(uint _max, address _sender) internal returns (uint random_val) {
        random_val = (
            uint(keccak256(
                        abi.encodePacked(
                                    randos[user_idx[_sender]], 
                                    user_idx[_sender], 
                                    _sender,
                                    blockhash(getBlockOffset()))
                                    )
                         ) % _max);

        user_idx[_sender]++;

        if(user_idx[_sender]>=randos.length)
            user_idx[_sender]=0;    
    }

    function getBlockOffset() internal view returns (uint) {
        uint _randosUint;
        if(user_idx[msg.sender] > 0)
            _randosUint = randos[user_idx[msg.sender]-1];
        else 
            _randosUint = randos[user_idx[msg.sender]];

        uint _offset =  (uint(keccak256(
                        abi.encodePacked(
                                    _randosUint,
                                    msg.sender,
                                    now,
                                    blockhash(block.number)
                                    )
                         )) % 255);

        return block.number - (_offset);
    }



}