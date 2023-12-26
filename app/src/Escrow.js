import { useEffect } from "react";
import { approve } from './App'
import { ethers } from "ethers";
import { useState } from "react";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export default function Escrow({
  address,
  arbiter1,
  arbiter2,
  beneficiary,
  value,
  escrowContract
}) {
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [approved, setApproved] = useState();
  const [approveCount, setApproveCount ] = useState(0);

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
      const Count = await escrowContract.approveCount();
      if(Approve){
        isApprove();
        setApproved(true);
      } 
      setApproveCount(Number(Count));
    }
    getData();
  },[])

  const isApprove = ()=>{
    document.getElementById(escrowContract.address).className =
        'complete';
    document.getElementById(escrowContract.address).innerText =
        "✓ It's been approved!";
  }

  const handleApprove = async ()=>{
    escrowContract.on('Approved', () => {
      isApprove();
      setApproved(true);
    });
    await approve(escrowContract,signer)
    const Count = await  escrowContract.approveCount();
    setApproveCount(Number(Count));
  }

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter 1 </div>
          <div> {arbiter1} </div>
        </li>
        <li>
          <div> Arbiter 2 </div>
          <div> {arbiter2} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} ETH</div>
        </li>
        <li>
          <div> Contract </div>
          <div> {escrowContract.address} </div>
        </li>
        <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            if(!approved) handleApprove();
          }}
        >
          Approve {approveCount}/2 
        </div>
      </ul>
    </div>
  );
}
