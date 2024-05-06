import React, { useState } from 'react';
import { ethers } from 'ethers';
import OpenMarkV4  from "../ABI/OpenMarkV4.json";

const OPENMARK = "0xFE5f411481565fbF70D8D33D992C78196E014b90";

const SignMessage = () => {
    const [data, setData] = useState({ domain: {}, message: {} });
    const [signedData, setSignedData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleClick = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);

            if (accounts.length === 0) {
                setErrorMessage('Please connect your MetaMask wallet.');
                return;
            }

            const signer = await provider.getSigner();
            const openMark = new ethers.Contract(OPENMARK, OpenMarkV4.abi, signer);

            const types = {
                Order: [
                    { name: 'nftContract', type: 'address' },
                    { name: 'tokenId', type: 'uint256' },
                    { name: 'price', type: 'uint256' },
                    { name: 'saltNonce', type: 'uint256' },
                    { name: 'expiry', type: 'uint256' },
                    { name: 'option', type: 'uint256' },
                ]
            };

            let order = {
                "nftContract": OPENMARK,
                "tokenId": 1,
                "price": 1,
                "saltNonce": 1,
                "expiry": 1,
                "option": 0,
            };

            const domain = {
                "name": "OpenMark",
                "version": "1",
                "chainId": 31337,
                "verifyingContract": OPENMARK,
            };
         
            try {
                const signature = await signer.signTypedData(domain, types, order);
                setSignedData(signature);

                const address = await openMark.verify(order, signature);

                console.log("address: ", address);

                setErrorMessage(null);
            } catch (error) {
                console.error('Error signing data:', error);
                setErrorMessage('An error occurred while signing the message.');
            }
        } else {
            setErrorMessage('Please install MetaMask to use this functionality.');
        }
    };

    const handleDataChange = (event) => {
        const newData = { ...data };
        newData[event.target.name] = JSON.parse(event.target.value);
        setData(newData);
    };

    return (
        <div>
            <label htmlFor="domain">Domain (JSON):</label>
            <textarea name="domain" id="domain" rows="5" onChange={handleDataChange} />
            <br />
            <label htmlFor="message">Message (JSON):</label>
            <textarea name="message" id="message" rows="5" onChange={handleDataChange} />
            <br />
            <button onClick={handleClick}>Sign Message</button>
            <br />
            {signedData && <p>Signed Data: {signedData}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default SignMessage;