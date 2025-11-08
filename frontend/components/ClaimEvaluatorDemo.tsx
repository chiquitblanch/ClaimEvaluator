"use client";

// ClaimEvaluatorDemo component for demonstrating FHEVM-based claim evaluation
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useClaimEvaluator } from "@/hooks/useClaimEvaluator";
import { useState } from "react";

export const ClaimEvaluatorDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const claimEvaluator = useClaimEvaluator({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [lossAmount, setLossAmount] = useState<string>("0.01");
  const [riskLevel, setRiskLevel] = useState<string>("1");

  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black " +
    "transition-all duration-200 hover:bg-yellow-400 active:bg-yellow-600 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black " +
    "disabled:opacity-40 disabled:cursor-not-allowed shadow-lg";

  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-bold text-white " +
    "transition-all duration-200 hover:bg-green-500 active:bg-green-700 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black " +
    "disabled:opacity-40 disabled:cursor-not-allowed shadow-lg";

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-yellow-500">⚡ Claim Evaluator</h1>
            <p className="text-xl text-gray-400">Private Insurance Claim Processing</p>
          </div>
          <div className="card-bg p-8 rounded-xl space-y-4">
            <p className="text-gray-300 text-lg">Connect your wallet to get started</p>
            <button
              className={primaryButtonClass + " text-xl px-8 py-4"}
              disabled={isConnected}
              onClick={connect}
            >
              🦊 Connect MetaMask
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (claimEvaluator.isDeployed === false) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full card-bg p-8 rounded-xl border-2 border-yellow-500">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold text-yellow-500">
                Contract Not Deployed
              </h2>
              <p className="text-gray-300 text-lg">
                The ClaimEvaluator contract is not available on the current network (Chain ID: {chainId})
              </p>
              <div className="card-bg p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 font-mono">
                  npm run deploy:localhost
                </p>
              </div>
              <p className="text-sm text-gray-400">
                Please deploy the contract first and then refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="card-bg rounded-2xl p-8 border-2 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-500 mb-2">
              ⚡ Claim Evaluator
            </h1>
            <p className="text-gray-400 text-lg">
              Private Insurance Claim Processing with FHE
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
              Connected
            </div>
          </div>
        </div>
      </div>

      {/* Network & Contract Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-bg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">🌐 Network Information</h2>
          <InfoRow label="Chain ID" value={chainId} />
          <InfoRow 
            label="Wallet Address" 
            value={ethersSigner ? formatAddress(ethersSigner.address) : "Not connected"} 
            mono 
          />
        </div>

        <div className="card-bg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">📜 Contract Status</h2>
          <InfoRow 
            label="Contract Address" 
            value={formatAddress(claimEvaluator.contractAddress || "")} 
            mono 
          />
          <InfoRow 
            label="Deployment Status" 
            value={claimEvaluator.isDeployed} 
          />
        </div>
      </div>

      {/* FHEVM Status */}
      <div className="card-bg rounded-xl p-6">
        <h2 className="text-xl font-bold text-green-500 mb-4">🔐 FHEVM Encryption Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoRow 
            label="Instance" 
            value={fhevmInstance ? "Initialized" : "Not available"} 
          />
          <InfoRow label="Status" value={fhevmStatus} />
          <InfoRow 
            label="Error" 
            value={fhevmError ?? "No errors"} 
            type={fhevmError ? "error" : "success"}
          />
        </div>
      </div>

      {/* Submit Claim Form */}
      <div className="card-bg rounded-xl p-6 border-2 border-green-600">
        <h2 className="text-2xl font-bold text-green-500 mb-6">📝 Submit New Claim</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-gray-300 font-bold text-lg">
              💰 Loss Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              className="w-full bg-black border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:border-yellow-500 focus:outline-none transition-colors"
              value={lossAmount}
              onChange={(e) => setLossAmount(e.target.value)}
              disabled={!claimEvaluator.canSubmitClaim}
              placeholder="0.01"
            />
            <p className="text-sm text-gray-500">Maximum: 4.29 ETH</p>
          </div>
          <div className="space-y-2">
            <label className="block text-gray-300 font-bold text-lg">
              ⚠️ Risk Level
            </label>
            <select
              className="w-full bg-black border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:border-yellow-500 focus:outline-none transition-colors"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              disabled={!claimEvaluator.canSubmitClaim}
            >
              <option value="1">1 - Low Risk</option>
              <option value="2">2 - Medium Risk</option>
              <option value="3">3 - High Risk</option>
            </select>
            <p className="text-sm text-gray-500">Select the risk assessment level</p>
          </div>
        </div>
        <button
          className={primaryButtonClass + " w-full text-lg"}
          disabled={!claimEvaluator.canSubmitClaim}
          onClick={() => {
            const lossEth = parseFloat(lossAmount);
            const risk = parseInt(riskLevel, 10);
            if (!isNaN(lossEth) && !isNaN(risk) && lossEth >= 0) {
              try {
                const lossGwei = Math.floor(lossEth * 1e9);
                if (lossGwei > 4294967295) {
                  return;
                }
                claimEvaluator.submitClaim(lossGwei, risk);
              } catch (e) {
                console.error("Failed to parse loss amount:", e);
              }
            }
          }}
        >
          {claimEvaluator.canSubmitClaim
            ? "🚀 Submit Claim"
            : claimEvaluator.isSubmitting
              ? "⏳ Submitting..."
              : "❌ Cannot Submit"}
        </button>
      </div>

      {/* Claim Processing Section */}
      {claimEvaluator.currentClaimId !== undefined && (
        <>
          <div className="card-bg rounded-xl p-6 border-2 border-yellow-500">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6">🔒 Encrypted Claim Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Claim ID" value={claimEvaluator.currentClaimId} highlight />
              <InfoRow 
                label="Loss Amount Handle" 
                value={claimEvaluator.lossAmountHandle ?? "Not loaded"} 
                mono 
              />
              <InfoRow 
                label="Risk Level Handle" 
                value={claimEvaluator.riskLevelHandle ?? "Not loaded"} 
                mono 
              />
              <InfoRow 
                label="Payout Handle" 
                value={claimEvaluator.payoutHandle ?? "Not loaded"} 
                mono 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              className={secondaryButtonClass + " text-lg"}
              disabled={!claimEvaluator.canEvaluateClaim}
              onClick={claimEvaluator.evaluateClaim}
            >
              {claimEvaluator.canEvaluateClaim
                ? "⚙️ Evaluate Claim"
                : claimEvaluator.isEvaluating
                  ? "⏳ Evaluating..."
                  : "❌ Cannot Evaluate"}
            </button>
            <button
              className={secondaryButtonClass + " text-lg"}
              disabled={!claimEvaluator.canRefresh}
              onClick={claimEvaluator.refreshClaimData}
            >
              {claimEvaluator.canRefresh
                ? "🔄 Refresh Data"
                : "❌ Cannot Refresh"}
            </button>
          </div>

          <div className="card-bg rounded-xl p-6 border-2 border-green-600">
            <h2 className="text-2xl font-bold text-green-500 mb-6">🔓 Decrypt Payout</h2>
            <div className="space-y-4 mb-6">
              <InfoRow 
                label="Payout Handle" 
                value={claimEvaluator.payoutHandle ?? "Waiting for evaluation"} 
                mono 
              />
              {claimEvaluator.clearPayout !== undefined && (
                <div className="bg-green-900 border-2 border-green-500 rounded-lg p-6">
                  <p className="text-sm text-green-300 mb-2">Decrypted Payout Amount</p>
                  <p className="text-4xl font-bold text-green-400">
                    {(Number(claimEvaluator.clearPayout) / 1e9).toFixed(9)} ETH
                  </p>
                  <p className="text-sm text-green-300 mt-2">
                    ({String(claimEvaluator.clearPayout)} gwei)
                  </p>
                </div>
              )}
            </div>
            <button
              className={primaryButtonClass + " w-full text-lg"}
              disabled={!claimEvaluator.canDecryptPayout}
              onClick={claimEvaluator.decryptPayout}
            >
              {claimEvaluator.canDecryptPayout
                ? "🔓 Decrypt Payout"
                : claimEvaluator.isDecrypting
                  ? "⏳ Decrypting..."
                  : claimEvaluator.clearPayout !== undefined
                    ? "✅ Already Decrypted"
                    : "❌ Nothing to Decrypt"}
            </button>
          </div>
        </>
      )}

      {/* Message Display */}
      {claimEvaluator.message && (
        <div className="card-bg rounded-xl p-6 border-2 border-yellow-500">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-500 mb-2">System Message</h3>
              <p className="text-gray-300">{claimEvaluator.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format addresses
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Info Row component for displaying key-value pairs
function InfoRow({ 
  label, 
  value, 
  mono = false, 
  highlight = false,
  type = "default"
}: { 
  label: string; 
  value: unknown; 
  mono?: boolean;
  highlight?: boolean;
  type?: "default" | "success" | "error";
}) {
  let displayValue: string;
  let isBoolean = false;
  let boolValue = false;

  if (typeof value === "boolean") {
    isBoolean = true;
    boolValue = value;
    displayValue = value ? "true" : "false";
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }

  const getValueColor = () => {
    if (isBoolean) {
      return boolValue ? "text-green-400" : "text-red-400";
    }
    if (type === "success") return "text-green-400";
    if (type === "error") return "text-red-400";
    if (highlight) return "text-yellow-400";
    return "text-gray-300";
  };

  const getValueBg = () => {
    if (isBoolean) {
      return boolValue ? "bg-green-900" : "bg-red-900";
    }
    return "bg-black";
  };

  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-gray-400 font-semibold">{label}</span>
      <span 
        className={`
          ${getValueColor()} 
          ${mono ? "font-mono text-xs" : "font-semibold"} 
          ${getValueBg()}
          px-3 py-2 rounded-lg border border-gray-700
          break-all
        `}
      >
        {displayValue}
      </span>
    </div>
  );
}

