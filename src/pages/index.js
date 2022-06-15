import { encrypt } from '@metamask/eth-sig-util';
import { useState } from 'react';
import { bufferToHex } from 'ethereumjs-util'


// Account-1 in6/VM8QgwsTTuqJKgdUJJazYcX/ENha2T600UK4cUk=
// Account-2 Mpw+4xffC2MJJ1O02U0Kws/h+7fO0wNrtiWFUTljGAs=
export default function Home() {
  const [encryptData,setEncryptData] = useState("Hello World")
  const [publicKey,setPublicKey] = useState("")
  const [encryptedMessage,setEncryptedMessage] = useState("")
  const [decryptedMessage,setDecryptedMessage] = useState("")

  async function publicKeyHandler(){
    if (typeof window.ethereum !== 'undefined') {
      if(ethereum.selectedAddress == undefined || ethereum.selectedAddress == null){
        await ethereum.request({ method: 'eth_requestAccounts' });
      }

      const account = ethereum.selectedAddress ?? ''

      const publicKey = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
      });

      setPublicKey(publicKey)
      console.log(publicKey)
    }
  }

  async function encryptHandler(){
    
    const structuredData = encrypt({
      publicKey: publicKey,
      data: encryptData,
      version: 'x25519-xsalsa20-poly1305',
    })

    const encMessage = bufferToHex(Buffer.from( JSON.stringify(structuredData), 'utf8'));
    
    // To Use , when setting this data to Smart Contract
    const buf = Buffer.concat([
      Buffer.from(structuredData.ephemPublicKey, 'base64'),
      Buffer.from(structuredData.nonce, 'base64'),
      Buffer.from(structuredData.ciphertext, 'base64'),
    ]);

    // To Use , when getting structuredData from Smart Contract
    const regainedStructuredData = {
      version: 'x25519-xsalsa20-poly1305',
      nonce: buf.slice(32, 56).toString('base64'),
      ephemPublicKey: buf.slice(0, 32).toString('base64'),
      ciphertext: buf.slice(56).toString('base64'),
    };

    console.log(structuredData)
    console.log(regainedStructuredData)

    setEncryptedMessage(encMessage)
  }

  async function decryptHandler(){
    if(publicKey == "" || encryptedMessage == ""){
      alert("No Public Key or Encrypted Message");
      return;
    }

    const account = ethereum.selectedAddress ?? ''
    ethereum.request({
      method: 'eth_decrypt',
      params: [encryptedMessage, account],
    })
      .then((msg) =>{
        console.log('The decrypted message is:', msg)
        setDecryptedMessage(msg)
      }
    )
  }

  return (
    <div className="w-full min-h-screen place-content-center grid">
        <div className="w-full form-control">
          <label className="label">
            <span className="label-text">Public Key</span>
            <span className="label-text-alt"></span>
          </label>
          <input type="text" value={publicKey} onChange={(e) => { setPublicKey(e.target.value) }} className="w-full text-center input input-bordered" />
        </div>

        <div className="w-full mb-5 form-control">
          <label className="label">
            <span className="label-text">Message</span>
            <span className="label-text-alt"></span>
          </label>
          <input type="text" value={encryptData} onChange={(e) => { setEncryptData(e.target.value) }} className="w-full text-center input input-bordered" />
        </div>

      <div className="w-full mb-5 form-control">
        <label className="label">
          <span className="label-text">Encrypted Message</span>
          <span className="label-text-alt"></span>
        </label>
        <input type="text" value={encryptedMessage} onChange={(e) => { setEncryptedMessage(e.target.value) }} className="w-full text-center input input-bordered" />
      </div>

        <div className="w-full mb-5 form-control">
          <label className="label">
            <span className="label-text">Decrypted Message</span>
            <span className="label-text-alt"></span>
          </label>
          <input type="text" value={decryptedMessage} onChange={(e) => { setDecryptedMessage(e.target.value) }} className="w-full text-center input input-bordered" />
        </div>

        <button className="btn btn-primary" onClick={publicKeyHandler}>Get Public Key</button>
        <button className="px-32 my-2 btn btn-primary" onClick={encryptHandler}>Encrypt Message</button>
        <button className="mt-2 btn btn-primary" onClick={decryptHandler}>Decrypt Message</button>

    </div>
  )
}
