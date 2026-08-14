export const routes = {
  initial: '/',
  login: '/login',
  register: '/register',
  home: '/home',
  publicLinkPage: (slug = ':slug') => `/p/${slug}`,
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
