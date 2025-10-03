import { createRouter, createWebHistory } from 'vue-router'
import EventList from '../views/EventList.vue'
import TicketSelection from '../views/TicketSelection.vue'
import PersonalData from '../views/PersonalData.vue'
import Confirmation from '../views/Confirmation.vue'

const routes = [
  {
    path: '/',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/tickets/:eventId',
    name: 'TicketSelection',
    component: TicketSelection,
    props: true
  },
  {
    path: '/personal-data',
    name: 'PersonalData',
    component: PersonalData
  },
  {
    path: '/confirmation',
    name: 'Confirmation',
    component: Confirmation
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router