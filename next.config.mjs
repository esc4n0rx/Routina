/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.streamhivex.icu'], // Permite carregar imagens do domínio da API
  },
  // Configurações adicionais para exportação da aplicação
  output: 'standalone',
  // Habilitar análise de bundle para otimização
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'routina.vercel.app',
        // Adicione aqui outros domínios permitidos
      ],
    },
  },
  // Redirecionamentos
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: true,
      },
      {
        source: '/registro',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;