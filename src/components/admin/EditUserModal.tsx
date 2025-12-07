import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminActions } from '@/hooks/useAdminActions';
import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  admin: z.boolean().default(false)
});
type FormValues = z.infer<typeof formSchema>;
interface User {
  id: string;
  nome: string | null;
  email: string | null;
  phone: string | null;
  admin: boolean | null;
}
interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extrair código de país do telefone completo
const extractCountryCode = (fullPhone: string | null): {
  countryCode: string;
  localNumber: string;
} => {
  if (!fullPhone) return {
    countryCode: '55',
    localNumber: ''
  };
  const cleaned = fullPhone.replace(/\D/g, '');

  // Códigos de país comuns (ordenados do mais longo para o mais curto)
  const countryCodes = ['351', '55', '54', '56', '57', '58', '52', '51', '34', '33', '49', '44', '39', '1'];
  for (const code of countryCodes) {
    if (cleaned.startsWith(code)) {
      return {
        countryCode: code,
        localNumber: cleaned.slice(code.length)
      };
    }
  }
  return {
    countryCode: '55',
    localNumber: cleaned
  };
};
export const EditUserModal = ({
  user,
  open,
  onOpenChange
}: EditUserModalProps) => {
  const {
    updateUser
  } = useAdminActions();
  const [countryCode, setCountryCode] = useState('55');
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      phone: '',
      admin: false
    }
  });
  useEffect(() => {
    if (user) {
      const {
        countryCode: extractedCode,
        localNumber
      } = extractCountryCode(user.phone);
      setCountryCode(extractedCode);
      form.reset({
        nome: user.nome || '',
        email: user.email || '',
        phone: localNumber,
        admin: user.admin || false
      });
    }
  }, [user, form]);
  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    // Concatenar código do país com número local (sem "+")
    const fullPhone = values.phone ? `${countryCode}${values.phone.replace(/\D/g, '')}` : '';
    try {
      await updateUser.mutateAsync({
        id: user.id,
        updates: {
          ...values,
          phone: fullPhone
        }
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  if (!user) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados do usuário.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nome" render={({
            field
          }) => <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="phone" render={({
            field
          }) => <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <PhoneInput value={field.value || ''} countryCode={countryCode} onValueChange={field.onChange} onCountryChange={setCountryCode} placeholder="(11) 9999-9999" />
                  </FormControl>
                  <p className="text-xs mt-1 text-destructive">
                    O dígito 9 é adicionado automaticamente à frente do número.
                  </p>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="admin" render={({
            field
          }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Administrador
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Usuário terá acesso total ao sistema
                    </p>
                  </div>
                </FormItem>} />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateUser.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};