import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { SubscriptionInfo } from "@/components/profile/SubscriptionInfo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useLocalAuth";
import { toast } from "@/hooks/use-toast";
import { Camera, User, Trash2, Settings, CreditCard, Shield } from "lucide-react";
import { validateWhatsAppNumber } from "@/utils/whatsapp";
import { useNavigate } from "react-router-dom";

interface Profile {
  nome: string;
  phone: string;
  whatsapp?: string;
  avatar_url?: string;
  email?: string;
}

export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    nome: "",
    phone: "",
    email: "",
  });
  const [currentCountryCode, setCurrentCountryCode] = useState("+55");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      // Tabela: profile, colunas: user_id (FK auth.users), nome, phone
      const { data, error } = await supabase.from("profile").select("nome, phone").eq("user_id", user.id).single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows, tratamos abaixo como fallback
        throw error;
      }

      const found = data ?? null;

      const fallbackNome = user?.email?.split("@")[0] || "";
      const fallbackPhone = user?.phone || "";

      setProfile({
        nome: found?.nome ?? fallbackNome,
        phone: found?.phone ?? fallbackPhone,
        email: user?.email || "",
        whatsapp: undefined,
        avatar_url: undefined,
      });

      // Se o phone vier do banco no formato E.164 (+551199...), aproveite
      // e ajuste os estados do PhoneInput
      const phoneFromDb = found?.phone ?? fallbackPhone ?? "";
      const onlyDigits = phoneFromDb.replace(/\D/g, "");
      const hasPlus = phoneFromDb.startsWith("+");

      // Heurística simples p/ BR: se já vier com +, não mexe no DDI; senão, mantém +55 default
      setCurrentCountryCode(hasPlus ? phoneFromDb.slice(0, 3) : "+55");
      setCurrentPhoneNumber(hasPlus ? phoneFromDb.slice(3) : onlyDigits);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Only combine if we have both country code and phone number
      let fullPhone = "";
      let whatsappId = profile.whatsapp;

      if (currentPhoneNumber.trim()) {
        fullPhone = currentCountryCode + currentPhoneNumber.replace(/\D/g, "");

        // Se o telefone mudou, validar o WhatsApp
        if (fullPhone !== profile.phone) {
          console.log("Validando WhatsApp para número alterado:", fullPhone);

          try {
            const whatsappValidation = await validateWhatsAppNumber(fullPhone.replace("+", ""));

            if (!whatsappValidation.exists) {
              toast({
                title: "Erro",
                description: "Este número não possui WhatsApp ativo",
                variant: "destructive",
              });
              setSaving(false);
              return;
            }

            whatsappId = whatsappValidation.whatsappId;
          } catch (error: any) {
            toast({
              title: "Erro na validação do WhatsApp",
              description: error.message,
              variant: "destructive",
            });
            setSaving(false);
            return;
          }
        }
      }

      console.log("Saving profile with phone:", fullPhone);
      console.log("Saving profile with whatsapp:", whatsappId);

      // Database tables don't exist yet
      toast({
        title: "Banco de dados indisponível",
        description: "Aguarde a recriação das tabelas para usar esta funcionalidade",
        variant: "destructive",
      });
      setSaving(false);
      return;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você deve selecionar uma imagem para fazer upload.");
      }

      const file = event.target.files[0];

      // Simulate upload and set a placeholder avatar
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, use a data URL as placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfile((prev) => ({ ...prev, avatar_url: e.target!.result as string }));
          toast({ title: "Avatar atualizado com sucesso!" });
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhoneChange = (phone: string) => {
    console.log("Phone changed to:", phone);
    setCurrentPhoneNumber(phone);
  };

  const handleCountryChange = (country_code: string) => {
    console.log("Country code changed to:", country_code);
    setCurrentCountryCode(country_code);
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user?.email) {
      toast({
        title: "Erro",
        description: "O email de confirmação não confere",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);

    try {
      // Database tables don't exist yet
      toast({
        title: "Banco de dados indisponível",
        description: "Aguarde a recriação das tabelas para usar esta funcionalidade",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Erro completo ao remover conta:", error);
      toast({
        title: "Erro ao remover conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmEmail("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais, assinatura e configurações de segurança
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {profile.nome ? getInitials(profile.nome) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    disabled={uploading}
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{profile.nome || "Sem nome"}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                  {profile.whatsapp && <p className="text-sm text-green-600 mt-1">WhatsApp: {profile.whatsapp}</p>}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={profile.nome}
                      onChange={(e) => setProfile((prev) => ({ ...prev, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <PhoneInput
                      id="phone"
                      value={currentPhoneNumber}
                      countryCode={currentCountryCode}
                      onValueChange={handlePhoneChange}
                      onCountryChange={handleCountryChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full md:w-auto">
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionInfo />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ChangePasswordForm />

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A remoção da conta é permanente e não pode ser desfeita. Todos os seus dados, incluindo transações e
                  lembretes, serão permanentemente apagados.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Conta Permanentemente
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Remoção de Conta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é irreversível. Todos os seus dados serão permanentemente apagados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirm-email">
                          Digite seu email para confirmar: <span className="font-semibold">{user?.email}</span>
                        </Label>
                        <Input
                          id="confirm-email"
                          type="email"
                          placeholder="Confirme seu email"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmEmail("")}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting || confirmEmail !== user?.email}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Removendo..." : "Remover Conta"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
