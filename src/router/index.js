import { createRouter, createWebHistory } from 'vue-router'

// Importação das views
import Dashboard from '../views/Dashboard.vue'
import TimeEntries from '../views/TimeEntries.vue'
import Projects from '../views/Projects.vue'
import Reports from '../views/Reports.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/time-entries',
    name: 'TimeEntries',
    component: TimeEntries
  },
  {
    path: '/time-entries/new',
    name: 'NewTimeEntry',
    component: TimeEntries,
    props: { openModal: true }
  },

  {
    path: '/projects',
    name: 'Projects',
    component: Projects
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active'
})

// Sem verificação de autenticação
router.beforeEach((to, from, next) => {
  next()
})

export default router