import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { toast } from "sonner";

export default function Configuracoes() {
  const { settings, updateSettings } = useAdminSettings();
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [externalApiUrl, setExternalApiUrl] = useState("");

  useEffect(() => {
    if (settings.data) {
      setUseExternalApi(settings.data.use_external_api);
      setExternalApiUrl(settings.data.external_api_url || "");
    }
  }, [settings.data]);

  const handleSave = () => {
    if (useExternalApi && !externalApiUrl.trim()) {
      toast.error("Informe a URL da API externa");
      return;
    }

    if (useExternalApi) {
      try {
        new URL(externalApiUrl);
      } catch {
        toast.error("URL inválida. Informe uma URL válida (ex: https://api.exemplo.com)");
        return;
      }
    }

    updateSettings.mutate({
      use_external_api: useExternalApi,
      external_api_url: useExternalApi ? externalApiUrl.trim() : null,
    });
  };

  if (settings.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integração de API
          </CardTitle>
          <CardDescription>
            Configure se o sistema deve usar os webhooks internos (n8n) ou uma API externa para criação de usuários e dependentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="use-external-api" className="text-base font-medium">
                Usar API externa
              </Label>
              <p className="text-sm text-muted-foreground">
                {useExternalApi
                  ? "O sistema usará a API externa configurada abaixo"
                  : "O sistema está usando os webhooks internos (n8n)"}
              </p>
            </div>
            <Switch
              id="use-external-api"
              checked={useExternalApi}
              onCheckedChange={setUseExternalApi}
            />
          </div>

          {useExternalApi && (
            <div className="space-y-2">
              <Label htmlFor="external-api-url">URL base da API externa</Label>
              <Input
                id="external-api-url"
                type="url"
                placeholder="https://api.exemplo.com"
                value={externalApiUrl}
                onChange={(e) => setExternalApiUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Rotas utilizadas: <code className="bg-muted px-1 rounded">/admin</code> (criação de usuário) e{" "}
                <code className="bg-muted px-1 rounded">/dependente</code> (criação/exclusão de dependente).
                A autenticação será feita via Bearer token do Supabase.
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="w-full sm:w-auto"
          >
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
