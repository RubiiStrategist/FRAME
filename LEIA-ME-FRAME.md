# FRAME — guia para colocar seus materiais

Esta é a cópia editável da versão entregue em 12/09/2026. Comece pelos contatos, depois substitua um projeto por vez. Guarde o ZIP original como backup.

## 1. Abrir o site no seu computador

1. Extraia o ZIP inteiro. Abra a pasta FRAME-final; não edite dentro do ZIP.
2. Você precisa de Node.js 22.13 ou superior e de um editor de texto/código. Não use Word para editar os arquivos.
3. Abra um terminal dentro da pasta que contém package.json.
4. Execute `npm ci` e aguarde a instalação. Requer internet. No PowerShell, se npm estiver bloqueado pela política de scripts, use `npm.cmd ci`.
5. Execute `npm run dev` (ou `npm.cmd run dev`).
6. Abra o endereço exibido no terminal, normalmente http://localhost:5173/.
7. Mantenha o terminal aberto. Ao salvar uma alteração, a prévia costuma atualizar automaticamente. Para encerrar, pressione Ctrl+C no terminal.

Este é um projeto React/TypeScript com Vinext, não um arquivo HTML que funciona com duplo clique. O ZIP contém código e mídias; as dependências são instaladas pelo npm ci. Não contém uma publicação online pronta.

## 2. Preencher contatos

Abra `data/config.ts`. Na primeira linha, preencha somente os valores entre aspas:

```ts
export const contact = {
  email: 'SEU_EMAIL_PROFISSIONAL',
  instagram: 'https://www.instagram.com/SEU_USUARIO/',
  whatsapp: 'https://wa.me/55DDDNUMERO'
};
```

Esses valores são exemplos para substituir, não contatos prontos. Em WhatsApp use 55 + DDD + número completo, somente dígitos: sem +, espaços, parênteses ou traços. Em Instagram use o endereço completo do perfil. Em email escreva apenas o endereço, sem mailto:.

Se não tiver um canal, mantenha `''` nele. Preserve a linha `export const services` que vem depois dos contatos.

Onde aparecem: Instagram e WhatsApp no encerramento; email no encerramento e nos projetos. Nos projetos, o email tem preferência sobre WhatsApp quando ambos estão preenchidos. O formulário prepara um resumo local; preencher contatos NÃO instala um serviço de envio automático. Com email configurado, o resumo oferece abrir o aplicativo de email. O usuário ainda precisa enviar a mensagem.

## 3. Colocar vídeos e capas nos projetos

1. Separe o vídeo e uma imagem de capa de cada trabalho.
2. Use nomes simples, sem espaços ou acentos: `evento-lancamento.mp4` e `evento-lancamento.jpg`.
3. Para marketing, copie os arquivos para `public/projects/marketing/`.
4. Para eventos e fotografia, copie para `public/projects/studio/`.
5. Abra `data/marketing.ts` ou `data/studio.ts` e encontre o projeto que quer substituir.
6. Atualize `thumbnail` para a capa e `video` para o filme. Se o projeto não tiver campo video, acrescente-o, separando os campos por vírgula.

Exemplo de um registro de evento (substitua os textos pelos seus):

```ts
{
  id: 'noite',
  title: 'Título do seu evento',
  client: 'Nome do cliente',
  year: '2026',
  category: 'EVENTOS / COBERTURA',
  services: ['Fotografia', 'Captação', 'Montagem'],
  thumbnail: '/projects/studio/evento-lancamento.jpg',
  video: '/projects/studio/evento-lancamento.mp4',
  description: 'Descreva o evento, o que a FRAME realizou e o que foi entregue.'
}
```

O caminho no código começa em `/projects/`, sem a palavra `public`. Não use caminhos como C:\Users\...: o visitante não terá acesso a eles. URLs de páginas do YouTube/Vimeo não funcionam nesse campo; ele espera um arquivo de vídeo acessível diretamente.

Para começar, substitua os registros existentes mantendo seus IDs e sua ordem. Algumas partes do site selecionam os projetos pela posição na lista; apagar ou reordenar registros exige ajustar essas referências em `components/FrameExperience.tsx`, `sections/SpatialHero.tsx` e conferir as galerias. Há cinco registros de marketing e três de Studio.

Sem filme? Remova o campo video ou mantenha sem ele: o projeto exibirá a capa. Nas galerias, os vídeos aparecem sem áudio; ao abrir o projeto, o player oferece controles. A preferência de movimento reduzido pode fazer a galeria mostrar apenas a capa.

Sugestão prática de exportação: MP4 com vídeo H.264 e áudio AAC. Para prévias, prefira um corte curto e comprimido; o mesmo campo video é usado na galeria e na página do projeto. Portanto, um filme muito pesado também pesa na navegação. A capa deve funcionar mesmo antes de o vídeo carregar.

