const SUPABASE_URL = "https://hqqbhczikqqgglugeknf.supabase.co";

export const getAvatarUrl = (arquivo: string | null | undefined): string | undefined => {
  if (!arquivo) return undefined;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${arquivo}`;
};

export const validateImageFile = (file: File) => {
  // Validar tipo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, JPEG ou PNG.');
  }

  // Validar tamanho (3MB)
  const maxSize = 3 * 1024 * 1024; // 3MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 3MB');
  }

  return true;
};

export const validateImageDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > 400 || img.height > 400) {
        reject(new Error('Dimensões muito grandes. Máximo: 400x400px'));
      }
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Erro ao carregar imagem'));
    };
    img.src = URL.createObjectURL(file);
  });
};
