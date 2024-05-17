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
    const balance = await client.getBalance(wallet.address);
    console.log('balance is', fromNano(balance));
    //testnet or mainnet
    console.log('walking chain is ', wallet.workchain);

    // query seqno from chain
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log('seqno:', seqno);
    //

    //send transaction to ton chain
    await walletContract.sendTransfer({
        seqno: seqno,
        secretKey: key.secretKey,
        messages: [
            internal({
                to: 'EQAY1minHCCY8z0jeA1PKuCMkHuHcJSWP6S9DEv4v8nnsqmT',
                value: '0.01',
                body: 'hi',
                bounce: false,
            }),
        ],
    });
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log('waiting for the tx to be confirmed.......');
        await sleep(1000);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log('tx is confirmed');
}
main();
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
