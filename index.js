import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
        console.log("There is a Metamsk extension installed")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        //console.log("Connected!");
        connectButton.innerHTML = "Connected"
    } else {
        //console.log("No Metamsk extension installed");
        fundButton.innerHTML = "Please install Metamask"
    }
}
connectButton.onclick = connect
balanceButton.onclick = getBalance
fundButton.onclick = fund
withdrawButton.onclick = withdraw

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with: ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        // To send a trasaction we need minimum:
        // 1- provider( connection to the blockchain)
        // 2- signer ( wallet / someone with some gas)
        // 3- contracts that we are interacting with (ABI + Address)
        //////////////////////////////////////////////////
        /// 1- provider( connection to the blockchain) ///
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        //////////////////////////////////////////////////
        /// 2- signer ( wallet / someone with some gas)///
        const signer = provider.getSigner() // return whichever account is connected
        console.log(signer)

        /////////////////////////////////////////////
        /// 3- contracts that we are interacting /// need (ABI + Address)
        const contract = new ethers.Contract(contractAddress, abi, signer)

        ///Now we are settle and can go on to making transactions
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for tx to be mined or / listen for an event(we haven't learn about yet!)
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`)
    //return new Promise() //bcause wanna create a listener for blockchain
    return new Promise((resolve, reject) => {
        provider.on(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmation(s)`
            )
            resolve()
        })
    })
}

//withdraw function
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing ...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.cheaperWithdraw()
            // listen for tx to be mined
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
