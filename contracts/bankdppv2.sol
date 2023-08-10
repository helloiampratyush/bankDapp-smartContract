//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
error bankdpp__notEnoughSavings();
error bankdpp__invalidRequest();
error bankdpp__transactionFailed();
error bankdpp__onlyOwner();

contract bankdppv2 {
  //state variable
  mapping(address => uint256) yourAmountInBank;
  mapping(address => string) feedback;
  //event
  event selfDeposit(address depositor, uint256 amount);
  event othersDeposite(address depositor, address depositee, uint256 amount);
  event selfWithdraw(address beneficiaries, uint256 amount);
  event transferring(address to, address from, uint256 amount);
  event feedBackTime(address provider, string feedback);

  //function
  function deposite() public payable {
    yourAmountInBank[msg.sender] += msg.value;
    emit selfDeposit(msg.sender, msg.value);
  }

  function depositedByOtherPeople(address _to) public payable {
    yourAmountInBank[_to] += msg.value;
    emit othersDeposite(msg.sender, _to, msg.value);
  }

  function withdraw(uint256 ethAmount) public {
    uint256 yourFundings = yourAmountInBank[msg.sender];
    if (yourFundings <= 0) {
      revert bankdpp__notEnoughSavings();
    }
    if (yourFundings > 0) {
      if (ethAmount > yourFundings) {
        revert bankdpp__invalidRequest();
      }
    }

    yourAmountInBank[msg.sender] -= ethAmount;
    (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
    if (!success) {
      revert bankdpp__transactionFailed();
    }
    emit selfWithdraw(msg.sender, ethAmount);
  }

  function Transfer(address _to, uint256 ethAmount) public {
    uint256 yourFund = yourAmountInBank[msg.sender];
    if (yourFund <= 0) {
      revert bankdpp__notEnoughSavings();
    }
    if (yourFund > 0) {
      if (ethAmount > yourFund) {
        revert bankdpp__invalidRequest();
      }
    }
    yourAmountInBank[msg.sender] -= ethAmount;
    (bool success, ) = (_to).call{value: ethAmount}("");
    if (!success) {
      revert bankdpp__transactionFailed();
    }
    emit transferring(_to, msg.sender, ethAmount);
  }

  function ProvideFeedBack(string memory feedBack) public {
    emit feedBackTime(msg.sender, feedBack);
  }

  function yourTotalAmountInBank() public view returns (uint256) {
    return yourAmountInBank[msg.sender];
  }

  function totalBalanceOfBank() public view returns (uint256) {
    return address(this).balance;
  }
}
