import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getAvatarUrl } from '@/utils/avatar';

export interface CardComment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    nome: string;
    avatar_url?: string;
    arquivo?: string;
  };
}

export interface CardAttachment {
  id: string;
  card_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CardMember {
  id: string;
  card_id: string;
  user_id: string;
  assigned_at: string;
  assigned_by: string;
  user?: {
    nome: string;
    avatar_url?: string;
    arquivo?: string;
  };
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: any;
  created_at: string;
}

export const useCardEnhancements = (cardId: string | null) => {
  const [comments, setComments] = useState<CardComment[]>([]);
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [members, setMembers] = useState<CardMember[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    if (!cardId) return;
    
    const { data, error } = await supabase
      .from('card_comments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else if (data) {
      // Buscar dados dos usuários
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, nome, arquivo')
        .in('id', userIds);

      // Mapear comentários com dados dos usuários
      const commentsWithAvatars = data.map(comment => {
        const user = usersData?.find(u => u.id === comment.user_id);
        return {
          ...comment,
          user: user ? {
            nome: user.nome || 'Usuário',
            avatar_url: getAvatarUrl(user.arquivo),
            arquivo: user.arquivo
          } : undefined
        };
      });
      setComments(commentsWithAvatars);
    }
  };

  // Add comment
  const addComment = async (content: string) => {
    if (!cardId || !content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('card_comments')
      .insert({
        card_id: cardId,
        user_id: user.id,
        content: content.trim(),
      });

    if (error) {
      toast({ title: 'Erro ao adicionar comentário', variant: 'destructive' });
    } else {
      toast({ title: 'Comentário adicionado' });
      fetchComments();
      logActivity('comment_added', 'card', cardId, { content });
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('card_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({ title: 'Erro ao excluir comentário', variant: 'destructive' });
    } else {
      toast({ title: 'Comentário excluído' });
      fetchComments();
    }
  };

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!cardId) return;
    
    const { data, error } = await supabase
      .from('card_attachments')
      .select('*')
      .eq('card_id', cardId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
    } else {
      setAttachments(data || []);
    }
  };

  // Add attachment
  const addAttachment = async (fileUrl: string, fileName: string, fileType?: string, fileSize?: number) => {
    if (!cardId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('card_attachments')
      .insert({
        card_id: cardId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: user.id,
      });

    if (error) {
      toast({ title: 'Erro ao adicionar anexo', variant: 'destructive' });
    } else {
      toast({ title: 'Anexo adicionado' });
      fetchAttachments();
      logActivity('attachment_added', 'card', cardId, { fileName });
    }
  };

  // Delete attachment
  const deleteAttachment = async (attachmentId: string) => {
    const { error } = await supabase
      .from('card_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      toast({ title: 'Erro ao excluir anexo', variant: 'destructive' });
    } else {
      toast({ title: 'Anexo excluído' });
      fetchAttachments();
    }
  };

  // Fetch members
  const fetchMembers = async () => {
    if (!cardId) return;
    
    const { data, error } = await supabase
      .from('card_members')
      .select('*')
      .eq('card_id', cardId);

    if (error) {
      console.error('Error fetching members:', error);
    } else if (data) {
      // Buscar dados dos usuários
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, nome, arquivo')
        .in('id', userIds);

      // Mapear membros com dados dos usuários
      const membersWithAvatars = data.map(member => {
        const user = usersData?.find(u => u.id === member.user_id);
        return {
          ...member,
          user: user ? {
            nome: user.nome || 'Usuário',
            avatar_url: getAvatarUrl(user.arquivo),
            arquivo: user.arquivo
          } : undefined
        };
      });
      setMembers(membersWithAvatars);
    }
  };

  // Assign member
  const assignMember = async (userId: string) => {
    if (!cardId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('card_members')
      .insert({
        card_id: cardId,
        user_id: userId,
        assigned_by: user.id,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Membro já atribuído', variant: 'destructive' });
      } else {
        toast({ title: 'Erro ao atribuir membro', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Membro atribuído' });
      fetchMembers();
      logActivity('member_assigned', 'card', cardId, { userId });
    }
  };

  // Remove member
  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('card_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({ title: 'Erro ao remover membro', variant: 'destructive' });
    } else {
      toast({ title: 'Membro removido' });
      fetchMembers();
    }
  };

  // Log activity
  const logActivity = async (action: string, targetType: string, targetId: string, details?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      });
  };

  // Fetch activities
  const fetchActivities = async () => {
    if (!cardId) return;
    
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('target_id', cardId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities(data || []);
    }
  };

  useEffect(() => {
    if (cardId) {
      setLoading(true);
      Promise.all([
        fetchComments(),
        fetchAttachments(),
        fetchMembers(),
        fetchActivities(),
      ]).finally(() => setLoading(false));
    }
  }, [cardId]);

  return {
    comments,
    attachments,
    members,
    activities,
    loading,
    addComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    assignMember,
    removeMember,
    logActivity,
    fetchComments,
    fetchAttachments,
    fetchMembers,
    fetchActivities,
  };
};
