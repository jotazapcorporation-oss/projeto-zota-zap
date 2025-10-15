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
import { DependentesTab } from "@/components/profile/DependentesTab";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

import { useAuth } from "@/hooks/useLocalAuth";
import { toast } from "@/hooks/use-toast";
import { Camera, User, Trash2, Settings, CreditCard, Shield, Users } from "lucide-react";
import { validateWhatsAppNumber } from "@/utils/whatsapp";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar dados do perfil no Supabase
      // @ts-ignore - Avoiding circular type reference in Supabase types
      const profileResponse = await supabase
        .from("profiles")
        .select("nome, phone, email, avatar_url, whatsapp")
        .eq("id", user.id)
        .maybeSingle();

      if (profileResponse.error && profileResponse.error.code !== "PGRST116") {
        throw profileResponse.error;
      }

      const profileData = profileResponse.data;

      // Se encontrou dados, usar do banco; caso contrário, usar fallbacks
      const nome = profileData?.nome || user?.email?.split("@")[0] || "";
      const phone = profileData?.phone || user?.phone || "";
      const email = profileData?.email || user?.email || "";
      const avatar_url = profileData?.avatar_url;
      const whatsapp = profileData?.whatsapp;

      setProfile({
        nome,
        phone,
        email,
        avatar_url,
        whatsapp,
      });

      // Processar telefone para separar DDI e número
      if (phone) {
        let cleanPhone = phone.replace(/\D/g, ""); // Remove tudo que não é dígito
        
        // Se começar com 55, remover (DDI do Brasil)
        if (cleanPhone.startsWith("55")) {
          cleanPhone = cleanPhone.substring(2);
        }
        
        setCurrentCountryCode("+55");
        setCurrentPhoneNumber(cleanPhone);
      } else {
        setCurrentCountryCode("+55");
        setCurrentPhoneNumber("");
      }
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
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header com Avatar */}
      <div className="flex items-center gap-6 pb-6 border-b">
        <Avatar className="h-24 w-24 ring-4 ring-primary/20">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {getInitials(profile.nome || user?.email || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais, assinatura e configurações de segurança
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="dependentes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Dependentes
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileEditor
                profile={profile}
                onProfileUpdate={setProfile}
                currentCountryCode={currentCountryCode}
                currentPhoneNumber={currentPhoneNumber}
                onCountryChange={handleCountryChange}
                onPhoneChange={handlePhoneChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionInfo />
        </TabsContent>

        <TabsContent value="dependentes">
          <DependentesTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mudar foto e nome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileEditor
                profile={profile}
                onProfileUpdate={setProfile}
                currentCountryCode={currentCountryCode}
                currentPhoneNumber={currentPhoneNumber}
                onCountryChange={handleCountryChange}
                onPhoneChange={handlePhoneChange}
              />
            </CardContent>
          </Card>

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
