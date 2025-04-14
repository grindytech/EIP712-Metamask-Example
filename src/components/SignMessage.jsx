import React, { useState } from 'react';
import { ethers } from 'ethers';

const SignMessage = () => {
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

            const message = "Login to gafi.network with address 0xdA5D86B305C8B1E5458997Cb9D103CE015C9c2A8 on ethereum at 2025-04-14T09:46:55.788Z with nonce 24d09329-cb2a-4e85-97dd-eef73b8c686c";

            try {
                const signature = await signer.signMessage(message);
                console.log("signature: ", signature);

                setErrorMessage(null);
            } catch (error) {
                console.error('Error signing data:', error);
                setErrorMessage('An error occurred while signing the message.');
            }
        } else {
            setErrorMessage('Please install MetaMask to use this functionality.');
        }
    };

    return (
        <div>
            <button onClick={handleClick}>Sign Message</button>
        </div>
    );
};

export default SignMessage;
