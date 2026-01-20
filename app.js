// A simple frontend script to interact with the deployed contracts
// Replace these addresses after deployment
const VAULT_ADDRESS = "YOUR_VAULT_ADDRESS_HERE";
const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS_HERE";

// Minimal ABI to interact with functions
const VAULT_ABI = [
    "function stake(uint256 amount) external",
    "function withdraw(uint256 amount) external",
    "function claimRewards() public"
];
const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)"
];

let provider, signer, vaultContract, tokenContract;

document.getElementById('connectBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById('walletAddress').innerText = address;
        
        vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    } else {
        alert("Please install MetaMask!");
    }
});

document.getElementById('stakeBtn').addEventListener('click', async () => {
    const amount = document.getElementById('stakeAmount').value;
    const weiAmount = ethers.parseEther(amount);
    
    // Approve first
    const txApprove = await tokenContract.approve(VAULT_ADDRESS, weiAmount);
    await txApprove.wait();
    
    // Then stake
    const txStake = await vaultContract.stake(weiAmount);
    await txStake.wait();
    alert("Staked successfully!");
});
