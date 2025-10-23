import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInput } from '@/components/ui/phone-input';
import { useAdminActions, type UserData } from '@/hooks/useAdminActions';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15, 'Telefone inválido'),
  admin: z.boolean().default(false),
});

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  const { createUser } = useAdminActions();
  const [countryCode, setCountryCode] = useState('55');

  const form = useForm<UserData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      phone: '',
      admin: false,
    },
  });

  const onSubmit = async (values: UserData) => {
    try {
      // Garantir que o número seja enviado com o código do país
      const phoneWithCountryCode = values.phone.startsWith('+') 
        ? values.phone 
        : `+${countryCode}${values.phone}`;
      
      await createUser.mutateAsync({
        ...values,
        phone: phoneWithCountryCode,
      });
      form.reset();
      setCountryCode('55');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo usuário. Um email de convite será enviado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      countryCode={countryCode}
                      onValueChange={field.onChange}
                      onCountryChange={setCountryCode}
                      placeholder="11 99999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Administrador
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Usuário terá acesso total ao sistema
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createUser.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Criar Usuário
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
