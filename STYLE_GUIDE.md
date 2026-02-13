# Thea Sentinel - Guia de Estilo Visual

> Este documento define o padrao visual obrigatorio para todas as aplicacoes integradas ao ecossistema SignOn.
> Todas as novas aplicacoes devem seguir rigorosamente estas especificacoes para garantir consistencia visual.

---

## 1. Fundamentos

### 1.1 Fonte

- **Familia:** Inter (Google Fonts)
- **Pesos utilizados:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Fallback:** `system-ui, sans-serif`

```html
<!-- Adicionar no <head> do HTML -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* Tailwind config */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

### 1.2 Paleta de Cores

#### Cor Primaria (Orange)

| Token         | Hex       | Uso                                    |
|---------------|-----------|----------------------------------------|
| `primary-50`  | `#fff7ed` | Background hover sutil, badges         |
| `primary-100` | `#ffedd5` | Background de icones, destaques leves  |
| `primary-200` | `#fed7aa` | Bordas ativas                          |
| `primary-300` | `#fdba74` | Indicadores intermediarios             |
| `primary-400` | `#fb923c` | Icones secundarios                     |
| `primary-500` | `#f97316` | Focus ring, elementos interativos      |
| `primary-600` | `#ea580c` | **Cor principal** - botoes, links, avatar |
| `primary-700` | `#c2410c` | Hover de botoes, texto ativo           |
| `primary-800` | `#9a3412` | Backgrounds escuros com gradiente      |
| `primary-900` | `#7c2d12` | Tonalidade mais escura (raro)          |

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
}
```

#### Cores Neutras (Tailwind Gray padrao)

| Uso                    | Classe Tailwind    |
|------------------------|--------------------|
| Texto principal        | `text-gray-900`    |
| Texto secundario       | `text-gray-700`    |
| Texto auxiliar/caption | `text-gray-500`    |
| Texto desabilitado     | `text-gray-400`    |
| Bordas                 | `border-gray-200`  |
| Background pagina      | `bg-gray-50`       |
| Background hover       | `bg-gray-100`      |
| Skeleton/loading       | `bg-gray-200`      |

#### Cores Semanticas (Status)

| Status    | Background   | Texto         | Exemplo             |
|-----------|-------------|---------------|---------------------|
| Sucesso   | `bg-green-100` | `text-green-700` | Ativo, Concluido |
| Erro      | `bg-red-100`   | `text-red-700`   | Inativo, Erro    |
| Alerta    | `bg-yellow-100`| `text-yellow-700`| Pendente, Atencao|
| Info      | `bg-blue-100`  | `text-blue-700`  | Em andamento     |
| Neutro    | `bg-gray-100`  | `text-gray-700`  | Default, Rascunho|

---

## 2. Componentes

### 2.1 Botoes

#### Botao Primario
```html
<button class="inline-flex items-center justify-center gap-2 rounded-lg font-medium
  px-4 py-2 bg-primary-600 text-white hover:bg-primary-700
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
  Texto do Botao
</button>
```

#### Botao Secundario
```html
<button class="... bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500">
  Cancelar
</button>
```

#### Botao Outline
```html
<button class="... border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500">
  Acao Secundaria
</button>
```

#### Botao de Perigo
```html
<button class="... bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
  Excluir
</button>
```

#### Botao Ghost
```html
<button class="... text-gray-600 hover:bg-gray-100 focus:ring-gray-500">
  Fechar
</button>
```

**Tamanhos:**
| Tamanho | Classes                    |
|---------|----------------------------|
| Small   | `px-3 py-1.5 text-sm`      |
| Medium  | `px-4 py-2` (padrao)       |
| Large   | `px-6 py-3 text-lg`        |

**Regras:**
- Sempre usar `rounded-lg` (8px)
- Sempre incluir `transition-colors duration-200`
- Sempre incluir `focus:ring-2 focus:ring-offset-2`
- Estado loading: adicionar spinner + `disabled:opacity-50`

### 2.2 Inputs

```html
<div class="w-full">
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Nome do Campo
  </label>
  <input class="w-full px-4 py-2 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed" />
