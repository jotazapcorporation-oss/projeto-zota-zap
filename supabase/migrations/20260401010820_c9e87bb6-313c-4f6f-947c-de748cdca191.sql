CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_external_api boolean NOT NULL DEFAULT false,
  external_api_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read settings"
  ON public.admin_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

INSERT INTO public.admin_settings (use_external_api, external_api_url)
VALUES (false, null);