import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Sem autorização');
    }

    // Create Supabase client with user token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Create admin client for auth operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.admin) {
      throw new Error('Apenas administradores podem excluir usuários');
    }

    // Get userId to delete
    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error('Você não pode excluir a si mesmo');
    }

    console.log(`Admin ${user.id} iniciando exclusão do usuário ${userId}`);

    // Delete in correct order to respect foreign keys
    // 1. Card attachments
    const { error: attachmentsError } = await supabaseAdmin
      .from('card_attachments')
      .delete()
      .eq('uploaded_by', userId);
    if (attachmentsError) console.error('Erro ao deletar attachments:', attachmentsError);

    // 2. Card comments
    const { error: commentsError } = await supabaseAdmin
      .from('card_comments')
      .delete()
      .eq('user_id', userId);
    if (commentsError) console.error('Erro ao deletar comments:', commentsError);

    // 3. Card members
    const { error: membersError } = await supabaseAdmin
      .from('card_members')
      .delete()
      .eq('user_id', userId);
    if (membersError) console.error('Erro ao deletar members:', membersError);

    // 4. Get user's boards to delete related cards and lists
    const { data: userBoards } = await supabaseAdmin
      .from('boards')
      .select('id')
      .eq('user_id', userId);

    if (userBoards && userBoards.length > 0) {
      const boardIds = userBoards.map(b => b.id);

      // Get lists from these boards
      const { data: userLists } = await supabaseAdmin
        .from('Trello')
        .select('id')
        .in('board_id', boardIds);

      if (userLists && userLists.length > 0) {
        const listIds = userLists.map(l => l.id);

        // Delete cards from these lists
        const { error: cardsError } = await supabaseAdmin
          .from('cards')
          .delete()
          .in('lista_id', listIds);
        if (cardsError) console.error('Erro ao deletar cards:', cardsError);
      }

      // Delete lists
      const { error: listsError } = await supabaseAdmin
        .from('Trello')
        .delete()
        .in('board_id', boardIds);
      if (listsError) console.error('Erro ao deletar listas:', listsError);
    }

    // 5. Delete boards
    const { error: boardsError } = await supabaseAdmin
      .from('boards')
      .delete()
      .eq('user_id', userId);
    if (boardsError) console.error('Erro ao deletar boards:', boardsError);

    // 6. Activity log
    const { error: activityError } = await supabaseAdmin
      .from('activity_log')
      .delete()
      .eq('user_id', userId);
    if (activityError) console.error('Erro ao deletar activity_log:', activityError);

    // 7. Caixinhas poupanca
    const { error: caixinhasError } = await supabaseAdmin
      .from('caixinhas_poupanca')
      .delete()
      .eq('user_id', userId);
    if (caixinhasError) console.error('Erro ao deletar caixinhas:', caixinhasError);

    // 8. Tarefas
    const { error: tarefasError } = await supabaseAdmin
      .from('tarefas')
      .delete()
      .eq('user_id', userId);
    if (tarefasError) console.error('Erro ao deletar tarefas:', tarefasError);

    // 9. Lembretes
    const { error: lembretesError } = await supabaseAdmin
      .from('lembretes')
      .delete()
      .eq('userid', userId);
    if (lembretesError) console.error('Erro ao deletar lembretes:', lembretesError);

    // 10. Transacoes
    const { error: transacoesError } = await supabaseAdmin
      .from('transacoes')
      .delete()
      .eq('userid', userId);
    if (transacoesError) console.error('Erro ao deletar transações:', transacoesError);

    // 11. Categorias
    const { error: categoriasError } = await supabaseAdmin
      .from('categorias')
      .delete()
      .eq('userid', userId);
    if (categoriasError) console.error('Erro ao deletar categorias:', categoriasError);

    // 12. Agenda eventos
    const { error: eventosError } = await supabaseAdmin
      .from('agenda_eventos')
      .delete()
      .eq('id', userId);
    if (eventosError) console.error('Erro ao deletar eventos:', eventosError);

    // 13. Family plan (if master)
    const { error: familyError } = await supabaseAdmin
      .from('family_plan')
      .delete()
      .eq('master_id', userId);
    if (familyError) console.error('Erro ao deletar family_plan:', familyError);

    // 14. Users table
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    if (usersError) console.error('Erro ao deletar users:', usersError);

    // 15. Profiles
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profilesError) {
      throw new Error(`Erro ao deletar profile: ${profilesError.message}`);
    }

    // 16. Delete from auth.users using Admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Erro ao deletar do auth:', authError);
      throw new Error(`Erro ao deletar usuário do sistema de autenticação: ${authError.message}`);
    }

    console.log(`Usuário ${userId} excluído completamente com sucesso`);

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário excluído completamente' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
