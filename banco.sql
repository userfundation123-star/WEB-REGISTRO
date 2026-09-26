-- ============================================
-- Execute no Supabase: SQL Editor > New query > Run
-- Pode ser executado mais de uma vez sem dar erro.
-- ============================================

-- 1. Criar a tabela
CREATE TABLE IF NOT EXISTS public.veiculos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  placa VARCHAR(8) NOT NULL UNIQUE,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  ano INTEGER NOT NULL CHECK (ano BETWEEN 1900 AND 2100),
  cor VARCHAR(30),
  tipo VARCHAR(20) NOT NULL DEFAULT 'Carro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Permissões da API para o usuário público (anon)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.veiculos TO anon, authenticated;

-- 3. Ativar a segurança por linha (RLS)
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- 4. Policies de ACESSO PÚBLICO
DROP POLICY IF EXISTS "Acesso publico - leitura"   ON public.veiculos;
DROP POLICY IF EXISTS "Acesso publico - inserir"   ON public.veiculos;
DROP POLICY IF EXISTS "Acesso publico - atualizar" ON public.veiculos;
DROP POLICY IF EXISTS "Acesso publico - excluir"   ON public.veiculos;

CREATE POLICY "Acesso publico - leitura"
  ON public.veiculos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Acesso publico - inserir"
  ON public.veiculos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Acesso publico - atualizar"
  ON public.veiculos FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso publico - excluir"
  ON public.veiculos FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. (Opcional) Dados de teste
INSERT INTO public.veiculos (placa, marca, modelo, ano, cor, tipo) VALUES
  ('ABC1D23', 'Fiat', 'Uno', 2015, 'Prata', 'Carro'),
  ('XYZ9K87', 'Honda', 'CG 160', 2022, 'Vermelha', 'Moto')
ON CONFLICT (placa) DO NOTHING;
