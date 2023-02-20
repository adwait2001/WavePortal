import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json'

export default function App() {
  /*
  * State variable to store our user's public address
  */
  const [currentAccount, setCurrentAccount] = useState("");

  /*
  * State variable to store count of total waves
  */
  const [waveCount, setWaveCount] = useState(0);

  /*
  * State variable to track loading
  */
  const [isLoading, setIsLoading] = useState(false);

  /*
  * A state property to store all waves (Wave Structs)
  */
  const [allWaves, setAllWaves] = useState([])

  /*
  * Address of my WavePortal contract on the Rinkeby testnet
  */
  const contractAddress = '0x3651dE3EA44Cc5e3A3852DE7E3A76bdB4d76EeE8';

  /*
  * A variable that references to the ABI
  */
  const contractABI = abi.abi;

  /*
  * This function tells us, in the console, if a wallet with eth accounts exists
  */
  const checkIfWalletIsConnected = async () => {
    try {
      /*
      * First, make sure we have access to window.ethereum
      */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!")
        return
      } else {
        console.log("We have the ethereum object:", ethereum)
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account", account);
        setCurrentAccount(account);
        getAllWaves();

        // If the waveCount has been stored in localStorage previously, then grab it
        typeof parseInt(localStorage.getItem('waveCount')) === "number" ? setWaveCount(localStorage.getItem('waveCount')) : setWaveCount(0);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * Connect wallet method
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * This makes MetaMask pop up - Requests user connect wallet to site
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])
      getAllWaves();
    } catch (error) {
      console.log(error)
    }
  }

  /*
  * Function to get all waves
  */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window; // checking for MetaMask wallet
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * call the  getAllWaves method from smart contract
        */
        const waves = await wavePortalContract.getAllWaves();
        console.log("WAVES:", waves);
        /*
        * Pick out the user address, wave timestamp, and wave message from struct
        */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        });

        /*
        * Store the AllWaves data in React state
        */
        setAllWaves(wavesCleaned);


        /*
        * Listen for emitter events
        */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });

        console.log("WAVES CLEANED", wavesCleaned);
        console.log("ALL WAVES", allWaves);
      } else {
        console.log("Ethereum object does not exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      // Check if MetaMask is in the browser
      const { ethereum } = window;
      console.log("outsider")
      if (ethereum) {
        console.log("insider")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * Contract address and ABI are used here
        */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Send trx to contract and log results to console to test
        let count = await wavePortalContract.getTotalWaves();
        localStorage.setItem('waveCount', count)// save count to localStorage 
        setWaveCount(parseInt(count));
        console.log("Recieved total wave count...", count.toNumber());

        /*
        * Execute a wave from the smart contract
        */
        const waveTxn = await wavePortalContract.wave(document.getElementById("waveMessage").value, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        setIsLoading(true); // mining is happening

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);
        setIsLoading(false);

        // After the user waves
        count = await wavePortalContract.getTotalWaves();
        localStorage.setItem('waveCount', count)// save count to localStorage 
        setWaveCount(parseInt(count));
        console.log("Recieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.log(error)
    }
  }

  /*
  * This is for the text under the button when the transaction is loading/being mined
  */
  let waveText;
  if (isLoading) {
    waveText = (<div className="spinner">
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>)
  } else {
    waveText = (<div>
      <div className="inputContainer">
        <textarea className="textarea" id="waveMessage" placeholder="Write me a message..." cols="30" rows="5"></textarea>

        {/*
          * If there is no current wallet, then render this button
          */}
        {!currentAccount && (<button className="connectWalletButton" onClick={connectWallet}>
          Connect Wallet
        </button>)}

        <button className="waveButton" onClick={wave}>Wave at Me</button>
      </div>
      <div className="waveCountText">(Total # of waves: {waveCount})</div>
    </div>
    )
  }


  /*
  * Run function when page loads
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I'm Adwait :) Believe me you will get there one day and even if you dont its all good . You are awesome
        </div>

        {waveText}
        <div className="waveContainer">
          {allWaves.slice(0).reverse().map((wave, index) => {
            return (<div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>From: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
          })}
        </div>


      </div>
    </div>
  );
}