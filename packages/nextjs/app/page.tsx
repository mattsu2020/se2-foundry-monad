"use client";

import Link from "next/link";
import React from 'react';
import { parseEther } from 'viem'
import type { NextPage } from "next";
import Image from "next/image"
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi } from '../contract-abi';

const contractConfig = {
  address: '0x9b8a9202e6B5423e220C1e4CD6194d6372693bCA',
  abi,
} as const;

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [totalMinted, setTotalMinted] = React.useState(0n);
  const [max_supply, setMaxSupply] = React.useState(0n);
  const [mintlist, setMintlist] = React.useState(false);
  const { isConnected } = useAccount();
  const chain_id = 20143;
  const {
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useWriteContract();

  const { data: totalSupplyData } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
    chainId: chain_id,
  });

  const { data: mintlistData } = useReadContract(
    {
      ...contractConfig,
      functionName: 'mintlist',
      args: [connectedAddress ?? ""],
      chainId: chain_id,
    });

  const { data: maxSupplyData } = useReadContract({
    ...contractConfig,
    functionName: 'MAX_SUPPLY',
    chainId: chain_id,
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData);
    }
  }, [totalSupplyData]);

  React.useEffect(() => {
    if (mintlistData && connectedAddress != undefined) {
      setMintlist(mintlistData);
    }
  }, [mintlistData]);

  React.useEffect(() => {
    if (maxSupplyData) {
      setMaxSupply(maxSupplyData);
    }
  }, [maxSupplyData]);

  const isMinted = txSuccess;
  const {
    isPending,
    writeContract
  } = useWriteContract();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Purple Cat NFT site</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p style={{ margin: '12px 0 24px' }}>
              minted NFT {Number(totalMinted)} / {Number(max_supply)}
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p style={{ margin: '12px 0 24px' }}>
              NFT price is 0.001 DMON
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}
          </div>
          {mounted && isConnected && !isMinted && (
            <div className="flex justify-center items-center  flex-col ">
              <div className="flex relative ">
                <Image alt="Purple Cat Image" className="" src="/purple_cat.jpeg"
                  height={300}
                  width={300}
                />
              </div>
              <button
                style={{ marginTop: 24, color: 'white', backgroundColor: 'black' }}
                disabled={!mint || isMintLoading || isMintStarted}
                className="button cursor-pointer"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={() =>
                  writeContract({
                    address: contractConfig.address,
                    abi,
                    functionName: 'mintNFTs',
                    args: [
                      BigInt(1)
                    ],
                    value: parseEther('0.001'),
                    chainId: chain_id,
                  })
                }
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Minting...'}
                {!isMintLoading && !isMintStarted && !mintlist && 'Mint'}
              </button>
              {mintlist && 'minted'}
            </div>
          )}
        </div>
      </div >
    </>
  );
};

export default Home;
