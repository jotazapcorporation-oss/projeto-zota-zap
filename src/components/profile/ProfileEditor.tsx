import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneInput } from "@/components/ui/phone-input";
import { Camera, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { validateWhatsAppNumber } from "@/utils/whatsapp";
import { validateImageFile, validateImageDimensions } from "@/utils/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useLocalAuth";

interface ProfileEditorProps {
  profile: {
    nome: string;
    phone: string;
    email?: string;
    avatar_url?: string;
    whatsapp?: string;
    arquivo?: string;
  };
  onProfileUpdate: (profile: any) => void;
  currentCountryCode: string;
  currentPhoneNumber: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
}

export function ProfileEditor({
  profile,
  onProfileUpdate,
  currentCountryCode,
  currentPhoneNumber,
  onCountryChange,
  onPhoneChange,
}: ProfileEditorProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validações
      validateImageFile(file);
      await validateImageDimensions(file);

      // Criar preview local
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setSelectedFile(file);

      toast({ 
        title: "Imagem selecionada", 
        description: "Clique em 'Salvar Alterações' para confirmar." 
      });
    } catch (error: any) {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      let fullPhone = "";
      let whatsappId = localProfile.whatsapp;

      if (currentPhoneNumber.trim()) {
        fullPhone = currentCountryCode + currentPhoneNumber.replace(/\D/g, "");

        if (fullPhone !== profile.phone) {
          try {
            const whatsappValidation = await validateWhatsAppNumber(fullPhone);

            if (!whatsappValidation.exists) {
              toast({
                title: "Aviso",
                description: "Este número não possui WhatsApp ativo. Salvando mesmo assim.",
              });
            } else {
              whatsappId = whatsappValidation.whatsappId;
            }
          } catch (error: any) {
            toast({
              title: "Aviso",
              description: "Não foi possível validar o WhatsApp. Salvando mesmo assim.",
            });
          }
        }
      }

      let arquivoPath = profile.arquivo;

      // Se existe arquivo selecionado, fazer upload
      if (selectedFile) {
        // Deletar arquivo antigo se existir
        if (profile.arquivo) {
          await supabase.storage.from('avatars').remove([profile.arquivo]);
        }

        // Upload novo arquivo
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        arquivoPath = fileName;
      }

      // Atualizar profile no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nome: localProfile.nome,
          phone: fullPhone,
          whatsapp: whatsappId,
          arquivo: arquivoPath,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Atualizar profile local
      const updatedProfile = {
        ...localProfile,
        phone: fullPhone,
        whatsapp: whatsappId,
        arquivo: arquivoPath,
      };
      
      onProfileUpdate(updatedProfile);

      toast({ title: "Perfil atualizado com sucesso!" });

      // Limpar preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewUrl || localProfile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {localProfile.nome ? getInitials(localProfile.nome) : <User className="h-8 w-8" />}
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
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/jpeg,image/jpg,image/png" 
            onChange={handleFileSelect} 
            className="hidden" 
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{localProfile.nome || "Sem nome"}</h3>
          <p className="text-muted-foreground">{localProfile.email}</p>
          {localProfile.phone && <p className="text-sm text-green-600 mt-1">WhatsApp: {localProfile.phone}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={localProfile.nome}
              onChange={(e) => setLocalProfile((prev) => ({ ...prev, nome: e.target.value }))}
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
              onValueChange={onPhoneChange}
              onCountryChange={onCountryChange}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full md:w-auto">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
}
