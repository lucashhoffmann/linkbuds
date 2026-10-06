export const routes = {
  initial: '/',
  login: '/login',
  register: '/register',
  home: '/home',
  team: '/team',
  settings: '/settings',
  invite: (token = ':token') => `/invite/${token}`,
  publicLinkPage: (slug = ':slug') => `/p/${slug}`,
  publicPostPage: '/p/:slug/:postSlug',
  linkPages: {
    list: '/link-pages',
    new: '/link-pages/new',
    edit: (id = ':id') => `/link-pages/${id}/edit`,
  },
  errors: {
    broken: '/error/broken',
    notFound: '/error/not-found',
    internal: '/error/internal',
  },
};
