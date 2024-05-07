import React, { useState } from 'react';
import { ethers } from 'ethers';
import OpenMarkV4 from "../ABI/OpenMarkV4.json";

function getRandomBytes32() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array;
}

const OPENMARK = "0xF45B1CdbA9AACE2e9bbE80bf376CE816bb7E73FB";

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
                    { name: 'salt', type: 'bytes32' },
                    { name: 'expiry', type: 'uint256' },
                    { name: 'option', type: 'uint256' },
                ]
            };

            let order = {
                "nftContract": OPENMARK,
                "tokenId": 1,
                "price": 1,
                "salt": getRandomBytes32(),
                "expiry": 1,
                "option": 0,
            };

            console.log("order: ", order);

            const domain = {
                "name": "OpenMark",
                "version": "1",
                "chainId": Number(await openMark.getChainId()),
                "verifyingContract": OPENMARK,
            };

            console.log("domain: ", domain);

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
