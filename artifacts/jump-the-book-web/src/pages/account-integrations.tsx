import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useConnectHardcover,
  useDisconnectHardcover,
  useHardcoverIntegration,
  useImportHardcover,
} from "@/hooks/useApiLibrary";
import { useState } from "react";

export default function AccountIntegrations() {
  const { toast } = useToast();
  const status = useHardcoverIntegration();
  const connect = useConnectHardcover();
  const disconnect = useDisconnectHardcover();
  const importShelf = useImportHardcover();
  const [token, setToken] = useState("");
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const onConnect = async () => {
    try {
      const result = await connect.mutateAsync(token);
      setPreviewCount(result.previewCount);
      toast({ title: "Hardcover connected" });
    } catch (err) {
      toast({
        title: "Couldn't connect Hardcover",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onImport = async () => {
    try {
      const result = await importShelf.mutateAsync();
      toast({
        title: "Shelf imported",
        description: `${result.imported + result.updated} books synced.`,
      });
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-semibold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Connect other reading tools and import your shelf.
          </p>
        </div>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-semibold">Hardcover</h2>
              <p className="text-sm text-muted-foreground">
                Paste your Hardcover API token to preview and import your library.
              </p>
            </div>
            {!status.data?.connected && (
              <div className="space-y-3">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Hardcover API token"
                />
                <Button onClick={onConnect} disabled={connect.isPending || !token.trim()}>
                  Connect
                </Button>
              </div>
            )}
            {status.data?.connected && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={onImport} disabled={importShelf.isPending}>
                  Import shelf
                </Button>
                <Button
                  variant="outline"
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                >
                  Disconnect
                </Button>
              </div>
            )}
            {previewCount !== null && (
              <p className="text-sm text-muted-foreground">
                Preview: {previewCount} books available to import.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
