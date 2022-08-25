import {
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import idl from '../public/idl.json';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair,
  Transaction
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { useMemo, useState, useEffect } from 'react';
import Board from '../components/Board';
require('@solana/wallet-adapter-react-ui/styles.css');

const Home: NextPage = () => {
  const wallet = useAnchorWallet();
  const [count, setCount] = useState('0');
  const [balance, setBalance] = useState('0');
  const [betAmount, setBetAmount] = useState('0');
  const [winnings, setWinnings] = useState('0');
  const [winningBet, setWinningBet] = useState(1);
  const [selected, setSelected] = useState(-1);
  const [showError, setShowError] = useState(false);
  const baseAccount = useMemo(() => web3.Keypair.generate(), []);

  function tellIframe(call: String, ...args: string[]) {
    const frame: any = document.getElementById('if');

    switch (call) {
      case 'WALLET_STATUS': {
        if (wallet) {
          frame?.contentWindow?.postMessage(
            {
              name: 'CONNECTION',
              value: 'connected'
            },
            '*'
          );
        } else {
          frame?.contentWindow?.postMessage(
            {
              name: 'CONNECTION',
              value: 'disconnected'
            },
            '*'
          );
        }

        break;
      }

      case 'WALLET_INFO': {
        if (wallet) {
          frame?.contentWindow?.postMessage(
            {
              name: 'PUBLIC_KEY',
              value: wallet.publicKey.toBase58()
            },
            '*'
          );
        }

        break;
      }

      case 'SEND_BALANCE': {
        frame?.contentWindow?.postMessage(
          {
            name: 'SOL_AVAILABLE',
            value: balance
          },
          '*'
        );

        break;
      }

      case 'RECV_WINNING_BET': {
        frame?.contentWindow?.postMessage(
          {
            name: 'SET_WINNING_TILE',
            value: args[0]
          },
          '*'
        );

        break;
      }

      default:
        break;
    }
  }

  async function getBalanceOfAcc() {
    let provider = getProvider();

    let b = wallet
      ? await provider?.connection?.getBalance(wallet.publicKey)
      : undefined;

    console.log(b);

    b !== undefined ? setBalance((b / LAMPORTS_PER_SOL).toString()) : undefined;
  }

  useEffect(() => {
    tellIframe('WALLET_STATUS');
    tellIframe('WALLET_INFO');
    getBalanceOfAcc();
  }, [wallet]);

  useEffect(() => {
    tellIframe('SEND_BALANCE');
  }, [balance]);

  useEffect(() => {
    window.removeEventListener('message', fromIframe);
    window.addEventListener('message', fromIframe);
  }, [wallet]);

  function fromIframe(event: any) {
    switch (event.data?.name) {
      case 'INITIALIZE':
        create();
        break;

      case 'BET': {
        increment();
        break;
      }
    }
  }

  function getProvider() {
    if (!wallet) {
      return null;
    }

    const network = 'https://api.devnet.solana.com';
    const connection = new Connection(network, 'processed');

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed'
    });

    return provider;
  }

  async function create() {
    const provider = getProvider();

    console.log('provider', provider);

    if (!provider) {
      return console.log('Provider is null');
    }

    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    const program = new Program(
      b,
      'BVHVoAxVyGbcoQL3A3ZWNLRfYGhz8tyN2hELvvqdXwwE',
      provider
    );

    try {
      await program.rpc.create({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        },
        signers: [baseAccount]
      });

      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log('Account : ', account);
    } catch (e) {
      console.log('Transaction Error: ', e);
    }
  }

  async function increment() {
    const provider = getProvider();

    if (!provider) {
      return console.log('Provider is null');
    }

    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    const program = new Program(
      b,
      'BVHVoAxVyGbcoQL3A3ZWNLRfYGhz8tyN2hELvvqdXwwE',
      provider
    );

    try {
      await program.rpc.increment({
        accounts: {
          baseAccount: baseAccount.publicKey
        }
      });

      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log('Account count: ', account.wager.toString());
      setWinningBet(Number(account?.wager.toString()));
      tellIframe('RECV_WINNING_BET', account?.wager.toString());
      // setCount(account.count.toString());
    } catch (e) {
      console.log('Transaction Error: ', e);
    }
  }

  const betError = (
    <div
      className="mt-10  p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      <span className="font-medium">Bet not placed!</span> The value is invalid
      or bet amount is too much.
    </div>
  );

  const betSuccess = (
    <div
      className="mt-10 p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
      role="alert"
    >
      <span className="font-medium">Bet placed!</span> The winning number is{' '}
      <span className="font-medium">{winningBet}</span>.
    </div>
  );

  const submitBet = async (e: any) => {
    e.preventDefault();
    setShowError(false);

    try {
      const amount = Number(betAmount);

      if (amount <= 0 || amount > Number(balance)) {
        setShowError(true);
        return;
      }
    } catch (e) {
      setShowError(true);
    }
  };

  const changeBet = (e: any) => {
    e.preventDefault();
    setShowError(false);

    setBetAmount(e.target.value);
  };

  const sendTx = () => {};

  return (
    <div className="bg-slate-800">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.walletButtons}>
          <WalletMultiButton />
          <WalletDisconnectButton />
        </div>

        {/* <div style={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    <button onClick={create}>Create</button>
                    <button onClick={increment}>Increment</button>
                </div>   */}

        <Board selected={selected} setSelected={setSelected} />

        <div className="mt-10">
          <h1 className="text-slate-50 text-3xl">
            <span className="text-slate-200 text-2xl">Available SOL:</span>{' '}
            {balance}
          </h1>
        </div>

        <div className="mt-10">
          <span className="text-slate-200 text-xl">Selected tile:</span>
          <h1
            style={{ padding: '50px' }}
            className={
              selected > 0
                ? 'text-4xl text-white bg-emerald-600 transition-colors rounded-lg'
                : 'text-slate-50 text-4xl'
            }
          >
            {' '}
            {selected > 0 ? selected : 'No tile selected'}
          </h1>
        </div>

        {!wallet ? (
          <>
            <div
              className="mt-10 bg-blue-100 rounded-lg border-t border-b border-blue-500 text-blue-700 px-4 py-3"
              role="alert"
            >
              <p className="font-bold">No wallet selected</p>
              <p className="text-sm">
                Please select a wallet from the top of the page.
              </p>
            </div>
          </>
        ) : (
          <></>
        )}

        <button
          onClick={() => create()}
          className="disabled:bg-slate-50 disabled:text-slate-500 
                    bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded basis-1/2"
        >
          Initialize
        </button>

        <button
          onClick={() => increment()}
          className="disabled:bg-slate-50 disabled:text-slate-500 
                    bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded basis-1/2"
        >
          Increment
        </button>

        <form
          className="mt-10 flex flex-row justify-evenly space-x-8"
          onSubmit={submitBet}
        >
          <label
            htmlFor="bet"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Place bet in SOL
          </label>

          <input
            type="number"
            id="bet"
            className="bg-gray-50 border border-gray-300 text-gray-900 
                    text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block 
                    w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
                    dark:focus:border-blue-500 basis-1/2"
            placeholder="Bet amount"
            onChange={changeBet}
            value={betAmount}
          />

          <button
            disabled={!wallet || selected < 1 || selected > 12}
            type="submit"
            className="disabled:bg-slate-50 disabled:text-slate-500 
                    bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded basis-1/2"
          >
            Place bet
          </button>
        </form>

        {showError ? betError : <></>}

        <div className="mt-10">
          <h1 className="text-slate-50 text-3xl">
            <span className="text-slate-200 text-2xl">
              Your winnings in SOL:
            </span>{' '}
            {winnings}
          </h1>
        </div>

        <form className="mt-10 flex flex-row justify-evenly space-x-8">
          <label
            htmlFor="claim"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Claim your winnings to the connected wallet
          </label>

          <button
            disabled={!wallet || Number(winnings) <= 0}
            type="submit"
            id="claim"
            className="disabled:bg-slate-50 disabled:text-slate-500 
                    bg-emerald-800 hover:bg-emerald-300 text-white font-bold py-2 px-4 rounded basis-1/2"
          >
            Claim
          </button>
        </form>

        {/* <iframe
          src="http://localhost:3000/"
          id="if"
          title="game"
          style={{ */}
        <iframe
          src="https://wondersplot.com/"
          id="if"
          title="game"
          style={{
            width: '60vh',
            height: '60vh',
            marginTop: '3rem'
          }}
        />
      </main>
    </div>
  );
};

export default Home;
