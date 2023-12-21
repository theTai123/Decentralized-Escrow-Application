import { useEffect } from "react";
import { approve } from './App'
import { ethers } from "ethers";
import { useState } from "react";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  escrowContract
}) {
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


  useEffect( ()=>{
    const getData = async () => {
      const Approve = await escrowContract.isApproved();
      if(Approve) isApprove();
    }
    escrowContract.on('Approved', (balance) => {
      isApprove();
    });
    getData();
  },[])

  const isApprove = ()=>{
    document.getElementById(escrowContract.address).className =
        'complete';
    document.getElementById(escrowContract.address).innerText =
        "✓ It's been approved!";
  }

  const handleApprove = async ()=>{
    await approve(escrowContract,signer)
  }

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} ETH</div>
        </li>
        <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </div>
      </ul>
    </div>
  );
}
