

## Origem da validação de saldo

A regra vem da **função SQL `depositar_caixinha`** no Supabase (migration `20251015230822`). Linhas 26-32:

1. Busca `profiles.saldo` do usuário
2. Se `saldo < valor`, lança exceção: "Saldo insuficiente..."

Além de validar, a função também **debita o saldo** do perfil (`profiles.saldo -= valor`), ou seja, depositar na caixinha funciona como uma transferência do saldo geral para a caixinha.

## Plano

Criar uma nova migration que recria a função `depositar_caixinha` **sem** a verificação de saldo e **sem** debitar `profiles.saldo`. O depósito passará a apenas incrementar `valor_atual` da caixinha:

**Nova migration SQL:**
- Remove o `SELECT saldo FROM profiles`
- Remove o `IF _saldo_atual < _valor` 
- Remove o `UPDATE profiles SET saldo = saldo - _valor`
- Retorna apenas `novo_valor_caixinha`

A função `retirar_caixinha` também atualiza `profiles.saldo` (credita de volta). Será necessário decidir se mantemos essa lógica simétrica ou não.

### Impacto no frontend
- `useSupabaseCaixinhas` busca e exibe `saldoGeral` do perfil. Se o saldo deixar de ser relevante, o card "Saldo Disponível" na página Caixinhas pode ser removido ou repensado.