## 4. Atualizar todos os textos do case

Trocar title e description não troca todos os textos internos. Confira também:

- `data/caseStories.ts`: títulos e capítulos detalhados dos projetos noite, noir e silencio. As chaves correspondem ao id do projeto.
- `components/ProjectDetails.tsx`: aviso de estudo demonstrativo, créditos das referências e legendas de comparação. Atualize apenas conforme a autoria e o trabalho reais.
- `components/FrameExperience.tsx`: etiquetas dos quatro destaques e observação sobre estudos conceituais.

A comparação atual usa dois recortes da mesma capa. Ela não é um antes/depois nem uma galeria de fotografias diferentes. Ao colocar seu trabalho, revise a legenda ou adapte esse bloco.

Não retire o aviso demonstrativo de trabalhos que continuarem usando referências. Se misturar trabalhos reais e estudos, personalize os avisos por projeto antes de publicar; o aviso atual em ProjectDetails é compartilhado por todos.

## 5. Trocar as imagens maiores e informações da empresa

As imagens da abertura, menu e serviços têm caminhos próprios; trocar somente a capa em data não altera todas elas.

| O que você quer mudar | Arquivo |
| --- | --- |
| Fotos e bordão da abertura | sections/SpatialHero.tsx |
| Fotos e textos dos cartões Marketing/Studio | components/ServiceUniverses.tsx |
| Foto do menu e localização | components/Header.tsx |
| Texto sobre a empresa, processo e foto final | sections/EditorialSections.tsx |
| Localização no rodapé | components/FrameExperience.tsx |
| Título e descrição para busca/compartilhamento | app/layout.tsx |
| Logo | public/brand/ e components/BrandLogo.tsx |
| Cores, tamanhos e layout | styles/cinema.css |

Procure o caminho da imagem, como `/projects/studio/event.jpg`, e substitua pelo seu. Outra opção é substituir a imagem na pasta mantendo exatamente o mesmo nome e formato; isso altera todos os lugares que usam aquele arquivo. O logo atual usa um recorte por CSS: uma imagem de proporção diferente pode exigir ajustar `.brand-image` em styles/cinema.css.

### Quero vídeo na tela de abertura

A abertura atual usa duas fotografias com movimento e transição. Não basta trocar `.jpg` por `.mp4` no endereço: o elemento atual é uma imagem. Os vídeos dos projetos já funcionam seguindo o passo 3. Para usar vídeo de fundo na abertura, é necessário adaptar `sections/SpatialHero.tsx` e os estilos de `.screen-images` para elementos video, com capa, reprodução sem áudio, pausa fora da tela e respeito à opção de reduzir movimento. Não faça uma simples troca de extensão nesse bloco.

## 6. Conferir antes de publicar

- Abra cada projeto; confira título, capa, vídeo, capítulos e créditos.
- Clique no WhatsApp, Instagram e email para verificar o destino. Não é necessário enviar uma mensagem de teste.
- Abra Menu e teste os caminhos Minha marca/Meu evento.
- Confira no celular e com a opção de pausar movimentos.
- Execute `npm run build`. Se houver erro, revise principalmente aspas, vírgulas e nomes de arquivo alterados.
- Para testar o resultado da compilação localmente, use `npm run start` e abra o endereço informado no terminal.

A publicação é uma etapa separada. Esta estrutura usa Vinext/Cloudflare Workers e mantém a configuração do Site existente. Não envie simplesmente a pasta para public_html de uma hospedagem estática. A publicação pela integração Sites estava bloqueada por proteção de escrita do repositório no ambiente original; isso não impede editar esta cópia extraída no seu computador.

## Se algo der errado

Imagem ou vídeo não abre: confira nome, extensão e letras maiúsculas/minúsculas. Abra no navegador o endereço local completo, por exemplo http://localhost:5173/projects/studio/evento-lancamento.mp4.

Tela de erro depois de editar: confira se deixou todas as aspas, vírgulas e colchetes. Volte ao arquivo correspondente do ZIP de backup, preservando sua cópia alterada para comparar.

Vídeo mostra só a capa: abra o projeto e tente reproduzir pelos controles; confira formato, endereço e a opção de movimento. O player usa a capa quando não consegue carregar o vídeo.

Contato não aparece: confira se o campo está preenchido e salvo. Os botões ficam no encerramento e dentro dos cases; o menu principal não lista todos os canais.

## Conteúdo do pacote

Código-fonte, configurações necessárias, arquivo de dependências fixadas, imagens, vídeos demonstrativos, logo e este guia. A pasta .openai contém apenas hosting.json, necessário à configuração atual. Foram excluídos credenciais, arquivos de ambiente, histórico Git, caches, dependências instaladas, compilações e arquivos temporários. Nenhuma senha ou token é necessária para abrir a prévia local.
