import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankApp } from "../target/types/bank_app";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { BN } from "bn.js";
import { 
  createMint, 
  mintTo, 
  getOrCreateAssociatedTokenAccount, 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction, 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from "@solana/spl-token";

describe("bank-app", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BankApp as Program<BankApp>;

  const BANK_APP_ACCOUNTS = {
    bankInfo: PublicKey.findProgramAddressSync([Buffer.from("BANK_INFO_SEED")], program.programId)[0],
    bankVault: PublicKey.findProgramAddressSync([Buffer.from("BANK_VAULT_SEED")], program.programId)[0],
    userReserve: (pubkey: PublicKey, tokenMint?: PublicKey) => {
      let SEEDS = [Buffer.from("USER_RESERVE_SEED"), pubkey.toBuffer()];
      if (tokenMint) SEEDS.push(tokenMint.toBuffer());
      return PublicKey.findProgramAddressSync(SEEDS, program.programId)[0];
    }
  };

  let mint: PublicKey;
  let userAta: PublicKey;

  it("Setup Mint and Tokens", async () => {
    const payer = (provider.wallet as any).payer;
    mint = await createMint(provider.connection, payer, provider.publicKey, null, 9);
    const userAtaAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, provider.publicKey);
    userAta = userAtaAccount.address;
    await mintTo(provider.connection, payer, mint, userAta, provider.publicKey, 2000000000 * 10**9);
  });

  it("Is initialized!", async () => {
    try {
      await program.account.bankInfo.fetch(BANK_APP_ACCOUNTS.bankInfo);
    } catch {
      await program.methods.initialize().accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        bankVault: BANK_APP_ACCOUNTS.bankVault,
        authority: provider.publicKey,
        systemProgram: SystemProgram.programId
      }).rpc();
    }
  });

  it("Is deposited SOL!", async () => {
    await program.methods.deposit(new BN(1_000_000)).accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      bankVault: BANK_APP_ACCOUNTS.bankVault,
      userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey),
      user: provider.publicKey,
      systemProgram: SystemProgram.programId
    }).rpc();
  });

  it("Is deposited token!", async () => {
    const bankAta = getAssociatedTokenAddressSync(mint, BANK_APP_ACCOUNTS.bankInfo, true);
    let preInstructions: TransactionInstruction[] = [];
    if (await provider.connection.getAccountInfo(bankAta) == null) {
      preInstructions.push(createAssociatedTokenAccountInstruction(provider.publicKey, bankAta, BANK_APP_ACCOUNTS.bankInfo, mint));
    }

    await program.methods.depositToken(new BN(1_000_000_000)).accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      bankVault: BANK_APP_ACCOUNTS.bankVault,
      tokenMint: mint,
      userAta,
      bankAta,
      userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey, mint),
      user: provider.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    }).preInstructions(preInstructions).rpc();
  });

  it("Is withdraw SOL!", async () => {
    await program.methods.withdraw(new BN(500_000)).accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      bankVault: BANK_APP_ACCOUNTS.bankVault,
      userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey),
      user: provider.publicKey,
      systemProgram: SystemProgram.programId
    }).rpc();
  });

  it("Is withdraw token!", async () => {
    const bankAta = getAssociatedTokenAddressSync(mint, BANK_APP_ACCOUNTS.bankInfo, true);
    await program.methods.withdrawToken(new BN(500_000)).accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey, mint),
      user: provider.publicKey,
      mint,
      userTokenAccount: userAta,
      bankTokenAccount: bankAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    }).rpc();
  });

  it("Is paused!", async () => {
    await program.methods.togglePause().accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      authority: provider.publicKey
    }).rpc();

    try {
      const bankAta = getAssociatedTokenAddressSync(mint, BANK_APP_ACCOUNTS.bankInfo, true);
      await program.methods.withdrawToken(new BN(100)).accounts({
        bankInfo: BANK_APP_ACCOUNTS.bankInfo,
        userReserve: BANK_APP_ACCOUNTS.userReserve(provider.publicKey, mint),
        user: provider.publicKey,
        mint,
        userTokenAccount: userAta,
        bankTokenAccount: bankAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }).rpc();
    } catch (e) {
      console.log("Success: Withdraw blocked by pause as expected.");
    }

    await program.methods.togglePause().accounts({
      bankInfo: BANK_APP_ACCOUNTS.bankInfo,
      authority: provider.publicKey
    }).rpc();
  });
});