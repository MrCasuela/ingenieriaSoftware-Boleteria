import { createApp } from 'vue';
import './assets/styles.css';

const app = createApp({
    data() {
        return {
            message: 'Hola Vue con Vite!'
        }
    },
    template: `
        <div class="container mt-5">
            <h1 class="text-center text-primary">{{ message }}</h1>
            <p class="text-center">Si ves este mensaje, Vue está funcionando correctamente con Vite.</p>
        </div>
    `
});

app.mount('#app');