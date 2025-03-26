import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/context/CompanyContext";
import useSecuritze from "@/hooks/useSecuritze";
import { useWallet } from "@txnlab/use-wallet-react";
import { useSession } from "next-auth/react";
import React, { useMemo } from "react";

function LinkWalletCard() {
  const { state } = useCompanyContext();
  const { selectedCompany } = state;
  const { data: session } = useSession();
  const { linkShareholderWallet } = useSecuritze();
  const { activeAddress } = useWallet();

  const userRecord = useMemo(() => {
    if (!selectedCompany?.companyUsers || !session?.user?.email) return null;
    return selectedCompany.companyUsers.find((userObj) => userObj.user.email === session?.user?.email);
  }, [selectedCompany, session]);

  const walletAddress = userRecord?.walletAddress;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Your Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="flex flex-col gap-y-4">
            <p>You have already linked your wallet address to this company.</p>
            <p className="font-semibold">
              Wallet Address: <span className="font-normal">{walletAddress}</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <p>Your wallet is not yet linked. Link your wallet to be able to claim your shares for this company.</p>
            <Button onClick={() => linkShareholderWallet(selectedCompany?.id as string, activeAddress as string)} variant="outline">
              Link Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinkWalletCard;
