import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import escrow from './artifacts/contracts/Escrow.sol/Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  console.log(await signer.getAddress());
  try {
    const approveTxn = await escrowContract.connect(signer).approve();
    await approveTxn.wait();
  }
  catch(err) {
    console.log(err);
  }
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
    const arbiter1 = document.getElementById('arbiter1').value;
    const arbiter2 = document.getElementById('arbiter2').value;
    const value = ethers.utils.parseEther(document.getElementById('eth').value);
    const escrowContract = await deploy(signer, arbiter1 , arbiter2 , beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter1,
      arbiter2,
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
      <div className='table'>
        <div className="contract">
          <h1> New Contract </h1>
          <label>
            Arbiter 1 Address
            <input type="text" id="arbiter1" />
          </label>

          <label>
            Arbiter 2 Address 
            <input type="text" id="arbiter2" />
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
      </div> 
    </>
  );
}

export default App;
