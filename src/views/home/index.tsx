// Next, React
import {
  FC,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import { AnchorProvider } from '@coral-xyz/anchor';
import {
  Metaplex,
  walletAdapterIdentity,
} from '@metaplex-foundation/js';
// Wallet
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import pkg from '../../../package.json';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [currentPrice, setCurrentPrice] = useState(10)
  useEffect(() => {
    async function main() {
      const res = await fetch('http://ams.apolloni.us:3000/price')
      const price = await res.json()
      setCurrentPrice(price.price)
    }
    main()
  }
    , [])
  const metaplex2 = new Metaplex(connection)
    .use(walletAdapterIdentity(wallet));
  const provider = new AnchorProvider(connection, wallet, {});
  async function main() {
    const listingOld = await (await fetch('http://ams.apolloni.us:3000/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })).json()
    const ah = await metaplex2.auctionHouse().findByAddress({ address: new PublicKey("7V3hH5erW4HXzibiNc1AzEr4PHQEGqMFkvG9VvGoYfQW") })
    console.log(listingOld)
    const listings = await metaplex2.auctionHouse().findListings({ auctionHouse: ah })
    const randomOneToFive = Math.floor(Math.random() * 5) + 1
    const listing = await metaplex2.auctionHouse().findListingByReceipt({ receiptAddress: listings[randomOneToFive].receiptAddress, auctionHouse: ah })

    const deposit = await metaplex2.auctionHouse().builders().depositToBuyerAccount({
      auctionHouse: ah,
      amount: listing.price,
    })
    const tx = new Transaction().add(

      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 66420 }),
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: ah.feeAccountAddress,
        lamports: 897840 + 2039280
      }), ...deposit.getInstructions())
    const buy = await metaplex2.auctionHouse().builders().buy({
      auctionHouse: ah,
      listing
    })
    tx.add(...buy.getInstructions())
    const sig = await provider.sendAndConfirm(tx)
    alert('yay u bought it ' + sig.substring(0, 6) + '...' + sig.substring(sig.length - 6, sig.length))
  }
  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
          <div className='text-sm font-normal align-bottom text-right text-slate-600 mt-4'>v{pkg.version}</div>
          <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            50 $HIGHER price: ${currentPrice}
          </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Unleash the full power of futarchy. Funds raised here will be used to create markets on a themetadao futarchy fork for this first proposal <Link
            style={{ color: 'purple' }}
            href="https://hackmd.io/@4umm-KK6RU21W-428XBrHg/ry144Rk0T">here</Link>.</p>
          <p className='text-slate-500 text-2x1 leading-relaxed'>Price per 50 tokens up by 1% every time some1 buys.</p>
        </h4>

        <div className="flex flex-col mt-2">
          <button className="btn btn-primary w-full mb-4" onClick={main} disabled={!wallet.connected} > Buy 50 Tokens</button>
        </div>
      </div>
    </div>
  );
};
