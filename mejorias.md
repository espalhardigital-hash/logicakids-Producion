
Por favor, genera el código completo, paso a paso, listo para ser implementado directamente en mi proyecto.


  🔵 Fase 3: Segurança e Fluxo de Autenticação (Melhoria de UX)
  Objetivo: Padronizar o acesso e completar funcionalidades pendentes.

   1. Unificação de Storage no Frontend:
       * Padronizar o uso de localStorage.getItem('auth_token'). Remover as verificações 
         redundantes de token e sessionStorage para evitar estados de login
         inconsistentes.
   2. Implementação de Recuperação de Senha:
       * Desenvolver o endpoint POST /auth/reset-password no backend.
       * Conectar o botão "Esqueci minha senha" no frontend (que atualmente é apenas um  
         TODO).
   3. Middleware de Segurança:
       * Ativar o ENABLE_SECURITY_HEADERS em produção para garantir que cabeçalhos como  
         X-Content-Type-Options e HSTS estejam sempre ativos.