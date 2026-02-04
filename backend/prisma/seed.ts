import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('Iniciando seed...');

  // ============================================
  // SUPER ADMIN
  // ============================================
  const superAdminPassword = await hashPassword('Admin@123');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@signon.com' },
    update: {},
    create: {
      email: 'admin@signon.com',
      passwordHash: superAdminPassword,
      fullName: 'Administrador do Sistema',
      role: 'SUPER_ADMIN',
      phone: '(11) 99999-0000',
    },
  });

  console.log('Super Admin criado:', superAdmin.email);

  // ============================================
  // APLICACOES
  // ============================================
  const apps = [
    {
      name: 'Sistema Financeiro',
      description: 'Controle completo das financas da sua empresa',
      url: 'https://financeiro.signon.com',
      iconUrl: '/icons/financial.svg',
      apiKey: 'sk_financeiro_app_key_123456',
    },
    {
      name: 'Sistema de RH',
      description: 'Gestao de recursos humanos e folha de pagamento',
      url: 'https://rh.signon.com',
      iconUrl: '/icons/hr.svg',
      apiKey: 'sk_rh_app_key_123456',
    },
    {
      name: 'Sistema de Vendas',
      description: 'CRM e gestao de vendas integrado',
      url: 'https://vendas.signon.com',
      iconUrl: '/icons/sales.svg',
      apiKey: 'sk_vendas_app_key_123456',
    },
    {
      name: 'Sistema de Estoque',
      description: 'Controle de estoque e inventario',
      url: 'https://estoque.signon.com',
      iconUrl: '/icons/inventory.svg',
      apiKey: 'sk_estoque_app_key_123456',
    },
  ];

  for (const app of apps) {
    await prisma.application.upsert({
      where: { apiKey: app.apiKey },
      update: {},
      create: {
        ...app,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
  }

  console.log('Aplicacoes criadas:', apps.length);

  // ============================================
  // COMPANHIAS DE EXEMPLO
  // ============================================
  const company1 = await prisma.company.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      name: 'Empresa Exemplo LTDA',
      cnpj: '12345678000190',
      email: 'contato@empresaexemplo.com',
      phone: '(11) 3333-4444',
      address: 'Rua das Flores, 100 - Sao Paulo/SP',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { cnpj: '98765432000121' },
    update: {},
    create: {
      name: 'Tech Solutions SA',
      cnpj: '98765432000121',
      email: 'contato@techsolutions.com',
      phone: '(21) 2222-3333',
      address: 'Av. Tecnologia, 500 - Rio de Janeiro/RJ',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  console.log('Companhias criadas: 2');

  // ============================================
  // VINCULAR APLICACOES AS COMPANHIAS
  // ============================================
  const allApps = await prisma.application.findMany();

  // Company 1 - todas as aplicacoes
  for (const app of allApps) {
    await prisma.companyApplication.upsert({
      where: {
        companyId_applicationId: {
          companyId: company1.id,
          applicationId: app.id,
        },
      },
      update: {},
      create: {
        companyId: company1.id,
        applicationId: app.id,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
  }

  // Company 2 - apenas 2 aplicacoes
  for (const app of allApps.slice(0, 2)) {
    await prisma.companyApplication.upsert({
      where: {
        companyId_applicationId: {
          companyId: company2.id,
          applicationId: app.id,
        },
      },
      update: {},
      create: {
        companyId: company2.id,
        applicationId: app.id,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
  }

  console.log('Aplicacoes vinculadas as companhias');

  // ============================================
  // USUARIOS DAS COMPANHIAS
  // ============================================
  const companyAdminPassword = await hashPassword('Admin@123');
  const operatorPassword = await hashPassword('Operator@123');

  // Company 1 - Admin
  await prisma.user.upsert({
    where: { email: 'admin@empresaexemplo.com' },
    update: {},
    create: {
      email: 'admin@empresaexemplo.com',
      passwordHash: companyAdminPassword,
      fullName: 'Joao Silva',
      role: 'COMPANY_ADMIN',
      companyId: company1.id,
      phone: '(11) 99999-1111',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  // Company 1 - Operadores
  await prisma.user.upsert({
    where: { email: 'maria@empresaexemplo.com' },
    update: {},
    create: {
      email: 'maria@empresaexemplo.com',
      passwordHash: operatorPassword,
      fullName: 'Maria Santos',
      role: 'COMPANY_OPERATOR',
      companyId: company1.id,
      phone: '(11) 99999-2222',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'pedro@empresaexemplo.com' },
    update: {},
    create: {
      email: 'pedro@empresaexemplo.com',
      passwordHash: operatorPassword,
      fullName: 'Pedro Oliveira',
      role: 'COMPANY_OPERATOR',
      companyId: company1.id,
      phone: '(11) 99999-3333',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  // Company 2 - Admin
  await prisma.user.upsert({
    where: { email: 'admin@techsolutions.com' },
    update: {},
    create: {
      email: 'admin@techsolutions.com',
      passwordHash: companyAdminPassword,
      fullName: 'Carlos Tech',
      role: 'COMPANY_ADMIN',
      companyId: company2.id,
      phone: '(21) 99999-4444',
      createdBy: superAdmin.id,
      updatedBy: superAdmin.id,
    },
  });

  console.log('Usuarios das companhias criados');

  // ============================================
  // PRODUTOS
  // ============================================
  const products = [
    {
      name: 'Plano Starter',
      slug: 'plano-starter',
      shortDescription: 'Ideal para pequenas empresas',
      fullDescription: 'O plano Starter oferece todas as funcionalidades basicas para comecar a organizar sua empresa.',
      features: ['Ate 5 usuarios', 'Suporte por email', '1 aplicacao inclusa', 'Relatorios basicos'],
      priceMonthly: 99.90,
      priceYearly: 999.90,
      displayOrder: 1,
      isFeatured: false,
    },
    {
      name: 'Plano Professional',
      slug: 'plano-professional',
      shortDescription: 'Para empresas em crescimento',
      fullDescription: 'O plano Professional inclui recursos avancados e suporte prioritario.',
      features: ['Ate 20 usuarios', 'Suporte por chat e email', '3 aplicacoes inclusas', 'Relatorios avancados', 'API de integracao'],
      priceMonthly: 299.90,
      priceYearly: 2999.90,
      displayOrder: 2,
      isFeatured: true,
    },
    {
      name: 'Plano Enterprise',
      slug: 'plano-enterprise',
      shortDescription: 'Solucao completa para grandes empresas',
      fullDescription: 'O plano Enterprise oferece todos os recursos da plataforma com suporte dedicado.',
      features: ['Usuarios ilimitados', 'Suporte 24/7', 'Todas as aplicacoes', 'Relatorios personalizados', 'API de integracao', 'Gerente de conta dedicado'],
      priceMonthly: 999.90,
      priceYearly: 9999.90,
      displayOrder: 3,
      isFeatured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id,
      },
    });
  }

  console.log('Produtos criados:', products.length);

  // ============================================
  // FAQ
  // ============================================
  const faqs = [
    {
      question: 'Como funciona o periodo de teste?',
      answer: 'Oferecemos 14 dias gratuitos para voce testar nossa plataforma sem compromisso. Nao e necessario cartao de credito.',
      category: 'general',
      displayOrder: 1,
    },
    {
      question: 'Posso mudar de plano a qualquer momento?',
      answer: 'Sim! Voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor sera ajustado proporcionalmente.',
      category: 'pricing',
      displayOrder: 2,
    },
    {
      question: 'Como funciona o suporte tecnico?',
      answer: 'Oferecemos suporte por email para todos os planos. Planos Professional e Enterprise tem acesso a suporte por chat e telefone.',
      category: 'general',
      displayOrder: 3,
    },
    {
      question: 'Meus dados estao seguros?',
      answer: 'Utilizamos criptografia de ponta a ponta e backups automaticos diarios. Nossos servidores estao em data centers certificados.',
      category: 'security',
      displayOrder: 4,
    },
    {
      question: 'E possivel integrar com outros sistemas?',
      answer: 'Sim! Oferecemos API REST para integracao com qualquer sistema. Planos Professional e Enterprise tem acesso completo a API.',
      category: 'technical',
      displayOrder: 5,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });

    if (!existing) {
      await prisma.faq.create({
        data: {
          ...faq,
          createdBy: superAdmin.id,
          updatedBy: superAdmin.id,
        },
      });
    }
  }

  console.log('FAQs criados:', faqs.length);

  // ============================================
  // CONTEUDO DA LANDING PAGE
  // ============================================
  const landingContent = [
    {
      section: 'hero',
      title: 'Transforme a gestao do seu negocio',
      subtitle: 'Plataforma completa para gerenciar todas as areas da sua empresa em um so lugar',
      buttonText: 'Solicitar Demo',
      buttonLink: '#contato',
      displayOrder: 1,
    },
    {
      section: 'about',
      title: 'Sobre nos',
      content: 'Somos uma empresa especializada em solucoes de gestao empresarial, com mais de 10 anos de experiencia no mercado.',
      displayOrder: 1,
    },
    {
      section: 'features',
      title: 'Seguranca',
      content: 'Dados criptografados e backup automatico diario',
      displayOrder: 1,
    },
    {
      section: 'features',
      title: '100% Cloud',
      content: 'Acesse de qualquer lugar, a qualquer momento',
      displayOrder: 2,
    },
    {
      section: 'features',
      title: 'Suporte 24/7',
      content: 'Equipe sempre disponivel para ajudar',
      displayOrder: 3,
    },
    {
      section: 'features',
      title: 'Integracoes',
      content: 'Conecte com suas ferramentas favoritas',
      displayOrder: 4,
    },
  ];

  for (const content of landingContent) {
    const existing = await prisma.landingContent.findFirst({
      where: {
        section: content.section,
        displayOrder: content.displayOrder,
      },
    });

    if (!existing) {
      await prisma.landingContent.create({
        data: {
          ...content,
          createdBy: superAdmin.id,
          updatedBy: superAdmin.id,
        },
      });
    }
  }

  console.log('Conteudo da landing page criado');

  // ============================================
  // CONTATOS DE EXEMPLO
  // ============================================
  const contacts = [
    {
      fullName: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 98888-1111',
      companyName: 'Startup ABC',
      message: 'Gostaria de saber mais sobre o plano Professional para minha equipe de 15 pessoas.',
      interestedIn: 'demo',
      source: 'landing_page',
      status: 'pending' as const,
      priority: 'high' as const,
    },
    {
      fullName: 'Roberto Lima',
      email: 'roberto@empresa.com',
      phone: '(21) 97777-2222',
      companyName: 'Empresa XYZ',
      message: 'Preciso de uma demonstracao do sistema financeiro.',
      interestedIn: 'demo',
      source: 'landing_page',
      status: 'contacted' as const,
      priority: 'normal' as const,
      contactedAt: new Date(),
    },
    {
      fullName: 'Fernanda Souza',
      email: 'fernanda@techcorp.com',
      phone: '(31) 96666-3333',
      companyName: 'TechCorp',
      message: 'Interesse em parceria comercial para revenda.',
      interestedIn: 'partnership',
      source: 'landing_page',
      status: 'pending' as const,
      priority: 'urgent' as const,
    },
  ];

  for (const contact of contacts) {
    const existing = await prisma.contactRequest.findFirst({
      where: { email: contact.email },
    });

    if (!existing) {
      await prisma.contactRequest.create({
        data: contact,
      });
    }
  }

  console.log('Contatos de exemplo criados:', contacts.length);

  console.log('\n=== SEED CONCLUIDO ===');
  console.log('\nCredenciais de acesso:');
  console.log('------------------------');
  console.log('SUPER ADMIN:');
  console.log('  Email: admin@signon.com');
  console.log('  Senha: Admin@123');
  console.log('');
  console.log('COMPANY ADMIN (Empresa Exemplo):');
  console.log('  Email: admin@empresaexemplo.com');
  console.log('  Senha: Admin@123');
  console.log('');
  console.log('COMPANY OPERATOR (Empresa Exemplo):');
  console.log('  Email: maria@empresaexemplo.com');
  console.log('  Senha: Operator@123');
  console.log('');
  console.log('COMPANY ADMIN (Tech Solutions):');
  console.log('  Email: admin@techsolutions.com');
  console.log('  Senha: Admin@123');
  console.log('------------------------\n');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
