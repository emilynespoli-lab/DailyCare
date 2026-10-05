# Meu cuidado

Site pessoal de cuidado com histórico. Arquivos: `index.html` (o site) e `sync.js` (nuvem, opcional). Sem build.

Os registros sempre ficam salvos no navegador. Para guardá-los na nuvem e usar em
vários aparelhos, ative a sincronização com o Supabase (passo 2).

## 1. Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `meu-cuidado`).
2. Envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/meu-cuidado.git
   git push -u origin main
   ```
   Sem terminal: **Add file > Upload files**.
3. **Settings > Pages**: *Deploy from a branch*, branch `main`, pasta `/ (root)`, salvar.
4. O site abre em `https://SEU-USUARIO.github.io/meu-cuidado/`.

## 2. Salvar na nuvem (Supabase, plano gratuito)

1. Crie um projeto em https://supabase.com.
2. **SQL Editor**: cole e rode o conteúdo de `supabase-setup.sql`.
3. **Authentication > URL Configuration**: em *Site URL* e em *Redirect URLs*, coloque
   `https://SEU-USUARIO.github.io/meu-cuidado/`.
4. **Project Settings > API**: copie a *Project URL* e a chave pública (*anon* ou *publishable*).
5. No `sync.js`, preencha no topo do arquivo:
   ```js
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-publica';
   ```
6. Faça commit e push. Aguarde o Pages atualizar.
7. No site, aba **Ajustes**: informe seu e-mail, toque em *Enviar link* e abra o link recebido.

A chave pública pode ficar no código: quem protege seus dados é a regra de acesso
(RLS) do `supabase-setup.sql`, que só deixa cada pessoa ler e gravar o próprio registro.
Nunca coloque a chave `service_role` no site.

## Como a sincronização funciona

- Cada alteração é salva no aparelho na hora e enviada à nuvem 1,5 s depois.
- Ao entrar em outro aparelho, os dados são mesclados: para cada dia vale o registro mais recente.
- Sem internet, o site continua funcionando e sincroniza quando você voltar a salvar algo.
