import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
export type DiceRollerConfig = {
    balance: number;
};

export function diceRollerConfigToCell(config: DiceRollerConfig): Cell {
    return beginCell().storeUint(config.balance, 32).endCell();
}
export const Opcodes = {
    deposit: 0xcb03bfaf,
};

export class DiceRoller implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}
    static createFromAddress(address: Address) {
        return new DiceRoller(address);
    }

    static createFromConfig(config: DiceRollerConfig, code: Cell, workchain = 0) {
        const data = diceRollerConfigToCell(config);
        const init = { code, data };
        return new DiceRoller(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeposit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.deposit, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    // async getCounter(provider: ContractProvider) {
    //     const { stack } = await provider.get("counter", []);
    //     return stack.readBigNumber();
    //   }
}
