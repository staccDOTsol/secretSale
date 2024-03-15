import { BN } from 'bn.js';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';

import {
  keypairIdentity,
  Metaplex,
  PublicKey,
  SplTokenAmount,
} from '@metaplex-foundation/js';
import {
  Connection,
  Keypair,
  Transaction,
} from '@solana/web3.js';

const connection = new Connection("https://jarrett-solana-7ba9.mainnet.rpcpool.com/8d890735-edf2-4a75-af84-92f7c9e31718");
const wallet = Keypair.fromSecretKey(new Uint8Array(
  JSON.parse(fs.readFileSync('../7i.json', 'utf-8'))
))
const metaplex = new Metaplex(connection)
.use(keypairIdentity(wallet));
const HIGHER = new PublicKey("EyiHKVZPNMyzDf1cjVwBBpnaiQKRR9nMnsCuXF7Fyqbe")
// express post doit 
const app = express()
app.use(cors())
app.use(json())
let currentPrice = 10000000
app.get('/price', async (req, res) => {
    res.json({price:currentPrice / 10 ** 6})
})
app.post('/list', async (req, res) => {
  try {
  const ah = await metaplex.auctionHouse().findByAddress({address: new PublicKey("7V3hH5erW4HXzibiNc1AzEr4PHQEGqMFkvG9VvGoYfQW")})
  console.log(ah)
  const price: SplTokenAmount = {
    // @ts-ignore
    basisPoints: new BN(Math.floor(currentPrice)),
    currency: {decimals: 6, 
      symbol: "USDC",
      namespace: 'spl-token'
    }
  }
  currentPrice *= 1.01
  const tokens: SplTokenAmount = {
    // @ts-ignore
    basisPoints:new BN(50_000_000_000),
    currency: {decimals: 9, 
      symbol: "HIGHER",
      namespace: 'spl-token'
    }
  }
  const tx = new Transaction()
  //await connection.confirmTransaction(sig)
  const listing = await metaplex.auctionHouse().builders().list({
    auctionHouse: ah,
    mintAccount: HIGHER,
    tokens,
    price,
    seller: wallet,
  })
  console.log(listing)
  tx.add(
    ...listing.getInstructions())
    const sig = await connection.sendTransaction(tx, [wallet], {skipPreflight: false})
    console.log(sig)
    let context = listing.getContext();
    context.price.basisPoints = context.price.basisPoints.toNumber()
    context.tokens.basisPoints = context.tokens.basisPoints.toNumber()
    res.json(context)
  /*
  console.log(listing)
  const deposit = await metaplex2.auctionHouse().builders().depositToBuyerAccount({
    auctionHouse: ah,
    amount: price,
  })
  tx.add(...deposit.getInstructions())
  const buy = await metaplex2.auctionHouse().builders().buy({
    auctionHouse: ah,
    listing: listing,
  })
  tx.add(...buy.getInstructions())
  const sig = await connection.sendTransaction(tx, [wallet, wallet2], {skipPreflight: false})
  console.log(sig)
  */
  }
  catch (e) {
    console.log(e)
    res.json({error: e})
  }
  
})
app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
