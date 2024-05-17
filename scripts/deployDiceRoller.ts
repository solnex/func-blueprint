import { toNano } from '@ton/core';
import { DiceRoller } from '../wrappers/DiceRoller';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4, TonClient, fromNano, internal } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
async function main() {
    const mnemonic =
        'mind width cheese another solid lumber despair carry rain lobster sport rigid guitar autumn buyer vanish movie pipe tumble sphere own sport cargo deny';
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    //wallet address
    console.log('wallet address is ', wallet.address.toString());
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    //get wallet contract
    const walletContract = client.open(wallet);
    const balance = await client.getBalance(wallet.address);
    console.log('balance is', fromNano(balance));
    //testnet 0 or mainnet 1
    console.log('walking chain is ', wallet.workchain);

    //get the diceRoller instance and use wallet to send the deploy tx
    const DiceRollerInstance = DiceRoller.createFromConfig({ balance: 0 }, await compile('DiceRoller'));
    const diceRollerContract = client.open(DiceRollerInstance);

    // query seqno from chain

    const walletSender = walletContract.sender(key.secretKey);
    const seqno = await walletContract.getSeqno();
    console.log('seqno:', seqno);
    await diceRollerContract.sendDeploy(walletSender, toNano('0.01'));

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log('waiting for the tx to be confirmed.......');
        await sleep(1000);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log('deploy tx is confirmed');
}
main();
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
