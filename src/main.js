const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            currentStep: 1,
            processing: false,
            selectedEvent: null,
            selectedTicket: null,
            ticketQuantity: 1,
            ticketCode: '',
            serviceCharge: 5.00,
            ticketCounter: 0, // Contador secuencial global
            personalData: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                document: ''
            },
            paymentData: {
                cardNumber: '',
                cardName: '',
                expiry: '',
                cvv: ''
            },
            events: [
                {
                    id: 1,
                    name: 'Concierto Rock en Vivo',
                    description: 'Una noche increíble con las mejores bandas de rock nacional e internacional.',
                    date: '15 de Noviembre, 2025',
                    location: 'Estadio Nacional',
                    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
                    minPrice: 50,
                    tickets: [
                        {
                            id: 1,
                            name: 'Entrada General',
                            description: 'Acceso a la zona general del estadio',
                            price: 50,
                            available: 500
                        },
                        {
                            id: 2,
                            name: 'Entrada VIP',
                            description: 'Acceso preferencial con bebida incluida',
                            price: 120,
                            available: 100
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Festival de Comida Gourmet',
                    description: 'Disfruta de los mejores platos de chefs reconocidos internacionalmente.',
                    date: '22 de Noviembre, 2025',
                    location: 'Centro de Convenciones',
                    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
                    minPrice: 30,
                    tickets: [
                        {
                            id: 3,
                            name: 'Entrada Básica',
                            description: 'Acceso al festival sin degustaciones',
                            price: 30,
                            available: 300
                        },
                        {
                            id: 4,
                            name: 'Entrada Premium',
                            description: 'Acceso completo con degustaciones incluidas',
                            price: 75,
                            available: 150
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Conferencia de Tecnología',
                    description: 'Los líderes tecnológicos más importantes compartirán sus conocimientos.',
                    date: '5 de Diciembre, 2025',
                    location: 'Auditorio Universitario',
                    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
                    minPrice: 25,
                    tickets: [
                        {
                            id: 5,
                            name: 'Entrada Estudiante',
                            description: 'Acceso con descuento para estudiantes',
                            price: 25,
                            available: 200
                        },
                        {
                            id: 6,
                            name: 'Entrada Profesional',
                            description: 'Acceso completo con material adicional',
                            price: 60,
                            available: 100
                        }
                    ]
                }
            ]
        }
    },
    computed: {
        totalAmount() {
            if (!this.selectedTicket || !this.ticketQuantity) return 0;
            return (this.selectedTicket.price * this.ticketQuantity) + this.serviceCharge;
        },
        subtotal() {
            if (!this.selectedTicket || !this.ticketQuantity) return 0;
            return this.selectedTicket.price * this.ticketQuantity;
        },
        progressWidth() {
            return (this.currentStep - 1) * 33.33;
        }
    },
    methods: {
        selectEvent(event) {
            this.selectedEvent = event;
            this.currentStep = 2;
        },
        selectTicket(ticket) {
            this.selectedTicket = ticket;
            this.ticketQuantity = 1; // Resetear cantidad al cambiar de ticket
        },
        increaseQuantity() {
            if (this.selectedTicket && this.ticketQuantity < this.selectedTicket.available) {
                this.ticketQuantity++;
            }
        },
        decreaseQuantity() {
            if (this.ticketQuantity > 1) {
                this.ticketQuantity--;
            }
        },
        proceedToPersonalData() {
            if (this.selectedTicket) {
                this.currentStep = 3;
            }
        },
        async processPayment() {
            this.processing = true;
            
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generar código de entrada único con formato específico
            this.ticketCode = this.generateTicketCode();
            
            this.processing = false;
            this.currentStep = 4;
            
            // Generar QR después de que la vista se haya renderizado con múltiples intentos
            this.$nextTick(() => {
                console.log('Processing payment completed, generating QR...');
                
                // Primer intento inmediato
                this.generateQR();
                
                // Segundo intento después de 500ms
                setTimeout(() => {
                    this.generateQR();
                }, 500);
                
                // Tercer intento después de 1s
                setTimeout(() => {
                    this.generateQR();
                }, 1000);
            });
        },
        generateTicketCode() {
            // Formato: PREFIJO-IDEVENTO-DIA/MES-ALEATORIO-SECUENCIAL
            // Ejemplo: TKT-EV01-0312-F7J9-001
            
            const prefijo = 'TKT';
            const idEvento = 'EV' + String(this.selectedEvent.id).padStart(2, '0');
            
            // Obtener día y mes actual
            const now = new Date();
            const dia = String(now.getDate()).padStart(2, '0');
            const mes = String(now.getMonth() + 1).padStart(2, '0');
            const fecha = dia + mes;
            
            // Generar código aleatorio de 4 caracteres alfanuméricos
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let aleatorio = '';
            for (let i = 0; i < 4; i++) {
                aleatorio += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            // Incrementar contador secuencial
            this.ticketCounter++;
            const secuencial = String(this.ticketCounter).padStart(3, '0');
            
            return `${prefijo}-${idEvento}-${fecha}-${aleatorio}-${secuencial}`;
        },
        generateQR() {
            // Verificar que QRCode esté disponible
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded');
                return;
            }

            // Usar setTimeout para asegurar que los elementos estén en el DOM
            setTimeout(() => {
                console.log('Generando código QR de entrada...');
                console.log('Código de entrada:', this.ticketCode);
                
                // Generar QR solo con el código de entrada
                const ticketCodeDiv = document.getElementById('qrTicketCode');
                if (ticketCodeDiv) {
                    try {
                        console.log('Generando QR del código de entrada...');
                        // Limpiar contenido anterior
                        ticketCodeDiv.innerHTML = '';
                        
                        // Generar QR usando la librería QRCode
                        new QRCode(ticketCodeDiv, {
                            text: this.ticketCode,
                            width: 200,
                            height: 200,
                            colorDark: '#000000',
                            colorLight: '#ffffff',
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        console.log('✅ Código QR generado exitosamente');
                    } catch (error) {
                        console.error('❌ Error generando código QR:', error);
                    }
                } else {
                    console.error('❌ Div qrTicketCode no encontrado en el DOM');
                }
            }, 300);
        },
        goBack() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },
        getStepClass(step) {
            if (step < this.currentStep) return 'completed';
            if (step === this.currentStep) return 'active';
            return 'inactive';
        },
        downloadTicket() {
            // Simular descarga de entrada
            alert('Descargando entrada... (Funcionalidad de ejemplo)');
        },
        startOver() {
            // Reiniciar el proceso
            this.currentStep = 1;
            this.selectedEvent = null;
            this.selectedTicket = null;
            this.ticketQuantity = 1;
            this.personalData = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                document: ''
            };
            this.paymentData = {
                cardNumber: '',
                cardName: '',
                expiry: '',
                cvv: ''
            };
            this.ticketCode = '';
            // Nota: ticketCounter se mantiene para seguir la secuencia
        },
        // Método alternativo para generar QR en caso de problemas
        retryGenerateQR() {
            console.log('Retrying QR generation...');
            this.generateQR();
        }
    },
    mounted() {
        // Verificar que QRCode esté disponible
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library not loaded. Make sure the QRCode script is included.');
        } else {
            console.log('QRCode library loaded successfully');
        }

        // Formatear número de tarjeta mientras se escribe
        this.$watch('paymentData.cardNumber', (newVal) => {
            let formatted = newVal.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formatted !== newVal) {
                this.paymentData.cardNumber = formatted;
            }
        });
        
        // Formatear fecha de vencimiento
        this.$watch('paymentData.expiry', (newVal) => {
            let formatted = newVal.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formatted !== newVal) {
                this.paymentData.expiry = formatted;
            }
        });

        // Watcher para generar QR cuando se complete el proceso
        this.$watch('currentStep', (newStep) => {
            if (newStep === 4 && this.ticketCode) {
                setTimeout(() => {
                    this.generateQR();
                }, 200);
            }
        });
    }
});

// Montar la aplicación
app.mount('#app');