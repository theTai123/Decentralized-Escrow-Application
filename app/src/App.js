import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import escrow from './artifacts/contracts/Escrow.sol/Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  console.log(await signer.getAddress());
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(()=>{
    async function getContracts(){
      const res = await fetch('http://localhost:8000/escrows')
      const contract = await res.json();
      const fullContract = contract.map((contract)=> {
        const escrowContract = new ethers.Contract(contract.address,escrow.abi,provider);
        return {
          ...contract,
          escrowContract
        }
      })
      console.log(fullContract);
      if(fullContract.length) setEscrows(fullContract);
    }
    getContracts();
  },[]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(document.getElementById('eth').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: ethers.utils.formatEther(value),
    };
    
    console.log(escrow);
    await fetch('http://localhost:8000/escrows', {
      method: 'POST',
      body: JSON.stringify(escrow),
      headers: { 'Content-Type': 'application/json' }
    });

    window.location.replace('/');
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows && escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow}/>;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