</div>
```

**Estado de erro:**
```html
<input class="... border-red-500 focus:ring-red-500" />
<p class="mt-1 text-sm text-red-500">Mensagem de erro</p>
```

**Regras:**
- Border radius: `rounded-lg`
- Focus ring: `focus:ring-primary-500`
- Erro: borda e ring vermelhos
- Label: `text-sm font-medium text-gray-700 mb-1`

### 2.3 Cards

```html
<div class="bg-white rounded-lg shadow-md p-6">
  <!-- Conteudo do card -->
</div>
```

**Variante com hover:**
```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
  <!-- Conteudo interativo -->
</div>
```

### 2.4 Tabelas

```html
<div class="bg-white rounded-lg shadow overflow-hidden">
  <table class="w-full">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Coluna</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 text-sm text-gray-700">Valor</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 2.5 Badges / Status

```html
<!-- Ativo (sucesso) -->
<span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
  Ativo
</span>

<!-- Inativo (erro) -->
<span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
  Inativo
</span>

<!-- Perfil (neutro) -->
<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
  Administrador
</span>
```

### 2.6 Modais

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 transition-opacity"></div>

<!-- Modal -->
<div class="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b">
    <h3 class="text-lg font-semibold text-gray-900">Titulo</h3>
    <button class="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
      <!-- Icone X -->
    </button>
  </div>
  <!-- Content -->
  <div class="p-4">
    <!-- Conteudo -->
  </div>
</div>
```

**Tamanhos de modal:**
| Tamanho | Classe        |
|---------|---------------|
| Small   | `max-w-md`    |
| Medium  | `max-w-lg`    |
| Large   | `max-w-2xl`   |
| XLarge  | `max-w-4xl`   |

### 2.7 Avatar Circular

```html
<div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
  J
</div>
```

- Tamanho padrao: `w-10 h-10` (40px)
- Sempre `rounded-full`
- Background: `bg-primary-600`
- Texto: primeira letra do nome, uppercase, branco

---

## 3. Layout

### 3.1 Sidebar

- Largura: `w-64` (256px)
- Background: `bg-white`
- Borda direita: `border-r border-gray-200`
- Logo: `font-bold text-2xl text-primary-600`
- Item ativo: `bg-primary-50 text-primary-700 font-medium`
- Item inativo: `text-gray-600 hover:bg-gray-100`
- Item padding: `px-4 py-3`
- Item border radius: `rounded-lg`

### 3.2 Header

- Background: `bg-white`
- Borda inferior: `border-b border-gray-200`
- Shadow: `shadow-sm`
- Altura: `h-16` (64px)
- Sticky: `sticky top-0 z-30`

### 3.3 Area de Conteudo

- Background da pagina: `bg-gray-50`
- Padding interno: `p-6`
- Titulo da pagina: `text-2xl font-bold text-gray-900`
- Subtitulo: `text-gray-600`

### 3.4 Tela de Login

```html
<div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800
  flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <!-- Logo branco -->
    <h1 class="text-4xl font-bold text-white">NomeDaApp</h1>
    <p class="text-primary-100">Descricao da aplicacao</p>

    <!-- Card de login -->
    <div class="bg-white rounded-2xl shadow-2xl p-8">
      <!-- Formulario -->
    </div>
  </div>
</div>
```

---

## 4. Tipografia

| Elemento          | Classes Tailwind                          |
|-------------------|-------------------------------------------|
| Titulo de pagina  | `text-2xl font-bold text-gray-900`        |
| Subtitulo         | `text-gray-600`                           |
| Titulo de card    | `text-lg font-semibold text-gray-900`     |
| Titulo de secao   | `text-sm font-semibold text-gray-700`     |
| Corpo             | `text-sm text-gray-700`                   |
| Caption / auxiliar| `text-xs text-gray-500`                   |
| Label de form     | `text-sm font-medium text-gray-700`       |
| Link              | `text-primary-600 hover:underline`        |
| Link com peso     | `text-primary-600 hover:underline font-medium` |

---

## 5. Espacamento

| Contexto                | Classe      | Valor  |
|-------------------------|-------------|--------|
| Gap entre secoes        | `space-y-6` | 24px   |
| Gap entre campos de form| `space-y-4` | 16px   |
| Padding de card         | `p-6`       | 24px   |
| Padding de formulario   | `p-8`       | 32px   |
| Padding de modal header | `p-4`       | 16px   |
| Gap entre icone e texto | `gap-2`     | 8px    |
| Gap em listas           | `gap-3`     | 12px   |
| Margin de label         | `mb-1`      | 4px    |

---

## 6. Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
```

---

## 7. Icones

- **Biblioteca:** Lucide React (`lucide-react`)
- **Tamanho padrao:** 20px para navegacao, 16px para acoes inline
- **Cor:** herda do texto (`currentColor`)

Icones mais utilizados:
| Acao          | Icone        |
|---------------|--------------|
| Dashboard     | `LayoutDashboard` |
| Usuarios      | `Users`      |
| Editar        | `Edit`       |
| Excluir       | `Trash2`     |
| Visualizar    | `Eye`        |
| Adicionar     | `Plus`       |
| Buscar        | `Search`     |
| Fechar        | `X`          |
| Menu          | `Menu`       |
| Sair          | `LogOut`     |
| Configuracoes | `Settings`   |
| Aplicacoes    | `AppWindow`  |
| Perfil        | `User`       |
| Loading       | `Loader2` (com `animate-spin`) |

---

## 8. Transicoes e Animacoes

| Contexto          | Classe                           |
|-------------------|----------------------------------|
| Cor de fundo/texto| `transition-colors duration-200` |
| Shadow            | `transition-shadow duration-200` |
| Geral             | `transition-all`                 |
| Loading spinner   | `animate-spin`                   |
| Skeleton          | `animate-pulse`                  |

---

## 9. Responsividade

| Breakpoint | Largura | Prefixo Tailwind |
|------------|---------|------------------|
| Mobile     | < 640px | (default)        |
| Tablet     | >= 640px| `sm:`            |
| Desktop    | >= 1024px| `lg:`           |

**Regras:**
- Sidebar escondida em mobile (`-translate-x-full`), visivel em `lg:`
- Layout flex-col em mobile, flex-row em `sm:`
- Logo simplificado no header em mobile

---

## 10. Padroes de Formulario

### Botoes de acao

```html
<div class="flex gap-3 justify-end pt-4">
  <Button variant="secondary">Cancelar</Button>
  <Button type="submit">Salvar</Button>
</div>
```

### Validacao

- Campo obrigatorio: asterisco vermelho ao lado do label
- Mensagem de erro: `text-sm text-red-500` abaixo do input
- Borda do input em erro: `border-red-500`
- Focus ring em erro: `focus:ring-red-500`

### Toast (notificacoes)

- **Biblioteca:** `react-hot-toast`
- Sucesso: `toast.success('Mensagem de sucesso!')`
- Erro: `toast.error('Mensagem de erro')`

---

## 11. CSS Utilitario (global.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
  }
  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  .btn-outline {
    @apply btn border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500;
  }
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
  }
  .input-error {
    @apply border-red-500 focus:ring-red-500 focus:border-red-500;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  .card-hover {
    @apply card hover:shadow-lg transition-shadow duration-200;
  }
}
```

---

## 12. Stack Tecnologico Padrao

| Camada     | Tecnologia                |
|------------|---------------------------|
| Framework  | React + TypeScript        |
| Build      | Vite                      |
| Estilo     | Tailwind CSS              |
| Icones     | Lucide React              |
| Formularios| React Hook Form           |
| Toasts     | React Hot Toast           |
| HTTP       | Axios                     |
| Roteamento | React Router DOM          |

---

## 13. Checklist de Conformidade

Antes de entregar uma nova aplicacao, verifique:

- [ ] Fonte Inter carregada via Google Fonts
- [ ] Paleta `primary` configurada como laranja no Tailwind
- [ ] Todos os elementos interativos usam `primary-*` (nao cores hardcoded)
- [ ] Scrollbar customizada aplicada
- [ ] Botoes seguem os padroes de variante (primary, secondary, danger, outline, ghost)
- [ ] Inputs com focus ring `primary-500`
- [ ] Validacao de erro com borda e texto vermelho
- [ ] Tabelas com header `bg-gray-50` e hover `hover:bg-gray-50`
- [ ] Avatares circulares com `bg-primary-600`
- [ ] Layout responsivo (sidebar colapsavel, flex-col em mobile)
- [ ] Transicoes suaves em todos os elementos interativos
- [ ] Toasts para feedback de acoes (sucesso/erro)
- [ ] Tela de login com gradiente `from-primary-600 to-primary-800`
